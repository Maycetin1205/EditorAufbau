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
import { join } from 'node:path'

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
    zeilen.forEach((zeile, i) => {
      if (zeile.includes(`=== '${typ}'`) || zeile.includes(`!== '${typ}'`)) {
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

// --- 3. Dateigroessen-Deckel ------------------------------------------
// Grosse Dateien sind der Weg zurueck ins unwartbare Vorgaenger-Repo.
// 500 Zeilen ist die Grenze. Altlasten (hoehere Einzel-Deckel) gibt es
// KEINE mehr -- jede Quelldatei faellt unter denselben Deckel.
// StepForm.tsx stand hier bis 2026-07-24 mit 722 Zeilen (geteilt in
// ParameterZeile / RelationAuswahl / SchrittSelect); Editor.ts bis
// 2026-07-27 mit 559 -- jetzt 422, weil Seiten, Raster und Auswahl in
// eigene Faecher gezogen wurden (pageOps / rasterOps / selectionOps).
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
    grund: 'POPUP_RAND ist laut CLAUDE.md die EINE Konstante fuer „Flaeche minus Rand" -- ' +
      'Editor und Baustein MUESSEN denselben Wert benutzen, sonst driftet die Popup-Groesse.',
  },
]

for (const pfad of quellen) {
  if (pfad.startsWith('src/blocks/')) continue // Bausteine untereinander: erlaubt
  if (/\.test\.tsx?$/.test(pfad)) continue // Tests duerfen den Prueflings-Baustein holen
  if (pfad.startsWith('src/test/')) continue
  if (BAUSTEIN_IMPORT_AUSNAHMEN.some((a) => a.pfad === pfad)) continue

  lies(pfad).split('\n').forEach((zeile, i) => {
    const treffer = /from '([^']*\/blocks\/[^']+)'/.exec(zeile)
    if (!treffer || treffer[1].includes('core/blocks/')) return
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

// --- Ergebnis ---------------------------------------------------------

for (const h of hinweise) console.log('  hinweis: ' + h)

if (fehler.length === 0) {
  console.log(`check-regeln: ok (${bausteine.length} Bausteine, ${quellen.length} Dateien geprueft)`)
  process.exit(0)
}

console.error('check-regeln: FEHLER -- der Code bricht eine Architektur-Regel\n')
for (const f of fehler) console.error('  - ' + f + '\n')
console.error('Diese Regeln stehen in CLAUDE.md. Sie sind der Grund, warum dieses Projekt')
console.error('wartbar geblieben ist. Nicht umgehen -- entweder richtig bauen oder die Regel')
console.error('mit dem Nutzer aendern.')
process.exit(1)
