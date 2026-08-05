# Code-Review 2026-08-05 — geretteter Stand (UNVOLLSTÄNDIG)

**Kontext:** Review durch 7 parallele Prüf-Blickwinkel wurde wegen Token-Knappheit
abgebrochen. **Fertig geprüft: nur 2 von 7 Bereichen** (siehe unten). Die geplante
skeptische Gegenprüfung jedes Fundes ist NICHT gelaufen — jeder Fund hier ist eine
belegte Behauptung mit Datei+Zeile, aber vor dem Fixen die Stelle selbst nachlesen.

**Fertig:** Zustands-Kern (src/state) · React-Oberfläche (src/app, src/editor, src/ui).
**Nicht geprüft:** Bausteine/Lit (src/blocks, src/core/blocks) · Export (src/export) ·
SoftEngine-Anbindung (src/softengine) · Handwerks-Querschnitt (any/Kopien/toter Code) ·
Architektur-Gesamtblick · CLAUDE.md-Entscheidungsabgleich.

**Arbeitsauftrag an den nächsten Agenten (Nutzer-Wunsch, Token-sparsam):**
Funde der Reihe nach abarbeiten (kaputt → riskant → …), je Thema ein Commit,
Prüfbündel einmal vor jedem Commit. Kein neues Review starten, bevor diese Liste
leer ist. Diese Datei nach Abarbeitung löschen (Nutzer kann das mit einem Satz anordnen).

---

## Kaputt — macht unter echten Bedingungen etwas falsch

### KAPUTT-1: Demo-Putzer löscht aktuelle Nutzereingaben beim Laden aus dem Browser-Speicher
**Stelle:** `src/state/persistence.ts:230`

putzeAlteKartenDemos leert Karten-Props, die exakt einem der fünf alten Werkswerte entsprechen ('Heute', '09:15', 'Rückruf Fr. Wagner', 'Katze · EKH', 'Befund Minka besprechen'). Beim Laden einer MASKENDATEI wurde das korrekt auf alte Stände begrenzt (maskenDatei.ts:223-226 übergibt schemaVersion < CURRENT_SCHEMA_VERSION, mit eigenem Test 'eine Karte mit dem echten Wert Heute ueberlebt Speichern und Laden'). Der Browser-Speicher-Pfad ruft baumAusRohdaten(parsed) aber OHNE das Flag auf — putzeDemos defaultet auf true und läuft damit auch für aktuelle Schema-5-Stände. Tippt ein Nutzer heute 'Heute' in den Chip oder '09:15' ins Zeit-Feld einer Karte (beides sehr plausible echte Werte), ist der Wert nach jedem Reload still weg, und der Autosave schreibt den Verlust sofort fest. Genau der Fehler, der am Datei-Pfad 2026-07-28 gefixt wurde, lebt am Speicher-Pfad weiter.

**Beleg:** persistence.ts:230 `const ergebnis = baumAusRohdaten(parsed)` (kein zweites Argument, Default `putzeDemos = true` in Zeile 157/77 → Zeile 118 `if (putzeDemos) putzeAlteKartenDemos(tree)`); migrations.ts:55 `['chipText', 'Heute'],`; Gegenstück maskenDatei.ts:223-226 `baumAusRohdaten({ schemaVersion, tree: o.tree }, schemaVersion < CURRENT_SCHEMA_VERSION)`

**Vorschlag:** In loadFromStorage dieselbe Regel wie in maskenDatei.auspacken anwenden: schemaVersion aus dem geparsten Objekt lesen und `baumAusRohdaten(parsed, schemaVersion < CURRENT_SCHEMA_VERSION)` aufrufen. Der Putzer trifft dann nur noch Stände, die älter sind als das Paket 'Stellen starten leer'.

### KAPUTT-2: Klick auf einen Größen-Anfasser ohne Ziehen erzeugt Phantom-Undo-Schritt und löscht den Redo-Stapel
**Stelle:** `src/editor/canvas/zieheGroesse.ts:49`

