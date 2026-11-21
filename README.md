# PrivStudyPage

**Sitio publicado:** https://jairocodes.github.io/PrivStudyPage/

Aplicación web estática de repaso para el Seminario de Privados de Ingeniería en Sistemas UMG (pensum 2014). Carga las guías de la skill `privados-umg/privados-umg/` y ofrece:

- áreas, bloques y cursos
- conceptos con fórmulas (KaTeX)
- ejercicios resueltos, ejercicios para resolver y cuestionarios
- filtros por tipo y nivel
- progreso guardado en el navegador
- modo examen

## Uso

```bash
npm install
npm run dev        # genera public/data y abre el servidor de desarrollo
npm run validar    # revisa estructura y fórmulas de todos los cursos (código 1 si hay errores)
npm run build      # genera dist/, un sitio estático que se publica tal cual
npm run preview    # sirve dist/ para probarlo
```

`dist/` usa rutas relativas y enrutado por hash. Funciona en cualquier hosting estático (GitHub Pages, Netlify, una carpeta de XAMPP) sin configurar nada en el servidor.

## Cómo se arma

| Ruta | Qué hace |
| --- | --- |
| `privados-umg/privados-umg/` | La skill, fuente de la verdad. La app solo la lee. |
| `scripts/generar-datos.mjs` | Cruza `data/*.json` con `references/cursos.csv` y escribe `public/data/catalogo.json` y `public/data/cursos/<slug>.json`. |
| `scripts/validar.mjs` | Aplica las reglas de `references/modelo-datos.md` y compila cada fórmula con KaTeX en modo estricto. |
| `src/vistas/` | `inicio`, `area`, `curso` (porta `motor.render()`) y `examen`. |
| `src/progreso.js` | Usa las mismas claves de `localStorage` que las guías HTML del motor (`guia-<slug>-progreso`). |

## Agregar una guía nueva

1. Escribir el curso en `privados-umg/privados-umg/data/<slug>.json` siguiendo `references/modelo-datos.md`. El `titulo` debe coincidir con la columna `curso` de `cursos.csv`.
2. Ejecutar `npm run validar <slug>` y corregir lo que reporte.
3. Ejecutar `npm run build`. El curso deja de aparecer como “En preparación” y entra al modo examen de su bloque.

## Versiones y despliegue

El repositorio sigue Gitflow (`main`, `release/*`, `develop`, `feature/*`, `fix/*`, `chore/*`, `docs/*`, `hotfix/*`); ver [CONTRIBUTING.md](CONTRIBUTING.md). Cada push a `main` valida, compila y publica el sitio en GitHub Pages (`.github/workflows/pages.yml`). Las demás ramas solo se validan y compilan (`ci.yml`). Los cambios por versión están en [CHANGELOG.md](CHANGELOG.md).
