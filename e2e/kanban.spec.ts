// E2E-Prüfung Kap. 4K.4 (Kanban-Organismus) im echten Browser.
// Nur hier real abbildbar: Shadow-DOM/<slot> (Kartenzähler via slotchange),
// HTML5-Drag mit DataTransfer-Typenliste (erlaubte Kind-Typen in der
// Drag-Vorschau) und die Editor-Hilfen im Light-DOM (Plus-Knopf, Kreuzchen,
// "Muster"-Markierung).
//
// P1.1 (2026-07-10): der Vorlagen-Kasten ist ABGESCHAFFT — die Musterkarte
// liegt als normale Karte in der ersten Spalte (erste Karte des Boards =
// Laufzeit-Vorlage, dezent markiert). Die Spec hier wurde entsprechend
// umgebaut, nicht abgeschwächt: ff-kanban-vorlage darf NIRGENDS mehr
// auftauchen.
//
// Drag-Simulation: dragstart/dragover/drop werden als getrennte evaluate-
// Aufrufe gefeuert (getrennte Tasks), damit React den Drag-State zwischen
// den Events flusht — wie im echten Ablauf.

import { test, expect, type Page } from '@playwright/test'

const STORAGE_KEY = 'aufbau_editor_mvp_v1'
const NEW_BLOCK_MIME = 'application/x-ff-new-block'

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

// Zählerstände aller Spalten in Board-Reihenfolge.
async function counts(page: Page): Promise<string[]> {
  return await page.locator('ff-kanban-spalte .count').allInnerTexts()
}

// Vorhandenen Block ziehen: dragstart auf dem Karten-Wrapper, dragover +
// drop in der Mitte des Ziel-Wrappers. props liegen als DOM-Properties auf
// den Elementen (nicht als Attribute), darum Suche per heading-Property.
async function dragCardToColumn(page: Page, cardHeading: string, colHeading: string) {
  await page.evaluate((CARD) => {
    const card = Array.from(document.querySelectorAll('ff-card'))
      .find((c) => (c as HTMLElement & { heading?: string }).heading === CARD)
    if (!card) throw new Error(`Karte nicht gefunden: ${CARD}`)
    const wrap = card.closest('[draggable="true"]')!
    wrap.dispatchEvent(new DragEvent('dragstart', {
      bubbles: true, cancelable: true, dataTransfer: new DataTransfer(),
    }))
  }, cardHeading)
  // dragover und drop als GETRENNTE Tasks, damit React das Drop-Ziel
  // dazwischen flusht (wie im echten Ablauf).
  await page.evaluate((COL) => {
    const col = Array.from(document.querySelectorAll('ff-kanban-spalte'))
      .find((c) => (c as HTMLElement & { heading?: string }).heading === COL)
    if (!col) throw new Error(`Spalte nicht gefunden: ${COL}`)
    const wrap = col.closest('[draggable="true"]')!
    const r = wrap.getBoundingClientRect()
    wrap.dispatchEvent(new DragEvent('dragover', {
      bubbles: true, cancelable: true, dataTransfer: new DataTransfer(),
      clientX: r.left + r.width / 2, clientY: r.top + r.height / 2,
    }))
  }, colHeading)
  await page.evaluate((COL) => {
    const col = Array.from(document.querySelectorAll('ff-kanban-spalte'))
      .find((c) => (c as HTMLElement & { heading?: string }).heading === COL)
    if (!col) throw new Error(`Spalte nicht gefunden: ${COL}`)
    const wrap = col.closest('[draggable="true"]')!
    const r = wrap.getBoundingClientRect()
    wrap.dispatchEvent(new DragEvent('drop', {
      bubbles: true, cancelable: true, dataTransfer: new DataTransfer(),
      clientX: r.left + r.width / 2, clientY: r.top + r.height / 2,
    }))
    wrap.dispatchEvent(new DragEvent('dragend', { bubbles: true }))
  }, colHeading)
}

