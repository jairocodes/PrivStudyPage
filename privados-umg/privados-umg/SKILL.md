---
name: privados-umg
description: Método para preparar los exámenes privados de Ingeniería en Sistemas UMG (pensum 2014) a partir de los programas oficiales de los 50 cursos, y para construir guías de estudio dentro de una aplicación web con temas, conceptos, ejercicios resueltos, ejercicios para resolver y cuestionarios. Úsala para crear o ampliar guías de privados, generar ejercicios o cuestionarios de un curso del pensum, revisar el contenido existente o diseñar la aplicación web de repaso, aunque no se mencione la palabra skill.
---

# Privados UMG: del temario oficial a la guía de estudio

Esta skill documenta cómo se trabajó la preparación de los privados (Seminario de Privados, Ingeniería en Sistemas de Información y Ciencias de la Computación, pensum 2014) para que el mismo proceso alimente una aplicación web sencilla.

## Qué contiene

| Ruta | Para qué sirve |
| --- | --- |
| `references/cursos.md` y `references/cursos.csv` | Los 50 cursos con ciclo, área, bloque del seminario, enlace al programa oficial en PDF y enlace a la guía publicada si existe |
| `references/modelo-datos.md` | Esquema JSON de un curso (temas, conceptos, ejercicios) y reglas de validación |
| `references/lecciones.md` | Errores encontrados durante el trabajo y cómo evitarlos |
| `data/*.json` | El contenido ya escrito de 29 guías (1700 ejercicios y preguntas), listo para cargar en la aplicación |
| `scripts/descargar_temarios.sh` | Descarga los 50 PDF de programas oficiales en `temarios/<área>/` |
| `scripts/motor/` | Implementación de referencia en Python que convierte un curso en una página HTML autocontenida (KaTeX, tema claro y oscuro, progreso local) |

## Fuentes

1. Portal de contenidos de la carrera: http://umgcontenidos.50webs.com/ (índice del pensum 2014 con un PDF por curso).
2. Listado oficial de cursos del seminario: define los bloques de una semana de cada área.
3. El programa de cada curso trae justificación, objetivos, temario semanal (“programación tentativa”) y bibliografía. El temario semanal es la fuente de los temas; la bibliografía, de la teoría.

Los programas son de cohortes 2017-2018 y algunos tienen errores de copia (objetivos de otro curso, años cambiados). Se usa el temario semanal y se señalan las inconsistencias en lugar de corregirlas en silencio.

## Áreas y bloques del seminario

El privado evalúa tres áreas; cada una tiene seis bloques de una semana más una semana de proyecto final y examen.

- **Ciencias de la Ingeniería:** Matemática, Cálculo, Probabilidad y estadística, Metodología de la investigación, Física, Electrónica. Cursos sin semana propia: contabilidad, administración, microeconomía, emprendimiento, desarrollo humano y ética.
- **Administración de Sistemas:** Sistemas operativos, Arquitectura de computadoras, Redes, Comunicaciones, Sistemas de Información Gerencial, Auditoría y Seguridad. Sin semana propia: Autómatas, Compiladores, Inteligencia Artificial.
- **Análisis, Diseño y Desarrollo:** Programación, Programación avanzada, Bases de datos, Desarrollo web, Análisis de sistemas, Ingeniería de software.

La asignación de cada curso a un bloque está en `references/cursos.csv`. Es una propuesta de estudio: cursos como Investigación de Operaciones, Derecho Informático o los proyectos de graduación deben confirmarse con la coordinación del centro.

## Flujo de trabajo

### 1. Investigar el temario de un curso

Para cada curso: abrir su PDF, copiar el temario semanal como lista numerada y escribir tres bloques:

- **Temario oficial:** los temas tal como los nombra el programa, agrupados en unidades.
- **Teoría clave:** definiciones, fórmulas y criterios que un examinador espera, con la bibliografía del programa como base.
- **Preguntas tipo privado:** 5 a 7 preguntas o ejercicios representativos.

