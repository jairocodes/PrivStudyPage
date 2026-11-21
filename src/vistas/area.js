import { cargarCatalogo, unidad } from '../datos.js';
import { dominados } from '../progreso.js';
import { esc, barra } from '../ui.js';

export default async function vistaArea(app, [id]) {
  const cat = await cargarCatalogo();
  const area = cat.areas.find((a) => a.id === id);
  if (!area) throw Object.assign(new Error('Área no encontrada'), { noEncontrada: true });
  document.title = `${area.nombre} | Privados UMG`;
  barra({ titulo: area.nombre });

  const bloques = area.bloques.map((b) => {
    const items = b.cursos.map((c) => {
      if (c.pendiente) {
        return `<li><span class="nom">${esc(c.titulo)}</span><span class="det">Ciclo ${c.ciclo}</span>
          <span class="estado pend">En preparación · <a href="${esc(c.pdf)}" target="_blank" rel="noopener">programa (PDF)</a></span></li>`;
      }
      const dom = dominados(c);
      const estado = dom ? `${dom}/${c.ejercicios} dominados` : `${c.ejercicios} ${unidad(c)}`;
      return `<li><a class="nom" href="#/curso/${esc(c.slug)}">${esc(c.titulo)}</a><span class="det">Ciclo ${c.ciclo}, ${c.temas.length} temas</span>
        <span class="estado ok">${estado}</span></li>`;
    }).join('');
    const hayGuias = b.cursos.some((c) => !c.pendiente);
    const examen = hayGuias ? `<a class="btn" href="#/examen?area=${area.id}&bloque=${b.id}">Examen del bloque</a>` : '';
    return `<section class="bloque">
      <div class="bloque-cab"><h2>${esc(b.nombre)}</h2>${examen}</div>
      <p class="sem ui">${b.semana ? 'Bloque de una semana en el seminario' : 'Pueden aparecer en preguntas generales del área'}</p>
      <ul class="cursos">${items}</ul></section>`;
  }).join('');

  app.innerHTML = `<main class="idx">
    <p class="migas ui"><a href="#/">Áreas</a></p>
    <section class="hero">
      <h1>${esc(area.nombre)}</h1>
      <p class="meta ui">Seminario de Privados, Ingeniería en Sistemas UMG, pensum 2014</p>
      <p class="lead">${area.listos} de ${area.total} guías listas${area.ejercicios ? `, ${area.ejercicios} ejercicios y preguntas` : ''}. Cada guía trae el temario oficial, conceptos con su uso real y 10 ejercicios por tema.</p>
      ${area.ejercicios ? `<p><a class="btn btn-primario" href="#/examen?area=${area.id}">Examen de toda el área</a></p>` : ''}
    </section>
    ${bloques}
    <footer><p>Cada bloque ocupa una semana del seminario; confirma el orden y el calendario con la coordinación de tu centro.</p></footer>
  </main>`;
}
