// Editor
// Zentraler Store für den Editor — nach dem A1-Umzug (Aufräum.md 2026-07-16)
// NUR noch Zustand + öffentliche Methoden. Die Handwerksfächer liegen daneben:
//   treeOps       — reine Baum-Helfer (leerer Baum, Props, Klonen, Teilbaum)
//   history       — Verlauf/Undo/Redo + Gesten-Transaktionen
//   persistence   — Laden, Verteidigen (sanitize), Notfallkopie, Speichern
//   migrations    — Übernahme alter Speicherstände
//   templateRules — Musterkarten-Markierung + Löschschutz
// Außenverhalten und öffentliche Schnittstelle sind UNVERÄNDERT.
//
// Speichert nur einen serialisierbaren BlockNode-Baum (flache Map + Wurzel) und
// benachrichtigt React per Subject. Position = Verschachtelung + Reihenfolge
// (Flow), keine Koordinaten.

import {
  ROOT_ID,
  type BlockNode,
  type BlockTree,
} from '../core/blocks/BlockData'
import { createBlockSubtree } from '../core/blocks/blockFactory'
import { canContain, getBlockDefinition } from '../core/blocks/blockRegistry'
import {
  naechsteFreieZeile,
  parseRasterPos,
  RASTER,
  rasterSpecOf,
} from '../core/blocks/rasterLayout'
import { type BlockEventsMap } from '../core/data/aktionen'
import { type DataSource } from '../core/data/dataSources'
import { dataSourceStore } from './DataSourceStore'
import { Historie, type EditorSnapshot } from './history'
import { loadFromStorage, persistState, SAVE_DEBOUNCE_MS } from './persistence'
import { Subject } from './Subject'
import {
  cloneSubtree,
  collectSubtree,
  createEmptyTree,
} from './treeOps'
import {
  isRemoveProtected as istMusterGeschuetzt,
  templateMarkFor as templateMarkInTree,
} from './templateRules'
import { deepClone } from '../lib/deepClone'

// Der persistence-Wächter (und Rettungs-Anleitungen) importieren den
// Notfallkopie-Schlüssel seit jeher von hier — Außen-Vertrag bleibt.
export { BACKUP_KEY } from './persistence'

export class Editor extends Subject<Editor> {
  private _tree: BlockTree = createEmptyTree()
  private _selectedId: string | null = null
  // Aktive SEITE der Maske (P-A): ROOT_ID = Hauptseite, sonst die id eines
  // Seiten-Bausteins (pageBlock, z.B. Popup) unter der Wurzel. Bewusst NICHT
  // persistiert — welche Seite offen ist, ist Arbeitszustand wie die Auswahl.
  private _activePageId: string = ROOT_ID
  private _version = 0
  private _historie = new Historie()
  private _saveTimer: ReturnType<typeof setTimeout> | null = null
  private _hydrated = false

  constructor() {
    super()
    const persisted = loadFromStorage()
    this._tree = persisted ? persisted.tree : createEmptyTree()
    this._selectedId = persisted?.selectedId ?? null
    this._hydrated = true
    if (persisted?.migrated) this.scheduleSave()
  }

  get tree(): Readonly<BlockTree> { return this._tree }

  // Wurzel der AKTIVEN Seite (P-A): Canvas, Bibliothek und Drag-Ziele
  // arbeiten dadurch automatisch auf der Seite, die gerade offen ist.
  // Verschwindet die Seite (Undo, Löschen), fällt alles auf die Hauptseite.
  get rootId(): string {
    return this._tree[this._activePageId] ? this._activePageId : ROOT_ID
  }

  get activePageId(): string { return this.rootId }

  // Seiten der Maske: Hauptseite + alle Seiten-Bausteine (pageBlock) unter
  // der Wurzel, in Baum-Reihenfolge. Registry-getrieben, kein `if type===`.
  get pages(): { id: string; name: string; istHauptseite: boolean }[] {
    const popups = (this._tree[ROOT_ID]?.childIds ?? [])
      .map((id) => this._tree[id])
      .filter((n): n is BlockNode => Boolean(n) && getBlockDefinition(n!.type)?.pageBlock === true)
      .map((n) => ({
        id: n.id,
        name: typeof n.props.name === 'string' && n.props.name !== '' ? n.props.name : 'Popup',
        istHauptseite: false,
      }))
    return [{ id: ROOT_ID, name: 'Hauptseite', istHauptseite: true }, ...popups]
  }

