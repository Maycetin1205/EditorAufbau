// E2E-Prüfung Kap. 5.3 (Kanban-Datenverhalten im Export) im echten Browser.
// Nur hier real abbildbar: die exportierte Maske bootet ihr Runtime-Bündel,
// die ff-kanban-Elemente hydrieren aus einem gestellten SEDATA (dieselbe
// Datenform wie die Referenzmaske dashboard/praxis-kanban.html), Karten
// entstehen aus Zeilen, der Kartenzähler läuft über slotchange.
//
// Ablauf: Board im Editor aufbauen (Quelle anhängen, Titel-Stelle binden,
// Spalten-Feld + Datenwerte setzen), über den Toolbar-Knopf exportieren,
// die Maske mit gestelltem SEDATA laden und das Ergebnis prüfen.

import { readFile } from 'node:fs/promises'
import { test, expect, type Download, type Page } from '@playwright/test'

async function freshEditor(page: Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByRole('button', { name: 'Kanban' }).waitFor()
}

async function insertBoard(page: Page) {
  await page.getByRole('button', { name: 'Kanban', exact: true }).click()
  await expect(page.locator('ff-kanban-spalte')).toHaveCount(3)
}

// Board selektieren: direkter Klick am Board-Element (bubbelt zum BlockHost
// des Boards, nie durch eine Spalte) — die Spalten sind seit S3 fliessend,
// eine feste Klick-Position gibt es nicht mehr.
async function selectBoard(page: Page) {
  await page.locator('ff-kanban').evaluate((el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  await expect(page.getByText('kanban ·')).toBeVisible() // Inspector-Kopf
}

async function attachTerminplaner(page: Page) {
  await selectBoard(page)
  await page.getByRole('button', { name: /Daten anschlie/ }).click()
  const dialog = page.getByRole('dialog', { name: /Daten anschlie/ })
  await dialog.getByRole('group', { name: 'Datenquelle' })
    .getByRole('button', { name: 'Terminplaner' }).click()
  await dialog.getByRole('button', { name: 'Fertig' }).click()
}

async function chooseEinsortierFeld(page: Page, field: string) {
  await selectBoard(page)
  await page.getByRole('button', { name: /Daten anschlie/ }).click()
  const dialog = page.getByRole('dialog', { name: /Daten anschlie/ })
  const gruppe = dialog.getByRole('group', { name: 'Einsortieren nach' })
  await expect(gruppe.getByRole('button', { name: '253_30' })).toHaveCount(0)
  await gruppe.getByRole('button', { name: field }).click()
  await dialog.getByRole('button', { name: 'Fertig' }).click()
}

// Spaltentitel per Doppelklick setzen — der TITEL ist seit 2026-07-14 der
// Datenwert der Spalte (Titel = Wert; das Inspector-Feld "Datenwert dieser
// Spalte" ist abgeschafft). Muster: Titel-Edit in kanban.spec.ts.
async function renameColumn(page: Page, nth: number, title: string) {
  await page.locator('ff-kanban-spalte .head').nth(nth).click()
  await page.locator('ff-kanban-spalte .title').nth(nth).dblclick()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type(title)
  await page.keyboard.press('Enter')
  await expect(page.locator('ff-kanban-spalte .title').nth(nth)).toHaveText(title)
}

// Toolbar-Export anstoßen und den HTML-Inhalt einsammeln (Dateinamen nach
// SE-Konvention: index.basis.source.html + index.basis.SEvariablen.json).
async function exportMaskHtml(page: Page): Promise<string> {
  const downloads: Download[] = []
  page.on('download', (d) => downloads.push(d))
  await page.getByRole('button', { name: 'Als SoftEngine-Maske exportieren' }).click()
  await expect.poll(() => downloads.length).toBe(2)
  const maske = downloads.find((d) => d.suggestedFilename() === 'index.basis.source.html')
  if (!maske) throw new Error('index.basis.source.html wurde nicht heruntergeladen')
  return await readFile(await maske.path(), 'utf8')
}

// SEDATA-Stub in der Form der Referenzmaske: Zeilen des Terminplaners mit
// Zimmer (253_30) + Tiername (78_30) als direkte Feld-Properties.
const SEDATA_STUB = {
  Daten: {
    SEFileLoop: [{
      ALIAS: 'Terminplaner',
      Zeilen: [
        { '253_30': '2', '78_30': 'Minka' },
        { '253_30': '3', '78_30': 'Buddy' },
        { '253_30': '2', '78_30': 'Nala' },
        { '253_30': 'OP', '78_30': 'Rocky' }, // trifft keine Spalte -> Nicht zugeordnet
      ],
    }],
  },
}

test('Export: Zeilen werden Karten; kein Treffer bleibt sichtbar in Nicht zugeordnet', async ({ page, context }) => {
  await freshEditor(page)
  await insertBoard(page)
  await attachTerminplaner(page)

  // Titel-Stelle der ersten Karte an "Tiername" binden (Kap. 5.2).
  await page.locator('ff-card .text').first().click()
  await page.locator('ff-card .heading').first().click()
  const picker = page.getByRole('dialog', { name: /Feld für/ })
  await picker.getByRole('button', { name: /Tiername/ }).click()
  await expect(page.locator('ff-card .heading').first()).toHaveText('Tiername')

  // Spalten-Feld am Board wählen: Klarname "Zimmer", nie der Feldcode.
  await selectBoard(page)
  await chooseEinsortierFeld(page, 'Zimmer')

  // Titel = Datenwert (2026-07-14): Spalten 2 + 3 heißen wie ihre Werte;
  // "Offen" trifft keinen Zimmer-Wert; ohne Auffang entsteht Nicht zugeordnet.
  await renameColumn(page, 1, '2')
  await renameColumn(page, 2, '3')

  const html = await exportMaskHtml(page)
  // Feldcode + Titel reisen als Attribute in der Maske (Kap. 5.2 + 5.3);
  // ein separates statusvalue existiert NIRGENDS mehr (Titel = Wert).
  expect(html).toContain('statusfield="253_30"')
  expect(html).toContain('headingfield="78_30"')
  expect(html).toContain('heading="2"')
  expect(html).toContain('heading="3"')
  expect(html.toLowerCase()).not.toContain('statusvalue')

  // Maske laden; SEDATA kommt NACH dem Boot (wie in SoftEngine — die Maske
  // wartet darauf, Poll wie die Referenzmaske).
  const mask = await context.newPage()
  await mask.setContent(html)
  await mask.evaluate((sedata) => {
    (window as unknown as Record<string, unknown>).SEDATA = sedata
  }, SEDATA_STUB)

  // 4 Zeilen -> 4 Karten: Minka+Nala in 2, Buddy in 3 und Rocky sichtbar
  // in Nicht zugeordnet. Die Musterkarte wird ersetzt, nicht verdoppelt.
  await expect(mask.locator('ff-kanban-spalte ff-card')).toHaveCount(4)
  await expect(mask.locator('ff-kanban-spalte[data-ff-nicht-zugeordnet]')).toHaveCount(1)
  await expect(mask.locator('ff-kanban-spalte[data-ff-nicht-zugeordnet] .title')).toHaveText('Nicht zugeordnet')
  // P1.1: einen Vorlagen-Kasten gibt es nicht mehr — nirgends in der Maske.
  await expect(mask.locator('ff-kanban-vorlage')).toHaveCount(0)
  const colCards = (i: number) => mask.locator('ff-kanban-spalte').nth(i).locator('ff-card .heading')
  await expect(colCards(0)).toHaveCount(0)
  await expect(colCards(1)).toHaveText(['Minka', 'Nala'])
  await expect(colCards(2)).toHaveText(['Buddy'])
  await expect(colCards(3)).toHaveText(['Rocky'])
  // Kartenzähler laufen mit (slotchange, dieselbe Logik wie im Editor).
  await expect(mask.locator('ff-kanban-spalte .count')).toHaveText(['0', '2', '1', '1'])
  // Ungebundene Stellen behalten den statischen Text der Vorlagen-Karte.
  await expect(mask.locator('ff-card .text').first()).toHaveText('Befund Minka besprechen')

  // Der EDITOR hydriert nie: dort steht weiterhin nur die Musterkarte.
  await expect(page.locator('ff-card')).toHaveCount(1)
})

// Schreibweg 5.3b: Zeilen tragen die Satznummer (indexField '0_10' des
// Terminplaners) — nur damit sind Karten ziehbar.
const SEDATA_DRAG_STUB = {
  Daten: {
    SEFileLoop: [{
      ALIAS: 'Terminplaner',
      Zeilen: [
        { '0_10': '7', '253_30': '2', '78_30': 'Bello' },
        { '0_10': '8', '253_30': '3', '78_30': 'Rex' },
        { '0_10': '9', '253_30': '2', '78_30': 'Luna' },
      ],
    }],
  },
}

test('Export: Karte ziehen schreibt den Spaltenwert per PUT-Vorlage zurück (5.3b)', async ({ page, context }) => {
  await freshEditor(page)
  await insertBoard(page)
  await attachTerminplaner(page)

  // Titel an "Tiername" binden, damit die Daten-Karten unterscheidbar sind.
  await page.locator('ff-card .text').first().click()
  await page.locator('ff-card .heading').first().click()
  await page.getByRole('dialog', { name: /Feld für/ }).getByRole('button', { name: /Tiername/ }).click()

  // Spalten-Feld "Zimmer"; Titel = Wert: Spalte 2 -> '2', Spalte 3 -> '3',
  // "Offen" bleibt eine normale Spalte; alle Testwerte treffen 2 oder 3.
  await selectBoard(page)
  await chooseEinsortierFeld(page, 'Zimmer')
  await renameColumn(page, 1, '2')
  await renameColumn(page, 2, '3')

  const html = await exportMaskHtml(page)
  const mask = await context.newPage()
  await mask.setContent(html)
  // SE-Bridge stubben (sammelt Aufrufe), dann SEDATA stellen.
  await mask.evaluate((sedata) => {
    const w = window as unknown as Record<string, unknown>
    w.PUT_CALLS = []
    w.basisHTML_SND_MSG = (verb: unknown, msg: unknown) => {
      (w.PUT_CALLS as unknown[]).push([verb, msg])
    }
    w.SEDATA = sedata
  }, SEDATA_DRAG_STUB)

  // Hydriert: Bello+Luna in "In Arbeit" (2), Rex in "Fertig" (3).
  const colCards = (i: number) => mask.locator('ff-kanban-spalte').nth(i).locator('ff-card .heading')
  await expect(colCards(1)).toHaveText(['Bello', 'Luna'])

  // Bello nach "Fertig" ziehen: exakt EIN PUT über die Standard-Vorlage —
  // PARAMS [pos, len, 'L', pindex, relId OHNE IDB-Präfix, Zielwert].
  await mask.locator('ff-card', { hasText: 'Bello' }).dragTo(mask.locator('ff-kanban-spalte').nth(2))
  await expect(colCards(1)).toHaveText(['Luna'])
  await expect(colCards(2)).toHaveText(['Bello', 'Rex']) // Zeilen-Reihenfolge
  expect(await mask.evaluate(() => (window as unknown as Record<string, unknown>).PUT_CALLS)).toEqual([
    ['PUT_RELATION', { NR: '174', PARAMS: ['253', '30', 'L', '7', 'ID0001', '3'] }],
  ])

  // Gleicher Wert = kein PUT: Drop auf die eigene Spalte veraendert nichts.
  await mask.locator('ff-card', { hasText: 'Luna' }).dragTo(mask.locator('ff-kanban-spalte').nth(1))
  await expect(colCards(1)).toHaveText(['Luna'])
  expect(await mask.evaluate(() => ((window as unknown as Record<string, unknown>).PUT_CALLS as unknown[]).length)).toBe(1)

  // Titel = Wert gilt fuer JEDE Spalte (2026-07-14): Drop auf "Offen"
  // schreibt woertlich 'Offen' (Luna, Satznummer 9) — die einstige stille
  // No-Write-Spalte (leeres statusvalue) existiert nicht mehr.
  await mask.locator('ff-card', { hasText: 'Luna' }).dragTo(mask.locator('ff-kanban-spalte').nth(0))
  await expect(colCards(0)).toHaveText(['Luna'])
  expect(await mask.evaluate(() => (window as unknown as Record<string, unknown>).PUT_CALLS)).toEqual([
    ['PUT_RELATION', { NR: '174', PARAMS: ['253', '30', 'L', '7', 'ID0001', '3'] }],
    ['PUT_RELATION', { NR: '174', PARAMS: ['253', '30', 'L', '9', 'ID0001', 'Offen'] }],
  ])
})

// SEDATA in der ECHTEN SoftEngine-Form (belegt durch den SE-Echttest des
// Nutzers 2026-07-11, DATA-RECV-Log): SEFileLoop ist ein OBJEKT je Alias,
// der Eintrag traegt SAT (Tabellen-id) + TFELD (Feld-Schema) + Zeilen, und
// die Zeilen-Properties tragen das Tabellen-PRAEFIX (IDBID0001_253_30) —
// die Endungs-Regel von getField loest die gebundenen Codes dagegen auf.
const SEDATA_SE_FORM = {
  Daten: {
    SEFileLoop: {
      Terminplaner: {
        SAT: 'IDBID0001',
        TFELD: [
          { Beschreibung: 'Index', Name: 'IDBID0001_0_10', Pos: '0', Len: '10' },
          { Beschreibung: 'HaustierName', Name: 'IDBID0001_78_30', Pos: '78', Len: '30' },
          { Beschreibung: 'Behandlungszimmer', Name: 'IDBID0001_253_30', Pos: '253', Len: '30' },
        ],
        Zeilen: [
          { IDBID0001_0_10: '1', IDBID0001_253_30: '2', IDBID0001_78_30: 'Minka' },
          { IDBID0001_0_10: '2', IDBID0001_253_30: '3', IDBID0001_78_30: 'Buddy' },
          { IDBID0001_0_10: '3', IDBID0001_253_30: '2', IDBID0001_78_30: 'Nala' },
          { IDBID0001_0_10: '4', IDBID0001_253_30: 'OP', IDBID0001_78_30: 'Rocky' },
        ],
      },
    },
  },
}

// SE-Push (Phase 2): SoftEngine SCHIEBT die Daten — die Maske meldet sich
// per basisHTML_REGISTER an (Referenz regSE) bzw. empfaengt das
// message-Event { MSG: { DATA } } und setzt SEDATA.Daten SELBST. Beide
// Wege hier gegen dieselbe exportierte Maske geprueft; der Register-Weg
// zusaetzlich mit String-Paket (SE liefert auch JSON-Strings), Live-Update
// beim zweiten Push und der Diagnose-Textarea (Strg+Alt+D). Daten in der
// ECHTEN SE-Form (s. SEDATA_SE_FORM) — deckt den Echttest-Befund ab.
test('Export: SoftEngine schiebt die Daten — Register-Weg und message-Fallback hydrieren', async ({ page, context }) => {
  await freshEditor(page)
  await insertBoard(page)
  await attachTerminplaner(page)

  // Titel an "Tiername" binden; Spalten-Feld "Zimmer"; Titel = Wert:
  // Spalte 2 -> '2', Spalte 3 -> '3' (dieselbe Strecke wie oben).
  await page.locator('ff-card .text').first().click()
  await page.locator('ff-card .heading').first().click()
  await page.getByRole('dialog', { name: /Feld für/ }).getByRole('button', { name: /Tiername/ }).click()
  await selectBoard(page)
  await chooseEinsortierFeld(page, 'Zimmer')
  await renameColumn(page, 1, '2')
  await renameColumn(page, 2, '3')

  const html = await exportMaskHtml(page)

  // --- Weg 1: basisHTML_REGISTER ---
  // SE injiziert seine Bridge erst NACH dem Laden der Maske — genau dafuer
  // existiert die Anmelde-Schleife (25ms-Takte): sie findet die Bridge beim
  // naechsten Versuch.
  const mask = await context.newPage()
  await mask.setContent(html)
  await mask.evaluate(() => {
    const w = window as unknown as Record<string, unknown>
    w.REG_CALLS = []
    w.basisHTML_REGISTER = (cb: (d: unknown) => void, titel: unknown, version: unknown) => {
      w.__seCb = cb
      ;(w.REG_CALLS as unknown[]).push([titel, version])
    }
  })

  // Die Maske meldet sich genau EINMAL an (Version '1.0' wie die Referenz).
  await expect.poll(() => mask.evaluate(() =>
    ((window as unknown as Record<string, unknown>).REG_CALLS as unknown[]).length,
  )).toBe(1)
  expect(await mask.evaluate(() =>
    ((window as unknown as Record<string, unknown>).REG_CALLS as unknown[][])[0][1],
  )).toBe('1.0')
  // Vor dem Push: keine Karten, kein SEDATA.
  await expect(mask.locator('ff-kanban-spalte ff-card')).toHaveCount(0)

  // SE schiebt als STRING -> Maske setzt SEDATA selbst und hydriert.
  await mask.evaluate((sedata) => {
    const w = window as unknown as Record<string, unknown>
    ;(w.__seCb as (d: unknown) => void)(JSON.stringify(sedata))
  }, SEDATA_SE_FORM)
  const colCards = (i: number) => mask.locator('ff-kanban-spalte').nth(i).locator('ff-card .heading')
  await expect(mask.locator('ff-kanban-spalte ff-card')).toHaveCount(4)
  await expect(mask.locator('ff-kanban-spalte[data-ff-nicht-zugeordnet]')).toHaveCount(1)
  await expect(colCards(1)).toHaveText(['Minka', 'Nala'])
  expect(await mask.evaluate(() => {
    const sedata = (window as unknown as Record<string, unknown>).SEDATA
    return typeof sedata === 'object' && sedata !== null && 'Daten' in sedata
  })).toBe(true)

  // Zweiter Push = Live-Update: Board zeigt NUR noch die neue Zeile.
  await mask.evaluate(() => {
    const w = window as unknown as Record<string, unknown>
    ;(w.__seCb as (d: unknown) => void)({
      Daten: { SEFileLoop: [{ ALIAS: 'Terminplaner', Zeilen: [{ '253_30': '3', '78_30': 'Momo' }] }] },
    })
  })
  await expect(mask.locator('ff-kanban-spalte ff-card')).toHaveCount(1)
  await expect(mask.locator('ff-kanban-spalte[data-ff-nicht-zugeordnet]')).toHaveCount(0)
  await expect(colCards(2)).toHaveText(['Momo'])

  // Diagnose (Beifang Phase 2): erstes Paket liegt versteckt bereit,
  // Strg+Alt+D blendet es ein — Kopier-Weg ohne Konsole.
  await expect(mask.locator('#ff-se-diagnose')).toBeHidden()
  await mask.keyboard.press('Control+Alt+d')
  await expect(mask.locator('#ff-se-diagnose')).toBeVisible()
  expect(await mask.locator('#ff-se-diagnose').inputValue()).toContain('Minka')

  // --- Weg 2: message-Fallback (keine Bridge vorhanden) ---
  const mask2 = await context.newPage()
  await mask2.setContent(html)
  await mask2.evaluate((sedata) => {
    window.postMessage({ MSG: { DATA: { Daten: sedata.Daten } } }, '*')
  }, SEDATA_SE_FORM)
  const col2Cards = (i: number) => mask2.locator('ff-kanban-spalte').nth(i).locator('ff-card .heading')
  await expect(mask2.locator('ff-kanban-spalte ff-card')).toHaveCount(4)
  await expect(mask2.locator('ff-kanban-spalte[data-ff-nicht-zugeordnet]')).toHaveCount(1)
  await expect(col2Cards(0)).toHaveCount(0)
  await expect(col2Cards(1)).toHaveText(['Minka', 'Nala'])
  await expect(col2Cards(2)).toHaveText(['Buddy'])
  await expect(col2Cards(3)).toHaveText(['Rocky'])
})

test('Export ohne Spalten-Feld hydriert nicht — und zeigt NIE Demo-Karten', async ({ page, context }) => {
  await freshEditor(page)
  await insertBoard(page)
  await attachTerminplaner(page)

  const html = await exportMaskHtml(page)
  expect(html).toContain('statusfield=""')

  const mask = await context.newPage()
  await mask.setContent(html)
  await mask.evaluate((sedata) => {
    (window as unknown as Record<string, unknown>).SEDATA = sedata
  }, SEDATA_STUB)

  // Keine Hydrierung — und seit 2026-07-10 gibt es NIE sichtbare
  // Demo-Karten in der Maske: die Musterkarte reist nur als inertes
  // <template data-ff-template>, die Spalten bleiben leer, bis echte
  // Daten kommen (der Poll hätte 300ms-Takte — kurz warten, dann prüfen).
  await mask.waitForTimeout(1000)
  await expect(mask.locator('ff-card')).toHaveCount(0)
  await expect(mask.locator('template[data-ff-template]')).toHaveCount(1)
  await expect(mask.locator('ff-kanban-vorlage')).toHaveCount(0)
})

test('Export: komplette Vorlage füllt den Viewport, Kanban den verbleibenden Platz', async ({ page, context }) => {
  await freshEditor(page)
  // Normaler Baustein oben: behält seine natürliche Höhe. Das danach
  // eingefügte Kanban muss den gesamten verbleibenden Platz übernehmen.
  await page.getByRole('button', { name: 'Formularfeld', exact: true }).click()
  await insertBoard(page)

  const html = await exportMaskHtml(page)
  expect(html).toContain('html, body { width: 100%; height: 100%;')
  expect(html).toMatch(/<ff-kanban[^>]*style="align-self:stretch;flex-grow:1;flex-basis:0;min-height:0"/)

  const maske = await context.newPage()
  await maske.setContent(html)
  await maske.locator('ff-kanban').waitFor()

  for (const viewport of [
    { width: 900, height: 600 },
    { width: 1440, height: 900 },
  ]) {
    await maske.setViewportSize(viewport)
    const mass = await maske.evaluate(() => {
      const root = document.querySelector('.ff-root') as HTMLElement
      const board = document.querySelector('ff-kanban') as HTMLElement
      const formfeld = document.querySelector('ff-formfeld') as HTMLElement
      const rootRect = root.getBoundingClientRect()
      const boardRect = board.getBoundingClientRect()
      return {
        viewportWidth: innerWidth,
        viewportHeight: innerHeight,
        documentWidth: document.documentElement.scrollWidth,
        documentHeight: document.documentElement.scrollHeight,
        rootClientWidth: root.clientWidth,
        rootClientHeight: root.clientHeight,
        rootScrollWidth: root.scrollWidth,
        rootScrollHeight: root.scrollHeight,
        rootWidth: rootRect.width,
        rootHeight: rootRect.height,
        boardWidth: boardRect.width,
        boardBottom: boardRect.bottom,
        formfeldHeight: formfeld.getBoundingClientRect().height,
      }
    })

    expect(mass.documentWidth).toBe(mass.viewportWidth)
    expect(mass.documentHeight).toBe(mass.viewportHeight)
    expect(mass.rootWidth).toBe(mass.viewportWidth)
    expect(mass.rootHeight).toBe(mass.viewportHeight)
    expect(mass.rootScrollWidth).toBe(mass.rootClientWidth)
    expect(mass.rootScrollHeight).toBe(mass.rootClientHeight)
    expect(mass.boardWidth).toBe(mass.viewportWidth - 32)
    expect(mass.boardBottom).toBe(mass.viewportHeight - 16)
    expect(mass.formfeldHeight).toBeLessThan(100)
  }
})
