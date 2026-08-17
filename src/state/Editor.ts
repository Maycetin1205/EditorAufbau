import { ROOT_ID, type BlockNode, type BlockTree } from '../core/blocks/BlockData'
import { createBlockSubtree } from '../core/blocks/blockFactory'
import { canContain, getBlockDefinition } from '../core/blocks/blockRegistry'
import { rasterSpecOf } from '../core/blocks/rasterLayout'
import { type BlockEventsMap } from '../core/data/aktionen'
import { type DataSource } from '../core/data/dataSources'
import { type QuelleInReichweite } from '../core/data/sourceLinks'
import { dataSourceStore } from './DataSourceStore'
import { ersteQuelleInReichweite, quellenInReichweite } from './quellenOps'
import { gestenKlammer, Historie, type EditorSnapshot, type GestenKlammer } from './history'
import { loadFromStorage, persistState, SAVE_DEBOUNCE_MS } from './persistence'
import { SpeicherPlaner } from './speicherPlaner'
import { Subject } from './Subject'
import { dupliziereTeilbaum } from './duplizieren'
import { collectSubtree, createEmptyTree } from './treeOps'
import {
  isRemoveProtected as istMusterGeschuetzt,
  templateMarkFor as templateMarkInTree,
} from './templateRules'
import {
  aktiveSeitenWurzel,
  freierSeitenName,
  kinderImFluss,
  klarnamenNachziehen,
  schreibWert,
  seitenDerMaske,
  type SeitenEintrag,
} from './pageOps'
import {
  freieZeileAuf,
  istRasterFlaeche,
  neuerBlockAnZelle,
  startgroesseNachziehen,
  verschiebeInContainer,
  zelleneinzug,
  zellenGroesse,
} from './rasterOps'
import { auswahlAufSeite, auswahlZiel } from './selectionOps'
import { deepClone } from '../lib/deepClone'

export { BACKUP_KEY } from './persistence'

export class Editor extends Subject<Editor> {
  private _tree: BlockTree = createEmptyTree()
  private _selectedId: string | null = null

  private _activePageId: string = ROOT_ID
  private _version = 0
  private _historie = new Historie()

  private _planer = new SpeicherPlaner(
    () => persistState(this._tree, this._selectedId),
    SAVE_DEBOUNCE_MS,
  )
  private _hydrated = false

  constructor() {
    super()
    const persisted = loadFromStorage()
    this._tree = persisted ? persisted.tree : createEmptyTree()
    this._selectedId = this.auswahlAufAktiverSeite(persisted?.selectedId ?? null)
    this._hydrated = true
    if (persisted?.resaveNeeded) this._planer.plane()
  }

  get tree(): Readonly<BlockTree> { return this._tree }

  get rootId(): string {
    return aktiveSeitenWurzel(this._tree, this._activePageId)
  }

  get activePageId(): string { return this.rootId }

  get pages(): SeitenEintrag[] {
    return seitenDerMaske(this._tree)
  }

  private auswahlAufAktiverSeite(id: string | null): string | null {
    return auswahlAufSeite(this._tree, id, this.rootId)
  }

  setActivePage(id: string): void {
    const next = id === ROOT_ID || this._tree[id] ? id : ROOT_ID
    if (next === this._activePageId) return
    this._activePageId = next
    this._selectedId = null
    this.notify(this)
  }

  addSeite(typ: string): BlockNode | null {
    const def = getBlockDefinition(typ)
    if (def?.pageBlock !== true) return null
    const name = freierSeitenName(this.pages.map((p) => p.name), def.displayName)
    return this.transaktion(() => {
      const node = this.addBlock(typ, ROOT_ID)
      if (node) {
        this._activePageId = node.id
        this.updateProperty(node.id, 'name', name)
      }
      return node
    })
  }

  getNode(id: string): BlockNode | undefined { return this._tree[id] }

  childNodesOf(parentId: string): BlockNode[] {
    return kinderImFluss(this._tree, parentId)
  }

  get blockCount(): number { return Object.keys(this._tree).length - 1 }

  get selectedId(): string | null { return this._selectedId }
  get selectedNode(): BlockNode | null {
    if (this._selectedId === null) return null
    const node = this._tree[this._selectedId]
    return node && node.id !== ROOT_ID ? node : null
  }

  get version(): number { return this._version }
  get canUndo(): boolean { return this._historie.canUndo }
  get canRedo(): boolean { return this._historie.canRedo }

  override notify(data: Editor): void {
    this._version++
    try {
      super.notify(data)
    } finally {
      if (this._hydrated) this._planer.plane()
    }
  }

  private snapshot(): EditorSnapshot {
    return { tree: deepClone(this._tree), selectedId: this._selectedId }
  }

  private pushHistory(): void {
    this._historie.record(() => this.snapshot())
  }

  beginTransaction(): void {
    this._historie.begin(() => this.snapshot())
  }

  endTransaction(): void {
    this._historie.end()
  }

  transaktion<T>(tun: () => T): T {
    return this._historie.transaktion(() => this.snapshot(), tun)
  }

  oeffneGeste(): GestenKlammer {
    return gestenKlammer(() => this.beginTransaction(), () => this.endTransaction())
  }

