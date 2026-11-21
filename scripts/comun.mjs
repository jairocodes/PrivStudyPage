// Utilidades compartidas por generar-datos.mjs y validar.mjs.
// La carpeta de la skill (privados-umg/privados-umg) es la fuente de la verdad: aquí solo se lee.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SKILL = path.join(RAIZ, 'privados-umg', 'privados-umg');
export const DIR_DATOS = path.join(SKILL, 'data');
export const CSV = path.join(SKILL, 'references', 'cursos.csv');

export const AREAS = [
  {
    id: 'ciencias',
    nombre: 'Ciencias de la Ingeniería',
    bloques: ['Matemática', 'Cálculo', 'Probabilidad y estadística', 'Metodología de la investigación', 'Física', 'Electrónica', 'Sin semana propia'],
  },
  {
    id: 'administracion',
    nombre: 'Administración de Sistemas',
    bloques: ['Sistemas operativos', 'Arquitectura de computadoras', 'Redes', 'Comunicaciones', 'Sistemas de Información Gerencial', 'Auditoría y Seguridad de Sistemas', 'Sin semana propia'],
  },
  {
    id: 'desarrollo',
    nombre: 'Análisis, Diseño y Desarrollo',
    bloques: ['Programación', 'Programación avanzada', 'Bases de datos', 'Desarrollo web', 'Análisis de sistemas', 'Ingeniería de software', 'Sin semana propia'],
  },
];

/** Minúsculas, sin acentos ni signos: sirve para cruzar títulos y para crear slugs. */
export function normalizar(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Parser CSV mínimo con soporte para campos entre comillas. */
export function leerCSV(ruta) {
  const texto = fs.readFileSync(ruta, 'utf8').replace(/^﻿/, '');
  const filas = [];
  let fila = [], campo = '', comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === ',') { fila.push(campo); campo = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      fila.push(campo); campo = '';
      if (fila.some((x) => x !== '')) filas.push(fila);
      fila = [];
    } else campo += c;
  }
  if (campo !== '' || fila.length) { fila.push(campo); filas.push(fila); }
  const [enc, ...resto] = filas;
  return resto.map((f) => Object.fromEntries(enc.map((k, i) => [k.trim(), (f[i] ?? '').trim()])));
}

/** Devuelve [{archivo, curso}] con cada JSON de data/. */
export function leerCursos() {
  return fs.readdirSync(DIR_DATOS)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((archivo) => ({ archivo, curso: JSON.parse(fs.readFileSync(path.join(DIR_DATOS, archivo), 'utf8')) }));
}

export const tipoEjercicio = (e) => ('pasos' in e ? 'resuelto' : 'ops' in e ? 'quiz' : 'practica');