zieheGroesse öffnet die Undo-Transaktion bereits bei pointerdown. Historie.begin ruft record(), und record() pusht bedingungslos einen Snapshot UND leert _future — auch wenn die Geste danach keinerlei Änderung produziert (Anfasser angeklickt, ohne Bewegung losgelassen). Folge unter echten Bedingungen: Nutzer ändert etwas, drückt Strg+Z (Änderung liegt im Redo-Stapel), klickt dann nur einen Anfasser an → Redo ist unwiederbringlich weg, zusätzlich liegt ein Leer-Schritt im Verlauf, sodass das nächste Strg+Z scheinbar nichts tut. Das Projekt kennt das Problem selbst: eingabeSitzung.ts löst es für Textfelder ausdrücklich ('Begonnen wird beim ERSTEN Tastendruck … wer nur ins Feld klickt und wieder rausgeht, soll keinen Leer-Schritt erzeugen') — die Zieh-Geste verletzt genau diese Regel.

**Beleg:** zieheGroesse.ts:49 `editor.beginTransaction()` (direkt bei pointerdown, vor jeder Bewegung); history.ts:31-33 in record(): `this._past.push(makeSnapshot()) … this._future = []`; history.ts:38-39 `begin(...): if (this._txDepth === 0) this.record(makeSnapshot)`; Kontrast eingabeSitzung.ts:8-9

**Vorschlag:** Transaktion erst beim ersten tatsächlichen onMove-Schritt öffnen (gleiches Muster wie eingabeSitzung: ein `offen`-Flag im Closure), oder Historie.begin so umbauen, dass der Snapshot erst beim ersten record()-würdigen Ereignis innerhalb der Transaktion in _past übernommen und _future erst dann geleert wird.

### KAPUTT-3: Nach Reload kann ein Baustein einer unsichtbaren Popup-Seite ausgewählt sein
**Stelle:** `src/state/Editor.ts:84`

selectedId wird persistiert und beim Start wiederhergestellt (nur gegen Existenz im Baum geprüft, persistence.ts:188-191), die aktive Seite dagegen bewusst nicht — sie startet immer als Hauptseite. War beim letzten Speichern ein Block einer Popup-Seite gewählt, zeigt der Editor nach dem Reload die Hauptseite, hält aber die Auswahl auf dem unsichtbaren Popup-Block: der Inspector zeigt und editiert einen Baustein, der nirgends zu sehen ist, und die Entf-Taste (useKeyboardShortcuts.ts:28-33 löscht editor.selectedId ohne Seiten-Prüfung) entfernt einen unsichtbaren Block. Genau diese Invariante formuliert setActivePage selbst ('die Auswahl wird geleert, damit Inspector/Anfasser nicht auf einen Block einer unsichtbaren Seite zeigen') — der Lade-Pfad verletzt sie. Umfang klein, aber echtes Fehlverhalten nach jedem Reload aus einer Popup-Sitzung.

**Beleg:** Editor.ts:84 `this._selectedId = persisted?.selectedId ?? null` bei fest `_activePageId: string = ROOT_ID` (Zeile 74, 'Bewusst NICHT persistiert'); Invariante in Editor.ts:103-105; Delete-Weg useKeyboardShortcuts.ts:29-32

**Vorschlag:** Beim Wiederherstellen die Auswahl verwerfen, wenn der Block nicht auf der aktiven (Haupt-)Seite liegt — z. B. im Konstruktor prüfen, ob der nächste Rasterflächen-Vorfahr des selectedId die ROOT_ID ist; alternativ activePageId mit persistieren.

### KAPUTT-4: Verwendungs-Anzeige und Loesch-Warnung uebersehen Relationen in Aktionsketten
**Stelle:** `src/editor/zentrale/RelationenBereich.tsx:59`

