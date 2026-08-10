// maskenDatei — DIE eine Stelle, die das Dateiformat einer Maske kennt.
//
// Warum es das gibt: die Arbeit des Bedieners lebte bis 2026-07-28
// AUSSCHLIESSLICH im Browser-Speicher. Ein geleerter Browser, ein zweiter
// Rechner, ein anderes Profil — und alles war weg. Der Export ist KEIN
// Ersatz: index.basis.source.html + SEvariablen sind das Ergebnis fuer
// SoftEngine, eine Einbahnstrasse, aus der nie wieder ein Bauplan wird.
//
// Diese Datei ist der Bauplan: Baum + die zwei Bibliotheken (Datenquellen,
// Relationen). Der Editor kann sie schreiben und wieder einlesen.
//
// GRUNDSATZ „ein Pruef-Eingang, zwei Quellen": der Baum laeuft hier durch
// DIESELBE Lade-Kette wie der Browser-Speicher (ladeKette.baumAusRohdaten)
// — inklusive Migrationen UND inklusive der Verlust-Pruefungen, die seit
// 2026-08-10 ebenfalls dort wohnen. Zwei eigene Ketten wuerden
// auseinanderdriften; genau diese Doppelung hat den Tabellen-Bug 2026-07-24
// erzeugt.
//
// GRUNDSATZ „alles oder nichts": geprueft wird die GANZE Datei, bevor der
// Aufrufer irgendetwas ersetzt. Eine ungueltige Datei aendert am offenen
// Stand nichts. (Was NICHT zugesagt werden kann: dass die drei
// Speicherwege — Maske + zwei Bibliotheken — gemeinsam auf die Platte
// kommen. Sie schreiben seit jeher einzeln; ein Journal waere ein eigener
// Umbau ohne Anlass, Regel 10.)

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

// Erkennungsmarke. Waehlt der Bediener versehentlich
// index.basis.SEvariablen.json, sagt der Editor das in Klartext, statt
// Unsinn zu laden.
export const MASKEN_DATEI_ART = 'aufbau-editor-maske'

// Format-Version der DATEI (nicht des Baums — der hat schemaVersion).
// Erlaubt spaetere Aenderungen am Rahmen, ohne zu raten.
//
// Version 2 (2026-07-30): der Abschnitt „verknuepfungen" entfaellt — die
// Bibliotheks-Verknuepfung ist entfernt, die Schluesselregel haengt am
// Baustein (`weitereQuellen` in den Block-Props, reist im Baum mit).
// Version-1-Dateien laden weiter; ihr verknuepfungen-Abschnitt wird beim
// Lesen angenommen und bewusst verworfen (s. auspacken).
export const MASKEN_DATEI_VERSION = 2

export interface MaskenInhalt {
  tree: BlockTree
  datenquellen: DataSource[]
  relationen: RelationTemplate[]
}

// Ergebnis des Auspackens: entweder heil ODER ein Klartext-Grund samt
// Problemliste (A3 — der Bediener soll nicht nur „beschädigt" lesen, sondern
// WELCHER Eintrag und WARUM).
// Bewusst kein Wurf — eine handgepfuschte Datei darf den Editor nie anhalten.
export type AuspackErgebnis =
  | { ok: true; inhalt: MaskenInhalt; verworfen: Map<string, number> }
  | { ok: false; grund: string; probleme: readonly LadeProblem[] }

// Der Satz, in den ein Fund fuer den DATEI-Weg gegossen wird. Die Funde
// selbst sind neutral formuliert (ladeKette.LadeProblem) — dieselben Funde
// zeigt am Browser-Weg die Sperransicht, wo von einer Datei keine Rede ist.
function beschaedigtSatz(probleme: readonly LadeProblem[]): string {
  const erstes = probleme[0]?.grund ?? 'der Masken-Aufbau ist unlesbar'
  return `Die Datei ist beschädigt: ${erstes}. Sie wird nicht geladen, damit `
    + 'nicht unbemerkt Teile deiner Maske verlorengehen.'
}

// ---------- Packen ----------

// Feste Schluesselreihenfolge + zwei Leerzeichen Einrueckung: zweimal
// speichern ohne Aenderung ergibt dieselbe Datei (nachvollziehbare Diffs,
// vergleichbare Sicherungen).
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

// ---------- Auspacken ----------

// Eine Bibliothek pruefen: bereinigen — und danach nachsehen, ob dabei etwas
// verlorengegangen ist.
//
// VERGLICHEN wird, nicht gezaehlt: `fields: "kaputt"` wird zu `[]`, ohne dass
// sich eine Zahl aendert, und ein numerisches `idbId` verschwindet voellig
// lautlos. Eine Datei haben WIR aus bereits bereinigten Daten geschrieben —
// sie muss die Bereinigung also ohne Verlust ueberstehen. Tut sie das nicht,
// wurde sie beschaedigt oder von Hand verbogen und wird NICHT geladen, statt
// still um ein paar Angaben erleichtert zu werden.
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
      // Das KRITERIUM ist der Vergleich (keinVerlust), nicht die Meldung des
      // Sanitizers — Begruendung an `mitBereich`. Die Meldungen liefern das
      // DETAIL: welcher Eintrag, warum.
      probleme: mitBereich(klarname, probleme),
    }
  }
  return { ok: true, liste }
}

