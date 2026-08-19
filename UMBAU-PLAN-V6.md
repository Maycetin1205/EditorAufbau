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

- **Stand 2026-08-19: Spalten-Modell der Erfassung umgebaut (Nutzer-Modell,
  Etappe A).** Eine schreibende Spalte IST ein Feld der Tabellen-Quelle
  (Belegposition): steht ihr Feld in einem Schluesselpaar der Verknuepfung,
  waehlt die Erfassungszelle in der gekoppelten Quelle (Artikelnummer →
  Artikelstamm), ungekoppelt tippt sie frei (Menge) — Anzeige-Spalten
  (Bezeichnung aus dem Stamm) bleiben moeglich und geben der Liste den
  Suchtext. Das fruehere Ankern an alte Zeilen ist ersatzlos raus; beim
  Umentscheiden verliert immer die AELTERE Wahl (Wahl-Reihenfolge in
  `erfassungsLauf.ts`). Liegt auf Branch `claude/code-review-refactor-0bw6rv`
  (dieselbe Sitzung faehrt parallel die grosse Bestandsaufnahme;
  Zusammenfuehren nach main entscheidet der Nutzer).
  **Nachgezogen am selben Tag (A2, Nutzer-Befund):** die Ableitung ist jetzt
  SICHTBAR — der Inspector zeigt je Spalte Klartext (Feld aus X · waehlt im Y
  · frei tippen · Anzeige aus Z), der Feld-Waehler markiert gekoppelte
  Felder („waehlt im …"), und ohne Kopfzeile traegt auch die Erfassungszeile
  den Zellen-Griff (vorher war die oberste Strich-Zeile als einzige NICHT
  klickbar — G5b-Baufehler). Die Ableitung wohnt dafuer in
  `core/data/sourceLinks.ts` (`erfassungsZielVon`), damit Editor-Code sie
  ohne Baustein-Import zeigen darf. Beschlossen und OFFEN,
  je mit eigener Ansage + go: **Etappe B** — die Ketten-Parameter KOMPLETT
  umbauen (Nutzer 2026-08-19: „unsauber gewachsen"; Wahl kuenftig ueber das
  Positions-FELD mit Klarnamen statt ueber den Spalten-Index) · **Etappe C**
  — „Schlank" ERSETZT den Kopfzeile-Schalter von G5b (ein Schalter:
  schlank = kein Rahmen UND keine Titelzeile).
- **Stand 2026-08-18:** Gesamtanalyse des ganzen Repos (zwei Lese-Trupps +
  Kernlektuere). Urteil: das Fundament traegt (Store, Registry, Export,
  SE-Schicht sauber); die Schwaechen sassen in der Bedienschicht. Sechs
  Fix-Commits sind in `claude/softengine-erp-templates-ynqibv` gepusht
  (Schritt-Formular-Datenverlust · tote Lesen/Schreiben-Reiter ·
  Undo-Killer im Feld-Picker · Klick-Schlucker · Nachschlagen-Einstellung
  · Ankreuzfeld-Bindung), dazu: gelber Punkt im Datencenter entfernt,
  README angelegt, dieser Plan eingedampft. Pruefbuendel gruen. Die
  restlichen Befunde stehen als **Welle V** unten — der Nutzer hat ihnen
  am 2026-08-18 pauschal zugestimmt; je Etappe gilt trotzdem Ansage + go.
- **WARTET AUF DEN NUTZER (kann kein Chat erledigen):**
  1. **Die Gesamtprobe** (Browser + SoftEngine) — Liste in Abschnitt 7.0.
     Sie deckt alles seit dem 12.08. Gebaute ab (Wellen C, D, U8/U9,
     N3–N5) plus die Fixe vom 18.08. Dabei: **U10 beobachten**
     (Leerzeichen beim Benennen — Ursache braucht seine Beobachtung,
     nicht weiter im Code suchen, zwei Sitzungen waren erfolglos).
  2. **U4-Entwurfssitzung** (Datencenter + Inspector neu) — braucht den
     Nutzer live im Chat; Grundlagen liegen bereit (Quellen-FORMEN unten,
     Bauteil-Inventur der Analyse, 45-Bedienwege-Zaehlung).
  3. Mini-Frage: `preflight.ts` ist seit dem Punkt-Entfernen ohne
     Aufrufer im Produkt — loeschen (samt Tests) oder behalten?
- **ENTSCHIEDEN 2026-08-18 (Nutzer):** „Angezeigt wird" beim Nachschlagen
  STIRBT (Etappe V0, gebaut) · gelber Punkt WEG (erledigt) · README JA
  (erledigt) · Plan eindampfen JA (erledigt) · **Koralle-Frage: JA** —
  der Editor uebernimmt den Koralle-Akzent der Designsprache
  (Nutzer-Antwort 2026-08-18 abends; umgesetzt wird das erst in U7b/c
  nach U4/U5, die Token-Trennung Editor/Maske bleibt technisch hart).
- **V1, V0, V3, V4 und V5 Stellen 1–5 sind GEBAUT (2026-08-18).** Offen aus
  der Welle V: V5 Stellen 6–8 — die brauchen erst eine Nutzer-Entscheidung,
  s. Etappentext V5.
- **Baubereit ohne weitere Nutzer-Entscheidung** (je Etappe eigenes go;
  fuer V1–V5 liegt ein fertiger Opus-Kopier-Auftrag im Wellen-Kopf V):
  V6 nach Kurzentwurf · G3b → G3c → G4 → G5 (Wellen-Kopf G) · E1 · E3 ·
  U7a · A10 (Technik-Haelfte) · S5.3 (optional) · E2 (nach E1) · F3
  (nach U5/U7). V2 (Erfolgs-Meldungen) ist am 2026-08-18 auf
  Nutzer-Ansage GEPARKT.
