// eingabeSitzung — eine Tipp-Sitzung = EIN Undo-Schritt.
//
// Ohne diese Klammer meldete jeder Tastendruck einen eigenen Verlaufs-Schritt:
// ein 60 Zeichen langer Titel spuelte die ganze Historie (Deckel 50) weg, und
// Strg+Z ging buchstabenweise zurueck. Dieselbe Mechanik wie beim Ziehen
// (zieheGroesse): beginTransaction am Anfang der Geste, endTransaction am Ende.
//
// Begonnen wird beim ERSTEN Tastendruck, nicht schon beim Fokus — wer nur ins
// Feld klickt und wieder rausgeht, soll keinen Leer-Schritt erzeugen.
//
// Bekannte, akzeptierte Kante (dieselbe wie beim Ziehen): Strg+Z MITTEN im
// Tippen springt auf den Stand vor der Eingabe.

import { useCallback, useEffect, useRef } from 'react'

export interface Eingabesitzung {
  /** Vor jedem onChange rufen — nur der erste Aufruf oeffnet die Klammer. */
  beginnen: () => void
  /** An onBlur haengen — schliesst eine offene Klammer, sonst folgenlos. */
  beenden: () => void
}

export function useEingabeSitzung(
  onBeginBearbeitung?: () => void,
  onEndeBearbeitung?: () => void,
): Eingabesitzung {
  const offen = useRef(false)
  // Die Rueckrufe stecken in einer Ref, damit `beginnen`/`beenden` stabil
  // bleiben: nur so darf das Aufraeumen unten an der Unmontierung haengen
  // statt bei jedem neuen Rueckruf einmal zuzuschlagen. Gesetzt wird die Ref
  // NACH dem Rendern (Ereignis-Rueckrufe laufen erst danach).
  const rueckrufe = useRef({ onBeginBearbeitung, onEndeBearbeitung })
  useEffect(() => {
    rueckrufe.current = { onBeginBearbeitung, onEndeBearbeitung }
  })

  const beenden = useCallback(() => {
    if (!offen.current) return
    offen.current = false
    rueckrufe.current.onEndeBearbeitung?.()
  }, [])

  const beginnen = useCallback(() => {
    if (offen.current) return
    offen.current = true
    rueckrufe.current.onBeginBearbeitung?.()
  }, [])

  // Verschwindet das Feld waehrend des Tippens (anderer Baustein gewaehlt,
  // Inspector wechselt), kommt KEIN blur mehr. Ohne dieses Aufraeumen bliebe
  // die Transaktion fuer immer offen und der Verlauf zeichnete nichts mehr auf.
  useEffect(() => beenden, [beenden])

  return { beginnen, beenden }
}