verwendungFor scannt nur customProperties mit kind 'relation' (n.props). Der Hauptweg, eine Relation zu benutzen, sind aber Aktionsketten: StepForm speichert sie in node.events als ActionStep mit relationId (ueber Inspector.speichereSchritt -> updateBlockEvents). Eine Relation, die z. B. ein Button-Klick ausfuehrt, zeigt im Steuerungs-Detail 'Von keinem Baustein verwendet', und loeschen() (Z. 69-76) stellt die harmlose Frage OHNE die 'wird BENUTZT'-Warnung. Nach dem Loeschen ist die Kette kaputt (amber 'unvollstaendig', Export geblockt) — genau der Fall, vor dem die Warnung schuetzen soll. Der Export beweist, dass der Events-Scan trivial ist: exportMask.ts:331 laeuft bereits ueber alle Ketten ('if (step.type === 'RELATION') add(step.relationId)').

**Beleg:** RelationenBereich.tsx:59-67: `const verwendungFor = (id: string): string[] => Object.values(ed.tree).filter((n) => { const def = getBlockDefinition(n.type); return def?.customProperties.some((p) => p.kind === 'relation' && n.props[p.attributeName] === id) })...` — node.events (ActionStep.relationId) kommt nirgends vor.

**Vorschlag:** Zusaetzlich node.events aller Baeume scannen: jede Kette, jeder Schritt mit step.type === 'RELATION' && step.relationId === id zaehlt als Verwendung (Muster aus exportMask.ts:331 uebernehmen).

### KAPUTT-5: Datenquellen-Verwendung uebersieht Nachschlage-Quelle und Schritt-Parameter
**Stelle:** `src/editor/zentrale/DatenquellenBereich.tsx:64`

verwendungFor delegiert an bausteineMitQuelle (state/quellenOps.ts:61-71), und das zaehlt nur Traeger mit traegtEigeneQuelle (props.source + weitereQuellen). Zwei echte Verwendungen fallen durch: (1) Das Nachschlage-Feld — bei fieldType 'nachschlagen' ist acceptsDataSource ausdruecklich AUS (FormFeldBlock.ts:91-93), seine Quelle steht in der Prop 'nachschlagQuelle' (kind 'quelle', feldEigenschaften.ts:42-46) und wird nie gezaehlt. (2) Aktions-Parameter mit source 'data_field', die eine dataSourceId tragen (ParameterZeile.tsx:105-127). Folge: eine nur dort benutzte Quelle steht als 'nicht verwendet' in Liste und Detail, und die Loesch-Rueckfrage kommt ohne BENUTZT-Warnung — das Nachschlage-Fenster verliert seine Liste, der Schritt seinen Parameter.

**Beleg:** DatenquellenBereich.tsx:64-65: `const verwendungFor = (id: string): string[] => bausteineMitQuelle(ed.tree, id).map((n) => bausteinName(n))` — quellenOps.ts:67: `if (!traegtEigeneQuelle(n)) return false` schliesst das aktive Nachschlage-Feld aus (FormFeldBlock.ts:92: `wenn: { attributeName: 'fieldType', notEquals: 'nachschlagen' }`).

**Vorschlag:** bausteineMitQuelle um kind-'quelle'-Properties (nachschlagQuelle u. ae.) und um data_field-Bindings in node.events erweitern — oder in DatenquellenBereich einen zweiten Scan ergaenzen.

### KAPUTT-6: Quellwechsel erzeugt bis zu 5 Undo-Schritte; 1x Ctrl+Z stellt den verbotenen Mischzustand her
**Stelle:** `src/editor/inspector/PropControl.tsx:160`

Der onChange des 'quelle'-Controls ruft set(neueId) und dann in einer Schleife bis zu 4 weitere ed.updateProperty (Feld + Klarname je abhaengiger Prop) — OHNE beginTransaction/endTransaction. Jeder updateProperty-Aufruf legt einen eigenen History-Eintrag an (Editor.ts:313 pushHistory, history.ts:29-34). Ein einziger Dropdown-Klick am Nachschlage-Feld (nachschlagQuelle + anzeigeFeld/anzeigeTitel + speicherFeld/speicherTitel) kostet damit 5 der 50 Undo-Plaetze, und EIN Ctrl+Z stellt exakt den Zustand her, den das Leeren laut eigenem Kommentar verhindern soll: neue Quelle mit altem Klarname/Feldcode der vorherigen Quelle. Vollstaendig zurueck braucht 5x Ctrl+Z. Widerspricht dem im Projekt sonst konsequenten Muster 'ein Bedienschritt = EIN Undo-Eintrag' (updateBlockEvents, eingabeSitzung, zieheGroesse). Dieselbe Doppel-Eintrag-Falle steckt in FeldBindung.tsx:180-186/211-213 (quelleSetzen + Bindung = 2 Eintraege je Feldwahl im Bibliotheks-Angebot).

