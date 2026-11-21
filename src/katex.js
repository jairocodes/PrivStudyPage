import 'katex/dist/katex.min.css';
import renderMathInElement from 'katex/contrib/auto-render';

/** Renderiza \( … \) en línea y \[ … \] en bloque dentro de un elemento. */
export function formulas(el) {
  renderMathInElement(el, {
    delimiters: [
      { left: '\\[', right: '\\]', display: true },
      { left: '\\(', right: '\\)', display: false },
    ],
    throwOnError: false,
  });
}
