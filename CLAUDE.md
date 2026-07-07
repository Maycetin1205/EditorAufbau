# Aufbau-Editor — Hier weitermachen

> **Für KI-Chats:** Diese Datei zuerst lesen. Sie ist die verbindliche Wahrheit
> für Ziel + Arbeitsweise + Stand. Architektur-Details: `ARCHITEKTUR.md`.
> Wenn der Nutzer „wir machen weiter" sagt → hier den nächsten offenen Punkt
> der Roadmap nehmen.

## Was der Editor ist (Nordstern)

Ein visueller Baukasten für **SoftEngine-Masken**: Blöcke (Button, Text, später
Kanban / DetailCard / DataTable / Wizard …) auf einen Canvas ziehen, an
ERP-Daten (IDB-Tabellen) binden und als **fertiges HTML exportieren**, das in
SoftEngine läuft. Der Nutzer kann NICHT programmieren — der Editor muss ohne
Programmierkenntnisse bedienbar sein, und diese Datei + die Prüfungen sind
sein Ersatz dafür, Code lesen zu können.

**Nordstern (oberstes Ziel — alles daran messen):**
1. **1 Render / WYSIWYG:** Was im Editor zu sehen ist, IST der Export. EINE
   Render-Quelle (Web Components, die im Editor *und* im Export laufen). Kein
   separater Preview.
2. **Ersetzt den manuellen Programmierer:** Der Export muss so sauber + komplett
   sein, dass niemand mehr von Hand HTML/JSON nachbessern muss. Wenn doch nötig
   → das Tool hat versagt.

