// gewaehlterTag — der Tag, den die Maske gerade zeigt.
//
// Vorbild ist SELECTED_DATE der echten Empfang-Maske: EIN Wert, den der
// Tageswaehler setzt und nach dem sich alle datengetriebenen Bausteine
// richten (Board zeigt nur die Termine dieses Tages).
//
// Die Stelle kennt KEINEN Baustein (Regel 2) und keinen Baustein-Typ:
//   - der Tageswaehler ruft setzeGewaehltenTag und weiss nicht, wer zuhoert
//   - Kanban und Tabelle horchen ueber datenAnschluss und wissen nicht,
//     wer den Tag setzt
// Wer kuenftig nach Tag filtern will, braucht deshalb keine Zeile hier.
//
// '' = kein Tag gewaehlt -> es wird NICHT gefiltert (jeder Satz bleibt
// sichtbar). Der Filter ist damit von sich aus harmlos: eine Maske ohne
// Tageswaehler verhaelt sich exakt wie vorher.

import { tagSchluessel } from './datumSchluessel'

let tag = ''
const horcher = new Set<() => void>()

// Aktueller Tag als Schluessel ('JJJJ-MM-TT'), '' = kein Tag gewaehlt.
export function gewaehlterTag(): string {
  return tag
}

// Tag setzen. Nimmt deutsche wie ISO-Schreibweise (tagSchluessel); ein
// unlesbarer Wert loescht den Tag, statt einen falschen zu behaupten.
// Meldet nur bei echter Aenderung — sonst zeichnete jeder Tastendruck im
// Datumsfeld die ganze Maske neu.
export function setzeGewaehltenTag(wert: unknown): void {
  const neu = tagSchluessel(wert)
  if (neu === tag) return
  tag = neu
  horcher.forEach((cb) => cb())
}

// Auf Tageswechsel horchen (Muster onSeDaten: anmelden, nie abmelden —
// die Zuhoerer leben so lange wie die Maske).
export function aufTagHoeren(cb: () => void): void {
  horcher.add(cb)
}

// Hier stand bis 2026-07-28 ein `heuteSetzen`, dessen Kommentar behauptete,
// der Baustein fasse die Uhr deshalb nicht selbst an. Beides war falsch: die
// Funktion rief niemand, und der Tageswaehler holte sich „heute" die ganze
// Zeit selbst (DatumBlock). Ein Kommentar, der etwas anderes behauptet als
// der Code tut, ist schlimmer als gar keiner — darum ersatzlos entfernt.
