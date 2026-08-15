// Nachschlagen (die Lupe am Formularfeld)
//
// Der Bediener klickt die Lupe, ein Fenster zeigt die Saetze einer zweiten
// Datenquelle mit Suchzeile und Blaettern; ein Klick uebernimmt einen Satz.
// Das Feld ZEIGT danach den Klarwert („Berger, Anna") und MERKT sich den
// Technikwert („10024") — Regel 3 in Reinform.
//
// Wofuer es da ist: eine Klappliste mit 8.000 Adressen ist unbenutzbar. Das
// Nachschlagen ist die Form fuer grosse Bestaende — suchen statt scrollen.
//
// Kein Baustein: das Fenster entsteht erst beim Klick, es liegt nie im Baum
// und wird nie exportiert. Exportiert wird nur das FELD samt seiner
// Einstellungen; das Fenster baut die Laufzeit daraus.
//
// Die reinen Datenwege (Eintraege bauen, suchen) sind absichtlich eigene
// Funktionen und getestet — das DOM darunter prueft der Nutzer im Browser.

import { seGlobal } from '../../softengine/bridge'
import { findRuntimeDataSource, getField, rowsFor } from '../../softengine/data'
import { meldeFehler } from '../../softengine/meldung'
import { zeilenNachAuswahl } from '../shared/auswahl'
import {
  DIALOG_RAHMEN_TAG,
  DIALOG_SCHLIESSEN_EVENT,
  type DialogRahmen,
} from '../shared/DialogRahmen'
import { zeilePasst } from '../shared/textSuche'

export interface NachschlagenArgs {
  // Das Feld selbst. Aus seinen Attributen liest die Folge-Mechanik, WESSEN
  // Auswahl das Fenster einengt — dieselbe Stelle, aus der die Tabelle es liest.
  el: HTMLElement
  quelleId: string
  anzeigeFeld: string
  speicherFeld: string
  anzeigeTitel: string
  speicherTitel: string
  titel: string
  onUebernehmen: (anzeige: string, wert: string, satz: unknown) => void
}

export interface Eintrag {
  anzeige: string
  wert: string
  // Die ROHZEILE hinter dem Eintrag. Das Fenster zeigt nur zwei Spalten, das
  // Feld gibt aber den ganzen SATZ als Auswahl ab (Geber) — Folger holen sich
  // daraus beliebige Schluesselfelder, nicht nur die zwei sichtbaren.
  satz: unknown
}

// Was die Einstellungen eines Nachschlage-Felds ausmacht. Beide Wege — die
// Lupe und die stille Uebernahme — brauchen genau das.
export interface NachschlagEinstellung {
  el: HTMLElement
  quelleId: string
  anzeigeFeld: string
  speicherFeld: string
}

const SEITENGROESSE = 10

// Aus den Rohzeilen der Quelle die zwei sichtbaren Spalten bauen.
// Voellig leere Zeilen fallen weg (sie waeren eine anklickbare Leerzeile,
// die nichts uebernimmt); HALB leere bleiben — eine Adresse ohne Namen ist
// immer noch ein Satz, den der Bediener meinen kann.
export function nachschlagEintraege(
  rows: readonly unknown[],
  anzeigeFeld: string,
  speicherFeld: string,
): Eintrag[] {
  const eintraege: Eintrag[] = []
  for (const row of rows) {
    const anzeige = getField(row, anzeigeFeld).trim()
    const wert = getField(row, speicherFeld).trim()
    if (anzeige !== '' || wert !== '') eintraege.push({ anzeige, wert, satz: row })
  }
  return eintraege
}

// Suche ueber BEIDE Spalten — dieselbe Regel wie die Tabellen-Suchzeile
// (shared/textSuche), damit derselbe Kunde hier und dort gefunden wird.
export function nachschlagTreffer(eintraege: readonly Eintrag[], suchtext: string): Eintrag[] {
  return eintraege.filter((eintrag) => zeilePasst([eintrag.anzeige, eintrag.wert], suchtext))
}