- **Neu 2026-08-18 abends: V8 + V9 eingereiht (Nutzer-Befunde aus der
  Bedienung):** Greifen im Raster klappt nur je nach Griffstelle (V8) ·
  bei zwei Tabellen derselben Geber-Quelle bestimmt still die DOM-erste,
  welche Positionen geholt werden (V9). Die Lupen-Ueberdeckung durch den
  Editor-Platzhalter ist direkt gefixt (`.ph-nachschlag`). **V8, V9, V7,
  G1, G2 und G3 sind GEBAUT (2026-08-18).**
  Mit G3 ist die Erfassungszeile einstellungsfrei geworden — sie leitet
  alles aus der Bindung der Spalte und der Verknuepfung des Bausteins ab;
  die Rollen-Maschinerie samt zweiter Bedienstelle am Listen-Eintrag
  (`ListenStelle`) ist ersatzlos ausgebaut, alte Staende raeumt
  `migrateErfassungsRollenWeg` beim Laden.
  **Ehrlichkeits-Korrektur (2026-08-18, spaeter Abend):** G3 ist OHNE
  den Tastenfluss gebaut — `erfassungsLauf` kennt nur Pfeile,
  Enter-Uebernahme und Escape=Liste-zu; kein Springen, kein
  Tab-Verhalten, keine Escape-Stufe 2. Der Tastenfluss stand damit in
  keiner offenen Etappe mehr; er ist jetzt Etappe **G3b**. Dazu kam aus
  der Demo-Abnahme des Nutzers (klickbare Attrappe, 2026-08-18 abends):
  **G3c** (Automatik-Anker — im Zielszenario „Tabelle zeigt
  Belegpositionen" schraenkt heute nichts ein und fuellt sich nichts),
  die G4-Praezisierung „Zellwert zaehlt, Herkunft egal" und **G5**
  (Entschlanken). **G3b, G3c, G4, G5 und G5b (Schalter „Kopfzeile") sind
  GEBAUT (2026-08-18). Die Welle G ist damit fertig bis auf die
  Nutzerprobe.**
  **Branch-Konsolidierung wiederhergestellt (2026-08-18 spaet,
  Nutzer-Auftrag):** alles ist in `main` zusammengefuehrt, gearbeitet
  wird wieder DIREKT auf main (Beschluss 2026-08-05, kein Force noetig —
  main wurde nur vorgespult). Alle `claude/…`-Branches sind geloescht:
  ihr Inhalt steckt in main, oder es waren ueberholte Altstaende
  (Welle R und die Plan-Fassungen 1–4 leben laengst in main bzw. in
  dieser Fassung 6; die Kennungen der geloeschten Staende stehen im
  Chat-Protokoll der Sitzung).
- **Neu 2026-08-18 abends: Welle G beschlossen — Belegerfassung in der
  Tabelle** (eigener Wellen-Kopf zwischen V und E; Vorbild sind die
  WinUI-Screenshots des Nutzers). Reihenfolge: **V7 zuerst** (V7 ist das
  Fundament von G), dann G1 → G4. Dazu eine Nutzer-Ansage vom selben
  Abend, die UEBERALL gilt: **nicht anbauen, wenn Umbauen noetig ist** —
  muss Bestehendes umgebaut werden, damit das Neue passt, wird umgebaut,
  statt drumherum zu erweitern („immer weiter aufbauen verursacht nur
  Wirrwarr").
- **U0-Entscheidungsliste ist BEANTWORTET** (2026-08-12) — die Antworten
  stehen konserviert im Wellen-Kopf U unten. Nicht erneut fragen.

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

## V0 · „Angezeigt wird" stirbt (GEBAUT 2026-08-18)

Gebaut wie beschrieben. Zwei Folgeschaeden mussten mit, sonst waere die
Etappe halb gewesen: der Export bestellte die Felder der
Nachschlage-SPALTEN gar nicht (`benutzteQuellen.ts`, Listen-Bindung mit
`quelleProp` wurde ueber die Quellen in Reichweite aufgeloest statt ueber
die benannte Quelle — seit D4 so, jetzt scharf, weil die Anzeige daran
haengt), und der Preflight meldete dieselben Spalten als „Bindung ohne
Datenquelle". `feldRuntime.ts` blieb unangetastet: es ueberspringt
Nachschlage-Felder ohnehin (`hydrateField`, fruehes return).

Das Nachschlage-Feld verliert die Eigenschaften `anzeigeFeld`/`anzeigeTitel`;
im Feld erscheint kuenftig der Wert der ERSTEN Spalte des Fensters, in der
Steuerung bleibt nur „Gespeichert wird". Automatik ohne eigene Spalten:
eine Spalte = „Gespeichert wird". Migration: traegt ein gespeicherter Stand
ein `anzeigeFeld` und KEINE eigenen Spalten, wird es beim Laden zur ersten
Fenster-Spalte (kein stiller Verlust). „Einzigen Treffer uebernehmen" zeigt
danach ebenfalls Spalte 1.

Fundstellen (Anker): `blocks/formfeld/FormFeldBlock.ts` — defaultProps +
@property `anzeigeFeld`/`anzeigeTitel`, `onLupe`, `uebernimmSatz`,
`spaltenEffektiv` · `blocks/formfeld/nachschlagen.ts` — `nurEineSpalte`,
`automatikSpalten`, `NachschlagenArgs`, `nachschlagEintraege`,
`holeEintraege` · `blocks/formfeld/feldEigenschaften.ts` — die Eintraege
„Angezeigt wird (optional)" (faellt) und „Gespeichert wird" ·
`blocks/formfeld/feldRuntime.ts` — Hydrierung des Anzeigewerts · Migration
auf den ROHDATEN nach dem Muster in `state/migrationenRoh.ts` (VOR
`normalizeProps`, das unbekannte Props sonst still wegwirft) · Tests:
`nachschlagen.test.ts`, `export/nachschlagenExport.test.ts`.
**Runtime-Bytes aendern sich bewusst**; SE-Delta in die Gesamtprobe.

## V1 · Robustheit und Aufraeumen (GEBAUT 2026-08-18)

Gebaut wie beschrieben, mit drei benannten Abweichungen: `jaNeinProperty`
wurde zum Umschalter (`kind: 'segment'`, die Mehrheit der drei Stellen) statt
zur Klappliste — sonst haette die neue gemeinsame Stelle die
Uneinheitlichkeit einbetoniert · `Eingabesitzung` in `PropControl.tsx` ist
UMBENANNT (`BearbeitungsRueckrufe`), nicht geloescht: es sind zwei
verschiedene Dinge mit gleichem Namen, kein Duplikat · der Feld-Vorsatz
bleibt beim Art-Wechsel sichtbar UND wirksam, bis der Bauer ihn selbst
leert. `preflight.ts` ist unangetastet (Mini-Frage unbeantwortet).

- **Popup-Schritt meldet Fehlschlag:** findet `applyPopupStep`
  (`blocks/shared/seAktionen.ts`, Anker `treffer.length !== 1`) sein Popup
  nicht (umbenannt) oder zweimal, kommt kuenftig `meldeFehler` mit dem
  Warum statt stillem Nichtstun.
  ⚠ Widerspruchs-Vermerk: die C3.2-Ansage (2026-08-16) sagte „keine
  Laufzeitmeldung, nichts tun"; der Nutzer hat dem Melde-Vorschlag am
  2026-08-18 zugestimmt. Die Etappen-Ansage nennt diesen Widerspruch
  ausdruecklich, damit die Entscheidung bewusst faellt.
- **Kleinkopien zusammenziehen:** die Ja/Nein-Optionsliste dreimal in zwei
  Reihenfolgen — `blocks/tabelle/tabelleEigenschaften.ts` (Anker
  `[{ value: 'ja'`) und `blocks/formfeld/feldEigenschaften.ts` (Eintrag
  „Einzigen Treffer uebernehmen") stellen auf `shared/jaNeinProperty` um,
  dessen Reihenfolge gilt · die zeilengleichen Parser `folgenAusAttribut`
  (`blocks/shared/auswahl.ts`) und `weitereAusAttribut`
  (`blocks/shared/fremdeQuellen.ts`) werden EIN gemeinsamer Parser (nur
  der ID-Feldname unterscheidet sie) · die kopierte Ziel-Hervorhebung
  `data-ff-ziel` in `KanbanSpalteBlock.ts` und `KanbanZimmerBlock.ts`
  wird ein geteilter Stil. (Die zeichengleichen Dialoghuellen von
  Kommandozentrale/KettenFenster NICHT anfassen — sie sterben in U4/U5.)
- **Restposten:** tote Props am `ui/molecules/side-panel.tsx` (`onBack`,
  `backLabel`, `description` — kein Aufrufer uebergibt sie) · doppelte
  Schnittstelle `Eingabesitzung` in `editor/inspector/PropControl.tsx`
  (die echte wohnt in `controls/eingabeSitzung.ts`) · unbenutztes
  `createStep` in `core/data/aktionen.ts` · fest verdrahtetes
  `speichernDisabled={false}` in `editor/shell/Toolbar.tsx` · wirkungslose
  Bedingung `navZahl[key] !== ''` in `editor/zentrale/Kommandozentrale.tsx`
  · abgerissener Kommentar-Halbsatz in `editor/zentrale/feldZeile.ts`
  (Zeile 1) · in Nutzertexten schliesst ein GERADES Maschinen-Zeichen
  (U+0022) statt des deutschen schliessenden Anfuehrungszeichens (U+201C,
  wie ueberall sonst im Editor — Vorbild: `schrittZusammenfassung.ts`);
  betroffen: `optionColors.ts`, `FieldPicker.tsx`, `Canvas.tsx`,
  `PopupSeite.tsx`, `zentrale/helfer.ts`, `DtkImportForm.tsx` · rohe
  Farbe `hsl(220 13% 78%)` in `editor/canvas/BlockHost.tsx` auf ein
  Editor-Token · Feld-Vorsatz beim Art-Wechsel in
  `editor/zentrale/DataSourceForm.tsx` (Anker `waehleArt`): heute geht er
  still verloren — kuenftig sichtbar behalten oder mit Meldung entfernen.
- Falls der Nutzer die Mini-Frage aus 0.1 mit „loeschen" beantwortet:
  `export/preflight.ts` + `preflight.test.ts` entfernen (ohne Aufrufer im
  Produkt seit dem Punkt-Entfernen; gleiche Gattung wie `warnChecks`, U3).

**Runtime-Bytes aendern sich bewusst** (jaNein/Parser/Ziel-Stil/
Popup-Meldung liegen in `blocks/`); die Editor-Restposten nicht.

## V2 · GEPARKT — Erfolgs-Meldungen (Nutzer-Ansage 2026-08-18: „muss
nicht sein")

Hier stand der Bau von gruenem Meldebalken + Meldungs-Schritt in Ketten
(„Beleg {1} angelegt"). Auf Nutzer-Ansage zurueckgestellt, bevor gebaut
wurde. Nicht von selbst wieder vorschlagen; die Skizze liegt in der
git-Historie dieser Datei (Stand 2026-08-18). Kommt nur wieder, wenn der
Nutzer selbst danach fragt.

## V3 · Nachschlage-Fenster: Groesse am Ding einstellen (GEBAUT 2026-08-18)

ANDERS gebaut als hier beschrieben — Nutzer-Entscheidung 2026-08-18, nachdem
der Plantext sich als undurchfuehrbar erwies: `zieheGroesse` braucht die
Editor-Instanz, das Einstell-Fenster rendert aber der BAUSTEIN in seinem
Shadow-DOM. Die Anfasser sitzen deshalb im geteilten `DialogRahmen`
(Eigenschaft `ziehbar`, nur der Editor setzt sie); er meldet
`ff-dialog-groesse`, das Feld reicht es als `ff-prop-change` weiter. Dafuer
kennt `ff-prop-change` jetzt `geste: 'beginn' | 'ende'` — `useLitElement`
klammert damit ueber `editor.oeffneGeste()` einen ganzen Zug zu EINEM
Undo-Schritt (generisch, fuer jeden Baustein). Preis, den der Weg kostet und
der benannt gehoert: die Anfasser samt Zieh-Schleife liegen im
Laufzeit-Buendel (+2,7 KB), obwohl sie zur Laufzeit nie laufen — eine
Editor-Hilfe im Baustein, gegen den Geist von Regel 1. Wer das aufloest,
stellt zugleich das Popup auf denselben Anfasser um; dann gibt es wieder
EINE Zieh-Mechanik statt der heutigen zwei.

Das Fenster ist heute fest 520x380 — an BEIDEN Stellen in
`blocks/formfeld/nachschlagen.ts`: `oeffneNachschlagen` (Anker
`dialog.breite = 520`) und `spaltenStellenTpl` (Anker `.breite=${520}`).
Neu: zwei Feld-Eigenschaften (defaultProps + @property am
`FormFeldBlock`, Standard 520/380 — Export schreibt automatisch nur
Abweichungen, Mechanik „Standard reist nicht"); beide Fenster-Wege lesen
sie; im Editor-Einstellfenster dieselben zwei Anfasser wie am Popup —
Vorbild WOERTLICH: `editor/canvas/PopupSeite.tsx`, Anker `startResize` /
`zieheGroesse` (die EINE Zieh-Mechanik, nicht neu erfinden). Kein neues
Konzept, keine Migration (neue Props mit Standard).
**Runtime-Bytes aendern sich bewusst.**

## V4 · Tabellen-Zeilenklick als Ketten-Ausloeser (GEBAUT 2026-08-18)

Gebaut wie beschrieben. Dazu kam, statt einer dritten Kopie: die Formel
fuer die Satznummer (`{PINDEX}`) stand wortgleich in `feldRuntime` und
`kanban/seRuntime` und wohnt jetzt als `satzIndexVon` in
`softengine/data.ts` — alle drei lesen dieselbe.

Die Tabelle ist die einzige Datenanzeige ohne `blockEvents`, obwohl die
Zeilen-Aktivierung (D1) intern existiert (`blocks/tabelle/
zeilenAktivierung.ts`, Anker `ZEILE_AKTIVIERT_EVENT`). Neu: `static
blockEvents = [{ key: 'onRowClick', name: 'Zeile gewaehlt' }]` am
`TabelleBlock` — und die Stelle, die die Aktivierung ausloest, ruft
zusaetzlich `runEvent`. Vorbild WOERTLICH: wie das Kanban seine
Karten-Ereignisse deklariert (`KanbanBlock.ts`, Anker `blockEvents`) und
ausloest (`kanban/seRuntime.ts`, Anker `runEvent(`) — dieselben
Kontext-Schluessel sinngemaess; die gewaehlte Zeile ist in Ketten als
Herkunft „gewaehlte Zeile" bereits adressierbar. NICHT im Editor ausloesen
(`data-ff-editor`-Wache wie ueberall). **Runtime-Bytes aendern sich
bewusst.**

## V5 · Waehler-Umstellung: die acht Alt-Stellen (1–5 GEBAUT 2026-08-18)

Der gemeinsame Waehler (`ui/molecules/waehler.tsx`: `WaehlerKnopf` fuer
den zugeklappten Knopf, `WaehlerListe` fuer offene Listen; Vorbild:
`editor/inspector/PropControl.tsx` und `editor/zentrale/
ParameterZeile.tsx`) deckt ~14 von ~22 Auswahlstellen. Die acht
Alt-Stellen einzeln umstellen, je Stelle ein pruefbarer Schritt:

1. `editor/inspector/QuellenListe.tsx` — SelectControl mit
   Kunstwert `'__keine__'` und Kunst-Option „(geloeschte Quelle)".
2. `editor/inspector/AuswahlFolgeSektion.tsx` — SelectControl mit
   `'__keiner__'` und „(geloeschter Baustein)".
3. `editor/inspector/SchluesselPaarZeilen.tsx` — zwei `SchrittSelect`
   ohne Suche ueber potenziell hunderte Felder.
4. `editor/zentrale/DataSourceForm.tsx` — Quellenwahl-SelectControl
   (Anker `— Quelle waehlen —`).
5. `editor/zentrale/StepForm.tsx` — Popup-Seitenwahl per SchrittSelect
   (Anker `keine Popup-Seite vorhanden`).
6. `editor/zentrale/RelationAuswahl.tsx` — handgebaute Knopfliste
   (WaehlerListe hat Suche + Gruppen eingebaut).
7. `editor/zentrale/FeldUebernahmePicker.tsx` — eigener
   Zwei-Stufen-Picker.
8. `editor/canvas/FieldPicker.tsx` — das rohe optgroup-`<select>` im
   `felder`-Block (90 Zeilen ueber der WaehlerListe derselben Datei).

Mit der Umstellung sterben die fuenf Leer-Beschriftungen („— keine —" /
„— keins —" / „— keinem —" / „— Quelle waehlen —" / „— Quelle —") und
die Kunst-Optionen fuer Geloeschtes von selbst (der Waehler zeigt
Geloeschtes rot). Editor-only: **Buendel und Referenz bleiben
byte-gleich.**

**Stand 2026-08-18: Stellen 1–5 gebaut. 6, 7 und 8 sind KEIN mechanischer
Tausch — sie warten auf eine Nutzer-Entscheidung:**
- **6 RelationAuswahl:** sucht heute ueber Name, Nummer UND Syntax
  (`relationMatchesSearch`), hat Lesen/Schreiben-REITER mit Trefferzaehlern,
  zweizeilige Eintraege (`verb · Nr.`) und Syntax-Tooltip. Der Waehler sucht
  nur Name + Kennung, zeigt Gruppen statt Reiter, kennt eine Zeile. Umstellen
  = das alles wegwerfen. Frage an den Nutzer: aufgeben oder Stelle so lassen?
- **7 FeldUebernahmePicker:** zweistufig (Quelle → Feld, mit „← Quellen“), und
  im Modus `ziel === 'idb'` ist die QUELLE die Antwort — dort gibt es keine
  Felder. Der Waehler kennt keine zweite Stufe. Frage: Waehler um eine
  zweite Stufe erweitern (eigene Etappe) oder Stelle so lassen?
- **8 FieldPicker `felder`-Block:** technisch blockiert. Der Block sitzt IN
  einem `AuswahlFenster`; ein `WaehlerKnopf` oeffnet ein ZWEITES als eigenes
  Portal an `document.body`. Das aeussere schliesst bei jedem `pointerdown`
  ausserhalb seines Teilbaums (`auswahl-fenster.tsx`, Capture-Phase —
  `stopPropagation` im inneren Fenster kommt zu spaet), also wuerde ein Klick
  in die innere Liste den FieldPicker zuklappen und die Wahl verschlucken.
  Erst muss `AuswahlFenster` verschachtelte Fenster kennen (eigene Etappe,
  beruehrt alle ~15 Waehler-Stellen).

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

## V7 · Zusammenlegungen (Fundament fuer neue Bausteine) (GEBAUT 2026-08-18)

- **Nachschlage-Fenster einmal bauen:** Editor-Weg (Lit-Template) und
  Laufzeit-Weg (imperativ) erzeugen dasselbe Fenster heute doppelt und
  weichen schon ab (z-index nur im einen, data-Attribut nur im anderen).
  EINE Bau-Funktion, zwei duenne Aufrufer.
- **Inline-Umbenennen einmal:** die BasicBlock-Fassung wird nach `shared/`
  gehoben, die Spaltentitel-Fassung (`spaltenBearbeiten`) ruft sie.
- **Gemeinsamer Daten-Vorspann fuer Datenanzeigen:** Tabelle und Kanban
  holen ihre Zeilen mit sechs identischen Schritten (Quelle finden →
  rowsFor → Tagesfilter → Feldleser → Auswahl wiederfinden). EINE geteilte
  Funktion in `shared/`; jede kuenftige Datenanzeige startet damit bei
  drei Zeilen. Runtime aendert sich bewusst; SE-Delta in die Gesamtprobe.

Gebaut wie beschrieben: `blocks/shared/umbenennen.ts` (der eine Griff,
BasicBlock und Spaltentitel rufen ihn) · `blocks/shared/datenVorspann.ts`
(`holeDatenVorspann`; Tabelle und Kanban starten damit) · das
Nachschlage-Fenster hat EIN Geruest (`fensterTpl` in `nachschlagen.ts`):
die Laufzeit rendert dasselbe Template in einen Halter am body, die
gewollten Unterschiede (ziehbar + z-index 40 nur Editor, Marker
data-ff-nachschlagen nur Laufzeit) stehen benannt an EINER Stelle.
Referenzabzug blieb gruen (Export ausserhalb des Buendels byte-gleich).

## V8 · Greifen wird zuverlaessig (GEBAUT 2026-08-18)

**Belegtes Problem:** Das Verschieben im Raster startet nur, wenn der
pointerdown bis zum CanvasNode-Wrapper durchbubbelt
(`editor/canvas/CanvasNode.tsx`, Anker `ziehePosition`). Etliche Stellen
IM Baustein fangen ihn mit `stopPropagation` ab — ob Greifen klappt,
haengt davon ab, WO im Baustein der Bediener zupackt. Belegte
Abfang-Stellen: die Lupe (`blocks/formfeld/nachschlagen.ts`, Anker
`@pointerdown` im `nachschlagFeldTpl`) · die Spalten-Steuerung
(`blocks/tabelle/spaltenBearbeiten.ts`, Anker `@pointerdown=${stop}`) ·
die `stop`-Durchreichung der Tabelle (`blocks/tabelle/TabelleBlock.ts` →
`tabelleAnsicht`/`tabelleKoerper`, jede `@pointerdown`-Verwendung von
`stop` einzeln pruefen) · weitere `pointerdown`-stops in `blocks/**`
(greppen: `pointerdown` in blocks/, jede Stelle einzeln ansehen).

**Regel danach (EINE fuer alle Bausteine):** Druecken + Bewegen (ab der
bestehenden 4-px-Schwelle `ZUG_SCHWELLE` in `editor/canvas/rasterMove.ts`)
zieht IMMER den Baustein, egal wo gegriffen; Klicken ohne Bewegung bleibt
Klicken (waehlen, Lupe, Picker — deren Verhalten haengt an CLICK-Handlern
und bleibt unveraendert). Umsetzung: die `stopPropagation`-Aufrufe auf
POINTERDOWN in Baustein-Inhalten entfernen (die auf CLICK bleiben!);
rasterMove schluckt den Folge-Klick ohnehin nur bei echtem Zug.
AUSNAHMEN, die ihr pointerdown-stop BEHALTEN: die Editor-Anfasser und
Knoepfe des BlockHost/der PopupSeite (bedienen den Zug selbst) und alles
im DialogRahmen/AuswahlFenster (Fenster sollen nie ziehen).
NICHT Teil dieser Etappe: der FLUSS-Zweig (Container-Kinder ziehen per
nativem HTML5-Drag, `draggable` in CanvasNode) — eigenes Thema, nur
benennen, nicht mit umbauen.
Die Lupen-Ueberdeckung durch den Platzhalter ist bereits separat gefixt
(`.ph-nachschlag`, Commit vom 2026-08-18).
**Runtime-Bytes aendern sich bewusst** (blocks/-Stellen).
Gebaut wie beschrieben: die vier pointerdown-Stops in Lupe, Spalten-Knoepfen
und Suchfeld sind weg, die Regel steht als Kommentar bei `ZUG_SCHWELLE`
(`editor/canvas/rasterMove.ts`) — die Ausnahmen (Anfasser, Fenster) blieben.

## V9 · Hol-Quellen: der Geber wird eindeutig (GEBAUT 2026-08-18)

**Belegtes Problem:** Zeigen ZWEI Bausteine dieselbe Geber-Quelle (zwei
Beleg-Tabellen), ist „die gewaehlte Zeile der Quelle" mehrdeutig —
`gewaehlteZeileDerQuelle` (`blocks/shared/holendeQuellen.ts`) nimmt heute
still den ERSTEN Baustein in DOM-Reihenfolge, der irgendeine Auswahl
traegt. Je nach Auswahl-Zustaenden bestimmt mal die eine, mal die andere
Tabelle, welche Positionen geholt werden — fuer den Bediener
unvorhersehbar (genau der gemeldete Fall: Tabelle 2 „beeinflusst"
Tabelle 3, obwohl deren Folge auf Tabelle 1 zeigt).

**Regel danach: der letzte Klick gewinnt.** Der Auswahl-Zustand
(`blocks/shared/auswahl.ts`, Anker `const zustand = new Map`) merkt sich
je Eintrag eine laufende Wahl-Nummer; `gewaehlteZeileDerQuelle` nimmt
unter allen Gebern derselben Quelle die JUENGSTE Auswahl (Abwahl faellt
auf die naechstjuengere zurueck, keine = leer). Deterministisch und
intuitiv: die Positionen folgen dem zuletzt angeklickten Beleg, egal in
welcher Tabelle. Im selben Zug: `letzterAbdruck` in `holendeQuellen.ts`
wird bei `setzeAuswahlZurueck` mit geleert (Befund der Analyse: bleibt
heute stehen und unterdrueckt danach das Neu-Holen).
**Runtime-Bytes aendern sich bewusst**; SE-Delta in die Gesamtprobe.
Gebaut wie beschrieben: der Auswahl-Zustand traegt eine Wahl-Nummer
(`auswahlNummer`), `gewaehlteZeileDerQuelle` nimmt die juengste, und
`letzterAbdruck` haengt per `beimAuswahlZuruecksetzen` am Zuruecksetzen. Die
Such-Wurzel ist uebergebbar geworden (Muster `applyPopupStep`), weil ein
DOM-Test eine neue Testumgebung waere — jsdom gibt es im Projekt nicht.

Nicht in V, sondern in U4/U5: einheitliche Erfolgs-/Fehlermeldungen des
EDITORS, das Master-Detail-Duplikat im Datencenter, EIN Speicherverhalten,
Loesch-Regel-Anwendung (U0-3) auf die restlichen confirm()-Stellen.

---

# Welle G — Belegerfassung in der Tabelle (beschlossen 2026-08-18)

Nutzer-Beschluss vom 2026-08-18 (eigenes Gespraech mit Screenshots der
echten WinUI-Belegerfassung; Praezisierungen im Analyse-Chat). Ziel:
Positionen DIREKT in der Tabelle erfassen, wie in der echten
SoftEngine-Belegerfassung — so schnell wie moeglich, komplett ohne Maus
moeglich (Maus geht immer). Massstab ist Tempo fuer geuebte Bediener,
nicht Barrierefreiheit. **V7, das Fundament, ist GEBAUT (2026-08-18):**
ein Nachschlage-Fenster statt zwei, ein Daten-Vorspann, ein Umbenennen.

**Leitsatz (Nutzer):** Alles, was die Maske selbst wissen kann, fuellt
sie selbst — angehalten wird nur, wo ein Mensch entscheiden muss. Alles
Automatische bleibt uebersteuerbar: Tab/Enter rauschen darueber hinweg,
Pfeiltasten und Klick erreichen trotzdem jede Zelle.

**Abgrenzung:** G erfasst POSITIONEN in einen bestehenden Beleg
(PUT_RELATION 82, belegt im behandlung-Log 2026-08-12, s. CLAUDE.md
„Neue BELEGPOSITION"). „Beleg anlegen und sofort sehen" (R4) bleibt
gestrichen. Geschrieben wird NUR ueber die sichtbare Kette am neuen
Ereignis (dasselbe Muster wie „Karte verschoben" beim Kanban) — kein
Auto-PUT, die Zusage bleibt.

**Das Bild:** Die Erfassungszeile ist die naechste freie Zeile der
Tabelle — eine FAEHIGKEIT des Tabellen-Bausteins (Registry-Props), KEIN
neuer Baustein; eine Tabelle ohne Erfassungszeile exportiert byte-gleich
wie heute. **An der Erfassungszeile wird NICHTS eingestellt**
(Nutzer-Entscheidung 2026-08-18): sie leitet alles aus zwei Angaben ab,
die es beide schon gibt — der Bindung der Spalte (am Spaltenkopf, wie
immer) und der Verknuepfung des Bausteins („Woran erkennt man die
zusammengehoerige Zeile?", Inspector, Prop `weitereQuellen`). Im Editor
zeigt die Zeile darum nur Striche, keine Lupe und kein Rollen-Fenster;
die Lupe am Formularfeld bleibt unberuehrt. Kern:
`blocks/tabelle/erfassungsZellen.ts`.

Daraus die drei Zellenarten:

- **Kein Feld gebunden** (z. B. Menge): frei tippen, keine Vorschlaege.
- **Feld der Tabellen-Quelle** (z. B. `3_18`): tippen → Vorschlagsliste
  direkt unter der Zelle (bis ~8 Treffer; gesucht wird in Nummer UND
  Bezeichnung — Profis tippen „bay" fuer Baytril; angezeigt und
  mitdurchsucht wird die erste ANDERE Spalte derselben Quelle). Enter
  auf LEERER Zelle oeffnet das grosse Stamm-Fenster.
- **Feld einer verknuepften Quelle** (z. B. `q-tier::5_4`): dasselbe,
  aber nur die Saetze, deren Schluessel zum gewaehlten Satz der
  Tabellen-Quelle passen. Genau EIN Treffer fuellt sich selbst.

Die Uebernahme gilt immer fuer die GANZE Quelle: wer den Artikel waehlt,
fuellt jede Spalte dieser Quelle mit — in beide Richtungen, das Suchwort
darf auch in der Bezeichnungsspalte stehen. Ein neuer Satz der
Tabellen-Quelle loest die verknuepften Saetze (sie hingen an seinem
Schluessel) und bestimmt sie neu. Kein Partner gefunden → die Zelle
bleibt leer, die Zeile bleibt stehen.

**MESSLATTE (Nutzer-Abnahme an der klickbaren Demo, 2026-08-18 abends) —
jede G-Etappe wird an diesem Szenario gemessen:** Die Tabelle zeigt die
Positionen des gewaehlten Belegs (Quelle der Tabelle = Belegpositionen).
Spalten Artikelnummer + Bezeichnung sind an die ARTIKEL-Quelle gebunden;
Tierart, Verabreichung und Wartezeit je an ihre eigene Quelle,
selektiert ueber Artikelnummer bzw. Artikelnummer + Tierart; Menge frei.
Erwartung: Artikel tippen („bay") → waehlen → Nummer UND Bezeichnung
stehen da, der Cursor springt weiter · die Tierart-Liste zeigt nur die
Tierarten DIESES Artikels; genau eine → fuellt sich selbst samt
Verabreichung/Wartezeit, der Cursor landet auf der Menge · Menge tippen,
Enter → Zeile bleibt stehen, naechste Zeile · EIN Knopf schreibt alle
erfassten Zeilen untereinander. **Dazu die Nutzer-Entscheidung
„Formularfeld-Prinzip": es zaehlt, was in der Zelle STEHT — Herkunft
egal (gewaehlt oder frei getippt), keine Pruefung, keine Warnung.**

**Tasten (der Kern des Ganzen):** Enter uebernimmt den markierten
Vorschlag und springt zur naechsten TIPPBAREN Zelle — es oeffnet nie
erneut · Tab/Enter ueberspringen Zellen, die sich selbst gefuellt haben ·
genau EIN moeglicher Treffer fuellt sich selbst (Ein-Treffer-Automatik) ·
Escape zweistufig: erst Liste zu, dann Zelle leeren · Enter auf der
letzten Zelle = „Zeile erfasst" — die Zeile wird normale Position, die
Erfassung rueckt eine Zeile tiefer, der Cursor steht auf der ersten
tippbaren Zelle · F3 wird nur abgefangen, solange der Fokus in der
Maske liegt (sonst Browser-Suche!) — im Echttest bestaetigen, Enter ist
der Hauptweg.

**Speichern: NICHT je Zeile** (Nutzer-Entscheidung 2026-08-18; hier stand
bis dahin „je Position einzeln, sofort bei ,Zeile erfasst'"). Der
Bediener erfasst beliebig viele Zeilen, ohne dass irgendetwas ins ERP
geht. Geschrieben wird erst auf Knopfdruck — ein normaler
Knopf-Baustein mit der ueblichen Relations-Kette, die dann einmal je
erfasster Zeile laeuft (Etappe G4). Dass die frischen Positionen ueber
den normalen SE-Push in der Tabelle erscheinen, ist Echttest-Punkt,
kein Bau-Punkt.

## G1 · Vorschlagsliste am Formularfeld (der geteilte Kern) (GEBAUT 2026-08-18)

Die Tipp-Vorschlagsliste entsteht EINMAL als geteiltes Teil
(`blocks/shared/`); das Formularfeld (Typ `nachschlagen`) bekommt sie
zuerst: Tippen ins Feld zeigt Treffer aus der Quelle, Pfeil hoch/runter
waehlt, Enter uebernimmt, Escape schliesst; Enter auf LEEREM Feld
oeffnet das grosse Fenster (heute geht das nur ueber die Lupe). Die
Uebernahme beim Waehlen ist DIESELBE wie beim Fenster-Zeilenklick
(Anker `onUebernehmen`/`oeffneNachschlagen` in
`blocks/formfeld/nachschlagen.ts`) — herausziehen und teilen, nicht
kopieren. V7 ist gebaut: das Fenster hat EIN Geruest (`fensterTpl`),
G1 baut dagegen, nicht gegen zwei Fassungen.
**Runtime-Bytes aendern sich bewusst.**

## G2 · Erfassungszeile: Zeile und Befuellen (GEBAUT 2026-08-18)

Der Tabellen-Baustein bekommt den Schalter „Erfassungszeile" — ein
Registry-Prop, kein Sondercode; neue Props = Round-Trip-Fall im
Export-Test (Regel 9). Laufzeit: die gebundene Zelle nutzt die
G1-Vorschlagsliste und das grosse Fenster, die ungebundene tippt frei.
In G2 noch OHNE das volle Tasten-Ballett und OHNE Schreiben.
**Runtime-Bytes aendern sich bewusst.**

**Nutzer-Korrektur (2026-08-18, waehrend des Baus):** Die
Erfassungszeile ist die naechste FREIE Zeile — direkt unter der letzten
Datenzeile, leere Tabelle → Zeile 1 ganz oben. Nicht unten am
Tabellenrand hinter den Fuellzeilen.

## G3 · Die Zelle leitet sich ab (GEBAUT 2026-08-18 — ohne Tastenfluss, s. G3b)

**Nutzer-Entscheidung 2026-08-18:** An der Erfassungszeile wird nichts
mehr eingestellt — keine Rolle je Zelle, keine eigene Quelle je Spalte,
keine Vorbelegung, keine Lupe in der Zelle. Was eine Zelle tut, steht
schon in der Bindung der Spalte und in der Verknuepfung des Bausteins
(die bleibt, wo sie ist: Baustein-Prop `weitereQuellen`, eingestellt im
Inspector — kein Umzug ins Datencenter, keine zweite Terminologie).
Die drei Zellenarten und die Uebernahme-Regeln stehen im Wellen-Kopf.

Der hier urspruenglich mit eingeplante Tastenfluss wurde NICHT
mitgebaut (Ehrlichkeits-Korrektur in 0.1) — er ist Etappe G3b.

**Gestrichen, nicht wieder vorschlagen:** die Vorbelegung („Menge 1" per
Doppelklick in die Zelle) · die Rollen Nachschlagen/Folgt/Frei · die
Nachschlage-Quelle an der Spalte.

**Enter auf der letzten Zelle laesst die Zeile STEHEN** (Nutzer-Ansage
2026-08-18, siehe G4): sie wird die Zeile der Position und bleibt
sichtbar. Die Erfassung rueckt eine Zeile tiefer, der Cursor steht auf
deren erster tippbarer Zelle. **Kein Raeumen, kein Zuruecksprung in
dieselbe Zeile** — und weiterhin kein Schreiben und kein Ereignis:
geschrieben wird erst in G4, ueber den Knopf.
**Runtime-Bytes aendern sich bewusst.**

## G3b · Der Tastenfluss (zack, zack, zack) (GEBAUT 2026-08-18)

Nur Bedien-Logik an der bestehenden Erfassungszeile, kein neues Konzept:

- Enter/Tab uebernehmen den markierten Vorschlag und springen zur
  naechsten LEEREN Zelle — Selbstgefuelltes wird uebersprungen; Pfeile
  und Klick erreichen trotzdem jede Zelle (Leitsatz im Wellen-Kopf).
- Escape zweistufig: erst Liste zu, dann Zelle leeren; das Leeren loest
  auch den gewaehlten Satz der Zellen-Quelle (sonst stuende der Wert
  beim naechsten Rendern wieder da).
- Enter in einer Zelle, fuer die es keinen einzigen moeglichen Satz
  gibt (kein Partner), springt weiter statt nichts zu tun.
- „Enter auf der letzten Zelle = Zeile erfasst" kommt erst mit G4 —
  G3b baut das Springen INNERHALB der Zeile.
- F3 bleibt zurueckgestellt (Echttest-Vorbehalt, Wellen-Kopf); Enter
  ist der Hauptweg.

Der Tasten-Entscheid bleibt browserfrei pruefbar (`erfassungsLauf` /
`vorschlagListe.tastenFolge`); nur das Fokus-Setzen selbst lebt in der
Bedienung. **Runtime-Bytes aendern sich bewusst.**

## G3c · Automatik-Anker: die werdende Zeile liefert die Schluessel (GEBAUT 2026-08-18)

**Befund (Demo-Abnahme 2026-08-18):** Einschraenkung und
Ein-Treffer-Automatik haengen am gewaehlten Satz der TABELLEN-Quelle
(`erfassungsLauf.ts`, Anker `fuelleVerknuepfte` / `eintraege`). Im
Messlatten-Szenario ist die Tabellen-Quelle „Belegpositionen" — beim
Erfassen einer NEUEN Position gibt es diesen Satz nie. Folge heute:
nichts schraenkt ein, nichts fuellt sich; die Komfort-Automatik
funktioniert nur, wenn die Tabelle den ARTIKELSTAMM anzeigt (so sind
die G3-Tests gebaut) — genau andersherum als das Zielszenario.

**Umbau:** Fehlt der Satz der Tabellen-Quelle, liefern die BEREITS
GEWAEHLTEN Saetze der verknuepften Quellen die Schluesselwerte der
werdenden Zeile — der gewaehlte Artikel liefert die Artikelnummer usw.
Ein Schluesselwert wird generisch aufgeloest: erst am Satz der
Tabellen-Quelle (wie heute), sonst ueber die Verknuepfungs-Paare an
jedem anderen gewaehlten Satz. Einschraenkung und
Ein-Treffer-Automatik laufen ueber diese Werte; die Automatik greift
nur, wenn mindestens ein Schluesselwert bekannt ist (sonst wuerde ein
einziger Satz im Stamm sich ungefragt selbst waehlen). Tests: das
Messlatten-Szenario als eigener Fall in `erfassungsLauf.test.ts` —
Tabellen-Quelle Positionen, Artikel verknuepft, KEIN gewaehlter
Positions-Satz. **Runtime-Bytes aendern sich bewusst.**

## G4 · Erfasste Zeilen stehen lassen + EIN Knopf schreibt sie (GEBAUT 2026-08-18)

**Endgueltige Nutzer-Entscheidung 2026-08-18** — sie ersetzt den
vorherigen G4-Text vollstaendig (der wollte ein Ereignis „Zeile erfasst"
je Zeile und einen Ketten-Wert nur fuer frei getippte Zellen; beides ist
weg, nicht wieder vorschlagen).

- **Die Erfassungszeile IST die Tabellenzeile.** Der Bediener fuellt sie
  Spalte fuer Spalte, drueckt Enter → genau diese Zeile bleibt sichtbar
  stehen und ist ab da die Zeile der Position. Dabei wird **nichts
  geschrieben und kein Ereignis gefeuert.** Die Erfassung rueckt eine
  Zeile tiefer — selbes Spiel, beliebig viele Zeilen.
- **Geschrieben wird ueber EINEN Knopf:** ein normaler Knopf-Baustein, an
  dem der Nutzer seine Relations-Kette baut, exakt wie heute bei den
  Formularfeldern. Beim Klick laeuft die Kette **einmal je erfasster
  Zeile.**
- **Neuer Herkunftstyp fuer Ketten-Parameter:** „Wert aus Erfassungszelle
  <Spalte>" — liefert je Lauf den Wert der jeweiligen Zeile, fuer ALLE
  Spalten verfuegbar (nicht nur fuer frei getippte).
  **Praezisiert (Nutzer-Entscheidung 2026-08-18, Formularfeld-Prinzip):**
  geliefert wird IMMER der sichtbare Zellwert — Herkunft egal, gewaehlt
  oder frei getippt, keine Pruefung, keine Warnung.
- **Nach dem Lauf werden die erfassten Zeilen geleert;** die echten
  Positionen kommen ueber den SE-Push zurueck.

**Zum Pruefpunkt PUT_RELATION 82:** Der Mechanismus selbst ist
PUT-agnostisch — die Kette baut der Nutzer sichtbar, G4 verdrahtet
keine Relation fest. Die Deutung der `0` und der Leerstellen (CLAUDE.md
„Neue BELEGPOSITION") gehoert damit zum KETTEN-Bau des Nutzers und zum
SE-Echttest, nicht zum Code dieser Etappe. SE-Echttest durch den
Nutzer. **Runtime-Bytes aendern sich bewusst.**

## G5 · Entschlanken (GEBAUT 2026-08-18, inkl. G5b „Kopfzeile")

Gebaut: Schalter „Schlank" · Fusszeile nur bei Bedarf · Spaltenname als
Platzhalter in leeren Erfassungszellen · Inspector-Text berichtigt.
**G5b (eigenes go): Schalter „Kopfzeile"** — bei „aus" faellt die
Titelzeile in Editor UND Maske (WYSIWYG; die Rumpf-Messung rechnet ohne
Kopf mit Hoehe 0). Die Bedien-Antwort: GEBUNDEN wird per Klick auf eine
Zelle im Editor (derselbe Feld-Picker wie am Kopf, nur bei Kopf aus
aktiv); UMBENANNT wird, indem man die Kopfzeile kurz einschaltet — ein
Inline-Umbenennen in Strich-Zellen waere fragile DOM-Turnerei und ist
bewusst nicht gebaut. Sortieren per Titelklick entfaellt an der Maske
ohne Kopf (im Inspector-Text benannt).

Nutzer-Wunsch, an der Demo gesehen und abgenommen (2026-08-18):

- **Schalter „schlank"** am Tabellen-Baustein (Registry-Prop wie
  „Suchzeile"): Tafel-Rahmen weg, Polster enger, die Tabelle liegt
  buendig auf der Maske. Standard bleibt das heutige Aussehen —
  Bestandsmasken exportieren byte-gleich.
- **Fusszeile nur bei Bedarf:** die Zeile „X Saetze · Seite n" erscheint
  nur, wenn wirklich geblaettert wird oder ein Filter aktiv ist. Kein
  eigener Schalter.
- **Spaltenname als grauer Platzhalter in leeren Erfassungszellen**
  (Formularfeld-Prinzip, „der Klarname ist die Vorschau") — hilft auch
  MIT Kopfzeile.
- **Schalter „Kopfzeile aus"** NUR zusammen mit der Antwort, wo dann
  gebunden/umbenannt wird (Vorschlag: Klick auf die Erfassungszelle
  oeffnet den Feld-Picker des Kopfes) — und mit dem Wissen, dass
  Sortieren per Titelklick an der fertigen Maske entfaellt. Wenn das
  beim Bau nicht sauber aufgeht: weglassen und dem Nutzer sagen, die
  Platzhalter-Loesung reicht womoeglich.
- Im selben Zug: der Inspector-Erklaertext der „Erfassungszeile"
  beschreibt noch die gestrichene G2-Rollen-Welt
  (`tabelleEigenschaften.ts`, Anker `'Erfassungszeile'`) — berichtigen.

**Runtime-Bytes aendern sich bewusst.**

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

1. **Nutzer:** Gesamtprobe (7.0) + U10-Beobachtung +
   preflight-Mini-Frage. (Koralle ist beantwortet: JA, s. 0.1.)
2. **Welle V:** ~~V1 → V0 → V3 → V4 → V5 → V8 → V9 → V7~~ (GEBAUT).
   V6 braucht zuerst den Kurzentwurf mit dem Nutzer und tritt hinter
   Welle G zurueck (Nutzer-Prio 2026-08-18).
3. **Welle G:** ~~G1 → G2 → G3~~ (GEBAUT) → G3b → G3c → G4 → G5.
4. **Innenumbau:** E1 → E3 → E2; A10 nur bei Bedarf; V6 nach
   Kurzentwurf, sobald der Nutzer ihn will.
5. **Neuentwurf:** U4 (Entwurfssitzung mit dem Nutzer) → U5 → U7a → U7b/c
   → F3.

Etappen aus 2. und 3. duerfen sich mit 4. verzahnen, solange Regel 3.1
(ein Thema, ein Commit) und EIN federfuehrender Agent je Arbeitsbaum
gelten.

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
