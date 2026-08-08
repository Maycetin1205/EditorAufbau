# Umbau-Plan

> **KI-generiert** (Claude, Modell claude-opus-5), Code-Stand `8c03dc5`.
> Fassung 3 vom 2026-08-08: geprüft von einer zweiten KI (Codex), danach
> überarbeitet, danach vom Nutzer entschieden. Die Buchstabencodes der
> Fassungen 1 und 2 sind raus — jedes Paket hat jetzt einen Namen.
>
> **Temporär.** Wird gelöscht, wenn die Pakete gebaut sind. Die Chronik steht
> dann in der git-Historie (Doku-Schnitt 2026-07-30).

---

## Worum es geht — in vier Sätzen

Die zehn Regeln des Projekts sind gut und werden eingehalten. Überkompliziert
ist nicht das Regelwerk, sondern das **Vokabular**: Der Editor beantwortet die
Frage „Was ist eine Fläche, auf der Dinge liegen?" viermal — Maskenfläche,
Popup, Dialograhmen, handgebautes Nachschlage-Fenster. Und die Frage „Was kann
ein Baustein?" dreimal, an drei Stellen im Code, die von Hand
zusammengehalten werden.

Beides sind **Zusammenlegungen, keine Neubauten.**

---

## Entschieden (Nutzer, 2026-08-08)

| Frage | Entscheidung |
|---|---|
| Export macht zwei Downloads | Sichtbare Meldung reicht. **Keine ZIP.** |
| Kanban | **Bleibt genau wie er ist.** Nicht anfassen. |
| Popup / Tabelle / Nachschlage-Fenster | **Werden ein Ding**, nicht drei verschiedene. |
| Karte, Proportionen | Vom Tisch. |

## Zurückgestellt — nicht vergessen, nur nicht jetzt

