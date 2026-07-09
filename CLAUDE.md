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
  - ✅ **5.2 Klick-auf-Stelle-Binding + Beispieldaten-Vorschau (2026-07-07):**
    Registry-Konzept **bindableSpots** (Stelle = Anzeige-Prop + Klarname;
    Bindung = Feldcode in `<prop>Field`, Default '' in defaultProps →
    überlebt Persistenz, reist im Export als Attribut — Karte deklariert
    Titel/Textzeile/Chip). Klick auf die Stelle des selektierten Blocks
    (Quelle in Reichweite via `Editor.dataSourceFor`: der NÄCHSTE
    acceptsDataSource-Vorfahr) öffnet den Feld-Picker (Klarname +
    Beispielwert, nie Feldcodes; „— nicht gebunden —" löst). Gebundene
    Stelle zeigt sofort den Beispielwert (neues `sample` je Feld im
    Wörterbuch, Werte aus den Demo-Daten der Repo-Referenzmaske) + grün
    gepunktete Daten-Markierung — beides NUR im Editor (Host-Attribut
    `data-ff-editor`, Muster data-editable; Export nachweislich ohne
    Markierung, Substitution nur auf DOM-Properties, Baum unberührt).
    Doppelklick: ungebunden = Inline-Edit wie bisher, gebunden = Picker.
    Beifang-Fix: Inline-Edit-Verwerfen (Escape) zerstörte Lits Render-Marker
    (`textContent=`-Zuweisung) — Stelle bekam danach nie wieder Updates;
    jetzt Originalknoten sichern/zurücksetzen. 69 Unit-Tests + 12 E2E grün
    (4 neue Binding-Fälle inkl. Reload/Lösen/Doppelklick); browser-
    verifiziert mit Screenshots (Picker, gebundene Karte, Export-Maske).
  - ✅ **5.3a Kanban-Datenverhalten im Export — Lesen (2026-07-07):**
    Board bekommt „Spalten aus Feld" (neues PropertyDescription-Konzept
    `kind: 'field'`: Klarnamen sichtbar, Feldcode als Technikwert in
    `statusField`), Spalte bekommt „Datenwert dieser Spalte" (`statusValue`;
    neues Flag `requiresDataSource` — Daten-Controls erscheinen in der
    Inspector-Sektion „Daten" und nur mit Quelle in Reichweite). In der
    exportierten Maske (`src/blocks/kanban/seRuntime.ts`, Teil des
    Runtime-Bündels): SEDATA lesen nach Funktionsliste der Referenzmaske
    (SEFileLoop/Tabellen, Feldcode direkt oder pos_len aus dem SATZ), jede
    Zeile wird eine Karte (Vorlage = erste gestaltete Karte; gebundene
    Stellen aus 5.2 zeigen Zeilenwerte, ungebundene den statischen Text),
    exakter Wertevergleich (getrimmt, Groß/klein egal) bestimmt die Spalte,
    kein Treffer → erste Spalte (Auffang); Erstellen/initData/ReloadData +
    SEDATA-Poll wie die Referenzmaske. Läuft NUR im Export
    (data-ff-editor-Wächter, Editor hydriert nie); ohne Spalten-Feld bleibt
    der Export statisch wie bisher. 80 Unit-Tests + 14 E2E grün (neu:
    seRuntime.test.ts für die puren Helfer, kanban-data.spec.ts lädt die
    exportierte Maske mit gestelltem SEDATA; Kanban-Export-Assertions
    erweitert); browser-verifiziert mit Screenshots (Editor-Bedienung +
    hydrierte Maske: 4 Zeilen → 4 Karten nach Zimmer verteilt).
  - ⚑ **Feld-Wörterbuch korrigiert (2026-07-07):** Startbestand jetzt aus
    der VERBINDLICHEN Quelle `behandlung-umbau/behandlung/
    index.basis.source.html` (`var FELD`, live getestet; SE-INVENTAR §6/§11:
    pos_len-Codes sind echte SE-Kontrakte). Terminplaner = **IDBID0001**
    (nicht 0005!), Kundenhaustiere = **IDBID0004** (nicht 0009); Codes
    korrigiert (behandlung 118_60, uhrzeit 178_5, datum 183_10, vorname
    193_30, nachname 223_30, zimmer 253_30; neu Priorität 319_12,
    Belegnummer 331_12). Neues Modell-Feld `indexField` je Quelle
    (Terminplaner '0_10' = Satznummer/pindex, braucht der Schreibweg 5.3b).
    Die Dashboard-Prototypen in `dashboard/` sind für Feldcodes KEINE
    Referenz mehr. Beide Original-Repos lassen sich per add_repo an eine
    Session hängen: `Maycetin1205/behandlung-umbau` (SE-Spec) und
    `Maycetin1205/react--app` (alter Editor).
  - ✅ **5.3b Karte ziehen = Wert zurückschreiben (2026-07-08)** `[kritisch]`
    (→ **ZWISCHENZIEL Kanban-Dashboard ERREICHT**). Umsetzung: neues
    `src/core/data/relations.ts` — Relation-VORLAGEN als Daten (Vorgriff
    auf 5.5): Verb/NR/Params-Syntax mit Platzhaltern `{FELD_POS}/{FELD_LEN}/
    {PINDEX}/{RELID}/{VALUE}`, Standard-PUT (NR 174) mitgeliefert, pure
    Helfer `relIdFromIdbId` (IDB-Präfix ab) / `splitFieldCode` /
    `resolveParams`. In `seRuntime.ts`: purer Helfer `setField` (direkte
    Property + pos_len-Patch im SATZ-Rohstring, exakte Feldlänge), Karten
    mit Satznummer (indexField der Quelle) sind im Export ziehbar
    (HTML5-Drag, verdrahtet in connectBoard — Editor-Boards melden sich
    nie an, Canvas-Drag unberührt); Drop auf Spalte mit Datenwert →
    Bridge-Wächter `basisHTML_SND_MSG` → PUT über die Vorlage, Zeile per
    setField aktualisiert, Board neu hydriert; gleicher Wert / leerer
    statusValue / fehlende Satznummer = kein Schreiben. 94 Unit-Tests +
    15 E2E grün (relations.test.ts, setField-Fälle, kanban-data:
    Drag-Fall mit exakter PARAMS-Assertion
    `['253','30','L','7','ID0001','3']` + No-Op-Drops); Screenshots
    vor/nach Zug abgegeben. ✅ PARAMS-Typen VERIFIZIERT (2026-07-08,
    Folgesession mit behandlung-umbau-Zugriff): `sePut` in
    `index.basis.source.html` Z. 878 baut die PARAMS als
    `[pl[0], pl[1], vart, String(pindex), idbidRel, String(wert)]` —
    alle sechs Strings, exakt wie unsere Standard-Vorlage. Keine
    Korrektur nötig; erster SoftEngine-Test bleibt übliche Abnahme.
    Ursprüngliche Spec (bleibt der Kontrakt): ENTBLOCKT 2026-07-07 — Schreib-Spec liegt
    vor, verifiziert aus `behandlung-umbau` (Block "SE-ADAPTER 4/4",
    `sePut`/`seSend`) + SE-INVENTAR §5 + altem Editor
    (`src/runtime/renderKanban.ts` Drop-Handler, `actions.ts`):
    (a) Schreiben = `basisHTML_SND_MSG('PUT_RELATION', { NR: '174',
    PARAMS: [pos, len, 'L', pindex, relId, wert] })` — pos/len aus dem
    Feldcode gesplittet, pindex = Satznummer der Zeile (Feld `indexField`
    der Quelle, Terminplaner '0_10'), Bridge-Wächter
    `typeof basisHTML_SND_MSG === 'function'`. ⚠ **relId ≠ SEFILELOOP-ID:
    der PUT nutzt die Relations-ID OHNE 'IDB'-Präfix — 'ID0001', nicht
    'IDBID0001'!** Beweis: behandlung-umbau index.basis.source.html
    Z. 1645/1663 (`sePut('ID0001', pidx, [[FELD.TP.zimmer, ziel]])` —
    wortwörtlich unser Anwendungsfall Zimmer-Umschreiben); SEvariablen
    derselben Maske sagen IDBID0001. Ableitung `idbId.replace(/^IDB/, '')`
    als purer, getesteter Helfer. (b) Karten-Drag im Export:
    HTML5-Drag auf Daten-Karten, Drop auf Spalte → Wert der Zielspalte
    (statusValue) ins Spalten-Feld schreiben, Zeile im Speicher
    aktualisieren, neu hydrieren (Muster: alter Editor macht exakt das).
    NUR im Export (seRuntime); der Editor behält seine Canvas-Drag-Logik.
    (c) Achtung bei GET-Antworten (z. B. neue Satznummer NR '640'): kommen
    ununterscheidbar über `SEDATA.MessageN` → Warteschlange, immer nur
    eine Abfrage in Flug (Muster `seGetNewIndex`); für reines
    Status-Schreiben nicht nötig (PUT ist fire-and-forget).
    (d) **Architektur-Regel (Nutzer-Klarstellung 2026-07-07): NR '174'
    NICHT festverdrahten.** Es gibt >1000 GET/PUT-Relations, je
    Installation individuell — der Schreibweg wird als DATEN gebaut
    (Relation-Vorlage, siehe 5.5), nicht als Code. Der Standard-PUT
    (NR 174, Param-Layout aus (a)) ist nur die MITGELIEFERTE Vorlage,
    die das Kanban standardmäßig benutzt.
  - ✅ **5.4 Datenquellen-Editor (KOMPLETT 2026-07-08)** `[kritisch]`
    (Nutzer-Anforderung 2026-07-07): Felder sind je
    SoftEngine-Installation INDIVIDUELL (nur
    wenige Stammfelder wie Adressstamm sind überall gleich) → der Bediener
    muss Datenquellen + Felder SELBST anlegen/bearbeiten können: Klarname
    + Feldposition + Feldlänge eingeben (der Feldcode `pos_len` entsteht
    daraus unsichtbar), IDB-ID der Tabelle, Beispielwert optional. Die
    Datenquellen-Bibliothek (Sidebar) bekommt Anlegen/Bearbeiten/Löschen;
    Vorlagen persistieren (localStorage neben den Bäumen). Der Export
    erzeugt die SEFILELOOP aus GENAU diesen Definitionen — die
    FELDER-Liste muss zur Maske passen (IDB-Tabellen: '*' ist zulässig;
    Stammtabellen wie ADR/ART brauchen die explizite pos_len-Liste, siehe
    SEvariablen der behandlung-umbau-Masken). Startbestand
    (Terminplaner/Kundenhaustiere) bleibt als mitgelieferte Vorlage.
    **Quellen-ARTEN (Nutzer-Klarstellung 2026-07-07):** Es gibt nicht nur
    IDB-Tabellen — auch Belege, Adressstamm, Artikelstamm (+ später
    MEMTAB/ERPAPICALL). Jede Quelle trägt eine `kind`; die Art bestimmt
    die SEvariablen-Form (IDB → SEFILELOOP mit '*', Stammtabellen →
    explizite FELDER-Liste, ERPAPICALL → eigener JSON-Abschnitt, siehe
    behandlung-umbau). Modell-Referenz: alter Editor
    `src/types/index.ts` (DataSourceEntry-Varianten idb/beleg/
    adressstamm/memtab, `freiselekt` bei Stammquellen).
    - ✅ **5.4a Fundament: Modell + Store + Export (2026-07-08):**
      Datenquellen sind jetzt gelebte Nutzerdaten statt Konstanten. Modell
      (`dataSources.ts`): `kind` (idb/adressstamm/artikelstamm/beleg), pure
      Helfer `tableIdFor` (IDB-ID bzw. feste ADR/ART/BEL) + `felderFor`
      ('*' bzw. explizite pos_len-Liste — Formen belegt aus den echten
      behandlung-umbau-SEvariablen) + `sanitizeDataSources` (struktureller
      Lader nach sanitizeTree-Muster). Neuer `DataSourceStore`
      (`src/state/`, Subject + localStorage `aufbau_editor_datenquellen_v1`
      + entprelltes Speichern wie Editor.ts; Hook `useDataSources`): Seed =
      BUILTIN_DATA_SOURCES nur beim allerersten Start, danach gehören die
      Vorlagen dem Bediener (Löschen überlebt Reload, kaputtes JSON → Seed);
      add vergibt frische ids, update hält die id stabil (angehängte Blöcke
      behalten ihre Quelle), KEIN Undo (Bibliothek ≠ Canvas-Geste, UI fragt
      nach). Konsumenten (Editor.dataSourceFor, DataSection, Inspector,
      DataSourceList, BlockHost) lesen aus dem Store. **Export-Architektur:
      die Quellen-Definitionen REISEN in der Maske** (`var FF_DATA_SOURCES`
      mit id/name/tableId/indexField, aus DERSELBEN collectDataSources-
      Quelle wie die SEFILELOOP — Grundsatz a): seRuntime löste bisher über
      das STATISCHE Wörterbuch im Bündel auf, mit Nutzer-Quellen bräche das;
      jetzt `findRuntimeDataSource` übers Global (Bündel enthält nachweislich
      kein Wörterbuch mehr). exportMask nimmt die Bibliothek als Parameter
      (Default = Store; Tests stellen feste Listen). SEFILELOOP-Form je Art.
      112 Unit-Tests + 15 E2E grün (DataSourceStore.test, sanitize-Fälle,
      findRuntimeDataSource, Stamm-FELDER, FF_DATA_SOURCES-Einbettung inkl.
      ASCII-Escape); browser-verifiziert mit Screenshots (Editor-Bedienung,
      Export mit Einbettung, hydrierte Maske 4 Zeilen → 2/1/1).
    - ✅ **5.4b Formular-UI: Anlegen/Bearbeiten/Löschen (2026-07-08):**
      Bibliothek (Sidebar) mit „+ Neue Datenquelle", Stift + Kreuzchen je
      Eintrag (Rückfrage; deutliche Warnung wenn in der Maske benutzt —
      Registry-Scan über acceptsDataSource, Block bleibt stehen, Bindung
      ruht). Formular als neues Modal-Molekül (`ui/molecules/modal.tsx`,
      handgebaut nach FieldPicker-Muster, keine neue Abhängigkeit):
      Anzeigename, „Art"-Select mit Klarnamen (IDB-Tabelle/Adressstamm/
      Artikelstamm/Beleg), bei IDB Tabellennummer (Eingabe „9" →
      `IDBID0009` entsteht unsichtbar; pure Helfer `idbIdFromNumber`/
      `numberFromIdbId`/`fieldCode` in dataSources.ts, getestet),
      Satznummer Position/Länge (bei Neu-IDB vorbelegt 0/10; leer = nur
      lesen), Felder-Zeilen Klarname+Position+Länge+Beispielwert mit
      „+ Feld"/Kreuzchen. Validierung erst beim Speichern (Klarname nie
      leer/nie Feldcode, Zahlen-Pflicht, Duplikat-Codes); Bestandsfelder
      mit Nicht-pos_len-Code behalten ihren Technikwert, solange
      Position/Länge leer bleiben. Bearbeiten hält die id stabil →
      angehängte Blöcke behalten ihre Quelle. 115 Unit-Tests + 19 E2E grün
      (neu `e2e/datenquellen.spec.ts`: Anlegen→Binden→Export→Reload,
      Validierung, Umbenennen mit stabiler id, Löschen mit/ohne
      Benutzt-Warnung); browser-verifiziert mit Screenshots (Formular,
      Feld-Picker mit eigenen Feldern samt Beispielwert).
  - ✅ **5.5 Relation-Vorlagen-Bibliothek (KOMPLETT 2026-07-08)** `[kritisch]`
    (Nutzer-Anforderung 2026-07-07): GET/PUT-Relations sind wie Datenquellen
    BENUTZERDEFINIERTE VORLAGEN. Umsetzung nach 5.4-Muster:
    - **Modell** (`core/data/relations.ts`, aus 5.3b ausgebaut): Vorlage =
      id/name/verb (GET/PUT/PUTADD_RELATION)/nr/params. Das PLATZHALTER-
      Vokabular ist EINE Konstante `RELATION_PLACEHOLDERS`
      (`{FELD_POS}/{FELD_LEN}/{PINDEX}/{SELKEY}/{DROP_PINDEX}/{RELID}/{VALUE}/
      {NOW_DATE}`) — Quelle für Formular-Hilfe, Validierung
      (`unknownPlaceholders` fängt Tippfehler) und Laufzeit. `resolveParams`
      wie gehabt; `sanitizeRelationTemplates` (Muster sanitizeDataSources)
      verwirft Vorlagen mit kaputten params KOMPLETT (Stelligkeit!). Der
      Standard-PUT (NR 174, PARAMS 2026-07-08 gegen echtes sePut verifiziert)
      ist jetzt nur noch der SEED `BUILTIN_RELATION_TEMPLATES`.
    - **Store + Hook** (`state/RelationStore.ts` + `useRelations.ts`): exakt
      DataSourceStore-Muster (Subject + localStorage
      `aufbau_editor_relationen_v1` + entprelltes Speichern; Seed nur beim
      allerersten Start, danach gehören die Vorlagen dem Bediener; add=frische
      id, update=id stabil; kein Undo).
    - **Konsum statt Protokoll:** Board trägt neue Prop `putRelation`
      (Default 'standard-put'), Inspector-Sektion „Daten" bekommt das Control
      „Schreiben über" (neuer PropertyKind `relation`: Anzeigenamen sichtbar,
      Vorlagen-id gespeichert, nur mit Quelle in Reichweite). Der Export
      bettet die BENUTZTEN Vorlagen als `var FF_RELATIONS` ein (registry-
      getrieben über kind-'relation'-Props, dedupliziert, DIESELBE Quelle wie
      HTML — Grundsatz a; nur Technikwerte). `seRuntime` löst den Schreibweg
      über FF_RELATIONS auf (`findRuntimeRelation`), NR 174 nicht mehr
      festverdrahtet (CLAUDE.md 5.3b (d) erfüllt). WYSIWYG-Schärfung: ohne
      auflösbare Vorlage ist das Board read-only — Drop bewegt NICHTS (ein
      rein lokaler Zug verschwände beim nächsten ReloadData = Täuschung).
    - **Bibliothek** (`sidebar/RelationList.tsx` + `RelationForm.tsx`): dritte
      Sidebar-Bibliothek „Relationen" neben Datenquellen; Anlegen/Bearbeiten/
      Löschen (Rückfrage; Benutzt-Warnung per Registry-Scan, kein
      `if type===`). Formular im Modal-Molekül: Anzeigename, Verb-Select mit
      Klarnamen (Lesen/Schreiben/Anhängen + Kürzel), NR, Parameter-Zeilen mit
      Platzhalter-Hinweis; Validierung erst beim Speichern.
    136 Unit-Tests (`RelationStore.test`, relations-Lader/Platzhalter,
    findRuntimeRelation, FF_RELATIONS-Einbettung; kanban.export-Assertion an
    das neue `putrelation`-Attribut angepasst — nicht abgeschwächt) + 24 E2E
    (neu `e2e/relationen.spec.ts`: Anlegen→Wählen→Export→Drag mit EIGENER NR,
    read-only ohne Vorlage, Validierung, Umbenennen mit stabiler id, Löschen
    mit Benutzt-Warnung) grün; browser-verifiziert mit Screenshots (Formular
    mit Platzhalter-Hinweis, Inspector „Schreiben über", dritte Bibliothek).
    Verhaltensreferenz alter Editor war: `RelationForm.tsx`, `types/index.ts`
    (relNo/kind/syntax), `runtime/actions.ts` (pindexMode fixed/selected/drop
    — als {PINDEX}/{SELKEY}/{DROP_PINDEX} abgebildet).
    **→ Kap. 5 (Daten-Anbindung) damit KOMPLETT.**
- ⚑ **STABILISIERUNG — Architektur- & Bedienkorrektur (vor Kap. 6)**
  `[kritisch]` (beschlossen 2026-07-09): Vor DataTable/Wizard/weiteren
  Blöcken kommt eine Korrektur — sonst wächst ein zweiter, nur ordentlicher
  beschrifteter Spaghetti-Editor. Auslöser: eine unabhängige Zweit-Review
  (Fable-5-Diagnose) + Nutzer-Entscheidungen; jede Behauptung wurde am Code
  **verifiziert** (Datei:Zeile unten). **Das Fundament bleibt** (Flow-/
  Container-Baum, React+Lit, Registry statt `if type===`, deterministischer
  gemeinsamer HTML/JSON-Export, Tokens, Tests, flache Vererbung) — nur die
  Architektur-/Bedienfehler werden behoben, nichts ersetzt.
  Reihenfolge (jeder Punkt atomar KOMPLETT — Plan + „go" + Design-Bild bei
  Optik + Tests + Export geprüft + committet — bevor der nächste beginnt):
  - **S1 Export-Preflight hart** `[kritisch]`: Der Validator überspringt
    heute STILL kaputte Referenzen — Beleg: `exportMask.ts` `collectDataSources`
    (`if (src && …)`) und `collectRelations` (`if (rel && …)`, Kommentar
    „Unbekannte ids werden übersprungen"). Ein Block mit gelöschter Quelle
    exportiert stumm ohne Datenanbindung = tote Maske. Widerspricht dem
    Nordstern. Neu: Export **blockiert + erklärt verständlich** bei
    gelöschter/unbekannter Quelle ODER Relation, unvollständigen Technik-IDs,
    doppelten technischen Aliassen, Kanban mit Bindung aber ohne statusField/
    statusValue, quellenart-spezifischen Pflichtfeldern, kaputten
    Relation-Params/Feldcodes, referenzieller Integrität. JSON ebenfalls
    validieren; HTML+JSON als EIN zusammengehöriges Paket.
    - ✅ **S1a (2026-07-09): gelöschte/unbekannte Datenquelle blockiert den
      Export.** Neue reine Prüfung `src/export/preflight.ts`
      (`preflightMask(tree, sources)`: Block mit `acceptsDataSource` + nicht-
      leerer `source`, die nicht in der Bibliothek liegt → roter `CheckResult`;
      leer = ok). In `Toolbar.tsx` vor dem Download verdrahtet (dieselbe
      Bibliothek für Preflight + Export, kombiniert mit `validateMaskHtml`,
      bei Rot `alert` + Abbruch — bestehendes Muster). Muster: `validator.ts`
      (`CheckResult`/`failedChecks`); kein `if type===` (Registry-Flag).
      Der Test, der das Skip-Verhalten festschrieb
      (`sevariablen.export.test.ts`), wurde NICHT gelöscht, sondern zur
      strengeren Prüfung umgebaut (Preflight meldet den Fehler); Kommentar in
      `exportMask.ts` präzisiert (Skip = nur Fallback hinter der Preflight).
      144 Unit-Tests (neu `preflight.test.ts`) + 25 E2E grün (neuer Fall
      `datenquellen.spec.ts`: Quelle löschen → Export bricht mit Meldung ab,
      kein Download). **Offen: S1b–S1e.**
  - **S2 Anzeigename ↔ Technik-Alias trennen** `[kritisch]`: Heute ist der
    sichtbare Name = technischer SE-`ALIAS` (Beleg `exportMask.ts` `ALIAS:
    s.name`) — Umbenennen ändert den Datenvertrag, gleichnamige Quellen
    kollidieren. Verstoß gegen „Technikwert ≠ Anzeigename". Neu: DataSource
    trägt stabile interne id + frei änderbaren Anzeigenamen + technischen
    Alias + quellenart-spezifische Konfig; doppelte Aliase verhindert.
    (Der alte Editor trennte das bereits: `alias` vs. `name`/`label`.)
  - **S3 Kanban-Modell + Layout korrigieren** `[kritisch]`: Der zentrale
    Modellfehler — Editor-Knoten (Maskenaufbau), sichtbare Web-Component
    (Design) und SoftEngine-Laufzeitzeile werden vermischt; die Karte ist
    gleichzeitig Canvas-Baustein, Vorlage, Beispielkarte und Klonvorlage
    (darum lässt sie sich rausziehen, 6 Beispielkarten, aber nur die erste
    zählt im Export). Neu: das Board besitzt **eine** klar erkennbare
    Kartenvorlage und erzeugt daraus Laufzeitkarten; Karten existieren NUR
    in zulässigen Kanban-Spalten. Layout (Nutzer-Entscheidung 2026-07-09):
    Spalten verteilen sich fließend über die Breite mit Mindestbreite, und
    **UMBRECHEN in die nächste Zeile statt intern zu scrollen** (KEIN
    horizontaler Scroll). `flowLayout` bekommt dafür eine **opt-in**
    Mindestbreite für 'fill' (Default unverändert → kein anderer Block
    betroffen). Zielbild 4K.1 (`.zb-col flex:0 0 290px`) zuerst als Mockup
    revidieren + Nutzer-Abnahme. Bindung am gewählten Kanban geschlossen
    sichtbar: 1. Quelle 2. Spaltenfeld 3. Spaltenwerte 4. Kartenstellen→Felder
    5. Schreibrelation 6. sofort realistische Datenvorschau.
  - **S4 Datenquellen: Import + erweiterbare Arten** `[Muster kritisch]`
    (Nutzer-Entscheidungen 2026-07-09): (a) **IDB-Import** — der Bediener
    exportiert die Tabelle aus SoftEngine und importiert die Datei; ein
    reiner, testbarer Parser (kein Alt-Code kopiert, XXE-Strip beibehalten)
    zieht Felder mit Klarname + `pos_len` heraus und füllt das
    Datenquellen-Formular vor; der Bediener prüft + speichert → **neue
    Quelle** (nachträgliches „bestehende aktualisieren" optional). Format A
    (sauberer Export) zuerst, Format B (Fixbreiten-Dump) optional später;
    vor dem Bau eine echte SE-Datei ansehen statt zu raten. Verhaltens-
    Referenz alter Editor: `parseIdbXml.ts`, `DataCenter.tsx` (NUR Funktion).
    (b) **Quellen-Arten erweiterbar**: eine Beschreibung PRO Art an EINER
    Stelle (Muster Block-Registry, kein `if kind===`) — Anzeigename, nötige
    Formularfelder, tableId-Abbildung, FELDER-Abbildung, SEvariablen-Form.
    Neue Art = ein Eintrag. (c) optionales **freiselekt** (Filter, nur
    Beleg/Stamm) → Export `FREISELEKT`. **Zurückgestellt (nicht auf Verdacht):
    MEMTAB + ERPAPICALL** — ändern die SEvariablen-FORM; erst bauen, wenn
    gegen `behandlung-umbau` verifiziert (Repo per add_repo anhängen).
  - **S5 Relation-Syntax einfügen** `[Muster kritisch]` (Nutzer-Entscheidung
    2026-07-09): komplette SE-Syntax `(GET|PUT|PUTADD)_RELATION[NR!p1!p2!…]`
    einfügen → automatisch in Verb/NR/Params zerlegen, strukturierte
    Vorschau, danach Einzel-Params bearbeitbar; Einzel- + Batch-Import.
    Fremde `{Platzhalter}` NICHT ablehnen: verbatim übernehmen, der Bediener
    ordnet jede variable Stelle EINMAL ihrer Bedeutung zu (keine stille
    Auto-Übersetzung). Das strukturierte Modell darunter (`relations.ts`)
    bleibt. Referenz alter Editor: `parseRelationSyntax` (NUR Funktion).
  - **S6 `strict` TypeScript + typisiertes Block-Schema** `[kritisch]`:
    `tsconfig.app.json` hat kein `strict` (verifiziert) → grüner tsc ist
    weniger aussagekräftig als er aussieht. Eine Property wird an ~4 Stellen
    definiert (defaultProps, Lit-`@property`, Inspector-Beschreibung,
    Export-Attribut), Props sind fast überall `Record<string, unknown>` —
    man kann eine Stelle vergessen, tsc bleibt grün. Neu: `strict` an, EINE
    typisierte Property-Wahrheit (diskriminiertes Schema), typsichere
    Serialisierung + Events (kein freier String als Property-Name im Event).
    Fleißarbeit, eigener Schritt.
  - **Leitplanken:** Tests werden NIE gelöscht/abgeschwächt — die grünen
    Tests, die falsches Verhalten festschreiben (290px-Spalten; „gelöschte
    Quelle/Relation wird übersprungen"), bekommen ihre Spezifikation bewusst
    geändert und werden zu STRENGEREN Sicherheitsprüfungen umgebaut (Export
    MUSS bei kaputter Referenz scheitern). **Bewusst zurückgestellt** (Projekt-
    Disziplin „erst bauen, wenn ein zweiter Fall es erzwingt", nicht jetzt):
    Store-Injection/DI + mehrere Masken/Projekte, Render-Performance-
    Optimierung (jeder Notify rendert alles), vollständiger Composition-Umbau
    von `BasicBlock`, God-Component-Split von `BlockHost` (nur so weit, wie
    S1–S6 es brauchen). **→ Erst nach der Stabilisierung Kap. 6.**
- **Kap. 6 — weitere Blöcke** `[Muster kritisch, Ausbau mechanisch]`
  (GESPERRT bis STABILISIERUNG fertig):
  DataTable (Spalte anklicken → Feld, Breite ziehen), Wizard (Schritte als
  Reiter, Plus/Ziehen/Kreuzchen) — alle streng atomar nach Zielbild-Regel.
  **Zuschnitt-Entscheidung 2026-07-08 (mit Nutzer):** **Bild gestrichen**
  (ERP-Masken brauchen selten einen Bild-Block; bei Bedarf später).
  **DetailCard zurückgestellt** — sinnvoll erst mit FormField (Detailfelder
  sind FormFields) + der Verknüpfungs-Mechanik aus Kap. 7 (Kanban → DetailCard).
  - ✅ **6.1 FormField v1 — statischer Eingabe-Baustein (2026-07-08)**
    `[Muster kritisch]`: erster `eingabe`-Baustein. Design-Zielbild in
    `dashboard/stilprobe.html` (eigene `zb`-Sektion, nur `var(--se-*)`) nach
    4K.1-Muster VOR dem Bau abgenommen. Block `src/blocks/formfield/
    FormFieldBlock.ts` nach Portier-Muster (Infobox/Karte): rendert NUR das
    Steuerelement (die Beschriftung erzeugt SoftEngine selbst — kein
    Label-Prop), 8 Feldtypen (Text/Zahl/E-Mail/Passwort/Mehrzeilig/Auswahl/
    Checkbox/Datum; Technikwert `text/number/…`, Bediener wählt Klarnamen).
    Inspector: Feldtyp-Select, Platzhalter, Optionen (Auswahl, Komma-getrennt),
    Pflichtfeld + Nur-lesen als Ja/Nein-Select (bewusst kein neues
    Boolean-Control — DRY, echtes Toggle erst bei zweitem Fall). Aussehen
    exakt nach Zielbild, nur Tokens; Standardbreite 240px (Breite-Anfasser
    aktiv). Palette/Inspector/Export nehmen ihn automatisch aus der Registry
    (kein `if type===`). Browser-verifiziert mit Screenshots (5 Typen im
    Editor = im Export, WYSIWYG); 141 Unit-Tests grün (`formfield.export.test`
    inkl. Validator-Gate, Veralten-Wächter um `ff-formfield` verschärft).
    **Bewusst zurückgestellt (braucht den realen SE-Formularfeld-Kontrakt aus
    `behandlung-umbau`, NICHT auf Verdacht gebaut — /kritisch Regel 7):**
    Feld-Bindung (SoftEngine liest/schreibt über `field`-Prop) + Select-
    Optionen aus einer Datenquelle. Folgeschritt 6.2, sobald `behandlung-umbau`
    an die Session gehängt ist (wie bei 5.3b).
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
