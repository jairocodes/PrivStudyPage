// Utilidades de interfaz compartidas por las vistas.

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const NIVEL = { B: 'Básico', I: 'Intermedio', A: 'Avanzado' };
export const LETRAS = 'abcdefg';
export const tipoDe = (e) => ('pasos' in e ? 'resuelto' : 'ops' in e ? 'quiz' : 'practica');

export const reducirMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Actualiza la barra superior: título de contexto y avance (opcional). */
export function barra({ titulo = '', ok = null, total = null } = {}) {
  document.getElementById('barra-titulo').textContent = titulo;
  const av = document.getElementById('barra-avance');
  const prog = document.getElementById('barra-prog');
  if (total) {
    av.hidden = false;
    av.querySelector('i').style.width = `${(100 * ok) / total}%`;
    prog.textContent = `${ok}/${total} dominados`;
  } else {
    av.hidden = true;
    prog.textContent = '';
  }
}

export function iniciarTema() {
  const b = document.querySelector('.btn-tema');
  const r = document.documentElement;
  const etiqueta = () => { b.textContent = r.dataset.theme === 'light' ? 'Modo oscuro' : 'Modo claro'; };
  etiqueta();
  b.addEventListener('click', () => {
    const n = r.dataset.theme === 'light' ? 'dark' : 'light';
    r.dataset.theme = n;
    try { localStorage.setItem('guia-tema', n); } catch { /* sin almacenamiento */ }
    etiqueta();
  });
}

export function barraHTML(pct) {
  return `<span class="barra" aria-hidden="true"><i style="width:${pct}%"></i></span>`;
}
