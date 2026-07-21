// blockHinweise — Baustein-Typ -> EINE gedämpfte Hinweiszeile im Inspector.
//
// Reine Editor-seitige Zuordnungstabelle (Muster blockIcons/optionColors;
// Regel 2: Daten-Tabelle statt `if typ === …`). Nur für Bausteine, deren
// Inspector sonst leer oder fast leer aussieht („kaputt-leer", Nutzer
// 2026-07-21) — der Hinweis sagt, WO die Bedienung stattdessen stattfindet
// (Regel 7: Bedienung am Ding). Kein Tutorial-Text, genau ein Satz.

const HINWEISE: Record<string, string> = {
  card: 'Alle Inhalte bearbeitest du direkt auf der Karte — Doppelklick auf die Stelle.',
  trenner: 'Keine Einstellungen — die Linie füllt die Breite von selbst.',
  zeile: 'Keine Einstellungen — Bausteine ziehst du direkt in die Zeile.',
}

export function blockHinweis(type: string): string | undefined {
  return HINWEISE[type]
}
