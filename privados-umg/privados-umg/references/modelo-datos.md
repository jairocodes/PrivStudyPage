# Modelo de datos de un curso

Cada archivo de `data/` es un curso con esta forma (los textos admiten HTML simple y fórmulas KaTeX con `\( … \)`).

```json
{
  "slug": "sistemas-operativos-1",
  "titulo": "Sistemas Operativos I",
  "area": "Administración de Sistemas",
  "meta": "Ciclo 6, código 029, bloque Sistemas operativos del seminario",
  "firma": "T_{espera}=T_{retorno}-T_{\\text{ráfaga}}",
  "firma_nota": "Idea o fórmula que resume el curso",
  "lead": "Párrafo de presentación",
  "fuente": "URL del programa oficial en PDF",
  "como": "Instrucciones de uso de la guía",
  "temas": [
    {
      "titulo": "Procesos e hilos",
      "intro": "Qué temas del programa cubre esta sección",
      "conceptos": [
        {
          "n": "Nombre del concepto",
          "e": ["Párrafo de explicación", "..."],
          "u": ["Dónde se aplica", "Por qué importa", "Cuándo se usa", "Cómo se aplica"],
          "f": "fórmula LaTeX opcional",
          "tabla": "<table>…</table> opcional"
        }
      ],
      "ejercicios": [
        {"nv": "B", "q": "Enunciado", "pasos": ["Paso 1", "Paso 2"], "r": "Resultado", "fin": "Finalidad"},
        {"nv": "I", "q": "Enunciado", "r": "Respuesta oculta"},
        {"nv": "A", "q": "Pregunta", "ops": ["A", "B", "C", "D"], "ok": 2, "r": "Explicación"}
      ]
    }
  ]
}
```

## Tipos de ejercicio

| Tipo | Campos | Se reconoce por |
| --- | --- | --- |
| Resuelto | `nv`, `q`, `pasos` (2 o más), `r`, `fin` | tiene `pasos` |
| Para practicar | `nv`, `q`, `r` | no tiene `pasos` ni `ops` |
| Cuestionario | `nv`, `q`, `ops` (4), `ok` (índice desde 0), `r` | tiene `ops` |

`nv` es el nivel: `B` básico, `I` intermedio, `A` avanzado.

## Reglas de validación

1. Cada sección tiene al menos 10 ejercicios y al menos uno de cada nivel.
2. Cada resuelto tiene 2 o más pasos, resultado y finalidad.
3. Cada concepto tiene exactamente 4 usos (dónde, por qué, cuándo, cómo).
4. Cada cuestionario tiene 4 opciones y `ok` dentro del rango; la posición de la correcta debe variar entre preguntas (en los datos se reubica de forma determinista con CRC32 del enunciado).
5. Toda fórmula compila con KaTeX en modo estricto.
6. Las etiquetas HTML de cada texto están balanceadas.
