// TabelleBlock
// Tabellen-Baustein. Diese Datei haelt, was den BAUSTEIN ausmacht:
// Eigenschaften, Laufzeit-Zustand (Suche/Sortierung/Seite/Auswahl), Messung
// und Lebenszyklus. Alles, was gezeichnet oder gerechnet wird, wohnt in den
// Faechern daneben — ./tabelleAnsicht (was gerade zu sehen ist: Spaltenbreiten,
// Zeilentakt, echte Daten oder Platzhalter, Leerzustand, welche Seite),
// ./tabelleKoerper (Suchzeile, Kopf, Zeilen), ./tabelleFuss (Bedienleiste),
// ./spaltenBearbeiten (Umbenennen, Feld-Picker, „+"/„−"), ./spalten (Modell),
// ./suche, ./sortierung, ./seitengroesse, ./rumpfMessung, ./seRuntime,
// ./tabelleStil.
//
// Der Rahmen ist die TAFEL der Designsprache (designsprache/musterbogen.html,
// .tafel): Papierflaeche, EINE 1,5px-Kante, grosse Rundung, flach.
//
// Die Tafel hat KEINE Kopfzeile — dreimal versucht, dreimal verworfen
// (Nutzer-Ansagen 2026-08-06, alle am selben Tag). Was die Demo dort zeigt:
//   - TITEL: nicht noetig, eine Ueberschrift ueber einer Tabelle ist ein
//     Text-Baustein.
//   - ZAEHLER: die Fusszeile sagt die Zahl schon im Klartext; als dunkle
//     Kachel war er ein schwarzer Klotz im hellen Rahmen.
//   - KNOEPFE als echte Baustein-Kinder (acceptsChildren + allowedChildTypes):
//     gebaut und wieder entfernt. Der Grund ist kein Geschmack, sondern
//     Regel 1: die Editor-Steuerung „+"/„−" sitzt in derselben Ecke. Standen
//     beide in einer Reihe, schoben die „+"/„−" den Knopf im EDITOR nach
//     links, waehrend er im EXPORT (wo es sie nicht gibt) an der Kante klebte
//     — derselbe Bauplan, zwei Bilder. Wer die Knoepfe zurueckholt, muss also
//     zuerst die Steuerung woandershin bringen, sonst kommt der Bruch mit.
// Nichts davon kommt ohne neue Nutzer-Entscheidung zurueck.
//
// EIN Baustein, EIN Rahmen: die Spalten stecken INNEN
// (kein Kind-Baustein je Spalte). Jede Spalte hat einen Titel UND ein Feld:
//   - Titel je Spalte per Doppelklick am Kopf umbenennen (./spaltenBearbeiten)
//   - „+" / „−" oben rechts: Spalte hinzufügen / letzte entfernen
//   - feld = Feldcode der Datenquelle (Technikwert, unsichtbar) — welchen Wert
//     die Spalte je Zeile zeigt. Einfacher Klick auf den Spaltenkopf oeffnet
//     im Editor den Feld-Picker (generisch ueber `listenBindung`).
// Alles Editor-Sichtbare (Steuerung/Inline-Edit) NUR im Editor (data-ff-editor),
// im Export nie (WYSIWYG). KEIN Spaltenbreite-Ziehen (Nutzer 2026-07-23).
//
// Zeilen pro Seite: der Bauer stellt sie im Editor unten AM DING ein
// (./tabelleFuss), Standard „passend zur Hoehe" — dann rechnet
// ./seitengroesse sie aus der gemessenen Hoehe (./rumpfMessung). Ob der
// Bediener in der Maske umstellen darf, ist eine eigene Einstellung
// (`zeilenWaehler`, Standard nein — Nutzer-Entscheidung 2026-08-05).
//
// Daten: an die Tabelle laesst sich eine Datenquelle haengen (acceptsDataSource,
// `source`-Prop -> Inspector-Sektion „Daten", Export -> SEFILELOOP). Zur
// Laufzeit fuellt tabelle/seRuntime die echten Zeilen (setzt `datenzeilen`); im
// Editor bleibt es bei Platzhalter-Strichen „—" (Regel 7 — keine erfundenen Daten).
//
// `spalten` reist als JSON in Prop/Attribut: der Editor setzt die DOM-Property
// (useLitElement), der Export schreibt JSON ins Attribut, der Wandler unten liest
// es zurueck. Alte Staende (reine Titel-Strings aus der Erstfassung, oder eine
// Spalten-ZAHL) werden defensiv auf {titel,feld} abgebildet — keine Migration noetig.
//
// Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*).

