// schrittZusammenfassung — was EIN Schritt einer Aktionskette TUT, in einer
// Zeile Klartext.
//
// Der Anlass (Nutzer-Befund 2026-08-17, mit Bildschirmfoto): eine Kette aus
// elf Schritten stand elfmal als „Relation — Standard-Schreiben (PUT)" da.
// Welcher Schritt welches Feld schreibt, war nur durch Aufmachen jedes
// einzelnen zu erfahren. Der Vorlagenname ist bei allen derselbe —
// unterschiedlich sind die PARAMETER.
//
// Zwei Angaben unterscheiden sie, und beide stehen im Schritt selbst:
//   ZIEL     welches Feld beschrieben wird  ({FELD_POS} + {FELD_LEN})
//   HERKUNFT woher der Wert kommt           ({VALUE})
//
// Nichts davon wird geraten. Gelesen wird das Platzhalter-Vokabular, das die
// Relations-Bibliothek ohnehin fuehrt (RELATION_PLACEHOLDERS) — keine
// Relationsnummer, kein Bausteintyp, kein Sondercode (Regel 2). Eine eigene
// Vorlage mit denselben Platzhaltern wird genauso beschriftet.
//
// Laesst sich eine Angabe NICHT aufloesen, bleibt sie leer statt zu behaupten:
// eine halbe Zeile ist ehrlich, eine erfundene ist es nicht (Regel 7).

import type { BlockTree } from '../../core/blocks/BlockData'
import { bausteinName } from '../../core/blocks/bausteinName'
import type { ActionParamBinding, ActionStep } from '../../core/data/aktionen'
import {
  quellenKennung,
  tableIdFor,
  type DataSource,
} from '../../core/data/dataSources'
import {
  relIdFromIdbId,
  splitFieldCode,
  type RelationTemplate,
} from '../../core/data/relations'
import { feldUebernahmeArt } from './feldUebernahme'

export interface SchrittZusammenfassung {
  // Was der Schritt tut — der Vorlagen- bzw. Schritt-Name wie bisher.
  was: string
  // Das beschriebene Feld in Klarnamen ('' = nicht aufloesbar).
  ziel: string
  // Woher der Wert kommt, in Klarnamen ('' = keine Wert-Stelle/nicht gesetzt).
  herkunft: string
  // Die Tabelle, in die geschrieben wird ('' = nicht aufloesbar). Sie traegt
  // die Zeile bei Schritten OHNE Zielfeld — etwa „neuen Satz anlegen".
  tabelle: string
}

// Der feste Wert eines Parameters ('' = nicht fest gesetzt). Nur ein FESTER
// Wert taugt zum Nachschlagen: alles andere entsteht erst zur Laufzeit.
function festerWert(binding: ActionParamBinding | undefined): string {
  return binding?.source === 'fixed' ? binding.value.trim() : ''
}

// Die Quelle, in die dieser Schritt schreibt — abgelesen am {RELID}-Parameter.
// Ihn fuellt die Feld-Uebernahme mit der Tabellen-ID ohne IDB-Vorsatz
// ('ID0021'), also ist er der direkte Weg zurueck zur Quelle.
function quelleAusRelId(
  relation: RelationTemplate,
  params: readonly ActionParamBinding[],
  quellen: readonly DataSource[],
): DataSource | undefined {
  const index = relation.params.findIndex((p) => feldUebernahmeArt(p) === 'relid')
  const wert = index < 0 ? '' : festerWert(params[index])
  if (wert === '') return undefined
  return quellen.find((q) => relIdFromIdbId(tableIdFor(q)) === wert)
}

// Der Feldcode, den dieser Schritt beschreibt — aus {FELD_POS} + {FELD_LEN}.
// Nur wenn BEIDE fest sind: mit einer Haelfte liesse sich nichts nachschlagen.
function feldcodeAusParams(
  relation: RelationTemplate,
  params: readonly ActionParamBinding[],
): string {
  let pos = ''
  let len = ''
  relation.params.forEach((p, i) => {
    const art = feldUebernahmeArt(p)
    if (art === 'pos') pos = festerWert(params[i])
    else if (art === 'len') len = festerWert(params[i])
  })
  return pos !== '' && len !== '' ? `${pos}_${len}` : ''
}

