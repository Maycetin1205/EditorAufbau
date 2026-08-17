export const MAX_KANTE = 1024

const JPEG_QUALITAET = 0.85

function zielTyp(dateiTyp: string): string {
  return dateiTyp === 'image/png' ? 'image/png' : 'image/jpeg'
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
    const uri = canvas.toDataURL(zielTyp(datei.type), JPEG_QUALITAET)

    if (!uri.startsWith('data:image/')) throw new Error('Kein Bild entstanden')
    return uri
  } finally {
    bild.close()
  }
}
