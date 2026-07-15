// Editor
// Zentraler Store für den Editor.
// Speichert nur einen serialisierbaren BlockNode-Baum (flache Map + Wurzel) und
// benachrichtigt React per Subject. Position = Verschachtelung + Reihenfolge
// (Flow), keine Koordinaten.

import {
  ROOT_ID,
  ROOT_TYPE,
  type BlockNode,
  type BlockTree,
} from '../core/blocks/BlockData'
import { createBlockSubtree } from '../core/blocks/blockFactory'
import { canContain, getBlockDefinition } from '../core/blocks/blockRegistry'
import { firstDescendantOfType } from '../core/blocks/treeQuery'
import { sanitizeBlockEvents, type BlockEventsMap } from '../core/data/aktionen'
import { type DataSource } from '../core/data/dataSources'
import { dataSourceStore } from './DataSourceStore'
import { Subject } from './Subject'
import { deepClone } from '../lib/deepClone'

const STORAGE_KEY = 'aufbau_editor_mvp_v1'
// Notfallkopie eines UNLESBAREN Speicherstands (U1): getrennter Schlüssel,
// den der Autosave (STORAGE_KEY) nie anfasst — die beschädigten Rohdaten
// bleiben damit erhalten, auch nachdem der Editor leer weiterläuft und beim
// ersten Speichern den kaputten STORAGE_KEY überschreibt.
export const BACKUP_KEY = 'aufbau_editor_mvp_v1__notfallkopie'
const CURRENT_SCHEMA_VERSION = 2
const HISTORY_LIMIT = 50
const SAVE_DEBOUNCE_MS = 500

interface PersistedState {
  schemaVersion: number
  tree: BlockTree
  selectedId: string | null
}

interface LoadedState {
  tree: BlockTree
  selectedId: string | null
  migrated: boolean
}

interface EditorSnapshot {
  tree: BlockTree
  selectedId: string | null
}

function createRootNode(): BlockNode {
  return { id: ROOT_ID, type: ROOT_TYPE, props: {}, parentId: null, childIds: [] }
}

function createEmptyTree(): BlockTree {
  return { [ROOT_ID]: createRootNode() }
}

function normalizeProps(type: string, rawProps: Record<string, unknown>): Record<string, unknown> {
  const def = getBlockDefinition(type)
  if (!def) return {}
  const next = deepClone(def.defaultProps)
  // Übernommen wird jede Prop, die der Block als defaultProp kennt — nicht nur
  // Inspector-Felder (customProperties). Blöcke ohne Inspector-Felder (Button,
  // Text: Inline-Edit per Doppelklick) würden sonst beim Laden jede Änderung
  // verlieren. Unbekannte Keys werden weiterhin verworfen.
  for (const key of Object.keys(next)) {
    if (Object.prototype.hasOwnProperty.call(rawProps, key)) {
      next[key] = rawProps[key]
    }
  }
  return next
}

// Migration alter Stände (P1.1): der Vorlagen-Kasten (kanban-vorlage) ist
// abgeschafft — seine Karten wandern an den ANFANG der ersten Spalte des
// Boards (die erste Karte des Boards ist jetzt die Musterkarte), der Kasten
// selbst verschwindet. Ohne den Umzug würde sanitizeTree den unbekannten
// Typ SAMT der gestalteten Musterkarte verwerfen. Board ohne Spalte
// (degeneriert): die Karten entfallen mit dem Kasten.
function migrateKanbanVorlage(
  src: Record<string, { type?: unknown; childIds?: unknown }>,
): void {
  for (const [id, node] of Object.entries(src)) {
    if (!node || typeof node !== 'object' || node.type !== 'kanban-vorlage') continue
    const parent = Object.values(src).find(
      (p) => p && typeof p === 'object' && Array.isArray(p.childIds) && p.childIds.includes(id),
    )
    if (!parent || !Array.isArray(parent.childIds)) continue
    const spalte = parent.childIds
      .map((cid) => (typeof cid === 'string' ? src[cid] : undefined))
      .find((n) => n && typeof n === 'object' && n.type === 'kanban-spalte')
    const cards = Array.isArray(node.childIds) ? node.childIds : []
    if (spalte) {
      spalte.childIds = [...cards, ...(Array.isArray(spalte.childIds) ? spalte.childIds : [])]
    }
    parent.childIds = parent.childIds.filter((cid) => cid !== id)
  }
}