// Klarname eines Feldcodes. Erste Wahl ist die Quelle, die der Schritt selbst
// nennt. Ohne sie wird die Bibliothek befragt — aber nur, wenn GENAU EINE
// Quelle den Code kennt: derselbe Code bedeutet in zwei Tabellen
// Verschiedenes, und die erste zu nehmen zeigte den falschen Namen.
function klarnameFuerCode(
  code: string,
  quelle: DataSource | undefined,
  quellen: readonly DataSource[],
): string {
  if (code === '') return ''
  const eigen = quelle?.fields.find((f) => f.code === code)
  if (eigen) return eigen.label
  if (quelle) return ''
  const treffer = quellen.filter((q) => q.fields.some((f) => f.code === code))
  return treffer.length === 1
    ? (treffer[0].fields.find((f) => f.code === code)?.label ?? '')
    : ''
}

// Woher der Wert einer Bindung kommt, in Klarnamen. Dieselben Woerter wie im
// Formular (ParameterZeile) — zwei Vokabulare fuer dasselbe waeren zwei
// Wahrheiten.
function herkunftText(
  binding: ActionParamBinding | undefined,
  tree: BlockTree,
  quellen: readonly DataSource[],
  schrittNr: (id: string) => number,
): string {
  if (!binding) return ''
  switch (binding.source) {
    case 'fixed':
      return binding.value.trim() === '' ? '' : `Fest: ${binding.value.trim()}`
    case 'context':
      return binding.value === '' ? '' : binding.value
    case 'se_variable':
      return binding.value === '' ? '' : `SE VAR ${binding.value}`
    case 'previous_result':
      return 'Vorheriger Schritt'
    case 'aus':
      return 'leer'
    case 'step_result': {
      const nr = schrittNr(binding.value)
      return nr > 0 ? `Ergebnis von Schritt ${nr}` : 'Ergebnis von Schritt'
    }
    case 'data_field': {
      const quelle = quellen.find((q) => q.id === binding.dataSourceId)
      const feld = quelle?.fields.find((f) => f.code === binding.value)?.label ?? ''
      if (!quelle) return ''
      return feld === '' ? quelle.name : `${quelle.name} · ${feld}`
    }
    case 'gewaehlte_zeile': {
      const knoten = binding.blockId ? tree[binding.blockId] : undefined
      const feld = klarnameFuerCode(binding.value, undefined, quellen)
      const wer = knoten ? bausteinName(knoten, quellen) : 'Gewählte Zeile'
      return feld === '' ? `Gewählte Zeile · ${wer}` : `${wer} · ${feld}`
    }
    case 'block_value': {
      const knoten = binding.blockId ? tree[binding.blockId] : undefined
      return knoten ? `Baustein „${bausteinName(knoten, quellen)}“` : ''
    }
    default:
      return ''
  }
}

// Der Parameter, der den zu schreibenden WERT traegt. Erkannt am Platzhalter
// {VALUE} — dem einzigen aus dem Vokabular, der „hier steht der Nutzwert"
// bedeutet.
function wertBinding(
  relation: RelationTemplate,
  params: readonly ActionParamBinding[],
): ActionParamBinding | undefined {
  const index = relation.params.findIndex((p) => p.trim().toUpperCase() === '{VALUE}')
  return index < 0 ? undefined : params[index]
}

export function schrittZusammenfassung(
  step: ActionStep,
  was: string,
  relation: RelationTemplate | undefined,
  tree: BlockTree,
  quellen: readonly DataSource[],
  // Anzeige-Position eines Schritts in DERSELBEN Kette (0 = nicht gefunden).
  schrittNr: (id: string) => number,
): SchrittZusammenfassung {
  const leer: SchrittZusammenfassung = { was, ziel: '', herkunft: '', tabelle: '' }
  if (step.type !== 'RELATION' || !relation) return leer

  const quelle = quelleAusRelId(relation, step.params, quellen)
  const code = feldcodeAusParams(relation, step.params)
  return {
    was,
    ziel: klarnameFuerCode(code, quelle, quellen)
      // Kein Klarname, aber ein Code: den Code zeigen. Er sagt weniger als ein
      // Name, aber mehr als nichts — und er unterscheidet die Zeilen.
      || (code !== '' && splitFieldCode(code) ? code : ''),
    herkunft: herkunftText(wertBinding(relation, step.params), tree, quellen, schrittNr),
    tabelle: quelle ? `${quelle.name} · ${quellenKennung(quelle)}` : '',
  }
}

// Der Schritt, auf dessen ERGEBNIS sich dieser beruft ('' = keiner). Damit
// zeigt die Liste, welche Schreib-Schritte in den Satz gehen, den ein
// „neuen Satz anlegen" davor erzeugt hat.
export function ankerSchrittId(step: ActionStep): string {
  if (step.type !== 'RELATION') return ''
  for (const b of [...step.params, ...step.extraParams]) {
    if (b.source === 'step_result' && b.value !== '') return b.value
  }
  return ''
}
