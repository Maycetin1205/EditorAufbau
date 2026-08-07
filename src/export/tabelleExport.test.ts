// Export-Tests der TABELLE.
//
// Aus export.test.ts herausgeloest (2026-08-07) — dieselbe Datei war schon am
// 2026-08-06 ueber den 500-Zeilen-Deckel gewachsen (damals zog der Validator
// aus). Der Schnitt liegt am Gegenstand: hier alles, was der TABELLEN-Baustein
// exportieren muss, drueben die Export-Grundsaetze selbst (Determinismus,
// Standardwerte, Runtime-Buendel, Atome).
//
// Anlass, warum es diese Faelle ueberhaupt gibt: der Tabellen-Bug 2026-07-24.
// Umbenannte Spalten fielen im Export still auf die Standardtitel zurueck, und
// kein Test beruehrte je „tabelle" — also schlug kein Waechter an. Seither
// gilt: neuer Baustein bzw. neue Maskeneinstellung = Fall im Export-Test.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
// Registriert den Tabellen-Baustein + liefert die Spalten-Coercion.
import { coerceSpalten } from '../blocks/tabelle/TabelleBlock'
import type { BlockTree } from '../core/blocks/BlockData'
import { exportMask } from './exportMask'
import { failedChecks, validateMaskHtml } from './validator'

// Das spalten-Attribut zurueck in JSON: Entities aufloesen, wie Lit es im
// Browser auch tut. Steht hier EINMAL fuer alle Spalten-Faelle.
const spaltenAusHtml = (html: string): unknown =>
  JSON.parse(
    (/<ff-tabelle[^>]*\sspalten="([^"]*)"/.exec(html)?.[1] ?? '').replace(
      /&#x([0-9A-Fa-f]+);|&quot;|&amp;/g,
      (m, h?: string) => (h ? String.fromCodePoint(parseInt(h, 16)) : m === '&quot;' ? '"' : '&'),
    ),
  )

// Die Spalten fuer die Tabellen-Faelle, jede mit einer Falle, die den Export
// brechen kann: Komma im Titel (String(array) zerbraeche daran), Umlaut (roher
// Text zerbraeche daran), leeres Feld, verschachtelte Zuordnung, Zusatzfelder.
// Die ART ist bewusst NICHT ueberall 'text', sonst pruefte der Round-Trip nur
// den Standardfall.
const standardTestSpalten = [
  { titel: 'Kunde', feld: '2_8', art: 'text' },
  { titel: 'Betrag, netto', feld: '10_12', art: 'zahl' },
  {
    titel: 'Größe', feld: '', art: 'status',
    zuordnung: [
      { wert: 'W', name: 'Wartet', bedeutung: 'warning' },
      { wert: 'F', name: 'Fertig, geprüft', bedeutung: 'success' },
    ],
  },
  // „Bild + Name" (2026-08-06): faellt der felder-Schluessel im Export weg,
  // zeigt SoftEngine eine nackte Textspalte, wo der Editor Bild und Unterzeile
  // gezeigt hat — derselbe stille Bruch wie beim Tabellen-Bug 2026-07-24. Eine
  // Bindung ist QUALIFIZIERT (weitere Quelle, '::') und muss unversehrt durch.
  {
    titel: 'Patient', feld: '30_20', art: 'bild',
    felder: { bild: '50_10', unter: 'q-rasse::12_18' },
  },
]

// Ein Baum mit genau einer Tabelle; `props` ergaenzt/uebersteuert.
const tabelleBaum = (props: Record<string, unknown>): BlockTree => ({
  root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tab'] },
  tab: {
    id: 'tab', type: 'tabelle', parentId: 'root', childIds: [],
    props: { width: 'fill', spalten: standardTestSpalten, ...props },
  },
})

// Nur der TABELLEN-TAG zaehlt, nicht das ganze Dokument: das eingebettete
// Runtime-Buendel enthaelt dieselben Namen als minifizierte Zuweisungen
// (`proSeite=`), eine Suche im ganzen HTML traefe also immer.
const tabelleTag = (html: string): string => /<ff-tabelle[^>]*>/i.exec(html)?.[0] ?? ''

