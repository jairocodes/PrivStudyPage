import sys, importlib, json, subprocess, pathlib
import motor
nombre = sys.argv[1]; indice = sys.argv[2] if len(sys.argv) > 2 else None
curso = importlib.import_module(nombre).CURSO
err = motor.validar(curso)
doc, n = motor.render(curso, indice)
formulas = motor.extraer_formulas(doc)
pathlib.Path('/tmp/f.json').write_text(json.dumps(formulas))
r = subprocess.run(['node', 'chk.js'], capture_output=True, text=True)
out = pathlib.Path('/mnt/user-data/outputs/' + curso.get('carpeta', 'privados-ciencias')); out.mkdir(parents=True, exist_ok=True)
(out / f'{curso["slug"]}.html').write_text(doc)
print(f'{curso["titulo"]}: {len(curso["temas"])} temas, {n} ejercicios, {sum(len(t["conceptos"]) for t in curso["temas"])} conceptos, {len(formulas)} fórmulas, {len(doc)/1024:.0f} KB')
print('Estructura:', 'OK' if not err else err)
print('KaTeX:', r.stdout.strip() or r.stderr.strip())
