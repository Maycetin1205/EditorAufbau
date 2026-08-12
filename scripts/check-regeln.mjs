// check-regeln
// Regel-Waechter: prueft den CODE gegen die Architektur-Regeln aus CLAUDE.md.
//
// Warum es diesen Waechter gibt (Nutzer-Entscheidung 2026-07-24):
// Die Architektur-Regeln standen bisher NUR als Prosa in CLAUDE.md. Prosa
// haelt niemanden auf -- der Tabellen-Bug vom 2026-07-24 (umbenannte Spalten
// fielen im Export still auf die Standardtitel zurueck) entstand genau so:
// die Regel "neuer Baustein = Zeile im Export-Test" existierte im Kopf, aber
// nichts erzwang sie, also schlug kein Waechter an.
//
// Dieser Waechter macht aus fuenf Prosa-Regeln fuenf harte Pruefungen.
// Er bewacht die BAUART -- die anderen bewachen Export-Bytes und Laufzeit.
//
// Aufruf: node scripts/check-regeln.mjs
//
// Grundsatz: jede Pruefung hier hat einen echten Vorfall oder eine echte
// Nutzer-Entscheidung als Anlass. Nichts auf Verdacht (Regel 10).

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, posix } from 'node:path'

const fehler = []
const hinweise = []

// --- Werkzeug ---------------------------------------------------------

function alleQuellen(ordner = 'src') {
  const raus = []
  for (const name of readdirSync(ordner)) {
    const pfad = join(ordner, name)
    if (statSync(pfad).isDirectory()) {
      if (name === 'generated') continue
      raus.push(...alleQuellen(pfad))
    } else if (/\.tsx?$/.test(name)) {
      raus.push(pfad.replace(/\\/g, '/'))
    }
  }
  return raus
}

const quellen = alleQuellen()
const lies = (p) => readFileSync(p, 'utf8')
const zeilenVon = (text) => text.split('\n').length

// Bausteintypen + Tags direkt aus dem Code lesen -- nie eine Liste pflegen,
// die veralten kann (dieselbe Idee wie der Veralten-Check im export.test).
const bausteine = []
for (const pfad of quellen) {
  if (!pfad.startsWith('src/blocks/')) continue
  const text = lies(pfad)
  const typ = /static readonly blockType = '([^']+)'/.exec(text)?.[1]
  const tag = /static readonly tagName = '([^']+)'/.exec(text)?.[1]
  if (typ && tag) bausteine.push({ typ, tag, pfad })
}

if (bausteine.length === 0) {
  fehler.push('Selbstpruefung: keine Bausteine gefunden -- der Waechter liest den Code falsch.')
}

// --- 1. Kein Bausteintyp-Sondercode (Regel 2) -------------------------
// "Nirgends `if typ === 'kanban'`": Faehigkeiten sind Registry-Eintraege.
// Canvas, Inspector und Export lesen generisch. Wer hier haengenbleibt,
// baut gerade Sondercode fuer EINEN Baustein -- das ist der Anfang vom
// unwartbaren Vorgaenger-Repo.
//
// Begruendete Ausnahmen (jede einzeln, mit Grund -- nie pauschal):
const TYP_AUSNAHMEN = [
  {
    pfad: 'src/state/migrations.ts',
    grund: 'Migrationen MUESSEN alte Typnamen kennen -- das ist ihre Aufgabe: ' +
      'gespeicherte Staende von frueher auf die heutige Form heben.',
  },
]

for (const pfad of quellen) {
  if (pfad.startsWith('src/blocks/')) continue // ein Baustein darf sich selbst kennen
  if (/\.test\.tsx?$/.test(pfad)) continue // Tests benennen Faelle absichtlich
  if (TYP_AUSNAHMEN.some((a) => a.pfad === pfad)) continue

  const zeilen = lies(pfad).split('\n')
  for (const { typ } of bausteine) {
    // EINE Regex fuer alle Schreibweisen: ===, !== und .includes(), jeweils
    // mit einfachen ODER doppelten Anfuehrungszeichen. Bis 2026-07-28 stand
    // hier ein Stueckwerk aus zwei String-Vergleichen; `.includes('tabelle')`
    // rutschte glatt durch (Befund B5.4).
    //
    // `case '<typ>':` wird BEWUSST NICHT geprueft: Eigenschafts-ARTEN heissen
    // teils wie Bausteintypen. Inspector.tsx hat ein voellig legitimes
    // `case 'text':` fuer die Art „Textfeld", nicht fuer den Baustein `text`.
    // Ein Waechter, der ab der ersten Sekunde falsch anschlaegt, wird
    // weggedrueckt — und ein weggedrueckter Waechter ist schlimmer als keiner.
    const roh = typ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const muster = new RegExp(`(===|!==)\\s*['"]${roh}['"]|\\.includes\\(\\s*['"]${roh}['"]`)
    zeilen.forEach((zeile, i) => {
      if (muster.test(zeile)) {
        fehler.push(
          `Sondercode (Regel 2): ${pfad}:${i + 1} vergleicht auf den Bausteintyp '${typ}'.\n` +
          `      Statt dessen: eine Faehigkeit in der Registry deklarieren (BlockDefinition)\n` +
          `      und generisch lesen. Echte Ausnahme? In TYP_AUSNAHMEN eintragen -- MIT Grund.`
        )
      }
    })
  }
}