// Aussenmantel: faengt ALLES ab. Nicht nur JSON.parse kann werfen — auch
// Migrationen und `sanitizeTree` (rekursiv) koennen es, etwa bei einem
// absurd tief verschachtelten Baum. Ohne diesen Mantel endete so eine Datei
// mit einem rohen Absturz statt mit Klartext.
export function packeMaskeAus(text: string): AuspackErgebnis {
  try {
    return auspacken(text)
  } catch {
    return abgelehnt('Die Datei konnte nicht verarbeitet werden — sie ist vermutlich beschädigt.')
  }
}

// Abgelehnt am RAHMEN der Datei (Marke, Formatangabe, Grundgeruest): hier gibt
// es keine einzelne Stelle zu nennen, der Satz sagt schon alles. Die
// Problemliste bleibt daher leer — sie wird nicht mit einer Wiederholung des
// Satzes gefuellt.
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

  // Aus der ZUKUNFT: ein aelterer Editor wuerde die Migrationen ueberspringen
  // und anschliessend alles, was er nicht kennt, als „unbekannt" wegwerfen —
  // also still Arbeit vernichten, die er nur nicht versteht.
  // Das gilt fuer die Form der DATEI (hier) wie fuer die Version des AUFBAUS
  // (die prueft die geteilte Kette weiter unten, damit Datei und
  // Browser-Speicher dieselbe Versionspolitik haben).
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

  // Pflichtangaben werden VERLANGT, nicht grosszuegig ergaenzt. Wer eine
  // fehlende `schemaVersion` zu 1 macht, fehlende Bibliotheken zu leeren
  // Listen und `tree: {}` zu einem leeren Baum, laedt eine formal markierte,
  // aber ausgehoehlte Datei „erfolgreich" und leert dabei den GESAMTEN
  // offenen Stand — genau der Schaden, den diese Funktion verhindern soll.
  if (typeof o.schemaVersion !== 'number') {
    return abgelehnt('Die Datei ist beschädigt: die Versionsangabe des Aufbaus fehlt.')
  }
  const schemaVersion = o.schemaVersion
  // Der Baum MUSS eine BRAUCHBARE Wurzel mitbringen. Eine leere Maske ist
  // erlaubt (die Wurzel steht dann ohne Kinder da) — ein fehlender oder
  // kaputter Baum nicht.
  //
  // Es reicht NICHT, den Schluessel `root` zu suchen: `tree: { root: null }`
  // kaeme durch und wuerde anschliessend zu einer leeren Maske normalisiert
  // — wieder der Fall „Datei laedt erfolgreich und leert alles".
  if (!o.tree || typeof o.tree !== 'object' || Array.isArray(o.tree)) {
    return abgelehnt('Die Datei enthält keinen lesbaren Masken-Aufbau.')
  }
  const wurzel = (o.tree as Record<string, unknown>)[ROOT_ID]
  if (!wurzel || typeof wurzel !== 'object' || Array.isArray(wurzel)
    || !Array.isArray((wurzel as Record<string, unknown>).childIds)) {
    return abgelehnt('Die Datei enthält keinen lesbaren Masken-Aufbau.')
  }

  // Ab hier laeuft die GETEILTE Lade-Kette (ladeKette.pruefeBaumStand) in
  // ihrer festen Reihenfolge: Zukunftsversion abweisen, migrieren +
  // bereinigen, gegen den heutigen Vertrag pruefen. Der Datei-Weg laesst
  // dabei KEINEN Teilverlust durch — die Datei ist nur ein KANDIDAT (A3):
  // wird sie abgelehnt, bleibt die offene Sitzung unangetastet, inklusive
  // ihrer Autosaves. Gemeinsames Pruef-Ergebnis, eigene Aufrufer-Politik.
  //
  // Den Demotext-Putzer steuert die Kette selbst (feste historische Grenze
  // aus A2) — die Ableitung stand vorher an beiden Wegen getrennt im Code.
  const stand = pruefeBaumStand({ schemaVersion, tree: o.tree })
  if (stand.art === 'quarantaene') {
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
    // Teilverlust: die Kette nennt die Stellen, der Satz drumherum ist der
    // Datei-Satz von 2026-07-28.
    return { ok: false, grund: beschaedigtSatz(stand.probleme), probleme: stand.probleme }
  }
  const baum = stand.baum

  const quellen = bibliothekPruefen(o.datenquellen, pruefeDatenquellen, BEREICH_QUELLEN)
  if (!quellen.ok) return { ok: false, grund: quellen.grund, probleme: quellen.probleme }
  const relationen = bibliothekPruefen(o.relationen, pruefeRelationsVorlagen, BEREICH_RELATIONEN)
  if (!relationen.ok) return { ok: false, grund: relationen.grund, probleme: relationen.probleme }

  // Ein „verknuepfungen"-Abschnitt (Dateiversion 1) wird AUSDRUECKLICH
  // angenommen und verworfen — ohne Verlust-Kontrolle, anders als die zwei
  // Bibliotheken oben. Die Bibliotheks-Verknuepfung ist am 2026-07-30
  // entfernt (die Schluesselregel haengt am Baustein, `weitereQuellen`),
  // und der Abschnitt hat nie etwas bewirkt: kein Produktivcode hat ihn je
  // gelesen. Es geht also nichts verloren, was je gewirkt hat — eine
  // Version-1-Datei laedt vollstaendig, nur dieser tote Abschnitt faellt weg.

  return {
    ok: true,
    inhalt: {
      tree: baum.tree,
      datenquellen: quellen.liste,
      relationen: relationen.liste,
    },
    // Der Aufrufer zeigt das ERST, wenn wirklich geladen wurde.
    verworfen: baum.verworfen,
  }
}