// Migration 2026-07-16 (Nutzer-Beschwerde): Karten trugen bis zum Paket
// „Stellen starten leer" erfundene Demo-Werte ab Werk — in alten
// Speicherständen stehen sie noch und sehen aus wie Eingaben („Befund
// Minka besprechen", „Heute", …). Sie werden beim Laden geleert: EXAKTER
// Textvergleich gegen die fünf früheren Werkswerte, echte Eingaben
// bleiben unberührt.
const ALTE_KARTEN_DEMOS: ReadonlyArray<readonly [string, string]> = [
  ['heading', 'Rückruf Fr. Wagner'],
  ['time', '09:15'],
  ['meta', 'Katze · EKH'],
  ['text', 'Befund Minka besprechen'],
  ['chipText', 'Heute'],
]
function putzeAlteKartenDemos(tree: BlockTree): void {
  for (const node of Object.values(tree)) {
    if (node.type !== 'card') continue
    for (const [prop, demo] of ALTE_KARTEN_DEMOS) {
      if (node.props[prop] === demo) node.props[prop] = ''
    }
  }
}

// Baut aus rohen (evtl. kaputten) Daten einen sauberen Baum: läuft von der
// Wurzel über childIds, übernimmt nur Knoten mit bekanntem Typ, normalisiert
// Props, repariert parentId und verwirft Waisen/Zyklen.
// onDropType: meldet jeden verworfenen UNBEKANNTEN Typ (z. B. die 2026-07-14
// abgeschafften Bausteine Text/Bereich/Infobox/Chip/Eingabefeld in alten
// Speicherständen) — Nutzer-Regel: Verluste beim Laden passieren NIE still.
function sanitizeTree(
  raw: Record<string, unknown>,
  onDropType?: (type: string) => void,
): BlockTree {
  const tree = createEmptyTree()
  const src = raw as Record<string, { type?: unknown; props?: unknown; childIds?: unknown; events?: unknown }>
  migrateKanbanVorlage(src)

  const addChild = (parentId: string, childId: unknown): void => {
    if (typeof childId !== 'string' || tree[childId]) return
    const node = src[childId]
    if (!node || typeof node !== 'object') return
    if (typeof node.type !== 'string') return
    const def = getBlockDefinition(node.type)
    if (!def) {
      onDropType?.(node.type)
      // Kinder eines unbekannten Typs werden zum Eltern-Knoten HOCHGEZOGEN
      // statt still mitzuverschwinden (z. B. der Inhalt eines abgeschafften
      // "Bereich"): der unbekannte Rahmen fällt, der Inhalt bleibt an
      // seiner Position im Fluss.
      const kids = Array.isArray(node.childIds) ? node.childIds : []
      for (const k of kids) addChild(parentId, k)
      return
    }
    // Aktionsketten (Z2) laufen durch den eigenen strengen Lader — nur
    // Ereignis-Keys, die der Typ in der Registry deklariert.
    const events = sanitizeBlockEvents(node.events, (def.blockEvents ?? []).map((e) => e.key))
    tree[childId] = {
      id: childId,
      type: node.type,
      props: normalizeProps(node.type, node.props && typeof node.props === 'object' ? node.props as Record<string, unknown> : {}),
      ...(events ? { events } : {}),
      parentId,
      childIds: [],
    }
    tree[parentId].childIds.push(childId)
    const grand = Array.isArray(node.childIds) ? node.childIds : []
    for (const g of grand) addChild(childId, g)
  }

  const rootSrc = src[ROOT_ID]
  const rootChildren = rootSrc && Array.isArray(rootSrc.childIds) ? rootSrc.childIds : []
  for (const cid of rootChildren) addChild(ROOT_ID, cid)
  putzeAlteKartenDemos(tree)
  return tree
}

