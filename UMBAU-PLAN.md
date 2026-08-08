# Umbau-Plan — Architektur-Konsolidierung

> **Diese Datei ist KI-generiert.** Analyse und Plan stammen von Claude
> (Modell claude-opus-5), erstellt am 2026-08-08 auf dem Code-Stand `8c03dc5`.
> Nichts darin ist vom Nutzer geschrieben; nichts darin ist in SoftEngine oder
> im Browser erprobt.
>
> **Fassung 2 (2026-08-08)** — überarbeitet nach einer unabhängigen
> Gegenprüfung durch eine zweite KI (Codex). Die Gegenprüfung hat in mehreren
> Punkten recht behalten; ein Kernpunkt der ersten Fassung war **falsch** (A1
> ist nicht exportneutral). Alle Änderungen sind im Abschnitt „Gegenprüfung"
> mit Zustimmung/Widerspruch und Begründung festgehalten.
>
> **Auch diese Fassung ist nicht blind zu übernehmen.** Der Nutzer kann nicht
> programmieren; die Regeln in CLAUDE.md und die Wächter sind sein Ersatz
> dafür, Code zu lesen.
>
> **Temporär.** Wird gelöscht, wenn die Pakete gebaut sind — die Chronik steht
> dann in der git-Historie (Doku-Schnitt 2026-07-30: keine `docs/`-Ablage neu
> erfinden).

---

## Der Kern der Analyse

Die Architektur ist nicht in ihren **Regeln** überkompliziert — die zehn
Regeln sind gut und ungewöhnlich konsequent durchgehalten. Sie ist in ihrem
**Vokabular** überkompliziert: sie beantwortet „Was ist eine Fläche?" viermal
und „Was ist eine Fähigkeit?" dreimal.

| Was | Wie oft beantwortet |
|---|---|
| Laufzeit | 2 — React (Editor-Chrom) und Lit (Bausteine) |
| UI-Dialekt | 3 — JSX · Lit-Template · `createElement` + `style.cssText` |
| Layout-Modell | 2 — Raster (Hauptseite sichtbar) und Fluss (Popup-Rumpf sichtbar) |
| Fenster-Rahmen | 2 — `PopupBlock` und `DialogRahmen` |
| Tabelle | 2 — `blocks/tabelle/` (2.477 Zeilen) und `nachschlagen.ts` (424 Zeilen) |

**Ausdrücklich NICHT geändert wird**, was gut ist: zwei Laufzeiten für eine
Render-Quelle · Fähigkeiten als Registry-Einträge statt Typweichen · die
SE-Schicht, die nie einen Baustein kennt · kein State-Management-Framework ·
die getrennten Designwelten Editor (shadcn/Indigo) und Maske (Fellnase/`--se-*`).

---

## Genehmigungs-Regeln (Nutzer-Ansage 2026-08-08)

1. **Alles, was Bedienung, Ansicht oder Aussehen ändert, braucht vorher die
   ausdrückliche Genehmigung des Nutzers.** Auch „nur" Verbesserungen.
2. **Alles, was Export- oder Runtime-Bytes ändert, braucht zusätzlich einen
   SE-Echttest durch den Nutzer** (Regel 9).
3. Reine Umbauten ohne sichtbare Wirkung UND ohne Runtime-Änderung sind
   freigegeben.
4. Zu jeder Änderung: **Klickanleitung** plus ausdrückliche Nennung dessen,
   was der Agent nicht prüfen konnte.

### Stand der Freigaben (Fassung 2 — deutlich strenger als Fassung 1)

| Paket | Bedienung/Optik | Export-/Runtime-Bytes | Status |
|---|---|---|---|
| A0 Unwahre Kommentare (erweitert) | nein | nein | **freigegeben** |
| A2 Naht dichtmachen (verkleinert) | nein | nein | **freigegeben** |
| P1 SE-Nachweistabelle | nein | nein | **freigegeben** |
| P2 CLAUDE.md dreiteilen | nein | nein | Entscheidung offen |
| P3 Echte Maske end-to-end | — | — | Entscheidung offen |
| A1 Eine Fähigkeitsliste | nein | **ja (Runtime!)** | Genehmigung + SE-Echttest |
| A3 Ein Fenster-Rahmen | **ja (Innenabstände)** | **ja** | Genehmigung + SE-Echttest |
| A4 Popup-Raster | **ja** | **ja** | Bedienungsentscheidung ZUERST |
| A5a Fenster aus Bauteilen | **ja** | **ja** | Vorarbeit nötig, dann Genehmigung |
| A5b Fenster als Systemseite | **ja** | **ja** | **vertagt** |
| A6 Dialekt-Reste | — | — | **gestrichen** |
| A7 Relationen/Parameter | **ja** | nein | eigene Bedienungsaufgabe |
| A8 Zwei Downloads beim Export | **ja** | nein | Bedienungsentscheidung |
| D1 Designsprache-Abweichungen | **ja** | **ja** | klären, nicht bauen |
| P4 500-Zeilen-Deckel | — | — | Empfehlung: unverändert lassen |
| P5 Test-Sperre | — | — | nichts zu tun |

---

# Gegenprüfung 2026-08-08 — Zustimmung und Widerspruch

Alle folgenden Punkte wurden von Claude **am Code nachgeprüft**, nicht
übernommen. Die Fundstellen sind genannt, damit ein Dritter sie nachschlagen
kann.

## STIMME ZU — mit Beleg

**1. A1 ist NICHT exportneutral. Der schwerste Fehler der ersten Fassung.**
Belegt: `referenzabzug.test.ts:40-45` schneidet über `ohneBuendel()` das
Runtime-Bündel absichtlich aus dem Byte-Vergleich heraus (entrauscht
2026-07-30, weil das Minifikat jeden Diff überdeckte). A1 verändert
`BasicBlock` und alle elf Bausteinklassen — die stecken über
`runtime-entry.ts` → `blocks/register` im ausgelieferten
`generated/ff-runtime.js`. **Der Referenzabzug kann also grün bleiben, während
sich der ausgelieferte Runtime-Code geändert hat.** Meine Formulierung „der
Referenzabzug ist der eigentliche Beweis" war falsch. Richtig ist: er beweist,
dass das **Markup** unverändert ist — nicht, dass die **Laufzeit** unverändert
ist. Für die Laufzeit wacht `check:runtime` (baut das Bündel neu und
vergleicht), aber ein neu gebautes Bündel heißt: geänderte Bytes in der Maske,
also Regel 9, also SE-Echttest.
→ A1 rutscht aus „freigegeben" in „Genehmigung + SE-Echttest".

