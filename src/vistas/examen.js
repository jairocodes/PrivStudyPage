// Modo examen: preguntas aleatorias de un área o un bloque con tiempo límite.
// Toma cuestionarios (opción múltiple) y, si se elige, ejercicios para resolver que el
// estudiante autoevalúa. Al terminar muestra el puntaje y lo que conviene repasar.
import { cargarCatalogo, cargarCurso } from '../datos.js';
import { leerJSON, guardarJSON } from '../progreso.js';
import { formulas } from '../katex.js';
import { esc, barra, barraHTML, LETRAS, NIVEL, tipoDe } from '../ui.js';

const CLAVE_HISTORIAL = 'privados-examenes';
const CLAVE_CONFIG = 'privados-examen-config';

function ambitos(cat) {
  const lista = [];
  for (const a of cat.areas) {
    if (!a.listos) continue;
    lista.push({ valor: `area:${a.id}`, etiqueta: `Toda el área: ${a.nombre}`, grupo: a.nombre, cursos: a.bloques.flatMap((b) => b.cursos).filter((c) => !c.pendiente) });
    for (const b of a.bloques) {
      const cursos = b.cursos.filter((c) => !c.pendiente);
      if (cursos.length) lista.push({ valor: `bloque:${a.id}:${b.id}`, etiqueta: b.semana ? `Bloque ${b.nombre}` : `${b.nombre} (${a.nombre})`, grupo: a.nombre, cursos });
    }
  }
  return lista;
}