- **Drei Klicks bis zur Kanban-Karte.** Steckt in `selectionOps.ts:29-34`, ist
  eine bewusste Regel vom 23.07.2026 („erster Klick wählt immer das Board").
  Der Nutzer hat das angesprochen und dann entschieden, den Kanban vorerst
  nicht anzufassen. Liegt hier, falls er es zurückholen will.
- **Freies Anordnen im Popup.** Heute stapeln sich Bausteine im Popup
  untereinander, auf der Hauptseite lassen sie sich frei setzen. Angleichen
  ginge, verschiebt aber einmalig bestehende Popups. Offene Frage.
- **Nachschlage-Fenster als bearbeitbare Seite.** Die konsequenteste Fassung
  der Zusammenlegung. Vertagt, weil sie viele Folgefragen aufwirft (Feld
  kopieren, Feld löschen, Feldtyp wechseln, mehrere Felder, wer ist Quelle der
  Wahrheit). Erst die einfache Fassung bauen, dann sehen, ob noch ein Nutzen
  übrig bleibt.

## Gestrichen

- **Fehlerbalken und Diagnosefeld umbauen.** `meldung.ts` setzt seine Farben
  bewusst mit Hex-Rückfall (`var(--se-red-soft,#fbe7e6)`), damit die
  Notfallanzeige auch dann sichtbar ist, wenn die Designschicht gar nicht
  geladen hat. Eine Fehleranzeige an die Technik zu koppeln, die im Fehlerfall
  kaputt sein kann, wäre ein Rückschritt. Bleibt wie es ist — bekommt nur
  einen Kommentar, damit es niemand „aufräumt".

---

# Der Plan

Zehn Pakete. Jedes ist ein eigener Commit. Vorher laufen die Prüfungen,
hinterher gibt es eine Klickanleitung.

---

## 1. Wahrheit herstellen
**Du siehst nichts davon. Kostet Dich nichts.**

Im Code stehen Sätze, die nicht stimmen. Wer sie liest — Mensch oder Agent —
baut auf Falschem auf, und Du kannst es nicht prüfen.

- Die Registry behauptet, im Popup läge alles im Raster. Sichtbar ist Fluss.
- CLAUDE.md behauptet, der Kanban-Spaltenkopf entspreche der Design-Demo. Tut
  er nicht: die Demo zeigt Titel + Zähler, der Code zeigt zusätzlich einen
  Punkt und eine farbige Unterkante. **Der Code bleibt** (Deine Entscheidung) —
  also wird die Doku korrigiert, nicht der Kanban.
- Mehrere weitere veraltete Raster-Kommentare.
- Neu: ein Zweizeiler in `meldung.ts`, dass seine Eigenständigkeit Absicht ist.

## 2. Notizbuch für Deine SoftEngine-Tests
**Du siehst nichts davon. Kostet Dich eine Zeile pro Test.**

Eine Datei, `docs/softengine-wiki/echttests.md`, eine Tabelle:

| Datum | Commit | Maske | Plattform | Was geprüft | Ergebnis | ohne Handkorrektur? |

Warum: Heute hängt „lief in SoftEngine" an Deiner Erinnerung. Die Spalte
**Commit** ist der Kern — nur so ist ein bestandener Lauf einer bestimmten
Code-Version zugeordnet. Ohne das ist nach dem Umbau in Paket 9 nicht
unterscheidbar, ob ein Fehler vom Umbau kommt oder vorher schon da war.

## 3. Eine echte Maske belegen
**Deine Arbeit, nicht meine. Der wertvollste Schritt im ganzen Plan.**

Bau eine Maske, die Du wirklich brauchst — klein, langweilig, vollständig —
exportier sie, lass sie in SoftEngine laufen, trag das Ergebnis in Paket 2
ein.

Warum vor den großen Umbauten: Danach gibt es einen **belegten
Ausgangszustand**. Ohne den ist jeder spätere Fehler in SoftEngine nicht
zuzuordnen. Nebenbei beantworten sich die offenen SoftEngine-Fragen von selbst
(ERPAPICALL, MEMTAB, der Wertevertrag des Ankreuzfelds) — die Maske braucht
sie oder eben nicht.

## 4. Der Export sagt, was er getan hat
**Sichtbar. Kein SoftEngine-Test nötig.**

Heute: ein Klick, zwei Downloads hintereinander. Chrome fragt nach Erlaubnis,
und ein abgelehnter zweiter Download **verschwindet still**. Du hältst den
Export für fertig, obwohl eine Datei fehlt.

Danach: Nach dem Export steht sichtbar da, welche zwei Dateien erzeugt wurden,
mit je einem Knopf zum Nachladen. Keine ZIP (Deine Entscheidung), der
SoftEngine-Ablauf bleibt unverändert.

## 5. Die Naht zwischen Editor und Baustein prüfen lassen
**Du siehst nichts davon. Klein.**

Der Editor schreibt heute alle Einstellungen blind auf den Baustein. Ein
Schreibfehler im Namen wird stumm geschluckt und tut nichts.

*Halb so wild wie zuerst behauptet:* Beim Laden wirft der Editor unbekannte
Einstellungen ohnehin weg (`treeOps.ts:25-35`), in eine exportierte Maske kann
so etwas also nicht gelangen. Bleibt: der Editor soll nicht raten, sondern es
sagen.

Zwei Handgriffe: nur bekannte Einstellungen schreiben, unbekannte einmal in
der Konsole melden; und einen unsauberen Typ-Trick auflösen.

*Gestrichen gegenüber Fassung 2:* ein zusätzlicher Wächter dagegen. Er hätte
vor allem Lärm erzeugt, und meine Begründung dafür war sachlich falsch.

## 6. Ein Fenster-Rahmen statt zwei
**Sichtbar (Abstände). SoftEngine-Test nötig.**

Popup und Nachschlage-Fenster bauen heute dasselbe Fenster zweimal —
Abdunklung, Rahmen, Kopfzeile, Schließkreuz, sogar zweimal dieselbe Zahl 24
für den Randabstand. Künftig benutzt das Popup den Rahmen des anderen.

**Achtung, echte Falle:** Der Popup-Rumpf hat heute 12 px Innenabstand und
10 px Abstand zwischen den Bausteinen, der andere Rahmen hat das nicht. Wird
das nicht bewusst übernommen, **rutschen Deine Popup-Inhalte sichtbar**. Wird
einzeln geprüft.

Ebenso bewusst zu entscheiden: ob Escape das Popup künftig schließt (heute
nicht). Nicht nebenbei einführen.

Und: die gemeinsame Randzahl wandert in eine neutrale Schicht — sonst bleibt
eine Sonderregel im Wächter stehen, die es gar nicht mehr bräuchte.

## 7. Die Tabelle bekommt, was das Lupen-Fenster besser kann
**Sichtbar (neue Fähigkeit). SoftEngine-Test nötig.**

Das kleine Nachschlage-Fenster kann heute etwas, das die große Tabelle nicht
kann: Zeile mit Tab anspringen, mit Enter übernehmen. Und es wählt eindeutig
aus, während ein zweiter Klick in der Tabelle die Auswahl wieder aufhebt.

Bevor die beiden zusammengelegt werden, bekommt die Tabelle das: Zeile per
Tastatur wählen, Zeile eindeutig übernehmen, und dabei die ganze Datenzeile
herausgeben. Das nützt der Tabelle auch für sich allein.

## 8. Das Lupen-Fenster benutzt die echte Tabelle
**Sichtbar. SoftEngine-Test nötig.**

Heute: 424 Zeilen handgebaute Tabelle im Nachschlage-Fenster, daneben 2.477
Zeilen echte Tabelle, die alles besser kann. Danach: das Fenster ist der
gemeinsame Rahmen aus Paket 6 mit der echten Tabelle darin.

Was Du davon hast: Suche, Blättern, Fußzeile, Spaltenarten, und jede künftige
Verbesserung der Tabelle gilt automatisch auch im Lupen-Fenster.

**Sieben Dinge, die dabei einzeln entschieden werden müssen** — der naive Weg
funktioniert nicht:

1. Die feste Zahl 10 verschwindet **nicht** von selbst: die echte Tabelle
   fällt ohne Höhenmessung ebenfalls auf 10 Zeilen zurück
   (`seitengroesse.ts:49`). Die Messung muss im Fenster funktionieren.
2. Das Fenster friert seine Liste beim Öffnen ein, damit Dir neue Daten nicht
   mitten im Suchen die Zeilen verschieben. Die Tabelle arbeitet live. **Diese
   Entscheidung nicht nebenbei kippen.**
3. Spaltenarten (Zahl, Datum, Status) entstehen nicht automatisch — die
   Datenquelle liefert nur Code und Bezeichnung.
4. Tabellenrahmen im Fensterrahmen kann doppelt wirken.
5. Der Cursor muss weiterhin sofort im Suchfeld stehen.
6. Spaltenbreiten bewusst festlegen (heute fest 65/35).
7. Die geprüften Datenwege bleiben unangetastet.

## 9. Die Bausteinverwaltung aufräumen
**Du siehst nichts davon. SoftEngine-Test trotzdem nötig.**

Jede Fähigkeit eines Bausteins („nimmt Kinder auf", „kann an Daten gebunden
werden", „ist eine eigene Seite") steht heute **dreimal** im Code, an drei
Stellen, die von Hand gleichgehalten werden. Vergisst jemand die dritte,
compiliert alles anstandslos und die Fähigkeit ist **still tot**.

Nachgezählt: aktuell ist keine vergessen. Es ist Vorsorge — gegen genau den
Fehlertyp, der am 24.07.2026 schon einmal aufgetreten ist (umbenannte
Tabellenspalten fielen im Export still auf Standardtitel zurück).

Danach: eine Liste statt drei. Vergessen ist dann nicht mehr möglich, weil es
nichts mehr zum Vergessen gibt.

**Warum trotzdem ein SoftEngine-Test:** Der Byte-Vergleich, der sonst beweist,
dass ein Umbau nichts verändert hat, schneidet ausgerechnet den Teil heraus,
der hier angefasst wird (`referenzabzug.test.ts:40-45`). Er könnte grün
bleiben, obwohl sich der ausgelieferte Code geändert hat. Für sich genommen
ist das ungefährlich — der Umbau soll sich gleich verhalten und tut es
höchstwahrscheinlich auch. Es heißt nur: **es ist nicht beweisbar, also wird
es geprüft.**

## 10. Relationen und Parameter
**Sichtbar. Eigener Auftrag — hier ist nichts entschieden.**

Der Bereich, den Du hässlich findest. Bestätigt: dasselbe Thema wird an zwei
Orten in zwei Formen gezeigt — die Relations-Vorlagen breit in der Steuerung,
die Schritte, die sie benutzen, gequetscht in die schmale Inspector-Spalte,
wo „Name | Quelle | Wert" einzeilig mit gekürzten Werten und Tooltip
untergebracht werden muss.

Die Zeile hat die Form ihres Behälters, nicht die ihrer Aufgabe.

**Was NICHT geändert wird:** Die Aktionskette bleibt beim ausgewählten
Baustein (Regel 7 — die Bedienung gehört an das Ding, das sie auslöst). Die
Steuerung bleibt für maskenweite Pflege. Das Problem ist der **Platz**, nicht
der Ort.

**Vorschläge, ungeprüft, nur zur Entscheidung:** Kette links sichtbar lassen
und den gewählten Schritt rechts in einem breiteren Bereich bearbeiten (heute
verschwindet die Kette beim Bearbeiten) · Parameter als kleine Karte statt
Einzeiler · die fünf Symbolknöpfe je Zeile reduzieren · gewählte Relation
eingeklappt zeigen statt der offenen Suchliste · Verwendungsanzeige konkret und
anklickbar („Schaltfläche *Termin anlegen* → Klick → Schritt 3") ·
Löschwarnung präzisieren · technische Syntax einklappen.

Bevor da irgendwas gebaut wird: eigener Analyse-Auftrag, dann Deine
Entscheidung.

---

## Für den, der baut — die technischen Fundstellen

- Fähigkeiten dreifach: `core/blocks/BlockComponent.ts` ·
  `core/blocks/BlockDefinition.ts` · Kopierliste in
  `blocks/base/BasicBlock.ts:170-191`. Ziel: `definiereBaustein(def, Klasse)`
  in `core/blocks/`, Bausteine exportieren ein Definitionsobjekt. Vorher
  vollständig inventarisieren, welcher Code statische Felder direkt liest
  (`PopupBlock.tagName`, `TabelleBlock.listenBindung.prop`, `kanban/seRuntime`,
  `seAktionen` …). `BlockCategory` wird in `BlockComponent.ts` **definiert**,
  nicht nur weitergereicht — muss umziehen. Der Wächter erkennt Bausteine per
  Regex auf `static readonly blockType` (`check-regeln.mjs:46-53`) und muss
  mitziehen, sonst findet er null Bausteine. `BasicBlock` bleibt bestehen
  (geteilte Styles, `editable`, `inlineEdit`).
- Rahmen: `blocks/popup/PopupBlock.ts` (`POPUP_RAND`) und
  `blocks/shared/DialogRahmen.ts` (`DIALOG_RAND`). `.rumpf` vs. `.inhalt`
  vergleichen.
- Nachschlagen: `blocks/formfeld/nachschlagen.ts`, 19 × `createElement`,
  10 × `style.cssText`. Geteilt sind bereits `zeilePasst` **und**
  `zeilenNachAuswahl`.
- Auswahl: `blocks/shared/auswahl.ts` — `waehleAuswahl` (Toggle) vs.
  `setzeAuswahl` (ohne Toggle, existiert bereits für die Übernahme-Geste).
- Popup-Raster: `rasterOps.ts:25-27` und `migrations.ts:177-211` behandeln
  Popups **schon heute** als Rasterflächen, obwohl `PopupSeite.tsx:110` Fluss
  rendert. Es können unsichtbare, veraltete Koordinaten existieren — eine
  Migration darf nicht nur „fehlende ergänzen", sondern muss nach der heute
  sichtbaren Reihenfolge neu stapeln.

---

## Was ausdrücklich NICHT angefasst wird

Zwei Laufzeiten für eine Render-Quelle · Fähigkeiten als Registry-Einträge
statt Typweichen · die SoftEngine-Schicht, die nie einen Baustein kennt · kein
State-Framework · die getrennten Designwelten Editor (hell, Indigo) und Maske
(Fellnase) · der 500-Zeilen-Deckel · die Test-Sperre.

Und der Kanban.