// --- 2. Neuer Baustein = Zeile im Export-Test (Lehre 2026-07-24) ------
// Der Tabellen-Bug war STILL kaputt, weil kein Export-Test je "tabelle"
// beruehrte. Jeder Baustein muss im Export-Test vorkommen UND in der
// Veralten-Positivliste des Buendel-Checks stehen.
const exportTest = lies('src/export/export.test.ts')
for (const { tag, typ, pfad } of bausteine) {
  if (!exportTest.includes(tag)) {
    fehler.push(
      `Ungetesteter Baustein: '${typ}' (${pfad}) kommt in export.test.ts nicht vor.\n` +
      `      Jeder Baustein braucht MINDESTENS einen Fall (Attribut-Round-Trip),\n` +
      `      sonst kann sein Export still kaputtgehen -- genau der Tabellen-Bug 2026-07-24.`
    )
  }
}

// Die Positivliste des Veralten-Checks: dort muessen ALLE Tags stehen,
// sonst prueft der Buendel-Check den neuen Baustein nie mit.
const positivListe = /for \(const tag of \[([^\]]*)\]\)/.exec(exportTest)?.[1] ?? ''
for (const { tag, typ } of bausteine) {
  if (!positivListe.includes(`'${tag}'`)) {
    fehler.push(
      `Luecke in der Veralten-Positivliste: '${tag}' (Baustein '${typ}') fehlt in export.test.ts.\n` +
      `      Ohne Eintrag merkt niemand, wenn der Baustein aus dem Runtime-Buendel faellt\n` +
      `      -- die Maske zeigt ihn dann in SoftEngine einfach nicht an.`
    )
  }
}

// --- 2b. Neuer Baustein = Knoten in der Referenzmaske (Befund B2) -----
// Der Byte-Waechter (export/referenzabzug.test.ts) vergleicht den Export der
// Referenzmaske Zeichen fuer Zeichen. Was dort NICHT vorkommt, bewacht er
// nicht. Am 2026-07-28 fiel auf: tabelle, text und trenner fehlten — also
// ausgerechnet der Baustein, dessen Export am 2026-07-24 schon einmal still
// kaputt war. Pruefung 2 sah das nicht, weil sie nur export.test.ts kennt.
// Geprueft wird der ABZUG, nicht die Quelldatei: dort steht, was am Ende
// wirklich exportiert wurde. Eine Textsuche in referenzMaske.ts waere schon
// von einem Kommentar zu befriedigen, der den Typnamen erwaehnt — derselbe
// Papiertiger, der Pruefung 2 fast unterlaufen waere (Codex-Codereview
// 2026-07-28).
//
// Nur der MARKUP-Teil zaehlt: hinter '<script>' folgt das Runtime-Buendel,
// und dort kommt jeder Tag als Registrierungs-String vor — ein Baustein waere
// dadurch immer "gefunden", auch wenn ihn die Maske gar nicht zeigt.
const abzug = lies('src/export/referenz/maske.html.snap')
const abzugMarkup = abzug.split('<script>')[0]
for (const { tag, typ, pfad } of bausteine) {
  // Auf die Tag-GRENZE pruefen, nicht auf das Praefix: '<ff-kanban' steckt
  // auch in '<ff-kanban-spalte'. Ohne die Grenze bliebe der Waechter gruen,
  // wenn das Board verschwaende und nur seine Spalten uebrig blieben
  // (Codex-Codereview 2026-07-28, zweite Runde).
  if (!new RegExp(`<${tag}(?=[\\s>])`).test(abzugMarkup)) {
    fehler.push(
      `Baustein fehlt im Referenzabzug: '${typ}' (${pfad}) — kein <${tag}> im Markup.\n` +
      `      Der Byte-Waechter (export/referenzabzug.test.ts) vergleicht diesen Abzug\n` +
      `      Zeichen fuer Zeichen. Was dort nicht vorkommt, kann im Export unbemerkt\n` +
      `      kaputtgehen — genau so blieb der Tabellen-Bug 2026-07-24 unentdeckt.\n` +
      `      Knoten in src/test/referenzMaske.ts ergaenzen, dann 'npx vitest run -u'.`
    )
  }
}