  // Seite wechseln: reiner Arbeitszustand (kein History-Schritt); die
  // Auswahl wird geleert, damit Inspector/Anfasser nicht auf einen Block
  // einer unsichtbaren Seite zeigen.
  setActivePage(id: string): void {
    const next = id === ROOT_ID || this._tree[id] ? id : ROOT_ID
    if (next === this._activePageId) return
    this._activePageId = next
    this._selectedId = null
    this.notify(this)
  }

  // Neue Popup-Seite: ein Seiten-Baustein als Kind der Wurzel mit
  // eindeutigem Klarnamen; die Seite wird sofort aktiv. Transaktion =
  // Anlegen + Benennen sind zusammen EIN Undo-Schritt.
  addPopupPage(): BlockNode | null {
    const vergeben = new Set(this.pages.map((p) => p.name))
    let name = 'Popup'
    for (let n = 2; vergeben.has(name); n++) name = `Popup ${n}`
    this.beginTransaction()
    const node = this.addBlock('popup', ROOT_ID)
    if (node) {
      this._activePageId = node.id
      this.updateProperty(node.id, 'name', name)
    }
    this.endTransaction()
    return node
  }

  getNode(id: string): BlockNode | undefined { return this._tree[id] }

  childNodesOf(parentId: string): BlockNode[] {
    const parent = this._tree[parentId]
    if (!parent) return []
    return parent.childIds
      .map((id) => this._tree[id])
      // Seiten-Bausteine (Popups) erscheinen NIE im Fluss ihres Elternteils —
      // sie sind eigene Seiten (Reiter), keine Inhalte der Hauptseite.
      .filter((n): n is BlockNode => Boolean(n) && getBlockDefinition(n!.type)?.pageBlock !== true)
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
  get canUndo(): boolean { return this._historie.canUndo }
  get canRedo(): boolean { return this._historie.canRedo }

  override notify(data: Editor): void {
    this._version++
    super.notify(data)
    if (this._hydrated) this.scheduleSave()
  }

  private snapshot(): EditorSnapshot {
    return { tree: deepClone(this._tree), selectedId: this._selectedId }
  }

  private pushHistory(): void {
    this._historie.record(() => this.snapshot())
  }

  // Klammert eine durchgehende Geste: genau EIN Snapshot am Anfang, alle
  // Änderungen dazwischen ohne weitere Snapshots, endTransaction schließt ab.
  beginTransaction(): void {
    this._historie.begin(() => this.snapshot())
  }

  endTransaction(): void {
    this._historie.end()
  }

  undo(): void {
    const prev = this._historie.undo(() => this.snapshot())
    if (!prev) return
    this._tree = prev.tree
    this._selectedId = prev.selectedId
    this.notify(this)
  }

  redo(): void {
    const next = this._historie.redo(() => this.snapshot())
    if (!next) return
    this._tree = next.tree
    this._selectedId = next.selectedId
    this.notify(this)
  }

  // Hängt einen neuen Block in den angegebenen Container (Default: Wurzel,
  // ans Ende). `index` = Einfüge-Position innerhalb der Kinder (für Drop).
  // Beispieldaten (defaultChildren) kommen als kompletter Teilbaum mit —
  // ein Undo entfernt alles wieder. Verweigert Typen, die der Zielcontainer
  // nicht aufnimmt (allowedChildTypes) — dann kein History-Eintrag, null.
  // Ohne parentId landet der Block auf der AKTIVEN Seite (P-A) — die
  // Bibliothek bestückt damit automatisch die Seite, die gerade offen ist.
  // Rasterfläche = die oberste Ebene (Wurzel) oder ein Popup-Rumpf
  // (pageBlock): dort liegen die Blöcke im Raster, nicht im Fluss. Registry-
  // getrieben über das pageBlock-Kennzeichen, kein `if type===`.
  private istRasterFlaeche(node: BlockNode): boolean {
    return node.id === ROOT_ID || getBlockDefinition(node.type)?.pageBlock === true
  }

  addBlock(type: string, parentId?: string, index?: number): BlockNode | null {
    const parent = this._tree[parentId ?? this.rootId] ?? this._tree[ROOT_ID]
    if (!canContain(parent.type, type)) return null
    this.pushHistory()
    const { nodes, rootId } = createBlockSubtree(type)
    const node = nodes[rootId]
    node.parentId = parent.id
    // Auf einer Rasterfläche bekommt der neue Block seine Startgröße aus der
    // Registry und rückt in die freie Zeile ganz unten (Einfügen „ans Ende") —
    // sonst lägen alle neuen Blöcke aufeinander in Zeile 0. INNERHALB von
    // Containern (Spalte/Zeile/Karte) bleibt die Fluss-Reihenfolge.
    if (this.istRasterFlaeche(parent)) {
      const spec = rasterSpecOf(getBlockDefinition(type))
      const y = naechsteFreieZeile(
        this.childNodesOf(parent.id).map((n) => parseRasterPos(n.props)),
      )
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

  // Auswahl auf der Rasterfläche = Aufklapp-Auswahl (Nutzer-Regel 2026-07-23,
  // „Kanban-Problem"): ein Klick wählt IMMER zuerst den obersten Baustein unter
  // dem Zeiger (das Board — egal, wo hineingeklickt wurde); ein weiterer Klick
  // in den bereits gewählten steigt EINE Ebene tiefer (Board → Spalte → Karte).
  // Registry-frei: die Kette entsteht aus dem Baum bis zur nächsten Rasterfläche
  // (Wurzel/Popup-Rumpf). `clickedId` ist der TIEFSTE Baustein unter dem Zeiger
  // (der innerste BlockHost fängt den Klick zuerst ab).
  selectDrillDown(clickedId: string): void {
    const node = this._tree[clickedId]
    if (!node || clickedId === ROOT_ID) return
    const kette: string[] = []
    let cur: BlockNode | undefined = node
    while (cur && cur.id !== ROOT_ID) {
      kette.unshift(cur.id)
      const parent: BlockNode | undefined = cur.parentId ? this._tree[cur.parentId] : undefined
      // Oberste Ebene erreicht, sobald das Elternteil eine Rasterfläche ist.
      if (!parent || parent.id === ROOT_ID || getBlockDefinition(parent.type)?.pageBlock) break
      cur = parent
    }
    if (kette.length === 0) return
    const i = this._selectedId ? kette.indexOf(this._selectedId) : -1
    // In der Kette → eine Ebene tiefer (am Grund bleiben); sonst → oberste Ebene.
    const ziel = i >= 0 ? kette[Math.min(i + 1, kette.length - 1)] : kette[0]
    this.selectBlock(ziel)
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

  // Musterkarten-Markierung + Löschschutz: dieselben Regeln wie Export und
  // Laufzeit — die Logik wohnt in templateRules, hier nur der Baum-Blick.
  templateMarkFor(id: string): string | undefined {
    return templateMarkInTree(this._tree, id)
  }

  isRemoveProtected(id: string): boolean {
    return istMusterGeschuetzt(this._tree, id)
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
    if (collectSubtree(this._tree, id).includes(newParentId)) return
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
      // Landet der Block neu auf einer Rasterfläche, bekommt er eine freie
      // Zeile ganz unten (keine Überlappung mit den vorhandenen Blöcken); seine
      // Breite/Höhe behält er. Freies Verschieben auf der Fläche selbst ist
      // Sache der Bewegen-Etappe (E2) — hier nur der Überlappungs-Schutz.
      if (this.istRasterFlaeche(newParent)) {
        const pos = parseRasterPos(node.props)
        const y = naechsteFreieZeile(
          this.childNodesOf(newParentId).map((n) => parseRasterPos(n.props)),
        )
        next[id] = { ...next[id], props: { ...node.props, rasterX: 0, rasterY: y, rasterW: pos.w, rasterH: pos.h } }
      }
    }
    this._tree = next
    this.notify(this)
  }

  // Verschiebt einen Block auf eine feste Zelle einer Rasterfläche (E2
  // „Bewegen", Nutzer-Entscheidung B 2026-07-23 „Bausteine bleiben stehen"):
  // NUR der gezogene Block wandert an die Zielzelle — KEIN Ausweichen, die
  // Nachbarn bleiben EXAKT stehen (nichts bewegt sich von selbst). Legt man zwei
  // übereinander, überlappen sie bewusst; auseinandergeschoben wird von Hand am
  // Raster. Ein pushHistory + ein notify = EIN Undo-Schritt. Kommt der Block von
  // einer ANDEREN Fläche / aus einem Container, bekommt er die Registry-
  // Startgröße (nie Vollbreite); auf DERSELBEN Fläche behält er seine Größe.
  moveNodeToCell(id: string, parentId: string, x: number, y: number): void {
    const node = this._tree[id]
    const parent = this._tree[parentId]
    if (!node || !parent || id === ROOT_ID) return
    if (!this.istRasterFlaeche(parent)) return
    if (!canContain(parent.type, node.type)) return
    // Niemals in den eigenen Teilbaum einhängen (Zyklus).
    if (collectSubtree(this._tree, id).includes(parentId)) return
    const gleicheFlaeche = node.parentId === parentId
    const cur = parseRasterPos(node.props)
    const spec = rasterSpecOf(getBlockDefinition(node.type))
    const w = gleicheFlaeche ? cur.w : spec.startW
    const h = gleicheFlaeche ? cur.h : spec.startH
    const nx = Math.max(0, Math.min(x, RASTER.spalten - w))
    const ny = Math.max(0, y)
    // Nichts zu tun: gleiche Fläche, gleiche Zelle, gleiche Größe (reiner Klick).
    if (gleicheFlaeche && nx === cur.x && ny === cur.y && w === cur.w && h === cur.h) return
    this.pushHistory()
    const next: BlockTree = { ...this._tree }
    if (!gleicheFlaeche && node.parentId && next[node.parentId]) {
      next[node.parentId] = {
        ...next[node.parentId],
        childIds: next[node.parentId].childIds.filter((c) => c !== id),
      }
      next[parentId] = { ...next[parentId], childIds: [...next[parentId].childIds, id] }
    }
    next[id] = {
      ...node,
      parentId,
      props: { ...node.props, rasterX: nx, rasterY: ny, rasterW: w, rasterH: h },
    }
    this._tree = next
    this._selectedId = id
    this.notify(this)
  }

  // Größe eines Blocks auf einer Rasterfläche ändern (Anfasser rechts/unten) —
  // setzt rasterW/rasterH; die NACHBARN bleiben stehen (Nutzer-Entscheidung B:
  // nichts weicht aus, ein wachsender Block überlappt bewusst, statt andere
  // wegzudrücken). Läuft LIVE im Zieh-Zug, der die Undo-Transaktion klammert
  // (zieheGroesse begin/endTransaction) — deshalb nur pushHistory (im
  // Transaktions-Fenster absorbiert) + notify, kein eigener begin/end.
  // `achse` 'x' = Breite (rasterW), 'y' = Höhe (rasterH).
  resizeNodeToCells(id: string, achse: 'x' | 'y', value: number): void {
    const node = this._tree[id]
    if (!node || !node.parentId) return
    const parent = this._tree[node.parentId]
    if (!parent || !this.istRasterFlaeche(parent)) return
    const cur = parseRasterPos(node.props)
    // Breite nie über den rechten Rand hinaus; Höhe darf beliebig wachsen
    // (Nachbarn bleiben stehen, der Block überlappt bewusst nach unten). Mindestens EINE Zelle.
    const w = achse === 'x' ? Math.max(1, Math.min(value, RASTER.spalten - cur.x)) : cur.w
    const h = achse === 'y' ? Math.max(1, value) : cur.h
    if (w === cur.w && h === cur.h) return
    this.pushHistory()
    const next: BlockTree = {
      ...this._tree,
      [id]: { ...node, props: { ...node.props, rasterW: w, rasterH: h } },
    }
    this._tree = next
    this.notify(this)
  }

  // Fügt einen neuen Block aus der Bibliothek an eine feste Zelle ein (E3
  // „Einfügen an der Zelle"): Startgröße aus der Registry an der Drop-Zelle —
  // EIN Undo-Schritt, vorhandene Bausteine bleiben stehen (Nutzer-Entscheidung
  // B). Verweigert Typen, die die Fläche nicht aufnimmt.
  addBlockAtCell(type: string, parentId: string, x: number, y: number): BlockNode | null {
    const parent = this._tree[parentId]
    if (!parent || !this.istRasterFlaeche(parent) || !canContain(parent.type, type)) return null
    this.pushHistory()
    const { nodes, rootId } = createBlockSubtree(type)
    const node = nodes[rootId]
    node.parentId = parent.id
    const spec = rasterSpecOf(getBlockDefinition(type))
    const nx = Math.max(0, Math.min(x, RASTER.spalten - spec.startW))
    const ny = Math.max(0, y)
    node.props = { ...node.props, rasterX: nx, rasterY: ny, rasterW: spec.startW, rasterH: spec.startH }
    const next: BlockTree = {
      ...this._tree,
      ...nodes,
      [parent.id]: { ...parent, childIds: [...parent.childIds, node.id] },
    }
    this._tree = next
    this._selectedId = node.id
    this.notify(this)
    return node
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
      persistState(this._tree, this._selectedId)
    }, SAVE_DEBOUNCE_MS)
  }
}

// A2 (Aufräum.md 2026-07-16): Es gibt KEINE Weltvariable mehr — die eine
// App-Instanz entsteht in src/app/providers.tsx und reist über den
// EditorProvider; Tests bauen sich ihre Instanzen selbst (`new Editor()`).
