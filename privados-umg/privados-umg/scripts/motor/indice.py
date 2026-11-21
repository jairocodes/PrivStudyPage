import motor, pathlib, html
import json
GUIAS = json.load(open("urls.json"))
BLOQUES = [
 ("Matemática", "Bloque de una semana en el seminario", [("Precálculo",2,6),("Álgebra Lineal",2,5),("Matemática Discreta",2,6)]),
 ("Cálculo", "Bloque de una semana en el seminario", [("Cálculo I",3,5),("Cálculo II",4,5),("Métodos Numéricos",5,5)]),
 ("Probabilidad y estadística", "Bloque de una semana en el seminario", [("Estadística I",4,6),("Estadística II",5,10),("Investigación de Operaciones",6,6)]),
 ("Metodología de la investigación", "Bloque de una semana en el seminario", [("Metodología de la Investigación",1,4)]),
 ("Física", "Bloque de una semana en el seminario", [("Física I",3,12),("Física II",4,6)]),
 ("Electrónica", "Bloque de una semana en el seminario", [("Electrónica Analógica",5,7),("Electrónica Digital",6,8)]),
 ("Cursos sin semana propia", "Pueden aparecer en preguntas generales del área", [("Contabilidad I",1,5),("Contabilidad II",2,8),("Proceso Administrativo",3,10),("Microeconomía",4,6),("Emprendedores de Negocios",5,5),("Desarrollo Humano y Profesional",1,12),("Ética Profesional",8,16)]),
]
css = motor.CSS + """
.idx{max-width:860px;margin:0 auto;padding:32px 20px 96px}
.bloque{margin:40px 0 0}
.bloque h2{font-size:24px;margin:0 0 2px}
.bloque .sem{color:var(--muted);font-size:14px;margin:0 0 12px}
.cursos{list-style:none;margin:0;padding:0;border-top:1px solid var(--line)}
.cursos li{display:flex;align-items:baseline;gap:14px;padding:12px 4px;border-bottom:1px solid var(--line)}
.cursos .nom{flex:1;font-size:18px}
.cursos .det{font:500 13px "Archivo",sans-serif;color:var(--muted);white-space:nowrap}
.cursos a.nom{font-weight:600}
.estado{font:600 13px "Archivo",sans-serif;white-space:nowrap}
.estado.ok{color:var(--ok)}.estado.pend{color:var(--muted)}
@media (max-width:600px){.cursos li{flex-wrap:wrap;gap:2px 12px}.cursos .nom{flex-basis:100%}}
"""
listo = sum(1 for b in BLOQUES for c in b[2] if c[0] in GUIAS)
total = sum(len(b[2]) for b in BLOQUES)
partes = []
for nombre, sem, cursos in BLOQUES:
    items = []
    for c, ciclo, temas in cursos:
        if c in GUIAS:
            url, n, det = GUIAS[c]
            unidad = "preguntas" if c in ("Proceso Administrativo", "Desarrollo Humano y Profesional", "Ética Profesional") else "ejercicios"
            items.append(f'<li><a class="nom" href="{url}" target="_top">{c}</a><span class="det">Ciclo {ciclo}, {det}</span><span class="estado ok">{n} {unidad}</span></li>')
        else:
            items.append(f'<li><span class="nom">{c}</span><span class="det">Ciclo {ciclo}, {temas} temas</span><span class="estado pend">En preparación</span></li>')
    partes.append(f'<section class="bloque"><h2>{nombre}</h2><p class="sem ui">{sem}</p><ul class="cursos">{"".join(items)}</ul></section>')
doc = f'''<!DOCTYPE html><html lang="es" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>Ciencias de la Ingeniería | Guías de privados UMG</title>
<script>try{{var t=localStorage.getItem('guia-tema');if(t)document.documentElement.dataset.theme=t}}catch(e){{}}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=Literata:opsz,wght@7..72,400;7..72,600&display=swap" rel="stylesheet"><style>{css}</style></head>
<body><main class="idx"><section class="hero"><h1>Ciencias de la Ingeniería</h1><p class="meta ui">Seminario de Privados, Ingeniería en Sistemas UMG, pensum 2014</p>
<p class="lead">Una guía por curso, con el temario oficial completo, explicaciones cortas, usos reales y 10 ejercicios por tema (5 resueltos paso a paso y 5 para resolver). {listo} de {total} guías listas.</p>
<p class="ui" style="font-size:15px">Investigación base del área: <a href="https://claude.ai/artifact/1SgW5nHRHmBFt93nu3EErp" target="_top">documento con temarios, fórmulas y preguntas tipo privado</a>.</p></section>
{"".join(partes)}
<footer style="margin-top:48px"><p>Cada bloque ocupa una semana del seminario; confirma el orden y el calendario con la coordinación de tu centro.</p><p><button class="btn btn-tema" type="button">Modo claro</button></p></footer></main>
<script>(function(){{var b=document.querySelector('.btn-tema'),r=document.documentElement;b.textContent=r.dataset.theme==='light'?'Modo oscuro':'Modo claro';b.addEventListener('click',function(){{var n=r.dataset.theme==='light'?'dark':'light';r.dataset.theme=n;try{{localStorage.setItem('guia-tema',n)}}catch(e){{}}b.textContent=n==='dark'?'Modo claro':'Modo oscuro'}})}})();</script></body></html>'''
p = pathlib.Path('/mnt/user-data/outputs/privados-ciencias/indice.html'); p.write_text(doc)
print(listo, total, len(doc))
