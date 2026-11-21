"""Atajos para escribir contenido de forma compacta."""
def C(n, e, u, f=None, fn=None, tabla=None):
    d = {"n": n, "e": e, "u": tuple(u)}
    if f: d["f"] = f
    if fn: d["fn"] = fn
    if tabla: d["tabla"] = tabla
    return d
def R(nv, q, pasos, r, fin):  # resuelto
    return {"nv": nv, "q": q, "pasos": pasos, "r": r, "fin": fin}
def P(nv, q, r):  # para resolver
    return {"nv": nv, "q": q, "r": r}
def Q(nv, q, ops, ok, r):  # cuestionario: la correcta se reubica de forma determinista
    import zlib
    ops = list(ops); correcta = ops.pop(ok)
    pos = zlib.crc32(q.encode()) % (len(ops) + 1)
    ops.insert(pos, correcta)
    return {"nv": nv, "q": q, "ops": ops, "ok": pos, "r": r}
def T(titulo, intro, conceptos, ejercicios):
    return {"titulo": titulo, "intro": intro, "conceptos": conceptos, "ejercicios": ejercicios}
def tabla(enc, filas):
    h = "".join(f"<th>{c}</th>" for c in enc)
    b = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in f) + "</tr>" for f in filas)
    return f"<table><thead><tr>{h}</tr></thead><tbody>{b}</tbody></table>"
FUENTE = "http://umgcontenidos.50webs.com/Contenidos/Ciclos/"