**Beleg:** PropControl.tsx:160-172: `set(neueId); ... for (const andere of def?.customProperties ?? []) { if (andere.quelleProp !== property.attributeName) continue; ed.updateProperty(block.id, andere.attributeName, ''); if (andere.klarnameProp) { ed.updateProperty(block.id, andere.klarnameProp, '') } }` — keine Transaktions-Klammer.

**Vorschlag:** Die Kaskade in ed.beginTransaction()/ed.endTransaction() klammern (dieselbe Mechanik wie zieheGroesse); in FeldBindung.quelleSetzen ebenso.

### KAPUTT-7: Raster-Bewegen kapert Zeiger-Gesten in der Inline-Bearbeitung
**Stelle:** `src/editor/canvas/rasterMove.ts:40`

ziehePosition startet auf JEDEM pointerdown im Raster-Wrapper (CanvasNode.tsx:166) und filtert das Ereignis-Ziel nicht — auch nicht, wenn der Zeiger in einer per Doppelklick geoeffneten Inline-Bearbeitung steht. BasicBlock.inlineEdit setzt contenteditable (BasicBlock.ts:95), stoppt aber nur den dblclick (Z. 85), keine folgenden pointerdown-Events. Wer im Edit-Modus Text per Ziehen markiert (Zeigerweg > 4px), bewegt stattdessen den ganzen Baustein: onMove setzt Geist + Dim, onUp ruft moveNodeToCell — bei Zellwechsel springt der Block mitten im Tippen an eine andere Stelle (rasterOps.zelleneinzug schreibt + History-Eintrag); schon ein kleines Verrutschen laesst den Geist aufflackern und der Klick-Schlucker frisst den Folgeklick. Dass die Gefahr real ist, zeigt die Tabelle: ihre Editierfelder schuetzen sich mit @pointerdown=stop (TabelleBlock.ts:425, spaltenBearbeiten.ts:34) — der generische Inline-Edit-Pfad tut das nicht.

**Beleg:** rasterMove.ts:40-41: `if (e.button !== 0) return` ist der EINZIGE Filter; danach `window.addEventListener('pointermove', onMove)` etc. — kein Check auf contenteditable/Editier-Ziel im composedPath. CanvasNode.tsx:166: `onPointerDown={(e) => ziehePosition(ed, dnd, e, node, parentId)}`.

**Vorschlag:** In ziehePosition frueh aussteigen, wenn e.nativeEvent.composedPath() ein Element mit isContentEditable (oder [contenteditable]) enthaelt — analog zum spotAt-Muster in useBindingPicker.

### KAPUTT-8: Popup-Freiflaeche zeigt Drop-Vorschau ohne Typ-Pruefung, Drop scheitert dann still
**Stelle:** `src/editor/canvas/PopupSeite.tsx:85`

Der onDragOver der freien Popup-Flaeche setzt das Drop-Ziel ohne canContain-Pruefung — anders als die beiden Geschwister-Pfade (Canvas.onGridDragOver prueft via rasterZiel/gezogeneGroesse, CanvasNode.onDragOver via allowedIn). Zieht man eine Kanban-Karte oder -Spalte (beide mit allowedParentTypes eingeschraenkt) ueber die Popup-Seite, erscheint die Einfuege-Linie als gueltiges Ziel und der Drop wird angenommen (preventDefault). commitDrop ruft dann ed.moveNode bzw. ed.addBlock, die per canContain still ablehnen (Editor.ts:386, 207) — nichts passiert, keine Meldung. Das verstoesst gegen die eigene Regel 4 ('nichts scheitert still') und laesst den Bediener raetseln, warum sein Drop verschwindet.

