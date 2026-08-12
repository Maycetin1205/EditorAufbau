// zentrale/helfer — gemeinsame Anzeige-Helfer der Steuerung (nur Darstellung;
// die Technikwerte und Vokabulare selbst wohnen in core/data/*).

import { Boxes, Database, FileText, Users } from '@/ui/zeichen'
import type { BlockNode } from '../../core/blocks/BlockData'
import { bausteinName } from '../../core/blocks/bausteinName'
import type { PropertySelectOption } from '../../core/blocks/PropertyDescription'
import { auswahlQuelleIdVon } from '../../core/blocks/treeQuery'
import type { DataSource, DataSourceField, DataSourceKind } from '../../core/data/dataSources'
import type { RelationTemplate } from '../../core/data/relations'

// Der Klarname einer Quellen-Art steht NICHT mehr hier, sondern in der
// Arten-Tabelle (core/data/quellenArten — `artFuer(kind).name`), zusammen mit
// allem anderen, was die Art ausmacht. Diese Datei liefert nur noch, was
// reine Editor-Optik ist: das Bild.

// Ein Bild je Art, damit der Bediener dieselbe Quelle in Liste und Detail
// wiedererkennt. Bewusst mit Rückfall: eine neue Art bleibt bedienbar, auch
// wenn hier niemand ein Bild nachträgt.
const KIND_ICONS: Partial<Record<DataSourceKind, typeof Database>> = {
  idb: Database,
  adressstamm: Users,
  artikelstamm: Boxes,
  beleg: FileText,
}

export function ikonFuer(kind: DataSourceKind): typeof Database {
  return KIND_ICONS[kind] ?? Database
}

// Kürzel für kompakte Listenzeilen (Kontext, kein Anzeigename).
export const VERB_KURZ: Record<RelationTemplate['verb'], string> = {
  GET_RELATION: 'GET',
  PUT_RELATION: 'PUT',
  PUTADD_RELATION: 'PUTADD',
}

// Die Lösch-Rückfrage der beiden Bibliotheken (Datenquellen, Relationen).
// Bis U3 (2026-08-12) stand sie zweimal Wort für Wort da, mit demselben
// Doppel-Fall: wird der Eintrag in der Maske BENUTZT, sagt die Frage das
// deutlich und nennt die Folge — sonst fragt sie schlicht.
//
// Sie ist der einzige window.confirm-Rest im Datencenter und bleibt vorerst
// blockierend (U0-3, Nutzer-Entscheidung 2026-08-12): anders als beim
// Baustein-Löschen gibt es hier kein Undo.
//
// `folge` ist der eine Unterschied zwischen den zwei Aufrufern — was am
// Baustein weiterlebt, wenn seine Vorlage verschwindet.
export function bestaetigeLoeschen(
  art: string,
  name: string,
  benutzt: boolean,
  folge: string,
): boolean {
  return window.confirm(
    benutzt
      ? `„${name}" wird in der Maske BENUTZT. Trotzdem löschen? ${folge}`
      : `${art} „${name}" löschen?`,
  )
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

// Der Klarname eines Bausteins („Formularfeld — Kunde") wohnte bis 2026-08-06
// hier. Er ist nach core/blocks/bausteinName gezogen, weil die Export-Preflight
// in ihren Meldungen dieselben Namen nennt und die Editor-Schicht nicht kennen
// darf. Bewusst KEIN Weiterreichen von hier: eine Durchreiche-Schicht macht aus
// einer Quelle wieder zwei Adressen. Alle Aufrufer holen ihn direkt dort.

// Ein auslesbarer Bausteinwert als Auswahl-Eintrag (Registry: actionValueSpots).
export interface BlockValueOption {
  key: string
  blockId: string
  prop: string
  label: string
}

// Stabiler Schlüssel für die Auswahl. Baustein-id und Prop können beliebige
// Zeichen tragen, deshalb kodiert — sonst kollidiert ein Doppelpunkt im Wert
// mit dem Trennzeichen. Wohnt hier statt bei der Parameterzeile, weil eine
// Datei mit React-Komponenten nichts anderes exportieren soll (Fast Refresh).
export function blockValueKey(blockId: string, prop: string): string {
  return `${encodeURIComponent(blockId)}:${encodeURIComponent(prop)}`
}

// Ein Auswahl-GEBER als Auswahl-Eintrag der Parameterquelle „Feld der
// gewählten Zeile" (2026-08-06). `felder` sind die Felder SEINER Quelle —
// die gewählte Zeile stammt von dort, also stehen auch nur deren Feldcodes
// zur Wahl. Ohne Quelle bleibt die Liste leer (nichts zu raten).
export interface AuswahlGeberOption {
  blockId: string
  label: string
  felder: readonly DataSourceField[]
}

// Die Geber-Einträge bauen: Klarname des Bausteins plus Quellen-Name zur
// Unterscheidung — zwei Tabellen heißen sonst beide nur „Tabelle" (dieselbe
// Anzeige-Regel wie in der Inspector-Sektion „Auswahl folgen").
export function auswahlGeberOptionen(
  geber: readonly BlockNode[],
  sources: readonly DataSource[],
): AuswahlGeberOption[] {
  return geber.map((node) => {
    // Die Quelle, aus der der gewaehlte Satz STAMMT (auswahlQuelleIdVon) — beim
    // Nachschlage-Feld seine Nachschlage-Quelle, nicht die eigene. Mit den
    // Feldcodes der falschen Tabelle laesen die Ketten-Parameter still nichts.
    const quelle = sources.find((s) => s.id === auswahlQuelleIdVon(node))
    return {
      blockId: node.id,
      label: quelle ? `${bausteinName(node)} (${quelle.name})` : bausteinName(node),
      felder: quelle?.fields ?? [],
    }
  })
}
