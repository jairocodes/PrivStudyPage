# Cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/); versiones con [SemVer](https://semver.org/lang/es/).

## [1.1.0] - 2026-11-21

### Agregado
- Seis guías nuevas, con lo que Administración de Sistemas queda completa (14 de 14). Cada guía tiene 7 secciones y 70 ejercicios y preguntas:
  - Derecho Informático: marco legal guatemalteco, delitos informáticos, propiedad intelectual, firma electrónica, Derecho Laboral y Mercantil.
  - Autómatas y Lenguajes Formales: AFD, AFN, conversiones, gramáticas, autómatas de pila, máquinas de Turing, notación posfija.
  - Compiladores: fases, análisis léxico, LL(1), SLR, traducción dirigida por la sintaxis, optimización.
  - Inteligencia Artificial: búsqueda, juegos, lógica, incertidumbre, aprendizaje, lenguaje natural.
  - Seguridad y Auditoría de Sistemas: riesgo, normas, controles, criptografía, continuidad, auditoría informática.
  - Seminario de Tecnologías de Información: IoT, blockchain, nube, big data, frameworks web, gobierno de TI, evaluación de proyectos.
- Catálogo total: 35 de 50 guías, 2120 ejercicios y preguntas.
- `npm run validar` acepta rutas de archivos JSON para validar borradores antes de integrarlos.
- Ícono del sitio.

### Corregido
- Las tablas escritas dentro de un texto ya no ensanchan la página en móvil.
- Los bloques de código conservan los espacios y la alineación.

## [1.0.0] - 2026-11-21

### Agregado
- Aplicación web estática (Vite) de repaso para el Seminario de Privados de Ingeniería en Sistemas UMG, pensum 2014.
- 29 guías (1700 ejercicios y preguntas) tomadas de la skill `privados-umg`:
  - Ciencias de la Ingeniería: 21 de 21.
  - Administración de Sistemas: 8 de 14.
  - Los 21 cursos restantes aparecen “en preparación” con su programa oficial.
- Navegación por área → bloque → curso → tema, con avance por curso y por área.
- Guía de curso:
  - conceptos con dónde, por qué, cuándo y cómo
  - resueltos paso a paso, ejercicios para resolver y cuestionarios con retroalimentación inmediata
  - filtros por tipo y nivel, e índice con contador por tema
- Fórmulas con KaTeX, tema claro y oscuro, diseño adaptable a móvil.
- Progreso en el navegador, compatible con las guías HTML del motor original.
- Modo examen por área o bloque: preguntas aleatorias, tiempo límite, puntaje, temas para repasar e historial.
- Scripts `npm run datos` (catálogo) y `npm run validar` (estructura y KaTeX en modo estricto).
- Publicación automática en GitHub Pages desde `main` y validación en las demás ramas.
- Flujo Gitflow documentado en `CONTRIBUTING.md`.

[1.1.0]: https://github.com/jairocodes/PrivStudyPage/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/jairocodes/PrivStudyPage/releases/tag/v1.0.0
