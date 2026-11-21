"""Motor de guías HTML — Privados UMG, área Ciencias de la Ingeniería.
Cada curso es un dict con temas -> conceptos + ejercicios. Genera un HTML autocontenido
(KaTeX incrustado con sus fuentes como data URIs)."""
import base64, html, json, re, pathlib

BASE = pathlib.Path(__file__).parent
KX = BASE / "package" / "dist"
NIVEL = {"B": "Básico", "I": "Intermedio", "A": "Avanzado"}


def katex_css():
    css = (KX / "katex.min.css").read_text()
    def repl(m):
        name = m.group(1)
        data = base64.b64encode((KX / "fonts" / f"{name}.woff2").read_bytes()).decode()
        return f'src:url(data:font/woff2;base64,{data}) format("woff2")'
    css = re.sub(r'src:url\(fonts/([A-Za-z0-9_-]+)\.woff2\) format\("woff2"\)(?:,url\([^)]*\) format\("[a-z]+"\))*', repl, css)
    assert "fonts/" not in css, "quedó una fuente sin incrustar"
    return css


def katex_js():
    return (KX / "katex.min.js").read_text() + "\n" + (KX / "contrib" / "auto-render.min.js").read_text()


CSS = r"""
:root{--bg:#F3F5F0;--surface:#FFFFFF;--ink:#1D2A27;--muted:#56655F;--line:#D3DBD5;--board:#22342E;--chalk:#EEF0E6;--chalk-dim:#B9C4BC;--hl:#E3B341;
--accent:#2F6F5E;--app:#2D5C88;--app-bg:#EEF4FA;--ans:#9A3B3B;--ans-bg:#FBF1F0;--ok:#3E7B4F;--b:#3E7B4F;--i:#A06A12;--a:#A3404A;--shadow:0 1px 0 var(--line);
color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#17201E;--surface:#1E2926;--ink:#E5E9E1;--muted:#9DABA5;--line:#33433E;--board:#243A33;--chalk:#EEF0E6;--chalk-dim:#AFC0B7;--hl:#E8C766;
--accent:#8FC9B5;--app:#9CC3E6;--app-bg:#1F2E39;--ans:#EDA3A3;--ans-bg:#352425;--ok:#8CCB9B;--b:#8CCB9B;--i:#E3B76A;--a:#EDA0A8;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#17201E;--surface:#1E2926;--ink:#E5E9E1;--muted:#9DABA5;--line:#33433E;--board:#243A33;--chalk:#EEF0E6;--chalk-dim:#AFC0B7;--hl:#E8C766;
--accent:#8FC9B5;--app:#9CC3E6;--app-bg:#1F2E39;--ans:#EDA3A3;--ans-bg:#352425;--ok:#8CCB9B;--b:#8CCB9B;--i:#E3B76A;--a:#EDA0A8;color-scheme:dark}
:root{box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
*,*::before,*::after{box-sizing:inherit}
html{scroll-padding-top:calc(env(safe-area-inset-top,0px) + 72px);scroll-behavior:smooth}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important}}
body{margin:0;background:var(--bg);color:var(--ink);font-family:"Literata",Georgia,"Times New Roman",serif;font-size:17px;line-height:1.68}
h1,h2,h3,h4,.ui{font-family:"Archivo","Segoe UI",Roboto,Helvetica,Arial,sans-serif}
a{color:var(--accent)}
:focus-visible{outline:2px solid var(--hl);outline-offset:2px}
.top{position:sticky;top:0;z-index:20;background:var(--bg);border-bottom:1px solid var(--line);padding-top:env(safe-area-inset-top,0px)}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:10;background:var(--bg)}
.top-in{display:flex;align-items:center;gap:12px;padding:10px 20px;max-width:1280px;margin:0 auto}
.top .curso{font-weight:700;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}
.barra{flex:0 0 180px;height:6px;background:var(--line);border-radius:3px;overflow:hidden}
.barra i{display:block;height:100%;width:0;background:var(--ok);transition:width .3s}
.prog{font-size:13px;color:var(--muted);white-space:nowrap}
.btn{font:600 13px "Archivo",sans-serif;background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:6px;padding:6px 10px;cursor:pointer}
.btn:hover{border-color:var(--accent)}
.btn-indice{display:none}
.layout{display:grid;grid-template-columns:270px minmax(0,1fr);gap:48px;max-width:1280px;margin:0 auto;padding:0 20px}
nav.toc{position:sticky;top:64px;align-self:start;max-height:calc(100vh - 80px);overflow:auto;padding:24px 4px 40px 0;font-size:14px}
.toc ol{list-style:none;margin:0;padding:0}
.toc>ol>li{margin:0 0 6px}
.toc a{display:flex;justify-content:space-between;gap:8px;text-decoration:none;color:var(--muted);padding:5px 8px;border-left:2px solid transparent;line-height:1.35}
.toc a:hover{color:var(--ink)}
.toc a.activo{color:var(--ink);border-left-color:var(--hl);background:var(--surface)}
.toc .cnt{font-size:12px;color:var(--muted);white-space:nowrap}
.toc .cnt.full{color:var(--ok);font-weight:700}
.toc .indice-link{margin-bottom:14px;display:block;border:none;padding-left:8px}
main{min-width:0;padding:32px 0 96px;max-width:780px}
.hero{padding:8px 0 28px;border-bottom:1px solid var(--line);margin-bottom:32px}
.hero h1{font-size:clamp(34px,5vw,52px);line-height:1.05;margin:0 0 10px;letter-spacing:-.01em}
.hero .meta{color:var(--muted);font-size:15px;margin:0 0 20px}
.hero .lead{font-size:18px;max-width:62ch}
.pizarra{background:var(--board);color:var(--chalk);border-radius:4px;padding:18px 22px;margin:14px 0;overflow-x:auto;box-shadow:inset 0 0 0 6px rgba(0,0,0,.18),inset 0 0 0 7px rgba(238,240,230,.12)}
.pizarra .katex{color:var(--chalk)}
.pizarra .nota{display:block;font:13px "Archivo",sans-serif;color:var(--chalk-dim);margin-top:8px}
.hero .pizarra{font-size:22px;padding:26px 24px}
.como{background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:14px 18px;font-size:15px;margin-top:18px}
.como p{margin:4px 0}
.filtros{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:18px 0 0;font-size:14px}
.filtros span{color:var(--muted);margin-right:4px}
.chip{font:600 13px "Archivo",sans-serif;border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:999px;padding:4px 12px;cursor:pointer}
.chip[aria-pressed="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
section.tema{padding-top:20px;margin-bottom:56px}
.tema>h2{font-size:30px;line-height:1.15;margin:0 0 6px}
.tema>h2 small{display:block;font-size:15px;color:var(--muted);font-weight:600;margin-bottom:6px}
.tema .intro{color:var(--muted);margin:0 0 24px}
.tema h3{font-size:20px;margin:36px 0 12px;padding-bottom:6px;border-bottom:1px solid var(--line)}
.concepto{margin:0 0 30px}
.concepto h4{font-size:18px;margin:0 0 6px}
.concepto p{margin:6px 0}
dl.uso{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px;margin:12px 0 0;background:var(--app-bg);border-left:3px solid var(--app);border-radius:0 6px 6px 0;padding:10px 14px;font-size:15px;line-height:1.5}
dl.uso div{padding:4px 6px}
dl.uso dt{font:700 13px "Archivo",sans-serif;color:var(--app)}
dl.uso dd{margin:0}
.ej{background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:14px 18px;margin:0 0 14px}
.ej.oculto{display:none}
.ej header{display:flex;flex-wrap:wrap;align-items:center;gap:10px;font:600 13px "Archivo",sans-serif;margin-bottom:6px}
.ej .num{font-size:14px}
.nv{display:inline-flex;align-items:center;gap:6px;color:var(--muted)}
.nv::before{content:"";width:9px;height:9px;border-radius:50%;background:currentColor}
.nv.B{color:var(--b)}.nv.I{color:var(--i)}.nv.A{color:var(--a)}
.tipo{color:var(--muted);font-weight:500}
.dominar{margin-left:auto;display:inline-flex;align-items:center;gap:6px;color:var(--muted);cursor:pointer;font-weight:500}
.dominar input{width:16px;height:16px;accent-color:var(--ok)}
.ej.hecho{border-color:var(--ok)}
.ej .enun{margin:4px 0 8px}
.ej details{border-top:1px dashed var(--line);margin-top:8px;padding-top:6px}
.ej summary{cursor:pointer;font:600 14px "Archivo",sans-serif;color:var(--accent);padding:4px 0;list-style-position:inside}
.ej ol.pasos{margin:10px 0 6px;padding-left:22px}
.ej ol.pasos li{margin:0 0 10px;padding-left:4px}
.ej ol.pasos li b{font-family:"Archivo",sans-serif}
.resultado{background:var(--ans-bg);border-left:3px solid var(--ans);padding:8px 12px;border-radius:0 6px 6px 0;margin:10px 0 6px}
.resultado b{font-family:"Archivo",sans-serif;color:var(--ans)}
.finalidad{font-size:15px;color:var(--muted);margin:8px 0 0}
.finalidad b{font-family:"Archivo",sans-serif;color:var(--ink)}
.katex-display{margin:.6em 0;overflow-x:auto;overflow-y:hidden;padding:2px 0}
.tabla{overflow-x:auto;margin:10px 0}
.tabla table{border-collapse:collapse;font-size:15px;min-width:100%}
.tabla th,.tabla td{border:1px solid var(--line);padding:6px 10px;text-align:left}
.tabla th{font-family:"Archivo",sans-serif;background:var(--surface)}
.ops{display:grid;gap:8px;margin:10px 0 4px}
.op{text-align:left;font:inherit;font-size:16px;line-height:1.45;background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:6px;padding:9px 12px;cursor:pointer}
.op:hover:not(:disabled){border-color:var(--accent)}
.op b{font-family:"Archivo",sans-serif;margin-right:4px}
.op.bien{border-color:var(--ok);background:color-mix(in srgb,var(--ok) 14%,var(--bg))}
.op.mal{border-color:var(--ans);background:var(--ans-bg)}
.op:disabled{cursor:default}
.fb .veredicto{font:700 15px "Archivo",sans-serif;margin:8px 0 0}
.fb .veredicto.si{color:var(--ok)}.fb .veredicto.no{color:var(--ans)}
.ops-reiniciar{font:600 13px "Archivo",sans-serif;background:none;border:none;color:var(--accent);cursor:pointer;padding:4px 0}
code{font-family:ui-monospace,"SFMono-Regular",Consolas,monospace;font-size:.88em;background:var(--bg);border:1px solid var(--line);border-radius:4px;padding:1px 5px}
footer{color:var(--muted);font-size:14px;border-top:1px solid var(--line);padding-top:20px}
@media (max-width:960px){
.layout{grid-template-columns:1fr;gap:0}
.btn-indice{display:inline-block}
nav.toc{position:fixed;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 52px);bottom:0;max-height:none;z-index:15;background:var(--bg);padding:16px 20px calc(24px + env(safe-area-inset-bottom,0px));display:none}
nav.toc.abierto{display:block}
.barra{display:none}
dl.uso{grid-template-columns:1fr}
body{font-size:16px}
.top-in{gap:8px;padding:10px 14px}.prog{font-size:12px}
}
@media print{.top,nav.toc,.filtros{display:none}.layout{display:block}.ej details{display:block}.ej details>*{display:block}}
"""