**Beleg:** PopupSeite.tsx:81-86: `onDragOver={(e) => { if (dnd.dragId === null && !isNewBlockDrag(e.dataTransfer)) return; e.preventDefault(); dnd.setDropTarget({ kind: 'flow', parentId: node.id, index: ed.childNodesOf(node.id).length }) }}` — kein canContain wie in CanvasNode.tsx:119-123.

**Vorschlag:** Vor setDropTarget den gezogenen Typ bestimmen (dnd.dragId -> ed.getNode(...).type bzw. newBlockDragType) und mit canContain(node.type, typ) pruefen; sonst setDropTarget(null).

## Riskant — Zeitbomben

### RISKANT-1: Entprellter Autosave ohne Obergrenze und ohne Unload-Flush — Arbeitsverlust beim Schließen des Fensters
**Stelle:** `src/state/Editor.ts:481`

scheduleSave löscht bei JEDEM notify den laufenden Timer und setzt ihn neu auf 500 ms. Während einer durchgehenden Arbeitsserie (Tippen, Ziehen — jeder Schritt notifiziert schneller als alle 500 ms) wird also überhaupt nicht gespeichert; der persistierte Stand bleibt der von VOR der Serie. Es gibt im gesamten Projekt keinen beforeunload/pagehide/visibilitychange-Handler (Grep über src/ und index.html: null Treffer). Wer das Fenster direkt nach einer Editier-Serie schließt, verliert still alles seit der letzten Ruhepause — das widerspricht der eigenen eisernen Regel 'Verluste passieren nie still'. Dasselbe Muster steckt in VorlagenStore.planeSpeichern (Zeile 178-191) für Datenquellen und Relationen.

**Beleg:** Editor.ts:481-484 `if (this._saveTimer) clearTimeout(this._saveTimer); this._saveTimer = setTimeout(() => { persistState(this._tree, this._selectedId) }, SAVE_DEBOUNCE_MS)`; kein Treffer für `beforeunload|pagehide|visibilitychange` im Repo

**Vorschlag:** Einen pagehide-/visibilitychange('hidden')-Handler ergänzen, der synchron persistState (und die zwei Bibliotheks-Speicher) aufruft und den offenen Timer verwirft — localStorage.setItem ist synchron und dafür geeignet. Die Entprellung für den Normalbetrieb bleibt unverändert.

### RISKANT-2: Export loest zwei automatische Downloads aus einem Klick aus, revoke direkt nach click()
**Stelle:** `src/editor/shell/Toolbar.tsx:72`

handleExport ruft downloadFile zweimal hintereinander in einem Klick-Handler. Chromium-Browser behandeln den zweiten programmatischen Download als 'multiple automatic downloads': es kommt ein Berechtigungs-Prompt, und wenn der Nutzer den je abgelehnt hat (oder eine Policy greift), wird die zweite Datei STILL verworfen. Der Bediener haette dann nur index.basis.source.html ohne die SEvariablen-JSON — die Maske faellt erst in SoftEngine auf. Dazu revoked downloadFile die Blob-URL synchron direkt nach a.click() (Z. 35); das funktioniert meist, ist aber ein bekanntes Timing-Risiko (v. a. Firefox bei groesseren Blobs), gegen das ueblicherweise ein setTimeout gesetzt wird. Fuer einen Nutzer, der Fehler selbst nicht diagnostizieren kann, ist ein stiller Halb-Export die teuerste Fehlerart.

**Beleg:** Toolbar.tsx:72-73: `downloadFile('index.basis.source.html', html, 'text/html'); downloadFile('index.basis.SEvariablen.json', sevariablen, 'application/json')` — und Z. 34-35: `a.click(); URL.revokeObjectURL(url)`.

