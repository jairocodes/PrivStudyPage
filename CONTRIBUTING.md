# Flujo de trabajo (Gitflow)

Todo cambio entra por una rama de trabajo y se une con `git merge --no-ff`, para que cada rama quede visible en el historial. No se hacen commits directos en `main` ni en `develop`.

## Ramas

| Rama | Sale de | Se une a | Uso |
| --- | --- | --- | --- |
| `main` | — | — | Producción. Cada push publica el sitio en GitHub Pages. Cada versión lleva un tag `vX.Y.Z`. |
| `develop` | `main` | — | Integración de lo que irá en la próxima versión. |
| `feature/<nombre>` | `develop` | `develop` | Funcionalidad o guía nueva (`feature/guia-compiladores`). |
| `fix/<nombre>` | `develop` | `develop` | Corrección que todavía no está en producción. |
| `chore/<nombre>` | `develop` | `develop` | Mantenimiento: dependencias, CI, configuración. |
| `docs/<nombre>` | `develop` | `develop` | Solo documentación. |
| `release/X.Y.Z` | `develop` | `main` y `develop` | Preparar una versión: número, `CHANGELOG.md`, últimos ajustes. |
| `hotfix/X.Y.Z` | `main` | `main` y `develop` | Corrección urgente de producción. |

## Mensajes de commit

[Conventional Commits](https://www.conventionalcommits.org/es/) en español: `tipo(ámbito opcional): descripción en minúsculas`.

- `feat`: funcionalidad o contenido nuevo (`feat(guia): agregar Compiladores`)
- `fix`: corrección de errores o de contenido
- `chore`: mantenimiento, CI, dependencias
- `docs`: documentación
- `refactor`, `style`, `test` cuando aplique

## Versiones

[SemVer](https://semver.org/lang/es/): `MAYOR.MENOR.PARCHE`.

- **PARCHE:** correcciones (`fix`, `hotfix`).
- **MENOR:** guías o funciones nuevas compatibles.
- **MAYOR:** cambios que rompen algo existente, por ejemplo el formato de datos o las claves de progreso.

## Recetas

Trabajo diario:

```bash
git switch develop && git pull
git switch -c feature/guia-compiladores
# ... cambios + npm run validar ...
git commit -m "feat(guia): agregar Compiladores"
git switch develop && git merge --no-ff feature/guia-compiladores
git branch -d feature/guia-compiladores && git push
```

Versión nueva:

```bash
git switch -c release/1.1.0 develop
# actualizar "version" en package.json y CHANGELOG.md
git commit -am "chore(release): versión 1.1.0"
git switch main && git merge --no-ff release/1.1.0
git tag -a v1.1.0 -m "Versión 1.1.0"
git switch develop && git merge --no-ff release/1.1.0
git branch -d release/1.1.0
git push origin main develop --follow-tags
```

Hotfix: igual que una versión, pero la rama sale de `main` (`git switch -c hotfix/1.1.1 main`) y sube solo el PARCHE.

## Antes de unir a `develop`

1. `npm run validar` sin errores.
2. `npm run build` compila.
3. Revisión visual con `npm run dev`, en escritorio y en móvil.