JS = r"""
(function(){
var slug=document.body.dataset.slug, KEY='guia-'+slug+'-progreso', hechos={};
try{hechos=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){hechos={}}
function guardar(){try{localStorage.setItem(KEY,JSON.stringify(hechos))}catch(e){}}
var cajas=[].slice.call(document.querySelectorAll('.dominar input'));
function contar(){
  var total=cajas.length,ok=0,porTema={};
  cajas.forEach(function(c){var t=c.dataset.tema;porTema[t]=porTema[t]||[0,0];porTema[t][1]++;if(c.checked){ok++;porTema[t][0]++}
    c.closest('.ej').classList.toggle('hecho',c.checked)});
  document.querySelector('.barra i').style.width=(total?100*ok/total:0)+'%';
  document.querySelector('.prog').textContent=ok+'/'+total+' dominados';
  Object.keys(porTema).forEach(function(t){var el=document.querySelector('.toc [data-cnt="'+t+'"]');if(el){el.textContent=porTema[t][0]+'/'+porTema[t][1];el.classList.toggle('full',porTema[t][0]===porTema[t][1])}});
}
cajas.forEach(function(c){c.checked=!!hechos[c.dataset.ej];c.addEventListener('change',function(){if(c.checked)hechos[c.dataset.ej]=1;else delete hechos[c.dataset.ej];guardar();contar()})});
contar();
// cuestionario
document.querySelectorAll('.ops').forEach(function(g){
  var ok=+g.dataset.ok,art=g.closest('.ej'),fb=art.querySelector('.fb'),v=fb.querySelector('.veredicto');
  g.querySelectorAll('.op').forEach(function(b){b.addEventListener('click',function(){
    var i=+b.dataset.i;g.querySelectorAll('.op').forEach(function(x){x.disabled=true;if(+x.dataset.i===ok)x.classList.add('bien')});
    if(i===ok){v.textContent='Correcto.';v.className='veredicto si';var c=art.querySelector('.dominar input');if(c&&!c.checked){c.checked=true;c.dispatchEvent(new Event('change'))}}
    else{b.classList.add('mal');v.textContent='Incorrecto. La respuesta correcta es la '+g.dataset.letra+').';v.className='veredicto no'}
    fb.hidden=false;
    if(!fb.querySelector('.ops-reiniciar')){var r=document.createElement('button');r.type='button';r.className='ops-reiniciar';r.textContent='Intentar de nuevo';r.addEventListener('click',function(){g.querySelectorAll('.op').forEach(function(x){x.disabled=false;x.classList.remove('bien','mal')});fb.hidden=true});fb.appendChild(r)}
  })})});
// filtros
var filtro={tipo:'todos',nivel:'todos'};
document.querySelectorAll('.chip').forEach(function(b){b.addEventListener('click',function(){
  var g=b.dataset.grupo;document.querySelectorAll('.chip[data-grupo="'+g+'"]').forEach(function(o){o.setAttribute('aria-pressed',o===b?'true':'false')});
  filtro[g]=b.dataset.valor;
  document.querySelectorAll('.ej').forEach(function(e){var ok=(filtro.tipo==='todos'||e.dataset.tipo===filtro.tipo)&&(filtro.nivel==='todos'||e.dataset.nivel===filtro.nivel)&&(filtro.tipo!=='pendientes'||!e.classList.contains('hecho'));
    if(filtro.tipo==='pendientes')ok=(filtro.nivel==='todos'||e.dataset.nivel===filtro.nivel)&&!e.classList.contains('hecho');
    e.classList.toggle('oculto',!ok)});
})});
// tema claro/oscuro
document.querySelector('.btn-tema').addEventListener('click',function(){
  var r=document.documentElement,n=r.dataset.theme==='light'?'dark':'light';r.dataset.theme=n;try{localStorage.setItem('guia-tema',n)}catch(e){}
  this.textContent=n==='dark'?'Modo claro':'Modo oscuro'});
document.querySelector('.btn-tema').textContent=document.documentElement.dataset.theme==='light'?'Modo oscuro':'Modo claro';
// índice móvil
var toc=document.querySelector('nav.toc'),bi=document.querySelector('.btn-indice');
bi.addEventListener('click',function(){var a=toc.classList.toggle('abierto');bi.setAttribute('aria-expanded',a)});
toc.addEventListener('click',function(e){if(e.target.closest('a')&&window.innerWidth<=960){toc.classList.remove('abierto');bi.setAttribute('aria-expanded','false')}});
// scrollspy
var links={};document.querySelectorAll('.toc a[data-tema]').forEach(function(a){links[a.dataset.tema]=a});
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){Object.values(links).forEach(function(l){l.classList.remove('activo')});var l=links[en.target.id];if(l)l.classList.add('activo')}})},{rootMargin:'-30% 0px -60% 0px'});
document.querySelectorAll('section.tema').forEach(function(s){io.observe(s)})}
// fórmulas
if(window.renderMathInElement){renderMathInElement(document.body,{delimiters:[{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false}],throwOnError:false})}
})();
"""