// Altes Format (Liste mit absolutem layout) -> Baum: alle Blöcke als Kinder der
// Wurzel, layout wird verworfen.
function migrateFlatBlocks(blocks: unknown[]): BlockTree {
  const tree = createEmptyTree()
  for (const raw of blocks) {
    if (!raw || typeof raw !== 'object') continue
    const b = raw as { id?: unknown; type?: unknown; props?: unknown }
    if (typeof b.id !== 'string' || typeof b.type !== 'string') continue
    if (!getBlockDefinition(b.type)) continue
    tree[b.id] = {
      id: b.id,
      type: b.type,
      props: normalizeProps(b.type, b.props && typeof b.props === 'object' ? b.props as Record<string, unknown> : {}),
      parentId: ROOT_ID,
      childIds: [],
    }
    tree[ROOT_ID].childIds.push(b.id)
  }
  return tree
}

// Schema 2: Root-Kanbans sind Vollbild-Hauptflächen. Alte Pixelmaße kamen
// aus der früheren frei ziehbaren Canvas und ließen den SoftEngine-Bereich
// überragen. Nur beim EINMALIGEN Wechsel von Schema 1 werden Root-Boards auf
// volle Breite + verbleibende Höhe gesetzt. Danach bleiben bewusst gesetzte
// Pixelhöhen erhalten.
function migrateRootKanbanToViewportFill(tree: BlockTree): boolean {
  let migrated = false
  for (const id of tree[ROOT_ID]?.childIds ?? []) {
    const node = tree[id]
    if (node?.type !== 'kanban') continue
    if (node.props.width === 'fill' && node.props.height === 'fill') continue
    tree[id] = { ...node, props: { ...node.props, width: 'fill', height: 'fill' } }
    migrated = true
  }
  return migrated
}

// Einen UNLESBAREN Speicherstand behandeln (U1, Nutzer-Regel „Verluste
// passieren nie still"): die Rohdaten ZUERST als Notfallkopie sichern (nur
// falls dort noch keine liegt — die früheste, wertvollste Kopie bleibt), dann
// Klartext melden. Der Editor startet danach leer weiter; die Kopie überlebt,
// weil sie unter einem eigenen Schlüssel liegt (Autosave rührt sie nie an).
function backupUnreadableState(raw: string): void {
  try {
    if (localStorage.getItem(BACKUP_KEY) === null) {
      localStorage.setItem(BACKUP_KEY, raw)
    }
  } catch { /* Das Sichern selbst darf nie zusätzlich Schaden anrichten. */ }
  if (typeof alert === 'function') {
    alert(
      'Der gespeicherte Editor-Stand war beschädigt und konnte nicht gelesen '
      + 'werden.\nEr wurde NICHT gelöscht, sondern als Notfallkopie gesichert '
      + `(Schlüssel „${BACKUP_KEY}" im Browser-Speicher).\n`
      + 'Der Editor startet vorerst leer; die Kopie bleibt erhalten, bis sie '
      + 'gerettet oder bewusst entfernt wird.',
    )
  }
}