// --- 3. Dateigroessen-Deckel ------------------------------------------
// Grosse Dateien sind der Weg zurueck ins unwartbare Vorgaenger-Repo.
// 500 Zeilen ist die Grenze. Altlasten (hoehere Einzel-Deckel) gibt es
// KEINE mehr -- jede Quelldatei faellt unter denselben Deckel.
// StepForm.tsx stand hier bis 2026-07-24 mit 722 Zeilen (geteilt in
// ParameterZeile / RelationAuswahl / SchrittSelect); Editor.ts bis
// 2026-07-27 mit 559, bis Seiten, Raster und Auswahl in eigene Faecher
// gezogen wurden (pageOps / rasterOps / selectionOps).
// Damit ist die Ausnahme ersatzlos entfallen: der Zustandsspeicher kann
// nicht mehr unbemerkt zum Monolithen wachsen.
const DECKEL = 500
const ALTLASTEN = {}

for (const pfad of quellen) {
  const zeilen = zeilenVon(lies(pfad))
  const grenze = ALTLASTEN[pfad] ?? DECKEL
  if (zeilen > grenze) {
    const alt = ALTLASTEN[pfad]
    fehler.push(
      alt
        ? `Altlast waechst: ${pfad} hat ${zeilen} Zeilen (erlaubt: ${alt}).\n` +
          `      Diese Datei ist schon zu gross und darf nicht weiter wachsen. Erst teilen.`
        : `Zu gross: ${pfad} hat ${zeilen} Zeilen (Deckel: ${DECKEL}).\n` +
          `      In sinnvolle Teile schneiden -- eine Datei, eine Aufgabe.`
    )
  }
  if (ALTLASTEN[pfad] && zeilen < ALTLASTEN[pfad] - 20) {
    hinweise.push(`${pfad} ist auf ${zeilen} Zeilen geschrumpft -- ALTLASTEN in diesem Script nachziehen.`)
  }
}

// --- 4. Typ-Ausschalter eingefroren -----------------------------------
// `any` und `@ts-ignore` schalten die Typpruefung ab -- und damit den
// einzigen Waechter, der JEDE Zeile sieht. Stand 2026-07-24: 2 bzw. 1.
// Diese Zahlen duerfen nur sinken, nie steigen.
const ANY_ERLAUBT = 2
const STUMM_ERLAUBT = 1

let anyZahl = 0
let stummZahl = 0
const anyOrte = []
const stummOrte = []

for (const pfad of quellen) {
  lies(pfad).split('\n').forEach((zeile, i) => {
    if (/:\s*any\b|\bas any\b/.test(zeile)) { anyZahl++; anyOrte.push(`${pfad}:${i + 1}`) }
    if (/@ts-ignore|@ts-expect-error|eslint-disable/.test(zeile)) { stummZahl++; stummOrte.push(`${pfad}:${i + 1}`) }
  })
}

if (anyZahl > ANY_ERLAUBT) {
  fehler.push(
    `Typ-Ausschalter: ${anyZahl}x \`any\` gefunden, erlaubt sind ${ANY_ERLAUBT}.\n` +
    `      ${anyOrte.join('\n      ')}\n` +
    `      \`any\` schaltet die Typpruefung ab. Richtigen Typ schreiben oder \`unknown\` + pruefen.`
  )
}
if (stummZahl > STUMM_ERLAUBT) {
  fehler.push(
    `Stummgeschaltete Warnungen: ${stummZahl}x, erlaubt ist ${STUMM_ERLAUBT}.\n` +
    `      ${stummOrte.join('\n      ')}\n` +
    `      Eine weggedrueckte Warnung ist ein ungeloestes Problem mit Deckel drauf.`
  )
}
if (anyZahl < ANY_ERLAUBT || stummZahl < STUMM_ERLAUBT) {
  hinweise.push(`Weniger Ausschalter als erlaubt (any ${anyZahl}/${ANY_ERLAUBT}, stumm ${stummZahl}/${STUMM_ERLAUBT}) -- Grenzen hier senken.`)
}

