// feldTypen — WELCHE Feldtypen das Formularfeld kennt und was je Typ zur
// Darstellung gehört.
//
// Aus FormFeldBlock herausgelöst (2026-08-17), als die Datei über den
// 500-Zeilen-Deckel wuchs. Der Schnitt ist der natürliche: hier die Tabelle
// der Typen, drüben der Baustein, der sie benutzt. Reine Daten, kein DOM —
// derselbe Schnitt wie feldStil (Aussehen) und feldRuntime (Verhalten).

// Feldtypen (Technikwerte) — der Bediener sieht nur die Klarnamen, die in
// feldEigenschaften an der Klappliste „Feldtyp" hängen.
export const FELD_TYPEN = ['text', 'number', 'textarea', 'select', 'date', 'checkbox', 'nachschlagen'] as const
export type FeldTyp = (typeof FELD_TYPEN)[number]

export function coerceFeldTyp(v: unknown): FeldTyp {
  return FELD_TYPEN.includes(v as FeldTyp) ? (v as FeldTyp) : 'text'
}

// Typen mit sichtbarem Platzhalter IM Feld. Beim Select liegt darunter eine
// leere, deaktivierte Startoption: der Platzhalter beschreibt das Feld, ist
// aber selbst nie ein auswählbarer Wert.
//
// 'date' kam 2026-08-17 dazu (Nutzer-Befund „ich kann dem wohl keinen Namen
// geben"): der Platzhalter IST der Benenn-Weg — er trägt den Text, den der
// Doppelklick ändert, und er ist der einzige Weg dazu (im Inspector steht der
// Feldname nicht). Ohne ihn war ein Datumsfeld nicht zu benennen und hieß in
// jeder Liste „Formularfeld".
export const MIT_PLATZHALTER: readonly FeldTyp[] = [
  'text', 'number', 'textarea', 'select', 'nachschlagen', 'date',
]

// Zusatzklasse des Platzhalters je Feldtyp — Tabelle statt wachsender
// Ternärkette. Select: Platz für den Pfeil. Datum: der Name weicht dem
// Tippen, weil unter ihm das browsereigene „tt.mm.jjjj" liegt (s. feldStil).
export const PH_KLASSE: Partial<Record<FeldTyp, string>> = {
  select: 'ph-select',
  date: 'ph-datum',
}