function loadFromStorage(): LoadedState | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as {
      schemaVersion?: unknown
      tree?: unknown
      blocks?: unknown
      selectedId?: unknown
    }

    let tree: BlockTree | null = null
    // Verworfene unbekannte Typen sammeln und MELDEN (nie still): trifft
    // v. a. die 2026-07-14 abgeschafften Bausteine in alten Speicherständen.
    const verworfen = new Map<string, number>()
    if (parsed.tree && typeof parsed.tree === 'object') {
      tree = sanitizeTree(parsed.tree as Record<string, unknown>, (type) => {
        verworfen.set(type, (verworfen.get(type) ?? 0) + 1)
      })
    } else if (Array.isArray(parsed.blocks)) {
      tree = migrateFlatBlocks(parsed.blocks)
    }
    if (!tree) {
      // Gültiges JSON, aber KEINE verwertbare Baum-/Block-Struktur (fremder
      // oder halb-kaputter Inhalt, in dem echte Arbeit stecken könnte): wie
      // einen Lesefehler behandeln — sichern + melden, nicht still leer starten.
      backupUnreadableState(raw)
      return null
    }
    const schemaVersion = typeof parsed.schemaVersion === 'number' ? parsed.schemaVersion : 1
    const migrated = schemaVersion < CURRENT_SCHEMA_VERSION
      ? migrateRootKanbanToViewportFill(tree)
      : false
    if (verworfen.size > 0 && typeof alert === 'function') {
      const anzahl = [...verworfen.values()].reduce((a, b) => a + b, 0)
      const typen = [...verworfen.keys()].map((t) => `"${t}"`).join(', ')
      alert(
        `Beim Laden entfernt: ${anzahl} Baustein(e) der nicht mehr vorhandenen Typen ${typen}.\n`
        + 'Diese Bausteintypen gibt es im Editor nicht mehr. Ihr Inhalt wurde — '
        + 'falls vorhanden — an ihrer Stelle eingegliedert; der Rest der Maske ist unverändert.',
      )
    }

    const selectedId =
      typeof parsed.selectedId === 'string' && tree[parsed.selectedId] && parsed.selectedId !== ROOT_ID
        ? parsed.selectedId
        : null
    return { tree, selectedId, migrated }
  } catch (error) {
    // Unlesbarer Stand (kaputtes JSON, unerwarteter Fehler beim Aufbau):
    // NIE still leer starten und NIE vom Autosave überschreiben lassen —
    // Rohdaten sichern, dann melden.
    console.error('Editor: gespeicherter Stand nicht lesbar', error)
    backupUnreadableState(raw)
    return null
  }
}

// Klont einen Teilbaum (Knoten + Nachfahren) mit frischen ids.
function cloneSubtree(
  tree: BlockTree,
  id: string,
): { nodes: BlockTree; rootId: string } {
  const nodes: BlockTree = {}
  const cloneRec = (srcId: string, parentId: string | null): string => {
    const src = tree[srcId]
    const newId = crypto.randomUUID()
    const childIds = src.childIds.map((c) => cloneRec(c, newId))
    nodes[newId] = {
      id: newId,
      type: src.type,
      props: deepClone(src.props),
      // Aktionsketten (Z2) gehören zum Baustein — die Kopie behält sie.
      ...(src.events ? { events: deepClone(src.events) } : {}),
      parentId,
      childIds,
    }
    return newId
  }
  const rootId = cloneRec(id, tree[id].parentId)
  return { nodes, rootId }
}

export class Editor extends Subject<Editor> {
  private _tree: BlockTree = createEmptyTree()
  private _selectedId: string | null = null
  private _version = 0
  private _history: EditorSnapshot[] = []
  private _future: EditorSnapshot[] = []
  private _saveTimer: ReturnType<typeof setTimeout> | null = null
  private _hydrated = false
  // Tiefe einer laufenden Geste (z.B. Ziehen). > 0 = History-Snapshots werden
  // unterdrückt, damit eine durchgehende Geste EIN Undo-Schritt bleibt.
  private _txDepth = 0

  constructor() {
    super()
    const persisted = loadFromStorage()
    this._tree = persisted ? persisted.tree : createEmptyTree()
    this._selectedId = persisted?.selectedId ?? null
    this._hydrated = true
    if (persisted?.migrated) this.scheduleSave()
  }

  get tree(): Readonly<BlockTree> { return this._tree }
  get rootId(): string { return ROOT_ID }

  getNode(id: string): BlockNode | undefined { return this._tree[id] }

  childNodesOf(parentId: string): BlockNode[] {
    const parent = this._tree[parentId]
    if (!parent) return []
    return parent.childIds
      .map((id) => this._tree[id])
      .filter((n): n is BlockNode => Boolean(n))
  }

  // Anzahl echter Blöcke (ohne die Wurzel).
  get blockCount(): number { return Object.keys(this._tree).length - 1 }

  get selectedId(): string | null { return this._selectedId }
  get selectedNode(): BlockNode | null {
    if (this._selectedId === null) return null
    const node = this._tree[this._selectedId]
    return node && node.id !== ROOT_ID ? node : null
  }

  get version(): number { return this._version }
  get canUndo(): boolean { return this._history.length > 0 }
  get canRedo(): boolean { return this._future.length > 0 }

  override notify(data: Editor): void {
    this._version++
    super.notify(data)
    if (this._hydrated) this.scheduleSave()
  }

