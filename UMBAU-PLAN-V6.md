# Umbau — Fassung 6 (eingedampft 2026-08-18)

**Diese Datei ist die einzige Uebergabe zwischen Chats.** Der Nutzer arbeitet
in mehreren Chats; ein neuer Chat weiss nichts vom vorherigen. Pflicht beim
Start: CLAUDE.md, dieser Abschnitt 0, `git log --oneline -10`.

**Eindampfung auf Nutzer-Ansage 2026-08-18** („nicht zig Dateien am Ende"):
alles GEBAUTE und die Langfassungen des Gestrichenen sind raus — die
Chronik steht ausschliesslich in der git-Historie (die Langfassung dieser
Datei, 4 260 Zeilen, liegt dort unmittelbar vor dem Eindampf-Commit).
Hier steht nur noch: was offen ist, was entschieden ist, was gesperrt ist.

Dieser Plan ist keine Erlaubnis, Code zu aendern. Es gilt: Ansage (0.2),
dann `go` (0.3), dann genau EINE Etappe.

---

## 0. Fuer einen neuen Chat — zuerst lesen

### 0.1 Wo wir stehen

<!-- Nach JEDER fertigen Etappe aktualisieren. Zeiger, keine Chronik. -->

**Stand 2026-08-21: Reinigung VOR Neubau (Nutzer-Ansage).**
Es wird nichts Neues gebaut, bis Welle R abgearbeitet ist -- „ich will keine
123239393 Baustellen gleichzeitig". Welle S, Welle U, F3 und E1/E2/E3 warten;
E1/E2 sind als R10 in die Reinigung eingereiht.

Grundlage ist eine Gesamtanalyse vom 2026-08-21 in drei Stufen:

1. eine Bauart-Analyse (Struktur, Waechter, Konfiguration, Repo);
2. **acht Pruefer, die diese Befunde zu WIDERLEGEN versuchten** -- drei davon
   erfolgreich (s. „Gekippt" am Ende der Welle R). Die Gegenpruefung war
   noetig und hat sich gelohnt: der Befund, den die erste Stufe fuer den
   sichersten hielt, war der schlechteste.
3. **zehn Pruefer, die die 89 % Code lasen, die Stufe 1 nur ueberflogen hatte**
   (`editor/`, `blocks/`, `softengine/`, `ui/`, `state/`, `core/`), plus eine
   Zusammenfuehrung, die jeden Fund an der genannten Zeile nachprueft:
   37 Funde, **keiner widerlegt**, 17 als Doppelnennung ausgesondert,
   20 bestaetigt.

**Stand 2026-08-21, nach einem Ausfall der echten Maske — bitte GENAU lesen,
hier war der Plan einen halben Tag lang falsch:**

R1 ging in SoftEngine kaputt. Danach wurde `src/` komplett auf `4ba15e8`
zurueckgesetzt (`f0beb48`) — damit fielen R1, R2, R3 und R4 gemeinsam weg,
auch die drei, die nichts damit zu tun hatten. Aus dem Ganzen ueberlebt hat
nur ein Fix, der im Plan nie stand: `535e6d8` (die Schluesselfelder einer
holenden Quelle bekommen ihren Feld-Vorsatz) — vom Nutzer in SoftEngine
bestaetigt, seine Belegpositionen laufen damit.

Danach zurueckgeholt, weil **null Export-Bytes** betroffen sind (`ff-runtime.js`
unveraendert, Referenzabzug gruen): **R4 vollstaendig** (`8ed3a95`, `2082fec`,
`3fbb9f7`, `eb6bb26`, `75d0311`) und **die Editor-Haelfte von R3** (`78b9c51`).
Diese sechs koennen die Maske nicht anfassen.

**Noch draussen, weil sie das Laufzeit-Buendel aendern und darum erst nach
einem SoftEngine-Echttest des Nutzers wieder hereindarf:**
`58e5c32` (R2) und `de0edd7` (R3, Kanban folgt der Auswahl). Beide liegen
fertig in der Historie, beide waren am Ausfall unbeteiligt.

**R1 kommt NICHT unveraendert zurueck** — Begruendung bei R1.

**Naechste Etappe: R6** (kleine Bedienfehler) oder R7/R8 (toter Code,
Doppelungen) — beides beruehrt `blocks/tabelle/` nur am Rand. R5 wartet,
solange der Nutzer an der Referenz-Tabelle entwirft.

**Regel, die dieser Ausfall erzwungen hat:** aendert eine Etappe eine Datei
unter `softengine/`, `blocks/*/seRuntime.ts`, `export/` oder das Buendel
`ff-runtime.js`, wird **nicht committet, bevor der Nutzer sie in SoftEngine
geprueft hat**. Vorher war die Reihenfolge umgekehrt, und genau das hat ihn
Stunden gekostet.
Die Tabellen-Pakete R5/R7/R8 beruehren `blocks/tabelle/`; der Nutzer
entwirft dort parallel eine Referenz-Tabelle (2026-08-21, ausserhalb des
Repos). Vor dem Anfassen dieser Dateien nachfragen.

**Was diese Analyse NICHT geprueft hat** (ehrliche Restluecke, Regel 9):
kein einziger Fund wurde im Browser oder in SoftEngine nachgestellt -- alle
Aussagen ueber „was der Bediener sieht" sind aus dem Code abgeleitet, nicht
beobachtet. Der Export wurde nur punktuell gelesen, nicht als Ganzes. Die
vier SoftEngine-Funde in R2 und der Kanban-Fund in R3 brauchen einen
Echttest des Nutzers.
### 0.2 Ansage-Pflicht vor jeder Etappe

Nutzer-Ansage 2026-08-10: **Vor dem Start einer Etappe wird angesagt, was
passiert — nicht danach berichtet.** Ohne diese Ansage kein Code. Die Ansage
steht im Chat, nicht in einer Datei, und hat genau fuenf Punkte:

1. **WAS** sich aendert — in einem Satz, ohne Dateinamen.
2. **WARUM** — welcher heutige Fehler damit verschwindet, mit der Stelle im
   Code als Beleg (`datei:zeile`), nicht als Behauptung.
3. **WO im sichtbaren Editor** — welcher Knopf, welcher Bereich, welches
   Fenster. Aendert sich nichts Sichtbares, steht dort ausdruecklich
   „nichts sichtbar" und warum die Etappe trotzdem noetig ist.
4. **WAS DU PRUEFST** — die Klickanleitung mit Soll-Ergebnis.
5. **WAS ICH NICHT PRUEFEN KANN** — Browser und SoftEngine macht der Nutzer.

Sagt der Nutzer danach `go`, wird genau diese Etappe gebaut und nichts
daneben. Findet der bauende Agent unterwegs etwas Groesseres, das die Ansage
falsch machen wuerde, haelt er an und sagt es — er baut es nicht mit.

### 0.3 Was `go` bedeutet

`go` gilt fuer **eine Etappe**, nicht fuer einen Block und nicht fuer den
Plan. Nach der Etappe: Pruefbuendel, Klickanleitung in den Chat, committen,
weiter. **KEINE Proben zwischendurch** (Nutzer-Ansage 2026-08-12): der
Nutzer testet EINMAL gebuendelt, wenn sich genug angesammelt hat, und
meldet nur Funde. Keine Etappe wartet auf eine Probe.

Commits bleiben klein (ein Thema, ein Commit) — das kostet den Nutzer
nichts, er liest sie nicht. Was ihn kostet, ist die Browserprobe: die wird
gebuendelt (s. 7.0).

---

## 1. Auftrag und Endziel

Der Editor wird nicht neu geschrieben. Der vorhandene Bau wird so
aufgeraeumt, dass neue Funktionen nicht mehr auf widerspruechlichen Regeln,
stillen Datenverlusten und mehrfach gepflegten Wahrheiten aufsetzen.

Der Umbau ist erst insgesamt fertig, wenn:

1. bekannte Datenverlustwege geschlossen sind;
2. Laden, Speichern, Migrieren, Duplizieren, Undo und Autosave belastbare
   Schutzgrenzen besitzen;
3. Hauptseite und Popup denselben zentralen Flaechenvertrag verwenden;
4. Popup eine echte frei bearbeitbare Rasterflaeche ist;
5. Popup und Nachschlagen denselben Fensterrahmen verwenden, aber nicht
   faelschlich dasselbe Datenmodell bekommen;
6. Nachschlagen die echte Tabellen-Darstellung komponiert statt eine zweite
   Scheintabelle zu pflegen;
7. Tabellenzeilen einen allgemeinen Aktivierungs- und Tastaturvertrag haben;
8. HTML und SEvariablen aus demselben bewusst erzeugten Exportstand geladen
   werden koennen;
9. Baustein-Faehigkeiten und Defaults nicht mehr an mehreren unabhaengigen
   Stellen auseinanderlaufen koennen;
10. ungueltige Property-Schreibvorgaenge an der zentralen Schreibnaht
    abgefangen werden;
11. der Besitz von Editor, Datenquellen und Relationen bewusst
    vereinheitlicht oder vom Nutzer ausdruecklich als verbleibende Grenze
    akzeptiert ist;
12. Relationen-/Aktionsbedienung und Designsprache nach den bestehenden
    Nutzerentscheidungen abgeglichen sind;
13. alle fuenf verbindlichen Code-Pruefungen gruen sind und die vom Nutzer
    durchgefuehrten Browser-/SoftEngine-Proben bestanden wurden;
14. keine ersetzte Altimplementierung parallel liegen bleibt.

Das Ziel ist kein theoretisch perfekter Code, sondern ein wartbares,
verlustsicheres Fundament fuer die naechsten Produktfunktionen.

---

## 2. Bereits entschiedene Leitlinien

Diese Punkte werden nicht erneut als Grundsatzfrage an den Nutzer
zurueckgegeben, solange er sie nicht selbst aendert:

- **Kein Komplett-Neubau.** Gute vorhandene Grenzen bleiben erhalten.
- **Kein neues State-Framework** (Redux/Zustand/MobX loesen nichts hiervon).
- **React bleibt Editor-Chrome, Lit/Web Components bleiben sichtbare
  Maskenbausteine und Runtime.**
- **Vererbung ist nicht das Hauptproblem.** `BasicBlock` darf gemeinsames
  Lit-Verhalten weiter vererben; Metadaten werden mit E2 kompositorisch aus
  einer Definition gelesen.
- **Popup ist Block und Seite/Flaeche zugleich.** Es bleibt im `BlockTree`;
  kein separater Popup- oder Surface-Store.
- **Nachschlagen ist kein Popup-Seitenknoten.** Es bleibt ein fluechtiger
  Laufzeitdialog (Begruendung: ein Popup weiss nicht, WER es geoeffnet hat).
- **Tabelle wird im Nachschlagen komponiert, nicht beerbt.**
- **`aus` bleibt ein gespeicherter Parameterzustand** und liefert an seiner
  Syntaxposition einen leeren String; keine sichtbare Quelle in Auswahlfeldern.
- **Popup-Runtime hat genau ein aktives Popup.** Kein Modal-Stack.
- **Popup-Namen sind nichtleer und eindeutig** (doppelter Name wird beim
  Anlegen hochgezaehlt).
- **`childIds` bleiben die logische DOM-/Tab-Reihenfolge** (oben-nach-unten,
  links-nach-rechts; bei Gleichstand stabil).
- **Ein Dialog hat genau einen Scroll-Owner.**
- **Keine neue Testgattung.** Bestehende Unit-, Export-, Persistenz-,
  Referenz- und Runtime-Pruefungen duerfen und muessen wachsen.
- **Browser- und SoftEngine-Proben macht der Nutzer.** Der Agent liefert die
  Klickanleitung und behauptet keine selbst durchgefuehrte Bedienpruefung.
- **Loeschen fragt nie nach — Undo ist das Netz** (U0-Antwort 3). Nur die
  zwei Bibliotheks-Rueckfragen im Datencenter („wird BENUTZT. Trotzdem
  loeschen?") bleiben vorerst.
- **Popup-Geometrie (gebauter Stand):** dasselbe 24-Spalten-Raster wie die
  Hauptseite; 520 px ist die STANDARDbreite, kein Zwang und keine
  Anhebe-Migration (vom Nutzer abgewaehlt — ein Popup mit 480 bleibt 480);
  12 px Innenabstand bleibt bis zum Designabgleich; der Rasterabstand kommt
  aus der einen gemeinsamen Rasterregel. Die bekannte Schwaeche des
  Verhaeltnis-Rasters im Fenster behandelt Etappe V6.

---

## 3. Harte Arbeits- und Sicherheitsregeln

### 3.1 Ein Thema, ein Commit

Jede Etappe ist eine eigene fachliche Aenderung. Zwei Dinge werden nicht
deshalb zusammengelegt, weil sie dieselbe Datei beruehren. Insbesondere
getrennt bleiben: verhaltensneutrale Dateischnitte und fachliche
Aenderungen; Registry-Umbau und Property-Validierung; Architektur und
Designpolitur.

### 3.2 Bestehende Arbeit gehoert dem Nutzer

- Nichts Vorhandenes wird verworfen, zurueckgesetzt oder still
  ueberschrieben; kein anonymer Stash als einzige Sicherung.
- Vor Arbeitsbeginn und vor jedem Push: `git fetch`. Ist origin voraus,
  erst dessen Stand ansehen und sauber zusammenfuehren. **Kein Force-Push.**
- Genau EIN federfuehrender Agent im Arbeitsbaum; Zweitmeinungen laufen
  nacheinander und read-only.

### 3.3 Verbindliches Pruefbuendel

Vor jedem Commit einmal gebuendelt:

```text
npx tsc -b
npx eslint src
npm run check:regeln
npm run check:runtime
npm test
```

Bei beabsichtigter Runtime-Aenderung: `npm run build:runtime`, Bundle-Diff
lesen, nur erklaerbare Bytes akzeptieren. Bei beabsichtigtem Exportwechsel:
Referenzabzug mit `npx vitest run -u` erneuern — der vollstaendige Diff ist
sichtbarer Teil des Commits, nichts wird „passend gemacht".

### 3.4 Ablauf je Etappe

0. Ansage nach 0.2, `go` abwarten.
1. Betroffene Pfade LESEN, genauen Schnitt nennen.
2. Nur die Etappe implementieren — nichts daneben.
3. Eigenes Code-Urteil: Datenfluss, Fehlerpfade, Cleanup, Export,
   Rueckwaertskompatibilitaet.
4. Bestehende Testarten um die konkreten Regressionen erweitern.
5. Pruefbuendel einmal gebuendelt.
6. Klickanleitung in den Chat (+ was nur in SoftEngine pruefbar ist).
7. Committen (vorher `git fetch`); die Nutzerprobe kommt gebuendelt (0.3).
8. Meldet die spaetere Probe einen Fehler: nur dieselbe Etappe korrigieren,
   Pruefbuendel erneut.

### 3.5 Sofortige Stopps

Nicht weiterbauen, wenn: Nutzerbestand ungesichert ist · der Arbeitsbaum
unerwartete fremde Aenderungen enthaelt · eine Pruefung ohne erklaerte
Ursache rot ist · ein Snapshot/Bundle ausserhalb der beabsichtigten Wirkung
kippt · eine Migration Knoten, Props, Ereignisse, Quellen oder Relationen
verliert · Editor und Export dieselbe Eigenschaft unterschiedlich
darstellen. Es wird nie mit „spaeter reparieren" ueber einen roten
Zwischenstand hinweg weitergebaut.

---

# Quellen-FORMEN — Beschluss 2026-08-17 (gilt fuer den U4-Entwurf)

**Anlass:** Der Nutzer hat 120+ echte SE-Masken ausgewertet. Der Editor kennt
sechs Quellen-Arten, SoftEngine rund ZWOELF Strukturen: VAR · SEFILELOOP ·
GET_RELATION · KENNZAHL (MIS) · TABELLE (IDs 48/84/931-934) · WINDOWLOOP
(LOOPFUNC) · REFRESH · WINDOW_VARIABLE · ERPAPICALL · ZGR · LANGTEXT
(TEXTDTK/IDB/JSD) · BERICHT/MASKE.

**Der Beschluss: NICHT sechs weitere Arten anbauen.** Zwoelf Strukturen sind
DREI Formen:

| Form | Was der Bediener davon hat | SE-Strukturen |
|---|---|---|
| **Einzelsatz** | Felder binden | VAR · WINDOW_VARIABLE · KENNZAHL · ZGR |
| **Liste** | Tabelle, Kanban, Nachschlagen | SEFILELOOP · WINDOWLOOP · TABELLE · REFRESH |
| **Nachschlagen** | Schritt in einer Kette | GET_RELATION · ERPAPICALL · LANGTEXT |

**UNGEPRUEFT (2026-08-17):** die Zuordnung ist aus der Nutzer-Tabelle
gelesen, nicht an echten Masken nachgemessen — am unsichersten KENNZAHL und
REFRESH. Vor dem Bauen an einer echten Maske pruefen (Regel 5). Am
Grundsatz „Form vor Art" aendert das nichts.

**Was ein ARTEN-Eintrag kuenftig tragen muss** (`core/data/quellenArten.ts`
ist bereits die Registry; die Eintraege sind zu duenn): 1. **Form**
(Einzelsatz | Liste | Nachschlagen — steuert die Oberflaeche) · 2.
**Lieferweg** (VAR / SEFILELOOP / ERPAPICALL — heute fest verdrahtet in
`export/sevariablen.ts`) · 3. **Feld-Schreibweise** (SEFILELOOP nackt
`2_8`, ERPAPICALL mit Vorsatz `ADR_2_8`) · 4. **Abholstelle zur Laufzeit**
(`SEDATA.Daten.SEFileLoop` vs. `.ErpApiCall.{ALIAS}.Zeilen[]`). Erst dann
ist „neue Struktur dazunehmen" wirklich EINE Zeile.

**ERPAPICALL — belegte Deklarations-Form** (aus den echten Vorlagen):
`{ "ID": "ADRESSE.GET", "ALIAS": "Adressen", "FELDER":
"ADR_2_8,ADR_20_30,ADR_1114_20", "VON_ADRNR": "10000", "BIS_ADRNR":
"69999" }`. Belegte IDs: ADRESSE/ARTIKEL/BELEG/LIEFERADRESSE/VERTRETER/
STUECKLISTEN/KOMPONENTEN/PROZESSE_AUFGABEN/WIEDERVORLAGE.GET, IDBSE0881.GET.
Kein BELEGPOSITION.GET — fuer Positionen bleibt Relation 69 der einzige
belegte Laufzeit-Weg.

**⚠ DEKLARIEREN ist nicht AUFRUFEN:** Der Eintrag in der SEvariablen.json
(SoftEngine liefert beim Laden) ist belegt und gemeint. Ein
Laufzeit-AUFRUF per `basisHTML_SND_MSG('ERPAPICALL', …)` **friert die
WinUI-Maske ein** — tabu, bis die ErpApiCall-Referenz der Installation
vorliegt. Wer das verwechselt, legt dem Nutzer die Maske lahm.

**Folge fuer den U4-Entwurf:** Das Formular fragt ZUERST die FORM („Ein
Satz? Eine Liste? Ein Nachschlagen?") und zeigt danach nur, was zu dieser
Form gehoert — nie eine Klappliste mit zwoelf Kuerzeln.

---

# Welle V — Befunde der Gesamtanalyse (eingeschoben 2026-08-18)

Quelle: Gesamtanalyse 2026-08-18 (zwei Lese-Trupps ueber Bedienschicht und
Bausteine + Kernlektuere). Der Nutzer hat den Befunden pauschal zugestimmt.
Sechs Funde sind bereits gefixt und gepusht (git-Historie 2026-08-18).
Die Etappen unten nennen ihre Fundstellen als Datei + ANKER (Funktions-/
Textstelle) statt Zeilennummern — Zeilen verschieben sich, Anker nicht:
der bauende Agent greppt den Anker und liest die Stelle, bevor er baut.

**Kopier-Auftrag fuer eine frische Bau-Sitzung (Opus) — der Nutzer fuegt
diesen Text woertlich ein; der Einwurf ist das go fuer so viele Etappen,
wie SAUBER in die Sitzung passen:**

```text
Lies CLAUDE.md, dann UMBAU-PLAN-V6.md: Abschnitt 0, Abschnitt 3 und die
Wellen-Koepfe V und G. Pruefe als Erstes `git fetch` + `git status`: ist der
Arbeitsbaum NICHT sauber, arbeitet dort eine andere Sitzung — dann STOPP
und sag es dem Nutzer, bevor du irgendetwas anfasst.

Den Etappentext liest du je Etappe DANN, wenn du bei ihr bist — nicht
alle auf Vorrat. Jede Etappe nennt ihre Fundstellen als Datei + Anker:
den Anker greppen, die Stelle LESEN, dann bauen. Steht an einer Etappe
„Runtime-Bytes aendern sich bewusst": nach dem Bau `npm run
build:runtime`, und schlaegt der Referenzabzug an, `npx vitest run -u` —
der komplette Diff von Buendel und Referenz gehoert erklaert in den
Commit. Steht es NICHT dran, muessen Buendel und Referenz byte-gleich
bleiben — aendern sie sich doch, hast du zu viel angefasst: STOPP.

Erste Etappe: G2.

Je Etappe, in dieser Reihenfolge und ohne Abkuerzung:
  1. kurze Ansage nach 0.2 in den Chat, VOR dem ersten Code
  2. bauen — nichts daneben
  3. Pruefbuendel (Abschnitt 3.3) komplett
  4. EIN Commit; im selben Commit den Zeiger 0.1 nachziehen und die
     Etappe im Plan als GEBAUT markieren (eine Zeile, keine Chronik)
Dann die naechste Etappe, wieder ab 1.

Aufhoeren: nach spaetestens VIER Etappen — und frueher, sobald du
nachlaesst: wenn du Dateien nur noch ueberfliegst statt sie zu lesen,
oder dir nicht mehr zutraust, deinen eigenen Diff zu beurteilen. Eine
Etappe wird NIE halb gebaut: passt sie nicht mehr ganz rein, fang sie
gar nicht erst an. Aufhoeren ist billiger als ein schlechter Commit.

Widerspricht dir der Plan oder der Code: STOPP und fragen, nicht raten.

Am Ende der Sitzung: `git fetch`, dann push auf den aktuellen Branch
(NIE force). Im Chat: EINE Klickanleitung nach Etappen gegliedert (was
oeffnen, was tun, was zu sehen sein muss) und was du NICHT pruefen
konntest. ALLERLETZTER Schritt: gib diesen Kopier-Auftrag WOERTLICH
wieder aus — mit der ersten noch nicht gebauten Etappe als „Erste
Etappe" und den gebauten aus der Reihenfolge gestrichen. Reihenfolge:
~~V1~~ -> ~~V0~~ -> ~~V3~~ -> ~~V4~~ -> ~~V5 (Stellen 1–5; 6–8 s.
Etappentext)~~ -> ~~V8~~ -> ~~V9~~ -> ~~V7~~ -> ~~G1~~ -> G2 -> G3 -> G4
Nach G4: sage dem Nutzer, dass V6 zuerst einen Kurzentwurf mit ihm im
Chat braucht (kein Kopier-Auftrag) und V6/E1/E3 die naechsten Kandidaten
sind.
```

## V2 · GEPARKT — Erfolgs-Meldungen (Nutzer-Ansage 2026-08-18: „muss
nicht sein")

Hier stand der Bau von gruenem Meldebalken + Meldungs-Schritt in Ketten
(„Beleg {1} angelegt"). Auf Nutzer-Ansage zurueckgestellt, bevor gebaut
wurde. Nicht von selbst wieder vorschlagen; die Skizze liegt in der
git-Historie dieser Datei (Stand 2026-08-18). Kommt nur wieder, wenn der
Nutzer selbst danach fragt.

## V6 · Popup: Groesser ziehen schafft Platz + Overlay-Bearbeitung

Zwei Etappen, ENTWURF VOR BAU (Kurzentwurf im Chat, Nutzer nickt):

- **V6a Fenster-Raster:** Das 24-Spalten-VERHAELTNIS-Raster ist auf der
  Maskenflaeche richtig (fuellt jeden Bildschirm), im Popup falsch: Breite
  ziehen zoomt die Bausteine (Spalten sind Anteile), Hoehe ziehen schafft
  Platz (Zeilen sind fixe 12 px) — Nutzer-Befund 2026-08-18 („total
  bescheuert", zu Recht). Zielbild: im FENSTER feste Spaltenbreite,
  Spaltenzahl folgt der Fensterbreite — groesser ziehen = mehr Zellen.
  Der Entwurf klaert: Klemmregel beim Schmalerziehen (Baustein ragt
  rechts raus), und dass `rasterFlaecheCss` die EINE Quelle bleibt
  (Parameter Flaeche/Fenster statt zweiter Regel — Editor UND Export
  lesen dieselbe Stelle, Regel 1). Export aendert sich bewusst; SE-Probe.
- **V6b Overlay „wie Canva"** (U0-Antwort 7, bestaetigt 2026-08-12, nie
  gebaut): das Popup wird ueber der abgedunkelten Hauptseite bearbeitet,
  genau wie es in der Maske erscheint; Zugang ueber eine Popups-Liste in
  der Werkzeugleiste und ueber die oeffnende Kette; X schliesst; der
  Seiten-Reiter fuer Popups faellt.

---

# Welle R — Reinigung (aufgenommen 2026-08-21, laeuft VOR allem anderen)

**Nutzer-Ansage 2026-08-21:** „Ich will alles komplett sauber, bevor wir
weiterbauen. Ich will keine 123239393 Baustellen gleichzeitig."
**Kein Neubau, bis diese Welle leer ist.** Ein Paket zur Zeit, fertig machen,
Pruefbuendel, Klickanleitung, naechstes. Nie zwei offen.

Herkunft der Funde: die dreistufige Gesamtanalyse aus 0.1. Jeder Fund unten
ist an der genannten `datei:zeile` nachgeprueft. Wer ein Paket baut, liest
die Stelle SELBST nach, bevor er anfasst -- diese Liste ist ein Zeiger,
kein Ersatz fuer das Lesen.

Reihenfolge nach NUTZEN, nicht nach Aufwand: erst was Daten kaputt macht
oder Sekunden bringt, dann was unsichtbar falsch ist, zuletzt Ordnung.

---

## R1 · Die Bestellung an SoftEngine (zuerst)

Drei Funde, eine Ursachenkette. Bringt als einziges Paket messbare Sekunden.

- **`core/data/dataSources.ts:89`** — `felderFor` springt bei allen Arten mit
  `felderEinzeln: true` aus der Funktion, BEVOR der Filter „nur die von der
  Maske benutzten Felder" laeuft. Das sind 7 von 8 Arten; nur `idb` nicht.
  Gemessen an der echten Maske des Nutzers (ein Tabellen-Baustein, acht
  Spalten): **81 Felder bestellt, 8 gezeigt.** Davon IDBID0001 mit 34 Feldern,
  an die die Maske ueberhaupt nicht bindet — die Quelle dient nur als
  Suchliste hinter einer Spalte.
  Folge: SoftEngine macht fuer jeden gelieferten Wert eines 25-Zeichen-Feldes
  einen Bild-Nachschlag (GET_RELATION 1911, s. S.0). Die drei im Log
  gemessenen Treiber `ART_1_25`, `IDB_110_25`, `IDB_55_25` werden alle drei
  bestellt und nirgends angezeigt.
- **Dieselbe Stelle** — das Satzschluessel-Feld (`indexField`) wird im
  `felderEinzeln`-Zweig NIE mitbestellt; es kommt erst in Zeile 95, die nie
  erreicht wird. Die Laufzeit liest daraus `{PINDEX}`
  (`blocks/tabelle/TabelleBlock.ts:266` ueber `satzIndexVon`) — die
  Satznummer, in die eine Kette schreibt. **Heute folgenlos**, weil die Maske
  des Nutzers noch keine Kette hat (`data-ff-aktionen` kommt im Export kein
  einziges Mal vor). Beim ersten „Zeile anklicken -> in den Beleg schreiben"
  ginge der PUT_RELATION ins Leere.
- **`editor/zentrale/DataSourceForm.tsx:155-157`** — jede neue Datenquelle
  bekommt hart `indexField: '0_10'`, unabhaengig von der Art. `0_10` ist der
  Satzschluessel einer IDB-Tabelle; Beleg braucht `0_11`, Belegposition
  `645_10`, Stammdaten gar keinen. Das Feld erscheint nirgends im Formular
  und ist danach nie mehr aenderbar. Daher stammt das `0_10` an der
  POS-Quelle des Nutzers.
  Loesung: Standard-Satzschluessel in die Arten-Tabelle
  (`core/data/quellenArten.ts`) aufnehmen, das Formular liest ihn von dort.

**ZURUECKGENOMMEN 2026-08-21 — dieser Bauauftrag ist so FALSCH.**
`12f4132` hat in der echten Maske des Nutzers die Belege verschwinden
lassen: die Feldliste der BEL-Quelle schrumpfte auf 3 von 7 Feldern, und im
ERPAPICALL stand ein nackter `0_10` ohne Vorsatz. Ursache ist nicht ein
Tippfehler in der Umsetzung, sondern die Annahme darunter: **der Editor
weiss NICHT verlaesslich, welche Felder eine Maske benutzt.** Er sieht die
Bindungen der Bausteine, aber nicht jede Verwendung in Ketten,
Verknuepfungs-Schluesseln, Nachschlage-Spalten und Hol-Relationen. Filtert
man auf diese unvollstaendige Menge, loescht man Felder, die in Benutzung
sind — und es faellt erst in SoftEngine auf, still, ohne Meldung.

Wer das wieder anfasst, baut ZUERST die vollstaendige Verwendungs-Erhebung
(eine Stelle, die JEDE Verwendung eines Feldcodes findet, mit Test je
Verwendungsart) und filtert erst danach. Ohne diesen Unterbau nicht
anfangen. Ueberlebt hat aus dieser Etappe nur `535e6d8` (Vorsatz an den
Schluesselfeldern) — der behebt einen echten Fehler und ist bestaetigt.
`7727f53` (Satzschluessel aus der Arten-Tabelle) ist harmlos, aber
mitgefallen; er darf nach einem SE-Test zurueck.

Die Messung von damals, zur Einordnung: gemessen an der
echten Maske des Nutzers: **81 -> 58 Felder** (POS 21->9, Artikelstamm
14->3). Die zwei IDB-Quellen bleiben bei 34 und 12, weil der Nutzer dort
„sucht in X" gesetzt hat, aber KEIN Suchfeld — dann weiss der Editor
nichts, und geraten wird nicht. Setzt er die Suchfelder (wie bei
Bezeichnung und Artikelnummer schon geschehen), fallen die beiden auf
je ~3. Daraus folgt ein eigener Punkt fuer R4: dass man „sucht in"
setzen kann, ohne ein Suchfeld zu waehlen, und nichts darauf hinweist,
ist ein Mangel der Bedienung — vom Nutzer selbst benannt.
Von den drei im Log gemessenen Bild-Nachschlag-Treibern verschwindet
damit noch KEINER: `ART_1_25` ist ein gewaehltes Suchfeld und muss
bleiben, `IDB_110_25` und `IDB_55_25` fallen unter „kein Wissen".

**Vor dem Commit war zugesagt:** dem Nutzer die neue SEvariablen seiner Maske Feld fuer
Feld gegen die alte legen. Erst wenn er sagt, dass nichts fehlt, wird
committet. **Risiko:** ein nur mittelbar gebrauchtes Feld (Suchfeld der
Automatik, Schluessel einer Verknuepfung) koennte durch den Filter fallen —
die Stellen `anzeigeSpalteIn` / `fensterSpaltenIn` vorher pruefen.
**SE-Echttest Pflicht.**

---

## R2 · Die SoftEngine-Schicht (hoechste Fehlerdichte)

`src/softengine/` — 851 Zeilen, die vor dem 2026-08-21 **noch nie jemand
gelesen hatte**. Vier bestaetigte Fehler, alle fuer den Nutzer unsichtbar,
weil diese Schicht ausschliesslich im ERP laeuft.

- **`relations.ts:50` (`scalar`) + `:210`** — antwortet SoftEngine mit einem
  leeren Wert (der voellig normale Fall „diese Nummer gibt es nicht"), wertet
  die Maske das als „keine Antwort". Der Auftrag laeuft in den
  6-Sekunden-Wecker, der Bediener bekommt „SoftEngine hat nicht geantwortet",
  obwohl SoftEngine sofort und richtig geantwortet hat. Weil immer nur EINE
  Frage gleichzeitig laufen darf, friert eine Kette mit drei solchen Fragen
  **18 Sekunden** ein. Dass leere Antworten echt vorkommen, belegt das Projekt
  selbst: der Positions-Lader erkennt genau daran das Ende der Liste.
  *Loesung:* „Antwort da, Wert leer" von „gar keine Antwort" unterscheiden.
- **`relations.ts:210` (mit `:40-43`)** — Frage und Antwort werden nirgends
  einander zugeordnet. Die Maske nimmt den ersten Wert, den die naechste
  beliebige Nachricht enthaelt. Laeuft Auftrag A in die Zeitueberschreitung
  und startet B, nimmt B die verspaetete Antwort auf A als seine eigene. In
  einer Kette „neue Satznummer holen, dann mit dieser Nummer schreiben"
  **schreibt der Schreibschritt danach in den FALSCHEN Satz.** Verschaerfend:
  die Liste akzeptierter Antwort-Schluessel enthaelt sehr allgemeine Namen
  (ID, KEY, INDEX, VALUE) — auch eine Statusmeldung des Interface kann einen
  laufenden Auftrag mit einem fremden Wert beenden.
  *Loesung:* jede Anfrage bekommt eine Kennung, die in der Antwort
  wiederauftaucht; der Horcher nimmt nur passende Antworten. Nach einer
  Zeitueberschreitung eine kurze Sperrzeit.
- **`relationLader.ts:86-116`** — bleibt eine Antwort aus, liefert `frage()`
  den leeren String. Im Lader IST der leere String die Ende-Kennung. Ein
  Beleg mit 40 Positionen, bei dem SoftEngine einmal nicht rechtzeitig
  antwortet, zeigt danach 6 Positionen. **Die dafuer eingebaute Warnung
  feuert genau dann nicht**, weil der Lader glaubt, das Ende sauber gesehen
  zu haben. Haengt am ersten Fund.
- **`data.ts:64` (`getField`) ueber `relations.ts:130`** — „Feld des
  Ergebnisses von Schritt N" (waehlbar in der Kommandozentrale,
  `ParameterZeile.tsx:101-109`) geht **immer leer hinaus**: die Stelle kennt
  nur die Schluessel SATZNEU/SATZ/RAW, die echte SoftEngine-Antwort heisst
  `RESULT`. Der gruene Test dazu benutzt eine erfundene Antwortform und deckt
  den echten Fall nicht ab.
  *Loesung:* wie im Positions-Lader den Text unter `RESULT` als Rohsatz
  einpacken — oder `RESULT` in die Liste der Rohsatz-Schluessel aufnehmen.
- **`core/data/relations.ts:144`** — `unknownPlaceholders` sucht mit
  `/\{([A-Z_]+)\}/g`, ersetzt wird zur Laufzeit aber mit
  `/\{([A-Za-z0-9_]+)\}/g`. Alles mit Ziffern oder Kleinbuchstaben rutscht
  durch die Pruefung und geht leer hinaus.

**GEBAUT und WIEDER DRAUSSEN** (Commit `58e5c32`): leeres RESULT gilt als
Antwort, der Lader unterscheidet Ende / keine Antwort / Deckel, und der
Rohsatz darf unter RESULT stehen. Der Commit ist am Ausfall von R1
unbeteiligt und fiel nur mit dem pauschalen Rueckschnitt `f0beb48`. Er
liegt fertig in der Historie und wird per `git cherry-pick -x 58e5c32`
zurueckgeholt — aber erst, wenn der Nutzer Zeit fuer einen SoftEngine-
Echttest hat, weil er `ff-runtime.js` aendert.

**OFFEN und eine ENTSCHEIDUNG, kein Bauauftrag: die Zuordnung von Frage
und Antwort** (`relations.ts:210`). Laeuft ein Auftrag in die
Zeitueberschreitung und startet der naechste, kann dessen Horcher die
verspaetete Antwort des ersten annehmen — in einer Kette „neue Satznummer
holen, dann mit dieser Nummer schreiben" schreibt der Schreibschritt dann
in den FALSCHEN Satz.
Eine Zuordnung braucht ein Merkmal, das die Antwort mitbringt. In keiner
belegten Antwortform steht eines: `{"RESULT":"…"}` traegt weder die
Relationsnummer noch eine Auftragskennung. Eines zu erfinden verbietet
Regel 5. Der erste Punkt entschaerft die Lage deutlich, weil damit die
haeufigste Ursache fuer Zeitueberschreitungen wegfaellt.
Zwei Wege, beide brauchen den Nutzer:
1. **Echttest:** in einem SE-Log nachsehen, ob die Antwort doch etwas
   mitfuehrt (Relationsnummer, Message-Nummer, laufende Nummer). Dann ist
   die Zuordnung eine kleine Aenderung.
2. **Entscheidung:** eine Kette bricht bei Zeitueberschreitung AB statt
   weiterzulaufen. Kostet nichts an SE-Wissen, aendert aber Verhalten —
   eine halb gelaufene Kette ist etwas anderes als eine mit falschen
   Werten weitergelaufene. Sicherer, aber sichtbar.
Nicht selbst entscheiden, nicht stillschweigend bauen.

**SE-Echttest Pflicht.**

---

## R3 · WYSIWYG-Brueche (Regel 1)

Vier Stellen, an denen Editor und Export/Laufzeit VERSCHIEDEN rechnen.

- **`editor/canvas/useLitElement.ts:113-123`** — der Editor rechnet die
  Bindungs-Vorschau selbst aus und sucht das Feld NUR unter den Quellen in
  Reichweite. Findet er es nicht, zeigt er „nicht gebunden" — der Export
  bindet es trotzdem.
  *Loesung:* im Editor dieselbe Funktion benutzen wie der Export
  (`feldKlarname` aus `core/data/dataSources.ts`).
- **`useLitElement.ts:120` gegen `export/bindungsVorschau.ts:6-10`** — der
  Editor ersetzt bei JEDER bindbaren Stelle den Anzeigewert durch den
  Feld-Klarnamen; der Export nur bei Stellen mit `vorschauProp`, und die hat
  allein das Formularfeld. **Karte (8 Stellen) und Text (1) zeigen im Editor
  etwas anderes als im Export.**
- **`blocks/kanban/seRuntime.ts:107`** (Ursache
  `blocks/shared/datenVorspann.ts:20`) — **„Folgt der Auswahl von …" hat beim
  Kanban-Brett ueberhaupt keine Wirkung.** Der Inspector bietet die
  Einstellung an, der Export schreibt sie, die Laufzeit filtert nie.
  *Loesung:* den Auswahl-Filter in den gemeinsamen Einstieg
  `holeDatenVorspann` ziehen; die Tabelle nimmt ihn von dort statt selbst zu
  filtern, das Kanban bekommt ihn geschenkt.
- **`blocks/navi/seRuntime.ts:35` mit `export/exportMask.ts:160`** — der
  Export haengt an JEDE Ansicht-Seite `hidden`. Es gibt genau EINE Stelle,
  die es wieder wegnimmt: die Navi-Laufzeit. **Ohne Navigation in der Maske
  ist eine zweite Seite in SoftEngine dauerhaft unsichtbar.**
  *Loesung (kleinster Eingriff):* nur verborgen exportieren, wenn es in der
  Maske ueberhaupt eine Navigation gibt.

**GEBAUT, halb wieder drin:** der Editor loest eine benannte Bindung in der
ganzen Bibliothek auf wie der Export (`78b9c51`) — zurueckgeholt, reiner
Editor, null Export-Bytes.
**Noch draussen:** das Kanban folgt der Auswahl (`de0edd7`; der Filter sitzt
dort im gemeinsamen Einstieg `holeDatenVorspann`, also bekaeme ihn auch
jeder kuenftige Datenbaustein). Aendert `ff-runtime.js` → zurueck per
`git cherry-pick -x de0edd7`, nach einem SE-Echttest des Nutzers.

**NICHT gebaut, beides eine ENTSCHEIDUNG des Nutzers:**

1. **Die `vorschauProp`-Asymmetrie** (Karte 8 Stellen, Text 1). Der Befund
   stimmt: der Editor ersetzt bei jeder bindbaren Stelle den Anzeigewert
   durch den Feld-Klarnamen, der Export nur bei Stellen mit `vorschauProp`.
   Sichtbar wird das aber NUR, solange keine Daten da sind — kommt eine
   Zeile, ueberschreibt die Laufzeit den Wert ohnehin. Die eigentliche
   Frage ist also: **was soll eine gebundene Stelle OHNE Daten in der
   fertigen Maske zeigen?** Den Klarnamen („Tiername" sieht aus wie ein
   Wert), den Standardtext („Karte"), einen Strich, oder nichts?
   Regel 7 sagt fuer den EDITOR „Striche statt Demo-Werte"; fuer die
   laufende Maske hat das nie jemand entschieden. Nicht selbst festlegen.

2. **Ansicht-Seite ohne Navigation.** Ich habe die Reparatur gebaut und
   wieder zurueckgenommen, weil sie es schlimmer gemacht haette: auf der
   Wurzel-Ebene liegen BEIDE — die normalen Bausteine (= Hauptseite) UND
   die Ansicht-Seiten. Ohne Seitenschalter alle Ansichten zu verstecken
   heisst also: man sieht die Hauptseite. Das ist richtig. „Die erste
   Ansicht sichtbar lassen" haette sie ueber die Hauptseite gelegt.
   Ein einziger Fall bleibt schief: eine Maske, die NUR aus Ansicht-Seiten
   besteht, ist in SoftEngine leer. Ob das eine Regel wert ist — und
   welche — ist eine Produktentscheidung. (Der Weg dorthin waere ein
   Registry-Merkmal `schaltetSeiten` am Navi, damit der Export nicht den
   Bausteintyp kennen muss; verworfen mit dem Rest.)

**SE-Echttest Pflicht** (Kanban).

---

## R4 · Datenquellen-Verwaltung

- **`editor/zentrale/RelationenBereich.tsx:51` (mit `:133-135`)** — die
  bearbeitete Relation wird aus der GEFILTERTEN Liste bestimmt, das Formular
  hat kein `key`. Relation A bearbeiten, dann Reiter wechseln oder ins
  Suchfeld tippen: A faellt aus der Liste, die Auswahl rutscht auf B, das
  Formular zeigt weiter A. **Speichern schreibt A-Daten auf B.** Alle Ketten,
  die B benutzen, zeigen danach auf eine Vorlage mit anderer Parameterzahl.
  *Loesung:* waehrend des Bearbeitens aus der VOLLEN Liste aufloesen,
  `key={auswahl.id}` ans Formular.
- **`DataSourceForm.tsx:76` (und `:133-137`)** — ein Feld-Vorsatz mit einem
  ungueltigen Zeichen (`LFA-`, `LFA.`, `L FA`) wird zu einem leeren String,
  und ALLE Feldcodes werden ohne Vorsatz gebaut. Der Nutzer sieht seinen Text
  weiter im Kasten. „Feld-Vorsatz" ist das einzige Eingabefeld des Formulars
  ohne Fehleranzeige.
- **`DataSourceForm.tsx:98`** — am Namen wird nur „nicht leer" geprueft. Der
  Name ist aber der SCHLUESSEL: der Export schreibt ihn als `ALIAS`, die
  Laufzeit sucht darueber die Zeilen (gross/klein egal). **Zwei Quellen
  gleichen Namens: die zweite zeigt die Daten der ersten.** Bemerkenswert:
  doppelte Feldcodes INNERHALB einer Quelle werden geprueft, doppelte
  Quellennamen nicht.
- **`editor/inspector/VerknuepfungenZone.tsx:53` (und `:130`)** — eine
  Verknuepfung loeschen bricht still eine zweite, die ueber „Haengt an" daran
  haengt; der Editor zeigt sie weiter als heil an.
- **`editor/inspector/DatenFenster.tsx:79`** — die Zone „Zeigt" rendert den
  Waehler „Datenquelle" immer, ohne zu fragen, ob der Baustein ueberhaupt
  eine eigene Quelle fuehren darf. Die Wahl verpufft spurlos.
- **`state/quellenOps.ts:37`** — zwei Stellen beantworten „wer benutzt diese
  Quelle?" und antworten VERSCHIEDEN: `nutztQuelle` uebersieht
  Tabellenspalten. Der Loesch-Hinweis bleibt aus, die Quelle wird ohne
  Warnung geloescht.

---

**GEBAUT 2026-08-21**, fuenf Commits (`8ed3a95`, `2082fec`, `3fbb9f7`,
`eb6bb26`, `75d0311`) — mit `f0beb48` mitgefallen, am selben Tag
zurueckgeholt. Reiner Editor, null Export-Bytes. Alle sechs Funde behoben. Dazu gekommen, weil
derselben Ursache: `DatenquellenBereich` bekam `key` und das Festhalten
der Auswahl mit, obwohl der Hauptfehler dort nicht greift.
**Offen geblieben und nach R8 verschoben:** `nutztQuelle` (state) und
`collectDataSources` (export) beantworten weiter zwei aehnliche Fragen an
zwei Stellen — absichtlich, weil sie sich im Punkt „unvollstaendige
Verknuepfung" unterscheiden muessen. Der Kommentar an der Stelle sagt es.
**Neu aufgenommen (Nutzer-Befund 2026-08-21):** man kann an einer
Tabellenspalte „sucht in <Hilfstabelle>" setzen, OHNE ein Suchfeld zu
waehlen. Dann weiss der Editor nicht, was er bestellen soll (s. R1), die
Vorschlagsliste bleibt leer, und nichts weist darauf hin. Was hier
richtig ist, ist eine Bedien-Entscheidung des Nutzers — Pflichtfeld?
Vorgabe? Hinweis? — nicht selbst festlegen.

## R5 · Erfassung und Nachschlagen

- **`blocks/formfeld/nachschlagen.ts:61` mit `inspector/PropControl.tsx:136-145`**
  — Quelle am Nachschlage-Feld wechseln raeumt „Gespeichert wird" weg, die am
  Ding eingestellten Fenster-Spalten aber nicht. Die Maske bestellt danach
  Felder, die es in der neuen Quelle nicht gibt.
  *Loesung:* in DERSELBEN Transaktion die Spaltenliste leeren, deren Quelle
  auf die gewechselte Eigenschaft zeigt — damit es EIN Undo-Schritt bleibt.
- **`blocks/tabelle/erfassungsAnschluss.ts:40`** — `erfassbareQuellen`/
  `satzVon` werten JEDE Spalte mit Feldbindung aus, auch eine reine
  Anzeige-Spalte aus einer Hilfstabelle. Dadurch meldet die Tabelle die
  Fremdquelle als „erfasst" und ein bestehender Schreibvorgang wird still
  leer. *Eine harmlose Anzeige-Spalte macht ein funktionierendes Schreiben
  kaputt.*
- **`blocks/formfeld/FormFeldBlock.ts:82`** — der bindbare Punkt `value` gibt
  `vorschauProp: 'placeholder'` an. Bei Text/Zahl/Datum ist das richtig; beim
  **Ankreuzfeld** ist `placeholder` der sichtbare Text daneben — der wird
  ueberschrieben. *Loesung:* den einen bindbaren Punkt in zwei aufteilen.
- **`blocks/tabelle/erfassungsBedienung.ts:133`** — in der letzten Zelle der
  letzten Zeile ruft `taste()` `preventDefault()` und springt dann nirgendwo
  hin: **mit Tab kommt man aus der Erfassung nicht mehr heraus.**
  *Loesung:* die Sprungfunktion melden lassen, ob sie gesprungen ist; bei Tab
  ohne Sprung den Browser sein Standardverhalten machen lassen.
- **`export/benutzteQuellen.ts:70`** — `nurBeiErfassung`
  (`core/blocks/listenBindung.ts:51`/`:97`) wird an genau EINER Stelle
  gelesen, dem Inspector. Erfassung ausschalten raeumt „Sucht beim Erfassen
  in" nicht ab; der Export bestellt die Hilfstabelle weiter.
- **`blocks/formfeld/nachschlagen.ts:367`** — der ausdrueckliche Wunsch
  „kein Rueckfokus" (`erfassungsBedienung.ts:61` uebergibt bewusst `null`)
  wird verschluckt.

---

## R6 · Kleine Bedienfehler

- **`editor/canvas/FieldPicker.tsx:115`** (Ursache
  `inspector/controls/eingabeSitzung.ts:38`) — `useEingabeSitzung` gibt bei
  JEDEM Rendern ein neues Objekt zurueck; beim Tippen eines Status-Klarnamens
  wird **jeder Buchstabe ein eigener Rueckgaengig-Schritt** und spuelt die
  Historie leer. *Loesung:* das Sitzungs-Objekt stabil merken.
- **`editor/canvas/zieheGroesse.ts:49`** — nach dem Ziehen an einem
  Groessen-Anfasser springt die Auswahl weg: `pointerdown` wird abgefangen,
  der folgende `click` nicht. *Loesung:* denselben Klick-Schlucker anhaengen
  wie beim Raster-Verschieben, aber nur wenn wirklich gezogen wurde.
- **`editor/sidebar/BlockPalette.tsx:54`** — auf einer Popup-Seite legt der
  Palette-Klick „Navigation" den Baustein unsichtbar auf der Hauptseite ab.
  Das Ausweichen war eine bewusste Entscheidung (`617c3b0`); es fehlt nur das
  Mitschalten. *Loesung:* beim Ausweichen auch auf die Hauptseite umschalten.
- **`ui/molecules/editor-fenster.tsx:24`** — jedes Fenster meldet einen
  eigenen Escape-Horcher an und haelt die Taste nicht auf: **Escape schliesst
  alle uebereinanderliegenden Fenster auf einmal** (Inspector -> Daten ->
  Feldwahl).
- **`inspector/controls/NumberControl.tsx:71`** (und zwei weitere Stellen) —
  `Historie.begin` legt sofort einen Schnappschuss an, auch wenn danach nichts
  geschrieben wird: **Anfassen ohne Aendern erzeugt leere Undo-Schritte.**
- **`editor/shell/Toolbar.tsx:30`** — die Loesch-Rueckfrage nennt
  Ansicht-Seiten faelschlich „Popup-Seite(n)". Es gibt zwei Seitenarten.

---

## R7 · Toter Code

**Stand 2026-08-21: der erste Teil ist gebaut** (Commit s. `git log`) —
alles, was den Export nicht anfasst: der Preflight und die zwei nie
benutzten Eigenschafts-Arten. `ff-runtime.js` blieb unveraendert.
**Offen und je ein eigenes Paket:**
- Alles unter `blocks/` und `softengine/` (Kanban-Kartenzaehler,
  `nachschlagen.ts:310`, `feldEigenschaften.ts:54`, die
  Tabellen-Fundstellen) aendert das Laufzeit-Buendel und damit die
  exportierte Datei → **erst nach einem SoftEngine-Echttest des Nutzers
  committen.**
- `core/data/dataSources.ts:69` (`istOffenerSatz` & Co.) bleibt liegen: das
  ist laut Fund selbst eine ENTSCHEIDUNG des Nutzers (fertig bauen oder
  gemeinsam entfernen), keine Aufraeumarbeit.
- Drei Funde der Liste sind widerlegt, s. unten.

Rund zwoelf Fundstellen. Kein Fehler, aber alles davon sieht aus wie
lebender Code und kostet bei jedem Umbau Lesezeit.

- ~~**`export/preflight.ts` (286 Zeilen) + `preflight.test.ts` (205)**~~
  **GELOESCHT 2026-08-21.** Kein Aufrufer im Produkt, nur Tests. Mit ihm
  fielen 17 Tests, die ausschliesslich ihn pruefen, und 12 einzelne
  Zusicherungen in fuenf Export-Tests. Auch die Eigenschafts-Arten
  `'textarea'` und `'relation'` sind weg (unten in dieser Liste) — sie waren
  vollstaendig verdrahtet und von keinem Baustein deklariert. Damit ist die
  Mini-Entscheidung „preflightMask loeschen oder behalten" aus CLAUDE.md
  beantwortet: geloescht, die git-Historie hat ihn.
- **`core/data/dataSources.ts:69`** — `istOffenerSatz`, `sanitizeDataSources`,
  `sanitizeRelationTemplates`: null Aufrufer. Dazu haengt ein halbfertiges
  Feature: `DataSource.lieferung` schreibt kein Formular je, und das
  Arten-Merkmal `varMoeglich` wird ausser in dieser einen toten Funktion
  nirgends gelesen. **Als Paket entscheiden:** fertig bauen oder gemeinsam
  entfernen (der `it.todo` in `datenquellen.test.ts` haengt daran, s.
  Sperrliste „Offener Satz per VAR").
- ~~`softengine/geholteZeilen.ts:12` — `setzeGeholteZeilenZurueck`~~ ·
  ~~`state/meldungen.ts:33` — `meldungen.leere()`~~ ·
  ~~`blocks/shared/auswahl.ts:104` — `beimAuswahlZuruecksetzen` /
  `setzeAuswahlZurueck`~~ — **diese drei Funde sind WIDERLEGT (2026-08-21,
  am Code nachgezaehlt).** „Nur Test" ist nicht dasselbe wie tot: alle drei
  setzen ein Modul-Singleton zurueck, damit Tests sich nicht gegenseitig
  vergiften (`meldungen.leere()` steht in VIER `beforeEach`).
  `beimAuswahlZuruecksetzen` wird ausserdem im Produkt benutzt
  (`blocks/shared/holendeQuellen.ts:77`) — der Fund war einfach falsch.
  Nicht anfassen.
- **`blocks/tabelle/erfassungsLauf.ts:419`** — `kopie()` hat keinen Aufrufer,
  **und fuenf Kommentare versprechen Zeilen-Werkzeuge, die es nicht gibt**
  (`erfassungsAnschluss.ts:58` „einzeln loeschbar und duplizierbar", `:74`).
- `blocks/tabelle/TabelleBlock.ts:237` — die Mechanik „Zeilen-Fokus merken und
  wiederherstellen" laeuft nie an.
- ~~`editor/inspector/PropControl.tsx:83` — die Eigenschafts-Arten `textarea`
  und `relation`~~ **GELOESCHT 2026-08-21**, mit `TextareaControl.tsx`, dem
  Relations-Waehler, den beiden Gliedern der `PropertyKind`-Union, der
  Einordnung in `Inspector.tsx` und der toten Haelfte von
  `treeQuery.relationIdsVon`.
- `blocks/kanban/KanbanSpalteBlock.ts:165` — der Kartenzaehler filtert nach
  `data-ff-editor-helper`, das an Karten nie gesetzt wird.
- `blocks/formfeld/nachschlagen.ts:310` — zweispaltiger Zweig unerreichbar,
  der Kommentar darueber beschreibt Verhalten, das es nicht mehr gibt.
- `blocks/formfeld/feldEigenschaften.ts:54` — tote Sichtbarkeits-Bedingung,
  und der Kommentar `:60-61` widerspricht seit 2026-08-20 der Bindungsregel
  daneben.
- **`blocks/tabelle/erfassungsZeile.ts:9`** — der Kopf-Kommentar beschreibt
  die Erfassungszeile genau falsch herum („die erste ist die Erfassungszeile,
  immer oben"). Seit dem Umbau vom 2026-08-20 gilt das Gegenteil, in Versalien
  nachzulesen in `erfassungsAnschluss.ts:60`.

---

## R8 · Doppelungen

- **`blocks/shared/DialogRahmen.ts:176` gegen `editor/canvas/zieheGroesse.ts:22-59`**
  — zwei vollstaendige Zieh-Mechaniken fuer dieselbe Geste, obwohl CLAUDE.md
  `zieheGroesse` ausdruecklich „die EINE" nennt. *Weg:* der Baustein darf den
  React-Code nicht rufen, also meldet `DialogRahmen` die Groesse per Ereignis
  und der Editor speichert nur.
- **`editor/canvas/PopupSeite.tsx:15`** — `POPUP_MIN_BREITE`/`POPUP_MIN_HOEHE`
  neben `DIALOG_MIN_BREITE`/`DIALOG_MIN_HOEHE` (`DialogRahmen.ts:26/27`),
  gleiche Werte. **Exakt der Fehler, der bei `DIALOG_RAND` in C1 schon einmal
  behoben wurde.**
- `editor/inspector/optionColors.ts:7` — wortgleiche Kopie von `FARBEN` in
  `blocks/text/TextBlock.ts:19-26` (und `:2-5` spiegelt
  `blocks/shared/statusVariant.ts:67-74`).
- `core/data/auswahlFolge.ts:30` — zeilengleich mit
  `core/data/sourceLinks.ts:57-63` plus Deckelung; die Datei importiert
  ohnehin schon aus sourceLinks.
- `editor/zentrale/DatenquellenBereich.tsx:196` — zeichengleich mit
  `RelationenBereich.tsx:176-188` (Block „Verwendung in dieser Maske" samt
  Knopfzeile).
- `state/useDataSources.ts` / `useRelations.ts` / `useMeldungen.ts` — drei
  Dateien a zehn Zeilen, Unterschied nur der Store-Name. Der Store-Vertrag
  ist bereits einheitlich (`state/Subject.ts`).
- `blocks/shared/vorschlagListe.ts:119` — die Klapprichtung wird zweimal
  gerechnet, eine Rechnung ist wirkungslos.

---

## R9 · Regel 2 — generischer Code kennt einen Baustein

Beides rutscht durch `check:regeln`, weil der Waechter nur `===`, `!==`,
`.includes()` auf Typnamen und Importpfade prueft.

- **`editor/canvas/PopupSeite.tsx:53`** — liegt im generischen Canvas-Code
  (`Canvas.tsx:115` entscheidet nur ueber `istFlaeche`), kennt aber die
  Eigenschaftsnamen `breite`/`hoehe` des Popup-Bausteins auswendig und
  schreibt sie direkt. *Weg:* der Baustein kann es selbst — `DialogRahmen`
  hat bereits `ziehbar` + `DIALOG_GROESSE_EVENT`, das Nachschlage-Fenster
  benutzt genau das.
- **`core/blocks/bausteinName.ts:7`** — `TEXT_PROPS = ['label','heading',
  'title','text','placeholder']`: generischer Code, der die Prop-Namen
  einzelner Bausteine auswendig kennt. `title` gehoert zu keinem Baustein.
  *Weg:* ein Merkmal `nameProp` in der `BlockDefinition`, das jeder Baustein
  selbst deklariert.

**GEBAUT 2026-08-21** (`6892123`), beides. **Abweichung vom Bauauftrag, mit
Grund:** die Merkmale liegen nicht in der `BlockDefinition`/am Lit-Baustein,
sondern in `EditorAngaben` (`core/blocks/editorAngaben.ts`, je Baustein
angemeldet aus `blocks/<baustein>/editorAngaben.ts`). Statische Felder am
Lit-Baustein reisen im Runtime-Buendel mit und kosten JEDE exportierte Maske
Bytes fuer Wissen, das nur der Editor braucht — und sie haetten den Export
veraendert, also einen SE-Echttest erzwungen. So bleibt `ff-runtime.js`
unveraendert. Der Kanal ist derselbe, den Palette-Symbol und Inspector-Hinweis
schon benutzen. Preis, ehrlich benannt: er muss geladen werden (im Produkt tut
das `main.tsx`); ein Test, der ihn vergisst, sieht nur den Art-Namen — genau
das ist in `preflight.test.ts` passiert und dort mit einer Import-Zeile
behoben.

Beim Zweiten fiel eine Doppelung mit: die Popup-Mindestmasse standen im
Canvas ein zweites Mal neben denen des Dialog-Rahmens. Sie kommen jetzt von
dort.

---

## R10 · Registry — Faehigkeiten und Defaults (= die alte Welle E)

Inhaltlich identisch mit E1/E2/E3 weiter unten; hier steht, was die
Gesamtanalyse ergaenzt hat.

- **Dreifach-Deklaration, empirisch bewiesen:** das Literal in
  `registerBlockType({…})` hat 31 Felder, `BlockComponentStatic` 31,
  `BlockDefinition` 31. Ein Pruefer hat testweise die Zeile
  `addChildButton: BlockClass.addChildButton,` geloescht und danach
  `tsc -b`, `eslint`, `check:regeln` und alle 649 Tests laufen lassen:
  **alles gruen, die Faehigkeit war weg.** 9 der 31 Felder sind in
  `BlockDefinition` Pflicht und wuerden auffallen; **22 verschwinden still.**
- **Doppelte Standardwerte — kleiner als zunaechst angenommen.** Ein Pruefer
  hat alle 15 Bausteine Feld fuer Feld verglichen: **keine einzige
  Abweichung heute.** 4 von 15 haben gar keine Doppelung (Ansicht, Datum,
  Navi, Kanban); 7 der doppelten Paare sind an beiden Stellen dieselbe
  importierte Konstante und koennen strukturell nicht driften. Driftbar sind
  **rund 18 wiederholte Literale** ('Klick mich', 'Feldname', 'ja'/'nein',
  520, 380, 'normal', 'links' …).
  Der Mechanismus dahinter ist trotzdem echt: `export/exportMask.ts:138`
  laesst ein Attribut weg, sobald es dem Registry-Standard gleicht, und das
  Element faellt dann auf sein Lit-Klassenfeld zurueck. Es gibt keinen
  Waechter und keinen Typ-Zwang dagegen.

---

## R11 · Ballast

- **Tests radikal ausduennen (Nutzer-Ansage 2026-08-21 „radikaler"):**
  rund **3 900 von 9 084 Zeilen** raus — alles, was der Nutzer im Browser
  selbst sieht (Sortierung, Suche, Seitengroesse, Vorschlagsliste,
  Tierbilder, Auswahl, Duplizieren, Transaktion, Auswahl-Ops, Meldungen,
  Felduebernahme, Bausteinname, Bindung, Tagfilter, holende/fremde Quellen,
  Erfassungs-Messlatte) plus der tote Preflight-Test.
  **Bleibt (~5 200 Zeilen), und zwar genau das, was er NIE sehen kann:**
  `export/` (die Bytes nach SoftEngine) · Speicherung und Migrationen (dass
  seine Arbeit einen Neustart ueberlebt) · `softengine/` und die
  `seRuntime`/`seAktionen` (der ERP-Vertrag).
  **Waechter:** `check:runtime` bleibt ganz. Von `check:regeln` bleiben
  Zeichen-Pruefung, Buendel-Positivliste und Referenzabzug-Pflicht; die
  Architektur-Polizei faellt (~200 von 378 Zeilen).
- **Die Schrift, 27 KB, bedingungslos** — `export/exportMask.ts:216` bettet
  `masken-schriften.css` in JEDE Maske ein, egal was sie zeigt. Das sind 12 %
  jeder Maske und **mehr Ersparnis als die ganze Buendel-Aufteilung** (R12),
  ohne deren Risiko. Die Tierbilder sind denselben Weg schon gegangen
  (`4ba15e8`).
- **`docs/Test-note.png`, 42 MB**, eingecheckt. Datei raus, `.gitignore` rein.
  **Historie NICHT umschreiben** — Force-Push ist gesperrt (3.2).
- **Browser-Ziel festschreiben** — `vite.runtime.config.ts` setzt kein
  `build.target`. Es gilt, was Vite zufaellig als Standard hat. Laeuft heute,
  ist aber Zufall statt Entscheidung: aendert Vite den Standard, aendert sich
  der Export ohne Zutun. **Braucht eine Auskunft des Nutzers**, welche
  Browser-Grundlage SoftEngine einbettet — nicht raten.

---

## R12 · Zuletzt

- **Zyklus `blocks/tabelle` <-> `blocks/formfeld/nachschlagen`.** Existiert
  mit Wert-Importen in beide Richtungen, ist aber **nachweislich harmlos**:
  kein zyklisches Symbol wird zur Modul-Auswertungszeit gelesen, und die
  zurueckimportierten Namen sind Funktionsdeklarationen, koennen also nicht
  `undefined` sein. **Wird erst scharf, wenn jemand das Buendel in Stuecke
  schneidet** — Zyklen ueber Stueck-Grenzen sind genau die Stelle, an der
  Buendler eine kaputte Startreihenfolge erzeugen.
  Wer ihn aufloest, braucht ZWEI Schritte: die Konstante `'ff-tabelle'` in ein
  zyklusfreies Modul legen UND den Klassen-Import auf `import type`
  umstellen (der TYP wird fuer `querySelector`/`.updateComplete`/
  `.fokussiereSuche` weiter gebraucht). Dazu die beiden hart getippten
  `<ff-tabelle>` in `nachschlagen.ts:314/416` auf dieselbe Konstante ziehen.
- **Buendel pro Maske schneiden.** 83 % jeder Maske sind Code fuer alle 15
  Bausteine. Der Kostenvorbehalt stimmt: was ein Register herausgibt, kann
  der Buendler nicht mehr wegwerfen — realistisch bleiben 35-45 KB von 163.
  **Das ist Ordnung, kein Tempo** (40 KB sparen Hundertstelsekunden). Nur
  NACH dem Zyklus und NACH der Schrift.
- **A10 / B2 — Besitz der Bibliotheken.** Editor = Instanz ueber Provider,
  Bibliotheken = Modul-Singletons. Der Zusatz „das truegt in Tests" ist
  **widerlegt**: es sind bewusst verschiedene Lebensdauern (die Bibliotheken
  sollen eine Maskenuebernahme ueberleben). Bleibt reine Struktur, grosser
  Aufwand, kein spuerbarer Gewinn. Der Nutzer will es trotzdem — zuletzt.
- **Ein Haken vor dem Commit**, der das BESTEHENDE Pruefbuendel faehrt.
  Keine neuen Tests, keine neue Testart. Heute prueft nur, wer daran denkt.
- **Ein Wort pro Begriff:** Baustein, Quelle, **Schritt**. Nicht umbenennen —
  wer eine Datei ohnehin anfasst, zieht sie mit. Gemessen: Block/Baustein
  15:282 (erledigt), DataSource/Quelle 269:802, **Step/Schritt 98:76** (nur
  hier aendert eine Ansage etwas).
- **Kleine Paket-Updates.** 0 Sicherheitsluecken. TypeScript 7 und
  Tailwind 4 **bleiben liegen** — grosse Spruenge ohne Gegenwert.

---

## Gekippt — nicht wieder aufnehmen

Drei Befunde der ersten Analysestufe hat die Gegenpruefung widerlegt. Sie
stehen hier, damit sie kein spaeterer Chat erneut „findet":

- **Den `deepClone` in `state/Editor.ts` snapshot() entfernen: NEIN.**
  Gesten sind geklammert (`Historie.record` steigt bei `_txDepth > 0` sofort
  aus) — ein Zug ueber hundert Mausbewegungen macht EINEN Klon, nicht
  hundert, und der liegt unter einer Millisekunde. Es gibt nichts zu
  gewinnen. Dagegen steht ein echter Verlust: `props` und `childIds` sind
  schreibbar typisiert, `editor.tree` nur oberflaechlich `Readonly`, und
  `useLitElement.ts:107` reicht die lebenden Prop-Objekte per Referenz an die
  Bausteine. **Der Klon ist die einzige Stelle, die die Unveraenderlichkeit
  ueberhaupt erzwingt.** Bleibt, wie er ist.
- **„Jede Aenderung rendert den ganzen Editor neu": ueberzogen.** 18
  Abonnenten, kein `React.memo` — aber sechs davon haengen an geschlossenen
  Dialogen und sind beim Tippen gar nicht montiert. Ohne Messung nicht
  anfassen (Regel 10).
- **„Der 500-Zeilen-Deckel gestaltet mit": falsch gezaehlt.** Der Waechter
  zaehlt anders; die genannten Splitter-Dateien sind nicht aus Platzdruck
  entstanden (`editorAngaben.ts` ist eine von ELF, je eine pro
  Baustein-Ordner). Einzige echte Beobachtung: `TabelleBlock.ts` liegt mit
  500 Zeilen exakt auf der Grenze und pendelt seit sieben Commits im Band
  491-500.

---

# Welle E — Der grosse Innenumbau

Erst nach den sichtbaren Vertragsklaerungen, damit die Registry nicht
gleichzeitig mit Popup und Tabelle umgebaut wird.

## E1 · Vollstaendiges Registry-Inventar und Waechter zuerst

Fuer jeden Bausteintyp erfassen: blockType · tagName · Kategorie ·
Default-Props und deren Reihenfolge · Parent-/Child-Faehigkeiten ·
Resize-/Raster-Faehigkeiten · Bindungsstellen · Blockevents ·
Visible-When-/Auswahlfaehigkeiten · Exportattribute · reine Editor-Angaben.
Das Inventar wird im Chat vorgelegt, nicht als neue Dauer-Ablage.

Der Regelwaechter muss vor der Migration beweisen: zwei unabhaengig aus
realen Code-Einstiegen abgeleitete Mengen stimmen ueberein (keine manuelle
Soll-Liste) · exakt alle Typen erkannt, keiner doppelt, keiner fehlt ·
jeder in Exporttest, Positivliste und Referenzabzug vertreten · entfernte/
umbenannte Definitionen machen den Waechter nachweislich rot (an mehreren
erprobt). Eine ANZAHL steht bewusst nicht im Plan — die Wahrheit ist die
Import-Liste in `src/blocks/register.ts` (heute 15).

**Was E1 NICHT abdeckt — ausdruecklich mitzupruefen:** der Waechter zaehlt
TYPEN, nicht FELDER. Eine Faehigkeit wird heute an DREI Stellen gefuehrt
(deklariert in `core/blocks/BlockComponent.ts`, beschrieben in
`BlockDefinition.ts`, von Hand kopiert in `blocks/base/BasicBlock.ts`).
Vergisst jemand eine Kopierzeile, verschluckt der Baustein die Faehigkeit
STILL. E1 braucht dafuer eine eigene Probe — oder E2 raeumt den
Drei-Stellen-Vertrag ab und der Satz zieht dorthin. Beleg aus der Analyse
2026-08-18: der neue Tabellen-Modus `besitz`/`bereitgestellteZeilen`
(Welle D) lebt komplett am Registry-Vertrag vorbei — genau diese Gattung
faengt E2 kuenftig ein.

## E2 · Eine runtime-sichere Baustein-Definition

**Ziel:** Faehigkeiten und Defaults haben EINE kanonische runtime-sichere
Quelle. **Grenze:** `editorAngaben` bleibt getrennt — Icons und
Editor-Hilfen duerfen nicht ins Runtime-Bundle jeder Maske.

Arbeit: 1. gemeinsame reine Typen an einen neutralen runtime-sicheren Ort ·
2. alle direkten Metadatenleser als Abhakliste (editorAngaben ·
Kanban-Runtime · seAktionen · Kind-/Parentpruefung · Tabellenbindung ·
Default-/Export-Anker · Regelwaechter · Runtime-Einstieg) · 3. Definition
enthaelt Typ, Tag, Defaults, Faehigkeiten · 4. `BasicBlock` LIEST daraus,
kopiert nicht mehr · 5. Registry liest dieselbe Definition · 6.
Editor-Angaben referenzieren nur den Typ · 7. Default-Reihenfolge bleibt
deterministisch (sonst aendern sich Exportbytes ohne Grund) · 8.
Importgraph vorher/nachher: Core importiert keine Bausteine, Runtime keine
Editor-Icons, keine neuen Zyklen · 9. toter Metadaten-Getter faellt ·
10. CLAUDE.md im selben Commit nachziehen.

Vorgehen: ein repraesentativer Baustein als unkommitteter Schnittbeweis;
committed wird nur die vollstaendige Migration ohne Dual-Path; keine
gleichzeitige sichtbare Eigenschaftsaenderung. Fertig, wenn: neue
Faehigkeit = genau eine Stelle · Waechter erkennt alle Definitionen ·
Bundle traegt keine Editor-Abhaengigkeit · Referenzexport ohne
unbeabsichtigten Diff · alte Parallel-Listen weg.

## E3 · Property-Schreibnaht absichern (kleinste, sofort baubar)

`Editor.updateProperty` speichert keine Tippfehler oder fremden
Eigenschaften mehr: 1. gegen die kanonische Property-Menge validieren ·
2. Raster-/interne Props mit ausdruecklichem zentralem Vertrag · 3.
Ablehnung VOR pushHistory/State/notify/Autosave · 4. Entwicklerdiagnose
nennt Blocktyp+Property, dedupliziert · 5. alle Aufrufer inventarisieren ·
6. Sanitizer und Schreibnaht nutzen dieselbe Wahrheit · 7. **KEINE
Migration** (der Lader wirft unbekannte Props heute schon weg —
`normalizeProps` in `state/treeOps.ts`; E3 sichert die SCHREIB-Seite).
Fertig, wenn ein Test beweist: ungueltiger Key = kein History-Eintrag,
keine Version/Benachrichtigung, kein Autosave.

---

# Welle U — Generalsanierung der Editor-Bedienung (Rest)

**Geltungsbereich:** NUR die Editor-Bedienoberflaeche. Die Maske selbst
(Bausteine, Export-Bytes, Runtime, SE-Anschluss) bleibt unveraendert; der
Referenzabzug beweist das je Etappe. Regeln aus F1/F2 gelten weiter: kein
Code fuer die Relations-Bedienung vor bestaetigtem Entwurf · keine
Tutorial-Texte in der Steuerung · die SE-Fachbegriffe
START_TOOL/GET_RELATION/PUT_RELATION/PUTADD_RELATION bleiben sichtbar ·
Klarnamen vor Technikwerten · Ketten bleiben sichtbar und der einzige
Schreibweg · alte UI wird restlos entfernt, wenn ersetzt · keine zweite
Terminologie.

**U0-Antworten (2026-08-12, konserviert — nicht erneut fragen):**
1. Dialog heisst **„Datencenter"**. 2. Belehrungs-/Warntexte: **raus**.
3. **Loeschen fragt nie nach; Undo ist das Netz** (Bibliotheks-Rueckfragen
bleiben vorerst). 4. Arten-Liste wird im U4-Entwurf gemeinsam durchgegangen.
5. Baustein „Zeile": **raus** (gebaut, C2). 6. Text-Baustein wird im
U4-Entwurf neu gedacht (Namens-Kollision „Text" wird dort geloest).
7. **Popup-Reiter faellt — Overlay „wie Canva"** (→ V6b). 8. Optik-Vorbild
ist die **Fellnase-Demo**, ausdruecklich auch fuers Editor-Gesicht (→ U7).

**Der grosse Auftrag (2026-08-17): Datencenter UND Inspector werden KOMPLETT
NEU ENTWORFEN.** Alle Funktionen bleiben; es muss danach dasselbe koennen,
nur bedienbar. Anlass, gezaehlt: **45 verschiedene Bedienwege fuer vier
Fragen** (Wert angeben 16 · Liste bearbeiten 13 · Feld waehlen 9 · Quelle
waehlen 7) — kaum Doppelbauten, sondern UNEINHEITLICHKEIT. Wegweiser:
der Quellen-FORMEN-Beschluss (oben) und **erst Bauteile, dann Bildschirme**
— der Entwerfer bekommt die gemeinsamen Bauteile als Auftrag, nicht
„entwirf ein Datencenter". Die Bauteil-Inventur der Analyse 2026-08-18
liegt als Grundlage bereit: ZeilenListe (6 Bauformen heute) ·
Fenster/Dialog (3) · Suchfeld (4) · Loesch-/Bestaetigen-Weg (3+8 ohne) ·
Master-Detail (2 Kopien) · Knopfliste „eins aus N" (5 Aktiv-Rezepte) ·
Menue (1 handgebaut) · Abschnittskopf (9 handgeschriebene Kopien).

## U4 · ENTWURF: Quelle anlegen, Feld waehlen, Relation anlegen (kein Code)

KEIN Code, bevor der Nutzer den sichtbaren Entwurf bestaetigt hat. Der
Entwurf beantwortet mindestens:

- EINE Bedienform fuer „ein SE-Feld benennen" (heute sechs: Handeingabe ·
  rohe Syntax · Dropdowns · unsichtbar fest · Kombi-String „BEL_0_11" ·
  Such-Popup).
- Der gefuehrte Weg „neue Quelle" (Nutzer woertlich: „Wie hole ich andere
  quellen? ich weiss es nicht mal") — Stolpersteine weg: leere
  Pflicht-Feldzeile mit unsichtbarem Fehler · „Beleg kommt aus" leer ohne
  zweite Quelle · DTK-Import kann nur IDB-Quellen anlegen.
- Das Formular fragt zuerst die FORM (Quellen-FORMEN-Beschluss).
- Relation anlegen OHNE rohe SoftEngine-Syntax zu tippen (SE-Verben bleiben
  sichtbar, Entscheidung 2026-07-15).
- EIN Speicher-Verhalten fuer Formulare (heute drei: Speichern-Knopf ·
  Sofort-Schreiben · StepForm-eigenes Speichern).
- Schliessen ohne Datenverlust-Ueberraschung (X/Hintergrund vs Escape).
- Die zwei geerbten U0-Fragen: Arten-Liste verstaendlich benennen ·
  Text-Baustein neu denken.
- Einheitliche leise Erfolgs-/Fehlermeldungen des Editors.

**Ergebnis:** Klartext-/Wireframe-Entwurf im Chat; der Nutzer bestaetigt
oder korrigiert. Erst DANN wird U5 zugeschnitten.

## U5 · Umsetzung des bestaetigten Entwurfs (ein bis drei Etappen)

Zuschnitt folgt aus U4. Alte UI restlos weg, keine zweite Terminologie,
bestehende Masken exportieren byte-gleich, Migration nur mit eigenem Schutz.

## U7 · Optik: der Editor uebernimmt die Fellnase-Richtung

Die eingecheckte Demo (`designsprache/`) ist das Vorbild — auch fuer den
Editor selbst. Die Grenze aus CLAUDE.md bleibt hart: Masken-Tokens und
Editor-Tokens werden NIE gemischt; der Editor bekommt EIGENE Tokens mit den
Fellnase-Werten, `masken-tokens.css` und die Export-Bytes bleiben
byte-gleich.

- **U7a · Musterbogen ergaenzen (kein Editor-Code, darf frueh laufen):**
  die Muster, die der Demo fehlen: Formularzeile, Auswahlmenue,
  Liste-mit-Detail, Fenster/Dialog, Knopfreihe, Meldung. Aus den
  vorhandenen Atomen (`atome.css`) ABGELEITET, nicht erfunden; fehlt eine
  Entscheidung, wird gefragt. In `designsprache/` einchecken; der Nutzer
  nickt IM BROWSER ab, bevor irgendwer den Editor anfasst.
- **U7b · Editor-Tokens umstellen** (`src/index.css` auf die abgenickten
  Werte, Schrift wie die Demo). Koralle-Akzent: **JA, uebernehmen**
  (Nutzer-Entscheidung 2026-08-18, s. 0.1 — nicht erneut fragen).
- **U7c · Steuerung/Inspector/Palette angleichen**, Stelle fuer Stelle
  gegen den ergaenzten Musterbogen.

**Reihenfolge-Ehrlichkeit:** U7b/U7c laufen NACH U4/U5 — sonst werden
Formulare angestrichen, die kurz danach neu gebaut werden.

## U10 · Leerzeichen beim Benennen (NICHT baubar ohne Nutzer-Beobachtung)

Nutzer-Befund („Leerzeichen kommt nicht an", „immer noch"). Zwei Sitzungen
haben die Ursache im Code vergeblich gesucht — **nicht weiter suchen**;
der Nutzer beobachtet den genauen Hergang bei der Gesamtprobe, dann wird
mit dem Beleg gebaut.

---

# Welle F — Rest

## F3 · Designsprache systematisch abgleichen (nach U5/U7)

Quelle: die eingecheckte `designsprache/` und `masken-tokens.css` — es wird
abgeschrieben, nicht aus KI-Geschmack gestaltet; fehlt eine Entscheidung im
Musterbogen, wird gefragt. Reihenfolge: 1. gemeinsame Atome/Styles, nicht
jeden Baustein einzeln · 2. Dialog/Popup/Tabelle gegen Tafel-Rahmen und
Tokens · 3. Tabellen-Spaltenbreiten nach ART, nie nach Inhalt · 4. Status:
Rohwert ohne Zuordnung grau, Bedeutung bestimmt feste Farbe · 5. „Bild +
Name" nutzt geteilte Bilder · 6. Datum nur ausrichten, nie umrechnen · 7.
Kanban-Karte gegen Reiter/Fusszeile pruefen · 8. veraltete
Meldungs-Fallbackfarben an Tokens angleichen · 9. Editor- und
Masken-Tokens nicht vermischen. Fertig, wenn jede sichtbare Abweichung
korrigiert oder als bewusste Nutzerentscheidung benannt ist, kein neuer
Hex-Wert entsteht und der Nutzer den Vergleich bestaetigt hat.

---

# Einzeletappen ausserhalb der Wellen

## A10 · Sitzungs-Besitz der Bibliotheken (Technik; eigenes go bei Bedarf)

Fachlich BEANTWORTET (2026-08-12): die Bibliothek bleibt editorweit — keine
Maske bringt eigene Quellen/Relationen mit. Offen ist nur die TECHNIK
(injizierte Sitzungsinstanz statt Modul-Singletons, damit Export/Persistenz
einen atomaren Snapshot ohne globale Importe bekommen). Sie wartet auf
keine Entscheidung mehr, sondern auf einen Umbau, der sie wirklich
erzwingt (Regel 10). Der technische Umbau darf nicht still „neue Maske =
leere Bibliotheken" erfinden; zwei Sitzungsinstanzen muessen ohne
Testverschmutzung erzeugbar sein.

## S5.3 · Diagnose-Anzeige (OPTIONAL, eigenes go, SE-Echttest Pflicht)

Die Diagnose schreibt bei jedem SE-Ereignis das JSON des ersten
Datenpakets mehrfach neu (`bridge.ts`) — datenmengenproportionale Arbeit
mitten im Maskenstart. Falls freigegeben: Diagnose nur noch auf
Anforderung fuellen, Maskenverhalten sonst identisch.

---

## 5. Reihenfolge

**Neu ab 2026-08-21 (Nutzer-Ansage „erst alles sauber, dann weiterbauen"):**
Welle R laeuft zuerst und ALLEIN. Kein Neubau, solange sie offen ist — die
Verzahnungs-Erlaubnis von frueher ist damit ausgesetzt.

1. **Welle R (Reinigung):** R1 → R2 → R3 → R4 → R5 → R6 → R7/R8/R9 (duerfen
   am Stueck, sind mechanisch) → R10 → R11 → R12.
   R10 ersetzt in der Sache E1/E2/E3; die Langfassung steht weiter unten in
   Welle E und bleibt die Bau-Anleitung dafuer.
2. **Nutzer:** Gesamtprobe (7.0) + U10-Beobachtung. Die
   preflight-Mini-Frage ist beantwortet — Loeschen, s. R7.
3. **Welle S:** Belegerfassung (Tempo, Erfassung, Optik) — der eigentliche
   Bau-Auftrag des Nutzers, wartet auf das Ende von Welle R.
4. **Rest der alten Reihenfolge:** V6 nach Kurzentwurf → U4
   (Entwurfssitzung) → U5 → U7a → U7b/c → F3.

Innerhalb von Welle R gilt: **ein Paket zur Zeit, nie zwei offen** — dazu
weiter Regel 3.1 (ein Thema, ein Commit) und EIN federfuehrender Agent je
Arbeitsbaum.

---

## 6. Was ausdruecklich nicht Teil dieses Umbaus ist

- kein neuer Bausteintyp nur zum Testen der Registry;
- kein Redux/Zustand/MobX;
- keine neue Testumgebung, Playwright-, DOM- oder Screenshottests;
- keine Neuerfindung der SoftEngine-Bridge;
- kein Entfernen des offiziellen Interface-Tags ohne eigenen A/B-Auftrag;
- kein Auto-PUT oder versteckter Schreibweg; kein CREATE_RECORD;
- keine mehrstufigen Quellenverknuepfungen;
- keine Wiederbelebung geloeschter Projektkarten, Wizards oder
  Dokumentationssysteme;
- keine Popup-Stack-Architektur; kein editierbarer Nachschlage-Seitentyp;
- keine Designaenderung ohne Musterbogen oder Nutzerentscheidung;
- kein Aufraeumen fachfremder Stellen „wenn man schon da ist".

---

## 7. Proben und Endabnahme

### 7.0 Die JETZT anstehende Gesamtprobe (Stand 2026-08-18)

**Browser (Editor):** Popup: Bausteine hineinziehen (Drop nur im
Fensterinneren), Groesse an den Anfassern, loeschen, leere Seite ·
Nachschlagen: Feldtyp waehlen, Quelle + „Gespeichert wird", Lupe →
Spalten einstellen (+/−, Doppelklick umbenennen, Klick auf Spaltentitel
MUSS die Feld-Auswahl oeffnen), Typwechsel schliesst das Fenster ·
Auswahl: EIN Klick trifft die Kanban-Karte; ein Loeschweg je Ding ·
Kanban-Zimmer anlegen + Karte einsortieren · Bild-Baustein hochladen ·
**U10 beobachten** (Leerzeichen beim Benennen — genauer Hergang) ·
Fix-Proben: Lesen/Schreiben-Reiter klicken · im Spalten-Fenster tippen,
Escape, danach muss Strg+Z gehen · Ankreuzfeld bietet kein „Feld" mehr.

**SoftEngine (eine Maske exportieren, echt laden):** Daten kommen in
Tabelle/Kanban/Feldern an · Beleg-Klick fuellt Positionen · Lupe oeffnet
zur Laufzeit das Fenster mit echten Saetzen, Zeilenklick uebernimmt ·
eine Kette ausfuehren · Popup per Kette oeffnen/schliessen.

Der Nutzer meldet NUR Funde.

### 7.1 Maschinelle Pflicht (Endabnahme des gesamten Umbaus)

Sauberer Arbeitsbaum · fuenf Pruefungen gruen · keine Datei ueber 500
Zeilen · keine unerklaerten Runtime-Bytes · Referenzabzug vollstaendig
erklaert · direkte und stufenweise Upgrades alter Schema-Masken geprueft ·
zukuenftige Schema-Version wird abgelehnt · kein Sanitizer-Test erlaubt
stillen Teilverlust · keine kopierte Blockreferenz zeigt aufs Original ·
Registry-Waechter erkennt exakt alle Bausteine · Bundle enthaelt keine
Editor-Icons · D2: `provided` meldet sich nie bei SoftEngine an · D3:
keine handgebaute Nachschlagetabelle parallel · E2: kein Dual-Path ·
E3: ungueltiger Key ohne History/Notify/Autosave.

### 7.2 Nutzer-Browserprobe (Endabnahme)

Hauptseite und Popup bauen · DnD, Resize, Reihenfolge, Undo/Redo ·
Texteditieren + globale Kuerzel · Popup oeffnen/wechseln/schliessen/
loeschen · Fokus- und Tab-Reihenfolge · normale Tabelle und
Nachschlagetabelle · Quellen, Relationen, Aktionsparameter und `aus` ·
Export erzeugen, Reload und Maskendatei-Roundtrip.

### 7.3 Nutzer-SoftEngine-Probe (Endabnahme)

Referenzmaske vor/nach · Datenpush und Mehrfachhydrierung ·
Tabelle/Kanban/Nachschlagen · Popup-Positionen, genau-ein-Popup, Fokus ·
Ereignisketten, `aus`, START_TOOL, Relationsschritte · WinUI und, soweit
verfuegbar, WebUI · HTML und SEvariablen gehoeren zum selben Exportstand.

### 7.4 Abschlussbericht

Nennt nur: gebaute Etappen/Commits · gruene Pruefungen · bestaetigte
Proben · bewusst verschobene Grenzen · ob neue Produktfunktionen wieder
frei sind. Keine Vorschlagsrubrik, keine neue Dauer-Chronik.

---

## 8. Sperrliste — gestrichen oder geparkt (nicht wieder vorschlagen)

Begruendungen in voller Laenge: git-Historie (Plan-Fassung vor dem
2026-08-18) und CLAUDE.md.

**GESTRICHEN (Nutzer-Ansagen; in keiner Form wieder vorschlagen):**

- **Warn-/Preflight-Anzeigen und Export-Blockaden** (S1, 2026-08-10): der
  Export blockt nie, der Editor erzieht nicht.
- **Export-Klick-Umbau** (B1, 2026-08-17): zwei automatische Downloads
  bleiben, wie sie sind — keine ZIP, keine Anforder-Knoepfe.
- **„Beleg anlegen und sofort sehen"** (R4, 2026-08-12): die belegten
  SE-Muster stehen in CLAUDE.md als Wissen, gebaut wird daraus nichts.
- **Zeilenfilter am SEFILELOOP-Eintrag** (R5, 2026-08-12): gebaut und auf
  Ansage restlos zurueckgenommen (Regel-3-Verstoss).
- **Lade-Sperre/Schreib-Riegel/Quarantaene** (2026-08-12): der Browser-Weg
  laedt nachsichtig; die strenge Verlust-Pruefung lebt nur am Datei-Weg.
- **Baustein „Zeile"** (U0-5): geloescht, Migration loest Altbestand auf.
- **Fokusfalle/aria-modal ohne echte Fokusgrenze** (C3.3): abgewaehlt.
- **Pixel-Umrechnungsformel + 520-px-Zwangsbreite** (C2): abgewaehlt — ein
  Popup mit 480 bleibt 480.
- **Loesch-Rueckfrage am Baustein** (C3.4/U0-3): Loeschen fragt nie nach.
- **Neue Testgattungen/Playwright** (CLAUDE.md, 2026-07-23/28).

**GEPARKT (kommt wieder, wenn der Anlass da ist):**

- **Popup-Duplizieren und „Verschieben nach …"** (C3.1/C4): heute ueber
  die Oberflaeche unerreichbar — erst mit dem Overlay (V6b) sinnvoll.
- **Dev-Server-Ladezeit** (S4): keine kleine sichere Loesung gefunden.
- **Bild-Baustein Stufe 2** (Bilder aus SE-Feldern): wartet auf einen
  Beleg aus einer echten Maske.
- **Offener Satz per VAR bestellen:** als `it.todo` in
  `datenquellen.test.ts` sichtbar gehalten — bauen, wenn die Form an
  einer echten Maske belegt ist.
- **MEMTAB / ERPAPICALL-Laufzeit-AUFRUF:** MEMTAB kommt in keiner echten
  Maske vor; der Laufzeit-Aufruf friert WinUI ein — beides wartet auf
  Belege der Installation.
- **U10** (Leerzeichen): wartet auf die Nutzer-Beobachtung (s. Welle U).
- **Erfolgs-Meldungen (V2):** gruener Meldebalken + Meldungs-Schritt in
  Ketten — Nutzer-Ansage 2026-08-18 „muss nicht sein", bevor gebaut
  wurde. Kommt nur wieder, wenn der Nutzer selbst danach fragt; Skizze
  in der git-Historie dieser Datei.

---

## Welle S — Belegerfassung: Tempo, Erfassung, Optik (aufgenommen 2026-08-20)

**Anlass:** Nutzer baut eine Belegpositions-Erfassungsmaske. Zwei Debug-Logs
seiner echten SoftEngine-Installation liegen vor (`Desktop\debug.txt` = unsere
Maske, 36 009 Zeilen / 21,6 s zum Oeffnen; `Desktop\softenginedebug.txt` = die
native SE-Maske, 2 236 Zeilen / 3,1 s). Dazu die echten SE-Masken in
`Desktop\Belegerfassung\LAYOUTRAHMEN` + `INTERNEOPTIONSMASKEN`.

### S.0 Befunde aus den Logs (gemessen, nicht vermutet)

1. **11 906 von 36 009 Zeilen sind `GET_RELATION[1911]`** (Bild zum Artikel).
   Wir rufen 1911 NIRGENDS auf (kein Treffer in `src/`) — SoftEngine macht das
   von selbst fuer jeden gelieferten Wert eines 25-Zeichen-Feldes.
   5 953 verschiedene Werte: 5 166 `ART0…`, 621 `LST…`, 154 `SB…`.
   Treiber sind unsere Feldlisten: `ART 1_25`, `CHA 1_25`+`26_25`,
   `IDBID0001 110_25`, `IDBID0010 55_25`.
2. **Alles wird ZWEIMAL geliefert.** Die 1911-Aufrufe kommen in zwei sauberen
   Wellen: 09:02:47–09:02:55 (~5 953) und nach 3 s Pause 09:02:58–09:03:06
   (~5 953), identische Werte. Das ist die HAELFTE der Ladezeit ohne
   Gegenwert. Hauptverdacht: die seit 2026-07-28 notierte Beobachtung
   „CONECT wird ZWEIMAL gesendet" (CLAUDE.md, Regel 5) — doppelte Anmeldung,
   also baut SoftEngine den Datensatz zweimal. NICHT bewiesen, zuerst messen.
3. **Unsere Bestellung: 6x `SEFILELOOP` mit `INDEX_NR: 0`** = sechs komplette
   Dateien (BEL, IDBID0001, ART, ADR, IDBID0010, CHA).
   **SoftEngines eigene Bestellung: EIN `SEFILELOOP`** (`POS` mit
   `KOPFSATZ_INDEX: BEL_0_11`), alles andere ueber `VAR` (Felder des
   aktuellen Satzes), `GET_RELATION` mit `ALIAS`, `REFRESH`, `MASKE`.
   **Wichtig (Nutzer-Klarstellung 2026-08-20):** ihre Maske ist NICHT der
   Massstab — sie zeigt nur Belegpositionen, hat KEINE Hilfstabellen, und
   nachgeschlagen wird dort im nativen SE-Fenster (`SendBWTool`), an das wir
   nicht rankommen. Ihre 3 Sekunden sind mit gleicher Funktion nicht
   erreichbar. Uebernommen wird nur, was auch bei uns Funktion behaelt.
4. **Neue SE-Kontrakte, in den Referenzmasken belegt** (noch nicht gebaut):
   - `REFRESH`-Block: `{ID, ALIAS, PK: "BEL_197_8", PKLEN, TRENNER: " : ",
     FORMAT}` — SoftEngine loest einen Schluessel zu `Nummer : Klarname` auf,
     OHNE dass eine Zeile geliefert wird. Der billige Weg fuer Anzeige und
     fuer den Einziger-Treffer-Fall.
   - `MASKE`-Block + `selib.Json.AddJSONDataToModule(id, {json, maskedit:"true"})`:
     SE liefert eine interne Optionsmaske als JSON und rendert sie selbst
     editierbar, mit Speichern-Knopf. Installations-intern (`1211S5OPT44`),
     fuer uns NICHT nachbaubar. Nur als Wissen notiert.
   - `WINDOW_VARIABLE` als VAR-ID: fertige Anzeigetexte der laufenden Maske
     (`BELERF_26300_100`).
   - `GET_RELATION[01!<ADRNR>!<pos>!<len>]` liest EIN Adressfeld eines
     EINZELNEN Satzes. Das Gegenstueck fuer ART ist unbekannt — **nicht
     raten**, Echttest des Nutzers noetig.
   - SE Framework V2 ist Lit (minifiziertes Bundle in `Rahmen10001`). Keine
     Technik-Kollision mit unseren Bausteinen.
   - Im Log der nativen Belegerfassung steht **kein einziges `PUT_RELATION`** —
     SE schreibt intern. Von SE ist kein Schreibweg abzuschauen; unser
     `PUT_RELATION 82` je Zeile bleibt der einzige belegte Weg.

### S.1 Was der Nutzer HEUTE schon kann (nur nicht findet)

Kein Bau noetig, aber der Grund fuer vier verlorene Tage — deshalb hier
festgehalten:

- **Welches Feld eine Spalte zeigt:** Tabelle auswaehlen, dann EINFACHER Klick
  auf den Spaltenkopf → Feld-Waehler (`TabelleBlock.ts:466` → `oeffneFeldPicker`
  → Event `ff-listen-bind` → `editor/canvas/FeldBindung.tsx:151`).
  DOPPELKLICK auf denselben Kopf benennt dagegen um (`TabelleBlock.ts:460`).
  Der Waehler wartet 220 ms (`DOPPELKLICK_FENSTER`), bevor er aufgeht.
- **Ohne Kopfzeile** traegt die Erfassungszelle denselben Griff
  (`TabelleBlock.ts:449`).
- **Hilfstabelle je Spalte:** im selben Waehler „Sucht beim Erfassen in"
  (`spaltenBindung.ts:29`) — sichtbar NUR bei eingeschalteter Erfassung
  (`nurBeiErfassung: true`).
- **Warum eine Spalte auf eine FREMDE Quelle leer bleibt** (Nutzer-Fall
  „Tierart"): die Optionen von „Sucht beim Erfassen in" sind die
  **Verknuepfungen des Bausteins**. Ohne vollstaendiges Schluesselpaar
  (`vollstaendigePaare`, `benutzteQuellen.ts`) taucht die Quelle dort gar
  nicht auf und die Spalte bleibt leer.

**Daraus die Bau-Lehre:** das ist kein fehlendes Feature, sondern eine
unauffindbare Bedienung. S2.1 macht sie sichtbar.

### S.2 Etappen — in dieser Reihenfolge

**S2.0 — Doppel-Lieferung abstellen.** Zuerst MESSEN (wo wird die Anmeldung
zweimal ausgeloest — `src/softengine/bridge`), dann genau einmal anmelden.
Erwartung: 36 009 → ~18 000 Zeilen, 21,6 → ~11 s. Keine Funktionsaenderung.
Sichtbar: neuer Debug des Nutzers, eine Welle statt zwei.

**S2.1 — Die Spalten-Einstellung auffindbar machen.** Der Spaltenkopf muss im
Editor ansehen lassen, dass er anfassbar ist, und der Waehler muss zeigen,
WELCHE Quelle er gerade anbietet. Dazu: wenn eine Spalte ein Feld einer
fremden Quelle traegt, aber keine Verknuepfung dafuer existiert, sagt der
Waehler das in Klartext (keine Warn-Anzeige an der Maske — Sperrliste gilt;
das hier ist der EDITOR).

**S2.2 — Lieferform je Quelle** (neue Eigenschaft in `core/data/quellenArten.ts`,
Regel 2): `satz` → `VAR` · `zeilen` → `SEFILELOOP` · `nachschlagen`.
BEL/ADR einer Belegmaske sind `satz`. Erwartung: zwei Datei-Schleifen weg.

**S2.3 — Strenger schneiden** (`export/benutzteQuellen.ts`): nur liefern, was
eine sichtbare Spalte oder Bindung wirklich braucht. Und: **kein 25-Zeichen-
Feld in einer Liefer-Liste, wo es nicht sein muss** — jeder solche Wert kostet
einen Bild-Nachschlag je Zeile (S.0/1).

**S2.4 — Belegpositionen mit `KOPFSATZ_INDEX`** statt Vollast. `kopfsatzIndex`
existiert bereits (`export/datenquellen.test.ts:132`).

**S2.5 — F5: Doppelbuchung.** `seAktionen.ts:210` leert die Erfassung erst,
wenn ALLE Zeilen durch sind. Bricht Zeile 3 ab, sind Zeile 1+2 in SoftEngine
geschrieben, stehen aber weiter in der Liste — der naechste Kettenlauf schreibt
sie ein zweites Mal. **Der einzige echte Datenfehler.** Soll: jede Zeile faellt
raus, sobald IHR eigener Durchlauf sauber war. Der Kommentar dort behauptet das
Gegenteil und muss mit.

**S2.6 — F2: Tipp-Zustand je Zeile.** `ErfassungsLauf` haelt heute genau EINE
Zeile (`getippt`/`gewaehlt`/`tippSpalte`/`marke`). Traegt S2.7 und S2.8.

**S2.7 — F1/F4: erfasste Zeile wieder anfassen und einzeln loeschen.**
Heute schiebt `erfasse()` die Zeile nach `_zeilen` und sie ist tot; der einzige
Ausweg `leeren()` wirft ALLE weg (`erfassungsAnschluss.ts:83`).

**S2.8 — F3: Navigation.** `naechsteLeere` sucht nur rechts und nur Leeres;
Shift+Tab ist an den Browser abgegeben (`erfassungsBedienung.ts:79`), Pfeile
fehlen ganz. Soll: Pfeile/Tab erreichen JEDE Zelle auch ueber Zeilengrenzen,
Enter ueberspringt Gefuelltes (Komfort, nie Sperre).

**S2.9 — PUT_RELATION 82 je Zeile.** Laeuft bereits einmal je erfasster Zeile
(`seAktionen.ts:205`, `for (const satz of saetze)`), muss nur mit S2.5
zusammenpassen. Kontrakt aus dem behandlung-Log, s. CLAUDE.md.

**S2.10 — Nachschlagen ohne Vollast.** `REFRESH` fuer „Nummer → Klarname";
Einzel-Lese-Relation fuer ART macht ART zur *holenden* Quelle (Konzept
existiert: `export/datenquellen.test.ts:123`, heute nur Belegpositionen ueber
Relation 69). **Blockiert:** Relationsnummer fuer ART fehlt, Echttest noetig.
Ohne Such-Relation bleibt fuer die Vorschlagsliste ein einmaliges Laden — dann
aber nur fuer echte Hilfstabellen und nur EINMAL (S2.0).

**S2.11 — Optik.** SoftEngine gibt eigene CSS-Variablen mit (`--SERahmen2`,
`--SESchrift`, benutzt in `INTERNEOPTIONSMASKEN/PGBED1`). Unsere Tokens
bekommen sie als Quelle mit unserem Wert als Rueckfall
(`--se-flaeche: var(--SERahmen2, <unser Wert>)`) — in SoftEngine sieht die
Maske aus wie die Installation, im Editor wie bisher. Das Framework-CSS selbst
liegt auf dem Server (`SeHtmlFrameworkV2_Files`) und ist NICHT abzumalen:
Zeilenhoehe, Gitterlinien, Kopfzeile, markierte Zeile, aktive Zelle kommen aus
einem Screenshot des Nutzers. **Nichts davon erfinden** (Memory:
„Optik: Vorbild statt Beschreibung").
Was BESSER wird als SE, entschieden 2026-08-20: aktive Zelle immer sichtbar
umrandet · Spaltenbreite nach Art (springt beim Blaettern nicht) · gefuellte
Zellen sehen anders aus als zu tippende · keine Bilder in der
Erfassungstabelle (jedes Bild = ein `GET_RELATION 1911`).

### S.3 Was blockiert ist

- **S2.10** wartet auf die ART-Einzel-Lese-Relationsnummer (Echttest Nutzer).
- **S2.11** wartet auf einen Screenshot der SE-Belegpositionen-Tabelle.
- Beide blockieren S2.0–S2.9 NICHT.