import { html, nothing, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { ListenBindung, SatzWahl } from '../../core/blocks/BlockDefinition'
import { geberIdVon, waehleAuswahl } from '../shared/auswahl'
import { LEER_TEXT_STANDARD, leerStil } from '../shared/leerZustand'
import { chipStyles } from '../shared/statusVariant'
import { beobachteRumpf, gemesseneZeilen } from './rumpfMessung'
import { PASSEND } from './seitengroesse'
import { connectTable, disconnectTable } from './seRuntime'
import {
  benenneSpalteUm,
  feldPickerAbbestellen,
  oeffneFeldPicker,
  spaltenSteuerung,
} from './spaltenBearbeiten'
import { zeilenHoeheFuer } from './spaltenArten'
import { SPALTEN_BINDUNG } from './spaltenBindung'
import { tabelleAnsicht } from './tabelleAnsicht'
import { TABELLE_EIGENSCHAFTEN } from './tabelleEigenschaften'
import { tabelleFuss } from './tabelleFuss'
import { tabelleKoerper } from './tabelleKoerper'
import { tabelleStil } from './tabelleStil'
import {
  coerceSpalten,
  standardSpalten,
  tryCoerceSpalten,
  type Spalte,
} from './spalten'

// Das Spalten-Modell wohnt in ./spalten — hier nur die Darstellung.
export { coerceSpalten, type Spalte } from './spalten'

export class TabelleBlock extends BasicBlock {
  static readonly blockType = 'tabelle'
  static readonly tagName = 'ff-tabelle'
  static readonly displayName = 'Tabelle'
  static readonly category: BlockCategory = 'anzeige'
  // Datenquelle anhaengbar (Inspector-Sektion „Daten"); der Export
  // erzeugt daraus den SEFILELOOP. `source` = Technikwert (Vorlagen-id), leer =
  // keine Quelle (Tabelle bleibt statisch mit Platzhaltern).
  static readonly acceptsDataSource = true
  // Auswahl (2026-08-05): der Bediener greift hier einen Satz heraus, indem er
  // eine ZEILE anklickt (zweiter Klick hebt auf) — immer und aus der eigenen
  // Datenquelle, darum eine SatzWahl ohne Bedingung und ohne eigene
  // Quellen-Prop. Ob die Tabelle damit wirklich Auswahl-Geber IST, leitet
  // istAuswahlGeber daraus ab: ohne Quelle zeigt sie nur Platzhalter, dann gibt
  // es nichts abzugeben. Ausserdem kann sie der Auswahl eines anderen Gebers
  // FOLGEN (zeigt dann nur die passenden Zeilen). Beides Registry-Faehigkeiten
  // — Export, Inspector und Laufzeit lesen sie generisch.
  static readonly satzWahl: SatzWahl = {}
  static readonly kannAuswahlFolgen = true
  // Wie eine SPALTE gebunden und eingestellt wird: ./spaltenBindung.
  static readonly listenBindung: ListenBindung = SPALTEN_BINDUNG
  static readonly defaultProps = {
    width: 'fill',
    source: '',
    spalten: standardSpalten(),
    suche: 'ja',
    // Feldcode des Datumsfelds fuer den Tageswaehler (Technikwert,
    // unsichtbar). Leer = kein Tagesfilter, alle Saetze.
    tagField: '',
    // Wie viele Zeilen eine Seite zeigt — der BAUPLAN-Wert, den der Bauer im
    // Editor unten am Ding einstellt (PASSEND oder eine Zahl als Text).
    proSeite: PASSEND,
    // Darf der BEDIENER das in der Maske umstellen? Standard nein: ein Waehler
    // in jeder Maske war eine Einstellung, die niemand bestellt hatte.
    zeilenWaehler: 'nein',
    // Was in der MASKE steht, wenn die Quelle keine Zeile liefert
    // (shared/leerZustand). Der Standard reist nicht als Attribut mit.
    leerText: LEER_TEXT_STANDARD,
  }
  static override readonly customProperties = TABELLE_EIGENSCHAFTEN
  // Raster-Startgröße (Erstwert — im Browser nachzukalibrieren).
  static readonly raster = { startW: 14, startH: 8, minW: 6, minH: 4 }

  // Spalten (Titel + Feld) als JSON in Prop/Attribut. Editor setzt die
  // DOM-Property (useLitElement), Export schreibt JSON ins Attribut; der Wandler
  // liest es zurueck (leer/kaputt -> Standard; coerceSpalten faengt alte Staende).
  @property({
    converter: {
      fromAttribute: (v: string | null): Spalte[] =>
        v ? tryCoerceSpalten(v) : standardSpalten(),
      toAttribute: (v: Spalte[]): string => JSON.stringify(v),
    },
  })
  spalten: Spalte[] = standardSpalten()

  // Datenquelle (Technikwert, Vorlagen-id). Leer = statisch (Platzhalter).
  @property() source = ''

  // Suchzeile ueber der Tabelle ein-/ausschaltbar ('ja' | 'nein').
  @property() suche = 'ja'

  // Bauplan: wie viele Zeilen eine Seite zeigt (PASSEND oder Zahl als Text).
  @property() proSeite = PASSEND

  // Bauplan: darf der Bediener das in der Maske umstellen ('ja' | 'nein')?
  @property() zeilenWaehler = 'nein'

  // Bauplan: der Satz fuer den Leerzustand (leer = gar keine Meldung).
  @property() leerText = LEER_TEXT_STANDARD

  // Was der Bediener zur Laufzeit in die Suchzeile getippt hat.
  private _suchtext = ''

  // Laufzeit-Zeilen (attribute:false): tabelle/seRuntime setzt sie im Export aus
  // den SoftEngine-Daten — je Datenzeile ein Wert-Array, an `spalten` ausgerichtet.
  // Im Editor bleibt es [] -> Platzhalter-Striche (Regel 7).
  @property({ attribute: false }) datenzeilen: string[][] = []

  // Die WERTE der Zusatzfelder, an datenzeilen ausgerichtet (Zeile, Spalte,
  // dann Schluessel -> Wert). Getrennt von datenzeilen, weil dort GENAU EIN
  // Wert je Spalte steht — daran haengen Suche und Sortierung, und die sollen
  // weiter den Wert der Spalte meinen, nicht ihr Beiwerk.
  @property({ attribute: false }) zusatzzeilen: Record<string, string>[][] = []

  // Die ROHEN Zeilenobjekte, an datenzeilen ausgerichtet (gleicher Index).
  // Braucht die Auswahl: die Folger vergleichen Schluesselfelder der
  // gewaehlten Zeile, und die stehen nicht unbedingt in einer Spalte.
  @property({ attribute: false }) rohzeilen: unknown[] = []

  // Index der GEWAEHLTEN Zeile in datenzeilen (-1 = keine). Setzt die
  // Laufzeit (seRuntime) aus dem gemeinsamen Auswahl-Zustand — der Baustein
  // haelt selbst keinen: nach jedem SoftEngine-Push waere er veraltet.
  @property({ attribute: false }) auswahlIndex = -1

  // Zeigt die Tabelle gerade WENIGER, weil sie der Auswahl eines anderen
  // Bausteins folgt? Nur fuer die ehrliche Fusszeile (Regel 4).
  @property({ attribute: false }) durchAuswahlGefiltert = false

  // Hat SoftEngine schon EINMAL geliefert? Setzt ./seRuntime beim Hydrieren.
  // Bedingung des Leerzustands (s. ./suche, zeigtLeerzustand).
  @property({ attribute: false }) datenGeliefert = false

  // Sortier-Zustand (nur Laufzeit/Export, nicht persistiert).
  private _sortSpalte = -1
  private _sortAuf = true

  // Paginierung (nur Laufzeit, nicht persistiert).
  private _seite = 0
  // Was der BEDIENER in der Maske umgestellt hat (null = nichts umgestellt,
  // dann gilt der Bauplan `proSeite`). Bewusst nicht persistiert: seine Wahl
  // gilt fuer seine Sitzung, sie aendert die Maske nicht.
  private _proSeiteWahl: string | null = null

  // Wie viele Zeilen bei der aktuellen Hoehe passen — gemessen, nicht geraten
  // (siehe messeRumpf). null = noch nicht bzw. nicht messbar.
  private _proSeiteGemessen: number | null = null
  private _beobachter: ResizeObserver | null = null

  // Mit welchem Zeilentakt zuletzt gemessen wurde (0 = noch nie). Der Takt
  // haengt an den Spalten-Arten und kann sich ohne jede Groessenaenderung
  // aendern — bindet der Bauer das Bild-Feld, wird die Zeile hoeher, waehrend
  // der Rumpf gleich gross bleibt. Der ResizeObserver merkt davon nichts, also
  // merkt es sich der Baustein und misst danach nach.
  private _taktGemessen = 0

  // Die gerade wirksame Einstellung: die Uebersteuerung des Bedieners, sonst
  // der Bauplan. Das ist auch, was der Waehler als gewaehlt anzeigt.
  private get einstellung(): string {
    return this._proSeiteWahl ?? this.proSeite
  }

  // Der Waehler ist bedient worden. Der EINE Unterschied zwischen den Welten:
  // im Editor schreibt er den BAUPLAN (persistent, mit Undo, im Export als
  // Attribut), in der Maske gilt er nur fuer diese Sitzung. Am Attribut
  // data-ff-editor unterschieden, nicht an `editable`: letzteres ist nur am
  // AUSGEWAEHLTEN Baustein true, ein nicht ausgewaehlter schriebe sonst still
  // Laufzeit-Werte, die niemand wiederfindet.
  private waehleProSeite(wert: string): void {
    if (this.hasAttribute('data-ff-editor')) {
      this.dispatchEvent(new CustomEvent('ff-prop-change', {
        detail: { attr: 'proSeite', value: wert },
        bubbles: true,
        composed: true,
      }))
    } else {
      this._proSeiteWahl = wert
    }
    this._seite = 0
    this.requestUpdate()
  }

  // Nachmessen (./rumpfMessung kennt das WIE und das Warum). Editor UND Maske,
  // eine Render-Quelle (Regel 1): im Editor zieht der Bauer den Baustein
  // groesser und sieht sofort, was in der Maske stehen wird.
  //
  // Neu gezeichnet wird nur, wenn sich die ZAHL aendert: eine Scrollleiste,
  // die kommt oder geht, aendert die Breite und darf keine Zeichen-Schleife
  // anstossen. null (nicht messbar, z. B. im Fluss ohne vorgegebene Hoehe)
  // ist ein gueltiges Ergebnis — dann greift der Rueckfall.
  private messeRumpf(): void {
    const takt = this.zeilenHoehe
    this._taktGemessen = takt
    const zahl = gemesseneZeilen(this, takt)
    if (zahl === this._proSeiteGemessen) return
    this._proSeiteGemessen = zahl
    this.requestUpdate()
  }

  private spaltenListe(): Spalte[] {
    return coerceSpalten(this.spalten)
  }

  // Der Zeilentakt dieser Tabelle: die anspruchsvollste Spalten-Art bestimmt
  // ihn (./spaltenArten). EINE Zahl, drei Leser — das Aussehen (als
  // CSS-Variable), die Messung und die Seitenrechnung.
  private get zeilenHoehe(): number {
    return zeilenHoeheFuer(this.spaltenListe())
  }

  // Klick auf eine Datenzeile in der LAUFZEIT: Auswahl setzen bzw. mit dem
  // zweiten Klick auf dieselbe Zeile wieder aufheben (Toggle). Der Zustand
  // wohnt im gemeinsamen Auswahl-Modul (shared/auswahl) — von dort kommt er
  // ueber die Neu-Hydrierung als auswahlIndex zurueck. Im Editor passiert
  // nichts (keine erfundene Auswahl, Regel 7).
  private klickZeile(rohIndex: number | null): void {
    if (rohIndex === null || this.hasAttribute('data-ff-editor')) return
    const geberId = geberIdVon(this)
    const zeile = this.rohzeilen[rohIndex]
    if (geberId === '' || zeile === undefined) return
    waehleAuswahl(geberId, zeile)
  }

  // Tippen in der Suchzeile: zurueck auf Seite 1 — sonst steht der Bediener
  // auf Seite 5 einer Liste, die nach dem Filtern nur noch zwei Seiten hat.
  private setzeSuchtext(text: string): void {
    this._suchtext = text
    this._seite = 0
    this.requestUpdate()
  }

  // Klick auf den Spaltenkopf in der LAUFZEIT: erst absteigend?  Nein —
  // erst aufsteigend, zweiter Klick dreht um (Explorer-Verhalten).
  // Nach dem Sortieren immer zurueck auf Seite 1: sonst steht der Bediener
  // auf Seite 7 einer Liste, die er gerade neu geordnet hat.
  private klickSortiere(index: number): void {
    if (this.editable) return
    if (this._sortSpalte === index) {
      this._sortAuf = !this._sortAuf
    } else {
      this._sortSpalte = index
      this._sortAuf = true
    }
    this._seite = 0
    this.requestUpdate()
  }

  // Eigene Prop ändern = 'ff-prop-change' an den BlockHost (Muster inlineEdit).
  private aendere(spalten: Spalte[]): void {
    this.dispatchEvent(
      new CustomEvent('ff-prop-change', {
        detail: { attr: 'spalten', value: spalten },
        bubbles: true,
        composed: true,
      }),
    )
  }

  // Anmelden. Aus BEIDEN Einstiegen aufgerufen: beim ersten Mal gibt es noch
  // kein gezeichnetes Innenleben (firstUpdated holt es nach), beim
  // Wieder-Einhaengen ins DOM steht es schon (connectedCallback) — und dort
  // MUSS neu angemeldet werden, weil disconnectedCallback abmeldet. Sonst
  // maesse ein verschobener Baustein nie wieder. Bleibt der Beobachter null
  // (kein ResizeObserver, noch kein Rumpf), wird es beim naechsten Einstieg
  // erneut versucht.
  private beobachte(): void {
    if (this._beobachter) return
    this._beobachter = beobachteRumpf(this, () => this.messeRumpf())
    if (this._beobachter) this.messeRumpf()
  }

  override connectedCallback(): void {
    super.connectedCallback()
    connectTable(this)
    this.beobachte()
  }

  protected override firstUpdated(): void {
    this.beobachte()
  }

  // Nachmessen, wenn sich der TAKT geaendert hat (s. _taktGemessen). Terminiert
  // von selbst: messeRumpf zeichnet nur neu, wenn sich die Zeilenzahl wirklich
  // aendert, und beim zweiten Durchlauf stimmt der gemerkte Takt schon.
  protected override updated(): void {
    if (this._taktGemessen !== this.zeilenHoehe) this.messeRumpf()
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    feldPickerAbbestellen(this)
    this._beobachter?.disconnect()
    this._beobachter = null
    disconnectTable(this)
  }

  // chipStyles ist die GETEILTE Marke (../shared/statusVariant) — dieselbe,
  // die Karte und Kanban-Spalte tragen. Eine Status-Spalte zeichnet sie, statt
  // sie abzuschreiben: sonst haette die Designsprache drei Marken, die
  // auseinanderlaufen koennen.
  static override styles = [BasicBlock.styles, chipStyles, leerStil, tabelleStil]

  override render(): TemplateResult {
    const spalten = this.spaltenListe()
    const stop = (e: Event): void => e.stopPropagation()
    // WAS zu sehen ist — Spaltenbreiten, Zeilentakt, echte Daten oder
    // Platzhalter, Leerzustand, Seite — rechnet ./tabelleAnsicht an EINER Stelle
    // aus. Der Baustein reicht nur seine Werte hinein.
    const ansicht = tabelleAnsicht({
      spalten,
      imEditor: this.hasAttribute('data-ff-editor'),
      source: this.source,
      datenGeliefert: this.datenGeliefert,
      datenzeilen: this.datenzeilen,
      suchtext: this._suchtext,
      sortSpalte: this._sortSpalte,
      sortAuf: this._sortAuf,
      wunschSeite: this._seite,
      einstellung: this.einstellung,
      gemessen: this._proSeiteGemessen,
    })
    return html`<div class="tabelle" style=${styleMap({
      // EINE Zahl, EINE Stelle: der Takt kommt aus den Spalten-Arten
      // (./spaltenArten, zeilenHoeheFuer), damit die Optik (Linien) und die
      // Rechnung (wie viele passen) nicht auseinander laufen koennen.
      // (--spalten-zahl stand hier bis 2026-08-06 daneben; das Lineal brauchte
      // sie fuer seine senkrechten Striche im Verlauf. Es zeichnet sie jetzt
      // mit echten Zellen im Spaltenraster, und die Zahl ist ersatzlos weg.)
      '--zeilen-hoehe': `${ansicht.zeilenHoehe}px`,
    })}>
      ${spaltenSteuerung(() => this.spaltenListe(), (l) => this.aendere(l), stop)}
      ${tabelleKoerper({
        spalten,
        cols: ansicht.cols,
        editable: this.editable,
        zeigeSuche: this.suche === 'ja',
        suchtext: this._suchtext,
        sortSpalte: this._sortSpalte,
        sortAuf: this._sortAuf,
        zeilen: ansicht.zeilen,
        linealTakte: ansicht.linealTakte,
        datenzeilen: this.datenzeilen,
        zusatzzeilen: this.zusatzzeilen,
        hatQuelle: ansicht.hatQuelle,
        auswahlIndex: this.auswahlIndex,
        leer: ansicht.leer,
        leerText: this.leerText,
      }, {
        setzeSuchtext: (text) => this.setzeSuchtext(text),
        dblklickKopf: (e, i) => {
          if (!this.editable) return
          // Umbenennen gewinnt: den wartenden Feld-Picker abbestellen.
          feldPickerAbbestellen(this)
          benenneSpalteUm(e, i, () => this.spaltenListe(), (l) => this.aendere(l))
        },
        klickKopf: (e, i) => {
          // Editor: Feld-Picker (verzoegert, s. spaltenBearbeiten).
          // Laufzeit: sortieren. Nie beides — editable trennt die Welten.
          if (this.editable) oeffneFeldPicker(this, e, TabelleBlock.listenBindung.prop, i)
          this.klickSortiere(i)
        },
        klickZeile: (rohIndex) => this.klickZeile(rohIndex),
        stop,
      })}
      ${/* Im Leerzustand faellt die Fusszeile weg: „Seite 1 von 1" und ein
            Waehler „Zeilen pro Seite" sind Bedienelemente ohne Gegenstand. */ ''}
      ${ansicht.leer ? nothing : tabelleFuss({
        hatQuelle: ansicht.hatQuelle,
        sichtbar: ansicht.gesamt,
        gesamt: this.datenzeilen.length,
        suchtAktiv: this._suchtext.trim() !== '',
        auswahlAktiv: this.durchAuswahlGefiltert,
        // Im Editor steht der Waehler IMMER — dort stellt der Bauer ihn ein.
        // In der Maske nur, wenn er es erlaubt hat.
        zeigeWaehler: this.hasAttribute('data-ff-editor') || this.zeilenWaehler === 'ja',
        einstellung: this.einstellung,
        seite: ansicht.seite,
        seiten: ansicht.seiten,
      }, {
        waehleProSeite: (wert) => this.waehleProSeite(wert),
        blaettere: (zu) => {
          this._seite = zu
          this.requestUpdate()
        },
        stop,
      })}
    </div>`
  }
}

BasicBlock.defineAndRegister(TabelleBlock)
