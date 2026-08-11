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
import { gestenKlammer, type GestenKlammer } from '../../../state/history'

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
  // EINE Tipp-Sitzung = EIN Token (seit A7.2 derselbe wie beim Ziehen,
  // gestenKlammer in state/history): er oeffnet beim ersten Tastendruck und
  // schliesst genau einmal — bei blur ODER wenn das Feld verschwindet. Die
  // NAECHSTE Sitzung bekommt einen frischen; ein Token ist bewusst nicht
  // wiederverwendbar, sonst koennte ein Nachzuegler-Ereignis eine langst
  // geschlossene Klammer erneut aufmachen.
  const klammer = useRef<GestenKlammer | null>(null)
  // Die Rueckrufe stecken in einer Ref, damit `beginnen`/`beenden` stabil
  // bleiben: nur so darf das Aufraeumen unten an der Unmontierung haengen
  // statt bei jedem neuen Rueckruf einmal zuzuschlagen. Gesetzt wird die Ref
  // NACH dem Rendern (Ereignis-Rueckrufe laufen erst danach).
  const rueckrufe = useRef({ onBeginBearbeitung, onEndeBearbeitung })
  useEffect(() => {
    rueckrufe.current = { onBeginBearbeitung, onEndeBearbeitung }
  })

  const beenden = useCallback(() => {
    klammer.current?.schliesse()
    klammer.current = null
  }, [])

  const beginnen = useCallback(() => {
    if (klammer.current) return
    const neue = gestenKlammer(
      () => rueckrufe.current.onBeginBearbeitung?.(),
      () => rueckrufe.current.onEndeBearbeitung?.(),
    )
    klammer.current = neue
    neue.oeffne()
  }, [])

  // Verschwindet das Feld waehrend des Tippens (anderer Baustein gewaehlt,
  // Inspector wechselt), kommt KEIN blur mehr. Ohne dieses Aufraeumen bliebe
  // die Transaktion fuer immer offen und der Verlauf zeichnete nichts mehr auf.
  useEffect(() => beenden, [beenden])

  return { beginnen, beenden }
}
