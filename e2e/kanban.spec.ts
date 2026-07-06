// E2E fuer Kap. 4K.4 (Kanban-Organismus) — nur im echten Browser pruefbar:
// Slot-Projektion, Kartenzaehler via slotchange, HTML5-Drag ueber die EINE
// Canvas-Drag-Logik, erlaubte Kind-Typen beim Ziehen, Plus-Knoepfe,
// Kreuzchen mit Rueckfrage, Inline-Edit des Spaltentitels.

import { test, expect, type Page } from '@playwright/test'

const STORAGE_KEY = 'aufbau_editor_mvp_v1'

async function freshEditor(page: Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByRole('button', { name: 'Bereich' }).waitFor()
}

// Zaehlerstaende aller Spalten (aus dem Shadow-DOM), in Board-Reihenfolge.
async function readCounts(page: Page): Promise<string[]> {
  return await page.evaluate(() =>
    Array.from(document.querySelectorAll('ff-kanban-spalte')).map(
      (col) => col.shadowRoot?.querySelector('.count')?.textContent ?? '?',
    ),
  )
}

// HTML5-Drag ueber synthetische DragEvents (Playwrights Maus-Drag triggert
// das draggable-Protokoll nicht zuverlaessig). Quelle: dragstart auf dem
// Block-Element (bubbelt zum draggable-Wrapper des Canvas), Ziel: dragover
// + drop in der MITTE des Ziel-Elements (= "hinein", nicht Randzone).
// Selektor + Index, weil die Block-Elemente im Editor je in eigenen
// Wrapper-Divs stecken (nth-of-type griffe ins Leere). Zwischen den Events
// liegt je ein Macrotask, damit React den Drag-State uebernehmen kann.
async function dragInto(
  page: Page,
  source: [selector: string, index: number],
  target: [selector: string, index: number],
) {
  await page.evaluate(async ({ source, target }) => {
    const src = document.querySelectorAll(source[0])[source[1]]
    const tgt = document.querySelectorAll(target[0])[target[1]]
    if (!src || !tgt) throw new Error('Drag-Quelle oder -Ziel fehlt')
    const dt = new DataTransfer()
    const tick = () => new Promise((r) => setTimeout(r, 30))
    const fire = (el: Element, type: string, x: number, y: number) =>
      el.dispatchEvent(new DragEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        clientX: x,
        clientY: y,
        dataTransfer: dt,
      }))
    const s = src.getBoundingClientRect()
    fire(src, 'dragstart', s.left + s.width / 2, s.top + s.height / 2)
    await tick()
    const t = tgt.getBoundingClientRect()
    const cx = t.left + t.width / 2
    const cy = t.top + t.height / 2
    fire(tgt, 'dragover', cx, cy)
    await tick()
    fire(tgt, 'drop', cx, cy)
    await tick()
    fire(src, 'dragend', cx, cy)
  }, { source, target })
}