**2. Befund 13 (A4): Popups sind im Zustand BEREITS Rasterflächen.**
Belegt: `rasterOps.ts:25-27` — `istRasterFlaeche` liefert `true` für jeden
Seiten-Baustein. `migrations.ts:177-211` — `rasterFlaechenIds` schließt
ausdrücklich „jeder Popup-Rumpf" ein und vergibt `rasterX/Y/W/H` an
Popup-Kinder. Sichtbar ist der Rumpf trotzdem Fluss (`PopupSeite.tsx:110`).
**Es können also unsichtbare, veraltete Rasterkoordinaten existieren.** Meine
A4-Anleitung („fehlende Koordinaten ergänzen") hätte alte unsichtbare
Koordinaten schlagartig sichtbar gemacht und Layouts springen lassen.

**3. A5a beseitigt die feste 10er-Seitengröße NICHT automatisch.**
Belegt: `seitengroesse.ts:49` — `OHNE_MESSUNG = ZEILEN_PRO_SEITE[0]`, also
**10**. Ohne gemessene Höhe fällt auch die normale Tabelle auf 10 Zeilen
zurück. `<ff-tabelle>` in einen Dialog zu legen genügt nicht; die Messung muss
im Dialog funktionieren. Mein Satz „feste Zahlen weg" war zu glatt.

**4. A5a: die Tabelle hat keine Tastaturbedienung für Zeilen.**
Belegt: In `blocks/tabelle/` gibt es `keydown` nur in `spaltenBearbeiten.ts`
(Titel umbenennen). Das Nachschlage-Fenster dagegen setzt `zeile.tabIndex = 0`
und behandelt Enter (`nachschlagen.ts:372-390`). Ein naiver Umbau wäre ein
**Bedienungs-Rückschritt**.

**5. Befund 14: nicht nur `zeilePasst` wird geteilt.**
Belegt: `nachschlagen.ts:111` benutzt `zeilenNachAuswahl` aus
`shared/auswahl.ts` — dieselbe Folge-Mechanik wie die Tabelle. Meine Aussage
„geteilt ist genau eine Funktion" war falsch.

**6. Befund 3: aktuell ist KEINE Fähigkeit vergessen.**
Nachgezählt: die statischen Felder aller elf Bausteinklassen und die
Kopierliste in `defineAndRegister` stimmen exakt überein (einziger Unterschied:
`blockType` → `type`). Es ist ein **Risiko**, kein gegenwärtiger Defekt.
*Teilweiser Widerspruch dazu unten.*

**7. Befund 9: der Wächter zählt auch Testdateien mit.**
Belegt: Die `any`/`@ts-ignore`-Schleife in `check-regeln.mjs` läuft über
`quellen` **ohne** `.test.`-Ausschluss (anders als die Prüfungen 1, 5 und 6).
Meine A2.3-Formulierung „Tests ausgenommen wie bisher" war schlicht falsch.
Und der Einwand, ein pauschaler `as unknown as`-Wächter würde vor allem Lärm
erzeugen, überzeugt mich: **A2.3 entfällt ersatzlos.**

**8. Befund 8 ist deutlich weniger schwer als behauptet.**
Belegt: `treeOps.ts:25-35` (`normalizeProps`) beginnt bei `def.defaultProps`
und übernimmt **nur dort bekannte Schlüssel** — im Kommentar wörtlich:
„Unbekannte Keys werden weiterhin verworfen." `persistence.sanitizeTree:111`
ruft das bei jedem Laden. Ein falscher Prop-Name kann also **nicht** unbemerkt
in den Export gelangen; er lebt höchstens bis zum nächsten Laden. A2 bleibt
sinnvoll (der Editor soll nicht raten), aber die Begründung „landet unbemerkt
im Export" war falsch.

**9. A3: der Rahmentausch verschiebt sichtbar Inhalte.**
Belegt: `PopupBlock` `.rumpf` hat `padding: 12px`, `display:flex`,
`align-items:flex-start`, `gap:10px`; `DialogRahmen` `.inhalt` hat nur
`flex:1 1 auto; min-height:0; overflow:auto`. Ohne Übernahme dieser
Innenabstände rutschen die Popup-Inhalte. A3 ist damit **nicht** optisch
neutral.

**10. Befund 12 war in der Tabelle falsch formuliert.**
Ein Import von `DIALOG_RAND` aus `blocks/shared/` durch `PopupSeite.tsx`
bleibt ein Editor→Baustein-Import und braucht die Ausnahme weiterhin. (Der
Paket-Text der ersten Fassung sagte das bereits richtig, die Befund-Tabelle
widersprach ihm.) Der Vorschlag, die gemeinsame Geometrie in eine **neutrale
Schicht** zu legen, ist besser als beides — dann verschwindet die Ausnahme
wirklich.

**11. A6 wird gestrichen.**
Belegt und überzeugend: `meldung.ts:31-33` setzt die Farben als
`var(--se-red-soft,#fbe7e6)` — **mit Hex-Rückfall**. Der Fehlerbalken ist
absichtlich so gebaut, dass er auch dann noch sichtbar ist, wenn die
Token-Schicht gar nicht geladen hat. Ihn zu einem Lit-Element zu machen würde
die Notfallanzeige an genau die Infrastruktur koppeln, die im Fehlerfall
kaputt sein kann. „Architektonische Reinheit" wäre hier ein Rückschritt für
den Bediener.
*Kleiner Zusatz unten unter „Teilweise".*

**12. Befund 17 ist eine Idee, kein bewiesener Fehler.**
Bewiesen ist die **Doppelung** (zwei Rahmen, zwei Tabellen). Die
Schlussfolgerung „also braucht es Systemseiten" ist ein Entwurfsvorschlag.
Wird entsprechend umetikettiert.

**13. Befund 22 war nicht belegbar.**
Aus dem Repo lässt sich nicht behaupten, es sei nie eine echte Maske
produktiv gelaufen. Belegbar ist nur: **es ist nicht dokumentiert.** Genau
darum P1.

**14. A5b: die Lebenszyklusfragen sind echt.**
Feld kopieren, Feld löschen, Feldtyp wechseln, mehrere Nachschlagefelder, wer
ist Quelle der Wahrheit, Verschachtelung — das ist mehr neue Komplexität, als
meine erste Fassung zugegeben hat. **Vertagt.**

**15. A7: die Kette bleibt beim Baustein.**
Der Einwand ist besser begründet als meine Fassung: Regel 7 („Bedienung am
Ding") sagt, die Interaktion gehört zu dem Ding, das sie auslöst. Die
Kommandozentrale bleibt für maskenweite Pflege. Das eigentliche Problem ist
**der Platz**, nicht der Ort.

**16. Reihenfolge: P3 vor die großen Runtime-Umbauten.**
Mit A1 als runtime-verändernd bekommt das ein zweites, stärkeres Argument als
meines: Ohne einen **belegten, aktuellen Ausgangszustand** („diese Maske lief
in SoftEngine ohne Handkorrektur, Commit X") ist nach A1 nicht unterscheidbar,
ob ein neuer Fehler vom Umbau kommt oder schon vorher da war.

**17. Designsprache: Editor und Maske sind getrennte Welten.**
CLAUDE.md sagt es ausdrücklich („nie mischen"). Der Indigo-Look des Editors
ist kein Fellnase-Verstoß. Übernommen als Rahmenbedingung für D1 und A7.

**18. Der Export löst zwei Downloads aus — gehört in den Plan.**
Steht bereits in CLAUDE.md als bekannter offener Punkt. Für einen Bediener,
der nicht programmieren kann, ist ein still verschluckter zweiter Download
gefährlicher als jede interne Architekturfrage: die Maske wäre unvollständig,
ohne dass es jemand merkt. → **neues Paket A8.**

**19. Kanban-Spaltenkopf: Doku und Code widersprechen sich.**
Nachgeprüft: `designsprache/musterbogen.html:461` zeigt
`<div class="spalte-kopf"><span class="spalte-titel">…</span><span class="zaehler zaehler--leise">…</span></div>`
— **Titel und Zähler, kein Punkt.** `KanbanSpalteBlock.ts` hat zusätzlich
Statusfarbe, farbige Unterkante und einen quadratischen Punkt (Kommentar
Zeile 145: „derselbe Punkt wie an der Status-Marke"). CLAUDE.md behauptet, die
Spalte passe schon („Punkt, Titel, Zähler"). Eines von beiden ist veraltet.
**Nicht zurückbauen** — klären, welche Entscheidung gilt, dann Code oder Doku
eindeutig machen. → D1.

## STIMME TEILWEISE ZU

**20. Befund 3 — Risiko statt Defekt: ja. Geringere Dringlichkeit: nein.**
Ich stimme der Tatsache zu (oben Punkt 6) und widerspreche der Folgerung. Die
Projektgeschichte hat genau diesen Fall schon einmal gehabt: der Tabellen-Bug
2026-07-24 entstand, weil die Regel „neuer Baustein = Zeile im Export-Test"
**nur im Kopf** existierte. Regel 4 ist eine Vorsorge-Regel; sie wird nicht
dadurch weniger wichtig, dass sie noch nicht ausgelöst hat. A1 behält seinen
Rang — nur eben mit SE-Echttest.

**21. Befund 4 — BasicBlock: meine Wortwahl war zu scharf, mein Plan war es nicht.**
„Trägt fast nichts" überzeichnet: geteilte `:host`-Styles, `editable` und
`inlineEdit` sind echtes gemeinsames Verhalten. Der **Plan** hat BasicBlock
allerdings von Anfang an behalten (~70 Zeilen) und nur die Metadaten
herausgelöst. Ich korrigiere den Analysetext, nicht die Maßnahme.

**22. A6 — streichen ja, aber ein Satz bleibt.**
Der Umbau entfällt. Was bleibt: die Unabhängigkeit des Fehlerbalkens ist heute
ein *Zufall der Umsetzung*, kein festgehaltener Beschluss. Ein
Kommentar-Zweizeiler in `meldung.ts` („bewusst ohne Lit und mit Hex-Rückfall,
damit die Notfallanzeige auch bei kaputter Token-/Render-Schicht sichtbar
bleibt — nicht 'aufräumen'") verhindert, dass ein künftiger Agent genau das
'aufräumt', was die zweite KI hier zu Recht verteidigt. Das ist reine
Dokumentation → wandert nach A0.

**23. Befund 23 / P4 — Deckel: Ergebnis gut, Begründung war schwach.**
`listenBindung` und `knotenStil` haben je einen erkennbaren eigenen Zweck; als
Beweis für „unsinnige Modulgrenzen" taugen sie nicht. Was bleibt: der im
Kommentar **festgehaltene Grund** ist eine Zeilenzahl, nicht eine Naht. Das
ist eine Beobachtung, kein Missstand. Meine Empfehlung war ohnehin „Deckel
behalten" — daran ändert sich nichts, der Befund wird abgestuft.

**24. Befund 20 — „die Wächter zeigen nach innen": zu absolut.**
Der Export-Referenzabzug, `check:runtime` und die Validator-/Preflight-Prüfung
zielen sehr wohl auf das Ausliefer-Ergebnis. Richtig bleibt der Kern: es fehlt
der **systematische Nachweis echter SoftEngine-Läufe**. Formulierung
entschärft, P1 bleibt unverändert wichtig.

**25. A7-Bedienungsvorschläge — gute Richtung, aber ungeprüft.**
Die konkreten Vorschläge (Kette links sichtbar, Schritt rechts bearbeiten,
Parameter als kleine Karte statt Einzeiler, Symbolknöpfe reduzieren,
Relationszeile eingeklappt, konkretere Verwendungsanzeige, präzisere
Löschwarnung) klingen durchweg plausibel. **Ich habe sie NICHT am Code
verifiziert** — insbesondere die Behauptung, das `X` habe heute zwei
verschiedene Bedeutungen („leer senden" vs. „Parameter löschen"). Sie stehen
unten als *zu prüfende Vorschläge*, nicht als Befunde.

## WIDERSPRECHE

**26. Befund 11 — „hier hätte Vererbung gefehlt" sei die falsche Schlussfolgerung.**
Hier liegt ein Missverständnis vor, dem ich in der Sache zustimme und in der
Zuschreibung widerspreche. Meine Aussage war eine **Ironie über die
Hierarchie**, kein Vorschlag: die Vererbung existiert dort, wo sie nichts
trägt (Metadaten), und fehlt dort, wo etwas Gemeinsames ist (der Rahmen). Der
**Plan** hat nie eine neue Vererbungshierarchie vorgeschlagen — A3 war von
Anfang an Komposition („PopupBlock *benutzt* DialogRahmen"). Insofern: in der
Sache einig, der Einwand trifft eine Formulierung, keine Maßnahme. Ich
schärfe den Text.

**27. Kein Widerspruch in der Sache — aber eine Ergänzung zur Reihenfolge.**
Die vorgeschlagene Reihenfolge setzt A2 vor P3. Ich ziehe **A0 und P1 ganz
nach vorn** und A2 hinter P3: A2 ist zwar harmlos, aber es ist eine
Code-Änderung ohne Dringlichkeit, und der wertvollste frühe Schritt ist der
belegte Ausgangszustand. Reihenfolge unten entsprechend.

---

## Alle Befunde — Fassung 2

| # | Befund | Stand nach Gegenprüfung | Paket |
|---|---|---|---|
| 1 | Kommentar `BlockDefinition.ts:356` falsch | bestätigt | A0 |
| 2 | Fähigkeit dreifach beschrieben | bestätigt | A1 |
| 3 | Stilles Loch bei vergessener Kopierzeile | **Risiko, kein aktueller Defekt** | A1 |
| 4 | Vererbung trägt wenig | **abgeschwächt**: für Fähigkeiten falscher Mechanismus | A1 |
| 5 | Toter Instanz-Vertrag `customProperties` | bestätigt | A1 |
| 6 | Wächter erkennt Bausteine per `blockType`-Regex | bestätigt | A1.4 |
| 7 | `Record<string, unknown>` verliert Prop-Typen | bestätigt, aber unvermeidlich an einer Grenze | A2 |
| 8 | Ungeprüfte Schreibnaht `useLitElement` | **abgeschwächt**: erreicht den Export nicht | A2 |
| 9 | Wächter zählt `any` statt `as unknown as` | **verworfen** (Lärm; Aussage war zudem falsch) | — |
| 10 | Zwei Fenster-Rahmen, zwei 24er | bestätigt | A3 |
| 11 | Hierarchie an der falschen Stelle | Formulierung, keine Maßnahme | A3 |
| 12 | Import-Ausnahme wird gegenstandslos | **falsch** — bleibt, außer neutrale Schicht | A3 |
| 13 | Zwei Layout-Modelle | bestätigt **+ verdeckter Rasterzustand** | A4 |
| 14 | Zwei Tabellen | bestätigt, „nur `zeilePasst`" war falsch | A5a |
| 15 | 19 × `createElement`, 10 × `cssText` | bestätigt | A5a |
| 16 | Feste 10 / 65-35 im Fenster | bestätigt — **Tabelle fällt aber auch auf 10 zurück** | A5a |
| 17 | Fehlendes Primitiv „Fläche + Rahmen" | **Entwurfsidee, kein Befund** | A5b (vertagt) |
| 18 | `cssText` in `bridge.ts`/`meldung.ts` | **verworfen** — bewusst unabhängig | A0 (Kommentar) |
| 19 | Relationen/Parameter historisch gewachsen | bestätigt | A7 |
| 20 | Wächter zeigen nach innen | **abgeschwächt** — es fehlt der SE-Nachweis | P1 |
| 21 | CLAUDE.md mischt drei Haltbarkeiten | bestätigt | P2 |
| 22 | Keine echte Maske end-to-end | **nicht belegbar** — nicht dokumentiert | P3 |
| 23 | 500-Zeilen-Deckel | **abgestuft** zur Beobachtung | P4 |
| 24 | Test-Sperre = bewusster Tausch | bestätigt | P5 |
| 25 | **NEU:** Export löst zwei Downloads aus | Bedienungsrisiko | A8 |
| 26 | **NEU:** Kanban-Kopf: Doku ≠ Musterbogen ≠ Code | Widerspruch klären | D1 |

---

# Teil 1 — Code

## A0 · Unwahre und fehlende Kommentare (erweitert)
**klein · keine Bytes · freigegeben**

1. `BlockDefinition.ts:356-357` — behauptet Raster im Popup-Rumpf. Richtig
   ist: der Zustand behandelt Popups bereits als Rasterflächen
   (`rasterOps.ts:25`), die **Ansicht** zeigt aber Fluss
   (`PopupSeite.tsx:110`). Beides benennen, mit Verweis auf die offene
   Entscheidung A4.
2. **Weitere veraltete Raster-Kommentare** systematisch suchen (die
   Gegenprüfung meldet mehrere; die erste Fassung hatte nur einen). Jeden
   entweder korrigieren oder mit Paketnamen versehen.
3. `DialogRahmen.ts:11-14` — Zusammenlegung mit Paketnamen A3 versehen.
4. **Neu:** `meldung.ts` — die bewusste Unabhängigkeit festhalten: kein Lit,
   Hex-Rückfall neben den Tokens, damit die Notfallanzeige auch bei kaputter
   Render-/Token-Schicht sichtbar bleibt. Ausdrücklich als „nicht aufräumen"
   markieren.
5. `exportMask.ts:127` („Popup-Innenfläche folgt in einer späteren Etappe")
   mit A4 verknüpfen.

**Prüfung:** Bündel. Keine Klickanleitung — reine Kommentare.

---

## A1 · Eine Fähigkeitsliste statt drei
**groß · ÄNDERT RUNTIME-BYTES · Genehmigung + SE-Echttest**

**Befund:** Jede Fähigkeit steht dreimal — `BlockComponent.ts` (21 optionale
Felder), `BlockDefinition.ts` (dieselben 21), Kopierzeile in
`BasicBlock.defineAndRegister` (`BasicBlock.ts:170-191`). Weil alle Felder
optional sind, compiliert eine vergessene Kopierzeile anstandslos; die
Fähigkeit wäre still tot. **Aktuell ist keine vergessen** (nachgezählt) — es
ist Vorsorge gegen genau den Fehlertyp, der 2026-07-24 schon einmal aufgetreten
ist.

**Warum es trotzdem den SE-Echttest braucht:** A1 fasst `BasicBlock` und alle
elf Bausteinklassen an. Die stecken im ausgelieferten Runtime-Bündel. Der
Referenzabzug schneidet das Bündel aus dem Byte-Vergleich heraus
(`referenzabzug.test.ts:40-45`) und kann grün bleiben, obwohl sich der
ausgelieferte Code geändert hat.

**Zielform:**

```ts
export class TextBlock extends BasicBlock { /* nur noch Rendern */ }

export const textDefinition = definiereBaustein({
  type: 'text', tagName: 'ff-text', displayName: 'Text',
  category: 'anzeige', defaultProps: { … }, bindableSpots: [ … ],
}, TextBlock)
```

**Anleitung:**

**A1.0 — Inventar VOR dem Umbau** *(neu, aus der Gegenprüfung)*
1. Alle direkten Zugriffe auf statische Bausteinfelder außerhalb der Klasse
   auflisten: `PopupBlock.tagName`, `XBlock.blockType`, `XBlock.defaultProps`,
   `TabelleBlock.listenBindung.prop`, `CardBlock`/`KanbanSpalteBlock` in
   `kanban/seRuntime.ts`, `PopupBlock` in `seAktionen.ts` usw. Jeder davon
   muss ein Ziel in der neuen Form haben, bevor irgendetwas umgestellt wird.
2. Auf **Import-Zyklen** achten: `definiereBaustein` in `core/blocks/` darf
   keinen Baustein importieren, und die Bausteine importieren die Registry.

**A1.1 — Die eine Liste bauen**
3. `src/core/blocks/definiereBaustein.ts` mit `definiereBaustein(def, Klasse)`:
   mischt die universellen Defaults (`FLOW_DEFAULTS`, `RASTER_DEFAULTS`,
   bedingt `QUELLEN_DEFAULTS`, `AUSWAHL_FOLGE_DEFAULTS`) unter `defaultProps`,
   registriert das Custom Element HMR-geschützt, ruft `registerBlockType`.
   Wörtlich der Rumpf von `defineAndRegister`, nur nimmt er ein **Objekt**
   entgegen. Die Kopierschicht entfällt.
4. Liegt in `core/blocks/` — Wächter-Regel 6 erlaubt generischem Code genau
   diesen Ordner.
5. `BindableSpotsFor`/`ActionValueSpotsFor` bleiben und greifen am
   Deklarationsort; `definiereBaustein` wird generisch über `defaultProps`.
   **Der gespeicherte, gemischte Baum braucht an einer Stelle weiterhin einen
   allgemeinen Property-Typ** — das ist keine Schwäche, sondern die Grenze
   zwischen statischer Deklaration und dynamischem Speicherstand.

**A1.2 — Bausteine umstellen** (11 Stück, einzeln)
6. Metadaten-Statics ins Definitionsobjekt; die Klasse behält `styles`,
   `@property`, `render`, Lebenszyklus, und erbt weiter von `BasicBlock`.
7. `BlockCategory` wird heute in `BlockComponent.ts` **definiert** und von
   `BlockDefinition.ts:14` nur weitergereicht. Beim Löschen von
   `BlockComponent.ts` muss die Definition nach `BlockDefinition.ts` umziehen,
   nicht bloß der Re-Export.

**A1.3 — Toten Code löschen**
8. `BlockComponent.ts` löschen (`BlockComponentStatic` wird gegenstandslos,
   `BlockComponent`/`customProperties`-Getter liest niemand — alle Leser gehen
   über `getBlockDefinition`).
9. In `BasicBlock`: `implements BlockComponent`, den Getter und
   `defineAndRegister` entfernen. **BasicBlock bleibt** mit geteilten
   `:host`-Styles, `editable` und `inlineEdit` — das ist echtes gemeinsames
   Verhalten.

**A1.4 — Wächter mitziehen**
10. `check-regeln.mjs` erkennt Bausteine per Regex auf
    `static readonly blockType` / `tagName` (Zeilen ~46-53). Danach fände er
    **null** Bausteine und schlüge über seine Selbstprüfung Alarm. Regex auf
    die Objektform umstellen. Prüfungen 2, 2b und 5 hängen an derselben Liste.

**A1.5 — Bündel neu bauen**
11. `npm run build:runtime`, danach `check:runtime`. Das neue
    `ff-runtime.js` gehört in denselben Commit.

**Prüfung:** Bündel. Der Referenzabzug muss grün bleiben — er beweist, dass
das **Markup** unverändert ist. Er beweist **nicht**, dass die Laufzeit
unverändert ist.
**Klickanleitung:** Alle elf Bausteine einfügen; Inspector-Felder je Baustein
gegen vorher vergleichen; Kanban „+ Spalte"/„+ Karte"; Popup-Reiter;
Nachschlage-Feld; alten Speicherstand laden.
**SE-Echttest (Nutzer):** die in P3 belegte Maske erneut exportieren und in
SoftEngine gegen den dort festgehaltenen Ausgangszustand vergleichen.

---

## A2 · Die Naht zwischen React und Lit (verkleinert)
**klein · keine Bytes · freigegeben**

**Befund, korrigiert:** `useLitElement.ts:112-115` schreibt Props blind aufs
Element. Ein falscher Name **erreicht den Export nicht** —
`normalizeProps` (`treeOps.ts:25-35`) verwirft unbekannte Schlüssel beim
Laden, der Export arbeitet auf dem normalisierten Baum. Was bleibt: innerhalb
einer Sitzung setzt der Editor stillschweigend etwas, das nichts tut.

**Anleitung (nur noch zwei Schritte):**
1. Nur Props schreiben, die die Definition über `defaultProps` kennt;
   unbekannte einmalig als `console.warn` melden statt still zu schreiben.
2. Den Doppel-Cast auflösen: benannter Typ
   `type BausteinElement = HTMLElement & Record<string, unknown>`, einmal bei
   `document.createElement` gesetzt.

**Gestrichen:** der ursprüngliche Punkt A2.3 (Wächter um `as unknown as`
erweitern). Begründung: nicht jeder Doppel-Cast ist gefährlich, ein pauschaler
Zähler erzeugt vor allem Lärm — und die Begründung der ersten Fassung („Tests
ausgenommen wie bisher") war zudem sachlich falsch: die `any`-Schleife des
Wächters zählt Testdateien mit.

**Prüfung:** Bündel, Referenzabzug grün.
**Klickanleitung:** Konsole offen, Bausteine einfügen, Eigenschaften ändern,
Inline-Edit — es darf **keine** neue Warnung erscheinen. Erscheint eine, ist
sie ein echter Fund und wird gemeldet, nicht weggedrückt.

---

## A3 · Ein Fenster-Rahmen
**mittel · ÄNDERT BYTES + INNENABSTÄNDE · Genehmigung + SE-Echttest**

**Befund:** `PopupBlock` und `DialogRahmen` bauen dasselbe Fenster zweimal,
mit zwei Konstanten `24`. Der `DialogRahmen`-Kommentar benennt sich selbst als
Ziel. **Der Umbau ist Komposition, keine neue Vererbung:** `PopupBlock`
*benutzt* `DialogRahmen`.

**Anleitung:**
1. `PopupBlock.render()` gibt `<ff-dialog-rahmen>` mit `titel`, `breite`,
   `hoehe` aus und legt seinen `<slot>` hinein.
2. **Innenabstände übernehmen** *(neu)*: `PopupBlock` `.rumpf` hat heute
   `padding:12px`, `display:flex`, `align-items:flex-start`, `gap:10px`;
   `DialogRahmen` `.inhalt` hat nichts davon. Ohne Übernahme rutschen die
   Inhalte sichtbar. Entweder als Variante am Dialog (`mit-innenabstand`) oder
   im Popup-eigenen Wrapper — **bewusst entscheiden, nicht nebenbei ändern.**
3. Inline-Umbenennen des Titels über `<slot name="titel">` erhalten.
4. X schließt im Editor weiterhin **nicht** (`data-ff-editor`-Prüfung bleibt
   beim Popup; der Dialog feuert nur sein Ereignis).
5. **Escape bewusst entscheiden** *(neu)*: `DialogRahmen` kann
   `escapeSchliesst`; das Popup hat das heute nicht. Übernehmen oder
   ausdrücklich auslassen — nicht durch den Umbau zufällig einführen.
6. **Geometrie in eine neutrale Schicht** *(neu, statt „Ausnahme entfällt")*:
   `POPUP_RAND`/`DIALOG_RAND` als **eine** Konstante nach `core/` legen. Nur
   so verschwindet die Wächter-Ausnahme für `PopupSeite.tsx` wirklich; ein
   Import aus `blocks/shared/` bliebe ein Editor→Baustein-Import.

**Prüfung:** Bündel; Referenzabzug wird sich ändern → `npx vitest run -u`, der
Datei-Diff zeigt die Maskenänderung im Commit. Bündel neu bauen.
**Klickanleitung:** Popup-Reiter → Fenster **und Innenabstände** gegen vorher
vergleichen (Screenshot vorher/nachher hilft) → Titel doppelklicken → Anfasser
ziehen, Doppelklick setzt zurück → X im Editor darf nichts tun → Escape prüfen.
**SE-Echttest (Nutzer):** Maske mit Popup, öffnen über Kette, schließen mit X.

---

## A4 · Popup-Rumpf: Raster oder Fluss
**BEDIENUNGSENTSCHEIDUNG ZUERST — kein Bauauftrag**

**Befund, korrigiert:** Sichtbar ist die Hauptseite Raster und der Popup-Rumpf
Fluss. **Der Zustand behandelt Popups aber bereits als Rasterflächen**
(`rasterOps.ts:25-27`), und die Migration vergibt Popup-Kindern bereits
Rasterkoordinaten (`migrations.ts:177-211`). Es können also **unsichtbare,
veraltete Koordinaten** existieren.

**Die erste Frage ist keine Codefrage:**

> Soll ein Popup vom Bauer genauso frei im Raster gestaltet werden können wie
> die Hauptseite — oder ist „Fenster = einfacher Fluss" das gewollte Verhalten?

- **Antwort JA** → Raster vereinheitlichen. Die Migration darf dann **nicht**
  nur fehlende Koordinaten ergänzen, sondern muss die Popup-Kinder nach ihrer
  **heute sichtbaren Reihenfolge neu stapeln** — sonst werden alte unsichtbare
  Koordinaten schlagartig sichtbar und Layouts springen.
- **Antwort NEIN** → Fluss wird zum ausdrücklich gewollten Verhalten erklärt,
  `istRasterFlaeche` und die Migration werden entsprechend korrigiert (heute
  sagen sie etwas anderes als die Ansicht), A0 hält es fest. Auch das ist
  Arbeit — nur weniger und ohne Layout-Sprünge.

**Empfehlung:** Diese Frage nach P3 beantworten. Wer die eine echte Maske
gebaut hat, weiß dann aus der Praxis, ob er im Fenster frei anordnen will.

---

## A5a · Nachschlage-Fenster aus vorhandenen Bauteilen
**groß · ÄNDERT BYTES · VORARBEIT NÖTIG · Genehmigung + SE-Echttest**

**Befund:** `nachschlagen.ts` baut mit 19 × `createElement` und 10 ×
`cssText` eine zweite Tabelle neben 2.477 Zeilen `blocks/tabelle/`. Geteilt
sind `zeilePasst` **und** `zeilenNachAuswahl` — mehr als in Fassung 1
behauptet, aber weit weniger als möglich.

**Richtung bestätigt, Weg korrigiert.** Der naive Weg („`<ff-tabelle>` in den
Dialog legen") funktioniert nicht. Diese Unterschiede müssen **vorher** gelöst
sein:

1. **Kein allgemeines „Zeile aktiviert"-Ereignis.** Die Tabelle gibt eine
   Auswahl ab; das Fenster braucht „dieser Satz, jetzt, und schließen".
2. **Keine Tastaturbedienung an Tabellenzeilen.** Das Fenster hat heute
   `tabIndex` + Enter (`nachschlagen.ts:372-390`). Ein Umbau ohne das wäre ein
   Bedienungs-Rückschritt.
3. **Toggle vs. Setzen.** `waehleAuswahl` schaltet dieselbe Zeile beim zweiten
   Klick ab (`auswahl.ts:115-123`); für die Übernahme existiert bereits
   `setzeAuswahl` ohne Toggle (Zeile 130). Der richtige Weg ist also da — er
   muss nur bewusst gewählt werden.
4. **Momentaufnahme vs. Live.** Das Fenster friert die Einträge beim Öffnen
   ein, damit ein Daten-Push dem Bediener nicht die Zeilen unter dem Finger
   verschiebt (`nachschlagen.ts:241-245`). Die Tabelle arbeitet live. **Diese
   Entscheidung nicht nebenbei ändern.**
5. **Die 10 verschwindet nicht von selbst.** `OHNE_MESSUNG = 10`
   (`seitengroesse.ts:49`): ohne gemessene Höhe fällt auch die Tabelle auf 10
   zurück. Im Dialog muss die Messung funktionieren.
6. **Spaltenarten entstehen nicht automatisch.** Die Felder einer Datenquelle
   liefern Code + Bezeichnung, keine Art (Zahl/Datum/Status).
7. **Doppelter Rahmen.** Tabellenrahmen im Dialograhmen kann optisch doppeln.
8. **Autofokus auf der Suche** muss erhalten bleiben.
9. **Spaltenbreiten** bewusst festlegen (heute fest 65/35).

**Neue Reihenfolge innerhalb A5a:**
- **A5a-1 (Vorarbeit):** einen kleinen, allgemeinen Tabellen-Vertrag schaffen
  — „Zeile aktiviert" mit Rückgabe der **Rohzeile**, Tastaturbedienung,
  eindeutige Auswahl. Das nützt der Tabelle unabhängig vom Nachschlagen und
  ist der einzige Teil, der neue Fähigkeit statt Umbau ist.
- **A5a-2:** das Fenster auf `<ff-dialog-rahmen>` + `<ff-tabelle>` umstellen,
  Punkte 4–9 einzeln entscheiden.

**Bleibt unangetastet:** die reinen Datenwege `nachschlagEintraege`,
`holeEintraege`, `einzigenTrefferFinden`, `satzPasstZurAuswahl`,
`folgeBeimVerlassen`.

**SE-Echttest (Nutzer):** echte Bestände, Folge-Filterung, > 100 Sätze,
Tastaturbedienung.

---

## A5b · Fenster als Systemseite
**VERTAGT**

Die Idee bleibt richtig gedacht, aber sie führt mehr Lebenszyklus-Komplexität
ein, als die erste Fassung zugegeben hat: Was passiert beim Kopieren eines
Feldes? Beim Löschen? Beim Feldtyp-Wechsel? Bei mehreren Nachschlagefeldern?
Wer ist Quelle der Wahrheit — Feld oder Seite? Wie werden ids verwaltet? Was
bei verschachtelten Dialogen (heute gilt „kein Popup im Popup")?

**Erst A5a sauber lösen. Danach nur bauen, wenn ein echter Bedienungsnutzen
übrig bleibt.**

---

## A6 · GESTRICHEN

Die verbliebenen imperativen DOM-Stellen sind **keine Architektur-Schuld**.
`meldung.ts:31-33` setzt seine Farben als `var(--se-red-soft,#fbe7e6)` — mit
Hex-Rückfall, damit die Notfallanzeige auch dann sichtbar ist, wenn die
Token-Schicht nicht geladen hat. Eine Fehleranzeige an genau die
Render-Infrastruktur zu koppeln, die im Fehlerfall kaputt sein kann, wäre ein
Rückschritt.

Was bleibt, ist ein Kommentar in A0, damit diese Unabhängigkeit als
**Entscheidung** dasteht und nicht von einem künftigen Agenten „aufgeräumt"
wird.

---

## A7 · Relationen und Parameter — eigene Bedienungsaufgabe
**ÄNDERT BEDIENUNG · kein Bauauftrag · Genehmigung nötig**

**Bestätigter Befund:** Dasselbe Thema wird an zwei Orten in zwei Formen
gezeigt — Relations-**Vorlagen** breit in der Kommandozentrale, die
**Schritte** in der ~340 px schmalen Inspector-Spalte, wo „Name | Quelle |
Wert" einzeilig mit gekürzten Werten und Tooltip untergebracht werden muss
(`ParameterZeile.tsx`). Die Zeile hat die Form ihres Behälters, nicht die
ihrer Aufgabe.

**Was NICHT geändert wird:** Die konkrete Aktionskette bleibt **beim
ausgewählten Baustein** (Regel 7 — die Interaktion gehört zu dem Ding, das sie
auslöst). Die Kommandozentrale bleibt für maskenweite Pflege. Das Problem ist
der **Platz**, nicht der Ort.

**Zu prüfende Vorschläge** — plausibel, aber von Claude **nicht am Code
verifiziert**; vor jeder Umsetzung gegen Designsprache und echten Arbeitsablauf
halten:

- Im Inspector: Ereignis + **kompakte Liste** der Schritte. Klick auf einen
  Schritt öffnet einen **breiteren Bereich**, in dem die ganze Kette links
  sichtbar bleibt und der gewählte Schritt rechts bearbeitet wird. Heute
  ersetzt `StepForm` den gesamten Inspector — der Zusammenhang zur Kette geht
  beim Bearbeiten verloren.
- Schrittzeile: fünf dauerhaft sichtbare Symbolknöpfe reduzieren. Klick auf
  die Zeile = bearbeiten; Verschieben über einen Griff; Kopieren/Löschen in
  ein Drei-Punkte-Menü.
- Parameter nicht in eine waagerechte Zeile pressen, sondern als kleine
  Karte: Feld-Position (darunter klein die technische Schreibweise), dann
  Quelle, dann Wert über die volle Breite.
- **Zu prüfen:** ob das `X` heute zwei Bedeutungen trägt — „vorhandenen
  Relationsparameter leer senden" und „frei hinzugefügten Parameter löschen".
  Wenn ja, ist das für einen Bediener mehrdeutig und gehört getrennt.
- Verständliche Bedeutungen aus `helfer.ts` anzeigen statt vorrangig roher
  Syntax; seltene Quellen unter „Weitere Quellen" gruppieren.
- Ist eine Relation gewählt, muss die Suchliste nicht offen bleiben:
  `Relation: Kunde laden · GET Nr. 4   [Ändern]`.
- Verwendungsanzeige konkreter und anklickbar:
  `Schaltfläche "Termin anlegen" → Klick → Schritt 3`.
- Löschwarnung präzisieren: statt pauschal „Schreibweg ruht" eher
  „Diese Relation wird in 3 Aktionsschritten verwendet. Nach dem Löschen sind
  diese Schritte unvollständig und müssen korrigiert werden." (GET und PUT
  verhalten sich nicht gleich.)
- SoftEngine-Syntax unter „Technische Details" einklappen.
- Einzelne `rounded-full`-Chips im Editor gegen die 4px-Radius-Regel prüfen
  (niedrige Priorität).

**Nächster Schritt:** eigener Analyse-Auftrag für diesen Bereich. Nichts davon
wird ohne Genehmigung gebaut.

---

## A8 · Der Export löst zwei Downloads aus  *(NEU)*
**ÄNDERT BEDIENUNG · Bedienungsentscheidung ZUERST**

**Befund:** Ein Export-Klick löst zwei Downloads unmittelbar nacheinander aus
(`index.basis.source.html` + `index.basis.SEvariablen.json`). Chromium fragt
dann nach Berechtigung; ein abgelehnter zweiter Download **verschwindet
still**. Das steht bereits in CLAUDE.md als bekannter offener Punkt.

**Warum das hoch gehört, nicht tief:** Für einen Bediener, der nicht
programmieren kann, ist das gefährlicher als jede interne Architekturfrage —
er kann glauben, der Export sei vollständig, während eine Datei fehlt. Alles
andere in diesem Plan ist Wartbarkeit; das hier ist ein möglicher stiller
Datenverlust am Ende der Werkbank.

**Nicht ungefragt eine ZIP bauen.** Zuerst die Benutzerführung festlegen —
eine ZIP könnte den gewohnten SoftEngine-Ablauf (zwei Dateien an zwei Orte)
verändern. Zu klärende Varianten, in der Reihenfolge der Eingriffstiefe:

1. **Nur Rückmeldung:** nach dem Export sichtbar anzeigen, welche zwei Dateien
   erzeugt wurden, mit je einem eigenen Knopf zum erneuten Laden. Ändert den
   Ablauf nicht, beseitigt aber das stille Verschwinden.
2. **Zwei bewusste Klicks** statt eines automatischen Doppel-Downloads.
3. **ZIP** — nur, wenn der Nutzer sagt, dass ihn das im SE-Ablauf nicht stört.

**Empfehlung:** Variante 1, weil sie nichts kaputt macht und das eigentliche
Problem (stiller Verlust) löst. Entscheidung liegt beim Nutzer.

---

## D1 · Designsprache — Abweichungen klären, nicht bauen  *(NEU)*
**klären · dann ggf. Genehmigung**

**Rahmenbedingung:** Editor-Oberfläche (shadcn, hell, Indigo) und Maskenwelt
(Fellnase, `--se-*`) sind laut CLAUDE.md **getrennte Designwelten** — „nie
mischen". Der Indigo-Look des Editors ist **kein** Fellnase-Verstoß.

**Bewusst und richtig (kein Handlungsbedarf):**
- Schriftgröße 13,5 statt 15 — laut Projektentscheidung absichtlich kompakter.
- Statusdarstellung und wesentliche Kartenstruktur treffen das Vorbild gut.

**Zu klären:**
1. **Kanban-Spaltenkopf.** Der eingecheckte Musterbogen zeigt
   `spalte-titel` + `zaehler` — **keinen Punkt**
   (`designsprache/musterbogen.html:461`). Der Code fügt Statusfarbe, farbige
   Unterkante und einen quadratischen Punkt hinzu (`KanbanSpalteBlock.ts:143`
   ff.). CLAUDE.md behauptet, die Spalte passe schon („Punkt, Titel, Zähler").
   Eines ist veraltet. **Nicht zurückbauen** — klären, welche Entscheidung
   gilt, dann Code **oder** Doku eindeutig machen.
2. Buttons und Formfelder haben teils kleinere Innenabstände als der
   Musterbogen — bewusst oder Drift?
3. Die Tabelle ist deutlich dichter als der Musterbogen — wenn gewollt, als
   bewusste Ausnahme festhalten.

---

# Teil 2 — Prozess

## P1 · SE-Nachweistabelle
**freigegeben · keine Code-Änderung**

`docs/softengine-wiki/` ist der Ordner, der den Doku-Schnitt überlebt hat,
weil er beweist statt zu erzählen. Er bekommt **eine** Datei: `echttests.md`.

| Datum | Commit | Maske | Plattform | Was geprüft | Ergebnis | ohne Handkorrektur? |
|---|---|---|---|---|---|---|

Die Spalte **Commit** ist der Kern (Ergänzung aus der Gegenprüfung): erst
damit ist „lief in SoftEngine" einer konkreten Codeversion zugeordnet — und
genau das braucht A1, um hinterher unterscheidbar zu machen, ob ein Fehler vom
Umbau kommt oder vorher schon da war.

---

## P2 · CLAUDE.md nach Haltbarkeit trennen
**Entscheidung offen**

Eine Datei, drei Haltbarkeiten: Verfassung (dauerhaft), Protokoll
(historisch), Statusbrett (schnell schal) — inklusive Widerrufen im
Fließtext. Vorschlag: Trennung **innerhalb** der Datei, keine neuen Dateien.

1. **Verfassung** — 10 Regeln, feste Zusagen, SE-Kontrakte. Ziel ~80 Zeilen.
2. **Entschieden und erledigt** — was wann warum rausflog.
3. **Woran gerade gearbeitet wird** — kurz, überschrieben statt ergänzt.

Dabei mit erledigen: die veralteten Aussagen, die die Gegenprüfung gefunden
hat (Kanban-Spaltenkopf, Popup-Raster).

Der Agent legt nur einen Vorschlag vor; die Verfassung schreibt der Nutzer.

---

## P3 · Eine echte Maske end-to-end — und der belegte Ausgangszustand
**Entscheidung offen · nach der Gegenprüfung AUFGEWERTET**

Belegbar ist nicht, dass nie eine echte Maske produktiv lief — belegbar ist,
dass **kein aktueller End-to-End-Nachweis dokumentiert** ist.

Das war in Fassung 1 „nice to have". Jetzt ist es **Voraussetzung für A1**:
Sobald der Runtime-Umbau läuft, ist ohne festgehaltenen Ausgangszustand nicht
mehr unterscheidbar, ob ein Fehler in SoftEngine vom Umbau kommt oder vorher
schon da war.

**Vorschlag:** eine Maske, die wirklich gebraucht wird — langweilig, klein,
vollständig — bauen, exportieren, in SoftEngine laufen lassen, Ergebnis in P1
eintragen (mit Commit). Dann erst die großen Umbauten.

---

## P4 · 500-Zeilen-Deckel
**Empfehlung: unverändert lassen**

Abgestuft zur Beobachtung: `listenBindung` und `knotenStil` haben je einen
erkennbaren eigenen Zweck; als Beweis für „unsinnige Modulgrenzen" taugen sie
nicht. Bemerkenswert bleibt nur, dass der **festgehaltene Grund** eine
Zeilenzahl ist. A1 verkleinert `BlockDefinition.ts` ohnehin.

Kein Wächter-Eingriff. Höchstens ein Satz in der Verfassung: „Eine Datei wird
an einer Naht geteilt, nicht am Zähler."

---

## P5 · Test-Sperre
**nichts zu tun**

Bewusster Tausch: keine Anzeige-Regressionen zu bemerken, dafür keine Token-
und Zeitfresser und keine Agenten, die sich auf grüne Ampeln verlassen statt
zu denken. Die Klickanleitung ist der vereinbarte Preis. Hier wird nichts
vorgeschlagen — die Regel ist ausdrücklich auch gegen Vorschläge gerichtet.

---

# Reihenfolge — Fassung 2

| Schritt | Paket | Warum hier |
|---|---|---|
| 1 | **A0** | Widersprüchliche Angaben zuerst weg — alles Weitere baut darauf auf |
| 2 | **P1** | Der Nachweisplatz muss existieren, bevor der erste Lauf stattfindet |
| 3 | **P3** | Belegter Ausgangszustand VOR jedem Runtime-Umbau |
| 4 | **P2** | Verfassung entrümpeln, veraltete Aussagen mit erledigen |
| 5 | **A2** | Klein, harmlos, keine Bytes |
| 6 | **A8** | Bedienungsentscheidung; das gefährlichste Alltagsproblem |
| 7 | **D1** | Klären (nicht bauen), damit A7 auf gesicherter Grundlage steht |
| 8 | **A1** | Der große Strukturgewinn — danach SE-Echttest |
| 9 | **A3** | Danach SE-Echttest |
| 10 | **A4** | Erst nach der Bedienungsentscheidung, mit korrigierter Migration |
| 11 | **A5a-1** | Tabellen-Vertrag als eigenständiger Gewinn |
| 12 | **A5a-2** | Fenster umstellen — danach SE-Echttest |
| 13 | **A7** | Eigene Bedienungsüberarbeitung, eigener Auftrag |
| — | A5b | vertagt |
| — | A6 | gestrichen |

---

# Offene Entscheidungen (Nutzer)

1. **A4** — Soll ein Popup frei im Raster gestaltbar sein wie die Hauptseite,
   oder ist „Fenster = einfacher Fluss" gewollt? *Empfehlung: nach P3
   entscheiden.*
2. **A8** — Welche der drei Varianten beim Export? *Empfehlung: Variante 1
   (sichtbare Rückmeldung), weil sie nichts am SE-Ablauf ändert.*
3. **D1** — Gilt beim Kanban-Spaltenkopf der Musterbogen oder der Code?
4. **A7** — eigener Analyse-Auftrag: ja/nein?
5. **P2** — CLAUDE.md dreiteilen: ja/nein?
6. **P3** — welche echte Maske zuerst?
7. **A5b** — bleibt vertagt, bis A5a läuft. Einverstanden?
