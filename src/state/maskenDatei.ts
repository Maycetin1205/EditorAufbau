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
// DIESELBE Lade-Kette wie der Browser-Speicher (persistence.baumAusRohdaten)
// — inklusive Migrationen. Zwei eigene Ketten wuerden auseinanderdriften;
// genau diese Doppelung hat den Tabellen-Bug 2026-07-24 erzeugt.
//
// GRUNDSATZ „alles oder nichts": geprueft wird die GANZE Datei, bevor der
// Aufrufer irgendetwas ersetzt. Eine ungueltige Datei aendert am offenen
// Stand nichts. (Was NICHT zugesagt werden kann: dass die drei
// Speicherwege — Maske + zwei Bibliotheken — gemeinsam auf die Platte
// kommen. Sie schreiben seit jeher einzeln; ein Journal waere ein eigener
// Umbau ohne Anlass, Regel 10.)

import { ROOT_ID, type BlockTree } from '../core/blocks/BlockData'
import { sanitizeDataSources, type DataSource } from '../core/data/dataSources'
import { sanitizeRelationTemplates, type RelationTemplate } from '../core/data/relations'
import { CURRENT_SCHEMA_VERSION, DEMO_CLEANUP_BEFORE_SCHEMA } from './migrations'
import { baumAusRohdaten } from './persistence'

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

// Ergebnis des Auspackens: entweder heil ODER ein Klartext-Grund.
// Bewusst kein Wurf — eine handgepfuschte Datei darf den Editor nie anhalten.
export type AuspackErgebnis =
  | { ok: true; inhalt: MaskenInhalt; verworfen: Map<string, number> }
  | { ok: false; grund: string }

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