test('Kanban aus der Bibliothek = komplettes Zielbild-Board; "Spalte" ist nicht in der Bibliothek', async ({ page }) => {
  await freshEditor(page)

  // Struktur-Block "Spalte" entsteht nur ueber den Plus-Knopf des Boards.
  await expect(page.getByRole('button', { name: 'Kanban' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Spalte', exact: true })).toHaveCount(0)

  await page.getByRole('button', { name: 'Kanban' }).click()
  await expect(page.locator('ff-kanban')).toHaveCount(1)
  await expect(page.locator('ff-kanban-spalte')).toHaveCount(3)
  await expect(page.locator('ff-card')).toHaveCount(6)
  // Zaehler kommen aus dem Slot (3 Karten / 1 Karte / 2 Karten).
  await expect.poll(() => readCounts(page)).toEqual(['3', '1', '2'])
})

test('Karte in andere Spalte ziehen: Zaehler folgen, EIN Undo stellt alles wieder her', async ({ page }) => {
  await freshEditor(page)
  await page.getByRole('button', { name: 'Kanban' }).click()
  await expect.poll(() => readCounts(page)).toEqual(['3', '1', '2'])

  // Erste Karte (steht in "Offen") in die Mitte der Spalte "In Arbeit" ziehen.
  await dragInto(page, ['ff-card', 0], ['ff-kanban-spalte', 1])
  await expect.poll(() => readCounts(page)).toEqual(['2', '2', '2'])

  await page.getByRole('button', { name: 'Rückgängig (Ctrl+Z)' }).click()
  await expect.poll(() => readCounts(page)).toEqual(['3', '1', '2'])
})

test('Spalte nimmt NUR Karten: Schaltflaeche laesst sich nicht hineinziehen', async ({ page }) => {
  await freshEditor(page)
  await page.getByRole('button', { name: 'Kanban' }).click()
  await page.locator('.relative.h-full').click() // Auswahl aufheben (Canvas-Klick)
  await page.getByRole('button', { name: 'Schaltfläche' }).click() // Button an die Wurzel

  await dragInto(page, ['ff-button', 0], ['ff-kanban-spalte', 0])

  // Button ist NICHT in der Spalte gelandet — Zaehler und Baum unveraendert.
  await expect.poll(() => readCounts(page)).toEqual(['3', '1', '2'])
  // poll: der Baum landet erst nach dem Speicher-Debounce im localStorage.
  await expect.poll(async () => await page.evaluate((key) => {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '{}') as {
      tree?: Record<string, { type: string; parentId: string | null }>
    }
    const nodes = Object.values(parsed.tree ?? {})
    return nodes.find((n) => n.type === 'button')?.parentId
  }, STORAGE_KEY)).toBe('root')
})

test('Plus-Knoepfe: "+ Karte" fuellt die Spalte, "+ Spalte" erweitert das Board', async ({ page }) => {
  await freshEditor(page)
  await page.getByRole('button', { name: 'Kanban' }).click()

  await page.getByRole('button', { name: '＋ Karte' }).nth(1).click() // Spalte "In Arbeit"
  await expect.poll(() => readCounts(page)).toEqual(['3', '2', '2'])

  await page.getByRole('button', { name: '＋ Spalte' }).click()
  await expect(page.locator('ff-kanban-spalte')).toHaveCount(4)
  await expect.poll(() => readCounts(page)).toEqual(['3', '2', '2', '0'])
})

test('Spaltentitel per Doppelklick umbenennen', async ({ page }) => {
  await freshEditor(page)
  await page.getByRole('button', { name: 'Kanban' }).click()

  // Spalte am KOPF anklicken (Klick in die Mitte träfe eine Karte und
  // würde diese selektieren; Inline-Edit ist nur am selektierten Block aktiv) …
  await page.locator('ff-kanban-spalte').first().locator('.head').click()
  // … dann Titel im Shadow-DOM doppelklicken und ersetzen. `.head .heading`
  // trifft nur den Spaltentitel, nicht die Kartentitel (die heißen auch
  // .heading, liegen aber unter .card).
  const title = page.locator('ff-kanban-spalte').first().locator('.head .heading')
  await title.dblclick()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('Eingang')
  await page.keyboard.press('Enter')

  await expect(title).toHaveText('Eingang')
  await expect.poll(async () => await page.evaluate((key) => {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '{}') as {
      tree?: Record<string, { type: string; props: Record<string, unknown> }>
    }
    const nodes = Object.values(parsed.tree ?? {})
    return nodes.find((n) => n.type === 'kanban-spalte' && n.props.heading === 'Eingang') ? 'ok' : 'fehlt'
  }, STORAGE_KEY)).toBe('ok')
})

test('Kreuzchen an belegter Spalte fragt nach und loescht dann Spalte samt Karten', async ({ page }) => {
  await freshEditor(page)
  await page.getByRole('button', { name: 'Kanban' }).click()
  // Spalte "Offen" am Kopf selektieren (Mitte träfe eine Karte).
  await page.locator('ff-kanban-spalte').first().locator('.head').click()

  let dialogText = ''
  page.on('dialog', (d) => {
    dialogText = d.message()
    void d.accept()
  })
  await page.getByRole('button', { name: 'Entfernen' }).click()

  await expect(page.locator('ff-kanban-spalte')).toHaveCount(2)
  await expect(page.locator('ff-card')).toHaveCount(3) // die 3 Karten von "Offen" sind mit weg
  expect(dialogText).toContain('Spalte')
  expect(dialogText).toContain('3')
})

test('Inspector der Spalte: "Art" ja, Richtungs-/Abstands-Regler nein', async ({ page }) => {
  await freshEditor(page)
  await page.getByRole('button', { name: 'Kanban' }).click()
  await page.locator('ff-kanban-spalte').first().locator('.head').click()

  // Sicherstellen, dass wirklich die SPALTE selektiert ist (Inspector-Titel).
  await expect(page.getByRole('heading', { name: 'Spalte' })).toBeVisible()
  await expect(page.getByText('Art', { exact: true })).toBeVisible()
  await expect(page.getByText('Breite', { exact: true })).toBeVisible()
  // Festes Zielbild-Layout: keine freien Container-Regler an Board/Spalte.
  await expect(page.getByText('Richtung', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Innenabstand', { exact: true })).toHaveCount(0)
})
