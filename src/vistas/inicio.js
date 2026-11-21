import { cargarCatalogo } from '../datos.js';
import { dominados, ultimo } from '../progreso.js';
import { esc, barraHTML } from '../ui.js';

export default async function vistaInicio(app) {
  const cat = await cargarCatalogo();
  document.title = 'Privados UMG | Guías de repaso';

  const listos = cat.areas.reduce((s, a) => s + a.listos, 0);
  const total = cat.areas.reduce((s, a) => s + a.total, 0);
  const ejercicios = cat.areas.reduce((s, a) => s + a.ejercicios, 0);

  const tarjetas = cat.areas.map((a) => {
    const cursos = a.bloques.flatMap((b) => b.cursos).filter((c) => !c.pendiente);
    const dom = cursos.reduce((s, c) => s + dominados(c), 0);
    const pct = a.ejercicios ? Math.round((100 * dom) / a.ejercicios) : 0;
    const semanas = a.bloques.filter((b) => b.semana).map((b) => b.nombre).join(', ');
    return `<a class="area-card" href="#/area/${a.id}">
      <h2>${esc(a.nombre)}</h2>
      <p>${esc(semanas)}</p>
      ${a.ejercicios ? barraHTML(pct) : ''}
      <div class="cifras"><span><b>${a.listos}</b> de ${a.total} guías listas</span>${a.ejercicios ? `<span><b>${a.ejercicios}</b> ejercicios y preguntas</span><span><b>${dom}</b> dominados (${pct} %)</span>` : '<span>Guías en preparación</span>'}</div>
    </a>`;
  }).join('');

  const u = ultimo.leer();
  const continuar = u?.slug
    ? `<p class="continuar ui">Continúa donde te quedaste: <a href="#/curso/${esc(u.slug)}${u.tema ? '/' + esc(u.tema) : ''}"><b>${esc(u.titulo)}</b>${u.temaTitulo ? ', ' + esc(u.temaTitulo) : ''}</a></p>`
    : '';

  app.innerHTML = `<main class="idx">
    <section class="hero">
      <h1>Guías de privados</h1>
      <p class="meta ui">Seminario de Privados, Ingeniería en Sistemas de Información y Ciencias de la Computación, UMG, pensum 2014</p>
      <p class="lead">Una guía por curso con el temario oficial, conceptos con su uso real, ejercicios resueltos paso a paso, ejercicios para resolver y cuestionarios. ${listos} de ${total} guías listas, ${ejercicios} ejercicios y preguntas.</p>
      <p><a class="btn btn-primario" href="#/examen">Practicar en modo examen</a></p>
    </section>
    ${continuar}
    <div class="areas">${tarjetas}</div>
    <footer><p>El privado evalúa tres áreas; cada una tiene seis bloques de una semana más una semana de proyecto final y examen. La asignación de cursos a bloques es una propuesta de estudio: confírmala con la coordinación de tu centro.</p>
    <p>Tu avance se guarda solo en este navegador.</p></footer>
  </main>`;
}
