# Umbau-Plan — Architektur-Konsolidierung

> **Diese Datei ist KI-generiert.** Analyse und Plan stammen von Claude
> (Modell claude-opus-5), erstellt am 2026-08-08 auf Grundlage des Codes im
> Stand `8c03dc5`. Nichts darin ist vom Nutzer geschrieben; nichts darin ist
> in SoftEngine oder im Browser erprobt. Es ist ein Vorschlag, kein Befund
> aus dem Betrieb.
>
> **Diese Datei ist temporär.** Sie wird gelöscht, wenn die Pakete gebaut
> sind — die Chronik steht dann in der git-Historie (CLAUDE.md, Doku-Schnitt
> 2026-07-30: keine `docs/`-Ablage neu erfinden). Bis dahin liegt sie hier,
> damit sie zitierbar ist und an Codex gegeben werden kann.

Anlass: Nutzer-Frage 2026-08-08 — „wo würdest Du sagen, das macht gerade gar
keinen Sinn, und was hätte man anders machen können?" Die Antwort war eine
Analyse des Ist-Zustands; dies ist der daraus abgeleitete Plan.

---

## Der Kern der Analyse in drei Sätzen

Die Architektur ist nicht in ihren **Regeln** überkompliziert — die zehn
Regeln sind gut und ungewöhnlich konsequent durchgehalten. Sie ist in ihrem
**Vokabular** überkompliziert: sie beantwortet „Was ist eine Fläche?" viermal
und „Was ist eine Fähigkeit?" dreimal. Beides sind Zusammenlegungen, keine
Neubauten.

Gezählt am Code (Stand `8c03dc5`, ~24.000 Zeilen Produktion, 11 Bausteine):

| Was | Wie oft beantwortet |
|---|---|
| Laufzeit | 2 — React (Editor-Chrom) und Lit (Bausteine) |
| UI-Dialekt | 3 — JSX · Lit-Template · `document.createElement` + `style.cssText` |
| Layout-Modell | 2 — Raster (Hauptseite) und Fluss (Popup-Rumpf, Container) |
| Fenster-Rahmen | 2 — `PopupBlock` und `DialogRahmen` |
| Tabelle | 2 — `blocks/tabelle/` (2.477 Zeilen) und `nachschlagen.ts` (424 Zeilen) |

Jedes Paar ist für sich sauber begründet, teils im Kommentar. In Summe sind
sie die Überkompliziertheit, die dem Nutzer aufgefallen ist.

**Ausdrücklich NICHT geändert wird**, was gut ist: zwei Laufzeiten für eine
Render-Quelle (teuer, aber der einzige Weg, auf dem Regel 1 wörtlich wahr
ist) · Fähigkeiten als Registry-Einträge statt Typweichen · die SE-Schicht,
die nie einen Baustein kennt · kein State-Management-Framework.

---

## Genehmigungs-Regeln (Nutzer-Ansage 2026-08-08)

Der Nutzer kann nicht programmieren. Deshalb gilt:

1. **Alles, was die Bedienung, die Ansicht oder das Aussehen ändert, braucht
   vorher seine ausdrückliche Genehmigung.** Auch wenn es „nur" eine
   Verbesserung ist.
2. **Alles, was Export-Bytes ändert, braucht zusätzlich einen SE-Echttest
   durch den Nutzer** (Regel 9 — Browser- und SoftEngine-Prüfung macht er).
3. Reine Umbauten ohne sichtbare Wirkung (Referenzabzug bleibt Byte für Byte
   gleich) sind freigegeben.
4. Zu jeder Änderung liefert der bauende Agent eine **Klickanleitung** und
   nennt ausdrücklich, was er nicht prüfen konnte.

### Stand der Freigaben

| Paket | Ändert Bedienung/Optik? | Ändert Export-Bytes? | Status |
|---|---|---|---|
| A0 Unwahre Kommentare | nein | nein | **freigegeben** |
| A1 Eine Fähigkeitsliste | nein | nein | **freigegeben** |
| A2 Naht dichtmachen | nein | nein | **freigegeben** |
| A3 Ein Fenster-Rahmen | nein (Optik gleich) | **ja** | Genehmigung + SE-Echttest |
| A4 Popup-Rumpf = Raster | **ja** | **ja** | Entscheidung offen |
| A5a Fenster aus Bauteilen | **ja** | **ja** | Genehmigung + SE-Echttest |
| A5b Fenster als Seite | **ja** | **ja** | Entscheidung offen |
| A6 Dialekt-Reste | nein (Optik gleich) | **ja** | Genehmigung + SE-Echttest |
| A7 Relationen/Parameter | **ja** | nein | noch nicht analysiert |
| P1–P5 Prozess | — | — | Entscheidungen offen |

---

## Alle Befunde und ihr Paket