// Ist beim Bereinigen NICHTS verlorengegangen?
//
// Geprueft wird nur EINE Richtung: jede Angabe, die in der Datei stand, muss
// unveraendert im Ergebnis wiederauftauchen. Was der Sanitizer ZUSAETZLICH
// einsetzt, ist erlaubt — das ist Normalisierung, kein Verlust.
// (Konkret: `sanitizeRelationTemplates` ergaenzt ein fehlendes
// `allowExtraParams` mit `false`. Ein strikter Gleichheitsvergleich haette
// deshalb voellig heile Dateien abgelehnt.)
//
// Umgekehrt schlaegt jede Veraenderung an: ein Wert, der verschwindet
// (`idbId: 42` -> weg), ein Typ, der kippt (`fields: "kaputt"` -> `[]`), ein
// Eintrag, der wegfaellt (Laenge stimmt nicht mehr).
function keinVerlust(roh: unknown, rein: unknown): boolean {
  if (roh === rein) return true
  if (Array.isArray(roh) || Array.isArray(rein)) {
    if (!Array.isArray(roh) || !Array.isArray(rein) || roh.length !== rein.length) return false
    return roh.every((x, i) => keinVerlust(x, rein[i]))
  }
  if (typeof roh !== 'object' || typeof rein !== 'object' || roh === null || rein === null) return false
  const a = roh as Record<string, unknown>
  const b = rein as Record<string, unknown>
  return Object.keys(a)
    .filter((k) => a[k] !== undefined)
    .every((k) => Object.prototype.hasOwnProperty.call(b, k) && keinVerlust(a[k], b[k]))
}

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
  bereinige: (raw: unknown) => T[],
  klarname: string,
): { ok: true; liste: T[] } | { ok: false; grund: string } {
  if (!Array.isArray(roh)) {
    return {
      ok: false,
      grund: `Die Datei ist beschädigt: der Abschnitt „${klarname}" fehlt oder ist unlesbar.`,
    }
  }
  const liste = bereinige(roh)
  if (!keinVerlust(roh, liste)) {
    return {
      ok: false,
      grund: `Die Datei ist beschädigt: im Abschnitt „${klarname}" stimmen Angaben nicht. `
        + 'Sie wird nicht geladen, damit nicht unbemerkt Teile deiner Maske verlorengehen.',
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
    return {
      ok: false,
      grund: 'Die Datei konnte nicht verarbeitet werden — sie ist vermutlich beschädigt.',
    }
  }
}

function auspacken(text: string): AuspackErgebnis {
  let roh: unknown
  try {
    roh = JSON.parse(text)
  } catch {
    return { ok: false, grund: 'Die Datei ist keine gültige JSON-Datei und konnte nicht gelesen werden.' }
  }
  if (!roh || typeof roh !== 'object' || Array.isArray(roh)) {
    return { ok: false, grund: 'Die Datei enthält keine Maske.' }
  }
  const o = roh as Record<string, unknown>

  if (o.art !== MASKEN_DATEI_ART) {
    return {
      ok: false,
      grund: 'Das ist keine Maskendatei des Aufbau-Editors. (Die exportierten '
        + 'SoftEngine-Dateien lassen sich nicht wieder laden — dafür ist die '
        + 'gespeicherte Maskendatei da.)',
    }
  }

  // Aus der ZUKUNFT: ein aelterer Editor wuerde die Migrationen ueberspringen
  // und anschliessend alles, was er nicht kennt, als „unbekannt" wegwerfen —
  // also still Arbeit vernichten, die er nur nicht versteht.
  const dateiVersion = typeof o.dateiVersion === 'number' ? o.dateiVersion : 0
  if (dateiVersion > MASKEN_DATEI_VERSION) {
    return {
      ok: false,
      grund: 'Diese Datei stammt aus einer neueren Version des Editors und kann hier '
        + 'nicht geladen werden.',
    }
  }
  if (dateiVersion < 1) {
    return { ok: false, grund: 'Die Datei ist beschädigt: die Formatangabe fehlt.' }
  }

  // Pflichtangaben werden VERLANGT, nicht grosszuegig ergaenzt. Wer eine
  // fehlende `schemaVersion` zu 1 macht, fehlende Bibliotheken zu leeren
  // Listen und `tree: {}` zu einem leeren Baum, laedt eine formal markierte,
  // aber ausgehoehlte Datei „erfolgreich" und leert dabei den GESAMTEN
  // offenen Stand — genau der Schaden, den diese Funktion verhindern soll.
  if (typeof o.schemaVersion !== 'number') {
    return { ok: false, grund: 'Die Datei ist beschädigt: die Versionsangabe des Aufbaus fehlt.' }
  }
  const schemaVersion = o.schemaVersion
  if (schemaVersion > CURRENT_SCHEMA_VERSION) {
    return {
      ok: false,
      grund: 'Diese Datei stammt aus einer neueren Version des Editors und kann hier '
        + 'nicht geladen werden.',
    }
  }
  // Der Baum MUSS eine BRAUCHBARE Wurzel mitbringen. Eine leere Maske ist
  // erlaubt (die Wurzel steht dann ohne Kinder da) — ein fehlender oder
  // kaputter Baum nicht.
  //
  // Es reicht NICHT, den Schluessel `root` zu suchen: `tree: { root: null }`
  // kaeme durch und wuerde anschliessend zu einer leeren Maske normalisiert
  // — wieder der Fall „Datei laedt erfolgreich und leert alles".
  if (!o.tree || typeof o.tree !== 'object' || Array.isArray(o.tree)) {
    return { ok: false, grund: 'Die Datei enthält keinen lesbaren Masken-Aufbau.' }
  }
  const rohBaum = o.tree as Record<string, unknown>
  const wurzel = rohBaum[ROOT_ID]
  if (!wurzel || typeof wurzel !== 'object' || Array.isArray(wurzel)
    || !Array.isArray((wurzel as Record<string, unknown>).childIds)) {
    return { ok: false, grund: 'Die Datei enthält keinen lesbaren Masken-Aufbau.' }
  }

  // Der Karten-Demotext-Putzer laeuft nur fuer ALTE Staende. In einer
  // aktuellen Datei ist „Heute" im Chip ein echter Wert des Bedieners — ihn
  // wegzuputzen hiesse, eine eben gespeicherte Maske beim Laden abzulehnen.
  // Die Grenze ist die feste historische Zahl, nicht „aelter als aktuell":
  // sonst wuerde jeder Versionssprung den Putzer erneut loslassen (A2).
  const baum = baumAusRohdaten(
    { schemaVersion, tree: o.tree },
    schemaVersion < DEMO_CLEANUP_BEFORE_SCHEMA,
  )
  if (!baum) {
    return { ok: false, grund: 'Die Datei enthält keinen lesbaren Masken-Aufbau.' }
  }

  // Und auch der BAUM darf nichts still verlieren — dieselbe Regel wie bei
  // den Bibliotheken. `sanitizeTree` wirft Waisen, Zyklen und kaputte Knoten
  // ohne ein Wort weg; in einem gewachsenen Browser-Speicher ist das richtig,
  // in einer Datei ist es Datenverlust.
  //
  // Erlaubt bleibt GENAU eine Art von Verlust: Bausteine, deren TYP es nicht
  // mehr gibt. Die zaehlt `baum.verworfen`, und der Bediener bekommt sie
  // hinterher als Klartext-Meldung zu sehen — das ist der bestehende,
  // gewollte Weg fuer abgeschaffte Bausteintypen.
  // Erst die Verweise: zeigt ein childIds-Eintrag auf einen Knoten, den die
  // Datei gar nicht enthaelt, faellt er beim Bereinigen lautlos weg — und
  // eine reine Knoten-ZAEHLUNG merkt davon nichts, weil der fehlende Knoten
  // ja auch vorher nicht da war. Also ausdruecklich pruefen.
  for (const [id, knoten] of Object.entries(rohBaum)) {
    if (!knoten || typeof knoten !== 'object') {
      return { ok: false, grund: `Die Datei ist beschädigt: der Baustein „${id}" ist unlesbar.` }
    }
    const kinder = (knoten as Record<string, unknown>).childIds
    if (kinder !== undefined && !Array.isArray(kinder)) {
      return { ok: false, grund: `Die Datei ist beschädigt: der Baustein „${id}" ist unlesbar.` }
    }
    for (const kind of Array.isArray(kinder) ? kinder : []) {
      if (typeof kind !== 'string' || !(kind in rohBaum)) {
        return {
          ok: false,
          grund: 'Die Datei ist beschädigt: ein Baustein verweist auf einen anderen, '
            + 'den die Datei nicht enthält. Sie wird nicht geladen, damit nicht '
            + 'unbemerkt Teile deiner Maske verlorengehen.',
        }
      }
    }
  }

  const rohKnoten = Object.keys(rohBaum).filter((id) => id !== ROOT_ID).length
  const reinKnoten = Object.keys(baum.tree).filter((id) => id !== ROOT_ID).length
  const bekanntVerworfen = [...baum.verworfen.values()].reduce((a, b) => a + b, 0)
  if (rohKnoten > reinKnoten + bekanntVerworfen) {
    return {
      ok: false,
      grund: 'Die Datei ist beschädigt: im Masken-Aufbau fehlen Bausteine '
        + `(${rohKnoten - reinKnoten - bekanntVerworfen} von ${rohKnoten}). Sie wird nicht `
        + 'geladen, damit nicht unbemerkt Teile deiner Maske verlorengehen.',
    }
  }

  // Und zuletzt INNERHALB der Bausteine: ein Baum kann gleich viele Knoten
  // haben und trotzdem ausgeduennt sein. `normalizeProps` wirft Eigenschaften weg, die der Typ
  // nicht kennt; `sanitizeBlockEvents` verwirft eine GANZE Aktionskette,
  // wenn ein einziger Schritt kaputt ist. Beides lautlos — und beides waere
  // an einer Datei echter Arbeitsverlust.
  //
  // Diese Pruefung gilt nur, wenn der Baum unveraendert durchlaufen SOLLTE:
  // liefen Migrationen oder fielen abgeschaffte Bausteintypen weg, dann
  // AENDERT sich der Baum von Berufs wegen, und ein Vergleich waere Unsinn.
  if (!baum.migrated && bekanntVerworfen === 0) {
    for (const [id, rohKnoten] of Object.entries(rohBaum)) {
      const rein = baum.tree[id]
      const roh = rohKnoten as Record<string, unknown>
      // Die WURZEL wird mitgeprueft, aber nur ihre Kinderliste: Typ und
      // Eigenschaften baut der Editor selbst, sie stehen nie zur Debatte.
      // Ohne diese Pruefung liesse sich ihre Kinderliste still ausduennen.
      if (id === ROOT_ID) {
        if (keinVerlust(roh.childIds, rein?.childIds)) continue
        return {
          ok: false,
          grund: 'Die Datei ist beschädigt: im Masken-Aufbau fehlen Beziehungen '
            + 'zwischen Bausteinen. Sie wird nicht geladen, damit nicht unbemerkt '
            + 'Teile deiner Maske verlorengehen.',
        }
      }
      // childIds mitpruefen: ein Baustein, der (durch Beschaedigung) unter
      // ZWEI Eltern haengt, wird beim Bereinigen nur einmal eingehaengt —
      // die zweite Beziehung faellt lautlos weg, ohne dass sich eine
      // Knotenzahl aendert.
      if (!rein || rein.type !== roh.type
        || !keinVerlust(roh.props, rein.props)
        || !keinVerlust(roh.events, rein.events)
        || !keinVerlust(roh.childIds, rein.childIds)) {
        return {
          ok: false,
          grund: `Die Datei ist beschädigt: am Baustein „${id}" stimmen Angaben nicht. `
            + 'Sie wird nicht geladen, damit nicht unbemerkt Teile deiner Maske '
            + 'verlorengehen.',
        }
      }
    }
  }

  const quellen = bibliothekPruefen(o.datenquellen, sanitizeDataSources, 'Datenquellen')
  if (!quellen.ok) return { ok: false, grund: quellen.grund }
  const relationen = bibliothekPruefen(o.relationen, sanitizeRelationTemplates, 'Relationen')
  if (!relationen.ok) return { ok: false, grund: relationen.grund }

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
