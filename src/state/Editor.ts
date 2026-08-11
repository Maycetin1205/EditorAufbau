// Editor
// Zentraler Store für den Editor — nach dem Umzug
// NUR noch Zustand + öffentliche Methoden. Die Handwerksfächer liegen daneben:
//   treeOps       — reine Baum-Helfer (leerer Baum, Props, Teilbaum)
//   duplizieren   — Kopie eines Teilbaums samt Umschreiben ihrer Verweise
//   history       — Verlauf/Undo/Redo + Gesten-Transaktionen
//   persistence   — Laden, Verteidigen (sanitize), Notfallkopie, Speichern
//   migrations    — Übernahme alter Speicherstände
//   templateRules — Musterkarten-Markierung + Löschschutz
//   pageOps       — Seiten der Maske (Hauptseite + Popups), Fluss-Kinder
//   rasterOps     — wo ein Baustein liegt: Bewegen (Fluss wie Zelle), Größe,
//                   Einfügen an der Zelle
//   selectionOps  — Aufklapp-Auswahl (Board → Spalte → Karte)
//   speicherPlaner— entprellt speichern + „sofort" beim Verlassen der Seite
//
// Die REINEN Fächer rechnen nur (treeOps, templateRules, pageOps, rasterOps,
// selectionOps): kein Zustand, kein Horchen, kein Melden — Baum rein, neuer
// Baum raus (null = nichts zu tun). Den Baum übernehmen, die Historie schreiben
// und EINMAL melden: allein hier. Ein Horchposten, eine Meldestelle.
//
// Speichert nur einen serialisierbaren BlockNode-Baum (flache Map + Wurzel) und
// benachrichtigt React per Subject. Wo ein Baustein sitzt, steht in seinen Props
// (Fluss-Reihenfolge in Containern, Zelle auf der Rasterflaeche).