describe('Tabelle (Fahrplan 4)', () => {
  it('Spalten (Titel + Feld + Art) ueberleben den Export als JSON — Komma und Umlaut sind die Fallen', () => {
    // Regel 1 (WYSIWYG): die im Editor vergebenen Spalten (Titel, Feldcode UND
    // Darstellung) muessen EXAKT so in der exportierten Maske ankommen.
    // String(array) zerbraeche am Komma, roher Text am Umlaut — beide Fallen
    // stecken bewusst im Titel. Der Feldcode ist der Technikwert, den die
    // Laufzeit ausliest; die Art sagt ihr, WIE die Spalte aussieht. Faellt die
    // Art weg, zeigt SoftEngine linksbuendigen Text, wo der Editor eine Zahl
    // rechtsbuendig oder eine Status-Marke gezeigt hat — still, und genau das
    // ist der Bruch (Lehre aus dem Tabellen-Bug 2026-07-24).
    const { html } = exportMask(tabelleBaum({}))
    expect(html).toContain('<ff-tabelle ')
    expect(spaltenAusHtml(html)).toEqual(standardTestSpalten)
    // Und der Export bleibt SE-konform (ASCII/LF/Marker/Interface/Runtime).
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('Tabelle: Einstellungen einer NICHT gewaehlten Darstellung reisen nicht mit', () => {
    // Nutzer-Meldung 2026-08-06 am eigenen Export: eine Spalte stand auf
    // „Text" und trug trotzdem noch ihre Bild-Bindungen aus einem frueheren
    // Versuch. Im EDITOR ist das Absicht (zurueckstellen und wieder vor: die
    // Bindung ist noch da), in der Maske liest sie niemand. Beide bedingten
    // Schluessel in einem Fall: Zusatzfelder an einer Textspalte UND die
    // Status-Zuordnung an einer Zahlenspalte.
    const spalten = [
      { titel: 'Kunde', feld: '2_8', art: 'text', felder: { bild: '18_30', unter: '99_20' } },
      {
        titel: 'Menge', feld: '10_12', art: 'zahl',
        zuordnung: [{ wert: 'W', name: 'Wartet', bedeutung: 'warning' }],
      },
    ]
    const tree = tabelleBaum({ spalten })
    const { html } = exportMask(tree)
    expect(spaltenAusHtml(html)).toEqual([
      { titel: 'Kunde', feld: '2_8', art: 'text' },
      { titel: 'Menge', feld: '10_12', art: 'zahl' },
    ])
    // Und der EDITOR-Stand bleibt unangetastet: geputzt wird nur der Export.
    expect(tree.tab.props.spalten).toBe(spalten)
    expect(spalten[0].felder).toEqual({ bild: '18_30', unter: '99_20' })
  })

  it('Tabelle: die Suchzeile-Einstellung ueberlebt den Export', () => {
    // Die Suchzeile ist eine Maskeneinstellung (Registry-Eigenschaft). Faellt
    // sie im Export weg, sucht der Bediener in SoftEngine eine Zeile, die der
    // Editor ihm gezeigt hat — WYSIWYG-Bruch (Regel 1).
    const { html } = exportMask(tabelleBaum({ suche: 'nein' }))
    expect(html).toMatch(/<ff-tabelle[^>]*\ssuche="nein"/i)
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('Tabelle: die Maskeneinstellungen ueberleben den Export', () => {
    // Die Tabelle braucht mindestens EINEN Attribut-Round-Trip (Regel 9, Lehre
    // aus dem stillen Tabellen-Bug 2026-07-24). Geprueft wird alles, was der
    // Bauer einstellt und die Maske brauchen MUSS: das Datumsfeld des
    // Tagesfilters, die Zeilenzahl und der Zeilen-Waehler (die letzten zwei
    // seit der Nutzer-Entscheidung 2026-08-05). Faellt eines weg, zeigt
    // SoftEngine andere Zeilen als der Editor bzw. einen Waehler, den der Bauer
    // nicht wollte — und zwar still (WYSIWYG-Bruch, Regel 1).
    const gesetzt = exportMask(tabelleBaum({
      tagField: '118_10', proSeite: '25', zeilenWaehler: 'ja',
    })).html
    expect(tabelleTag(gesetzt)).toMatch(/\stagField="118_10"/i)
    expect(tabelleTag(gesetzt)).toMatch(/\sproSeite="25"/i)
    expect(tabelleTag(gesetzt)).toMatch(/\szeilenWaehler="ja"/i)
    expect(failedChecks(validateMaskHtml(gesetzt))).toEqual([])
    // Die Standardwerte („passend zur Hoehe", kein Waehler) schreiben KEIN
    // Attribut: sonst waere jede bestehende Maske im Export anders — und der
    // Byte-Waechter (referenzabzug) haette bei diesem Paket angeschlagen.
    const standard = tabelleTag(exportMask(tabelleBaum({ proSeite: 'passend', zeilenWaehler: 'nein' })).html)
    expect(standard).not.toMatch(/proSeite=/i)
    expect(standard).not.toMatch(/zeilenWaehler=/i)
  })

  it('Tabelle: „Text wenn leer" reist nur mit, wenn er vom Standard abweicht', () => {
    // Der Leerzustand-Satz (2026-08-07) ist eine Maskeneinstellung: faellt er
    // im Export weg, zeigt SoftEngine bei einer Quelle ohne Zeilen einen
    // anderen Satz als der Editor angesagt hat (WYSIWYG-Bruch, Regel 1).
    // Der Umlaut ist die Falle — roher Text zerbraeche an der ASCII-Regel.
    const gesetzt = exportMask(tabelleBaum({ leerText: 'Keine Patienten für heute.' })).html
    expect(tabelleTag(gesetzt)).toMatch(/\sleerText="Keine Patienten f&#xFC;r heute\."/i)
    expect(failedChecks(validateMaskHtml(gesetzt))).toEqual([])
    // Leer lassen ist erlaubt und bedeutet „gar keine Meldung" — das ist NICHT
    // der Standard und muss deshalb sehr wohl mitreisen.
    expect(tabelleTag(exportMask(tabelleBaum({ leerText: '' })).html)).toMatch(/\sleerText=""/i)
    // Der unangetastete Standardsatz dagegen bleibt daheim.
    const standard = tabelleTag(exportMask(tabelleBaum({ leerText: 'Keine Datensätze.' })).html)
    expect(standard).not.toMatch(/leerText=/i)
  })

  it('coerceSpalten faengt alte Staende defensiv ab (Titel-Strings, Zahl, kaputt)', () => {
    // Vollstaendiges Modell {titel,feld,art} bleibt unveraendert.
    expect(coerceSpalten([{ titel: 'A', feld: '2_8', art: 'zahl' }]))
      .toEqual([{ titel: 'A', feld: '2_8', art: 'zahl' }])
    // DIE Zusage der Art (2026-08-06): eine Spalte OHNE Art ist Text — genau
    // so verhielten sich alle Spalten vorher. Jeder gespeicherte Stand von vor
    // diesem Tag sieht damit unveraendert aus.
    expect(coerceSpalten([{ titel: 'A', feld: '2_8' }]))
      .toEqual([{ titel: 'A', feld: '2_8', art: 'text' }])
    // Eine UNBEKANNTE Art (Tippfehler im Attribut, spaeter entfernte Art)
    // bleibt stehen — gezeichnet wird sie als Text (spaltenArt faengt sie ab).
    // Hier nicht stillschweigend umschreiben: der Wert des Bauers gehoert ihm.
    expect(coerceSpalten([{ titel: 'A', feld: '', art: 'gibt-es-nicht' }]))
      .toEqual([{ titel: 'A', feld: '', art: 'gibt-es-nicht' }])
    // Erstfassung: reine Titel-Strings -> Feld leer, Art Text.
    expect(coerceSpalten(['A', 'B'])).toEqual([
      { titel: 'A', feld: '', art: 'text' },
      { titel: 'B', feld: '', art: 'text' },
    ])
    // Aeltester Stand: eine Spalten-ZAHL -> generierte Titel.
    expect(coerceSpalten(2)).toEqual([
      { titel: 'Spalte 1', feld: '', art: 'text' },
      { titel: 'Spalte 2', feld: '', art: 'text' },
    ])
    // Kaputt/leer -> Standard (drei Spalten), nie ein Wurf.
    expect(coerceSpalten(null)).toHaveLength(3)
    expect(coerceSpalten('quatsch')).toHaveLength(3)
    // Fehlende Felder in einem Objekt werden ergaenzt (nie undefined).
    expect(coerceSpalten([{ titel: 'X' }])).toEqual([{ titel: 'X', feld: '', art: 'text' }])
  })
})