// Die Eintraege, die das Fenster ZEIGT — der ganze Datenweg der Lupe in einer
// Zeile: erst die Folge-Filterung, dann die zwei sichtbaren Spalten.
//
// FOLGE (2026-08-06): steht am Feld eine Auswahl-Folge, zeigt die Lupe nur die
// Zeilen, deren Schluesselfelder zur gewaehlten Zeile des Gebers passen. Der
// Fall des Nutzers: ein Kunde-Feld und ein Haustier-Feld, das ihm folgt — die
// Lupe zeigt dann nur die Haustiere DIESES Kunden statt aller 8.000.
// Ohne Auswahl beim Geber bleiben alle Zeilen stehen, genau wie bei der
// folgenden Tabelle.
//
// Von SELBST passiert dabei normalerweise nichts — der Bediener uebernimmt mit
// einem Klick, und nur er (Standard, Nutzer 2026-08-05). Die eine bewusste
// Ausnahme schaltet der Bauer je Feld frei („Einzigen Treffer uebernehmen",
// s. einzigenTrefferFinden unten): bleibt genau ein Satz uebrig, gibt es nichts mehr
// zu waehlen, und die Lupe waere eine Handbewegung ohne Wahl.
//
// Gefiltert wird mit der GETEILTEN Mechanik (shared/auswahl), nie mit einer
// zweiten Filter-Logik daneben: sonst zeigte dieses Fenster die Haustiere eines
// anderen Kunden als die Tabelle daneben.
export function fensterEintraege(
  el: HTMLElement,
  rows: unknown[],
  anzeigeFeld: string,
  speicherFeld: string,
): Eintrag[] {
  return nachschlagEintraege(zeilenNachAuswahl(el, rows).rows, anzeigeFeld, speicherFeld)
}

// Die Einstellungen sind halb fertig, oder die Quelle steht nicht in der
// Maske. WAS dann geschieht, entscheidet der Aufrufer: die Lupe sagt es im
// Klartext (Bedienerhandlung, Regel 4), der stille Weg tut einfach nichts.
export type EintraegeErgebnis =
  | { ok: true; eintraege: Eintrag[] }
  | { ok: false; grund: 'unvollstaendig' | 'quelleFehlt' }

// Die Eintraege des Fensters beschaffen: Quelle finden, Zeilen holen, filtern,
// Spalten bauen. EINE Stelle fuer die Lupe UND die stille Uebernahme — zwei
// Abschriften koennten verschieden urteilen, und dann uebernaehme das Feld von
// selbst einen anderen Satz als den, den die Lupe zeigt.
export function holeEintraege(e: NachschlagEinstellung): EintraegeErgebnis {
  if (e.quelleId === '' || e.anzeigeFeld === '' || e.speicherFeld === '') {
    return { ok: false, grund: 'unvollstaendig' }
  }
  const quelle = findRuntimeDataSource(seGlobal().FF_DATA_SOURCES, e.quelleId)
  if (!quelle) return { ok: false, grund: 'quelleFehlt' }
  const rows = rowsFor(seGlobal().SEDATA, quelle.name, quelle.tableId)
  return { ok: true, eintraege: fensterEintraege(e.el, rows, e.anzeigeFeld, e.speicherFeld) }
}

// „Es gibt nichts mehr zu waehlen": genau EIN Eintrag ist uebrig und das Feld
// ist noch leer — dann ist DAS der Satz, den der Bediener meinen kann.
// Nutzer-Entscheidung 2026-08-05, nur mit der Einstellung am Feld
// (`einzigerTreffer` — die Einstellung ist das Substantiv, dies hier das Verb).
//
// Die Bedingung „Feld leer" ist nicht Bequemlichkeit, sondern der Riegel gegen
// zwei Fehler: ein bestaetigter Wert darf nie still durch einen anderen
// ersetzt werden, und ins gefuellte Feld nichts zu schreiben heisst, dass
// derselbe Anlass beliebig oft laufen kann, ohne sich aufzuschaukeln.
export function einzigenTrefferFinden(
  eintraege: readonly Eintrag[],
  feldLeer: boolean,
): Eintrag | null {
  return feldLeer && eintraege.length === 1 ? eintraege[0] : null
}

// Passt der schon uebernommene Satz noch zur Auswahl des Gebers?
//
// Der Bediener waehlt einen Kunden, uebernimmt dessen Haustier — und wechselt
// dann den Kunden. Das Haustier gehoert jetzt zu niemandem mehr: ein falscher
// Wert, der richtig aussieht. Der Baustein leert sich daraufhin (FormFeldBlock).
//
// Geprueft wird mit DERSELBEN Schluessel-Logik wie die Fenster-Filterung, nur
// angewandt auf den EINEN gemerkten Satz — kein zweites Vergleichen daneben,
// das anders urteilen koennte als das Fenster.
//
// Ohne aktive Auswahl beim Geber (nichts gewaehlt, wieder rausgeklickt) passt
// er weiter: dann zeigt das Fenster ohnehin alles, und ein Wert, den der
// Bediener selbst bestaetigt hat, verschwindet nicht von allein.
export function satzPasstZurAuswahl(el: HTMLElement, satz: unknown): boolean {
  const { rows, gefiltert } = zeilenNachAuswahl(el, [satz])
  return !gefiltert || rows.length > 0
}

