export const MAX_KANTE = 1024

const QUALITAET = 0.85

/* Rangfolge der Kodierungen. WebP steht vorn, weil es BEIDES kann, was sonst
   nur getrennt geht: verlustbehaftet komprimieren UND Transparenz behalten.
   Ein Foto, das als PNG hereinkommt, schrumpft damit von ~170 KB auf ~25 KB
   — PNG ist verlustfrei und ignoriert den Qualitaetswert, den toDataURL
   entgegennimmt (der Fehler, der die Masken schwer machte).
   Kann der Browser kein WebP kodieren, gilt wieder die alte Wahl: PNG behaelt
   Transparenz, alles andere wird JPEG. JPEG kennt kein Alpha und wuerde
   transparente Flaechen schwarz fuellen — darum bleibt PNG dort stehen. */
function kodierungen(dateiTyp: string): readonly string[] {
  return ['image/webp', dateiTyp === 'image/png' ? 'image/png' : 'image/jpeg']
}

/* toDataURL wirft bei einem Typ, den der Browser nicht kodieren kann, KEINEN
   Fehler — es liefert still ein PNG. Deshalb wird die Antwort am Praefix
   geprueft und erst dann die naechste Stufe versucht. */
function kodiere(canvas: HTMLCanvasElement, typen: readonly string[]): string {
  for (const typ of typen) {
    const uri = canvas.toDataURL(typ, QUALITAET)
    if (uri.startsWith(`data:${typ};base64,`)) return uri
  }
  throw new Error('Der Browser konnte das Bild in keinem Format ausgeben.')
}

export function zielMasse(
  breite: number,
  hoehe: number,
  maxKante = MAX_KANTE,
): { breite: number; hoehe: number } {
  const laengste = Math.max(breite, hoehe)
  if (laengste <= maxKante) return { breite, hoehe }
  const faktor = maxKante / laengste
  return {
    breite: Math.max(1, Math.round(breite * faktor)),
    hoehe: Math.max(1, Math.round(hoehe * faktor)),
  }
}

export async function bildEinbetten(datei: File): Promise<string> {
  const bild = await createImageBitmap(datei)
  try {
    const masse = zielMasse(bild.width, bild.height)
    const canvas = document.createElement('canvas')
    canvas.width = masse.breite
    canvas.height = masse.hoehe
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Kein 2d-Kontext')
    ctx.drawImage(bild, 0, 0, masse.breite, masse.hoehe)

    return kodiere(canvas, kodierungen(datei.type))
  } finally {
    bild.close()
  }
}
