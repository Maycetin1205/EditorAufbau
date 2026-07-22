// zentrale/helfer — gemeinsame Anzeige-Helfer der Steuerung (nur Darstellung;
// die Technikwerte und Vokabulare selbst wohnen in core/data/*).

import type { BlockNode } from '../../core/blocks/BlockData'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import type { PropertySelectOption } from '../../core/blocks/PropertyDescription'
import type { DataSourceKind } from '../../core/data/dataSources'
import type { RelationTemplate } from '../../core/data/relations'

// Klarnamen der Quellen-Arten (der Technikwert `kind` bleibt unsichtbar).
export const KIND_LABELS: Record<DataSourceKind, string> = {
  idb: 'IDB-Tabelle',
  adressstamm: 'Adressstamm',
  artikelstamm: 'Artikelstamm',
  beleg: 'Beleg',
}

// Kürzel für kompakte Listenzeilen (Kontext, kein Anzeigename).
export const VERB_KURZ: Record<RelationTemplate['verb'], string> = {
  GET_RELATION: 'GET',
  PUT_RELATION: 'PUT',
  PUTADD_RELATION: 'PUTADD',
}

// Lesen/Schreiben als Optionen für den gemeinsamen Umschalter (SegmentControl):
// EINE Ablage für beide Stellen — Steuerungs-Filter (RelationenBereich) UND
// Schritt-Vorlagenauswahl (StepForm), Nutzer-Entscheidung 2026-07-22 („Alle"
// gestrichen, nur diese zwei). Die Werte sind die RelationGroup-Schlüssel
// (siehe relationGroup in core/data/relations).
export const RELATION_GRUPPEN: PropertySelectOption[] = [
  { value: 'lesen', label: 'Lesen' },
  { value: 'schreiben', label: 'Schreiben' },
]

// Klartext je Laufzeit-Platzhalter (reine Anzeige — das verbindliche
// Vokabular ist RELATION_PLACEHOLDERS in core/data/relations).
export const PLATZHALTER_KLARTEXT: Record<string, string> = {
  FELD_POS: 'Feld-Position (aus dem gebundenen Feld)',
  FELD_LEN: 'Feld-Länge (aus dem gebundenen Feld)',
  PINDEX: 'Nummer des Datensatzes',
  SELKEY: 'Schlüssel der gewählten Zeile',
  DROP_PINDEX: 'Nummer des Ziel-Datensatzes beim Ablegen',
  RELID: 'Tabellen-ID der Datenquelle (ohne IDB-Präfix)',
  VALUE: 'Neuer Wert (z. B. Titel der Zielspalte)',
  NOW_DATE: 'Heutiges Datum',
}

// Bedeutung eines Relations-Parameters in Klartext: gefundene Platzhalter
// werden erklärt, ein Parameter ohne Platzhalter ist ein fester Wert.
export function parameterBedeutung(param: string): string {
  if (param === '') return 'Leerer Parameter (Position bleibt erhalten)'
  const gefunden = [...param.matchAll(/\{([^}]+)\}/g)].map((m) => m[1])
  if (gefunden.length === 0) return 'Fester Wert'
  return gefunden
    .map((name) => PLATZHALTER_KLARTEXT[name] ?? `Eigener Platzhalter {${name}}`)
    .join(' · ')
}

// Der Anzeigename allein ist für mehrere gleichartige Bausteine nicht
// eindeutig — ein kurzer Eigentext macht Listeneinträge sprechend.
// `placeholder` gehört dazu: das Formularfeld trägt seinen Namen dort
// („Vorname"), nicht in label/heading/title/text.
const TEXT_PROPS = ['label', 'heading', 'title', 'text', 'placeholder'] as const

// `defaults` (die Registry-Default-Props des Bausteins) sind optional: ist ein
// Text noch unverändert Default (z. B. das Formularfeld-„Feldname"), gilt er
// NICHT als Eigenname — dann bleibt der Baustein-Typ der Anzeigename. Das
// läuft generisch über die Defaults, nicht an „Feldname" verdrahtet (Regel 2).
export function eigenerText(
  props: Record<string, unknown>,
  defaults?: Record<string, unknown>,
): string {
  for (const key of TEXT_PROPS) {
    const value = props[key]
    if (typeof value !== 'string' || value.trim() === '') continue
    if (defaults && value === defaults[key]) continue
    const text = value.trim()
    return text.length > 28 ? `${text.slice(0, 27)}…` : text
  }
  return ''
}

// Sprechender Name eines Bausteins für Listen: Anzeigename + Eigentext.
export function bausteinName(node: BlockNode): string {
  const def = getBlockDefinition(node.type)
  const basis = def?.displayName ?? node.type
  const text = eigenerText(node.props, def?.defaultProps)
  return text === '' ? basis : `${basis} — ${text}`
}
