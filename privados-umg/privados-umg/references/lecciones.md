# Lecciones aprendidas

- **Acentos dentro de fórmulas.** KaTeX en modo estricto rechaza letras acentuadas en modo matemático: escribir `T_{\text{ráfaga}}`, no `T_{ráfaga}`.
- **Respuesta correcta siempre en la misma letra.** Al escribir preguntas a mano la correcta tendía a quedar en la opción b. Se reubica automáticamente según un hash del enunciado.
- **Comillas en código dentro de cadenas crudas de Python.** En `r"…\"…"` la barra invertida se conserva y aparece en pantalla; usar `&quot;` en HTML o comillas simples.
- **Secuencias de escape accidentales.** En cadenas no crudas, `\t` de `\tfrac` o `\f` de `\frac` se convierten en tabulador o salto de página; las cadenas con LaTeX deben ser crudas (`r"…"`).
- **Resueltos de un solo paso.** El validador exige al menos 2 pasos; separar el razonamiento del cálculo.
- **Cálculos sin verificar.** Todo número se comprueba con código antes de publicarlo; varios errores se detectaron así (secuencias del banquero, recorridos de disco, Hamming).
- **Programas con errores de copia.** Algunos objetivos pertenecen a otro curso (Precálculo y Cálculo II mencionan “el concepto de empresa”). Se trabaja con el temario semanal.
- **Mapeo de cursos a bloques.** No es oficial; confirmar con la coordinación del centro, sobre todo cursos sin semana propia.
- **Enlaces del portal.** Las rutas tienen espacios (`Primer Ciclo`); codificar como `%20` al descargar.
- **Gasto de tiempo.** Investigar temarios completos y escribir guías con 10 ejercicios por tema consume mucho trabajo; separar la descarga de temarios (rápida) de la redacción (lenta) permite avanzar por partes.
