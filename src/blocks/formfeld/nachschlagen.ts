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
import {
  DIALOG_RAHMEN_TAG,
  DIALOG_SCHLIESSEN_EVENT,
  type DialogRahmen,
} from '../shared/DialogRahmen'
import { zeilePasst } from '../shared/textSuche'

export interface NachschlagenArgs {
  quelleId: string
  anzeigeFeld: string
  speicherFeld: string
  anzeigeTitel: string
  speicherTitel: string
  titel: string
  onUebernehmen: (anzeige: string, wert: string) => void
}

interface Eintrag {
  anzeige: string
  wert: string
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
    if (anzeige !== '' || wert !== '') eintraege.push({ anzeige, wert })
  }
  return eintraege
}

// Suche ueber BEIDE Spalten — dieselbe Regel wie die Tabellen-Suchzeile
// (shared/textSuche), damit derselbe Kunde hier und dort gefunden wird.
export function nachschlagTreffer(eintraege: readonly Eintrag[], suchtext: string): Eintrag[] {
  return eintraege.filter((eintrag) => zeilePasst([eintrag.anzeige, eintrag.wert], suchtext))
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
      + 'border-bottom:1px solid var(--se-line);background:var(--se-panel-2)'
    : 'box-sizing:border-box;height:24px;padding:3px 10px;overflow:hidden;text-overflow:ellipsis;'
      + 'white-space:nowrap;border-bottom:1px solid var(--se-line-soft)'
  return element
}

function seitenKnopf(text: string, label: string): HTMLButtonElement {
  const knopf = document.createElement('button')
  knopf.type = 'button'
  knopf.textContent = text
  knopf.setAttribute('aria-label', label)
  knopf.style.cssText = 'box-sizing:border-box;width:26px;height:24px;padding:0;'
    + 'border:1px solid var(--se-line);border-radius:var(--se-r-sm);'
    + 'background:var(--se-panel);color:var(--se-ink);font:inherit;cursor:pointer'
  return knopf
}

export function oeffneNachschlagen(args: NachschlagenArgs): void {
  // Halb eingestellt: der Preflight blockt so etwas schon beim Export, aber
  // eine alte Maske kann es tragen. Dann sagt die Maske im Klartext, was
  // fehlt, statt still nichts zu tun (Regel 4).
  if (args.quelleId === '' || args.anzeigeFeld === '' || args.speicherFeld === '') {
    meldeFehler('Nachschlagen ist an diesem Feld nicht vollstaendig eingestellt (Quelle, Angezeigt, Gespeichert).')
    return
  }

  const quelle = findRuntimeDataSource(seGlobal().FF_DATA_SOURCES, args.quelleId)
  if (!quelle) {
    meldeFehler('Die Nachschlage-Quelle dieses Feldes ist in der Maske nicht vorhanden.')
    return
  }

  schliesse()
  const eintraege = nachschlagEintraege(
    rowsFor(seGlobal().SEDATA, quelle.name, quelle.tableId),
    args.anzeigeFeld,
    args.speicherFeld,
  )

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
    + 'border:1px solid var(--se-line);border-radius:var(--se-r-sm)'

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
    + 'min-height:33px;padding:4px 10px;border-top:1px solid var(--se-line);'
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
  const weiter = seitenKnopf('›', 'Naechste Seite')
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
        eintraege.length === 0 ? 'Diese Quelle hat keine Saetze.' : 'Kein Satz passt zur Suche.',
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
        args.onUebernehmen(trefferZeile.anzeige, trefferZeile.wert)
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