**Vorschlag:** Beide Dateien als eine ZIP anbieten (loest zugleich die SE-Konvention 'eine Maske = ein Ordner'), mindestens aber revokeObjectURL um einen Timeout verzoegern und den zweiten Download erst nach kurzem Abstand ausloesen.

## Peinlich — fiele einem Profi negativ auf

### PEINLICH-1: addBlock leitet einen unbekannten Ziel-Container still auf die Wurzel um
**Stelle:** `src/state/Editor.ts:206`

Wird addBlock mit einer parentId aufgerufen, die es im Baum nicht (mehr) gibt, greift `?? this._tree[ROOT_ID]` und der neue Block landet kommentarlos auf der Hauptseiten-Wurzel statt im gemeinten Container. Das maskiert Aufrufer-Fehler (veraltete Drop-Ziel-Id) als scheinbaren Erfolg an falscher Stelle — ein stiller Fehlerpfad in einem Projekt, dessen Wächter sonst überall Klartext-Fehler verlangen. Der Fallback ist zudem doppelt unnötig: für den Default-Fall ohne parentId fällt der rootId-Getter über aktiveSeitenWurzel bereits selbst auf ROOT_ID zurück, `this._tree[this.rootId]` kann also nie undefined sein — der `??`-Zweig existiert NUR für den Fall der falschen expliziten parentId.

**Beleg:** Editor.ts:206 `const parent = this._tree[parentId ?? this.rootId] ?? this._tree[ROOT_ID]`; Absicherung des Getters in pageOps.ts:23-25 `return tree[activePageId] ? activePageId : ROOT_ID`

**Vorschlag:** Bei explizit übergebener, unbekannter parentId `null` zurückgeben (wie beim canContain-Verbot eine Zeile darunter) statt auf die Wurzel umzuleiten: `const parent = this._tree[parentId ?? this.rootId]; if (!parent) return null`.

### PEINLICH-2: Loeschen-Knopf und Entf-Taste scheitern bei der Musterkarte stumm
**Stelle:** `src/editor/inspector/Inspector.tsx:253`

Der Inspector-Loeschen-Knopf ruft ed.removeBlock(block.id) direkt; ebenso useKeyboardShortcuts bei Entf (useKeyboardShortcuts.ts:31). Editor.removeBlock bricht fuer geschuetzte Musterkarten kommentarlos ab (Editor.ts:254 'if (this.isRemoveProtected(id)) return'). Das Kreuzchen am Baustein behandelt genau diesen Fall vorbildlich mit einer Erklaerung (BlockHost.tsx:126-131 window.alert 'Hier liegt die Musterkarte …'). Ueber Inspector-Knopf oder Tastatur drueckt der Bediener also 'Loeschen' und es passiert sichtbar nichts — ein toter Knopf ohne Rueckmeldung, im direkten Widerspruch zur eigenen Regel 4 und zur bereits existierenden Erklaer-Logik zwei Dateien weiter.

**Beleg:** Inspector.tsx:250-256: `<IconButton aria-label="Löschen (Entf)" ... onClick={() => ed.removeBlock(block.id)}>` — ohne den isRemoveProtected-Check samt Alert, den BlockHost.onRemoveClick (BlockHost.tsx:126-131) hat.

**Vorschlag:** Die Schutz-Erklaerung aus BlockHost.onRemoveClick an EINE Stelle ziehen (z. B. Helfer neben templateRules) und von Inspector-Knopf, Entf-Taste und Kreuzchen gemeinsam nutzen.

## Unnötig kompliziert

### UNNOETIG-1: Frisches quellen-Array je Render hebelt die dokumentierte Memo-Absicht aus
**Stelle:** `src/editor/canvas/BlockHost.tsx:71`

