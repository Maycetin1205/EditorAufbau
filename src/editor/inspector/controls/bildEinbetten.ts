// bildEinbetten — aus einer gewaehlten Datei wird ein eingebetteter Daten-URI.
//
// EDITOR-Arbeit, kein Bausteincode: das Ergebnis ist ein fertiger
// `data:`-String, den der Bild-Baustein nur noch anzeigt. Deshalb liegt das
// hier und nicht in blocks/ — sonst reiste ein Dateidialog samt Canvas-Code im
// Runtime-Buendel jeder exportierten Maske mit, die ein Bild zeigt.
//
// WARUM ueberhaupt verkleinert wird: das Bild wandert vollstaendig in die
// Maskendatei (eine Maske = EINE Datei) UND in den Browser-Speicher des
// Editors. Ein Handyfoto hat heute 4000 px Kante und bringt als Base64 gut
// 8 MB mit — der Browser-Speicher ist bei rund 5 MB zu Ende, und die
// Maskendatei waere unbrauchbar gross. 1024 px ist der Richtwert aus dem
// Etappentext N5 und deckt jede Verwendung ab, die eine SoftEngine-Maske
// heute hat (Logo, Kopfbild, Tierbild): mehr Punkte als die Stelle breit ist,
// sieht niemand.
//
// STILL, ohne Warn-UI (Zusage „keine Warn-Anzeigen", 2026-08-10): ein Bild
// wird kleiner, ohne dass jemand gefragt oder belehrt wird. Nur was gar nicht
// geht — eine Datei, die kein lesbares Bild ist — meldet der Aufrufer ueber
// die eine Meldungsspur.

// Laengste Kante nach dem Verkleinern. Ein Bild, das schon kleiner ist, wird
// NICHT vergroessert (es wuerde nur unscharf und die Datei groesser).
export const MAX_KANTE = 1024

// Qualitaet der JPEG-Neucodierung. 0,85 ist der uebliche Punkt, an dem der
// Unterschied zum Original nicht mehr auffaellt, die Datei aber ein Vielfaches
// kleiner ist.
const JPEG_QUALITAET = 0.85

// PNG bleibt PNG, alles andere wird JPEG.
//
// Der Grund ist die TRANSPARENZ: ein Logo mit freigestelltem Rand ist fast
// immer ein PNG, und als JPEG bekaeme es einen schwarzen Kasten. Umgekehrt
// waere ein Foto als PNG um ein Vielfaches groesser als noetig. Entschieden
// wird am MIME-Typ der Datei — nicht daran, ob wirklich ein durchsichtiges
// Pixel drin ist: das kostete einen Durchlauf durch alle Bildpunkte, um in
// genau dem Fall etwas zu sparen, in dem es am wenigsten wiegt.
function zielTyp(dateiTyp: string): string {
  return dateiTyp === 'image/png' ? 'image/png' : 'image/jpeg'
}

// Zielmasse bei gleichem Seitenverhaeltnis. Beide Kanten mindestens 1 —
// ein 0 Pixel breites Canvas laesst sich nicht zeichnen.
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

// Datei -> Daten-URI. Wirft, wenn die Datei kein lesbares Bild ist oder das
// Canvas nichts hergibt — der Aufrufer meldet das.
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
    // toDataURL liefert bei einem Fehlschlag den Daten-URI eines LEEREN
    // 1x1-Bildes statt zu werfen. Der waere im Editor unsichtbar und in der
    // Maske ein Loch — lieber hier auffallen.
    if (!uri.startsWith('data:image/')) throw new Error('Kein Bild entstanden')
    return uri
  } finally {
    // Der Bitmap haelt den entpackten Bildspeicher fest (bei 4000 px sind das
    // gut 60 MB). Ohne close() bliebe er bis zur naechsten Speicherbereinigung
    // liegen — und der Bauer waehlt hier mehrere Bilder hintereinander.
    bild.close()
  }
}