  private snapshot(): EditorSnapshot {
    return { tree: deepClone(this._tree), selectedId: this._selectedId }
  }

  private pushHistory(): void {
    // Innerhalb einer Transaktion (= laufende Geste, z. B. Breite ziehen)
    // KEINE weiteren Snapshots — beginTransaction hat schon einen gelegt.
    if (this._txDepth > 0) return
    this._history.push(this.snapshot())
    if (this._history.length > HISTORY_LIMIT) this._history.shift()
    this._future = []
  }

  // Klammert eine durchgehende Geste: genau EIN Snapshot am Anfang, alle
  // Änderungen dazwischen ohne weitere Snapshots, endTransaction schließt ab.
  beginTransaction(): void {
    if (this._txDepth === 0) this.pushHistory()
    this._txDepth++
  }

  endTransaction(): void {
    if (this._txDepth > 0) this._txDepth--
  }

  undo(): void {
    const prev = this._history.pop()
    if (!prev) return
    this._future.push(this.snapshot())
    this._tree = prev.tree
    this._selectedId = prev.selectedId
    this.notify(this)
  }

  redo(): void {
    const next = this._future.pop()
    if (!next) return
    this._history.push(this.snapshot())
    this._tree = next.tree
    this._selectedId = next.selectedId
    this.notify(this)
  }

  // Hängt einen neuen Block in den angegebenen Container (Default: Wurzel,
  // ans Ende). `index` = Einfüge-Position innerhalb der Kinder (für Drop).
  // Beispieldaten (defaultChildren) kommen als kompletter Teilbaum mit —
  // ein Undo entfernt alles wieder. Verweigert Typen, die der Zielcontainer
  // nicht aufnimmt (allowedChildTypes) — dann kein History-Eintrag, null.
  addBlock(type: string, parentId: string = ROOT_ID, index?: number): BlockNode | null {
    const parent = this._tree[parentId] ?? this._tree[ROOT_ID]
    if (!canContain(parent.type, type)) return null
    this.pushHistory()
    const { nodes, rootId } = createBlockSubtree(type)
    const node = nodes[rootId]
    node.parentId = parent.id
    const childIds = [...parent.childIds]
    const at = index === undefined
      ? childIds.length
      : Math.max(0, Math.min(index, childIds.length))
    childIds.splice(at, 0, node.id)
    this._tree = {
      ...this._tree,
      ...nodes,
      [parent.id]: { ...parent, childIds },
    }
    this._selectedId = node.id
    this.notify(this)
    return node
  }

  // true, wenn `id` im Teilbaum von `ancestorId` liegt (inkl. ancestorId
  // selbst). Für die UI: ein Container darf nie in sich selbst fallen.
  isInSubtree(ancestorId: string, id: string): boolean {
    let cur: string | null | undefined = id
    while (cur) {
      if (cur === ancestorId) return true
      cur = this._tree[cur]?.parentId
    }
    return false
  }

  removeBlock(id: string): void {
    const node = this._tree[id]
    if (!node || id === ROOT_ID) return
    // Löschschutz (Nutzer-Entscheidung 2026-07-10): die Musterkarte ist
    // nicht löschbar — ohne sie kann das Board keine Datenkarten erzeugen,
    // und es gibt bewusst keinen "+ Karte"-Weg zurück. Gilt auch für
    // Teilbäume (Spalte), die sie enthalten, solange ihr Board überlebt.
    if (this.isRemoveProtected(id)) return
    this.pushHistory()
    const remove = new Set(this.collectSubtree(id))
    const next: BlockTree = {}
    for (const [key, value] of Object.entries(this._tree)) {
      if (!remove.has(key)) next[key] = value
    }
    if (node.parentId && next[node.parentId]) {
      const parent = next[node.parentId]
      next[node.parentId] = { ...parent, childIds: parent.childIds.filter((c) => c !== id) }
    }
    this._tree = next
    if (this._selectedId && remove.has(this._selectedId)) this._selectedId = null
    this.notify(this)
  }