Kontext: Es gibt einen ALTEN, „vibe-gecodeten" Editor (Repo `react--app`;
lokal `C:\Users\mu.aycetin\Desktop\Projekte\react-app` — NICHT unter
`Editor\`), der
funktioniert (inkl. Export in SoftEngine), aber unwartbar ist (~29k Zeilen,
absolutes x/y-Modell, zwei halbfertige Systeme parallel). **Dieses Projekt baut
ihn sauber neu** und löst ihn dann ab. Außerdem gibt es das Repo
`behandlung-umbau`: eine echte, dokumentierte SoftEngine-Maske — dort steht in
`SE-INVENTAR.md`, wie SoftEngine-HTML technisch aufgebaut sein muss
(NO-TOUCH-Marker, Skript-Blöcke, SE-Schnittstellen). Das ist die Vorlage für
den Export (Kap. 3).

## Arbeitsweise (verbindlich)

- **Strangler-Fig-Migration:** Den alten Editor **Kapitel für Kapitel** sauber
  ins Neue umziehen. Alter bleibt nutzbar, neuer wächst bis zur Parität, dann
  Ablösung. Kein 28k-Zeilen-Big-Bang. NIEMALS im alten Editor umbauen — der
  gescheiterte In-Place-Umbau liegt dort schon als Mahnmal (`src/core/`).
- **Ein Kapitel wird KOMPLETT fertig (gebaut + geprüft + committed), erst dann
  beginnt das nächste.** Kein paralleles Anfangen.
- **Schritt für Schritt, klein.** Ein abgeschlossenes Stück pro Schritt.
- **Zielbild-Regel (pro Baustein, entschieden 2026-07-03):** Ein Baustein ist
  erst fertig, wenn er dem Zielbild FAST KOMPLETT entspricht: finales Design
  aus Tokens (Abgleich mit `dashboard/stilprobe.html`), Kernfunktionen,
  Inline-Edit/Inspector, Tests, Export geprüft. KEIN „erstmal grob, später
  polieren" — erst dann beginnt der nächste Baustein.
- **Atomic-Pflicht bei komplexen Blöcken (entschieden 2026-07-03):** Kanban,
  DataTable & Co. werden NIE am Stück gebaut — erst Atome, dann Moleküle,
  dann der Organismus. Jede Stufe einzeln nach Zielbild-Regel fertig und
  committed. Design-Zielbild (Stilprobe-Mockup) VOR dem ersten Atom festlegen.
- **Code immer zeigen + besprechen.** Der Nutzer will jeden Schritt sehen (auch
  wenn er nicht alles versteht) und mitreden. Ergebnis wenn möglich als
  Screenshot zeigen.
- **Erlaubnis vor Code-Änderungen:** erst Plan zeigen, „go" abwarten. Lesen /
  Analysieren ist jederzeit ok.
- **Nicht mit Mini-Entscheidungen nerven** (Snap-Grid, Farbnuancen): sinnvolle
  Defaults selbst wählen, kurz erwähnen.
- **Keine Komplimente / kein Cheerleading.** Sachlich, direkt, knapp.
- **Alter Editor = Referenz/Spec:** bei jedem Kapitel in den alten Editor
  schauen, WAS ein Feature können muss — **Funktion übernehmen, NICHT das
  Aussehen** (UI/UX wird neu gemacht). Goldreferenz fürs Verhalten = der alte
  Editor; fürs Export-Format = was SoftEngine konsumiert (`behandlung-umbau`).
- **Architektur nie opfern** (siehe `ARCHITEKTUR.md`).
- **Verifizieren nach jeder Änderung:** `npx tsc -b` + `npx eslint src` +
  `npm test`.
- **Leitplanken (nicht verhandelbar):**
  - **Tests niemals löschen oder abschwächen, um „grün" zu werden.** Wenn ein
    Test stört: dem Nutzer melden, er entscheidet.
  - **Jeder neue Baustein wird VOR dem Bau einmal aus Bedienersicht
    durchgespielt** (Was sieht der Nutzer? Was klickt er? Was passiert?) und
    kurz mit dem Nutzer abgestimmt.
  - **Technikwert ≠ Anzeigename.** Rohe Datenbankwerte (Indizes, Quellstrings
    wie `Behandlungszimmer 2`) erscheinen NIE sichtbar in der Maske; sichtbar
    ist immer ein frei änderbarer Anzeigename. Der Technikwert arbeitet
    unsichtbar.
  - **Roadmap-Schritte sind markiert:** `[kritisch]` = Architekturarbeit, nur
    mit starkem Modell + genauer Nutzer-Review; `[mechanisch]` = Arbeit nach
    vorhandenem Muster, auch mit schwächerem Modell (z. B. Opus) machbar.
- **Prinzipien + Quellen (immer dranhalten):**
  - **DRY** — keine Wiederholung; Gemeinsames rausziehen.
  - **OOP / Vererbung vs. Composition** — Vererbung nur für echte „is-a"-Basis
    (LSP einhalten); Features per Composition. Quellen: refactoring.guru, MDN
    Classes, Lit-Docs.
  - **React** — Komponenten/Props, „Composition over Inheritance". Quelle: react.dev.
  - **Atomic Design** — atoms → molecules → organisms → templates. Quelle: Brad Frost.
  - **Page-Builder-Architektur** — Drag&Drop, serialisierbarer JSON-State.
    Quelle: craft.js.

## Bedienlogik (EINE Logik für alle Bausteine)

1. Baustein aus der Bibliothek auf die Fläche **ziehen** → erscheint sofort
   mit sinnvollen Beispieldaten (nie ein leeres Gerippe).
2. **Datenquelle anhängen** (z. B. Kanban → „Terminplaner"). Ab dann bieten
   alle Stellen im Baustein nur Felder dieser Quelle an.
3. **Stelle anklicken → Feld wählen** (Feldliste mit Klarnamen wie „Vorname",
   nie Feldcodes wie `3292_30`; Übersetzung über zentrales Feld-Wörterbuch).
   Die Stelle zeigt sofort einen Beispielwert + Daten-Markierung.
4. **Doppelklick auf Text** → direkt umbenennen (Spaltentitel, Beschriftungen).
5. Strukturelles direkt am Baustein: Plus-Knopf für Spalte/Schritt, Ziehen zum
   Umsortieren, Kreuzchen zum Entfernen (mit Rückfrage wenn belegt).
6. Nur was sich nicht zeigen lässt, steht rechts im Inspector — und dort nur
   Sinnvolles.

## Roadmap (Strangler-Fig-Kapitel)

- ✅ **Kap. 0 — Fundament:** Block-Modell, Canvas, Verschieben (Drag, mit
  Transaktion = 1 Undo pro Geste), Inline-Edit (Doppelklick auf Block),
  Undo/Redo, localStorage-Persistenz.
- ✅ **Aufräumen:** Atomic-Design-Struktur etabliert (`ui/atoms` + `ui/molecules`);
  „Variante" aus ButtonBlock entfernt; Inspector-Felder bei Button/Text raus →
  stattdessen Inline-Edit.
- ✅ **Kap. 1 — Design-Grundlage (Editor-UI):** Editor-Chrome hell, klare
  Kontraste (shadcn-Tokens in `index.css`).
- ✅ **Kap. 1.5 — Masken-Design-Fundament (2026-07-02):** zentrale Werteliste
  `src/design/masken-tokens.css` (`--se-*`): kantig (2–4px Rundung), Grün als
  Hausfarbe, Statusfarben mit fester Bedeutung, dichte Werkzeug-Typografie.
  Button + Text auf Tokens umgestellt (keine Literale mehr im Block-CSS).
  Visuelle Referenz: `dashboard/stilprobe.html` (Quelle der Wahrheit für Werte
  bleibt die Token-Datei).
- ⚑ **Architektur-Schwenk (wichtig):** Editor nutzt ein **Container/Flow-
  Baum-Modell** (BlockNode mit `parentId`/`childIds`), **nicht** absolutes x/y.
  Grund: SoftEngine-Masken sind fließendes HTML; das x/y-Modell des alten
  Editors ist der Grund, warum dessen Export unvorhersehbar sitzt. Der alte
  Editor ist für Layout KEINE Referenz. Details: `ARCHITEKTUR.md`.
- ✅ **Kap. 2 (KOMPLETT 2026-07-02) — Container/Flow-Fundament** `[kritisch]`
  - ✅ 2.1 Datenmodell auf Baum (BlockNode-Map + Wurzel, Migration alter Stände,
    Flow-Rendering im Canvas statt Koordinaten).
  - ✅ 2.2 ContainerBlock + rekursives Rendering (2026-07-02): Baustein
    „Bereich" (`ff-container`, Kategorie Layout, `direction` column/row,
    Kinder via Light-DOM/`<slot>`). Canvas rendert rekursiv (BlockHost
    portalt Kind-Hosts ins Element). Editor-Hilfen (gestrichelter Rahmen,
    Platzhalter) liegen im BlockHost, NIE im Baustein (WYSIWYG). Palette
    fügt in den ausgewählten Bereich ein (Brücke bis 2.3).
  - ✅ 2.3 Drag-and-Drop-Platzierung (2026-07-02): EINE Drag-Logik im Canvas
    (React-Context) für alle Ebenen — vorhandene Blöcke umsortieren, in
    Bereiche hinein/heraus (Randzone = davor/dahinter, Mitte = hinein),
    Einfüge-Linie als Vorschau, Ziehen direkt aus der Bibliothek
    (MIME-Typ `application/x-ff-new-block`, kein geteilter State),
    Zyklen-Schutz (Bereich nie in sich selbst). Klick-Einfügen bleibt.
    Browser-getestet (6 Playwright-Fälle inkl. Undo nach Drag).
  - ✅ 2.4 Flow-Props (2026-07-02): universelle Breiten-Prop
    (`width: auto|fill|px`) für JEDEN Block, zentrale Logik in
    `core/blocks/flowLayout.ts` (dieselbe Quelle nutzt später der Export!).
    Inspector-Sektion „Layout": Breite (alle Blöcke), Richtung/Abstand/
    Innenabstand (Bereiche). Breite-Zieh-Anfasser am selektierten Block
    (Blöcke können per `resizableWidth=false` abwählen — Button tut das).
    Store-Fix: pushHistory respektiert Transaktionen (Ziehen = 1 Undo).
- ✅ **Kap. 2.5 — Sicherheitsnetz (2026-07-02)** `[kritisch]`: Vitest steht
  (`npm test` = `vitest run`, Node-Umgebung, localStorage-Stub in
  `src/test/setup.ts`, DOM-freie Test-Blöcke in `src/test/testBlocks.ts`).
  18 Tests: Store (einfügen/verschieben/Zyklen/duplizieren/Undo/Transaktion),
  Persistenz (sanitize, Migration, Inline-Edit-Werte überleben Reload,
  Müll-Speicher), Token-Regel (kein Farb-Literal + kein var()-Fallback in
  `src/blocks/**`, maschinell erzwungen). Aufräumer: Editor-Akzentfarbe nur
  noch als `--ring`-Token; ein gemeinsames SelectControl statt zwei.
  **Ab hier gehören Tests zu jedem Kapitel dazu.**
- ✅ **Kap. 3 — Mini-Export nach SoftEngine (GEBAUT + ABGENOMMEN 2026-07-02:
  Nutzer hat den Export in SoftEngine getestet — funktioniert!)** `[kritisch]`
  **(VORGEZOGEN, war Kap. 8):** Export-Knopf in der Toolbar → `maske.html` +
  `maske.SEvariablen.json`. Umsetzung: `src/export/exportMask.ts`
  (deterministischer Baum-Durchlauf → verschachtelte Custom Elements;
  Breite via DERSELBEN flowLayout-Logik wie der Canvas; ROOT_FLOW =
  gemeinsame Wurzel-Fluss-Werte; ASCII-Escaping HTML/JS; Tokens eingebettet,
  CSS-Kommentare gestrippt), `src/export/validator.ts` (Marker/LF/ASCII/
  Blockstruktur — läuft VOR jeder Dateiausgabe, bei Rot keine Datei),
  `src/export/generated/ff-runtime.js` (eingechecktes IIFE-Bündel der
  Block-Web-Components aus `npm run build:runtime` — EINE Render-Quelle;
  Test wacht gegen Veralten). Editor-Canvas zeigt jetzt `--se-bg` und
  Container-Hilfen ohne Padding → Editor und Export nachweislich
  deckungsgleich (Screenshot-Vergleich). 9 Export-Tests.
  Abnahme erfolgt: Maske läuft in SoftEngine ohne Nachbesserung (die
  Platzhalter-Kommentare `JWHtmlLadeDatei`/`SeHtmlFrameworkV2_Files`
  waren NICHT nötig).
  **Export-Grundsätze (entschieden 2026-07-02):** (a) Export = HTML **+**
  SEvariablen-JSON, beide aus DERSELBEN Quelle (Baum + Datenquellen-Modell)
  erzeugt — nie getrennt gepflegt, können nicht auseinanderlaufen. (b) Jeder
  Export wird maschinell gegen die SE-Regeln geprüft (eingebauter Validator
  nach Vorbild `behandlung-umbau/pruefung.mjs`), bevor er SoftEngine sieht.
  (c) Determinismus: gleicher Baum → identische Datei (diffbar).
- **Kap. 4 — Basis-Blöcke portieren** `[mechanisch pro Block, Muster kritisch]`:
  FormField, Bild, Infobox … — je Block: erst Bedienersicht-Durchspiel, dann
  Funktionsliste aus dem alten Editor ziehen, Nutzer streicht/behält.
  - ✅ **Infobox (2026-07-03) — Portier-Muster etabliert:** Anzeige-Block
    `ff-infobox` (`src/blocks/infobox/InfoBoxBlock.ts`) mit 4 Status-Arten
    (Hinweis/Erfolg/Warnung/Fehler → feste Statusfarben, getönte Fläche +
    farbiger linker Balken, nur `--se-*`-Tokens). Bediener wählt die BEDEUTUNG
    (Anzeigename), nie die Farbe (Technikwert `info/success/warning/danger`).
    Titel/Nachricht per Inline-Edit; „Art" als erstes reales
    `customProperties`-Select im Inspector. **Muster für Folge-Blöcke:** neue
    Lit-Klasse nach Vorbild Button/Container → Import in `register.ts` →
    `npm run build:runtime` → Veralten-Wächter + echter Export-Test. Palette/
    Inspector/Export nehmen den Block automatisch aus der Registry (kein
    `if type===`). Real im Browser verifiziert (4 Varianten, Umschalten,
    Inline-Edit, Persistenz, Export = gültige SE-Maske); 30 Tests grün;
    adversariale 4-Perspektiven-Review bestanden. ~~Offener Design-Punkt:
    „Erfolg" nutzt die grüne Hausfarbe~~ → GELÖST in 4K.1 (2026-07-06):
    eigenes Status-Grün `--se-green`/`--se-green-soft`, Infobox umgestellt.
  - ⏸ **FormField + Bild ZURÜCKGESTELLT (2026-07-03):** fürs Zwischenziel
    Kanban-Dashboard nicht nötig → jetzt Teil von Kap. 6. Funktionsliste
    FormField aus dem alten Editor liegt schon vor (nicht neu sichten):
    Typen Text/Zahl/E-Mail/Passwort/Textarea/Select/Checkbox/Datum;
    Platzhalter, Pflichtfeld, readOnly; Select-Optionen statisch ODER aus
    Datenquelle (`selectOptionsSource`/`selectOptionsField`); Feld-Bindung
    über `field`-Prop; Labels erzeugt SoftEngine SELBST (kein Label-Prop).
    Quellen: `src/components/blocks/FormFieldBlock.tsx`,
    `src/render/renderFormField.ts` im alten Editor.
- ⌖ **ZWISCHENZIEL (entschieden 2026-07-03): ein Kanban-Dashboard.** Es werden
  NUR die dafür nötigen Bausteine gebaut — streng atomar, jeder Schritt nach
  Zielbild-Regel. Schon vorhanden: Bereich, Text, Button, Infobox.
- **Kap. 4K — Kanban-Bausteine (atomar, in dieser Reihenfolge):**
  - ✅ **4K.1 Design-Zielbild Kanban (ABGENOMMEN 2026-07-06, Nutzer per
    Screenshot):** `dashboard/stilprobe.html` um die verbindliche
    Kanban-Sektion erweitert (Board → 3 Spalten mit Status-Oberlinie →
    Karten Titel/Textzeile/Chip → „+ Karte"/„+ Spalte"/Leer-Drop-Zone) —
    reines HTML/CSS, AUSSCHLIESSLICH `var(--se-*)`; die echte
    `masken-tokens.css` ist per `<link>` eingebunden, Mockup und Blöcke
    können nicht auseinanderlaufen. Tokens ergänzt: `--se-green`/
    `--se-green-soft` (eigenes Status-Grün ≠ Hausfarbe) + `--se-card-bg`/
    `--se-card-line`; Infobox „Erfolg" auf `--se-green` umgestellt
    (build:runtime neu). Dieses Mockup ist das VERBINDLICHE Zielbild für
    4K.2–4K.4.
  - ✅ **4K.2 Atom: Status-Chip (`ff-badge`) (2026-07-06):** Anzeige-Block
    `ff-badge` (`src/blocks/badge/BadgeBlock.ts`) nach Portier-Muster Infobox —
    kleines Etikett mit fester Status-BEDEUTUNG (Technikwert
    `info/success/warning/danger`; Bediener wählt Klarnamen Hinweis/Erfolg/
    Warnung/Fehler über „Art"-Select, nie die Farbe). Text per Inline-Edit,
    `resizableWidth=false` (Chip so breit wie sein Text, wie Button); Aussehen
    exakt nach Zielbild 4K.1 (`.zb-chip`), nur `var(--se-*)` (neuer Token
    `--se-fs-xs: 10.5px` für die Chip-Schrift). Palette/Inspector/Export nehmen
    ihn automatisch aus der Registry. Real im Browser verifiziert (4 Arten,
    Klick-Einfügen mit Default, Inline-Edit persistiert); 34 Tests grün
    (Veralten-Wächter + echter Export-Test `badge.export.test.ts`). DRY-Notiz:
    die 4 Status-Optionen sind identisch mit Infobox — bewusst noch NICHT
    extrahiert (verfrüht, würde die fertige Infobox anfassen); sauber ziehen wenn
    Kanban-Spalte/Karte (4K.3/4K.4) ein echter dritter Nutzer wird.
  - ✅ **4K.3 Molekül: Karte (`ff-card`) (2026-07-06):** Anzeige-Block
    `src/blocks/card/CardBlock.ts` nach Portier-Muster — Titel + Textzeile +
    Status-Chip exakt nach Zielbild 4K.1 (`.zb-card`), alle DREI Texte per
    Inline-Edit (Titel/Textzeile/Chip-Text), Chip-Art als einziges
    Inspector-Select; Karten sind normale Blöcke im Baum, keine
    Drag-Sonderlogik. DRY-Schuld aus 4K.2 eingelöst (Karte = dritter Nutzer):
    neues `src/blocks/shared/statusVariant.ts` bündelt StatusVariant-Typ,
    „Art"-Select-Factory und Chip-CSS — Infobox + Badge darauf umgestellt,
    Chip von Badge und Karte haben EINE CSS-Quelle. Bewusst KEIN
    eingebettetes `<ff-badge>` in der Karte: dessen Inline-Edit-Event würde
    an der Schattengrenze zur Karte umadressiert und die falsche Prop
    beschreiben. Browser-verifiziert (Einfügen mit Beispieldaten, 3×
    Inline-Edit, Art-Umschalten, Reload-Persistenz, Export; WYSIWYG-
    Screenshots Editor = Export); 38 Tests grün (`card.export.test.ts` neu,
    Veralten-Wächter um `ff-card` verschärft).
  - ✅ **4K.4 Organismus: Kanban (`ff-kanban` + `ff-kanban-spalte`)
    (2026-07-06)** `[kritisch]`: Spalte = spezialisierter Container
    (`src/blocks/kanban/`, Kopf: Titel per Doppelklick + Kartenzähler via
    slotchange; Rumpf nimmt NUR Karten; farbige Oberlinie über „Art" aus dem
    geteilten Status-Vokabular), Board = Zeile aus Spalten. Karten/Spalten
    ziehen läuft über die VORHANDENE Canvas-Drag-Logik (1 Undo pro Zug).
    Die kritischen Konzepte liegen im Kern/Registry, kein `if type===` in
    der UI: **allowedChildTypes** (Spalte nur Karten, Board nur Spalten —
    durchgesetzt in Store addBlock/moveNode UND Drag-Vorschau; Palette-Drags
    tragen den Typ dafür im MIME-Namen, da dragover keine Daten lesen darf),
    **defaultChildren** (Beispieldaten-Teilbaum: 3 Spalten Offen/In Arbeit/
    Fertig mit den Zielbild-Karten, 1 Undo), **childDirection** (festes
    row-Layout ohne Richtung-Regler), **showInPalette=false** (Spalte
    entsteht nur über „+ Spalte"), **containerHint=false** + generische
    Editor-Hilfen im BlockHost: **addChildButton** („+ Karte"/„+ Spalte",
    Registry-getrieben, data-ff-editor-helper) und **Kreuzchen** am
    selektierten Block (Rückfrage nur wenn belegt — gilt jetzt für ALLE
    Blöcke, Bedienlogik 5). Palette-Klick sucht das Einfügeziel aufwärts
    (Karte gewählt → neue Karte in dieselbe Spalte). WYSIWYG-Fix: BlockHost-
    Wrapper immer display:block (inline-block saß in streckenden Containern
    schmaler als der Export). Browser-verifiziert (6 neue Playwright-Fälle:
    Einfügen, Karte ziehen + 1 Undo, Titel-Edit, Plus-Knöpfe, verbotener/
    erlaubter Palette-Drop, Kreuzchen; Screenshots Editor = Export);
    50 Unit-Tests grün (Store-Guards, defaultChildren, kanban.export,
    Veralten-Wächter verschärft). Bewusste Grenze: die Wurzel beschränkt
    Kind-Typen nicht (eine Spalte LIESSE sich auf die Fläche ziehen) —
    Gegenrichtung „erlaubte Eltern-Typen" erst bauen, wenn ein zweiter
    Fall sie braucht.
- **Kap. 5 — Daten-Anbindung** `[kritisch]`: Datenquelle an Block hängen,
  Feld-Wörterbuch (Startbestand: `FELD`-Map aus der EmpfangPraxis-Maske des
  Nutzers), Klick-auf-Stelle-Binding, Beispieldaten-Vorschau. Regel
  Technikwert ≠ Anzeigename gilt überall. **Datenquellen sind eigenständige,
  benannte VORLAGEN** (z. B. „Terminplaner", „Adressstamm"): einmal definiert,
  in jeder Maske wiederverwendbar, Bibliothek neben der Baustein-Bibliothek;
  aus ihnen wird die SEvariablen-JSON des Exports erzeugt. Kein JSON-Editieren
  von Hand. **Erster Anwendungsfall = das Kanban aus 4K:** Spalten aus
  Statusfeld, Karte ziehen = Wert zurückschreiben → damit ist das
  Zwischenziel Kanban-Dashboard erreicht.
  - ✅ **5.1 Datenquellen-Vorlagen + Anhängen an Block (2026-07-07):**
    Modell `src/core/data/dataSources.ts` (Vorlage = id/Anzeigename/IDB-ID/
    Feld-Wörterbuch; Startbestand Terminplaner `IDBID0005` + Kundenhaustiere
    `IDBID0009` aus den FELD-Maps der Repo-Masken in `dashboard/` — die
    EmpfangPraxis-Map liegt nicht im Repo, wird ergänzt sobald geliefert;
    TODO_-Platzhalter bewusst nicht übernommen). Registry-Flag
    `acceptsDataSource` nach 4K.4-Muster (Kanban trägt `source`-Prop =
    Technikwert der Vorlage, defaultProp → überlebt Persistenz), Inspector-
    Sektion „Daten" (Select mit Anzeigenamen), Datenquellen-Bibliothek als
    zweites Sidebar-Panel (read-only Liste; Anlegen/Bearbeiten später).
    Export erzeugt SEFILELOOP aus dem Baum (DIESELBE Quelle wie das HTML,
    Baum-Reihenfolge, dedupliziert, \uXXXX-ASCII-escaped); `source` reist
    als Attribut mit (Runtime braucht es ab 5.3). Regel Klarname ≠ Feldcode
    maschinell erzwungen (`dataSources.test.ts`). Bestehende Exakt-Assertion
    in `kanban.export.test.ts` an die neue Ausgabe angepasst
    (`<ff-kanban source="" …>`) — nicht abgeschwächt, plus neue Tests
    (`sevariablen.export.test.ts`). 63 Unit-Tests + 8 E2E grün; browser-
    verifiziert (Anhängen, Reload-Persistenz, Export-JSON, Lösen).
  - **5.2 Klick-auf-Stelle-Binding + Beispieldaten-Vorschau** (Feldliste mit
    Klarnamen aus dem Wörterbuch, Stelle zeigt Beispielwert + Markierung).
  - **5.3 Kanban-Datenverhalten im Export** (Spalten aus Statusfeld, Karten
    aus Zeilen, Karte ziehen = Wert zurückschreiben → Zwischenziel erreicht).
- **Kap. 6 — weitere Blöcke** `[Muster kritisch, Ausbau mechanisch]`:
  FormField + Bild (zurückgestellt aus Kap. 4), DataTable (Spalte anklicken →
  Feld, Breite ziehen), DetailCard, Wizard (Schritte als Reiter,
  Plus/Ziehen/Kreuzchen) — alle streng atomar nach Zielbild-Regel.
- **Kap. 7 — Verknüpfungen** zwischen Blöcken (Auswahl/Filter, z.B. Kanban →
  DetailCard).
- **Kap. 8 — Events/Aktionen** `[kritisch]`: Klick→Popup, Drop→Relation,
  START_TOOL usw. — Verhaltensreferenz: `runtime/actions.ts` im alten Editor.
- **Kap. 9 — Umschalten:** alten Editor abloesen.

## Design (zwei Token-Welten — nie mischen)

1. **Editor-UI** (Sidebar/Inspector/Toolbar): shadcn-Variablen in `index.css`.
   Hell, klare Kontraste, Figma/Linear-Vibe. Fertig (Kap. 1).
2. **Masken-Design** (die Blöcke = das, was exportiert wird):
   `src/design/masken-tokens.css` (`--se-*`). Entschieden am 2026-07-02 mit
   dem Nutzer: **kantig + funktional** („Werkhalle"-Dichte), **Grün** als
   Hausfarbe, Statusfarben mit fester Bedeutung (Bediener wählt Bedeutung,
   nie Farbe). Ausdrücklich KEINE weichen KI-Standard-Rundungen. Referenzbild:
   `dashboard/stilprobe.html`. Blöcke benutzen ausschließlich `var(--se-…)` —
   keine Hex/HSL-Literale im Block-CSS, keine var()-Fallbacks (Token-Datei ist
   Pflichtteil jedes Exports).

## Stack

React 19, TypeScript, Vite, **Lit** (Web Components = die Blöcke), Tailwind +
shadcn-Stil (Editor-UI), eigener Store mit Observer-Pattern.

## Wichtige Stellen

- Architektur + Regeln: `ARCHITEKTUR.md`
- Store: `src/state/Editor.ts` (Observer: `src/state/Subject.ts`)
- Block-Basisklasse: `src/core/blocks/BasicBlock.ts` · Blöcke: `src/blocks/`
- Masken-Design-Tokens: `src/design/masken-tokens.css` · Referenz:
  `dashboard/stilprobe.html`
- Brücke React ↔ Web Component: `src/editor/canvas/BlockHost.tsx`
- SoftEngine-Export-Spec: Repo `behandlung-umbau` → `SE-INVENTAR.md`
- Verifizieren: `npx tsc -b` + `npx eslint src` + `npm test`