def esc(s):
    return html.escape(s, quote=True)


def render(curso, indice_url=None):
    slug = curso["slug"]
    out = []
    toc = []
    total_ej = 0
    for ti, t in enumerate(curso["temas"], 1):
        tid = f"t{ti}"
        toc.append(f'<li><a href="#{tid}" data-tema="{tid}"><span>{ti}. {t["titulo"]}</span><span class="cnt" data-cnt="{tid}">0/{len(t["ejercicios"])}</span></a></li>')
        s = [f'<section class="tema" id="{tid}"><h2><small>Tema {ti}</small>{t["titulo"]}</h2>']
        if t.get("intro"):
            s.append(f'<p class="intro">{t["intro"]}</p>')
        s.append('<h3>Conceptos</h3>')
        for c in t["conceptos"]:
            s.append(f'<article class="concepto"><h4>{c["n"]}</h4>')
            s.append("".join(f"<p>{p}</p>" for p in (c["e"] if isinstance(c["e"], list) else [c["e"]])))
            if c.get("f"):
                nota = f'<span class="nota">{c["fn"]}</span>' if c.get("fn") else ""
                s.append(f'<div class="pizarra">\\[{c["f"]}\\]{nota}</div>')
            if c.get("tabla"):
                s.append(f'<div class="tabla">{c["tabla"]}</div>')
            d, p, w, h = c["u"]
            s.append(f'<dl class="uso"><div><dt>Dónde se usa</dt><dd>{d}</dd></div><div><dt>Por qué</dt><dd>{p}</dd></div><div><dt>Cuándo</dt><dd>{w}</dd></div><div><dt>Cómo</dt><dd>{h}</dd></div></dl></article>')
        tipos = {("ops" in e) for e in t["ejercicios"]}
        s.append('<h3>' + ("Cuestionario" if tipos == {True} else ("Ejercicios y cuestionario" if True in tipos else "Ejercicios")) + '</h3>')
        for ei, e in enumerate(t["ejercicios"], 1):
            total_ej += 1
            eid = f"{tid}-e{ei}"
            resuelto = "pasos" in e
            quiz = "ops" in e
            tipo = "resuelto" if resuelto else ("quiz" if quiz else "practica")
            etiqueta = "Resuelto paso a paso" if resuelto else ("Cuestionario" if quiz else "Para resolver")
            s.append(f'<article class="ej" id="{eid}" data-tipo="{tipo}" data-nivel="{e["nv"]}"><header><span class="num">{"Pregunta" if quiz else "Ejercicio"} {ei}</span><span class="nv {e["nv"]}">{NIVEL[e["nv"]]}</span><span class="tipo">{etiqueta}</span><label class="dominar"><input type="checkbox" data-ej="{eid}" data-tema="{tid}"> Dominado</label></header>')
            s.append(f'<div class="enun">{e["q"]}</div>')
            if quiz:
                letras = "abcdefg"
                ops = "".join(f'<button type="button" class="op" data-i="{i}"><b>{letras[i]})</b> {o}</button>' for i, o in enumerate(e["ops"]))
                s.append(f'<div class="ops" data-ok="{e["ok"]}" data-letra="{letras[e["ok"]]}">{ops}</div><div class="fb" hidden><p class="veredicto"></p><p class="finalidad"><b>Explicación:</b> {e["r"]}</p></div>')
            elif resuelto:
                pasos = "".join(f"<li>{p}</li>" for p in e["pasos"])
                s.append(f'<details><summary>Ver solución paso a paso</summary><ol class="pasos">{pasos}</ol><div class="resultado"><b>Resultado:</b> {e["r"]}</div><p class="finalidad"><b>Para qué sirve:</b> {e["fin"]}</p></details>')
            else:
                s.append(f'<details><summary>Ver respuesta final</summary><div class="resultado"><b>Respuesta:</b> {e["r"]}</div></details>')
            s.append('</article>')
        s.append('</section>')
        out.append("".join(s))
    indice = f'<a class="indice-link" href="{esc(indice_url)}" target="_top">Volver al índice del área</a>' if indice_url else ""
    meta = curso["meta"]
    body = f'''<header class="top"><div class="top-in"><button class="btn btn-indice" aria-expanded="false" aria-controls="toc">Índice</button><span class="curso ui">{curso["titulo"]}</span><span class="barra" aria-hidden="true"><i></i></span><span class="prog ui">0 dominados</span><button class="btn btn-tema" type="button">Modo claro</button></div></header>
<div class="layout"><nav class="toc ui" id="toc" aria-label="Temas del curso">{indice}<ol>{"".join(toc)}</ol></nav>
<main><section class="hero"><h1>{curso["titulo"]}</h1><p class="meta ui">{meta}</p><div class="pizarra">\\[{curso["firma"]}\\]<span class="nota">{curso["firma_nota"]}</span></div><p class="lead">{curso["lead"]}</p>
<div class="como"><p><b>Cómo usar esta guía.</b> {curso.get("como", "Cada tema trae conceptos con su uso real y 10 ejercicios: 5 resueltos paso a paso y 5 para resolver con la respuesta final oculta. Intenta cada ejercicio antes de abrir la solución y márcalo como dominado cuando lo resuelvas sin ayuda; tu avance se guarda en este navegador.")}</p><p>Fuente del temario: <a href="{esc(curso["fuente"])}" target="_blank" rel="noopener">programa oficial del curso</a>.</p></div>
<div class="filtros ui" role="group" aria-label="Filtrar ejercicios"><span>Ejercicios:</span><button class="chip" data-grupo="tipo" data-valor="todos" aria-pressed="true">Todos</button><button class="chip" data-grupo="tipo" data-valor="resuelto" aria-pressed="false">Resueltos</button><button class="chip" data-grupo="tipo" data-valor="practica" aria-pressed="false">Para resolver</button>{'<button class="chip" data-grupo="tipo" data-valor="quiz" aria-pressed="false">Cuestionario</button>' if any("ops" in e for t in curso["temas"] for e in t["ejercicios"]) else ""}<button class="chip" data-grupo="tipo" data-valor="pendientes" aria-pressed="false">Sin dominar</button>
<span style="margin-left:10px">Nivel:</span><button class="chip" data-grupo="nivel" data-valor="todos" aria-pressed="true">Todos</button><button class="chip" data-grupo="nivel" data-valor="B" aria-pressed="false">Básico</button><button class="chip" data-grupo="nivel" data-valor="I" aria-pressed="false">Intermedio</button><button class="chip" data-grupo="nivel" data-valor="A" aria-pressed="false">Avanzado</button></div></section>
{"".join(out)}
<footer><p>Guía de repaso para el Seminario de Privados, Ingeniería en Sistemas UMG, pensum 2014. Área {curso.get("area", "Ciencias de la Ingeniería")}.</p></footer></main></div>'''
    head = f'''<!DOCTYPE html><html lang="es" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>{esc(curso["titulo"])} | Guía de privados UMG</title>
<script>try{{var t=localStorage.getItem('guia-tema');if(t)document.documentElement.dataset.theme=t}}catch(e){{}}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400&display=swap" rel="stylesheet">
<style>{katex_css()}</style><style>{CSS}</style></head>'''
    doc = f'{head}<body data-slug="{slug}">{body}<script>{katex_js()}</script><script>{JS}</script></body></html>'
    return doc, total_ej