| # | Befund | Paket |
|---|---|---|
| 1 | Kommentar `BlockDefinition.ts:356` behauptet Raster im Popup-Rumpf — falsch | A0 |
| 2 | Fähigkeit dreimal deklariert (`BlockComponentStatic` / `BlockDefinition` / Kopierzeile) | A1 |
| 3 | Stilles Loch: vergessene Kopierzeile compiliert, Fähigkeit ist tot | A1 |
| 4 | Vererbung trägt fast nichts — `BasicBlock`, nur `inlineEdit` ist echtes Verhalten | A1 |
| 5 | Toter Instanz-Vertrag `BlockComponent` / `customProperties`-Getter | A1 |
| 6 | Wächter erkennt Bausteine per Regex auf `static readonly blockType` | A1.4 |
| 7 | Typ-Löschung `defaultProps: Record<string, unknown>` | A2 |
| 8 | `elAny[key] = value` — ungeprüfte Schreibnaht React↔Lit | A2 |
| 9 | Wächter zählt `any`, das echte Loch ist `as unknown as` | A2.3 |
| 10 | Zwei Fenster-Rahmen, zwei Konstanten `24` | A3 |
| 11 | Hierarchie fehlt, wo sie gebraucht würde (`DialogRahmen` vs. `PopupBlock`) | A3 |
| 12 | Wächter-Ausnahme für `POPUP_RAND`-Import wird gegenstandslos | A3.3 |
| 13 | Zwei Layout-Modelle: Raster (Hauptseite) vs. Fluss (Popup-Rumpf) | A4 |
| 14 | Zwei Tabellen (2.477 vs. 424 Zeilen), geteilt ist nur `zeilePasst` | A5a |
| 15 | Dritter UI-Dialekt: 19 × `createElement`, 10 × `cssText` im Nachschlagen | A5a |
| 16 | Hartkodiert im Fenster: `SEITENGROESSE = 10`, Spalten 65/35 | A5a |
| 17 | Fehlendes Primitiv „Fläche + Rahmen" — Fenster als echte Seite | A5b |
| 18 | Letzte `cssText`-Reste in `bridge.ts` / `meldung.ts` | A6 |
| 19 | Relationen/Parameter im Editor wirken historisch gewachsen | A7 |
| 20 | Wächter zeigen nach innen, Referenzabzug ist selbstgebaut | P1 |
| 21 | CLAUDE.md mischt drei Haltbarkeiten | P2 |
| 22 | Breite vor Tiefe: keine echte Maske end-to-end im Betrieb | P3 |
| 23 | 500-Zeilen-Deckel erzeugt Verschieben ohne Naht | P4 |
| 24 | Test-Sperre = bewusster Tausch | P5 |

**Reihenfolge nach Risiko, nicht nach Wichtigkeit:** erst alles, was den
Export nicht verändert (der Referenzabzug beweist dann kostenlos, dass nichts
kaputtging), danach die Pakete, die einen SE-Echttest kosten.

---

# Teil 1 — Code

## A0 · Unwahre Kommentare
**klein · keine Export-Bytes · freigegeben**