  private collectSubtree(id: string): string[] {
    const acc: string[] = []
    const rec = (nid: string): void => {
      const n = this._tree[nid]
      if (!n) return
      acc.push(nid)
      n.childIds.forEach(rec)
    }
    rec(id)
    return acc
  }

  selectBlock(id: string | null): void {
    if (this._selectedId === id) return
    this._selectedId = id
    this.notify(this)
  }

  // Datenquelle in Reichweite eines Blocks (Kap. 5.2, Bedienlogik 2):
  // der NÄCHSTE Vorfahr (inkl. des Blocks selbst) mit acceptsDataSource
  // bestimmt die Quelle — die Karte bekommt ihre Felder von IHREM Kanban.
  // Trägt er keine (auflösbare) Quelle, gibt es keine Felder; weiter oben
  // wird nicht gesucht. Registry-getrieben, kein `if type===`.
  dataSourceFor(id: string): DataSource | undefined {
    let cur: BlockNode | undefined = this._tree[id]
    while (cur) {
      if (getBlockDefinition(cur.type)?.acceptsDataSource) {
        return typeof cur.props.source === 'string'
          ? dataSourceStore.get(cur.props.source)
          : undefined
      }
      cur = cur.parentId ? this._tree[cur.parentId] : undefined
    }
    return undefined
  }

  // Musterkarten-Markierung (P1.1, templateChild in der Registry): liefert
  // das Label, wenn der Block die ERSTE Nachfahren-Karte des deklarierten
  // Typs unter dem nächsten passenden Vorfahren ist — Export (<template>)
  // und Laufzeit (seRuntime) nutzen DIESELBE Definition (treeQuery).
  // Registry-getrieben, kein `if type===`.
  templateMarkFor(id: string): string | undefined {
    const boardId = this.owningTemplateBoardId(id)
    return boardId
      ? getBlockDefinition(this._tree[boardId].type)?.templateChild?.label
      : undefined
  }

  // Der Block, dessen templateChild-Deklaration diesen Knoten zur
  // Musterkarte macht (undefined = keine Musterkarte).
  private owningTemplateBoardId(id: string): string | undefined {
    const node = this._tree[id]
    if (!node) return undefined
    let cur: BlockNode | undefined = node.parentId ? this._tree[node.parentId] : undefined
    while (cur) {
      const tc = getBlockDefinition(cur.type)?.templateChild
      if (tc && tc.type === node.type) {
        return firstDescendantOfType(this._tree, cur.id, tc.type) === id ? cur.id : undefined
      }
      cur = cur.parentId ? this._tree[cur.parentId] : undefined
    }
    return undefined
  }

  // Löschschutz: true, wenn der Teilbaum eine Musterkarte enthält, deren
  // Board NICHT mit gelöscht wird (das ganze Board löschen bleibt erlaubt).
  isRemoveProtected(id: string): boolean {
    const remove = new Set(this.collectSubtree(id))
    for (const nid of remove) {
      const boardId = this.owningTemplateBoardId(nid)
      if (boardId && !remove.has(boardId)) return true
    }
    return false
  }

  updateProperty(id: string, attr: string, value: unknown): void {
    const node = this._tree[id]
    if (!node) return
    this.pushHistory()
    const next: BlockTree = {
      ...this._tree,
      [id]: { ...node, props: { ...node.props, [attr]: value } },
    }
    // Exklusive Geschwister-Kennzeichen (V2/B2, exclusiveAmongSiblings in
    // der PropertyDescription, z. B. Auffangspalte): hoechstens EIN
    // Geschwister gleichen Typs darf 'ja' tragen. Wer auf 'ja' setzt,
    // raeumt die anderen im SELBEN History-Eintrag ab; Ctrl+Z stellt
    // beides zurueck. Registry-getrieben, kein `if type===`.
    const prop = getBlockDefinition(node.type)?.customProperties
      .find((p) => p.attributeName === attr)
    if (prop?.exclusiveAmongSiblings && value === 'ja' && node.parentId) {
      for (const sibId of this._tree[node.parentId]?.childIds ?? []) {
        const sib = next[sibId]
        if (sibId !== id && sib?.type === node.type && sib.props[attr] === 'ja') {
          next[sibId] = { ...sib, props: { ...sib.props, [attr]: 'nein' } }
        }
      }
    }
    this._tree = next
    this.notify(this)
  }