  undo(): void {
    const prev = this._historie.undo(() => this.snapshot())
    if (!prev) return
    this._tree = prev.tree
    this._selectedId = this.auswahlAufAktiverSeite(prev.selectedId)
    this.notify(this)
  }

  redo(): void {
    const next = this._historie.redo(() => this.snapshot())
    if (!next) return
    this._tree = next.tree
    this._selectedId = this.auswahlAufAktiverSeite(next.selectedId)
    this.notify(this)
  }

  addBlock(type: string, parentId?: string, index?: number): BlockNode | null {
    const parent = this._tree[parentId ?? this.rootId]
    if (!parent || !canContain(parent.type, type)) return null
    this.pushHistory()
    const { nodes, rootId } = createBlockSubtree(type)
    const node = nodes[rootId]
    node.parentId = parent.id

    if (istRasterFlaeche(parent)) {
      const spec = rasterSpecOf(getBlockDefinition(type), node.props)
      const y = freieZeileAuf(this._tree, parent.id)
      node.props = { ...node.props, rasterX: 0, rasterY: y, rasterW: spec.startW, rasterH: spec.startH }
    }
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

    if (this.isRemoveProtected(id)) return
    this.pushHistory()
    const remove = new Set(collectSubtree(this._tree, id))
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

  selectBlock(id: string | null): void {
    if (this._selectedId === id) return
    this._selectedId = id
    this.notify(this)
  }

  waehleGetroffenen(getroffenId: string, aufStelle: boolean): void {
    const ziel = auswahlZiel(this._tree, getroffenId, this._selectedId, aufStelle)
    if (ziel !== null) this.selectBlock(ziel)
  }

  dataSourceFor(id: string): DataSource | undefined {
    return ersteQuelleInReichweite(this._tree, id, dataSourceStore.list)
  }

  quellenFor(id: string): QuelleInReichweite[] {
    return quellenInReichweite(this._tree, id, dataSourceStore.list)
  }

  templateMarkFor(id: string): string | undefined {
    return templateMarkInTree(this._tree, id)
  }

  isRemoveProtected(id: string): boolean {
    return istMusterGeschuetzt(this._tree, id)
  }

  updateProperty(id: string, attr: string, value: unknown): void {
    const node = this._tree[id]
    if (!node) return
    const def = getBlockDefinition(node.type)

    const wert = schreibWert(def, this.pages, id, attr, value)
    if (wert === null) return

    if (Object.is(node.props[attr], wert)) return
    this.pushHistory()
    const next: BlockTree = {
      ...this._tree,
      [id]: { ...node, props: { ...node.props, [attr]: wert } },
    }

    const prop = def?.customProperties.find((p) => p.attributeName === attr)
    if (prop?.exclusiveAmongSiblings && wert === 'ja' && node.parentId) {
      for (const sibId of this._tree[node.parentId]?.childIds ?? []) {
        const sib = next[sibId]
        if (sibId !== id && sib?.type === node.type && sib.props[attr] === 'ja') {
          next[sibId] = { ...sib, props: { ...sib.props, [attr]: 'nein' } }
        }
      }
    }

    next[id] = startgroesseNachziehen(def, node.props, next[id])

    this._tree = typeof wert === 'string' && def?.pageBlock === true && attr === 'name'
      ? klarnamenNachziehen(next, id, wert)
      : next
    this.notify(this)
  }

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
    const res = dupliziereTeilbaum(this._tree, id)
    if (!res) return null
    this.pushHistory()
    this._tree = res.tree
    this._selectedId = res.kopieId
    this.notify(this)
    return res.tree[res.kopieId]
  }

  moveNode(id: string, newParentId: string, index: number): void {
    const next = verschiebeInContainer(this._tree, id, newParentId, index)
    if (!next) return
    this.pushHistory()
    this._tree = next
    this.notify(this)
  }

  moveNodeToCell(id: string, parentId: string, x: number, y: number): void {
    const next = zelleneinzug(this._tree, id, parentId, x, y)
    if (!next) return
    this.pushHistory()
    this._tree = next
    this._selectedId = id
    this.notify(this)
  }

  resizeNodeToCells(id: string, achse: 'x' | 'y', value: number): void {
    const next = zellenGroesse(this._tree, id, achse, value)
    if (!next) return
    this.pushHistory()
    this._tree = next
    this.notify(this)
  }

  addBlockAtCell(type: string, parentId: string, x: number, y: number): BlockNode | null {
    const res = neuerBlockAnZelle(this._tree, type, parentId, x, y)
    if (!res) return null
    this.pushHistory()
    this._tree = res.tree
    this._selectedId = res.node.id
    this.notify(this)
    return res.node
  }

  clear(): void {
    if (this.blockCount === 0) return
    this.pushHistory()
    this._tree = createEmptyTree()
    this._selectedId = null
    this.notify(this)
  }

  ersetzeMaske(tree: BlockTree): void {
    this._tree = tree
    this._selectedId = null
    this._activePageId = ROOT_ID
    this._historie.leeren()
    this._planer.plane()
    this.notify(this)
  }

  speichereJetzt(): void {
    this._planer.sofort()
  }
}