// Was passiert, wenn der Bediener das Nachschlage-Feld VERLAESST?
//
// Vorgeschichte (2026-08-07): im Feld sass ein ×-Knopf zum Loeschen. Er ist
// raus — geloescht wird wie in jedem anderen Feld, mit der Tastatur. Damit
// wird das Feld tippbar, und ein tippbares Feld kann etwas HALBES enthalten:
// „Berg" statt „Berger, Anna". Stehen liesse das einen frei getippten Text
// ueber einem alten Technikwert — die Maske zeigte „Berg", geschrieben wuerde
// weiter 10024. Genau die Luege, gegen die Regel 3 gebaut ist.
//
// Drei Ausgaenge, und nur diese drei:
//   'leeren'  Das Feld ist leer. Anzeige, Technikwert, gemerkter Satz und die
//             abgegebene Auswahl gehen mit — und weil es eine BEDIENER-
//             handlung ist, feuert 'change' und die Kette „Wert geaendert"
//             laeuft mit leerem Wert.
//   'zurueck' Etwas Halbes steht drin: zurueck auf den zuletzt bestaetigten
//             Text. Kein 'change' — es hat sich nichts geaendert.
//   'nichts'  Durchgeklickt, nichts angefasst.
//
// Verglichen wird ZEICHENGENAU (kein trim), aus zwei Gruenden: ein
// bestaetigter Anzeigewert darf selbst aus Leerzeichen bestehen, und ein
// versehentlich stehen gebliebenes Leerzeichen ist „halb getippt", nicht
// „geleert" — den Wert wegzunehmen soll man wollen muessen.
export type VerlassenFolge = 'nichts' | 'leeren' | 'zurueck'

export function folgeBeimVerlassen(
  // Was gerade IM Feld steht.
  getippt: string,
  // Was zuletzt bestaetigt wurde: der angezeigte Klarwert und der Technikwert.
  bestaetigteAnzeige: string,
  bestaetigterWert: string,
): VerlassenFolge {
  if (getippt === '') {
    // War schon leer? Dann ist Durchklicken keine Bedienerhandlung — sonst
    // fiele bei jedem Tabben durch ein leeres Feld eine Kette an.
    return bestaetigteAnzeige === '' && bestaetigterWert === '' ? 'nichts' : 'leeren'
  }
  return getippt === bestaetigteAnzeige ? 'nichts' : 'zurueck'
}

// Es ist immer hoechstens EIN Fenster offen: ein zweites ueber dem ersten
// waere nicht mehr zuzuordnen (welches Feld fuellt es?).
let offen: DialogRahmen | null = null

function schliesse(): void {
  offen?.remove()
  offen = null
}

function zelle(text: string, kopf = false): HTMLTableCellElement {
  const element = document.createElement(kopf ? 'th' : 'td')
  element.textContent = text
  element.style.cssText = kopf
    ? 'position:sticky;top:0;z-index:1;padding:6px 10px;text-align:left;'
      + 'font-size:var(--se-fs-sm);font-weight:600;color:var(--se-muted);'
      + 'border-bottom:var(--se-border) solid var(--se-line);background:var(--se-panel-2)'
    : 'box-sizing:border-box;height:24px;padding:3px 10px;overflow:hidden;text-overflow:ellipsis;'
      + 'white-space:nowrap;border-bottom:var(--se-border) solid var(--se-line-soft)'
  return element
}

function seitenKnopf(text: string, label: string): HTMLButtonElement {
  const knopf = document.createElement('button')
  knopf.type = 'button'
  knopf.textContent = text
  knopf.setAttribute('aria-label', label)
  knopf.style.cssText = 'box-sizing:border-box;width:26px;height:24px;padding:0;'
    + 'border:var(--se-border) solid var(--se-line);border-radius:var(--se-r-sm);'
    + 'background:var(--se-panel);color:var(--se-ink);font:inherit;cursor:pointer'
  return knopf
}