  // Aktionsketten eines Bausteins ersetzen (Z2): Ereignis-Key → Schritte.
  // Leere Ketten werden abgeräumt; ganz ohne Ketten entfällt das Feld.
  // Ein Aufruf = EIN History-Eintrag (die Zentrale schreibt pro
  // Bedienschritt, Muster updateProperty) — Ctrl+Z gilt damit auch für
  // Aktions-Änderungen.
  updateBlockEvents(id: string, events: BlockEventsMap): void {
    const node = this._tree[id]
    if (!node || id === ROOT_ID) return
    this.pushHistory()
    const clean: BlockEventsMap = {}
    for (const [key, steps] of Object.entries(events)) {
      if (steps.length > 0) clean[key] = steps
    }
    const next: BlockNode = { ...node }
    if (Object.keys(clean).length > 0) next.events = clean
    else delete next.events
    this._tree = { ...this._tree, [id]: next }
    this.notify(this)
  }

  duplicateBlock(id: string): BlockNode | null {
    const original = this._tree[id]
    if (!original || id === ROOT_ID || !original.parentId) return null
    const parent = this._tree[original.parentId]
    if (!parent) return null
    this.pushHistory()
    const { nodes, rootId: copyId } = cloneSubtree(this._tree, id)
    const childIds = [...parent.childIds]
    childIds.splice(parent.childIds.indexOf(id) + 1, 0, copyId)
    this._tree = {
      ...this._tree,
      ...nodes,
      [parent.id]: { ...parent, childIds },
    }
    this._selectedId = copyId
    this.notify(this)
    return nodes[copyId]
  }

  // Verschiebt einen Knoten in einen Container an eine Einfüge-Position.
  // index bezieht sich auf die Kinderliste des Zielcontainers (inkl. des
  // gezogenen Knotens, falls gleicher Container) — die Korrektur passiert hier.
  moveNode(id: string, newParentId: string, index: number): void {
    const node = this._tree[id]
    const newParent = this._tree[newParentId]
    if (!node || !newParent || id === ROOT_ID) return
    // Niemals in den eigenen Teilbaum einhängen (Zyklus).
    if (this.collectSubtree(id).includes(newParentId)) return
    // Ziel muss den Typ aufnehmen (allowedChildTypes, Kap. 4K.4).
    if (!canContain(newParent.type, node.type)) return
    const oldParentId = node.parentId
    if (!oldParentId) return
    const oldParent = this._tree[oldParentId]

    this.pushHistory()
    const next: BlockTree = { ...this._tree }

    if (oldParentId === newParentId) {
      const arr = oldParent.childIds.filter((c) => c !== id)
      const oldIndex = oldParent.childIds.indexOf(id)
      let target = oldIndex < index ? index - 1 : index
      target = Math.max(0, Math.min(target, arr.length))
      arr.splice(target, 0, id)
      next[oldParentId] = { ...oldParent, childIds: arr }
    } else {
      next[oldParentId] = { ...oldParent, childIds: oldParent.childIds.filter((c) => c !== id) }
      const arr = [...newParent.childIds]
      const target = Math.max(0, Math.min(index, arr.length))
      arr.splice(target, 0, id)
      next[newParentId] = { ...newParent, childIds: arr }
      next[id] = { ...node, parentId: newParentId }
    }
    this._tree = next
    this.notify(this)
  }

  clear(): void {
    if (this.blockCount === 0) return
    this.pushHistory()
    this._tree = createEmptyTree()
    this._selectedId = null
    this.notify(this)
  }

  private scheduleSave(): void {
    if (this._saveTimer) clearTimeout(this._saveTimer)
    this._saveTimer = setTimeout(() => {
      try {
        const state: PersistedState = {
          schemaVersion: CURRENT_SCHEMA_VERSION,
          tree: this._tree,
          selectedId: this._selectedId,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (err) {
        console.warn('Editor: localStorage-Speichern fehlgeschlagen', err)
      }
    }, SAVE_DEBOUNCE_MS)
  }
}

export const editor = new Editor()
