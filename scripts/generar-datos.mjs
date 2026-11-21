// Genera public/data/ a partir de la skill:
//   catalogo.json        áreas -> bloques -> cursos (listos y pendientes), con conteos
//   cursos/<slug>.json   contenido completo de cada curso, se carga bajo demanda
import fs from 'node:fs';
import path from 'node:path';
import { RAIZ, CSV, AREAS, normalizar, leerCSV, leerCursos, tipoEjercicio } from './comun.mjs';

const SALIDA = path.join(RAIZ, 'public', 'data');
const SALIDA_CURSOS = path.join(SALIDA, 'cursos');
fs.rmSync(SALIDA, { recursive: true, force: true });
fs.mkdirSync(SALIDA_CURSOS, { recursive: true });

const avisos = [];
const filas = leerCSV(CSV);
const porTitulo = new Map(filas.map((f) => [normalizar(f.curso), f]));
const usados = new Set();

// Cursos con guía escrita
const conGuia = new Map(); // titulo normalizado -> resumen
for (const { archivo, curso } of leerCursos()) {
  const clave = normalizar(curso.titulo);
  const fila = porTitulo.get(clave);
  if (!fila) { avisos.push(`${archivo}: "${curso.titulo}" no aparece en cursos.csv; no se publica.`); continue; }
  if (curso.area && curso.area !== fila.area) avisos.push(`${archivo}: área "${curso.area}" distinta de la del CSV ("${fila.area}"); se usa la del CSV.`);
  if (`${curso.slug}.json` !== archivo) avisos.push(`${archivo}: el slug interno es "${curso.slug}".`);
  usados.add(clave);
  const ejercicios = curso.temas.flatMap((t) => t.ejercicios);
  conGuia.set(clave, {
    slug: curso.slug,
    temas: curso.temas.map((t) => ({ titulo: t.titulo, ejercicios: t.ejercicios.length })),
    ejercicios: ejercicios.length,
    soloPreguntas: ejercicios.every((e) => tipoEjercicio(e) === 'quiz'),
    tipos: {
      resuelto: ejercicios.filter((e) => tipoEjercicio(e) === 'resuelto').length,
      practica: ejercicios.filter((e) => tipoEjercicio(e) === 'practica').length,
      quiz: ejercicios.filter((e) => tipoEjercicio(e) === 'quiz').length,
    },
  });
  fs.writeFileSync(path.join(SALIDA_CURSOS, `${curso.slug}.json`), JSON.stringify({ ...curso, area: fila.area }));
}

// Catálogo completo (50 cursos) ordenado por área, bloque y ciclo
const catalogo = {
  generado: new Date().toISOString(),
  areas: AREAS.map((a) => {
    const deArea = filas.filter((f) => f.area === a.nombre);
    const nombresBloque = [...a.bloques, ...new Set(deArea.map((f) => f.bloque).filter((b) => !a.bloques.includes(b)))];
    const bloques = nombresBloque
      .map((b) => ({
        id: normalizar(b),
        nombre: b,
        semana: b !== 'Sin semana propia',
        cursos: deArea
          .filter((f) => f.bloque === b)
          .sort((x, y) => +x.ciclo - +y.ciclo || x.curso.localeCompare(y.curso, 'es'))
          .map((f) => {
            const g = conGuia.get(normalizar(f.curso));
            const base = { titulo: f.curso, ciclo: +f.ciclo, pdf: f.programa_pdf };
            return g ? { ...base, ...g } : { ...base, slug: normalizar(f.curso), pendiente: true };
          }),
      }))
      .filter((b) => b.cursos.length);
    const cursos = bloques.flatMap((b) => b.cursos);
    return {
      id: a.id,
      nombre: a.nombre,
      bloques,
      listos: cursos.filter((c) => !c.pendiente).length,
      total: cursos.length,
      ejercicios: cursos.reduce((s, c) => s + (c.ejercicios || 0), 0),
    };
  }),
};

for (const f of filas) if (!AREAS.some((a) => a.nombre === f.area)) avisos.push(`cursos.csv: "${f.curso}" tiene un área desconocida ("${f.area}").`);

fs.writeFileSync(path.join(SALIDA, 'catalogo.json'), JSON.stringify(catalogo));

const listos = catalogo.areas.reduce((s, a) => s + a.listos, 0);
const total = catalogo.areas.reduce((s, a) => s + a.total, 0);
const ejercicios = catalogo.areas.reduce((s, a) => s + a.ejercicios, 0);
console.log(`Catálogo: ${listos} de ${total} cursos con guía, ${ejercicios} ejercicios y preguntas.`);
for (const a of catalogo.areas) console.log(`  ${a.nombre}: ${a.listos}/${a.total}`);
if (avisos.length) console.warn('Avisos:\n  ' + avisos.join('\n  '));