export function oeffneNachschlagen(args: NachschlagenArgs): void {
  // Die Eintraege stehen fest, sobald das Fenster aufgeht: die Auswahl des
  // Gebers kann sich waehrend des Suchens nicht aendern (der Bediener steht
  // hier drin), und ein Daten-Push mitten in der Liste liesse ihn suchen,
  // waehrend sich die Zeilen unter dem Finger verschieben.
  const ergebnis = holeEintraege(args)
  if (!ergebnis.ok) {
    // Die Lupe ist eine BEDIENERHANDLUNG: sie darf nie still nichts tun
    // (Regel 4). Halb Eingestelltes meldet der Preflight zwar, blockt den
    // Export aber seit 2026-08-10 nicht mehr — jede Maske kann es also tragen,
    // und dann sagt die Maske selbst im Klartext, was fehlt. Das hier ist die
    // letzte Instanz. Zwei Ursachen, zwei Meldungen: die eine heilt der Bauer im
    // Editor, die andere steckt in den Daten der Maske.
    meldeFehler(ergebnis.grund === 'unvollstaendig'
      ? 'Nachschlagen ist an diesem Feld nicht vollstaendig eingestellt (Quelle, Angezeigt, Gespeichert).'
      : 'Die Nachschlage-Quelle dieses Feldes ist in der Maske nicht vorhanden.')
    return
  }
  const eintraege = ergebnis.eintraege

  schliesse()

  const dialog = document.createElement(DIALOG_RAHMEN_TAG) as DialogRahmen
  dialog.setAttribute('data-ff-nachschlagen', '')
  dialog.viewport = true
  dialog.mitWerkzeug = true
  dialog.escapeSchliesst = true
  dialog.titel = args.titel !== '' ? args.titel : 'Nachschlagen'
  dialog.breite = 520
  dialog.hoehe = 380
  dialog.addEventListener(DIALOG_SCHLIESSEN_EVENT, schliesse)
  // Klicks im Fenster gehoeren dem Fenster: ohne das zaehlte ein Klick auf
  // eine Trefferzeile zugleich als Klick auf den Baustein darunter.
  dialog.addEventListener('click', (event) => event.stopPropagation())

  const suche = document.createElement('input')
  suche.slot = 'werkzeug'
  suche.type = 'search'
  suche.placeholder = 'suchen ...'
  suche.setAttribute('aria-label', 'Nachschlagen durchsuchen')
  suche.style.cssText = 'box-sizing:border-box;width:100%;padding:5px 8px;'
    + 'font:inherit;color:inherit;background:var(--se-panel);'
    + 'border:var(--se-border) solid var(--se-line);border-radius:var(--se-r-sm)'

  const tabelle = document.createElement('table')
  tabelle.style.cssText = 'width:100%;table-layout:fixed;border-collapse:collapse'
  const spalten = document.createElement('colgroup')
  const anzeigeSpalte = document.createElement('col')
  anzeigeSpalte.style.width = '65%'
  const wertSpalte = document.createElement('col')
  wertSpalte.style.width = '35%'
  spalten.append(anzeigeSpalte, wertSpalte)

  // Die Spaltenkoepfe tragen die KLARNAMEN der gewaehlten Felder (Regel 3) —
  // ohne sie stuende hier „10_30" statt „Name".
  const kopf = document.createElement('thead')
  const kopfZeile = document.createElement('tr')
  kopfZeile.append(
    zelle(args.anzeigeTitel !== '' ? args.anzeigeTitel : 'Angezeigt', true),
    zelle(args.speicherTitel !== '' ? args.speicherTitel : 'Wert', true),
  )
  kopf.appendChild(kopfZeile)

  const rumpf = document.createElement('tbody')
  tabelle.append(spalten, kopf, rumpf)

  const tabellenBereich = document.createElement('div')
  tabellenBereich.style.cssText = 'flex:1 1 auto;min-height:0;overflow:auto'
  tabellenBereich.appendChild(tabelle)

  const fuss = document.createElement('div')
  fuss.style.cssText = 'box-sizing:border-box;flex:none;display:flex;align-items:center;'
    + 'min-height:33px;padding:4px 10px;border-top:var(--se-border) solid var(--se-line);'
    + 'background:var(--se-panel-2);font-size:var(--se-fs-sm)'
  const zaehler = document.createElement('span')
  zaehler.setAttribute('aria-live', 'polite')
  zaehler.style.cssText = 'flex:1;color:var(--se-muted)'

  const navigation = document.createElement('nav')
  navigation.setAttribute('aria-label', 'Trefferseiten')
  navigation.style.cssText = 'display:flex;align-items:center;gap:6px'
  const zurueck = seitenKnopf('‹', 'Vorherige Seite')
  const seitenstand = document.createElement('span')
  seitenstand.style.cssText = 'min-width:48px;text-align:center;color:var(--se-muted)'
  const weiter = seitenKnopf('›', 'Nächste Seite')
  navigation.append(zurueck, seitenstand, weiter)
  fuss.append(zaehler, navigation)

  const inhalt = document.createElement('div')
  inhalt.style.cssText = 'box-sizing:border-box;height:100%;min-height:0;display:flex;flex-direction:column'
  inhalt.append(tabellenBereich, fuss)

  let seite = 1
  let seiten = 1

  const zeichneTreffer = (): void => {
    rumpf.replaceChildren()
    const treffer = nachschlagTreffer(eintraege, suche.value)
    seiten = Math.max(1, Math.ceil(treffer.length / SEITENGROESSE))
    seite = Math.min(seite, seiten)
    const start = (seite - 1) * SEITENGROESSE
    const sichtbareTreffer = treffer.slice(start, start + SEITENGROESSE)

    zaehler.textContent = treffer.length === 0
      ? '0 von 0'
      : `${start + 1}-${Math.min(start + SEITENGROESSE, treffer.length)} von ${treffer.length}`
    seitenstand.textContent = `${seite} / ${seiten}`
    zurueck.disabled = seite === 1
    weiter.disabled = seite === seiten
    zurueck.style.opacity = zurueck.disabled ? '0.4' : '1'
    weiter.style.opacity = weiter.disabled ? '0.4' : '1'
    zurueck.style.cursor = zurueck.disabled ? 'default' : 'pointer'
    weiter.style.cursor = weiter.disabled ? 'default' : 'pointer'
    tabellenBereich.scrollTop = 0

    if (sichtbareTreffer.length === 0) {
      // Zwei verschiedene Leermeldungen: „die Quelle ist leer" ist ein
      // anderes Problem als „deine Suche trifft nichts", und der Bediener
      // muss wissen, welches er hat.
      const zeile = document.createElement('tr')
      const leer = zelle(
        eintraege.length === 0 ? 'Diese Quelle hat keine Sätze.' : 'Kein Satz passt zur Suche.',
      )
      leer.colSpan = 2
      leer.style.color = 'var(--se-faint)'
      leer.style.fontSize = 'var(--se-fs-sm)'
      leer.style.padding = '16px 10px'
      zeile.appendChild(leer)
      rumpf.appendChild(zeile)
      return
    }

    for (const trefferZeile of sichtbareTreffer) {
      const zeile = document.createElement('tr')
      zeile.tabIndex = 0
      zeile.style.cursor = 'pointer'
      const anzeige = zelle(trefferZeile.anzeige)
      const wert = zelle(trefferZeile.wert)
      wert.style.fontFamily = 'var(--se-mono)'
      wert.style.color = 'var(--se-muted)'
      zeile.append(anzeige, wert)

      const uebernehmen = (): void => {
        schliesse()
        args.onUebernehmen(trefferZeile.anzeige, trefferZeile.wert, trefferZeile.satz)
      }
      zeile.addEventListener('click', uebernehmen)
      zeile.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return
        event.preventDefault()
        uebernehmen()
      })
      zeile.addEventListener('mouseenter', () => {
        zeile.style.background = 'var(--se-accent-soft)'
      })
      zeile.addEventListener('mouseleave', () => {
        zeile.style.background = ''
      })
      rumpf.appendChild(zeile)
    }
  }

  suche.addEventListener('input', () => {
    // Jede neue Suche faengt auf Seite 1 an — sonst stuende man nach dem
    // Tippen auf Seite 4 einer Trefferliste, die nur noch zwei Seiten hat.
    seite = 1
    zeichneTreffer()
  })
  zurueck.addEventListener('click', () => {
    if (seite === 1) return
    seite -= 1
    zeichneTreffer()
  })
  weiter.addEventListener('click', () => {
    if (seite === seiten) return
    seite += 1
    zeichneTreffer()
  })
  zeichneTreffer()
  dialog.append(suche, inhalt)
  document.body.appendChild(dialog)
  offen = dialog
  void dialog.updateComplete.then(() => {
    if (dialog.isConnected) suche.focus()
  })
}
