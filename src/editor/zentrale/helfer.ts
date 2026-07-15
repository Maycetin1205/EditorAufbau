// zentrale/helfer — gemeinsame Anzeige-Helfer der Steuerung (nur Darstellung;
// die Technikwerte und Vokabulare selbst wohnen in core/data/*).

import type { BlockNode } from '../../core/blocks/BlockData'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import type { DataSourceKind } from '../../core/data/dataSources'
import type { RelationTemplate } from '../../core/data/relations'

// Klarnamen der Quellen-Arten (der Technikwert `kind` bleibt unsichtbar).
export const KIND_LABELS: Record<DataSourceKind, string> = {
  idb: 'IDB-Tabelle',
  adressstamm: 'Adressstamm',
  artikelstamm: 'Artikelstamm',
  beleg: 'Beleg',
}

// Klarnamen der Verben (der SoftEngine-Techniker kennt GET/PUT — darum das
// Kürzel in Klammern; gespeichert wird der Technikwert `verb`).
export const VERB_LABELS: Record<RelationTemplate['verb'], string> = {
  GET_RELATION: 'Lesen (GET)',
  PUT_RELATION: 'Schreiben (PUT)',
  PUTADD_RELATION: 'Anhängen (PUTADD)',
}

// Kürzel für kompakte Listenzeilen (Kontext, kein Anzeigename).
export const VERB_KURZ: Record<RelationTemplate['verb'], string> = {
  GET_RELATION: 'GET',
  PUT_RELATION: 'PUT',
  PUTADD_RELATION: 'PUTADD',
}

// Klartext je Laufzeit-Platzhalter (reine Anzeige — das verbindliche
// Vokabular ist RELATION_PLACEHOLDERS in core/data/relations).
export const PLATZHALTER_KLARTEXT: Record<string, string> = {
  FELD_POS: 'Feld-Position (aus dem gebundenen Feld)',
  FELD_LEN: 'Feld-Länge (aus dem gebundenen Feld)',
  PINDEX: 'Satznummer der Zeile',
  SELKEY: 'Schlüssel der gewählten Zeile',
  DROP_PINDEX: 'Satznummer der Ziel-Zeile beim Ablegen',
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
const TEXT_PROPS = ['label', 'heading', 'title', 'text'] as const

export function eigenerText(props: Record<string, unknown>): string {
  for (const key of TEXT_PROPS) {
    const value = props[key]
    if (typeof value === 'string' && value.trim() !== '') {
      const text = value.trim()
      return text.length > 28 ? `${text.slice(0, 27)}…` : text
    }
  }
  return ''
}

// Sprechender Name eines Bausteins für Listen: Anzeigename + Eigentext.
export function bausteinName(node: BlockNode): string {
  const def = getBlockDefinition(node.type)
  const basis = def?.displayName ?? node.type
  const text = eigenerText(node.props)
  return text === '' ? basis : `${basis} — ${text}`
}