Se hizo un documento de investigación por área antes de escribir guías. Así se detectan temas repetidos entre cursos y se decide cómo agrupar.

### 2. Convertir el temario en secciones

Cada guía tiene entre 4 y 7 secciones. Si el programa trae muchos temas cortos, se agrupan (por ejemplo, 12 temas de Física I en 7 secciones); si trae pocos temas muy amplios, se dividen. Cada sección indica en su introducción qué temas del programa cubre, para no perder trazabilidad.

### 3. Escribir el contenido de cada sección

Cada sección tiene:

- **2 a 4 conceptos.** Cada uno con explicación corta, fórmula o tabla si aplica, y cuatro usos reales: **dónde** se aplica, **por qué** importa, **cuándo** se usa y **cómo** se aplica.
- **10 ejercicios** con dificultad variada (básico, intermedio, avanzado; al menos uno de cada nivel):
  - **5 resueltos paso a paso**, con resultado y una **finalidad** (para qué sirve saber hacerlo).
  - **5 para practicar**, con la respuesta oculta hasta que el estudiante la pida.
- En temas conceptuales (leyes, administración, ética, licencias) los 5 de práctica son **preguntas de opción múltiple** de 4 opciones con explicación. En cursos totalmente teóricos (Proceso Administrativo, Desarrollo Humano, Ética) la sección completa son 10 preguntas.

Los ejemplos usan el contexto del estudiante: Guatemala, quetzales, IVA de 12 %, SAT, instituciones públicas, servidores Linux, sistemas PHP o Java.

### 4. Verificar antes de publicar

- Todo cálculo numérico se comprueba con código (Python con NumPy, SciPy o NetworkX) antes de escribir la respuesta: planificación de procesos, subneteo, CRC, Hamming, presupuestos de enlace, VAN, regresiones, Karnaugh, circuitos.
- Cada fórmula se compila con KaTeX en modo estricto.
- Un validador revisa la estructura (ver `references/modelo-datos.md`).
- Se revisa visualmente en escritorio y móvil.

### 5. Publicar y llevar el registro

Cada guía se registra con su URL, número de ejercicios y estructura, y una página índice por área enlaza las guías y marca las pendientes.

## Diseño de la experiencia de estudio

Lo que funcionó y conviene conservar en la aplicación:

- Tema oscuro por defecto con alternativa clara; tipografías Archivo (interfaz) y Literata (texto); fórmulas en recuadros tipo pizarra.
- Encabezado del curso con una fórmula o idea “firma” y la fuente oficial enlazada.
- Índice lateral con la sección activa y el avance por sección.
- Filtros de ejercicios por tipo (resueltos, para practicar, cuestionario) y por nivel.
- Pasos de los resueltos visibles; respuesta de los de práctica detrás de un botón.
- Cuestionarios con retroalimentación inmediata (correcta o incorrecta, con explicación).
- Progreso guardado en el dispositivo (marcar dominado), sin cuentas de usuario.

## Sugerencia para la aplicación web

1. Cargar `data/*.json` como contenido estático o importarlo a una base de datos con tablas `curso`, `tema`, `concepto`, `ejercicio`.
2. Rutas: inicio por área → bloque → curso → sección.
3. Renderizar fórmulas con KaTeX en el cliente (los textos usan `\( … \)` en línea).
4. Guardar progreso en `localStorage` o, si hay usuarios, en una tabla `progreso(usuario, ejercicio_id, estado)`.
5. Generar identificadores estables de ejercicio con `slug` del curso + índice de sección + índice de ejercicio.
6. Agregar un modo examen: preguntas aleatorias de un bloque con tiempo límite.

## Estado al cerrar esta etapa

- Ciencias de la Ingeniería: 21 de 21 guías publicadas.
- Administración de Sistemas: 8 de 14 guías publicadas (faltan Seguridad y Auditoría, Derecho Informático, Seminario de TI, Autómatas, Compiladores e Inteligencia Artificial); temarios investigados para los 14.
- Análisis, Diseño y Desarrollo: temarios por investigar o descargar (enlaces en `references/cursos.md`).
