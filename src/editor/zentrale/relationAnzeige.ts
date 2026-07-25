// relationAnzeige — DIE eine Stelle für den Anzeigenamen einer
// Relations-Vorlage in Listen und Schritt-Zeilen.
// Ungetaufte Vorlagen (kein Name, oder der Name IST die Syntax — typisch
// bei importierten Vorlagen) zeigen „<VERB> · Nr. <nr>" statt der
// Syntax-Wurst: Die volle Syntax ist NIE Anzeigename (Regel 3) — sie
// bleibt Suchtreffer und Hover-Tooltip. Die SE-Verben selbst sind die
// beschlossenen Anzeige-Namen (Entscheidung 2026-07-15).

import { formatRelationSyntax, type RelationTemplate } from '../../core/data/relations'

export function istUngetaufteVorlage(entry: RelationTemplate): boolean {
  const name = entry.name.trim()
  return name === ''
    || name === formatRelationSyntax(entry)
    || name.startsWith(`${entry.verb}[`)
}

export function relationAnzeige(entry: RelationTemplate): string {
  return istUngetaufteVorlage(entry) ? `${entry.verb} · Nr. ${entry.nr}` : entry.name
}