bindableSpots wird laut Kommentar (Z. 66-67) extra gememoized, 'weil eine frische Liste je Render den Props-Effekt in useLitElement jedes Mal neu laufen liesse'. Direkt darunter wird aber quellen bei jedem Render neu erzeugt: editor.quellenFor baut je Aufruf ein neues Array (quellenOps.quellenInReichweite mappt). quellen steht im selben Abhaengigkeits-Array des Props-Effekts (useLitElement.ts:152). Ergebnis: fuer jeden Baustein mit Quelle in Reichweite laeuft der Effekt trotzdem bei JEDEM Render — und da der Canvas bei jeder Store-Aenderung (jeder Tastendruck im Inspector) alle Knoten neu rendert, werden saemtliche DOM-Properties aller gebundenen Bausteine bei jedem Tastendruck neu geschrieben. Sichtbar gerettet wird das nur von Lits ===-Vergleich. Der Kommentar verspricht eine Optimierung, die real nicht greift.

**Beleg:** BlockHost.tsx:68-73: `const bindableSpots = useMemo(() => bindbareStellenVon(block), [block])` (Kommentar: 'weil eine frische Liste je Render den Props-Effekt … jedes Mal neu laufen ließe') gefolgt von `const quellen = … ? editor.quellenFor(block.id) : KEINE_QUELLEN` — ungememoized, neues Array je Aufruf; useLitElement.ts:152 haengt davon ab.

**Vorschlag:** quellen ebenfalls memoizen (Abhaengigkeit: block.id + Store-Versionen) oder in quellenFor eine Identitaets-Cache-Schicht einziehen; alternativ den Kommentar an die Realitaet anpassen und die bindableSpots-Memoisierung streichen.

### UNNOETIG-2: Beide useMemo in der Palette rechnen wegen instabiler Abhaengigkeit jedes Mal neu
**Stelle:** `src/editor/sidebar/BlockPalette.tsx:32`

definitions entsteht bei jedem Render als neues Array (getAllBlockDefinitions().filter(...)), steht aber im Abhaengigkeits-Array von filtered — und filtered wiederum in dem von grouped. Beide Memos invalidieren dadurch bei jedem Render, und die Palette rendert ueber useEditor bei JEDER Store-Aenderung (jeder Tastendruck, jeder Drag-Schritt). Die useMemo sind toter Ballast, der Stabilitaet vortaeuscht; die Registry ist statisch, definitions koennte einmal auf Modulebene stehen.

**Beleg:** BlockPalette.tsx:30-40: `const definitions = getAllBlockDefinitions().filter((d) => d.showInPalette !== false); const filtered = useMemo(() => { ... }, [definitions, query])` — definitions ist je Render eine neue Referenz.

**Vorschlag:** definitions modulweit einmal berechnen (const DEFINITIONS = getAllBlockDefinitions().filter(...)) — dann tragen die Memos wieder; oder die Memos ersatzlos streichen.

## Solide — Finger weg, das ist gut so

