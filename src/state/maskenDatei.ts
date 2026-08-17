import { ROOT_ID, type BlockTree } from '../core/blocks/BlockData'
import { pruefeDatenquellen, type DataSource } from '../core/data/dataSources'
import {
  BEREICH_QUELLEN,
  BEREICH_RELATIONEN,
  mitBereich,
  type EintragProblem,
  type LadeProblem,
} from '../core/data/ladeProblem'
import { pruefeRelationsVorlagen, type RelationTemplate } from '../core/data/relations'
import { keinVerlust, pruefeBaumStand } from './ladeKette'
import { CURRENT_SCHEMA_VERSION } from './migrations'

export const MASKEN_DATEI_ART = 'aufbau-editor-maske'

export const MASKEN_DATEI_VERSION = 2

export interface MaskenInhalt {
  tree: BlockTree
  datenquellen: DataSource[]
  relationen: RelationTemplate[]
}

export type AuspackErgebnis =
  | { ok: true; inhalt: MaskenInhalt; verworfen: Map<string, number> }
  | { ok: false; grund: string; probleme: readonly LadeProblem[] }

function beschaedigtSatz(probleme: readonly LadeProblem[]): string {
  const erstes = probleme[0]?.grund ?? 'der Masken-Aufbau ist unlesbar'
  return `Die Datei ist beschädigt: ${erstes}. Sie wird nicht geladen, damit `
    + 'nicht unbemerkt Teile deiner Maske verlorengehen.'
}

export function packeMaske(inhalt: MaskenInhalt): string {
  return JSON.stringify(
    {
      art: MASKEN_DATEI_ART,
      dateiVersion: MASKEN_DATEI_VERSION,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      tree: inhalt.tree,
      datenquellen: inhalt.datenquellen,
      relationen: inhalt.relationen,
    },
    null,
    2,
  ) + '\n'
}

function bibliothekPruefen<T>(
  roh: unknown,
  pruefe: (raw: unknown) => { liste: T[]; probleme: EintragProblem[] },
  klarname: string,
): { ok: true; liste: T[] } | { ok: false; grund: string; probleme: LadeProblem[] } {
  if (!Array.isArray(roh)) {
    return {
      ok: false,
      grund: `Die Datei ist beschädigt: der Abschnitt „${klarname}" fehlt oder ist unlesbar.`,
      probleme: [{ bereich: klarname, stelle: '', grund: 'der Abschnitt fehlt oder ist unlesbar' }],
    }
  }
  const { liste, probleme } = pruefe(roh)
  if (!keinVerlust(roh, liste)) {
    return {
      ok: false,
      grund: `Die Datei ist beschädigt: im Abschnitt „${klarname}" stimmen Angaben nicht. `
        + 'Sie wird nicht geladen, damit nicht unbemerkt Teile deiner Maske verlorengehen.',

      probleme: mitBereich(klarname, probleme),
    }
  }
  return { ok: true, liste }
}

export function packeMaskeAus(text: string): AuspackErgebnis {
  try {
    return auspacken(text)
  } catch {
    return abgelehnt('Die Datei konnte nicht verarbeitet werden — sie ist vermutlich beschädigt.')
  }
}

function abgelehnt(grund: string): AuspackErgebnis {
  return { ok: false, grund, probleme: [] }
}

function auspacken(text: string): AuspackErgebnis {
  let roh: unknown
  try {
    roh = JSON.parse(text)
  } catch {
    return abgelehnt('Die Datei ist keine gültige JSON-Datei und konnte nicht gelesen werden.')
  }
  if (!roh || typeof roh !== 'object' || Array.isArray(roh)) {
    return abgelehnt('Die Datei enthält keine Maske.')
  }
  const o = roh as Record<string, unknown>

  if (o.art !== MASKEN_DATEI_ART) {
    return abgelehnt(
      'Das ist keine Maskendatei des Aufbau-Editors. (Die exportierten '
      + 'SoftEngine-Dateien lassen sich nicht wieder laden — dafür ist die '
      + 'gespeicherte Maskendatei da.)',
    )
  }

  const dateiVersion = typeof o.dateiVersion === 'number' ? o.dateiVersion : 0
  if (dateiVersion > MASKEN_DATEI_VERSION) {
    return abgelehnt(
      'Diese Datei stammt aus einer neueren Version des Editors und kann hier '
      + 'nicht geladen werden.',
    )
  }
  if (dateiVersion < 1) {
    return abgelehnt('Die Datei ist beschädigt: die Formatangabe fehlt.')
  }

  if (typeof o.schemaVersion !== 'number') {
    return abgelehnt('Die Datei ist beschädigt: die Versionsangabe des Aufbaus fehlt.')
  }
  const schemaVersion = o.schemaVersion

  if (!o.tree || typeof o.tree !== 'object' || Array.isArray(o.tree)) {
    return abgelehnt('Die Datei enthält keinen lesbaren Masken-Aufbau.')
  }
  const wurzel = (o.tree as Record<string, unknown>)[ROOT_ID]
  if (!wurzel || typeof wurzel !== 'object' || Array.isArray(wurzel)
    || !Array.isArray((wurzel as Record<string, unknown>).childIds)) {
    return abgelehnt('Die Datei enthält keinen lesbaren Masken-Aufbau.')
  }

  const stand = pruefeBaumStand({ schemaVersion, tree: o.tree })
  if (stand.art === 'abgelehnt') {
    if (stand.ursache === 'zukunft') {
      return {
        ok: false,
        grund: 'Diese Datei stammt aus einer neueren Version des Editors und kann hier '
          + 'nicht geladen werden.',
        probleme: stand.probleme,
      }
    }
    if (stand.ursache === 'unlesbar') {
      return abgelehnt('Die Datei enthält keinen lesbaren Masken-Aufbau.')
    }

    return { ok: false, grund: beschaedigtSatz(stand.probleme), probleme: stand.probleme }
  }
  const baum = stand.baum

  const quellen = bibliothekPruefen(o.datenquellen, pruefeDatenquellen, BEREICH_QUELLEN)
  if (!quellen.ok) return { ok: false, grund: quellen.grund, probleme: quellen.probleme }
  const relationen = bibliothekPruefen(o.relationen, pruefeRelationsVorlagen, BEREICH_RELATIONEN)
  if (!relationen.ok) return { ok: false, grund: relationen.grund, probleme: relationen.probleme }

  return {
    ok: true,
    inhalt: {
      tree: baum.tree,
      datenquellen: quellen.liste,
      relationen: relationen.liste,
    },

    verworfen: baum.verworfen,
  }
}