test('Einfügen (P1.1): Board = 3 Spalten, die Musterkarte liegt markiert in der ersten', async ({ page }) => {
  await freshEditor(page)
  await insertBoard(page)

  await expect(page.locator('ff-kanban-spalte .title')).toHaveText(['OFFEN', 'IN ARBEIT', 'FERTIG'], { ignoreCase: true })
  // KEIN Vorlagen-Kasten mehr — nirgends.
  await expect(page.locator('ff-kanban-vorlage')).toHaveCount(0)
  // Die eine Musterkarte liegt in der ersten Spalte und ist dezent markiert.
  await expect(page.locator('ff-card')).toHaveCount(1)
  await expect.poll(() => counts(page)).toEqual(['1', '0', '0'])
  await expect(page.getByText('Muster', { exact: true })).toBeVisible()
  // Leere Spalten sind LEER — kein Hinweis-Text (Altlast "Karten entstehen
  // aus der Datenquelle" ist mit dem Vorlagen-Kasten-Modell entfernt).
  await expect(page.locator('ff-kanban-spalte .drop')).toHaveCount(0)
  await expect(page.locator('ff-kanban')).not.toContainText('Datenquelle')
  // Editor-Hilfen (P1.1b): Plus-Anstecker erscheinen NUR an der Auswahl —
  // frisch eingefügt ist das Board selektiert: "+ Spalte" ja, "+ Karte" nein.
  await expect(page.locator('button[data-ff-editor-helper]', { hasText: 'Spalte' })).toHaveCount(1)
  await expect(page.locator('button[data-ff-editor-helper]', { hasText: 'Karte' })).toHaveCount(0)
  // Spalte anklicken -> IHR "+ Karte" erscheint (Board-Anstecker bleibt,
  // die Auswahl liegt weiter im Board).
  await page.locator('ff-kanban-spalte .head').nth(1).click()
  await expect(page.locator('button[data-ff-editor-helper]', { hasText: 'Karte' })).toHaveCount(1)
  await expect(page.locator('button[data-ff-editor-helper]', { hasText: 'Spalte' })).toHaveCount(1)
  // Auswahl aufheben: Klick direkt auf der freien Maskenfläche dispatchen
  // (die Wurzel-Fluss-Fläche trägt --se-bg; kein Block im Event-Pfad, der
  // Klick erreicht den Abwähl-Handler des Canvas) -> ALLE Anstecker weg,
  // der Editor zeigt exakt das Export-Bild.
  await page.evaluate(() => {
    document.querySelector('main div[style*="--se-bg"]')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  await expect(page.locator('button[data-ff-editor-helper]')).toHaveCount(0)
  // Weder Spalte noch Karte stehen in der Bibliothek.
  await expect(page.getByRole('button', { name: 'Kanban-Spalte' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Karte', exact: true })).toHaveCount(0)
})

test('Karte zwischen Spalten ziehen = 1 Undo; die Markierung folgt der ersten Karte', async ({ page }) => {
  await freshEditor(page)
  await insertBoard(page)

  await dragCardToColumn(page, 'Rückruf Fr. Wagner', 'In Arbeit')
  await expect.poll(() => counts(page)).toEqual(['0', '1', '0'])
  // Die Karte bleibt die ERSTE Karte des Boards -> weiterhin markiert.
  await expect(page.getByText('Muster', { exact: true })).toBeVisible()

  // Ein Zug = ein Undo.
  await page.getByRole('button', { name: /Rückgängig/ }).click()
  await expect.poll(() => counts(page)).toEqual(['1', '0', '0'])
})

test('Spaltentitel per Doppelklick umbenennen (persistiert)', async ({ page }) => {
  await freshEditor(page)
  await insertBoard(page)

  // Spalte über ihren Kopf selektieren (Inline-Edit nur am selektierten Block).
  const head = page.locator('ff-kanban-spalte .head').first()
  await head.click()
  await page.locator('ff-kanban-spalte .title').first().dblclick()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('EINGANG')
  await page.keyboard.press('Enter')

  await expect.poll(async () => await page.evaluate((key) => {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const tree = (JSON.parse(raw) as { tree: Record<string, { type: string; props: Record<string, unknown> }> }).tree
    return Object.values(tree).find((n) => n.type === 'kanban-spalte' && n.props.heading === 'EINGANG')?.props.heading ?? null
  }, STORAGE_KEY)).toBe('EINGANG')
})

test('Plus-Knöpfe (P1.1): "+ Spalte" erweitert leer; "+ Karte" an der Spalte stellt die Musterkarte wieder her', async ({ page }) => {
  await freshEditor(page)
  await insertBoard(page)

  await page.locator('button[data-ff-editor-helper]', { hasText: 'Spalte' }).click()
  await expect(page.locator('ff-kanban-spalte')).toHaveCount(4)
  await expect.poll(() => counts(page)).toEqual(['1', '0', '0', '0'])

  // Musterkarte löschen (keine Kinder -> keine Rückfrage) …
  await page.locator('ff-card .heading').click()
  await page.getByRole('button', { name: 'Entfernen' }).click()
  await expect(page.locator('ff-card')).toHaveCount(0)
  await expect(page.getByText('Muster', { exact: true })).toHaveCount(0)
  // … und über "+ Karte" wiederherstellen: erst die erste Spalte
  // selektieren (P1.1b: Anstecker erscheinen nur an der Auswahl).
  await page.locator('ff-kanban-spalte .head').first().click()
  await page.locator('button[data-ff-editor-helper]', { hasText: 'Karte' }).click()
  await expect(page.locator('ff-card')).toHaveCount(1)
  await expect.poll(() => counts(page)).toEqual(['1', '0', '0', '0'])
  await expect(page.getByText('Muster', { exact: true })).toBeVisible()
})

test('Erlaubte Kind-Typen: Schaltfläche fällt NICHT in die Spalte, eine Karte schon', async ({ page }) => {
  await freshEditor(page)
  await insertBoard(page)

  // Palette-Drag simulieren: Typ reist im MIME-Namen (dragover darf keine
  // Daten lesen). dragover/drop als getrennte Tasks (React-Flush dazwischen).
  const paletteDrag = async (type: string, targetSel: string) => {
    for (const eventName of ['dragover', 'drop'] as const) {
      await page.evaluate(({ MIME, type, eventName, targetSel }) => {
        const col = document.querySelector(targetSel)!
        const wrap = col.closest('[draggable="true"]')!
        const dt = new DataTransfer()
        dt.setData(MIME, type)
        dt.setData(`${MIME}--${type}`, type)
        const r = wrap.getBoundingClientRect()
        wrap.dispatchEvent(new DragEvent(eventName, {
          bubbles: true, cancelable: true, dataTransfer: dt,
          clientX: r.left + r.width / 2, clientY: r.top + r.height / 2,
        }))
      }, { MIME: NEW_BLOCK_MIME, type, eventName, targetSel })
    }
  }

  // 'button' ist in der Spalte verboten -> kein Drop-Ziel, nichts passiert.
  await paletteDrag('button', 'ff-kanban-spalte')
  await expect(page.locator('ff-button')).toHaveCount(0)
  await expect.poll(() => counts(page)).toEqual(['1', '0', '0'])

  // Eine Karte fällt in die Spalte (P1.1: Spalten nehmen wieder Karten).
  await paletteDrag('card', 'ff-kanban-spalte')
  await expect(page.locator('ff-card')).toHaveCount(2)
  await expect.poll(() => counts(page)).toEqual(['2', '0', '0'])
})

test('Kreuzchen: leere Spalte ohne Rückfrage; belegte Spalte fragt nach (Dialog verworfen = bleibt)', async ({ page }) => {
  await freshEditor(page)
  await insertBoard(page)

  // Leere Spalte (zweite): Entfernen ohne Dialog (Playwright würde einen
  // confirm() sonst automatisch verwerfen — die Spalte bliebe stehen).
  await page.locator('ff-kanban-spalte .head').nth(1).click() // selektieren
  await page.getByRole('button', { name: 'Entfernen' }).click()
  await expect(page.locator('ff-kanban-spalte')).toHaveCount(2)

  // Belegte Spalte (trägt die Musterkarte): confirm() erscheint und wird von
  // Playwright automatisch VERWORFEN -> Spalte + Karte bleiben stehen.
  await page.locator('ff-kanban-spalte .head').first().click()
  await page.getByRole('button', { name: 'Entfernen' }).click()
  await expect(page.locator('ff-kanban-spalte')).toHaveCount(2)
  await expect(page.locator('ff-card')).toHaveCount(1)
})