- Copy-on-Write-Disziplin wird im ganzen Zustands-Kern wirklich durchgehalten: jede Änderung ersetzt Knoten per Spread (Editor.ts, rasterOps.ts), Snapshots sind Tiefkopien (deepClone via structuredClone) — ein Grep über src/ findet keine einzige In-Place-Mutation von props außerhalb der Lade-Migrationen, die auf frisch gebauten Bäumen arbeiten. Undo/Redo kann dadurch nicht über geteilte Referenzen korrumpiert werden. _(Bereich: der Zustands-Kern — src/state (Editor.ts)_
- Die Fehlerpfade beim LESEN des Speichers sind besser als in den meisten Profi-Codebasen: kaputtes JSON UND 'gültiges JSON, falsche Form' werden beide als Notfallkopie unter einem eigenen Schlüssel gesichert, den der Autosave nie anfasst; nur die erste (wertvollste) Kopie bleibt erhalten; Schreib-Pannen melden sich genau einmal pro Störung mit Reset bei Erfolg, je Speicherschlüssel getrennt (notfallkopie.ts, persistence.loadFromStorage). _(Bereich: der Zustands-Kern — src/state (Editor.ts)_
- maskenDatei.auspacken ist ein ungewöhnlich gründlicher 'alles oder nichts'-Lader: Zukunftsversionen werden abgelehnt, hängende childIds-Verweise explizit erkannt, die Knoten-Bilanz gegen bewusst verworfene Typen gerechnet, und der einseitige Verlustvergleich (keinVerlust) erlaubt Normalisierung, erkennt aber jedes stille Wegwerfen — eine ungültige Datei ändert am offenen Stand garantiert nichts. _(Bereich: der Zustands-Kern — src/state (Editor.ts)_
- Browser-Speicher und Maskendatei teilen sich EINE Lade-Kette (baumAusRohdaten) mit gestuften, jeweils per Schwellenversion gegateten und idempotent gebauten Migrationen (migrations.ts Schema 2-5, inkl. dokumentierter Reparatur-Migrationen für eigene frühere Fehler) — die Doppelungs-Falle, die laut Projektgedächtnis den Tabellen-Bug erzeugte, ist strukturell beseitigt, nicht nur repariert. _(Bereich: der Zustands-Kern — src/state (Editor.ts)_
- Die Fächer-Aufteilung trägt: rasterOps/pageOps/selectionOps/templateRules/quellenOps sind reine Funktionen (Baum rein, neuer Baum oder null raus, kein Zustand, kein DOM), Historie schreiben und notify liegen an genau einer Stelle im Store, React ist sauber über useSyncExternalStore mit stabiler subscribe-Funktion angebunden — Editor.ts bleibt mit 490 Zeilen als reine Zustands-Fassade lesbar. _(Bereich: der Zustands-Kern — src/state (Editor.ts)_
- Die Store-Anbindung ist lehrbuchhaft: useSyncExternalStore mit stabilen subscribe-Funktionen (useEditor.ts per useCallback, useDataSources/useRelations als Modul-Konstanten) und einem Versionszaehler als Snapshot — kein Abo-Flattern, kein Tearing, und Subject.subscribe liefert konsequent eine Unsubscribe-Funktion (Subject.ts iteriert beim notify sogar ueber eine Momentaufnahme gegen Mutation waehrend des Durchlaufs). _(Bereich: die React-Seite — src/app, src/editor, s)_
- useLitElement ist eine ungewoehnlich saubere React-Web-Component-Bruecke: Erzeugen, Props-Schreiben und Aufraeumen an genau einer Stelle, Listener + Element werden im Cleanup symmetrisch entfernt, und das blockRef-Muster haelt einmal registrierte Event-Handler aktuell, ohne sie je neu anmelden zu muessen — das kriegen viele Profi-Codebasen schlechter hin. _(Bereich: die React-Seite — src/app, src/editor, s)_
- Die Zieh-Mechaniken (zieheGroesse.ts, rasterMove.ts) denken die Nicht-Happy-Paths mit: pointercancel UND window-blur als Abschlusswege, ein Einmal-Guard gegen doppeltes endTransaction, und der Kommentar erklaert ehrlich, warum (ein Transaktions-Leak haette still das gesamte Undo lahmgelegt). Der Klick-Schlucker in rasterMove raeumt sogar liegengebliebene once-Listener frueherer Zuege ab. _(Bereich: die React-Seite — src/app, src/editor, s)_
- eingabeSitzung.ts (eine Tipp-Sitzung = EIN Undo-Schritt) ist ein echtes Problem sauber geloest: Beginn erst beim ersten Tastendruck, Unmount-Cleanup schliesst offen gebliebene Transaktionen, und die Callbacks bleiben ueber eine Ref stabil, damit das Aufraeumen wirklich nur an der Unmontierung haengt. _(Bereich: die React-Seite — src/app, src/editor, s)_
- React-Muster werden korrekt statt kultisch eingesetzt: 'State waehrend des Renderns anpassen' anstelle von Effekt-Kaskaden (Inspector.tsx aufgabenBlock, NumberControl Entwurf/Basis, useBindingPicker), Escape-Schichtung ueber capture+stopPropagation funktioniert nachvollziehbar (FormularKarte vs. Kommandozentrale), und die A11y-Disziplin ist durchgaengig (IconButton erzwingt aria-label per Typsystem, Field verdrahtet aria-describedby/aria-invalid genau einmal). _(Bereich: die React-Seite — src/app, src/editor, s)_