**Befund:** `BlockDefinition.ts:356-357` sagt, `raster` wirke auf „oberste
Ebene + Popup-Rumpf". Tatsächlich rendert `PopupSeite.tsx:110` den Rumpf als
Fluss (`<NodeList …>` ohne `raster`), und `exportMask.ts:127` gibt das zu
(„folgt in einer späteren Etappe"). Ein Agent, der die Registry liest, baut
auf einer Falschaussage auf — der Nutzer kann das nicht prüfen.

**Anleitung:**
1. `src/core/blocks/BlockDefinition.ts:356-357` — Satz ändern: wirkt heute nur
   auf der obersten Ebene; der Popup-Rumpf ist Fluss, geplant in A4.
2. `src/blocks/shared/DialogRahmen.ts:11-14` — „Zusammenlegung ist
   vorgesehen" bleibt wahr bis A3; Paketnamen ergänzen, damit erkennbar ist,
   dass es einen Beschluss gibt und keine Absichtserklärung.
3. Repo nach weiteren „folgt später"/„vorgesehen"-Stellen durchsehen; jede
   entweder mit Paketnamen versehen oder streichen.

**Prüfung:** Bündel. Keine Klickanleitung nötig — reine Kommentare.

---

## A1 · Eine Fähigkeitsliste statt drei
**groß · keine Export-Bytes · freigegeben**

**Befund:** Jede Baustein-Fähigkeit steht dreimal: in `BlockComponent.ts`
(`BlockComponentStatic`, 21 optionale Felder), nochmal in `BlockDefinition.ts`
(dieselben 21) und als Kopierzeile in `BasicBlock.defineAndRegister`
(`BasicBlock.ts:170-191`). Weil in `BlockDefinition` alle diese Felder
optional sind, **compiliert eine vergessene Kopierzeile anstandslos** — die
Fähigkeit ist dann still tot. Das ist der schwerste Verstoß gegen Regel 4
(„nichts scheitert still") im Repo.

**Belege, dass die Zielform trägt:**
- `src/test/testBlocks.ts` baut Definitionen bereits als schlichte Objekte.
- **Niemand** liest `customProperties` von einer Element-Instanz. Alle Leser
  (Inspector, PropControl, preflight, exportMask) gehen über
  `getBlockDefinition(...)`. Der Instanz-Vertrag ist tote Last.
- Jedes Mal, wenn in diesem Projekt wirklich etwas geteilt werden musste, ist
  es **nicht** in die Basisklasse gewandert, sondern als Funktion nach
  `blocks/shared/` (20 Dateien). Die tragende Struktur ist die Registry, nicht
  die Vererbung.

**Zielform:**

```ts
// blocks/text/TextBlock.ts
export class TextBlock extends BasicBlock { /* nur noch Rendern */ }

export const textDefinition = definiereBaustein({
  type: 'text', tagName: 'ff-text', displayName: 'Text',
  category: 'anzeige', defaultProps: { … }, bindableSpots: [ … ],
}, TextBlock)
```

**Anleitung:**

**A1.1 — Die eine Liste bauen**
1. Neue Datei `src/core/blocks/definiereBaustein.ts` mit
   `definiereBaustein(def, Klasse)`: mischt die universellen Defaults
   (`FLOW_DEFAULTS`, `RASTER_DEFAULTS`, bedingt `QUELLEN_DEFAULTS`,
   `AUSWAHL_FOLGE_DEFAULTS`) unter `defaultProps`, ruft `customElements.define`
   HMR-geschützt, ruft `registerBlockType`. Das ist wörtlich der Rumpf von
   `defineAndRegister` — nur nimmt er die Fähigkeiten als **Objekt** entgegen,
   statt sie von einer Klasse abzuschreiben. Die Kopierschicht entfällt.
2. Liegt in `core/blocks/` — Wächter-Regel 6 erlaubt generischem Code genau
   diesen Ordner.
3. Die typgeprüften Helfer (`BindableSpotsFor`, `ActionValueSpotsFor`) bleiben
   und greifen am Deklarationsort, wo der Prop-Typ bekannt ist:
   `definiereBaustein` wird generisch über `defaultProps`.

**A1.2 — Bausteine umstellen** (11 Stück, mechanisch, einer nach dem anderen)
4. Metadaten-Statics raus aus der Klasse, rein ins Definitionsobjekt. Die
   Klasse behält `styles`, `@property`-Felder, `render`, Lebenszyklus.
5. `BlockCategory` künftig aus `BlockDefinition.ts` importieren (dort steht
   `export type { BlockCategory }` bereits in Zeile 14) — die 11 Importe aus
   `BlockComponent.ts` ziehen um.
6. `BasicBlock.defineAndRegister(XBlock)` am Dateiende wird zu
   `export const xDefinition = definiereBaustein({…}, XBlock)`.

**A1.3 — Toten Code löschen**
7. `src/core/blocks/BlockComponent.ts` ganz löschen.
8. In `BasicBlock`: `implements BlockComponent`, den `customProperties`-Getter
   und `defineAndRegister` entfernen. Übrig bleiben ~70 Zeilen: geteilte
   `:host`-Styles, `editable`, `inlineEdit`. Die Basisklasse behält damit
   genau das, was echtes geerbtes Verhalten ist.

**A1.4 — Die Wächter mitziehen** (sonst wird das Bündel rot)
9. `scripts/check-regeln.mjs` erkennt Bausteine per Regex auf
   `static readonly blockType = '…'` / `tagName = '…'` (Zeilen ~46-53). Nach
   dem Umbau findet er **null** Bausteine und schlägt über seine eigene
   Selbstprüfung Alarm. Regex auf die Objektform umstellen (`type: '…'` /
   `tagName: '…'` innerhalb von `definiereBaustein(`). Die Selbstprüfung
   bleibt — sie hat hier genau ihren Zweck erfüllt.
10. Prüfungen 2, 2b und 5 hängen an derselben Liste und laufen danach
    unverändert weiter.

**Was das schließt:** drei Listen werden eine · das stille Loch ist zu (fehlt
ein Feld, gibt es keine zweite Liste mehr, mit der es auseinanderlaufen
könnte) · ~90 Zeilen tote Last weg · `BlockDefinition.ts` schrumpft.

**Prüfung:** Bündel. **Der Referenzabzug ist der eigentliche Beweis:** ändert
sich ein Byte, war der Umbau nicht verhaltensgleich. Er MUSS grün bleiben,
`vitest run -u` ist in diesem Paket verboten.

**Klickanleitung:** Editor öffnen → jeden der 11 Bausteine aus der Bibliothek
auf die Fläche ziehen → der Inspector muss je Baustein dieselben Felder zeigen
wie vorher → Kanban „+ Spalte"/„+ Karte" prüfen (das sind
`addChildButton`/`allowedChildTypes`, also genau die kopierten Fähigkeiten).

---

## A2 · Die Naht zwischen React und Lit dichtmachen
**klein · keine Export-Bytes · freigegeben**

**Befund:** `useLitElement.ts:112-115` schreibt alle Props blind aufs Element:

```ts
const elAny = el as unknown as Record<string, unknown>
for (const [key, value] of Object.entries(block.props)) elAny[key] = value
```

Ein falscher Prop-Name landet stumm am Element und tut nichts. Das ist die
einzige Übergabestelle zwischen den beiden Laufzeiten — und die einzige ohne
Prüfung.

**Ehrliche Einordnung:** Vollständige Typsicherheit ist hier **unmöglich**.
Der Baum ist heterogen und kommt aus dem Browser-Speicher; `block.props` ist
zur Laufzeit ein `Record<string, unknown>` und kann nichts anderes sein.
Machbar ist die *geprüfte* Schreibnaht.

**Anleitung:**
1. **A2.1** — Nur bekannte Props schreiben. Die Definition kennt über
   `defaultProps` alle gültigen Namen; dagegen prüfen. Unbekannte nicht
   schreiben, sondern sammeln und **einmal** als `console.warn` mit
   Bausteintyp und Prop-Name melden (Regel 4).
2. **A2.2** — Den Doppel-Cast auflösen: statt
   `as unknown as Record<string, unknown>` ein benannter Typ
   `type BausteinElement = HTMLElement & Record<string, unknown>`, einmal bei
   `document.createElement` gesetzt.
3. **A2.3** — Den Wächter ehrlich machen: `check-regeln.mjs` Prüfung 4 zählt
   `any` und `@ts-ignore` (erlaubt 2 / 1; die zwei `any` sitzen beide in
   `bridge.ts:28-29`, `seGlobal()` — legitim, das ist die Grenze zur fremden
   Laufzeit). Sie zählt **nicht** `as unknown as` — also ausgerechnet die
   Form, in der das schwerste Typloch steckte. Mit aufnehmen, Stand einfrieren
   (Produktionscode: `useLitElement`, `relations.ts`, `BasicBlock`, 2 ×
   `kanban/seRuntime`; Tests ausgenommen wie bisher).

**Prüfung:** Bündel, Referenzabzug grün.

**Klickanleitung:** Editor öffnen, Browser-Konsole auf → Baustein einfügen,
Eigenschaften im Inspector ändern, Text per Doppelklick inline ändern →
**keine** neue Warnung darf erscheinen. Erscheint eine, ist sie ein echter
Fund und wird gemeldet, nicht weggedrückt.

---

## A3 · Ein Fenster-Rahmen
**mittel · ÄNDERT EXPORT-BYTES · Genehmigung + SE-Echttest**

**Befund:** `PopupBlock` und `DialogRahmen` bauen dasselbe Fenster zweimal —
Abdunklung, Bühne, Fenster, Kopf, Titel, X, dieselben Tokens, dieselben Maße,
und zwei Konstanten `POPUP_RAND = 24` / `DIALOG_RAND = 24` für dieselbe Regel.
Der `DialogRahmen`-Kommentar benennt sich selbst als Ziel der Zusammenlegung.
Nebenbei die Ironie: `DialogRahmen` erbt von `LitElement`, `PopupBlock` von
`BasicBlock` — die Hierarchie existiert, wo sie nicht gebraucht wird, und
fehlt, wo sie gebraucht würde.

**Richtung:** `DialogRahmen` ist das Ziel (so steht es im Kommentar, und es
stimmt: er ist der allgemeinere — Werkzeugzeile und Escape kann nur er).

**Anleitung:**
1. `PopupBlock.render()` gibt künftig `<ff-dialog-rahmen>` mit `titel`,
   `breite`, `hoehe` aus und legt seinen `<slot>` in dessen Inhalt.
2. Zwei Unterschiede müssen erhalten bleiben, sonst ändert sich Verhalten
   statt nur Struktur:
   - Der Popup-Titel ist per Doppelklick umbenennbar (`inlineEdit`, Bedienung
     am Ding). `DialogRahmen` hat dafür `<slot name="titel">` — der Popup
     schiebt sein `<span data-ff-editable>` dorthin.
   - Das X schließt im Editor **nicht** (`data-ff-editor`-Prüfung in
     `PopupBlock.onClose`). `DialogRahmen` feuert nur ein Ereignis; der Popup
     hört darauf und behält seine Editor-Prüfung.
3. `POPUP_RAND` löschen, `DIALOG_RAND` bleibt die eine Konstante. `POPUP_RAND`
   wird von `PopupSeite.tsx` importiert (Editor-Anfasser) — Import umstellen.
4. **A3.3** — `check-regeln.mjs`, `BAUSTEIN_IMPORT_AUSNAHMEN`: die Ausnahme
   für `PopupSeite.tsx` begründet sich mit `POPUP_RAND`. Begründung auf
   `DIALOG_RAND` umschreiben (die Ausnahme selbst bleibt nötig und richtig).
5. Der Popup bleibt `pageBlock`, bleibt im Baum, bleibt exportiert. **Am
   Datenmodell ändert sich nichts** — nur am erzeugten Markup.

**Prüfung:** Bündel. Der Referenzabzug **wird sich ändern** (die
Referenzmaske enthält ein Popup) → danach `npx vitest run -u`; der Datei-Diff
im Commit zeigt die Maskenänderung Zeile für Zeile. Genau dafür ist er da.

**Klickanleitung:** Editor → Popup-Reiter anlegen → das Fenster muss identisch
aussehen wie vorher → Titel doppelklicken und umbenennen → Breite/Höhe an den
Anfassern ziehen, Doppelklick setzt zurück → X darf im Editor nichts tun.

**SE-Echttest (Nutzer):** Maske mit Popup exportieren, in SoftEngine laden,
Popup über eine Kette öffnen und mit X schließen.

---

## A4 · Popup-Rumpf wird Rasterfläche
**mittel · ÄNDERT EXPORT-BYTES · ENTSCHEIDUNG OFFEN**

**Befund:** Hauptseite = CSS-Grid, Popup-Rumpf = Flex-Spalte. Derselbe
Baustein gehorcht anderen Gesetzen, je nachdem wo er liegt.

**Zwei ehrliche Auflösungen — der Nutzer entscheidet vorher:**

- **(a) Raster überall.** Der Popup-Rumpf wird Rasterfläche wie die
  Hauptseite. Sauber, entspricht „ein Baustein, ein Gesetz", macht die
  Registry-Aussage wieder wahr. **Kosten:** bestehende Popup-Inhalte liegen im
  Fluss und brauchen Zellkoordinaten → **Migration** in `state/migrations.ts`.
  Bestehende Masken sehen danach anders aus. Einzige Stelle im Plan, an der
  sich etwas an bereits gebauter Arbeit verschiebt.
- **(b) Fluss bleibt die Regel im Fenster.** Kostet fast nichts (A0 hat den
  Kommentar bereits geradegezogen), aber die Inkonsistenz bleibt — dann ist
  der Befund nicht behoben, sondern bewusst als Regel festgeschrieben:
  „Hauptseite = Raster, Fenster = Fluss."

**Empfehlung: (a)** — (b) ist die halbe Sache. Aber (a) fasst gespeicherte
Stände an, deshalb wird gefragt.

**Anleitung für (a):**
1. `PopupSeite.tsx:110` — `raster` an die `NodeList` durchreichen; Drop-Ziel
   von `kind: 'flow'` auf `rasterZiel(...)` umstellen (die Mechanik existiert
   in `rasterDnd.ts`, sie wird nur nicht aufgerufen).
2. `rasterOps.istRasterFlaeche` meldet den Popup-Rumpf als Rasterfläche —
   registry-getrieben über `pageBlock`, nie per Typvergleich.
3. `exportMask.nodeToHtml` — `rasterEbene` in Seiten-Bausteine hineinreichen
   statt `false`; die Fläche bekommt `rasterFlaecheStyle()` wie die Wurzel.
4. `PopupBlock` `.rumpf`-CSS: Flex-Spalte → Grid, exakt dieselben Werte wie
   die Wurzelfläche.
5. Migration: bestehende Popup-Kinder ohne Rasterkoordinaten bekommen sie in
   Baumreihenfolge (je Kind eine Zeile, volle Breite) — das kommt dem
   heutigen Fluss am nächsten.
6. `BlockDefinition.ts:356` — Kommentar aus A0 wird wieder auf „oberste Ebene
   + Popup-Rumpf" gesetzt, jetzt wahrheitsgemäß.

**Prüfung:** Bündel + Referenzabzug erneuern. `migrationen.test.ts` bekommt
einen Fall für den alten Popup-Stand (kein neuer Testtyp, sondern eine Zeile
in einem bestehenden Test — Regel 9 erlaubt Mitwachsen).

**Klickanleitung:** Alten Speicherstand mit gefülltem Popup öffnen → alle
Inhalte müssen noch da sein, untereinander → dann Bausteine im Popup frei auf
Zellen ziehen wie auf der Hauptseite.

---

## A5a · Das Nachschlage-Fenster bekommt Rahmen und Tabelle aus dem Baukasten
**groß · ÄNDERT EXPORT-BYTES · Genehmigung + SE-Echttest**

**Befund:** `nachschlagen.ts` baut mit 19 × `createElement` und 10 ×
`cssText` eine zweite Tabelle: Kopf, Spaltenbreiten 65/35 fest, Blättern mit
fester `SEITENGROESSE = 10`, Suche, zwei Leerzustände, Zähler, Hover. Daneben
liegen 2.477 Zeilen `blocks/tabelle/`, die all das besser können — gemessene
Zeilenzahl statt fester 10, Spaltenarten, Sortierung, Bild + Name,
Status-Marken, Fußzeile mit korrekter Grammatik. Geteilt ist genau eine
Funktion (`zeilePasst`).

**Begründung im Code für die Trennung** (`nachschlagen.ts:11-13`): „Kein
Baustein: das Fenster entsteht erst beim Klick." Der Satz vermengt **wann**
etwas entsteht mit **woraus** es gebaut ist. Ein Popup ist auch erst beim
Klick sichtbar und liegt trotzdem im Baum.

**Lösung:** Das Fenster wird aus vorhandenen Bauteilen zusammengesetzt statt
nachgebaut: `<ff-dialog-rahmen>` + `<ff-tabelle>`.

**Warum das geht — alles vorhanden, nichts Neues nötig:**
- `<ff-tabelle>` liest ihre Einstellungen aus Attributen (`source`, `spalten`
  als JSON) und hydriert sich über `macheDatenAnschluss` selbst. Sie prüft
  `data-ff-editor`; in der Maske fehlt das, also meldet sie sich normal an.
- Suche, Blättern, Leerzustände, Fußzeile: eingebaut.
- Zeilenauswahl: die Tabelle ist bereits Auswahl-**Geber** (`satzWahl`), gibt
  also die angeklickte Zeile ab — genau was „Satz übernehmen" braucht.
- Die Folge-Filterung liest `zeilenNachAuswahl(el, rows)` aus den Attributen
  **des Elements**; die Folge-Attribute des Feldes werden beim Öffnen auf das
  Tabellen-Element übertragen.

**Anleitung:**
1. In `oeffneNachschlagen` den handgebauten Inhalt ersetzen durch ein
   `<ff-tabelle>`-Element, dessen Attribute aus den Feld-Einstellungen
   entstehen: `source` = Nachschlage-Quelle, `spalten` = JSON mit den zwei
   gewählten Feldern und ihren Klarnamen als Titel.
2. Auswahl-Folge-Attribute vom Feld aufs Tabellen-Element kopieren (dieselben
   Attributnamen, kein zweiter Weg).
3. Zeilenklick: auf das Auswahl-Ereignis der Tabelle hören und daraus
   `onUebernehmen(anzeige, wert, satz)` bedienen. Der Rohsatz kommt aus der
   Auswahl — die Tabelle gibt ihn ohnehin ab.
4. Die Such-Zeile im `slot="werkzeug"` entfällt — die Tabelle bringt ihre
   eigene mit. Damit fällt auch `nachschlagTreffer` weg.
5. Feste Zahlen weg: `SEITENGROESSE = 10` → gemessene Zeilenzahl (`PASSEND`);
   Spaltenbreiten 65/35 → Spaltenarten.
6. **Bleibt und muss bleiben:** die reinen Datenwege `nachschlagEintraege`,
   `holeEintraege`, `einzigenTrefferFinden`, `satzPasstZurAuswahl`,
   `folgeBeimVerlassen` — getestet, richtig, haben mit dem Fenster nichts zu
   tun.
7. Erwartete Größe danach: von 424 auf grob 150 Zeilen, ohne ein einziges
   `cssText`.

**Nebengewinn:** Das Fenster erbt ab dann jede künftige Tabellen-Verbesserung,
und die Designsprache hat eine handgepflegte Ecke weniger.

**Prüfung:** Bündel. `nachschlagen.test.ts` läuft weiter (er prüft die reinen
Datenwege, nicht das DOM); die Fälle zur entfallenen Suche werden gestrichen.
Referenzabzug erneuern (das Runtime-Bündel ändert sich).

**Klickanleitung:** Maske mit Nachschlage-Feld exportieren und lokal öffnen →
Lupe klicken → das Fenster muss Suche, Blättern und Fußzeile der normalen
Tabelle zeigen → Zeile klicken übernimmt den Klarwert ins Feld → Feld leeren
und verlassen, halb tippen und verlassen (die drei Ausgänge aus
`folgeBeimVerlassen`) → mit Kunde/Haustier-Paar die Folge prüfen.

**SE-Echttest (Nutzer):** dieselbe Maske in SoftEngine mit echten Beständen —
vor allem die Folge-Filterung und ein Bestand > 100 Sätze.

---

## A5b · Das Fenster wird eine echte, bearbeitbare Seite
**groß · ÄNDERT EXPORT-BYTES · ENTSCHEIDUNG OFFEN**

Die volle Fassung des Primitivs „Fläche + Rahmen": Das Nachschlage-Fenster ist
dann kein Systemteil mehr, sondern eine **Popup-Seite wie jede andere** — mit
einer Tabelle darin, die der Bauer sehen, umbauen und um Spalten erweitern
kann. Der Editor legt sie auf einen Klick fertig verdrahtet an; danach ist sie
normaler Baukasten.

**Warum das die konsequente Lösung ist:** Es entsteht **kein einziger neuer
Begriff.** Popup-Seite, Tabelle, Auswahl-Geber, Auswahl-Folge, `POPUP_OPEN` /
`POPUP_CLOSE` — alles existiert und läuft. Das Fenster wäre buchstäblich das,
was der eigene Grundsatz verlangt: sichtbar verdrahtet statt eingebaut.

**Warum es ein eigenes Paket bleibt:** Es gibt eine echte offene Frage, die
nur der Nutzer beantworten kann — **darf mehr als eine Seite gleichzeitig
offen sein?** Heute gilt „kein Popup im Popup" (`allowedParentTypes =
[ROOT_TYPE]`), und `DialogRahmen` löst das mit `position: fixed` und
maximalem z-index. Steht das Nachschlage-Feld aber *in* einem Popup, wären
zwei Seiten gleichzeitig offen. Das braucht eine Regel („Fenster stapeln sich,
Escape schließt das oberste") — und Regeln über Bedienverhalten sind eine
Nutzer-Entscheidung.

**Empfehlung:** A5b erst nach dem SE-Echttest von A5a entscheiden. A5a bringt
rund 90 % des Gewinns bei einem Bruchteil des Risikos; A5b ist danach ein
sauberer, kleiner Aufsatz — oder er entfällt.

---

## A6 · Die letzten Dialekt-Reste
**klein · ÄNDERT EXPORT-BYTES (Runtime-Bündel) · Genehmigung + SE-Echttest**

**Befund:** Nach A5a bleiben `cssText`-Stellen in `softengine/bridge.ts` und
`softengine/meldung.ts` (der Fehlerbalken der Maske) — der Rest des dritten
UI-Dialekts.

**Anleitung:**
1. `meldung.ts` — der Fehlerbalken wird ein kleines Lit-Element (`ff-meldung`)
   mit `styles` aus Masken-Tokens, wie jeder Baustein. Bleibt in
   `softengine/`, ist aber kein Baustein und steht nicht in der Registry.
2. `bridge.ts` — die eine `cssText`-Stelle ansehen; gehört sie zur Meldung,
   wandert sie mit.
3. Danach gilt ausnahmslos: **JSX im Editor-Chrom, Lit für alles, was der
   Bediener sieht.** Diese Regel kann dann in CLAUDE.md, weil sie dann stimmt.

**Prüfung:** Bündel, Referenzabzug erneuern.

**Klickanleitung:** Maske mit absichtlich kaputter Kette exportieren und
öffnen → der Fehlerbalken muss erscheinen, mehrere Fehler bündeln und
aussehen wie vorher.

---

## A7 · Relationen und Parameter im Editor
**noch nicht analysiert · ÄNDERT BEDIENUNG · ENTSCHEIDUNG OFFEN**

**Anlass:** Nutzer-Ansage 2026-08-08 — „im Editor mit den Relationen und
Parametern sieht das im Detail schon sehr komisch aus, man sieht, dass das
historisch wächst und dadurch nicht schön ist."

**Ehrlicher Stand:** Dieser Bereich war **nicht** Teil der Analyse. Was hier
steht, ist ein erster Eindruck aus einem kurzen Blick in die Dateien, kein
geprüfter Befund. Er ist bewusst als offene Frage formuliert und **nicht** als
Bauauftrag.

**Erster Eindruck, strukturell:**

Dasselbe Thema — eine Relation mit ihren Parametern — wird an **zwei Orten in
zwei völlig verschiedenen Formen** gezeigt:

- Die Relations-**Vorlagen** leben in der Kommandozentrale
  (`Kommandozentrale.tsx`): Modal über der ganzen Fläche, Master-Detail,
  breit, mit Syntaxzeile und „Verwendung in dieser Maske".
- Die **Schritte**, die diese Vorlagen benutzen, leben im Inspector
  (`StepForm.tsx`, 430 Zeilen): schmale Spalte, rund 340 px. Deshalb steht
  jeder Parameter **einzeilig** — „Name | Quelle | Wert" gequetscht in eine
  Zeile, lange Technikwerte gekürzt, der Rest im Tooltip
  (`ParameterZeile.tsx`, 361 Zeilen).

Die Parameterzeile hat also die Form, die ihr **Behälter** vorgibt, nicht die,
die ihre **Aufgabe** verlangt. Genau das ist der Eindruck „historisch
gewachsen": nicht schlechte Einzelentscheidungen, sondern eine Ansicht, die
sich der Breite eines Panels gefügt hat, das für Eigenschaften gedacht war.

Dazu kommt, dass acht Parameter-Quellenarten (`Fest`, `Ereigniswert`,
`Datenfeld`, `Baustein`, `Gewählte Zeile`, `Vorheriger Schritt`, `Ergebnis von
Schritt`, `SE VAR-Array`) alle in dieselbe schmale Zelle passen müssen,
obwohl sie ganz verschieden viel Platz brauchen.

**Die Frage, nicht die Antwort:** Gehört das Bearbeiten einer Aktionskette
überhaupt in die 340-px-Spalte? Eine Kette ist eine Abfolge mit Parametern —
das ist eher eine Tabelle als ein Formular. Ob die Kette dorthin gehört, wo
heute die Vorlagen sind (breite Fläche), ob sie eine eigene Ansicht bekommt,
oder ob die Zeile selbst anders geschnitten wird, ist eine
**Gestaltungsfrage** und keine Architekturfrage — sie gehört dem Nutzer, nicht
dem bauenden Agenten.

**Nächster Schritt:** eigener Analyse-Auftrag für diesen Bereich, bevor
irgendetwas gebaut wird. Vorschläge zur Bedienung sind ausdrücklich erwünscht
(auch von Codex), aber nichts davon wird ohne Genehmigung umgesetzt.

---

# Teil 2 — Prozess

## P1 · Die Wächter nach außen drehen

**Befund:** Fünf Wächter und 6.000 Testzeilen schützen das Innere. Der
Referenzabzug ist eine 121-zeilige **selbstgebaute** Maske, keine
Reproduktion einer echten. Die Frage, die über alles entscheidet — läuft der
Export unverändert in SoftEngine — hängt an der Erinnerung des Nutzers.

**Lösung ohne Verletzung des Doku-Schnitts:** `docs/softengine-wiki/` ist der
einzige Ordner, der überlebt hat, weil er beweist statt zu erzählen. Er
bekommt **eine** Datei dazu: `echttests.md`, eine Tabelle.

| Datum | Maske | Plattform | Was geprüft | Ergebnis |
|---|---|---|---|---|

Eine Zeile je Echttest. Bei Fehlschlag: was SoftEngine gemeldet hat, wörtlich.
Mehr nicht.

**Was das ändert:** „SE-Kontrakt belegt" wird prüfbar statt erinnert. Der
offene Punkt aus Regel 5 (ist das Interface-Skript nötig?) bekommt einen Ort,
an dem er beantwortet werden kann, sobald jemand einen Lauf ohne den Tag
macht.

---

## P2 · CLAUDE.md nach Haltbarkeit trennen
**ENTSCHEIDUNG OFFEN**

**Befund:** Eine Datei macht drei Jobs mit drei Haltbarkeiten: Verfassung
(dauerhaft), Entscheidungs-Protokoll (historisch), Statusbrett (nach einer
Woche schal) — inklusive Widerrufen im Fließtext. Jede Sitzung zahlt den
vollen Preis.

**Empfehlung — Trennung INNERHALB der Datei, keine neuen Dateien** (der
Doku-Schnitt war eine Nutzer-Entscheidung und wird nicht angefasst):

1. **Teil 1 · Verfassung** — die 10 Regeln, die festen Zusagen, die
   SE-Kontrakte. Muss vor jeder Änderung gelesen werden. Ziel: ~80 Zeilen.
2. **Teil 2 · Entschieden und erledigt** — was wann warum rausflog,
   gestrichene Rubriken, überholte Gegenrichtungen. Wird gelesen, wenn jemand
   fragt „warum ist das so?".
3. **Teil 3 · Woran gerade gearbeitet wird** — kurz, beim nächsten Paket
   überschrieben statt ergänzt.

**Die Regel dahinter:** Eine Aussage, die widerrufen wurde, gehört nicht mehr
in den Teil, der befolgt wird. Sie gehört ins Protokoll.

Der bauende Agent legt nur einen Vorschlag vor; die Verfassung schreibt der
Nutzer.

---

## P3 · Eine echte Maske end-to-end
**ENTSCHEIDUNG OFFEN · vermutlich der wertvollste Punkt im Plan**

**Befund:** Regel 10 („nichts auf Verdacht") wird beim Code streng eingehalten
und bei der Feature-Front nicht. Kanban, Tabelle, Popup, Nachschlagen, Ketten,
Relationen, Designsprache — und gleichzeitig sind ERPAPICALL, MEMTAB und der
Wertevertrag des Ankreuzfelds vertagt, „bis an einer echten Maske belegt".

**Vorschlag:** Eine Maske, die wirklich gebraucht wird — langweilig, klein,
vollständig — mit dem Editor bauen und **produktiv einsetzen**. Nicht als
Test, sondern im Betrieb.

**Was das liefert, was kein Wächter liefern kann:**
- Den Beweis, dass der Nordstern hält („läuft ohne Nachbesserung von Hand") —
  heute ist das eine Annahme.
- Die offenen SE-Verträge beantworten sich von selbst, weil die Maske sie
  braucht.
- Jede Lücke, die auffällt, ist garantiert eine echte.

**Empfehlung zur Einordnung:** P3 **vor** A5b. Zeigt die echte Maske, dass das
Nachschlagen anders gebraucht wird als gedacht, wäre A5b sonst am Bedarf
vorbeigebaut.

---

## P4 · Der 500-Zeilen-Deckel
**ENTSCHEIDUNG OFFEN · klein**

**Befund:** Der Deckel erzeugt inzwischen Teilungen, die eine Zeilenzahl
protokollieren statt einer Naht — `BlockDefinition.ts` lagert `listenBindung`
aus und re-exportiert es sofort wieder, mit genau dieser Begründung im
Kommentar. Dasselbe bei `knotenStil` aus `exportMask`.

**Empfehlung: Deckel behalten, nichts am Wächter ändern.** A1 schrumpft
`BlockDefinition.ts` ohnehin deutlich, und ein Deckel, den man aufweicht,
sobald er drückt, ist keiner.

**Stattdessen ein Satz in der Verfassung (P2):** „Eine Datei wird an einer
Naht geteilt. Wer nur teilt und alles zurück-exportiert, hat den Rauchmelder
abgeklebt — dann lieber den Inhalt kürzen." Der Wächter kann das nicht
prüfen; es ist eine Denkregel, keine Maschine.

---

## P5 · Die Test-Sperre
**nichts zu tun**

Der Punkt steht hier, damit klar ist, **welcher Tausch gekauft wurde**: keine
Anzeige-Regressionen zu bemerken, dafür keine Token- und Zeitfresser und keine
Agenten, die sich auf grüne Ampeln verlassen statt zu denken. Der Tausch ist
in sich stimmig, Befund B1 stützt ihn, die Klickanleitung ist der vereinbarte
Preis.

**Hier wird nichts vorgeschlagen** — die Regel ist hart und ausdrücklich, auch
gegen Vorschläge. Der Punkt ist mit diesem Absatz abgeschlossen.

---

# Offene Entscheidungen (Nutzer)

1. **A4** — Raster im Popup-Rumpf (mit Migration bestehender Stände) oder
   Fluss als Regel festschreiben? *Empfehlung: Raster.*
2. **A5b** — volle Fassung bauen? Und wenn ja: wie verhalten sich zwei offene
   Fenster? *Empfehlung: nach A5a und P3 entscheiden.*
3. **A7** — eigener Analyse-Auftrag für Relationen/Parameter, bevor dort
   irgendetwas gebaut wird.
4. **P2** — CLAUDE.md dreiteilen: ja/nein?
5. **P3** — welche echte Maske zuerst?
6. **P4** — Deckel bei 500 lassen? *Empfehlung: ja.*

**Abweichende Reihenfolge-Empfehlung, damit sie bewusst überstimmt werden
kann:** P3 (eine echte Maske im Betrieb) vor A5b einzuschieben kostet Zeit
statt Code, verhindert aber, dass das größte Paket am tatsächlichen Bedarf
vorbeigebaut wird.