function barajar(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default async function vistaExamen(app, _partes, q) {
  const cat = await cargarCatalogo();
  const opciones = ambitos(cat);
  document.title = 'Modo examen | Privados UMG';
  barra({ titulo: 'Modo examen' });

  let reloj = null;
  const detener = () => { clearInterval(reloj); reloj = null; };

  const guardada = leerJSON(CLAVE_CONFIG, {}) || {};
  const pedido = q.get('area') ? (q.get('bloque') ? `bloque:${q.get('area')}:${q.get('bloque')}` : `area:${q.get('area')}`) : null;
  const config = {
    ambito: opciones.some((o) => o.valor === pedido) ? pedido : opciones.some((o) => o.valor === guardada.ambito) ? guardada.ambito : opciones[0]?.valor,
    cantidad: guardada.cantidad || 20,
    minutos: guardada.minutos ?? 1.5,
    abiertas: guardada.abiertas ?? true,
  };

  // ---------- Configuración ----------
  function pantallaConfig() {
    detener();
    const grupos = [...new Set(opciones.map((o) => o.grupo))];
    const select = grupos.map((g) => `<optgroup label="${esc(g)}">${opciones.filter((o) => o.grupo === g).map((o) => `<option value="${o.valor}"${o.valor === config.ambito ? ' selected' : ''}>${esc(o.etiqueta)}</option>`).join('')}</optgroup>`).join('');
    const hist = (leerJSON(CLAVE_HISTORIAL, []) || []).slice(0, 8);
    app.innerHTML = `<main class="idx">
      <p class="migas ui"><a href="#/">Áreas</a></p>
      <section class="hero"><h1>Modo examen</h1>
        <p class="lead">Preguntas al azar de un área o de un bloque del seminario, con tiempo límite. Las de opción múltiple se califican solas; en las abiertas escribe tu respuesta en papel, compárala y di si la sabías.</p></section>
      <form class="form-examen ui" id="form-examen">
        <label>¿Qué quieres practicar?<select name="ambito">${select}</select></label>
        <label>Número de preguntas<select name="cantidad">${[10, 20, 30, 50].map((n) => `<option${n === config.cantidad ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
        <label>Tiempo por pregunta<select name="minutos">${[[1, '1 minuto'], [1.5, '1 minuto y medio'], [2, '2 minutos'], [3, '3 minutos'], [0, 'Sin límite']].map(([v, t]) => `<option value="${v}"${v === config.minutos ? ' selected' : ''}>${t}</option>`).join('')}</select></label>
        <label class="check"><input type="checkbox" name="abiertas"${config.abiertas ? ' checked' : ''}> Incluir ejercicios para resolver (autoevaluados)</label>
        <p class="ayuda" id="disponibles"></p>
        <p><button class="btn btn-primario" type="submit">Comenzar examen</button></p>
      </form>
      ${hist.length ? `<section class="bloque"><h2>Últimos intentos</h2><ul class="historial">${hist.map((h) => `<li>${new Date(h.fecha).toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' })} · ${esc(h.ambito)} · <b>${h.correctas}/${h.total}</b> (${Math.round((100 * h.correctas) / h.total)} %)</li>`).join('')}</ul></section>` : ''}
    </main>`;
    const form = app.querySelector('#form-examen');
    const disp = app.querySelector('#disponibles');
    const mostrarDisponibles = () => {
      const o = opciones.find((x) => x.valor === form.ambito.value);
      const quiz = o.cursos.reduce((s, c) => s + c.tipos.quiz, 0);
      const abiertas = o.cursos.reduce((s, c) => s + c.tipos.practica, 0);
      disp.textContent = `${o.cursos.length} curso(s): ${quiz} preguntas de opción múltiple y ${abiertas} ejercicios para resolver disponibles.`;
    };
    form.ambito.addEventListener('change', mostrarDisponibles);
    mostrarDisponibles();
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      config.ambito = form.ambito.value;
      config.cantidad = +form.cantidad.value;
      config.minutos = +form.minutos.value;
      config.abiertas = form.abiertas.checked;
      guardarJSON(CLAVE_CONFIG, config);
      comenzar();
    });
  }

  // ---------- Examen ----------
  async function comenzar() {
    const ambito = opciones.find((o) => o.valor === config.ambito);
    app.innerHTML = '<p class="cargando ui">Preparando preguntas…</p>';
    const cursos = await Promise.all(ambito.cursos.map((c) => cargarCurso(c.slug)));
    const banco = [];
    cursos.forEach((c) => c.temas.forEach((t, ti) => t.ejercicios.forEach((e) => {
      const tipo = tipoDe(e);
      if (tipo === 'quiz' || (tipo === 'practica' && config.abiertas)) banco.push({ e, tipo, slug: c.slug, curso: c.titulo, tema: `t${ti + 1}`, temaTitulo: t.titulo });
    })));
    if (!banco.length) {
      app.innerHTML = `<main class="idx"><section class="hero"><h1>Sin preguntas</h1><p class="lead">Este ámbito no tiene preguntas de opción múltiple. Activa “Incluir ejercicios para resolver” o elige otro bloque.</p><p><button class="btn btn-primario" type="button" id="volver">Cambiar configuración</button></p></section></main>`;
      app.querySelector('#volver').addEventListener('click', pantallaConfig);
      return;
    }
    const preguntas = barajar(banco).slice(0, config.cantidad).map((p) => ({ ...p, respuesta: null })); // respuesta: índice | true/false
    const limite = config.minutos ? Math.round(config.minutos * 60 * preguntas.length) : 0;
    const inicio = Date.now();
    let actual = 0;

    app.innerHTML = `<main class="idx">
      <div class="examen-cab ui"><span id="ex-num"></span><span class="barra" aria-hidden="true"><i></i></span>
        ${limite ? '<span class="reloj" id="ex-reloj" role="timer"></span>' : ''}<button class="btn" type="button" id="ex-terminar">Terminar</button></div>
      <div id="ex-q"></div>
      <p class="ui" style="color:var(--muted);font-size:13px;margin-top:20px">${esc(ambito.etiqueta)}</p>
    </main>`;
    const elQ = app.querySelector('#ex-q');
    const elNum = app.querySelector('#ex-num');
    const elBarra = app.querySelector('.examen-cab .barra i');
    const elReloj = app.querySelector('#ex-reloj');
    app.querySelector('#ex-terminar').addEventListener('click', () => {
      const faltan = preguntas.filter((p) => p.respuesta === null).length;
      if (!faltan || confirm(`Quedan ${faltan} pregunta(s) sin responder. ¿Terminar el examen?`)) terminar();
    });

    if (limite) {
      const tic = () => {
        const resta = Math.max(0, limite - Math.floor((Date.now() - inicio) / 1000));
        elReloj.textContent = mmss(resta);
        elReloj.classList.toggle('poco', resta <= 60);
        if (!resta) terminar();
      };
      tic();
      reloj = setInterval(tic, 1000);
    }

    function mostrar() {
      const p = preguntas[actual];
      const { e } = p;
      elNum.textContent = `Pregunta ${actual + 1} de ${preguntas.length}`;
      elBarra.style.width = `${(100 * actual) / preguntas.length}%`;
      const cab = `<p class="origen">${esc(p.curso)} · ${p.temaTitulo} · <span class="nv ${e.nv}">${NIVEL[e.nv] || e.nv}</span></p>`;
      const ultima = actual === preguntas.length - 1;
      if (p.tipo === 'quiz') {
        const ops = e.ops.map((o, i) => `<button type="button" class="op${p.respuesta === i ? ' elegida' : ''}" data-i="${i}" aria-pressed="${p.respuesta === i}"><b>${LETRAS[i]})</b> ${o}</button>`).join('');
        elQ.innerHTML = `<article class="ej examen-q">${cab}<div class="enun">${e.q}</div><div class="ops">${ops}</div>
          <div class="acciones"><button class="btn btn-primario" type="button" id="ex-sig"${p.respuesta === null ? ' disabled' : ''}>${ultima ? 'Ver resultado' : 'Siguiente'}</button><button class="btn" type="button" id="ex-saltar">${ultima ? 'Terminar sin responder' : 'Saltar'}</button></div></article>`;
        elQ.querySelector('.ops').addEventListener('click', (ev) => {
          const b = ev.target.closest('.op');
          if (!b) return;
          p.respuesta = +b.dataset.i;
          elQ.querySelectorAll('.op').forEach((x) => { const sel = x === b; x.classList.toggle('elegida', sel); x.setAttribute('aria-pressed', sel); });
          elQ.querySelector('#ex-sig').disabled = false;
        });
        elQ.querySelector('#ex-sig').addEventListener('click', avanzar);
      } else {
        elQ.innerHTML = `<article class="ej examen-q">${cab}<div class="enun">${e.q}</div>
          <div class="acciones" id="ex-acc"><button class="btn btn-primario" type="button" id="ex-ver">Mostrar respuesta</button><button class="btn" type="button" id="ex-saltar">${ultima ? 'Terminar sin responder' : 'Saltar'}</button></div></article>`;
        elQ.querySelector('#ex-ver').addEventListener('click', () => {
          const acc = elQ.querySelector('#ex-acc');
          acc.insertAdjacentHTML('beforebegin', `<div class="resultado"><b>Respuesta:</b> ${e.r}</div>`);
          acc.innerHTML = '<button class="btn btn-primario" type="button" data-sabia="1">La sabía</button><button class="btn" type="button" data-sabia="0">No la sabía</button>';
          acc.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { p.respuesta = b.dataset.sabia === '1'; avanzar(); }));
          formulas(elQ);
        });
      }
      elQ.querySelector('#ex-saltar')?.addEventListener('click', () => { p.respuesta = null; avanzar(); });
      formulas(elQ);
      elQ.querySelector('button')?.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }

    function avanzar() {
      if (actual < preguntas.length - 1) { actual++; mostrar(); }
      else terminar();
    }

    let terminado = false;
    function terminar() {
      if (terminado) return;
      terminado = true;
      detener();
      const usados = Math.round((Date.now() - inicio) / 1000);
      const correcta = (p) => (p.tipo === 'quiz' ? p.respuesta === p.e.ok : p.respuesta === true);
      const correctas = preguntas.filter(correcta).length;
      const sinResponder = preguntas.filter((p) => p.respuesta === null).length;
      const pct = Math.round((100 * correctas) / preguntas.length);
      const hist = leerJSON(CLAVE_HISTORIAL, []) || [];
      hist.unshift({ fecha: Date.now(), ambito: ambito.etiqueta, total: preguntas.length, correctas });
      guardarJSON(CLAVE_HISTORIAL, hist.slice(0, 20));

      const repaso = preguntas.filter((p) => !correcta(p)).map((p) => {
        const { e } = p;
        let detalle;
        if (p.tipo === 'quiz') {
          const tuya = p.respuesta === null ? 'Sin responder.' : `Elegiste la ${LETRAS[p.respuesta]}).`;
          detalle = `<div class="ops">${e.ops.map((o, i) => `<button type="button" class="op${i === e.ok ? ' bien' : i === p.respuesta ? ' mal' : ''}" disabled><b>${LETRAS[i]})</b> ${o}</button>`).join('')}</div>
            <p class="fb"><span class="veredicto no">${tuya} La correcta es la ${LETRAS[e.ok]}).</span></p><p class="finalidad"><b>Explicación:</b> ${e.r}</p>`;
        } else {
          detalle = `<p class="fb"><span class="veredicto no">${p.respuesta === null ? 'Sin responder.' : 'Marcaste que no la sabías.'}</span></p><div class="resultado"><b>Respuesta:</b> ${e.r}</div>`;
        }
        return `<article class="ej"><p class="origen ui" style="font-size:13px;color:var(--muted);margin:0 0 6px">${esc(p.curso)} · ${p.temaTitulo}</p>
          <div class="enun">${e.q}</div>${detalle}<p class="ui" style="margin:10px 0 0;font-size:14px"><a href="#/curso/${esc(p.slug)}/${p.tema}">Repasar este tema →</a></p></article>`;
      }).join('');

      app.innerHTML = `<main class="idx">
        <section class="hero"><p class="migas ui"><a href="#/examen">Modo examen</a></p>
          <p class="puntaje">${pct} %</p>
          <p class="lead">${correctas} de ${preguntas.length} correctas${sinResponder ? `, ${sinResponder} sin responder` : ''}. Tiempo: ${mmss(usados)}${limite && usados >= limite ? ' (se acabó el tiempo)' : ''}.</p>
          ${barraHTML(pct)}
          <div class="acciones"><button class="btn btn-primario" type="button" id="ex-otra">Otro examen igual</button><button class="btn" type="button" id="ex-config">Cambiar configuración</button></div>
          <p class="ui" style="color:var(--muted);font-size:13px">${esc(ambito.etiqueta)}</p>
        </section>
        ${repaso ? `<section class="repaso"><h2 class="ui">Para repasar</h2>${repaso}</section>` : '<p class="lead">¡Todas correctas! Prueba con más preguntas o con otro bloque.</p>'}
      </main>`;
      app.querySelector('#ex-otra').addEventListener('click', comenzar);
      app.querySelector('#ex-config').addEventListener('click', pantallaConfig);
      formulas(app);
      window.scrollTo(0, 0);
    }

    mostrar();
  }

  if (!opciones.length) {
    app.innerHTML = '<main class="idx"><section class="hero"><h1>Modo examen</h1><p class="lead">Todavía no hay guías publicadas.</p></section></main>';
    return {};
  }
  pantallaConfig();
  return { limpiar: detener };
}