// --- 5. Keine Hex-Farben im Baustein-CSS (WYSIWYG) --------------------
// Bausteine nutzen AUSSCHLIESSLICH var(--se-...). Eine Hex-Farbe im
// Baustein ist eine Farbe, die im Export anders aussehen kann als im
// Editor -- also ein Bruch des Nordsterns "was du siehst, IST der Export".
for (const { pfad } of bausteine.length ? quellen.filter((p) => p.startsWith('src/blocks/')).map((p) => ({ pfad: p })) : []) {
  if (/\.test\.tsx?$/.test(pfad)) continue
  lies(pfad).split('\n').forEach((zeile, i) => {
    if (/#[0-9a-fA-F]{3,8}\b/.test(zeile) && !zeile.trim().startsWith('//') && !zeile.trim().startsWith('*')) {
      fehler.push(
        `Hex-Farbe im Baustein: ${pfad}:${i + 1}\n` +
        `      Bausteine nutzen nur var(--se-...) aus masken-tokens.css -- sonst kann die\n` +
        `      Farbe im SoftEngine-Export von der im Editor abweichen (WYSIWYG-Bruch).`
      )
    }
  })
}

// --- 6. Generischer Code importiert keinen Baustein (Regel 2) ---------
// Nachgeruestet am 2026-07-24: Pruefung 1 sucht Typ-VERGLEICHE -- der
// Tabellen-Umbau brach die Regel aber ueber einen IMPORT: der generische
// BlockHost holte sich `coerceSpalten` direkt aus dem Tabellen-Baustein und
// kannte damit „Spalten". Dieselbe Sünde, andere Syntax.
//
// Erlaubt bleibt `core/blocks/` -- das IST die Registry, ueber die generischer
// Code Faehigkeiten liest. Verboten ist `blocks/<baustein>/`.
const BAUSTEIN_IMPORT_AUSNAHMEN = [
  {
    pfad: 'src/editor/canvas/PopupSeite.tsx',
    // Berichtigt in U3 (2026-08-12): hier stand seit C1 ein toter Name.
    // POPUP_RAND ist geloescht -- das Popup komponiert seither den geteilten
    // DialogRahmen, und DIESSEN Konstante holt sich die Seite.
    grund: 'DIALOG_RAND (blocks/shared/DialogRahmen) ist laut CLAUDE.md die EINE Konstante ' +
      'fuer „Flaeche minus Rand", DIALOG_SCHLIESSEN_EVENT der eine Schliess-Weg -- Editor ' +
      'und Baustein MUESSEN dieselben Werte benutzen, sonst driftet die Popup-Groesse.',
  },
]

for (const pfad of quellen) {
  if (pfad.startsWith('src/blocks/')) continue // Bausteine untereinander: erlaubt
  if (/\.test\.tsx?$/.test(pfad)) continue // Tests duerfen den Prueflings-Baustein holen
  if (pfad.startsWith('src/test/')) continue
  if (BAUSTEIN_IMPORT_AUSNAHMEN.some((a) => a.pfad === pfad)) continue

  lies(pfad).split('\n').forEach((zeile, i) => {
    const treffer = /from '([^']*\/blocks\/[^']+)'/.exec(zeile)
    if (!treffer) return
    // Relative Angabe gegen das Verzeichnis der importierenden Datei
    // aufloesen. Bis 2026-07-28 wurde nur der TEXT geprueft ("enthaelt
    // 'core/blocks/'?") -- damit galt `../blocks/BlockDefinition` aus
    // src/core/data/ als Baustein-Import, obwohl es die Registry ist. Ein
    // Waechter, der bei sauberem Code Alarm schlaegt, erzieht dazu, ihn zu
    // umgehen; also die Frage richtig stellen statt eine Ausnahme eintragen.
    const ziel = treffer[1].startsWith('.')
      ? posix.normalize(posix.join(posix.dirname(pfad), treffer[1]))
      : treffer[1]
    if (ziel.includes('core/blocks/')) return
    fehler.push(
      `Baustein-Import in generischem Code (Regel 2): ${pfad}:${i + 1}\n` +
      `      -> ${treffer[1]}\n` +
      `      Generischer Code (Canvas, Inspector, Export, Store) darf KEINEN einzelnen\n` +
      `      Baustein kennen. Was er braucht, deklariert der Baustein als Faehigkeit in\n` +
      `      der Registry (BlockDefinition) -- so wie \`listenBindung\` fuer die Spalten\n` +
      `      der Tabelle. Echte Ausnahme? In BAUSTEIN_IMPORT_AUSNAHMEN eintragen, MIT Grund.`
    )
  })
}