import { ROOT_ID, type BlockNode, type BlockTree } from '../core/blocks/BlockData'
import { createBlockSubtree } from '../core/blocks/blockFactory'
import { canContain, getAllBlockDefinitions, getBlockDefinition } from '../core/blocks/blockRegistry'
import { rasterSpecOf } from '../core/blocks/rasterLayout'
import { type BlockEventsMap } from '../core/data/aktionen'
import { type DataSource } from '../core/data/dataSources'
import { type QuelleInReichweite } from '../core/data/sourceLinks'
import { dataSourceStore } from './DataSourceStore'
import { ersteQuelleInReichweite, quellenInReichweite } from './quellenOps'
import { Historie, type EditorSnapshot } from './history'
import { loadFromStorage, persistState, SAVE_DEBOUNCE_MS } from './persistence'
import { SpeicherPlaner } from './speicherPlaner'
import { Subject } from './Subject'
import { dupliziereTeilbaum } from './duplizieren'
import {
  collectSubtree,
  createEmptyTree,
} from './treeOps'
import {
  isRemoveProtected as istMusterGeschuetzt,
  templateMarkFor as templateMarkInTree,
} from './templateRules'
import {
  aktiveSeitenWurzel,
  kinderImFluss,
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
import { auswahlAufSeite, drillDownZiel } from './selectionOps'
import { deepClone } from '../lib/deepClone'

// Der persistence-Wächter (und Rettungs-Anleitungen) importieren den
// Notfallkopie-Schlüssel seit jeher von hier — Außen-Vertrag bleibt.
export { BACKUP_KEY } from './persistence'

export class Editor extends Subject<Editor> {
  private _tree: BlockTree = createEmptyTree()
  private _selectedId: string | null = null
  // Aktive SEITE der Maske: ROOT_ID = Hauptseite, sonst die id eines
  // Seiten-Bausteins (pageBlock, z.B. Popup) unter der Wurzel. Bewusst NICHT
  // persistiert — welche Seite offen ist, ist Arbeitszustand wie die Auswahl.
  private _activePageId: string = ROOT_ID
  private _version = 0
  private _historie = new Historie()
  // Entprellt speichern + „sofort" beim Verlassen der Seite (s. speicherPlaner).
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

  // Wurzel der AKTIVEN Seite: Canvas, Bibliothek und Drag-Ziele
  // arbeiten dadurch automatisch auf der Seite, die gerade offen ist.
  get rootId(): string {
    return aktiveSeitenWurzel(this._tree, this._activePageId)
  }

  get activePageId(): string { return this.rootId }

  get pages(): SeitenEintrag[] {
    return seitenDerMaske(this._tree)
  }

  // Nur eine Auswahl auf der SICHTBAREN Seite gilt — Regel siehe selectionOps.
  private auswahlAufAktiverSeite(id: string | null): string | null {
    return auswahlAufSeite(this._tree, id, this.rootId)
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
    // Welcher Baustein eine Seite IST, sagt die Registry (pageBlock) — nicht
    // ein Typ-Name hier im Store (Regel 2). Als Funktionsargument haette der
    // fest verdrahtete 'popup'-String den Wächter nie ausgeloest; pageOps
    // macht es zwei Dateien weiter schon richtig. Der sichtbare Name "Popup"
    // unten ist davon unberuehrt — das ist Anzeige, kein Typ.
    const typ = getAllBlockDefinitions().find((d) => d.pageBlock)?.type
    if (!typ) return null
    const vergeben = new Set(this.pages.map((p) => p.name))
    let name = 'Popup'
    for (let n = 2; vergeben.has(name); n++) name = `Popup ${n}`
    this.beginTransaction()
    const node = this.addBlock(typ, ROOT_ID)
    if (node) {
      this._activePageId = node.id
      this.updateProperty(node.id, 'name', name)
    }
    this.endTransaction()
    return node
  }

  getNode(id: string): BlockNode | undefined { return this._tree[id] }

  childNodesOf(parentId: string): BlockNode[] {
    return kinderImFluss(this._tree, parentId)
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

  // Die Aenderung ist an dieser Stelle SCHON im Baum. Der Autosave muss sie
  // darum in jedem Fall einplanen — auch wenn beim Melden etwas schiefgeht
  // (A7.1, 2026-08-11): sonst haette der Bediener eine Aenderung auf dem
  // Schirm, die nie geschrieben wird. Subject faengt einen werfenden Horcher
  // inzwischen selbst ab; `finally` deckt den Rest ab, damit die Zusage nicht
  // an einer fremden Datei haengt.
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

  // Hängt einen neuen Block in den angegebenen Container (Default: Wurzel,
  // ans Ende). `index` = Einfüge-Position innerhalb der Kinder (für Drop).
  // Beispieldaten (defaultChildren) kommen als kompletter Teilbaum mit —
  // ein Undo entfernt alles wieder. Verweigert Typen, die der Zielcontainer
  // nicht aufnimmt (allowedChildTypes), und ebenso eine parentId, die es im
  // Baum nicht (mehr) gibt — beide Male kein History-Eintrag, null. Bis
  // 2026-08-06 fiel eine unbekannte parentId still auf die Wurzel zurueck: ein
  // veraltetes Drop-Ziel sah dann aus wie ein Erfolg an falscher Stelle.
  // Ohne parentId landet der Block auf der AKTIVEN Seite — die
  // Bibliothek bestückt damit automatisch die Seite, die gerade offen ist.
  addBlock(type: string, parentId?: string, index?: number): BlockNode | null {
    const parent = this._tree[parentId ?? this.rootId]
    if (!parent || !canContain(parent.type, type)) return null
    this.pushHistory()
    const { nodes, rootId } = createBlockSubtree(type)
    const node = nodes[rootId]
    node.parentId = parent.id
    // Auf einer Rasterfläche bekommt der neue Block seine Startgröße aus der
    // Registry und rückt in die freie Zeile ganz unten (Einfügen „ans Ende") —
    // sonst lägen alle neuen Blöcke aufeinander in Zeile 0. INNERHALB von
    // Containern (Spalte/Zeile/Karte) bleibt die Fluss-Reihenfolge.
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

  // Aufklapp-Auswahl (Board → Spalte → Karte) — Regel siehe selectionOps.
  selectDrillDown(clickedId: string): void {
    const ziel = drillDownZiel(this._tree, clickedId, this._selectedId)
    if (ziel !== null) this.selectBlock(ziel)
  }

  // Erste Datenquelle in Reichweite (sie liefert die ZEILEN) — Baumsuche und
  // Vererbungsregel wohnen in quellenOps, damit Editor und Preflight dieselbe
  // benutzen statt zweier Abschriften.
  dataSourceFor(id: string): DataSource | undefined {
    return ersteQuelleInReichweite(this._tree, id, dataSourceStore.list)
  }

  // ALLE Quellen in Reichweite: die erste plus die weiteren, die am selben
  // Träger hängen. Genau dieselbe Vererbung — hängt der Bediener eine zweite
  // Quelle an den Kanban, können alle Karten darin ihre Felder wählen.
  quellenFor(id: string): QuelleInReichweite[] {
    return quellenInReichweite(this._tree, id, dataSourceStore.list)
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
    // Gleicher Wert = kein Vorgang: weder Verlaufs-Schritt noch Neuzeichnen.
    // Sonst verbraucht z. B. ein Control, das beim Verlassen des Felds seinen
    // unveraenderten Wert nochmal meldet, einen der 50 Undo-Plaetze.
    if (Object.is(node.props[attr], value)) return
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
    const def = getBlockDefinition(node.type)
    const prop = def?.customProperties.find((p) => p.attributeName === attr)
    if (prop?.exclusiveAmongSiblings && value === 'ja' && node.parentId) {
      for (const sibId of this._tree[node.parentId]?.childIds ?? []) {
        const sib = next[sibId]
        if (sibId !== id && sib?.type === node.type && sib.props[attr] === 'ja') {
          next[sibId] = { ...sib, props: { ...sib.props, [attr]: 'nein' } }
        }
      }
    }
    // Aendert die neue Einstellung laut Registry die Raster-STARTgroesse des
    // Bausteins, springt er auf sie — im SELBEN History-Eintrag, damit Ctrl+Z
    // Einstellung und Groesse zusammen zurueckstellt (startgroesseNachziehen).
    next[id] = startgroesseNachziehen(def, node.props, next[id])
    this._tree = next
    this.notify(this)
  }

  // Aktionsketten eines Bausteins ersetzen: Ereignis-Key → Schritte.
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

  // Baustein verdoppeln — Regeln siehe duplizieren: die Kopie zeigt auf die
  // Kopie (nicht mehr aufs Original), landet im selben Elternteil und auf der
  // Hauptfläche in einer freien Zeile. Eine Seite (Popup) meldet null.
  // Ein pushHistory + ein notify = EIN Undo-Schritt.
  duplicateBlock(id: string): BlockNode | null {
    const res = dupliziereTeilbaum(this._tree, id)
    if (!res) return null
    this.pushHistory()
    this._tree = res.tree
    this._selectedId = res.kopieId
    this.notify(this)
    return res.tree[res.kopieId]
  }

  // Knoten in einen Container an eine Einfüge-Position — Regeln siehe rasterOps.
  moveNode(id: string, newParentId: string, index: number): void {
    const next = verschiebeInContainer(this._tree, id, newParentId, index)
    if (!next) return
    this.pushHistory()
    this._tree = next
    this.notify(this)
  }

  // Block auf eine feste Zelle verschieben — Regeln siehe rasterOps.
  // Ein pushHistory + ein notify = EIN Undo-Schritt.
  moveNodeToCell(id: string, parentId: string, x: number, y: number): void {
    const next = zelleneinzug(this._tree, id, parentId, x, y)
    if (!next) return
    this.pushHistory()
    this._tree = next
    this._selectedId = id
    this.notify(this)
  }

  // Größe auf der Rasterfläche ändern — Regeln siehe rasterOps. Läuft LIVE im
  // Zieh-Zug, der die Undo-Transaktion klammert (zieheGroesse begin/end) —
  // deshalb nur pushHistory (im Transaktions-Fenster absorbiert) + notify.
  resizeNodeToCells(id: string, achse: 'x' | 'y', value: number): void {
    const next = zellenGroesse(this._tree, id, achse, value)
    if (!next) return
    this.pushHistory()
    this._tree = next
    this.notify(this)
  }

  // Neuen Block an eine feste Zelle einfügen — Regeln siehe rasterOps.
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

  // Die GANZE Maske ersetzen (Laden einer Maskendatei, 2026-07-28).
  // Bewusst OHNE History-Schritt — der Verlauf wird geleert: ein Snapshot
  // kennt nur Baum und Auswahl, die drei Bibliotheken haben kein Undo.
  // Ein Strg+Z danach ergaebe alten Baum + neue Bibliotheken (Begruendung
  // steht bei `Historie.leeren`). Laden ist wie das Oeffnen eines neuen
  // Dokuments: nichts zum Zurueckgehen.
  // Die aktive Seite faellt auf die Hauptseite zurueck — die geladene Maske
  // hat andere Seiten-ids, ein Verweis auf die alte ginge ins Leere.
  ersetzeMaske(tree: BlockTree): void {
    this._tree = tree
    this._selectedId = null
    this._activePageId = ROOT_ID
    this._historie.leeren()
    this._planer.plane()
    this.notify(this)
  }

  // Einen ausstehenden Stand JETZT schreiben — beim Verlassen der Seite die
  // letzte Gelegenheit dazu (providers.tsx meldet sich dafuer an).
  speichereJetzt(): void {
    this._planer.sofort()
  }
}

// Es gibt KEINE Weltvariable mehr — die eine
// App-Instanz entsteht in src/app/providers.tsx und reist über den
// EditorProvider; Tests bauen sich ihre Instanzen selbst (`new Editor()`).