def validar(curso):
    errores = []
    for ti, t in enumerate(curso["temas"], 1):
        ej = t["ejercicios"]
        res = [e for e in ej if "pasos" in e]
        pra = [e for e in ej if "pasos" not in e]
        qz = [e for e in ej if "ops" in e]
        pra = [e for e in pra if "ops" not in e]
        if len(ej) < 10: errores.append(f"Tema {ti}: {len(ej)} ejercicios (<10)")
        if not qz:
            if len(res) < 5: errores.append(f"Tema {ti}: {len(res)} resueltos (<5)")
            if len(pra) < 5: errores.append(f"Tema {ti}: {len(pra)} para resolver (<5)")
        for e in qz:
            if not (0 <= e["ok"] < len(e["ops"])) or len(e["ops"]) < 3: errores.append(f"Tema {ti}: pregunta mal formada")
        for e in ej:
            if not e.get("r"): errores.append(f"Tema {ti}: ejercicio sin respuesta")
            if "pasos" in e and (len(e["pasos"]) < 2 or not e.get("fin")): errores.append(f"Tema {ti}: resuelto sin pasos o finalidad")
        niveles = {e["nv"] for e in ej}
        if niveles != {"B", "I", "A"}: errores.append(f"Tema {ti}: niveles incompletos {niveles}")
        for c in t["conceptos"]:
            if len(c["u"]) != 4: errores.append(f"Tema {ti}: concepto {c['n']} sin las 4 aplicaciones")
    return errores


def extraer_formulas(doc):
    """Devuelve (latex, display) de todo lo que KaTeX va a procesar."""
    cuerpo = doc.split("<body", 1)[1].split("<script>", 1)[0]
    texto = html.unescape(re.sub(r"<[^>]+>", " ", cuerpo))
    res = [(m.group(1), True) for m in re.finditer(r"\\\[(.+?)\\\]", texto, re.S)]
    res += [(m.group(1), False) for m in re.finditer(r"\\\((.+?)\\\)", texto, re.S)]
    return res