// --- 7. Saubere Zeichen: keine Steuerzeichen, keine BOM (Befund A7) ---
//
// Anlass: FieldPicker.tsx trug jahrelang ein rohes Null-Byte in einem
// Template-String. Folge -- git und JEDES Suchwerkzeug hielten die Datei fuer
// binaer: kein Diff im Commit, von jeder Codesuche uebersprungen. Genau so
// konnte sie unsichtbar bleiben, und nebenbei war sie als einzige Datei im
// Repo CRLF-codiert. Vier weitere Dateien trugen eine BOM.
//
// Erlaubt sind Tab (0x09), LF (0x0A) und CR (0x0D) -- alles andere unter
// 0x20 ist ein Fehler. Wer ein Steuerzeichen als WERT braucht, schreibt es
// als Escape ('\u0000'): das ist lesbar, durchsuchbar und diffbar.
// Geprueft werden hier AUCH die Waechter-Skripte selbst (2026-08-10). Bis zu
// diesem Tag lief die Pruefung nur ueber `quellen`, also src/**/*.ts(x) -- und
// genau deshalb trug ausgerechnet DIESE Datei ein rohes Null-Byte, mitten im
// Erklaertext zwei Zeilen weiter oben. Ein Waechter, der sich selbst nicht
// prueft, ist der wahrscheinlichste Ort fuer den Fehler, den er sucht: seinen
// Code liest niemand freiwillig, und git zeigte seinen Diff gar nicht mehr an.
//
// Nur fuer DIESE Zeichen-Pruefung. Der Dateideckel und die Regel-2-Pruefungen
// bleiben bei src: Skripte sind keine Bausteine und tragen keine Registry.
const zeichenDateien = [
  ...quellen,
  ...readdirSync('scripts').filter((n) => /\.m?js$/.test(n)).map((n) => 'scripts/' + n),
]

for (const pfad of zeichenDateien) {
  const text = lies(pfad)
  if (text.startsWith('\uFEFF')) {
    fehler.push(
      `BOM am Dateianfang: ${pfad}\n` +
      `      Die Datei als UTF-8 OHNE BOM speichern. Eine BOM ist ein unsichtbares\n` +
      `      Zeichen vor der ersten Zeile -- sie verwirrt Werkzeuge und Diffs, ohne\n` +
      `      dass man sie sieht.`
    )
  }
  const zeilen = text.split('\n')
  for (let i = 0; i < zeilen.length; i++) {
    // Als Escapes geschrieben, nicht als rohe Zeichen -- sonst braeche
    // dieser Waechter genau die Regel, die er bewacht.
    const treffer = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.exec(zeilen[i])
    if (!treffer) continue
    const code = '0x' + treffer[0].charCodeAt(0).toString(16).padStart(2, '0')
    fehler.push(
      `Steuerzeichen ${code} im Quelltext: ${pfad}:${i + 1}\n` +
      `      Ein rohes Steuerzeichen macht die Datei fuer git und die Suchwerkzeuge\n` +
      `      BINAER: kein Diff, von jeder Codesuche uebersprungen. Genau so blieb das\n` +
      `      Null-Byte in FieldPicker.tsx jahrelang unsichtbar. Als Escape schreiben\n` +
      `      ('\\u0000') oder eine benannte Konstante nehmen.`
    )
    break // eine Meldung je Datei reicht
  }
}

// --- Ergebnis ---------------------------------------------------------

for (const h of hinweise) console.log('  hinweis: ' + h)

if (fehler.length === 0) {
  console.log(
    `check-regeln: ok (${bausteine.length} Bausteine, ${quellen.length} Quelldateien` +
    `, davon ${zeichenDateien.length} auch auf Zeichen geprueft)`
  )
  process.exit(0)
}

console.error('check-regeln: FEHLER -- der Code bricht eine Architektur-Regel\n')
for (const f of fehler) console.error('  - ' + f + '\n')
console.error('Diese Regeln stehen in CLAUDE.md. Sie sind der Grund, warum dieses Projekt')
console.error('wartbar geblieben ist. Nicht umgehen -- entweder richtig bauen oder die Regel')
console.error('mit dem Nutzer aendern.')
process.exit(1)
