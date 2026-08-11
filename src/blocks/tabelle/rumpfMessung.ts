// rumpfMessung — die Hoehe des Tabellen-Rumpfs beobachten und in Zeilen umrechnen.
//
// Aus TabelleBlock herausgeloest (2026-08-05, als der Zeilen-Waehler die Datei
// ueber den 500-Zeilen-Deckel schob). Der Schnitt liegt am Thema: hier das
// MESSEN am DOM, in ./seitengroesse das reine Rechnen, drueben das Zeichnen.
//
// Wer messen will, muss nur zwei Dinge koennen (MessZiel): sagen, ob er das
// Attribut 'fuellt' traegt, und sein gezeichnetes Innenleben durchsuchen
// lassen. Absichtlich kein LitElement im Typ — die Messung braucht davon
// nichts, und ein schmaler Vertrag ist ohne Testaufbau nachvollziehbar.

import { zeilenmass, type Zeilenmass } from './seitengroesse'

export interface MessZiel {
  hasAttribute(name: string): boolean
  renderRoot: { querySelector(auswahl: string): Element | null }
}

// Welches Zeilenmass gilt JETZT — wie viele Zeilen, und wie hoch jede davon
// gezeichnet wird (./seitengroesse, `zeilenmass`)? null heisst „nicht messbar" —
// der Aufrufer nimmt dann seinen Rueckfall (OHNE_MESSUNG und den rohen Takt).
//
// Gemessen wird NUR auf der Rasterflaeche, erkennbar am Attribut 'fuellt'
// (dieselbe Marke setzen Editor und Export, siehe BasicBlock). Nur dort ist
// die Hoehe VORGEGEBEN und der Rumpf (flex:1, scrollend) unabhaengig von
// seinem Inhalt. Steht die Tabelle dagegen im Fluss, etwa in einer Zeile, hat
// sie gar keine vorgegebene Hoehe: dort faellt `height: 100%` auf `auto` und
// sie WAECHST mit ihrem Inhalt. Messen wuerde sich dann aufschaukeln — mehr
// Zeilen, hoeherer Rumpf, wieder mehr Zeilen, bis der Browser die Notbremse
// zieht. Darum ist 'fuellt' keine Feinheit, sondern der Riegel dagegen.
//
// Der Kopf sitzt IM scrollenden Rumpf (siehe tabelleStil) und geht darum ab.
// Er wird GEMESSEN, nicht gerechnet: aendert jemand die Kopfhoehe im CSS,
// zieht die Zeilenzahl von selbst mit.
//
// Der Zeilentakt kommt vom Aufrufer: er haengt seit 2026-08-06 an den Arten der
// Spalten (./spaltenArten, zeilenHoeheFuer), und nur der Baustein kennt sie.
export function gemessenesMass(ziel: MessZiel, takt: number): Zeilenmass | null {
  if (!ziel.hasAttribute('fuellt')) return null
  const rumpf = ziel.renderRoot.querySelector('.koerper')
  const kopf = ziel.renderRoot.querySelector('.kopf')
  if (!(rumpf instanceof HTMLElement) || !(kopf instanceof HTMLElement)) return null
  return zeilenmass(rumpf.clientHeight, kopf.offsetHeight, takt)
}

// Den Rumpf beobachten. Gibt den Beobachter zurueck (zum Abmelden) oder null,
// wenn (noch) nicht beobachtet werden kann — dann darf der Aufrufer es spaeter
// erneut versuchen.
//
// RUECKFALL PFLICHT: ohne ResizeObserver (altes WinUI) wird gar nicht
// beobachtet. Kein Fehler, kein Absturz — es gilt die feste Zahl.
export function beobachteRumpf(ziel: MessZiel, beiAenderung: () => void): ResizeObserver | null {
  if (typeof ResizeObserver === 'undefined') return null
  const rumpf = ziel.renderRoot.querySelector('.koerper')
  if (!rumpf) return null
  const beobachter = new ResizeObserver(beiAenderung)
  beobachter.observe(rumpf)
  return beobachter
}
