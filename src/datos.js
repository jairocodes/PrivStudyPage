// Carga del catálogo y de los cursos generados por scripts/generar-datos.mjs (public/data/).
const BASE = import.meta.env.BASE_URL;
let catalogo = null;
const cursos = new Map();

async function json(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} al pedir ${url}`);
  return r.json();
}

export function cargarCatalogo() {
  if (!catalogo) catalogo = json(`${BASE}data/catalogo.json`).catch((e) => { catalogo = null; throw e; });
  return catalogo;
}

export function cargarCurso(slug) {
  if (!cursos.has(slug)) {
    cursos.set(slug, json(`${BASE}data/cursos/${encodeURIComponent(slug)}.json`).catch((e) => { cursos.delete(slug); throw e; }));
  }
  return cursos.get(slug);
}

/** Devuelve {area, bloque, curso} del catálogo para un slug, o null. */
export function ubicarCurso(cat, slug) {
  for (const area of cat.areas)
    for (const bloque of area.bloques)
      for (const curso of bloque.cursos)
        if (curso.slug === slug) return { area, bloque, curso };
  return null;
}

export const unidad = (c) => (c.soloPreguntas ? 'preguntas' : 'ejercicios');
