// bausteinName — DER eine Klarname eines Bausteins.
//
// „Formularfeld" ist der Name des BAUSTEINTYPS. Sobald eine Maske fuenf davon
// traegt, sagt er nichts mehr: der Bediener hat sie „Kunde", „Haustier",
// „Bemerkung" genannt (Doppelklick am Baustein), und genau diese Namen muss
// jede Liste und jede Meldung zeigen (Regel 3 — sichtbar sind Klarnamen).
//
// Warum das hier in core/blocks wohnt und nicht im Editor (2026-08-06,
// Nutzer-Meldung): die Export-Preflight nennt in ihren Meldungen Bausteine —
// „Baustein Formularfeld: Gespeichert wird ist leer". Bei mehreren Feldern war
// nicht zu erkennen, WELCHES gemeint ist. Sie kann den Namen aber nur zeigen,
// wenn er nicht in der Editor-Schicht steckt (die Export-Schicht darf den
// Editor nicht kennen). Also EINE Stelle fuer beide: Inspector-Kopf,
// Steuerungs-Listen, Auswahl-Sektion UND Preflight-Meldungen.
//
// Rein: Props + Registry rein, Text raus. Kein Store, kein DOM, kein
// Bausteintyp-Wissen (Regel 2) — welche Props einen Eigennamen tragen KOENNEN,
// steht als Liste unten, nicht als `if type ===`.

import type { BlockNode } from './BlockData'
import { getBlockDefinition } from './blockRegistry'

// Der Anzeigename allein ist fuer mehrere gleichartige Bausteine nicht
// eindeutig — ein kurzer Eigentext macht Listeneintraege sprechend.
// `placeholder` gehoert dazu: das Formularfeld traegt seinen Namen dort
// („Vorname"), nicht in label/heading/title/text.
const TEXT_PROPS = ['label', 'heading', 'title', 'text', 'placeholder'] as const

// Laenge, ab der gekuerzt wird — ein Listeneintrag soll eine Zeile bleiben.
const MAX_LAENGE = 28

// `defaults` (die Registry-Default-Props des Bausteins) sind optional: ist ein
// Text noch unveraendert Default (z. B. das Formularfeld-„Feldname"), gilt er
// NICHT als Eigenname — dann bleibt der Baustein-Typ der Anzeigename. Das
// laeuft generisch ueber die Defaults, nicht an „Feldname" verdrahtet (Regel 2).
export function eigenerText(
  props: Record<string, unknown>,
  defaults?: Record<string, unknown>,
): string {
  for (const key of TEXT_PROPS) {
    const value = props[key]
    if (typeof value !== 'string' || value.trim() === '') continue
    if (defaults && value === defaults[key]) continue
    const text = value.trim()
    return text.length > MAX_LAENGE ? `${text.slice(0, MAX_LAENGE - 1)}…` : text
  }
  return ''
}

// Sprechender Name eines Bausteins: der EIGENE Text, sobald es einen gibt
// („Kunde"). Erst ohne Eigentext tritt der Typname ein („Formularfeld").
//
// Bis 2026-08-10 stand der Typname immer davor („Formularfeld — Kunde").
// Nutzer-Ansage an diesem Tag: ein Feld, das er „Kunde" genannt hat, heisst
// in jeder Liste „Kunde" — der Typ steht schon im Symbol daneben und wird in
// einer Maske mit fuenf Feldern zur Wiederholung, die den Namen wegdraengt.
export function bausteinName(node: BlockNode): string {
  const def = getBlockDefinition(node.type)
  const text = eigenerText(node.props, def?.defaultProps)
  return text === '' ? (def?.displayName ?? node.type) : text
}
