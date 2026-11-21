// Arranque y enrutador por hash:
//   #/                      inicio (tres áreas)
//   #/area/:area            bloques y cursos del área
//   #/curso/:slug[/tN]      guía del curso, opcionalmente en el tema N
//   #/examen[?area=&bloque=] modo examen
import './estilos.css';
import { iniciarTema, barra, esc } from './ui.js';
import vistaInicio from './vistas/inicio.js';
import vistaArea from './vistas/area.js';
import vistaCurso from './vistas/curso.js';
import vistaExamen from './vistas/examen.js';

const app = document.getElementById('app');
let actual = null; // { limpiar?, slug?, irA? }

function parsear() {
  const h = location.hash.replace(/^#\/?/, '');
  const [ruta, qs = ''] = h.split('?');
  return { partes: ruta.split('/').filter(Boolean).map(decodeURIComponent), q: new URLSearchParams(qs) };
}

async function navegar() {
  const { partes, q } = parsear();
  const [seccion, ...resto] = partes;

  // Dentro del mismo curso solo se desplaza al tema
  if (seccion === 'curso' && actual?.slug && actual.slug === resto[0]) {
    actual.irA?.(resto[1]);
    return;
  }

  actual?.limpiar?.();
  actual = null;
  barra();
  document.querySelectorAll('.nav-top a').forEach((a) => a.classList.toggle('activo', a.dataset.nav === (seccion === 'examen' ? 'examen' : !seccion || seccion === 'area' ? 'inicio' : '')));

  const vistas = { undefined: vistaInicio, area: vistaArea, curso: vistaCurso, examen: vistaExamen };
  const vista = vistas[seccion];
  window.scrollTo(0, 0);
  try {
    if (!vista) throw Object.assign(new Error('Página no encontrada'), { noEncontrada: true });
    actual = (await vista(app, resto, q)) || {};
    app.focus({ preventScroll: true });
  } catch (e) {
    console.error(e);
    document.title = 'Privados UMG';
    app.innerHTML = `<main class="idx"><section class="hero"><h1>${e.noEncontrada ? 'Página no encontrada' : 'No se pudo cargar'}</h1>
      <p class="lead">${e.noEncontrada ? 'La dirección no corresponde a ninguna sección.' : 'Revisa que los datos estén generados (<code>npm run datos</code>) y vuelve a intentarlo.'}</p>
      <p class="ui" style="color:var(--muted);font-size:14px">${esc(e.noEncontrada ? location.hash : e.message)}</p>
      <p><a class="btn btn-primario" href="#/">Ir al inicio</a></p></section></main>`;
  }
}

iniciarTema();
window.addEventListener('hashchange', navegar);
navegar();
