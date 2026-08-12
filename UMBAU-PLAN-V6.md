# Umbau — Fassung 6 (endgueltiger Gesamt-Bauauftrag)

Stand der Analyse: 2026-08-10  
Gepruefte Ausgangsbasis: Commit `8c03dc5` plus der unten benannte, noch nicht
committete POS/VAR-Arbeitsstand  
Ersetzt als Baugrundlage:

- `C:\Users\mu.aycetin\Downloads\UMBAU-PLAN.md` (Codex, Fassung 4)
- `C:\Users\mu.aycetin\Downloads\UMBAU-PLAN-FINAL.md` (Opus, Fassung 5)

Dieser Plan ist noch **keine Erlaubnis, Code zu aendern**. Vor der ersten
Umsetzung gilt weiterhin: Plan zeigen, ausdrueckliches `go` des Nutzers
abwarten.

---

## 0. Fuer einen neuen Chat — zuerst lesen

Der Nutzer arbeitet in **mehreren Chats**. Ein neuer Chat weiss nichts vom
vorherigen. Diese Seite ist die einzige Uebergabe.

### 0.1 Wo wir stehen

**Pflicht beim Start jedes Chats — beides lesen, nicht nur eins:**

```text
git log --oneline -8
```

<!-- Diese Zeilen werden nach JEDER fertigen Etappe aktualisiert. Das ist
     keine Chronik, sondern der Zeiger. Nicht laenger werden lassen. -->

- **Neu beauftragt 2026-08-12: Welle U** — Generalsanierung der
  Editor-Bedienung (Steuerung, Inspector, Palette, Begriffe, Meldungen,
  Optik), eigener Wellen-Kopf hinter R. Sie ersetzt F1/F2 (dort vermerkt)
  und ist ab jetzt der Arbeitsschwerpunkt. Gebaut wird sie von
  OPUS-Sitzungen ueber die Kopier-Auftraege im Wellen-Kopf U; der
  Planer-Chat liest nur Diffs. U0 (Entscheidungsliste) wartet auf die
  Ja/Nein-Antworten des Nutzers.
- **Welle R:** R1+R2 gebaut, zweifach nachgebessert, und der KERN des
  SE-Echttests ist am **2026-08-12 BESTANDEN** (Nutzer: Beleg-Klick fuellt
  die Positionen; nach Nachbesserung 1 auch alte Nummernkreise). Noch ohne
  Protokoll aus der R2-Probe: PUT ueber eine Kette auf eine geholte
  Position, Verknuepfung an geholter Zeile, Abwahl. Neu beauftragt:
  **R3** (Beleg per Nachschlage-Formularfeld waehlen), **R4** (Beleg
  anlegen und sofort sehen — WARTET auf das Anlege-Protokoll, GET 1020),
  **R5** (Refresh-Flut/Zeilenfilter — BAUBAR, FREISELEKT-Form am
  2026-08-12 aus `Desktop\VORLAGEN` belegt). Details im Wellen-Kopf R.
- **Stand 2026-08-12 abends:** Welle N (Ansichten + Navi) eingeschoben;
  Design-Mix `designsprache/mix-fellnase-empfang.html` gebaut
  (Fellnase-Basis + empfang-Zutaten) — wartet auf das Nutzer-Urteil,
  ebenso das Popup-Overlay-Konzept (U0-7). Baubar per Opus-Kopier-Auftrag:
  R3, R5, U1, U2, U3, U6; danach N1/N2/N3.
- **Letzte fertige Etappe:** R2-Nachbesserung (2026-08-12, zwei Commits) nach
  dem ersten SE-Echttest der Welle R — 261er-Belegnummern lieferten 255
  Leerzeichen, 262er lieferten Positionen. (1) Der Export bestellt die vier
  Schluessel der Hol-Relation jetzt bei der GEBER-Quelle mit
  (`holSchluesselJeGeber` in `export/benutzteQuellen` -> `felderFor`):
  Jahr/Archiv standen in keiner FELDER-Bestellung, gingen darum LEER hinaus,
  und leer findet belegt nur den aktuellen Nummernkreis. (2) Die
  Antwort-Erkennung des Laders nimmt nur noch die belegte RESULT-Form
  (`extractSatzAntwort` in `softengine/relations`) — vorher galt jeder
  Schluessel der RESULT_KEYS-Liste, und weil LEER hier „Ende der Liste"
  bedeutet, haette ein Fremdpaket mit leerem ID-Feld die Positionsliste still
  mittendrin abgeschnitten. Runtime-Bytes aus (2) absichtlich neu.
  Der Kern des SE-Echttests ist danach bestanden (s. o.).
  Davor: C1 (2026-08-11, vorgezogen: A9/A10 haengen an
  den offenen Nutzer-Proben) — das Popup komponiert den geteilten
  `DialogRahmen` (`blocks/shared/DialogRahmen.ts`), sein eigener
  Zwillings-Rahmen und `POPUP_RAND` sind weg; X-Vertrag steht (Maske:
  schliessen · Editor: zur Hauptseite via `PopupSeite`, nie loeschen);
  kein aria-modal vorm Fokus-Fang C3.3, Rumpf bleibt alleiniger
  Scroll-Besitzer, Kinder bleiben im Flow (Raster = C2).
  Browser-/SE-Probe offen, buendelt sich mit den unten offenen Tests.
  Davor: R2 (2026-08-11, im zweiten Anlauf) — davor S2.1,
  P2/Symbole, P1 (Messen), A7.3,
  A7.2, A7.1, A6, A5, A4, A3, S3, S2, A2.1, A2, A1, A0, A8.1, A8.2.
  Der ERSTE R2-Commit (31f8d94) war funktionslos und mit rotem Pruefbuendel
  eingecheckt (sah nie eine Auswahl, legte Zeilen an eine Stelle, die kein
  Leser kennt); die Reparatur ersetzt ihn: Lader `softengine/relationLader.ts`
  (seriell, Generationszaehler, Ende-Erkennung, Felder hinter dem
  255er-Schnitt je eigene Frage, Deckel 999 mit Klartext), Ausloeser
  `blocks/shared/holendeQuellen.ts` (laedt nur bei WIRKLICH geaenderter
  Geber-Zeile), Zeilen-Speicher `softengine/geholteZeilen.ts` (ueberlebt
  jeden Push; rowsFor liest ihn als letzten Weg), Export gibt `zusatzFelder`
  mit. Dabei zwei Altfehler behoben: getField trimmte den SATZ-Rohstring
  VOR dem Ausschnitt (Spaltenversatz; Referenz behandlung Z. 598 trimmt
  nicht), und ein Antwort-Paket konnte ZWEI Fragen der GET-Warteschlange
  beantworten (runNextGet jetzt per queueMicrotask). Runtime-Bytes
  absichtlich neu; **SE-Echttest steht aus.**
  S2 hat Runtime-Bytes geaendert: die SoftEngine-Probe der Tabelle
  steht noch aus. S3 ist ohne seinen dritten Eingriff (React.memo) gebaut —
  warum, steht im Commit; die Flaeche rendert weiter komplett, nur billiger.
  **S4 ist geprueft und AUSGELASSEN** (s. Etappenkopf S4) — damit ist die
  Welle S abgearbeitet, bis auf das optionale S5 und den Nachschlag S2.1.
- **Was P1 gemessen hat (2026-08-11) — die Rangliste, gegen die P2 baut:**
  Vorbuendeln der Fremdpakete 2303 ms, davon **lucide-react 1616 ms (70 %)** und
  1 139 089 Byte JS + 2,24 MB Quellkarte (46 % aller vorgebuendelten Bytes) fuer
  46 von 2007 Symbolen · Startgraph **192 eigene Module / 27 947 Zeilen, KEIN
  einziger dynamischer Import** — alles laedt beim ersten Bild, darunter 215 KB
  Export-Rohtext (ff-runtime 179 KB + zwei CSS), die erst der Export-Klick
  braucht (`editor/shell/Toolbar.tsx:18`) · `vite build` 2064 Module, 4,53 s ·
  vitest steckt fast alles in Import und Transformation und fast nichts in die
  Tests selbst (rund 80 s / 30 s gegen 2 s), aber diese drei Zahlen streuen von
  Lauf zu Lauf um mehr als ein Drittel — sie taugen als Verhaeltnis, nicht als
  Messpunkt.
  **Die Verschlechterung ist gefunden und heisst Wachstum des Startgraphs:**
  gleiche node_modules, gleiche Testdatei, nur anderer Quellstand — 2026-07-30
  137 Module / transform 903 ms / import 1,37 s, heute 192 / 1,62 s / 2,32 s
  (je bestes von drei Laeufen, +80 % bzw. +69 %); der Sprung liegt zwischen dem
  03. und 07.08. (+45 Module). Die harte Zahl daran ist die Modulzahl, die
  Zeiten stuetzen sie nur.
  **Nicht gebaut, weil gemessen unkritisch:** die Verlaufs-Kopie
  (`state/Editor.ts:184`) kostet 0,059 ms bei der Referenzmaske und 4,65 ms bei
  1021 Knoten — und laeuft EINMAL je Geste, nicht je Ereignis (Tippen und Ziehen
  sind geklammert). Regel 10: kein Aliasing-Risiko im Undo fuer nichts.
- **Was P2 gebaut hat (2026-08-11):** die 46 benutzten Symbole liegen als eigene
  Daten im Projekt (`ui/zeichenDaten.ts`) mit EINER Fabrik daneben
  (`ui/zeichen.ts`), 33 Import-Stellen umgestellt. Gemessen danach: Vorbuendel
  ohne lucide (7,72 s → 5,82 s, deps-Ordner 6986 → 3678 KB — die 1,14-MB-Datei,
  die der Browser beim Start holte, gibt es nicht mehr), `vite build`
  2064 → 299 Module (4,53 s → 3,01 s), Bundle
  895,98 → 894,21 kB (also gleiche Optik, nicht weniger Symbole). **An den
  vitest-Zeiten aendert es nichts, und das ist kein Widerspruch:** keine der 40
  Testdateien erreicht die Symbol-Module ueberhaupt (statisch nachgegangen). Ein
  erster Messwert schien etwas anderes zu sagen; er war Cache-Glueck. Export-Bytes,
  Runtime-Buendel und Referenzabzug unveraendert. Nebenbefund, festgehalten weil
  er eine Grenze schaerft: der fachliche Core hatte seinen Symbol-Typ von
  lucide-react geborgt und umging damit `no-restricted-imports` nur, weil das
  Paket nicht `react` heisst; er hat jetzt einen eigenen frameworkfreien Vertrag
  (`BausteinSymbol`), die EINE Umdeutung steht in `BlockPalette.tsx`.
- **Was S2.1 gebaut hat (2026-08-11):** der Rest unter der letzten Zeile wird
  auf die Zeilen VERTEILT (`blocks/tabelle/seitengroesse.ts`, `zeilenmass`) —
  jede Zeile ist um Rest/Anzahl hoeher, die Fusszeile sitzt buendig, die ANZAHL
  bleibt am Grundtakt. Der KOPF bleibt ebenfalls am Grundtakt (zwei
  CSS-Variablen, `--takt` und `--zeilen-hoehe`): waechst er mit, aendert er den
  Platz, den die Messung gerade verteilt hat, und die Tabelle zappelte zwischen
  zwei Zeilenzahlen. Der Zeilen-Waehler ist WEG, mit ihm die Props `proSeite`
  und `zeilenWaehler`, die Inspector-Eigenschaft, `ZEILEN_PRO_SEITE`/`PASSEND`
  und die Sitzungs-Uebersteuerung. Die A4-Falle ist geschlossen ueber
  `weggefalleneProps` in `state/migrations.ts` (Typ + Name, ohne Bedingung, KEIN
  Schema-Bump — die 6 bleibt fuer C2 frei); drei Faelle in
  `state/teilverlust.test.ts` halten fest, dass ein Altbestand mit gesetztem
  Waehler laedt, eine wirklich unbekannte Eigenschaft an derselben Tabelle aber
  weiter sperrt. Runtime-Bytes ABSICHTLICH geaendert (183 332 -> 182 719),
  `build:runtime` liegt im Commit. **Die SoftEngine-Probe der Tabelle deckt
  jetzt S2 UND S2.1 ab.** Ausdruecklich anzusehen, weil ich es nicht kann: passt
  nur EINE Zeile in die Tabelle, wird diese Zeile bis zu doppelt so hoch — die
  direkte Folge der Verteil-Entscheidung, kein Fehler, aber ein Anblick.
- **Was A5 gebaut hat (2026-08-11):** `state/duplizieren.ts` — zweiphasiges
  Klonen (Knoten kopieren, DANN Verweise umschreiben) samt der EINEN Liste aller
  Felder, die eine Baustein-id tragen (`schreibeBlockReferenzenUm`: geberId,
  popupId, blockId in params/extraParams). Wer eine vierte Referenz einbaut,
  ergaenzt sie DORT und in `core/data/schrittPruefung.ts`. `cloneSubtree` in
  treeOps ist ersetzt, nicht daneben liegen geblieben. pageBlock-Duplizieren
  meldet null (bleibt bis C3.1 gesperrt); eine Kopie direkt auf der Hauptflaeche
  bekommt die freie Zeile (`freiePositionFuerKopie` in rasterOps), Popup-Inhalt
  nicht — das entscheidet C3.1.
- **Was A6 gebaut hat (2026-08-11):** die globalen Kuerzel (Delete/Strg+Z/
  Strg+D) pruefen den ganzen `composedPath()` statt nur `event.target` und
  schweigen, wenn ein Eingabefeld im Pfad liegt. **Der Zeiger im Etappenkopf A6
  war falsch:** der Listener steht nicht in `Toolbar.tsx:221` (das ist der
  Escape-Horcher des Weitere-Aktionen-Menues), sondern in
  `state/useKeyboardShortcuts.ts`. Er ist der EINZIGE globale Horcher mit
  loeschenden Befehlen — alle anderen (Toolbar, Inspector, FieldPicker,
  FormularKarte, Kommandozentrale, FeldUebernahmePicker) hoeren nur auf Escape,
  und ein Menue soll auch beim Tippen schliessen.
- **Was A7.1 gebaut hat (2026-08-11):** `Subject.notify` ruft jeden Horcher in
  seinem eigenen try/catch (Fehler auf die Konsole, nie verschluckt), und
  `Editor.notify` plant den Autosave im `finally`. Der Repro-Fall steht in
  `state/speicherPanne.test.ts` und faellt ohne den Fix nachweislich um.
- **Was A7.2 gebaut hat (2026-08-11):** zwei zentrale Vertraege in
  `state/history.ts`, beide vom Store weitergegeben. `Editor.transaktion(fn)` =
  synchrone Mehrfachschreibvorgaenge mit try/finally (Aufrufer: addPopupPage,
  PropControl 2x, FeldBindung 2x — alle vorher blankes begin/end).
  `Editor.oeffneGeste()` = Token fuer Gesten ueber mehrere Ereignisse, oeffnet
  beim ersten echten Schritt, schliesst GENAU EINMAL und laesst sich danach
  nicht wieder oeffnen (Aufrufer: zieheGroesse, eingabeSitzung — die hatten je
  eigene Merker dafuer). **Achtung fuer die naechste Etappe:** `Editor.ts` ist
  damit bei 487 Zeilen, also 13 unter dem Deckel — wer dort etwas ergaenzt,
  braucht vorher einen Schnitt-Commit (Plan 3.1).
- **Was A7.3 belegt hat (2026-08-11) — und was daraus folgt, ist OFFEN:** drei
  Faelle in `blocks/shared/auswahl.test.ts`. Ein Kreis aus TABELLEN endet
  (direkt wie indirekt): ihre Hydrierung kann eine Auswahl nur AUFHEBEN, der
  Zustand schrumpft. Ein Kreis aus zwei NACHSCHLAGE-Feldern mit „einziger
  Treffer = ja" endet NICHT: `pruefeEigenenWert`
  (`blocks/formfeld/FormFeldBlock.ts:420`) leert bei Nichtpassen und uebernimmt
  danach den einzigen uebrigen Satz — es kann also auch SETZEN. Bei
  unsymmetrischen Schluesselfeldern erklaeren sich beide Felder abwechselnd
  gegenseitig fuer unpassend; die Nachmeldeschleife in `melde()` laeuft
  unbegrenzt (mit Rundendeckel 500 nachgeprueft), der Reiter friert ein.
  **Kein Produktcode dazu** — laut Etappentext A7.3 entscheidet der Nutzer, ob
  gewarnt, blockiert oder nichts getan wird (Warn-Anzeigen sind ohnehin
  gestrichen, s. S1). Der Test haelt den Fall mit einer Notbremse fest, damit
  das Pruefbuendel nicht haengt.
- **Was S5.1 gebaut hat (2026-08-11) — SE-ECHTTEST STEHT AUS:** eine IDB-Quelle
  bestellt statt `FELDER:'*'` die explizite pos_len-Liste der benutzten Felder.
  Gesammelt wird in `export/benutzteQuellen.ts` (`benutzteFelderJeQuelle`),
  entschieden in `core/data/dataSources.ts` (`felderFor`, jetzt mit dem
  benutzten Satz als zweitem Argument). Die Liste ist vollstaendig, weil die
  laufende Maske KEIN Feld-Woerterbuch hat — FF_DATA_SOURCES traegt nur
  id/name/tableId/indexField, alles andere reist als Attribut; abgezaehlt werden
  genau die sieben Schreibstellen des Exports (Kopf der Funktion). Sicherheitsventil:
  kein benutztes Feld gefunden ODER ein Code, der kein pos_len ist -> `*` bleibt.
  Referenzmaske vorher `*`, nachher `0_10,40_20,10_5,30_10,20_10,50_10`;
  Stamm-Quellen unveraendert. HTML-Bytes und `ff-runtime.js` unveraendert —
  geaendert hat sich nur eine Zeile in `maske.sevariablen.json.snap`.
  **Der Kontrakt ist fuer IDB NICHT belegt** (beide Chef-Masken: IDB immer `*`);
  faellt der Echttest durch, wird der Commit per `git revert` zurueckgenommen,
  nicht nachgebessert. Vorbereitend verhaltensneutral geschnitten:
  `collectDataSources` zog aus `exportMask.ts` aus (stand auf 498 von 500 Zeilen),
  die vier neuen Faelle stehen in `export/felderBestellung.test.ts`.
- **Was S5.2 gebaut hat (2026-08-11) — DERSELBE SE-ECHTTEST DECKT ES MIT AB:**
  Kopfsatz-Quellen (POS) stehen in den SEvariablen jetzt ZULETZT
  (`loopReihenfolge` in `core/data/dataSources.ts`). Anlass ist ein
  A/B-Echttest des Nutzers: POS an erster Stelle -> KEINE Quelle liefert Daten,
  auch die Stammtabellen dahinter nicht; POS zuletzt -> alles liefert. Das ist
  im Gegensatz zu S5.1 ein BELEGTER Kontrakt, er steht deshalb in CLAUDE.md
  unter „SoftEngine-Kontrakte". Merkmal ist die Arten-Spalte `kopfsatzMoeglich`
  (war schon da, keine neue noetig), kein `if ID === 'POS'`. HTML-Bytes,
  `ff-runtime.js` und Referenzabzug unveraendert — die Referenzmaske fuehrt
  keine Kopfsatz-Quelle.
- **Was R1 gebaut hat (2026-08-11):** die Lade-Art „Zeilen per Relation
  holen" an Modell (`core/data/ladeRelation.ts`), Steuerung und Export.
  Sichtbar im Datenquellen-Formular der Belegpositionen sind NUR
  „Woher kommen die Zeilen?", die Relationsnummer und „Beleg kommt aus";
  die vier Feld-Zuordnungen (2_1/3_8/0_1/1_1) und die Ende-Felder
  (11_6+18_25) sind belegte Standards und reisen unsichtbar mit
  (Nutzer-Ansage 2026-08-11: keine Eingaben, die niemand versteht; erste
  Formfassung mit sichtbaren Feldcodes + Erklaertext ist verworfen). Eine
  holende Quelle bestellt KEINE SEFILELOOP (kein Kopfsatz, kein VAR); die
  Hol-Relation reist in FF_DATA_SOURCES. HTML/Runtime sonst unveraendert,
  Referenzabzug gruen. **In SoftEngine laedt R1 bewusst noch nichts — das
  ist R2 (Laufzeit; inzwischen gebaut, s. oben).**
- **Naechste Etappe:** Welle U, Etappe fuer Etappe per Opus-Kopier-Auftrag
  (Wellen-Kopf U); daneben R3, sobald der Nutzer es zieht. A9/A10 bleiben
  liegen, bis die gesammelten Bedienproben nachgeholt sind.
  **P1, P2 und S2.1 sind fertig** (s. die Zeilen oben); von P1s Rangliste sind ZWEI Posten
  bewusst offen und je eine eigene Nutzer-Entscheidung, weil sie mehr Risiko als
  Gewinn tragen: die 215 KB Export-Rohtext beim Start liessen sich nur ueber ein
  spaeteres Nachladen loesen, und das macht aus dem Export-Klick einen
  asynchronen Weg (zwei Downloads, nicht ohne Browserprobe zu verantworten) ·
  der Startgraph ohne jedes Code-Splitting ist der groesste Posten ueberhaupt,
  aber sein Zerschneiden ist ein eigenes Paket, kein Tempo-Commit.
  **B1 ist GESTRICHEN** (Nutzer 2026-08-11, s. Etappenkopf B1) —
  Block 2 hat damit keinen Bau-Anteil mehr. **A7.3 ist ABGESCHLOSSEN**
  (Nutzer 2026-08-11): Entscheidung „nichts tun" (Regel 10), s. Etappenkopf
  A7.3 — der Beleg-Test bleibt.
  **S1 ist GESTRICHEN** (Nutzer-Ansage 2026-08-10,
  s. Etappenkopf S1 — nicht wieder vorschlagen), **S5.1 und S5.2 sind gebaut
  und warten auf DIESELBE eine SE-Probe, S5.3 (Diagnose-Anzeige) ist offen und
  braucht sein eigenes `go`**. Die Welle S (sichtbare Fehler
  und Tempo) war am 2026-08-10 nach der Zwischenbilanz vor A3 eingeschoben
  worden (Nutzer-Entscheidung, Begruendung im Wellenkopf S). A9 setzt A3 bis
  A7 voraus.
- **Arbeitsbaum:** sauber; main liegt mehrere Commits vor origin/main, der
  Push steht aus (vorher `git fetch`, Regel 8 — nie force-pushen).
- **Was A3 gebaut hat (2026-08-10), damit A4 daran anschliesst:** die geteilte
  Lade-Kette `state/ladeKette.ts` mit `pruefeBaumStand` (feste Reihenfolge:
  Zukunft abweisen → migrieren+bereinigen → Vertragspruefung) und dem Ausgang
  `ok | migriert | quarantaene` samt `LadeProblem`-Liste · der Riegel
  `state/speicherGate.ts` vor BEIDEN Schreibwegen (persistState +
  VorlagenStore) · `notfallkopie.sichereQuarantaene` (Rohkopie mit
  Zeitstempel, ueberschreibt nie) · die Sperransicht `app/Sperransicht.tsx`
  mit den drei Wegen. **Der Schalter fuer A4 ist EINE Zeile:**
  `verlustPruefen` in `persistence.loadFromStorage` steht auf `false` — der
  Browser-Weg duennt bis A4 aus wie bisher, der Datei-Weg sperrt schon.
  Bewusst UNVERAENDERT: ein unlesbarer Stand (kaputtes JSON) laeuft weiter
  ueber den bewaehrten Weg Notfallkopie + Meldung + leer starten und sperrt
  NICHT.
- **Was A4 dazugelegt hat (2026-08-10):** derselbe Verlust-Vertrag fuer BEIDE
  Wege — der `verlustPruefen`-Schalter ist ersatzlos weg, der Browser-Weg
  sperrt jetzt auch bei Teilverlust · `state/topologie.ts` (eine Wurzel,
  Seiten nur direkt unter der Wurzel, keine Seite in einer Seite, Beziehungen
  beidseitig, jeder Knoten genau einmal, `canContain` fuer jede Kante) ·
  `pruefeDatenquellen`/`pruefeRelationsVorlagen` in `core/data` (additiv, die
  alten `sanitize*` delegieren) · `core/data/ladeProblem.ts` mit
  `EintragProblem`/`LadeProblem` + den drei Bereichsnamen ·
  Bibliotheks-Quarantaene im `VorlagenStore` (ein kaputter Eintrag sperrt,
  statt die Bibliothek auszuduennen) · der Riegel SAMMELT mehrere Quellen
  (Maske + Bibliotheken) und `verwerfeGesperrteStaende` raeumt genau deren
  Schluessel. **Wichtiger Nebenbefund, beim Bauen gefunden:** die zwei
  Rohdaten-Migrationen (Vorlagen-Kasten, Knopf aus Tabelle) melden jetzt ihre
  absichtlich entfernten ids — ohne das haette der neue Schutz jeden
  Altbestand mit Vorlagen-Kasten gesperrt (und der Datei-Weg tat genau das
  schon vorher).
  **Offenes Risiko, das A4 mitbringt (nicht selbst pruefbar):** ein
  Browser-Stand, dessen Bereinigung heute etwas wegwirft, fuehrt ab jetzt
  in die Sperransicht statt still zu laden. Bei einem vom Editor selbst
  geschriebenen Stand kann das nicht passieren (er reist verlustfrei hin und
  zurueck); bei einem von Hand bearbeiteten oder sehr alten schon. Der Weg
  heraus ist die Sperransicht — sie loescht nichts ohne Bestaetigung.
- **Teilweise gebaut — A2.1 ist NICHT vollstaendig:** gebaut sind
  `schemaAdvanced` (frueher `migrated`), `resaveNeeded` an der Editor-Grenze
  und `absichtlichGeleert` (die namentlich gemeldeten Stellen des
  Demotext-Putzers). NICHT gebaut ist `problems` — dafuer gibt es heute
  keinen Aufrufer, und Regel 10 verbietet Bauen auf Verdacht. Ebenfalls offen,
  weil es Schema 6 voraussetzt: die Ausnahmeliste fuer die erlaubten
  Popup-Raster-/Breiten-Diffs und die Zusage „auch ein leeres Schema-5-Popup
  setzt schemaAdvanced". Beides gehoert in C2, wenn Schema 6 wirklich kommt.
  Ausserdem melden die vier `migrate*`-Funktionen weiterhin nur ein Boolean,
  keine Pfade — solange eine Schemastufe lief, bleibt die
  Detail-Verlustpruefung der Maskendatei also weiter ganz aus.
- **Offene Baustelle, bewusst stillgelegt:** der VAR-Abschnitt des Exports
  (offener Satz) ist NICHT gebaut. `lieferung`/`istOffenerSatz` in
  `core/data/dataSources.ts` ruft niemand auf, `exportMask` schreibt keinen
  VAR-Abschnitt. Die Bauanleitung steht als `it.todo` in
  `src/export/datenquellen.test.ts`. Ohne VAR ist die Quellen-Art
  „Belegpositionen" in SoftEngine nicht nutzbar.

**Widersprechen sich diese Zeilen und `git log`, gewinnt `git log`.** Der
Zeiger ist von Hand gepflegt und kann vergessen worden sein; Commits nicht.
Deshalb wird nach jeder Etappe committet — das ist die eigentliche Uebergabe
zwischen zwei Chats, nicht dieser Absatz.

**Offene Entscheidungen des Nutzers — ein neuer Chat FRAGT, entscheidet nicht:**

1. ~~Soll A9 (SoftEngine-Vorher-Beleg) VOR A1 laufen?~~ **Ueberholt
   2026-08-10:** der Nutzer gab `go` fuer A1, A1 ist gebaut. Fuer den Vertrag
   `aus` kann A9 kein „Vorher" mehr belegen — was auch vorher schon kaum ging:
   eine Kette mit `aus` ueberlebte weder ein Neuladen noch die Maskendatei,
   und in der Maske selbst verwarf `parseBlockEvents` sie ebenfalls. Ein
   Vorher-Lauf haette diesen Punkt seiner eigenen Liste also gar nicht pruefen
   koennen. Fuer alle anderen Vertraege (Datenpush, Tabelle/Kanban, Popup,
   Nachschlagen) ist A9 unveraendert sinnvoll.
2. ~~A0 Schritt 3: Schriftgroessen auf ein Token heben?~~ **Gestrichen
   2026-08-10 (Nutzer-Ansage):** die Frage kam in jedem neuen Chat wieder hoch,
   ohne je etwas zu blockieren. `text-[0.6875rem]` bleibt, wie es ist. Nicht
   ohne neue Nutzer-Entscheidung wieder aufmachen.
3. ~~Wer pflegt diese Datei?~~ **Beantwortet 2026-08-10:** Sie liegt jetzt im
   Repo und wird nach jeder Etappe im selben Commit mitgezogen. Damit ist die
   git-Historie die Sicherung, nicht mehr ein einzelner Arbeitsbaum. Es pflegt
   weiterhin genau EIN Chat gleichzeitig; andere schlagen Aenderungen im Chat
   vor.
4. **Export-Sockel akzeptieren?** 97 % jeder Exportdatei sind fester Sockel
   (Runtime 178 KB mit allen 11 Bausteintypen + Schrift 26 KB); Nutzerdaten
   reisen nur mit, wenn sie verwendet werden (Zwischenbilanz 2026-08-10,
   `exportMask.ts:274-353`). Empfehlung: akzeptieren, solange das Laden in
   SoftEngine nicht nachweislich stoert; „Export nur mit verwendeten
   Bausteinen" waere ein eigenes spaeteres Paket. — OFFEN, ein neuer Chat
   fragt.
5. ~~F1 (Entwurfsgespraech Steuerung/Inspector) vorziehen?~~ **Beantwortet
   2026-08-12:** Ja, und groesser als gedacht — der Nutzer hat die
   Generalsanierung der GESAMTEN Editor-Bedienung beauftragt („die
   funktionen sind gut, die umsetzung ist widerlich"). F1/F2 sind in der
   neuen Welle U aufgegangen; ihre Regeln gelten dort weiter. Die
   Bedien-Befunde der Zwischenbilanz (sechs Bauformen fuer „Feld einer
   Quelle waehlen", namenlose Inspector-Sektionen, StepForm in der
   340-px-Spalte, roher Jargon trotz Klartext in `helfer.ts:50-59`) sind
   Eingabe der Inventur 2026-08-12 im Wellen-Kopf U.

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
Plan. Nach der Etappe: Pruefbuendel, Ansage des Ergebnisses, warten. Der
Nutzer testet, wann es ihm passt, und schreibt dann das naechste `go`.

Commits bleiben klein (ein Thema, ein Commit) — das kostet den Nutzer nichts,
er liest sie nicht. Was ihn kostet, ist die Browserprobe: die wird pro
**Block** gebuendelt, siehe Abschnitt 5.

---

## 1. Auftrag und Endziel

Der Editor wird nicht neu geschrieben. Der vorhandene Bau wird so aufgeraeumt,
dass danach neue Funktionen nicht mehr auf widerspruechlichen Regeln,
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
11. der Besitz von Editor, Datenquellen und Relationen bewusst vereinheitlicht
    oder vom Nutzer ausdruecklich als verbleibende Grenze akzeptiert ist;
12. Relationen-/Aktionsbedienung und Designsprache nach den bestehenden
    Nutzerentscheidungen abgeglichen sind;
13. alle fuenf verbindlichen Code-Pruefungen gruen sind und die vom Nutzer
    durchgefuehrten Browser-/SoftEngine-Proben bestanden wurden;
14. keine ersetzte Altimplementierung parallel liegen bleibt.

Das Ziel ist kein theoretisch perfekter Code. Das Ziel ist ein wartbares,
verlustsicheres Fundament fuer die naechsten Produktfunktionen.

---

## 2. Bereits entschiedene Leitlinien

Diese Punkte werden nicht erneut als technische Grundsatzfrage an den Nutzer
zurueckgegeben, solange er sie nicht selbst aendert:

- **Kein Komplett-Neubau.** Gute vorhandene Grenzen bleiben erhalten.
- **Kein neues State-Framework.** Redux, Zustand oder Vergleichbares loest
  die gefundenen Fehler nicht.
- **React bleibt Editor-Chrome, Lit/Web Components bleiben sichtbare
  Maskenbausteine und Runtime.**
- **Vererbung ist nicht das Hauptproblem.** `BasicBlock` darf gemeinsames
  Lit-Verhalten weiter vererben. Metadaten werden spaeter kompositorisch aus
  einer Definition gelesen.
- **Popup ist Block und Seite/Flaeche zugleich.** Es bleibt im `BlockTree`;
  kein separater Popup- oder Surface-Store.
- **Popup wird eine echte Rasterflaeche.** Das ist Teil dieses Umbaus und
  nicht mehr zurueckgestellt.
- **Nachschlagen ist kein Popup-Seitenknoten.** Es bleibt ein fluechtiger
  Laufzeitdialog.
- **Tabelle wird im Nachschlagen komponiert, nicht beerbt.**
- **`aus` bleibt ein gespeicherter Parameterzustand und liefert an seiner
  Syntaxposition einen leeren String.** Es wird nicht als normale sichtbare
  Quelle in jedes Auswahlfeld aufgenommen.
- **Export wird einmal eingefroren und danach ueber zwei bewusste Knoepfe
  angefordert.** Kein automatischer Doppeldownload und vorerst kein ZIP.
- **Popup-Runtime hat genau ein aktives Popup.** Oeffnen eines Ziels schliesst
  andere Popups. Ein Modal-Stack wird nicht nebenbei erfunden.
- **Popup-Namen sind nichtleer und eindeutig.**
- **`childIds` bleiben die logische DOM-/Tab-Reihenfolge.** Bei der
  Schema-6-Migration sowie nach Einfuegen, Verschieben, Reparenting und
  Duplizieren auf einer Rasterflaeche wird diese Reihenfolge nachvollziehbar
  oben-nach-unten, links-nach-rechts abgeglichen; bei geometrischem Gleichstand
  bleibt die vorherige Reihenfolge stabil.
- **Ein Dialog hat genau einen Scroll-Owner.** Doppeltes Scrollen in Rahmen
  und Inhalt ist verboten.
- **Popup-Escape-Verhalten wird nicht nebenbei erweitert.** Vorhandene
  Schliesswege bleiben; Fokus und Tastaturgrenzen werden trotzdem korrekt.
- **Keine neue Testgattung.** Bestehende Unit-, Export-, Persistenz-,
  Referenz- und Runtime-Pruefungen duerfen und muessen wachsen.
- **Browser- und SoftEngine-Proben macht der Nutzer.** Der Agent liefert eine
  kurze Klickanleitung mit sichtbaren Soll-Ergebnissen und behauptet keine
  selbst durchgefuehrte Bedienpruefung.

Festgelegte Popup-Geometrie fuer den ersten sicheren Rasterstand:

- dasselbe 24-Spalten-Raster wie die Hauptseite;
- 520 px ist heute die **Standardbreite**, nicht die Mindestbreite; bisher
  sind 240 px erlaubt;
- Schema 6 hebt die gespeicherte Mindest- und Istbreite bestehender Popups
  unter 520 px bewusst auf 520 px an. Das ist eine benannte sichtbare
  Migration und kein stilles CSS-Clamping;
- ist der Host schmaler als Rahmen plus 520 px, bleibt der Dialograhmen im
  Viewport und die eine Popup-Surface scrollt horizontal wie vertikal. Das
  Raster selbst wird nicht unter 520 px zusammengedrueckt;
- bestehende 12 px Innenabstand werden bewusst beibehalten, bis der spaetere
  Designabgleich etwas anderes entscheidet;
- Rasterabstand kommt aus der einen gemeinsamen Rasterregel, nicht aus einem
  zweiten Popup-Wert.

Damit ist auch fuer bestehende 240- bis 519-px-Popups und fuer kleine Hosts
deterministisch festgelegt, was sich aendert.

---

## 3. Harte Arbeits- und Sicherheitsregeln

### 3.1 Ein Thema, ein Commit

Jede unten nummerierte Etappe beziehungsweise Unteretappe ist eine eigene
fachliche Aenderung. Zwei Dinge werden nicht deshalb zusammengelegt, weil sie
dieselbe Datei beruehren.

Insbesondere getrennt bleiben:

- Datenrettung und sichtbarer Umbau;
- Dialograhmen und Popup-Raster;
- allgemeine Tabellenaktivierung und Fremddatenmodus;
- Fremddatenmodus und Nachschlage-Integration;
- verhaltensneutrale Dateischnitte und fachliche Aenderungen;
- Registry-Umbau und Property-Validierung;
- Architektur und Designpolitur.

### 3.2 Bestehende Arbeit gehoert dem Nutzer

- Keine der vorhandenen Aenderungen wird verworfen, zurueckgesetzt oder
  still ueberschrieben. (Erledigt fuer den Stand vom 2026-08-10: die 13
  Dateien liegen in vier benannten Commits.)
- Kein anonymer Stash ist die einzige Sicherung.
- Vor Arbeitsbeginn und vor jedem Push gilt `git fetch`.
- Ist `origin/main` voraus, wird zuerst dessen Stand angesehen und sauber
  zusammengefuehrt.
- Kein Force-Push.
- Umsetzung hat genau einen federfuehrenden Agenten im Arbeitsbaum.
  Zweitpruefungen laufen nacheinander und read-only, bis der federfuehrende
  Agent sie uebernimmt.

### 3.3 Verbindliches Pruefbuendel

Vor jedem Commit einmal gebuendelt:

```text
npx tsc -b
npx eslint src
npm run check:regeln
npm run check:runtime
npm test
```

`npx eslint .` ist nicht der heutige Projektvertrag und wird nicht als
zusaetzliche rote Ampel in den Bauauftrag geschmuggelt. Soll spaeter das
Lint-Scope erweitert werden, ist das ein eigener Werkzeug-Commit.

Bei einer beabsichtigten Runtime-Aenderung kann `check:runtime` beim ersten
Lauf rot werden und das frisch gebaute Bundle liegen lassen. Dann gilt:

1. Diff des Bundles lesen;
2. nur erklaerbare Bytes akzeptieren;
3. erneut laufen lassen;
4. kein Runtime-Diff darf als blindes Nebenprodukt mitgenommen werden.

Bei einem beabsichtigten Exportwechsel darf der Referenzabzug aktualisiert
werden. Der neue Snapshot wird nicht „passend gemacht", sondern sein
vollstaendiger Diff wird als sichtbarer Teil des Commits geprueft.

### 3.4 Ablauf je Etappe

0. **Ansage nach Abschnitt 0.2 — vor jedem Code.** Was, warum (mit
   `datei:zeile`), wo im sichtbaren Editor, was der Nutzer prueft, was der
   Agent nicht pruefen kann. Danach `go` abwarten. Ohne Ansage kein Commit.
1. Federfuehrender Agent liest die betroffenen Pfade und nennt den genauen
   Schnitt.
2. Nur die Etappe wird implementiert.
3. Eigenes Code-Urteil: Datenfluss, Fehlerpfade, Cleanup, Export und
   Rueckwaertskompatibilitaet lesen.
4. Bestehende Testarten um die konkreten Regressionen erweitern.
5. Fuenf Pruefungen einmal gebuendelt ausfuehren.
6. Agent liefert eine kurze Nutzer-Klickanleitung und nennt, was nur in
   SoftEngine pruefbar ist.
7. Nutzer fuehrt Browserprobe aus; bei Runtime-/Exportaenderung auch
   SoftEngine-Probe.
8. Bei einem Fehler wird nur dieselbe Etappe korrigiert und das Pruefbuendel
   danach erneut ausgefuehrt.
9. Erst bei bestaetigtem Stand committen, danach vor einem Push nochmals
   `git fetch`.

### 3.5 Sofortige Stopps

Eine Etappe wird nicht weitergebaut, wenn:

- Nutzerbestand nicht gesichert ist;
- der Arbeitsbaum unerwartete neue Aenderungen enthaelt;
- eine Pruefung ohne erklaerte Ursache rot ist;
- ein Snapshot oder Runtime-Bundle ausserhalb der beabsichtigten Wirkung
  veraendert wird;
- eine Migration Knoten, Props, Ereignisse, Quellen oder Relationen verliert;
- alter Bestand nur durch manuelle Reparatur geoeffnet werden koennte;
- Editor und Export dieselbe Eigenschaft unterschiedlich darstellen;
- eine Nutzerprobe vom beschriebenen Soll abweicht.

Es wird nicht mit „spaeter reparieren" ueber einen roten Zwischenstand hinweg
weitergebaut.

---

## 4. Ehrlicher Ausgangszustand

**Die urspruengliche Fassung dieses Abschnitts war an drei Stellen falsch.**
Nachgemessen am 2026-08-10, unmittelbar vor A0:

| Behauptet | Gemessen |
| --- | --- |
| 18 geaenderte Dateien | **13** (`git diff --stat`: 430+/53−) |
| `check:regeln` rot, `exportMask.ts` 512 Zeilen | **gruen**, 491 Zeilen |
| 432 Vitest-Tests gruen | **431 Tests, davon 1 rot** |

Was davon stimmte: `HEAD` war `8c03dc5`, TypeScript/eslint/Runtime-Bundle
waren gruen — und das **rohe Nullbyte im Regelwaechter** gab es wirklich
(`scripts/check-regeln.mjs`, Byte 14375, ausgerechnet im Erklaertext zum
eigenen Steuerzeichen-Verbot).

Der rote Test war `datenquellen.test.ts` „bestellt den offenen Satz im
VAR-Abschnitt": eine vorausgeschriebene Erwartung ohne Umsetzung. Auf
Nutzer-Entscheidung 2026-08-10 als `it.todo` stillgelegt statt geloescht oder
passend gemacht — das Pruefbuendel bleibt damit ein brauchbares Signal, und
die fehlende Haelfte bleibt im Code sichtbar.

**Lehre fuer jeden folgenden Chat: nachmessen, nicht nachlesen.** Diese Datei
ist von Hand gepflegt; `git log` und die Pruefungen sind es nicht.

Stand nach A0 (Baseline `6640ac1` + die drei Commits dieser Etappe): alle
fuenf Pruefungen gruen, Arbeitsbaum sauber.

---

# Welle S — Sichtbare Fehler und Tempo (eingeschoben 2026-08-10)

Nutzer-Entscheidung 2026-08-10 nach der Zwischenbilanz (vier gebuendelte
Code-Untersuchungen; die Belege stehen unten je Etappe): Diese Welle laeuft
VOR den restlichen A-Etappen. Grund: A3 bis A8 sind fuer den Nutzer
unsichtbar — die taeglich sichtbaren Aergernisse (Scheinzeile in der
Tabelle, traeger Editor, langsames Laden) blieben sonst wochenlang stehen
und kosten genau das Vertrauen, das der Umbau aufbauen soll.

Fuer alle S-Etappen gilt:

- KEIN Umbau nebenbei, KEIN neues Framework, KEINE neue Testgattung.
- Jede Etappe nennt die maschinelle Grenze, die ihr Diff NICHT
  ueberschreiten darf (bytegleiche Pruefungen). Ueberschreitet er sie
  unerklaert, gilt Abschnitt 3.5: sofortiger Stopp.
- Ansage- und go-Ritual aus 0.2/0.3 gelten unveraendert.

## S1 · GESTRICHEN — es wird keine Warn-Anzeige gebaut

**Nutzer-Ansage 2026-08-10, wenige Stunden nach Aufnahme in den Plan.**
Hier stand eine Etappe, die die 14 unsichtbaren Preflight-Meldungen als
Klartext-Liste zurueckgeholt haette (Befund: `Kommandozentrale.tsx:56-59`
filtert auf eine Art, `Toolbar.tsx:59-66` zeigt nichts mehr). Der Nutzer
will das NICHT: Bedienfehler verantwortet er selbst, der Editor soll
funktionieren, nicht erziehen. Es wird KEINE Warn-Anzeige gebaut und
dieser Punkt wird nicht wieder vorgeschlagen (dasselbe Muster wie die
gestrichene Rubrik „Aufgefallen unterwegs" in CLAUDE.md). `preflight.ts`
bleibt unangetastet liegen; ob der eine vorhandene gelbe Punkt in der
Steuerung irgendwann faellt, waere eine eigene kleine Nutzer-Entscheidung.
Der volle Etappentext steht in der git-Historie (`6ce5695`).

## S2 · Tabelle: der bemalte Reststreifen

### S2.1 · Nachschlag: Rest verteilen, Zeilen-Waehler faellt (GEBAUT 2026-08-11)

Die Nutzerprobe zu S2 ergab: die vorgetaeuschte Zeile ist weg, aber der
LEERE Platz zwischen letzter Zeile und Fusszeile stoert weiter. Mit dem
Nutzer entschieden:

- Der Rest (2-30 px, s. Belegtes Problem unten) wird auf die vorhandenen
  Zeilen VERTEILT — jede wird 1-4 px hoeher, fuer das Auge gleich, die
  Fusszeile sitzt immer buendig an der letzten Zeile. Zeilenzahl je Seite
  wie heute, Editor und Maske identisch.
- Der Zeilen-Waehler (passend zur Hoehe / 10 / 25 / 50) FAELLT WEG: es gilt
  immer „passend zur Hoehe"; Suche und Blaettern bleiben. Eine Tabelle
  scrollt nie innen (Nutzer: Blaettern mit Suchleiste ist der Weg).
- ACHTUNG Wechselwirkung mit A4: faellt die zugehoerige Prop weg, braucht es
  eine versionsgebundene Migration bzw. eine absichtlich-Meldung — sonst
  stellt die Verlust-Kontrolle gesunde Altbestaende mit gesetztem Waehler
  unter Quarantaene.
- Aendert Runtime-Bytes: die offene SE-Probe aus Block S deckt danach BEIDES
  in einem Lauf ab.

### Belegtes Problem

Unter den echten Zeilen bleibt geometrisch IMMER ein Rest von 2–30 px:
die Bausteinhoehe waechst in 20-px-Schritten (`rasterLayout.ts:38`,
zeile 12 + gap 8), eine Tabellenzeile ist 32 px hoch
(`seitengroesse.ts:36`) — der Rest trifft nie 0. Das Lineal wird auch bei
echten Daten gerendert (`tabelleKoerper.ts:138-140`), nimmt mit
`flex: 1 1 auto` genau diesen Rest auf und malt darin seine Spaltentrenner
(`tabelleStil.ts:127-151`). Ergebnis: eine scheinbar leere, je nach
Resthoehe auch duennere letzte Zeile — vom Nutzer zweimal gemeldet
(2026-08-07 und 2026-08-10); `6613fe2` korrigierte nur die
Platzhalter-ANZAHL, nicht den Rest.

### Arbeit

1. Das Lineal zeichnet nur noch GANZE Zeilentakte; den Sub-Zeilen-Rest
   nimmt ein unbemalter Fuellstreifen auf (Panel-Hintergrund, keine
   Spaltentrenner, keine Rahmenlinien, die eine Zeile vortaeuschen).
2. `passendeZeilen` (`seitengroesse.ts:101`) bleibt floor — die Rechnung
   ist richtig; falsch ist nur, dass ihr Rest wie eine Zeile aussieht.
3. Nebenursachen pruefen und im selben Thema beheben, soweit sie die
   Messung zwischen Editor und Maske auseinanderziehen (Fusszeilen-Hoehe
   mit/ohne Zeilen-Waehler, `TabelleBlock.ts:435` + `tabelleFuss.ts:62-77`;
   waagerechte Scrollleiste frisst clientHeight,
   `tabelleStil.ts:106-111`). Editor und Maske muessen dieselbe Zeilenzahl
   zeigen — Abschnitt 3.5: Editor ≠ Export ist ein Stoppgrund.
4. Die Aenderung liegt im Baustein (eine Render-Quelle) — Editor und
   Maske sind mit demselben Diff repariert.

### Fertig, wenn

- bei jeder Bausteinhoehe unter der letzten Datenzeile keine Scheinzeile
  mehr zu sehen ist (weder „leer" noch „duenner");
- der Leerzustand (Lineal ohne Daten) weiterhin Takte zeigt;
- `check:runtime` einen vollstaendig erklaerten Bundle-Diff zeigt (die
  Runtime-Aenderung ist hier BEABSICHTIGT); der Referenzabzug bleibt
  gruen, weil sein Waechter das Bundle ausschneidet
  (`referenzabzug.test.ts:40-45`).

### Nutzerprobe

1. Tabelle mit genug Datensaetzen; Bausteinhoehe mehrfach ziehen.
2. Nie eine leere/duennere Scheinzeile unter der letzten Datenzeile.
3. Gegenprobe leere Tabelle: Hilfslinien wie bisher.
4. SoftEngine-Probe noetig (Runtime-Bytes!) — gebuendelt am Blockende.

## S3 · Editor-Tempo: die drei Render-Bremsen

### Belegtes Problem

Drei Befunde multiplizieren sich:

1. kein einziges `React.memo` im Projekt — jede Aenderung rendert die
   komplette Flaeche samt aller BlockHosts neu;
2. der Props-Effekt in `useLitElement.ts:152` haengt an Eingaben
   (`bindableSpots`, `quellen`), die bei jedem Render frisch allokiert
   werden (`BlockHost.tsx:84/:87`) — er schreibt darum bei JEDEM Render
   ALLE Props ALLER Bausteine neu;
3. `rasterMove.ts:100` und `rasterDnd.ts:124` erzeugen bei jedem
   `pointermove` ein NEUES dropTarget-Objekt — beim Ziehen laeuft
   (1)+(2) mit Zeigerfrequenz (60–120 Hz).

Dahinter, nur falls 1–3 nachweislich nicht reichen: ungecachte Baumlaeufe
pro BlockHost pro Render (`quellenFor`/`templateMarkFor`/`isInSubtree`).

### Arbeit

1. dropTarget nur bei ECHTEM Zellenwechsel neu setzen (inhaltlicher
   Vergleich statt neuem Objekt pro Ereignis).
2. Stabile Identitaet fuer die useLitElement-Eingaben, damit der
   Props-Effekt nur bei echten Aenderungen laeuft.
3. `React.memo` an den Flaechen-Knoten (CanvasNode/BlockHost) mit
   schmalen, korrekten Vergleichen.
4. Baumlauf-Caching NUR, wenn 1–3 messbar nicht reichen (Regel 10 —
   nichts auf Verdacht).
5. KEIN neues State-Framework, kein Umbau von Store, History oder Undo.

### Fertig, wenn

- Tippen in einem Baustein nicht mehr die ganze Flaeche rendert;
- Ziehen/Resize fluessig ist (Nutzer-Urteil in der Browserprobe);
- Export-HTML, SEvariablen, Runtime-Bundle und Referenzabzug BYTEGLEICH
  sind — das ist die harte Grenze dieser Etappe;
- Undo/Redo, Auswahl und Tipp-Sitzungen unveraendert arbeiten (bestehende
  Testarten wachsen um die konkreten Regressionen mit).

### Nutzerprobe

1. Maske mit vielen Bausteinen (Tabelle, Kanban, Formulare, Popup).
2. Tippen ohne Verzoegerung; Ziehen/Groesse-Aendern ohne Ruckeln.
3. Undo/Redo stichprobenartig.

## S4 · Editor-Laden im Dev-Server

### Belegtes Problem

33 Barrel-Importe `from 'lucide-react'` erzwingen im Dev-Server ein
1,14-MB-Prebundle (Paket mit 4014 Icon-Modulen; kein `optimizeDeps` in
`vite.config.ts`) — der groesste einzelne Ladeposten beim Editor-Start.
Der fertige Build ist nicht betroffen; gearbeitet wird aber im Dev-Server.

### AUSGELASSEN 2026-08-10 — es gibt keine kleine sichere Loesung

Geprueft, nicht gebaut (Auslass-Klausel des Bauauftrags: „keine
nachweislich sichere kleine Loesung → auslassen statt basteln"). Der Befund
stimmt: `node_modules/.vite/deps/lucide-react.js` misst 1 139 089 Bytes
(dazu 2,2 MB Quellkarte), 33 Import-Stellen, 35 verschiedene Zeichen. Nur
die Abhilfe gibt es nicht:

- **Gezielte Icon-Importe** braeuchten `lucide-react/dist/esm/icons/*.mjs`.
  Diese Dateien liegen zwar da (2007 Stueck), sind aber KEIN oeffentlicher
  Weg: das Paket (Fassung 1.27.0) hat kein `exports`-Feld, seine
  mitgelieferte Anleitung nennt den Pfad nirgends, und Typen gibt es nur
  drei — alle fuer den Sammel-Eingang. Ein gezielter Import laesst damit
  `npx tsc -b` auffallen; ihn mit einer selbstgeschriebenen Typ-Zusage
  ruhigzustellen hiesse, einen undokumentierten Innenweg zu behaupten,
  den niemand pruefen kann.
- **optimizeDeps** hat keinen Schalter, der einen Sammel-Eingang auf die
  benutzten Ausgaenge eindampft. `exclude` macht es SCHLIMMER (dann laedt
  der Browser die ~2000 Einzelmodule statt eines Buendels), `include`
  aendert nichts.

Das Buendel entsteht ausserdem EINMAL und liegt danach im Zwischenspeicher
(die gemessene Datei ist vom 2026-08-06); es kostet den ersten Start nach
einer Paket-Aenderung, nicht jeden Start.

Wiederaufnahme braucht eine Nutzer-Entscheidung — und zwar zu der Frage,
ob 33 Dateien auf einen undokumentierten Paket-Innenweg umgestellt werden
duerfen. Ohne die bleibt es, wie es ist.

## S5 · Masken-Tempo (OPTIONAL — eigenes go, SE-Echttest Pflicht)

Nicht Teil des Block-S-Standards, weil es Export- bzw. Runtime-Bytes aendert.
Zwei Posten, unabhaengig voneinander.

**Beide gebauten Posten (S5.1, S5.2) aendern die SEvariablen und warten auf
DIESELBE eine SE-Probe des Nutzers.**

### S5.1 · Der Export bestellt nur noch die benutzten Felder (GEBAUT 2026-08-11)

**Belegtes Problem (Nutzer-Log 2026-08-11):** SoftEngine macht fuer JEDEN
gelieferten Wert einen Bild-Nachschlag (GET_RELATION 1911, Antwort fast immer
„No_Pic.png") — Maske oeffnen = 5 953 Aufrufe in 9,2 s, eine Schreib-Kette mit
Aktualisieren ~20 000 Log-Zeilen. Die SE-Seite koennen wir nicht aendern, die
MENGE liefert unsere Bestellung: jede IDB-Quelle bestellte `FELDER:'*'`, also
alle Felder aller Zeilen, obwohl die Maske nur wenige liest.

**Arbeit:** je IDB-SEFILELOOP-Quelle die explizite pos_len-Liste der BENUTZTEN
Felder statt `*`. Gesammelt wird registry-getrieben (Regel 2) aus allen Wegen,
auf denen ein Feldcode in die Maske reist — Bindungen, Listen-Eintraege,
Feld-Properties, Verknuepfungs- und Auswahl-Schluessel, Ketten-Parameter, plus
die Datensatz-Nummer der Quelle. Der Schnitt liegt in
`export/benutzteQuellen.ts` (`benutzteFelderJeQuelle` sammelt) und
`core/data/dataSources.ts` (`felderFor` entscheidet die Form je Quellen-ART).

**Kontrakt-Ehrlichkeit:** fuer IDB ist die explizite Liste NIRGENDS belegt —
beide Chef-Masken fuehren IDB mit `*`. Belegt ist nur die FORM (pos_len,
komma-getrennt) an den Stamm-Quellen und am POS-Loop von `JsonBeleg.json`;
dass die Zeilen-Schluessel pos_len tragen (`IDBID0001_253_30`), macht sie
plausibel. **Es entscheidet der EINE SE-Echttest des Nutzers. Schlaegt er
fehl, wird der Commit per `git revert` zurueckgenommen** — nicht nachgebessert.

**Sicherheitsventil:** laesst sich die Verwendungsliste einer Quelle nicht
vollstaendig als pos_len ausdruecken, bleibt fuer DIESE Quelle `*`. Lieber `*`
als ein still leeres Feld in der Maske.

**Nutzerprobe:** Export ziehen, in `index.basis.SEvariablen.json` die
FELDER-Liste ansehen; dann SE-Echttest — Daten kommen an, 1911-Flut im Log
deutlich kleiner.

### S5.2 · Kopfsatz-Quellen stehen zuletzt (GEBAUT 2026-08-11)

**Belegtes Problem (A/B-Echttest des Nutzers, identische Maske):** steht der
POS-Loop (Belegpositionen) in der exportierten SEvariablen.json an ERSTER
Stelle, liefert SoftEngine aus KEINER Quelle Daten — auch ADR/ART/IDB dahinter
bleiben leer. Dieselbe Datei mit POS an LETZTER Stelle: alle Quellen liefern.
Ein Kopfsatz-Loop scheitert standalone, und SoftEngine bricht beim ersten
gescheiterten Loop offenbar die ganze Liste ab. Der Export schrieb bis dahin in
Anlege-/Baum-Reihenfolge — wer die Positionen zuerst anlegte, bekam eine Maske,
in der GAR NICHTS ankam, ohne Fehlermeldung und ohne Bezug zur Ursache.

**Arbeit:** `loopReihenfolge` in `core/data/dataSources.ts` — Arten mit
`kopfsatzMoeglich` ans Ende, alle uebrigen behalten ihre Reihenfolge
untereinander (zwei Eimer statt Sortierung, damit die Stabilitaet sichtbar
ist). Kein `if ID === 'POS'`: das Merkmal traegt die Arten-Tabelle, sie hatte
es bereits (Regel 2). Geformt wird NUR die Ausgabe der SEvariablen; die
Bibliothek bleibt unberuehrt, FF_DATA_SOURCES bleibt in Baum-Reihenfolge (die
Laufzeit schlaegt dort per id nach), das HTML damit Byte fuer Byte unveraendert.

**Nutzerprobe:** Export einer Maske mit Belegpositionen ziehen — in
`index.basis.SEvariablen.json` steht der POS-Eintrag zuletzt, egal wann die
Quelle angelegt wurde. Dann SE-Echttest: alle Quellen liefern.

### S5.3 · Diagnose-Anzeige (NICHT gebaut, eigenes go)

Die Diagnose-Anzeige schreibt bei jedem SE-Ereignis das JSON des ersten
Datenpakets mehrfach neu (`bridge.ts:110-148`) — datenmengenproportionale
Arbeit mitten im Maskenstart. Falls der Nutzer es freigibt: Diagnose nur
noch auf Anforderung fuellen, Maskenverhalten sonst identisch; der genaue
Schnitt kommt in der Ansage, ein SE-Echttest ist danach Pflicht.

---

# Welle P — Tempo (eingeschoben 2026-08-11)

Nutzer-Ansage: „laedt ewig, nicht performant — und das ging auch mal
schneller." Welle S hat die zwei belegten Render-Bremsen geloest (S3) und
das Dev-Laden ausgelassen (S4, Begruendung dort); das Ergebnis reicht dem
Nutzer nicht, und „ging mal schneller" heisst: es gibt eine
VERSCHLECHTERUNG, die sich finden laesst. Regel dieser Welle: erst messen,
dann bauen — kein Fix ohne Zahl.

## P1 · Messen (kein Code, kein eigener Commit)

- OHNE Dev-Server (Regel 9): `vite build`-Zeiten und Modulzahlen ·
  `npx vite optimize --force` (Prebundle-Kosten der Abhaengigkeiten) ·
  vitest-Importzeiten (zuletzt 56 s Import bei 1,4 s Tests) · Importgraph
  des App-Starts (was wird beim ersten Laden alles gezogen) · Vergleich mit
  aelteren Staenden ueber die git-Historie, soweit ohne Browser moeglich.
- Ergebnis ist eine RANGLISTE MIT ZAHLEN — was kostet den Start, was das
  Arbeiten. Sie steht im Abschlussbericht und in der jeweiligen
  P2-Commitbeschreibung.
- Das GEFUEHL (fluessig beim Tippen/Ziehen, Start im Browser) kann nur der
  Nutzer beurteilen — seine Probe am Blockende bleibt das Urteil.

## P2 · Die belegten Top-Bremsen loesen

- NUR was P1 mit Zahlen belegt hat; je Bremse EIN Commit.
- Bekannte Kandidaten (Zwischenbilanz 2026-08-10, alle erst nach
  P1-Beleg): die Verlaufs-Kopie — `pushHistory` klont je Schritt den
  GANZEN Baum, obwohl der Baum unveraenderlich fortgeschrieben wird
  (pruefen, ob Snapshots ohne Klon auskommen) · die Icon-Bibliothek —
  lucide-react 1.27.0 hat keinen Einzel-Icon-Weg (S4); Kandidat ist das
  Vendorn der ~33 benutzten Icons als lokale Dateien, damit faellt das
  1,14-MB-Prebundle ganz · was P1 sonst belegt.
- Harte Grenze: P2 aendert KEIN Export-Byte (ff-runtime, Referenzabzug,
  SEvariablen unveraendert) und bringt KEINE neue Abhaengigkeit mit.
  Masken-Tempo bleibt S5 (eigenes go, SE-Echttest Pflicht).

Im selben Block faehrt **S2.1** (Tabellen-Nachschlag, s. Etappenkopf in
S2) mit — er aendert als einziger Runtime-Bytes; die offene SE-Probe aus
Block S deckt danach beides ab.

# Welle A — Bestand retten und Integritaet herstellen

Diese Welle ist vor neuen sichtbaren Architekturarbeiten Pflicht. Sie schliesst
bekannte Wege, auf denen Daten, Referenzen, Undo oder Autosave still falsch
werden koennen.

## A0 · POS/VAR-Arbeit sichern und Baseline herstellen

### Ziel

Der bestehende Arbeitsstand wird fachlich abgeschlossen oder als ausdruecklich
benannter, wiederherstellbarer WIP-Stand gesichert. Nichts wird geloescht.

### Arbeit

1. Vor einem Reload des Editors eine aktuelle editierbare Maskendatei sichern,
   besonders wenn Aktionsparameter mit `aus` verwendet wurden.
2. Alle 18 geaenderten Dateien dem POS/VAR-Thema zuordnen.
3. POS/VAR entweder fertigstellen oder als klar benannten Sicherungsstand
   festhalten; nicht mit dem Umbau vermischen.
4. `exportMask.ts` thematisch unter 500 Zeilen schneiden, falls der fertige
   POS/VAR-Diff dies weiterhin erfordert. Dieser Schnitt veraendert kein
   Exportbyte.
5. Pruefbuendel gruen herstellen.
6. Exakten neuen Baseline-Commit und das dazugehoerige Masken-Backup benennen.

### Fertig, wenn

- kein Nutzer-Diff ungesichert ist;
- der Arbeitsbaum nach dem Baseline-Commit sauber ist;
- alle fuenf Pruefungen gruen sind;
- der Referenzabzug gegen die tatsaechliche Baseline passt;
- die weitere Umbauarbeit nicht mehr auf einem anonymen Mischstand beginnt.

## A1 · `aus`-Datenverlust schliessen

### Belegtes Problem

UI, Typ und Runtime kennen `{ source: 'aus', value: '' }`. Der strenge
Lade-Sanitizer akzeptiert `aus` nicht und kann dadurch die gesamte
Ereigniskette verwerfen.

### Arbeit

1. Sichtbare Quellenoptionen und erlaubte gespeicherte Parameterquellen
   getrennt modellieren.
2. `aus` im gespeicherten Vertrag akzeptieren, ohne es als normale
   auswählbare Datenquelle ueberall anzuzeigen.
3. Runtime-Aufloesung bleibt leerer String an derselben Parameterposition.
4. Sanitizer darf wegen dieses gueltigen Zustands weder Bindung noch Kette
   entfernen.
5. Maskendatei darf deswegen nicht mehr als veraendert/beschaedigt abgelehnt
   werden.

### Bestehende Testarten erweitern

- Binding-Sanitizer mit `aus`;
- komplette Ereigniskette mit `aus`;
- Browser-Reload/Persistenzpfad;
- Maskendatei-Parse;
- Export-Parse und Runtime-Parameteraufloesung;
- Nachbarparameter behalten ihre Position und Werte.

### Nutzerprobe

1. Aktion mit mindestens drei Parametern anlegen, mittleren Parameter auf
   `aus` setzen.
2. Speichern und neu laden.
3. Aktion muss vollstaendig sichtbar bleiben.
4. Export in SoftEngine ausloesen.
5. Mittlerer Parameter muss leer, die beiden anderen muessen unveraendert
   positioniert sein.

## A2 · Migrationsschutz vor Schema 6

### Belegtes Problem

Die historische Demo-Bereinigung wird heute ueber
`schemaVersion < CURRENT_SCHEMA_VERSION` aktiviert. Ein Sprung von 5 auf 6
wuerde dadurch echte Werte wie `Heute`, `09:15` oder
`Rueckruf Fr. Wagner` erneut als alte Demowerte behandeln und leeren.

### Arbeit — eigener Commit, noch kein Schema-6-Bump

1. Nach Git-/Bestandspruefung gilt die feste historische Grenze
   `DEMO_CLEANUP_BEFORE_SCHEMA = 5`: Demo-Bereinigung laeuft ausschliesslich
   fuer `schemaVersion < 5`, niemals fuer 5 oder spaeter. Diese benannte
   Konstante wird von Browser- und Dateipfad gemeinsam gelesen.
2. Browser-Lader und Maskendatei benutzen dieselbe feste Schwelle.
3. Testdaten decken Schema 4 (`N-1`), Schema 5 (`N`) und ein simuliertes
   Schema 6 ab; sie verwenden niemals ersatzweise `CURRENT_SCHEMA_VERSION`.
4. Schema bleibt in diesem Commit noch 5.

### Fertig, wenn

- Schema-5-Echtwerte `Heute`, `09:15` und `Rueckruf Fr. Wagner` einen
  simulierten naechsten Versionssprung unveraendert ueberleben;
- echte alte Demodaten aus der historischen Version weiterhin korrekt
  bereinigt werden;
- Browser- und Dateipfad identisch entscheiden.

### A2.1 Migrationsergebnis nicht laenger als ein einziges Boolean fuehren

Vor Schema 6 wird der heutige Sammelbegriff `migrated` getrennt in:

- `schemaAdvanced`: eine Schemastufe wurde durchlaufen;
- `resaveNeeded`: der gueltige Stand muss unter der neuen Version neu
  gespeichert werden;
- `intentionalChanges`: exakt benannte Pfade/Werte, welche die konkrete
  Migration absichtlich aendern durfte;
- `problems`: alle anderen Verluste oder Abweichungen.

Der Maskendatei-Import ueberspringt seine Detail-Verlustpruefung niemals nur
deshalb, weil irgendeine Migration lief. Bei Schema 6 werden ausschliesslich
die erlaubten Popup-Raster-/Breiten- und bewusst beschlossenen Root-
Reihenfolgen-Diffs ausgenommen; Events, Props, Quellen und Relationen werden
weiter vollstaendig verglichen. Auch ein leeres Schema-5-Popup setzt
`schemaAdvanced/resaveNeeded`, damit es nicht ewig auf Version 5 bleibt.

## A3 · Neuere Browserstaende nicht mit alter App zerstoeren

### Belegtes Problem

Der Maskendatei-Import lehnt eine Schemaversion aus der Zukunft ab. Der
Browserspeicher tut das nicht. Eine alte oder gecachte App kann daher einen
neueren Stand laden, unbekannte Daten entfernen und die verkleinerte Version
autospeichern.

### Arbeit

1. Einen diskriminierten Ladeausgang einfuehren:
   - `ok`;
   - `migrated`;
   - `quarantined` mit konkretem Grund und Rohdaten.
2. Feste Lade-Reihenfolge fuer Browser und Maskendatei:
   - Zukunftsversion vor jeder Aenderung abweisen;
   - Rohform strukturell parsen;
   - ausschliesslich versionsgebundene Migrationen anwenden;
   - danach gegen den aktuellen Baum-/Bibliotheksvertrag pruefen;
   - erst danach sanitizen.
3. `schemaVersion > CURRENT_SCHEMA_VERSION` wird `quarantined`.
4. Ein quarantined Stand wird nicht hydriert, migriert oder autospeichert.
   Beim **Browserstart** bleiben Editor und alle Speicherplaner
   schreibgesperrt.
5. Dafuer entsteht bereits hier ein minimaler gemeinsamer `SpeicherGate`, den
   Blockbaum-, Datenquellen- und Relationsspeicher vor jedem Schreiben
   abfragen. A10 uebernimmt diesen Gate spaeter in den technischen
   Sitzungsbesitz; seine Einfuehrung entscheidet noch nicht die fachliche
   Lebensdauer der Bibliotheken.
6. Rohdaten werden unveraendert mit Zeitstempel als Notfallkopie gehalten.
7. Die Sperransicht bietet nur klar getrennte Wege:
   - Rohdaten als Datei sichern;
   - eine nachweislich gueltige Maskendatei oeffnen;
   - lokalen Stand nach ausdruecklicher Bestaetigung verwerfen und leer
     beginnen.
8. Nutzer erhaelt Klartext: Stand stammt aus neuerer Editorversion oder wurde
   unter Quarantaene gestellt; keine automatische Reparatur vortaeuschen.
9. Beim **Import einer Maskendatei** ist die Datei nur ein Kandidat: Ein
   quarantined Kandidat wird mit Problemliste abgelehnt, sperrt aber nicht die
   bereits offene gueltige Sitzung und deren Autosaves. Gemeinsames
   Parse-Ergebnis, unterschiedliche Aufruferpolitik.

### Fertig, wenn

- eine alte App neuere Browserdaten bytegenau unangetastet laesst;
- kein Klick einen Autosave der reduzierten Form ausloesen kann;
- Maskendatei und Browserspeicher dieselbe Versionspolitik haben;
- nur das Oeffnen eines gueltigen Standes oder das ausdruecklich bestaetigte
  Leeren hebt die Schreibsperre auf.

## A4 · Teilverlust beim Laden sichtbar und wiederherstellbar machen

### Belegtes Problem

Einzelne ungueltige oder doppelte Quellen, Relationen, Eigenschaften und
Ereignisketten koennen im Browserpfad still uebersprungen werden. Die naechste
Aenderung speichert danach nur noch die ausgeduennte Bibliothek.

### Arbeit

1. Die Sanitizer fuer Blockbaum/Props/Events, Datenquellen und Relationen
   liefern `bereinigter Wert + Problemliste`, nicht still nur einen kleineren
   Wert.
2. Die Pruefung verwendet exakt die in A3 festgelegte Reihenfolge. Historischer
   Rohaltbestand wird erst migriert und erst danach gegen heutige Parent-Regeln
   bewertet.
3. Bei irgendeinem nicht ausdruecklich migrationsbedingten Teilverlust lautet
   der Ausgang `quarantined`.
4. Rohstand und Problemliste bleiben erhalten; die Sperransicht nennt Bereich,
   Eintrags-ID/Pfad und Grund und bietet die drei A3-Wiederherstellungswege.
5. Kein Speicherplaner laeuft, solange der Stand quarantined ist. Ein blosses
   „Verlust bestaetigen" darf keinen kleineren Stand ueber die Rohdaten
   schreiben.
6. Maskendatei und Browserpfad verwenden dieselben Verlustkriterien.
7. Baumstruktur prueft nach Migration auch `canContain`,
   `allowedChildTypes` und `allowedParentTypes`.
8. Zusaetzliche Topologie-Invarianten:
   - exakt eine synthetische Root;
   - `pageBlock` ausschliesslich direkt unter Root;
   - keine Seite unter Seite;
   - jede `parentId`-/`childIds`-Beziehung ist beidseitig konsistent;
   - jeder erreichbare Knoten genau einmal im Baum.
9. Ein Popup unter Popup oder ein anderer unzulaessiger Eltern-Kind-Vertrag
   wird nicht als unsichtbarer Knoten durchgeschleust.

### Fertig, wenn

- kein einzelner fehlerhafter Eintrag still verschwindet;
- die Meldung den betroffenen Eintrag und Grund nennt;
- der unveraenderte Rohstand wiederherstellbar bleibt;
- eine handbearbeitete Datei keine fuer den Editor unsichtbare, aber im Export
  vorhandene Struktur erzeugen kann.

## A5 · Generisches Duplizieren mit echten Blockreferenzen

### Belegtes Problem

`cloneSubtree` vergibt neue Knoten-IDs, kopiert Props und Events mit ihren
alten `blockId`, `geberId` und `popupId` jedoch unveraendert. Eine Kopie kann
dadurch still mit dem Original weiterarbeiten.

### Arbeit

1. Zweiphasiges Klonen:
   - gesamten Unterbaum mit `alte ID -> neue ID` erfassen;
   - danach Referenzen umschreiben.
2. Referenzregel:
   - zeigt eine Referenz auf einen mitkopierten Knoten, wird sie auf dessen
     neue ID umgeschrieben;
   - zeigt sie bewusst nach ausserhalb des kopierten Unterbaums, bleibt sie
     extern;
   - Datenquellen- und Relations-IDs sind keine Block-IDs und bleiben
     unveraendert.
3. Die Umschreibung ist eine zentrale reine Funktion und kennt alle heutigen
   blockinternen Referenzfelder.
4. `pageBlock`-Duplizieren bleibt in A5 deaktiviert. Popup-Name, aktive Seite
   und Rasterplatzierung werden erst nach dem neuen Popup-Vertrag in C3.1
   aktiviert.
5. Die generische Kopie bleibt in derselben Parent-Struktur. Fuer heute bereits
   sichtbare direkte Root-Rasterkinder wird eine freie Position ueber die
   bestehende Rasteroperation gewaehlt statt pixelgleicher Ueberdeckung.
   Popup-Surface-Platzierung wartet bis C3.1.

### Bestehende Tests

- kopierter Knopf liest kopiertes Feld;
- kopierte Folgetabelle folgt kopiertem Geber;
- externe Referenz bleibt extern;
- `pageBlock` kann noch nicht dupliziert werden;
- direktes Root-Rasterkind liegt nach Kopie sichtbar frei;
- Undo/Redo der normalen Unterbaumkopie in einem Schritt.

## A6 · Shadow-DOM-sichere Tastaturkuerzel

### Belegtes Problem

Der globale Listener prueft nur `event.target`. Bei Ereignissen aus Shadow
DOM kann dieses Ziel auf den Custom-Element-Host umgebogen werden. Delete,
Ctrl+Z oder Ctrl+D koennen dann beim Texteditieren den Editor statt des
Eingabefelds steuern.

### Arbeit

1. Vollstaendigen `event.composedPath()` pruefen.
2. Bei `input`, `textarea`, `select` oder einem `contenteditable`-Element im
   Pfad keine globalen Editor-Kuerzel ausfuehren.
3. Bestehende Kuerzel ausserhalb von Eingaben unveraendert lassen.

### Nutzerprobe

- Text in jedem Lit-Inline-Editor markieren und Delete/Ctrl+Z/Ctrl+D testen;
- kein Baustein darf geloescht, dupliziert oder per Editor-Undo veraendert
  werden;
- nach Verlassen des Textfelds muessen die Editor-Kuerzel wieder arbeiten.

## A7 · Benachrichtigung, Autosave und Transaktionen absichern

Diese Unterpunkte bleiben getrennte Commits.

### A7.1 Listener isolieren

- Vor der Reparatur reproduziert ein Fall in einer bestehenden Unit-Testdatei,
  dass ein werfender Listener spaetere Benachrichtigung/Autosave gefaehrdet.
- Ein fehlerhafter Subject-Listener stoppt nicht alle spaeteren Listener.
- Bereits erfolgte Zustandsaenderung plant Autosave garantiert, etwa ueber
  eine sichere Reihenfolge beziehungsweise `finally`.
- Fehler bleibt sichtbar und wird nicht stumm verschluckt.

### A7.2 Sichere Transaktionshilfe

- Vor der Reparatur reproduziert ein Fall in einer bestehenden Unit-Testdatei
  einen offengebliebenen Transaktionspfad.
- Synchrone Mehrfachschreibvorgaenge verwenden einen zentralen
  `transaction(fn)`-Vertrag mit `try/finally`.
- Mehrere Events umfassende Gesten wie Resize, DnD und Tippsitzungen werden
  **nicht** in eine synchrone Funktion gezwungen. Sie verwenden einen zentralen,
  idempotent schliessbaren Transaktions-Token.
- Dieser Token schliesst bei normalem Ende sowie `pointerup`, `pointercancel`,
  Blur und Unmount genau einmal.
- Ein geworfener Fehler kann `_txDepth` nicht dauerhaft groesser null lassen.
- Nach einem provozierten Fehler entstehen wieder normale Undo-Punkte.

### A7.3 Auswahlfolge-Zyklen erst belegen, nicht auf Verdacht verbieten

**ABGESCHLOSSEN 2026-08-11.** Der Beleg fand einen echten Fall (zwei
Nachschlage-Felder ueber Kreuz mit „einziger Treffer = ja", s. Zeiger 0.1
und `blocks/shared/auswahl.test.ts`). Nutzer-Entscheidung: **nichts tun**
(Regel 10) — keine Notbremse (koennte gewollte Nachzieh-Ketten
abschneiden), kein Anbiete-Filter. Produktcode kommt erst, falls der Fall
je real einfriert; der Test benennt ihn dann sofort. Der urspruengliche
Etappentext folgt unveraendert:

- Zuerst wird in einer bestehenden Testart geklaert, ob ein direkter oder
  indirekter Kreis die heutige monotone Nachmeldung tatsaechlich nicht
  beendet oder Daten falsch veraendert.
- Ist der heutige Lauf nachweislich endlich und fachlich erlaubt, entsteht
  **kein** neuer Preflight-Blocker und kein Code-Commit.
- Nur bei reproduziertem Fehler wird dieselbe reine Zyklusfunktion in
  Inspector und Preflight verwendet und eine Runtime-Notbremse mit sichtbarer
  Fehlermeldung ergaenzt.
- Ob ein fachlich endlicher Kreis nur gewarnt oder blockiert werden soll, ist
  dann eine Nutzerentscheidung und keine heimliche Reparatur.

## A8 · Regelwaechter und Wahrheitsaussagen

Werkzeug und Kommentare werden nicht mit einer Runtime-Aenderung vermischt.

### A8.1 Regelwaechter

- rohes Nullbyte entfernen;
- Steuerzeichenpruefung so fassen, dass relevante Skripte nicht ausserhalb
  ihres eigenen Waechters liegen;
- Fehlermeldungen erklaeren weiterhin das Warum;
- Dateideckel bleibt fuer alle `src`-Dateien 500 Zeilen.

Die exakte Registry-Zwei-Mengen-Pruefung folgt erst in E1 direkt vor dem
Registry-Umbau. A8 baut sie nicht ein zweites Mal vorab.

### A8.2 Kommentare und heutiges Projektgedaechtnis

- Konkrete Abhakliste gegen den heutigen Code:
  - `BlockDefinition.ts` zu `pageBlock`/Popup-Layout;
  - `BlockData.ts` zu Root/Popup-Raster;
  - `rasterLayout.ts` zu seinem tatsaechlichen Scope;
  - `useLitElement.ts` zur React-Lit-Schreibnaht;
  - `BlockHost.tsx` zu Popup-/Rasterverhalten;
  - `ParameterZeile.tsx` zum falschen Vorlagenrueckfall bei `aus`;
  - `CLAUDE.md` zu Kanban-Stand, `POPUP_RAND`, Store-Besitz und dem
    faelschlich als abgeschlossen beschriebenen Maskendesign.
- keine zukunftsbehauptenden Kommentare, bevor die jeweilige Etappe gebaut
  wurde;
- `meldung.ts`: einfacher DOM-Notfallweg bleibt; nur seine alten
  Fallbackfarben werden in der Designwelle gegen Tokens abgeglichen.
- Wenn C2, E2 oder A10 spaeter eine aktuelle Wahrheit aendern, wird
  `CLAUDE.md` im selben Commit mitgezogen. Die V6-Datei liegt seit dem
  2026-08-10 IM Repo (Nutzer-Entscheidung: uncommittet waere die Uebergabe
  zwischen zwei Chats beim naechsten Fehlgriff weg). Sie bleibt trotzdem
  Bauauftrag und wird **keine** Projektchronik: es wird der Zeiger in 0.1
  fortgeschrieben, nicht eine Liste dessen, was war.

## A9 · Belegter SoftEngine-Ausgangslauf

Nach A0 bis A8, vor dem sichtbaren Komponentenumbau:

1. Agent nennt exakten Commit und erstellt eine kurze Testanleitung.
2. Nutzer prueft eine reale bestehende Maske in SoftEngine:
   - Datenpush;
   - Tabelle/Kanban;
   - Ereigniskette inklusive `aus`;
   - Popup oeffnen/schliessen;
   - Nachschlagen;
   - HTML + SEvariablen.
3. Ergebnis wird in der erlaubten Belegseite
   `docs/softengine-wiki/echttests.md` festgehalten. Falls sie noch nicht
   existiert, wird genau diese Evidenzseite angelegt, keine Plan-/Changelog-
   Ablage.
4. Jede Zeile enthaelt: Datum, Commit, Maskendatei, Plattform WinUI/WebUI,
   gepruefter Vertrag, Ergebnis und ob irgendeine Handkorrektur noetig war.
5. Eine Coverage-Matrix nennt auch `nicht benutzt = nicht belegt`. Ein Lauf
   beweist weder MEMTAB/ERPAPICALL noch Ankreuzfeld- oder andere Vertraege, die
   in der Testmaske nicht vorkamen.

Dieser Lauf ist der Vorher-Beleg fuer die folgenden Runtime-Etappen.

## A10 · Store-Besitz vor dem atomaren Export entscheiden

### Zwei getrennte Fragen

1. **Technischer Besitz:** Empfehlung ist eine injizierte Sitzungsinstanz, die
   Editor/Blockbaum, DataSourceStore und RelationStore gemeinsam bereitstellt.
   Dadurch koennen Export, Persistenz und Preflight einen atomaren Snapshot
   ohne versteckte globale Importe erhalten.
2. **Produkt-Lebensdauer:** Davon getrennt wird entschieden, ob Quellen und
   Relationen zu einer einzelnen Maske oder zur gesamten laufenden App/
   Arbeitsbibliothek gehoeren. Der technische Umbau darf nicht still
   „neue Maske = leere Bibliotheken" erfinden.

### Empfehlung dieses Plans

- technischen Sitzungs-/DI-Besitz umsetzen;
- die heutige fachliche Lebensdauer von Quellen/Relationen zunaechst
  unveraendert lassen;
- Exportinputs gemeinsam und explizit erfassen;
- zwei Sitzungsinstanzen muessen technisch ohne gegenseitige
  Testverschmutzung erzeugbar sein, ohne damit automatisch die Produktregel
  fuer `Neue Maske` festzulegen.

Diese ausdrueckliche Nutzerbestaetigung erfolgt nach Welle A. Bei Zustimmung
wird A10 vor B1 implementiert und `CLAUDE.md` im selben Commit aktualisiert.
Bei bewusster Verschiebung muss B1 trotzdem einen synchron erfassten Snapshot
der drei heutigen Besitzer bilden; die verbleibende Grenze wird im
Abschlussbericht genannt.

---

# Welle B — Export und kleine klar begrenzte Bedienverbesserung

## B1 · GESTRICHEN — die zwei automatischen Downloads bleiben

**Nutzer-Ansage 2026-08-11.** Hier stand ein Umbau des Export-Klicks (ein
eingefrorener Exportstand, zwei ausdrueckliche Anforder-Knoepfe mit
Veraltet-Sperre), weil Chrome/Edge den zweiten automatischen Download nur
nach einer Nachfrage zulassen und ein abgelehnter zweiter Download still
verschwindet. Der Nutzer nimmt genau das bewusst in Kauf („es funktioniert
ja so — kein Problem, wenn ich Zulassen druecken muss"). Es wird kein
Export-Umbau gebaut und dieser Punkt nicht wieder vorgeschlagen (dasselbe
Muster wie S1). Der volle Etappentext steht in der git-Historie. Damit hat
Block 2 keinen Bau-Anteil mehr: A9 ist ein SE-Lauf des Nutzers, A10 eine
Entscheidung (deren Umbau ohnehin nur nach eigenem Go kaeme).

---

# Welle C — Ein Dialograhmen und Popup als echte Flaeche

## C1 · Popup verwendet `DialogRahmen`, Inhalt bleibt Flow

### Warum getrennt

Rahmenvereinheitlichung ist eine strukturell-visuelle Aenderung. Raster ist
eine Datenmigration plus DnD-, Export- und Laufzeitaenderung. Dieselbe Datei
ist kein Grund, beide Risiken in einen Commit zu packen.

### Arbeit

1. `PopupBlock` komponiert den vorhandenen `DialogRahmen`.
2. Popup-Kinder bleiben in dieser Etappe exakt im heutigen Flow.
3. Inline editierbarer Popup-Titel bleibt im Editor erhalten.
4. Das **Dialogkopf-X** hat einen eindeutigen Vertrag:
   - Runtime: dieses Popup schliessen;
   - Editor: zur Hauptseite/aus der Preview wechseln, niemals loeschen.
   Es ist nicht das spaetere Seiten-/Auswahlrahmen-Loeschkreuz.
5. Kein neuer Escape-Vertrag fuer Popups. Ein verbundenes, aber unsichtbares
   Popup darf insbesondere keinen globalen Escape-Listener aktiv halten.
6. Overlay, Startgroesse, Resize, Titel und bestehender Innenabstand bleiben
   erhalten oder jede sichtbare Abweichung wird vorab benannt.
7. Im Popupmodus ist `DialogRahmen.inhalt` `overflow: hidden`; die
   Popup-`.rumpf`-Surface ist alleiniger horizontaler und vertikaler
   Scroll-Owner.
8. `DialogRahmen` verknuepft seinen zugänglichen Namen per `aria-labelledby`
   mit dem sichtbaren Titel.
9. Solange Fokusbegrenzung C3.3 noch nicht fertig ist, setzt der Popupmodus
   nicht vorzeitig `aria-modal=true`. Eine Accessibility-Zusage wird nicht
   mehrere Commits vor ihrer Funktion exportiert.
10. Nachschlagen wird in diesem Commit nicht veraendert.

### Nutzerprobe Browser und SoftEngine

- Popup mit leerem, kurzem und langem Inhalt;
- Titel bearbeiten;
- Breite/Hoehe aendern;
- Dialogkopf-X in Runtime und Editor mit den beiden verschiedenen Solls;
- konfigurierte Schliessen-Aktion;
- kein Doppel-Scroll;
- Nachschlagen sieht und arbeitet unveraendert.

## C2 · Schema 6, zentraler Kind-Layoutvertrag und Popup-Raster atomar

**Zusatzauftrag 2026-08-12 (Nutzer, U0-5):** der Baustein „Zeile"
ENTFAELLT mit diesem Umbau. Die Migration loest bestehende Zeilen auf
(Kinder ruecken in Reihenfolge an die Stelle der Zeile); Palette,
Registry, Export-Test und Veralten-Positivliste ziehen mit. Bis C2
bleibt Zeile unveraendert — im rasterlosen Popup ist sie der einzige
Weg fuer Nebeneinander.

### Ziel

Store, Editor, DnD und Export entscheiden nicht mehr separat, ob Kinder in
Flow oder Raster liegen. Es gibt **keinen eingecheckten Zwischenstand**, in
dem der Vertrag schon Popup-Raster behauptet, Migration, Renderer oder Export
aber noch Flow verwenden. Vorbereitung und Schnittbeweis bleiben uncommittet;
der vollstaendige Schalter ist ein fachlich atomarer Commit.

### Voraussetzungen

- A0 sauber;
- A2/A2.1 Migrationsschutz und differenzierte Migrationsausgaenge gruen;
- Maskendatei-Backup vorhanden;
- C1 bestanden.

### Zentraler Layout- und Surface-Vertrag

1. Eine runtime-neutrale zentrale Abfrage einfuehren, sinngemaess
   `childLayoutOf(parentNodeOrRoot, definition) -> 'flow' | 'raster'`.
   Die synthetische Wurzel wird ausdruecklich erkannt; sie besitzt keine
   normale Registry-Definition.
2. Layout wird nicht pauschal aus `pageBlock` abgeleitet. Eine explizite
   runtime-sichere Faehigkeit `childLayout: 'flow' | 'raster'` beschreibt den
   Kind-Layoutvertrag. `PopupBlock` deklariert `raster`; ein spaeterer anderer
   Seitentyp koennte bewusst Flow verwenden.
3. Vertrag:
   - synthetische Wurzel: Raster;
   - Popup-Definition: Raster;
   - normale Container: ihre explizite Definition beziehungsweise Flow-
     Standard.
4. `Editor.addBlock`, Rasteroperationen, Canvas/PopupSeite, Export und
   DnD lesen dieselbe Entscheidung. Seiten-/Auswahlgrenzen bleiben orthogonal
   in `pageOps` und werden nicht aus dem Kindlayout abgeleitet.
5. Keine konkreten Bausteinimports in generischem Code.
6. `POPUP_RAND` beziehungsweise neutrale Flaechengeometrie in einen
   runtime-neutralen gemeinsamen Ort verschieben; die heutige
   Popup-Ausnahme im Regelwaechter danach entfernen.
7. DnD-Flaechenmechanik wird gemeinsam extrahiert, nicht aus `Canvas` nach
   `PopupSeite` kopiert.
8. Surface-API liefert das reale Grid-Element und den realen Scroll-Owner
   explizit, bevorzugt als `{ gridEl, scrollOwner }`. Fuer Popup sind beide
   dieselbe `.rumpf`-Surface. Kein generisches
   `shadowRoot.querySelector('.rumpf')` und kein `wrapper.parentElement` als
   versteckter Vertrag.
9. `CLAUDE.md` wird im selben Commit auf den neuen aktuellen Layout-/
   `POPUP_RAND`-Stand gebracht.

### Migration 5 -> 6

1. Ausschliesslich direkte Nicht-Seiten-Kinder jedes Root-Popups migrieren.
2. Sichtbare heutige Reihenfolge kommt aus `childIds`.
3. Alte unsichtbare `rasterX/Y/W/H` nicht blind erhalten, da der Nutzer sie
   im Flow nie kontrollieren konnte und Umsortieren nur `childIds` aenderte.
4. Popup-Istbreite und Mindestbreite unter 520 px werden bewusst auf 520 px
   migriert. Der Rahmen bleibt auf kleinen Hosts im Viewport; die Surface
   scrollt horizontal.
5. Exakte reine Umrechnung mit `columns = 24`, `row = 12`, `gap = 8`,
   `padding = 12`, heutigem Rahmen `border = 1.5` und
   `gridContentWidth = 520 - 2 * border - 2 * padding = 493`:
   - Start `x = 0`, `y = 0`;
   - Pixelhoehe `px -> h = ceil((px + gap) / (row + gap))`, mindestens 1;
   - Pixelbreite verwendet
     `colWidth = (innerWidth - 23 * gap) / 24` und
     `w = ceil((px + gap) / (colWidth + gap))`, geklemmt auf 1..24;
   - `fill`-Breite wird 24;
   - nur numerische alte Pixel-`width/height` laufen durch die Pixel-Formel;
   - `auto` beziehungsweise zustandsabhaengige Varianten verwenden
     `rasterSpecOf(...).startW/startH` **direkt als bereits vorhandene
     Zellzahlen**, geklemmt an die gueltigen Grenzen;
   - `fill`-Hoehe verwendet direkt `startH`, da eine unendliche Resthoehe in
     einer frei wachsenden Surface undefiniert waere;
   - unbekannter Fall ist ein sichtbarer Migrationsfehler, kein geratener
     Fallback;
   - `y_next = y + h`, niemals bloss `y + 1`.
6. Bestehende Schema-1/2/3/4-Staende muessen beim direkten Upgrade auf 6
   dasselbe Ergebnis liefern wie stufenweise gespeicherte Upgrades ueber 5.
7. Validierungsreihenfolge:
   - bei Schema < 6 werden die nie sichtbaren Rasterprops direkter
     Popup-Kinder vor der Validierung ausdruecklich als ersetzbar behandelt;
   - sichtbare Root-Rasterwerte werden vor der Migration validiert;
   - neu erzeugte Popup-Werte werden danach validiert;
   - bei Schema 6 werden alle aktiven Root-/Popup-Surface-Werte validiert;
   - dormant Rasterprops normaler Flow-Kinder werden entfernt, statt spaeter
     versehentlich aktiv zu werden.
8. Gueltige Rasterwerte sind:
   ganzzahlig und endlich, `x/y >= 0`, `w/h >= 1`, `x + w <= 24`.
   Ungueltige Werte gehen in Quarantaene statt ausserhalb der Flaeche zu
   exportieren.
9. Hauptseiten-Koordinaten und Props bleiben bytegleich. Nur direkte
   **Nicht-Seiten-Kinder** der Root-Surface werden nach `y,x` stabil
   normalisiert. `pageBlock`-IDs bleiben in ihren bisherigen Root-Slots und
   in ihrer relativen Reihenfolge; Popup-Reiter/Exportreihenfolge aendern sich
   dadurch nicht.
10. Kinder innerhalb von Zeile, Gruppe oder anderen Flow-Containern bleiben
   unberuehrt.
11. Schema-6-Staende sind beim erneuten Laden idempotent.

### Editor und DnD

1. `PopupSeite` verwendet Rasterziel, Rastergeist und Raster-`NodeList`.
2. Der in C2 definierte Surface-Vertrag liefert echtes Grid und Scroll-Owner.
   `wrapper.parentElement` ist im Shadow DOM kein ausreichender Vertrag.
3. Pointer-Berechnung beruecksichtigt vertikalen **und horizontalen**
   Scrollstand des einen Scroll-Owners.
4. Drop ist nur im Popup-Rumpf erlaubt, nicht auf Kopf, Rahmen oder Overlay.
5. Ziehen aus der Palette, Verschieben, Resize, Undo und Redo benutzen
   dieselbe Flaechenmechanik wie die Hauptseite.
6. Es wird nicht faelschlich behauptet, Raster->Flow-Reparenting sei heute
   vorhanden. Der generische neue Bedienweg wird separat in C4 gebaut.
7. Geometrie/CSS ist eindeutig:
   - 520 px ist die nominelle aeussere Popup-Border-Box;
   - bei 1.5-px-Rahmen und 12-px-Padding bleiben 493 px nominale
     Grid-Contentbreite;
   - `.rumpf` bleibt `width:100%`, Grid und einziger Scroll-Owner;
   - gemeinsame Grid-CSS erhaelt einen Surface-Parameter fuer
     Mindest-Trackbreite: Root `0`, Popup
     `(493 - 23 * 8) / 24 = 12.875px`;
   - `repeat(24, minmax(var(--raster-min-track), 1fr))` erzeugt bei kleinerem
     Host echten `scrollWidth`, ohne die Root-CSS zu veraendern.

### Logische Reihenfolge

1. Direkte Surface-Kinder werden innerhalb derselben Undo-Transaktion nach
   `rasterY`, dann `rasterX` geordnet nach:
   - Schema-Migration;
   - Palette-Add/Drop;
   - Move innerhalb derselben Surface;
   - Cross-Parent-Move auf eine Surface;
   - Duplikation.
2. Gleichstaende behalten ihre bisherige relative Reihenfolge.
3. Diese Reihenfolge wird als `childIds` gespeichert und ist damit auch
   Export-DOM-, Tab- und Screenreader-Reihenfolge.
4. Dieselbe Regel gilt fuer aktive Rasterkinder von Root und Popup. Bei Root
   werden nur Nicht-Seiten-Kinder in ihren bestehenden Nicht-Seiten-Slots
   ersetzt; `pageBlock`-Slots und -Reihenfolge bleiben unangetastet.
5. Bei Ueberlappung bestimmt diese stabile DOM-Reihenfolge zugleich die
   Paint-Reihenfolge: das spaeter in der logischen Reihenfolge liegende
   Element liegt oben. Ziehen erzeugt keine versteckte zweite Z-Historie.

### Export und Runtime

1. Direkte Popup-Kinder werden mit Rasterstyles exportiert.
2. `fuellt` wird anhand desselben Flaechenvertrags gesetzt wie auf der
   Hauptseite.
3. Export-DOM folgt der logischen `childIds`-Reihenfolge.
4. Popup-Rumpf verwendet die gemeinsame Raster-CSS-Quelle.
5. Padding bleibt bewusst popup-spezifisch; Gap kommt aus gemeinsamer Regel.
6. Tabellen im Popup werden explizit geprueft, weil `fuellt` ihre
   Seitengroessenmessung veraendert.
7. Maschinelle Exaktpruefung:
   - Popup-Host selbst ohne Grid-Item-Style und ohne `fuellt`;
   - jedes direkte Nicht-Seiten-Kind mit Rasterstyle und `fuellt`;
   - verschachtelte Flow-Kinder ohne beides;
   - Popup-Rumpf mit gemeinsamer Grid-CSS plus eigenem 12-px-Padding.

### Bestehende Tests

- direkte Upgrades Schema 1/2/3/4/5 nach 6 sowie stufenweiser Vergleich;
- Schema-5-Popup mit umsortierten und mehrzeiligen Kindern;
- Golden-Faelle fuer Pixel-, `auto`-, `fill`- und benannte Breite/Hoehe;
- Schema-6-Reload idempotent;
- Root-Koordinaten/Props unberuehrt, Root-Lesereihenfolge bewusst
  nur fuer Nicht-Seiten-Kinder normalisiert; zwei Popups behalten Slots und
  Reiterreihenfolge;
- verschachtelte Flow-Kinder unberuehrt;
- echte Texte aus A2 bleiben erhalten;
- Browser- und Maskendateipfad gleich;
- ungueltige/out-of-range Rasterwerte gehen nicht still durch;
- Add/Drop/Move/Duplikation normalisieren DOM-/Tab-Reihenfolge;
- Ueberlappung hat die festgelegte stabile Paint-Reihenfolge;
- Popup-Export enthaelt Rasterstyle und `fuellt` korrekt;
- Referenzabzug zeigt den beabsichtigten Popup-Diff;
- Runtime-Bundle enthaelt nur die erklaerten Aenderungen.

## C3 · Popup-Identitaet, Modalitaet und sichere Bedienung

Diese Punkte sind Teil der Popup-Fertigstellung, koennen aber in getrennten
Commits nach C2 umgesetzt werden.

### C3.1 Namen, Aktionen und Popup-Duplizieren

- Eine zentrale Schreibfunktion trimmt Popup-Namen. Leer/Whitespace wird
  abgelehnt; Eindeutigkeit gilt nach `trim().toLocaleLowerCase('de-DE')`;
- UI verhindert den ungueltigen Schreibvorgang, Preflight prueft denselben
  Vertrag defensiv nochmals;
- Ersatzanzeige `Popup` darf nicht einen tatsaechlich leeren Runtime-Namen
  verschleiern;
- neue Seiten und Duplikate erhalten deterministisch `Popup`, `Popup 2`, ...;
- Umbenennen aktualisiert weiterhin ueber stabile Popup-ID den Exportnamen;
- Altbestand mit leerem/doppeltem Namen geht nicht still durch, sondern wird
  mit konkreter Seite gemeldet;
- nach A5 wird `pageBlock`-Duplizieren hier wieder aktiviert: interne
  Referenzen werden umgeschrieben, Name wird eindeutig und Kopie wird aktive
  Seite. Alle Kinderpositionen bleiben exakt erhalten, weil Original und
  Kopie getrennte Surfaces sind. „Freie Position" gilt nur fuer einen normalen
  Block, der auf derselben Surface dupliziert wird.

### C3.2 Genau ein aktives Popup

- `POPUP_OPEN` trimmt/validiert den Zielnamen und loest **zuerst genau ein**
  Ziel auf. Bei keinem oder mehreren Treffern bleibt der aktuelle Dialogstand
  unveraendert und eine klare Laufzeitmeldung entsteht;
- erst nach eindeutigem Treffer werden andere Popups geschlossen und das Ziel
  geoeffnet;
- DOM-Erstellreihenfolge darf keine Rolle spielen;
- Test in beiden Erstellreihenfolgen;
- Popup A darf Popup B oeffnen, ohne dass B hinter A liegt;
- `POPUP_CLOSE` und Dialogkopf-X schliessen nur ihr eindeutig bestimmtes
  Popup;
- Testfaelle: fehlend, doppelt in fremd/manipuliertem HTML, bereits aktiv,
  `OPEN A -> OPEN B` in einer Kette und A oeffnet B.

### C3.3 Fokus und ehrliche Modalitaet

- Oeffnen verschiebt Fokus zu einer sinnvollen ersten Stelle im Dialog;
- Dialogtitel ist ueber `aria-labelledby` der zugaengliche Name;
- Vorwaerts- und Rueckwaerts-Tab bleiben im Popup;
- beim ersten Oeffnen aus der Hauptmaske wird ein **Basis-Oeffner ausserhalb
  aller Popups** gespeichert;
- beim Wechsel A -> B bleibt dieser Basis-Oeffner erhalten. Schliessen von B
  fokussiert nicht ein inzwischen verborgenes Element aus A, sondern den
  sichtbaren Basis-Oeffner;
- existiert dieser nicht mehr, geht Fokus auf einen klaren Hauptmasken-
  Fallback statt auf `body` ohne Orientierung;
- Editor-Vorschau und Runtime werden getrennt behandelt;
- erst mit funktionierender Fokusgrenze setzt der Popupmodus
  `aria-modal=true`;
- falls alte SoftEngine-Laufzeiten die Fokusgrenze verhindern, bleibt
  `aria-modal` aus und die konkrete Grenze wird benannt.

### C3.4 Loeschen und Leerseiten

- **Seitenreiter-/Auswahlrahmen-Loeschknopf**, Inspector und Delete-Taste
  benutzen denselben Loeschvertrag. Das Dialogkopf-X aus C1 schliesst/verlaesst
  nur und loescht niemals;
- Popup mit Inhalt verlangt ueber jeden Weg dieselbe Bestaetigung;
- bei eingehenden Popup-Aktionen ist Loeschen blockiert. Die Verwendungen
  werden aufgelistet und muessen zuerst entfernt oder umgebogen werden;
- keine stille Kaskade und kein automatisches Entfernen ganzer Aktionsschritte;
- Undo stellt kompletten Unterbaum wieder her;
- Hauptseite zeigt Leerhinweis, auch wenn global nur Popup-Knoten existieren;
- leeres Popup zeigt eigenen klaren Drop-Hinweis.

## C4 · Ein echter generischer Reparenting-Weg

### Belegtes Problem

Direkte Rasterknoten sind heute nicht HTML5-draggable und Pointer-Move bewegt
nur innerhalb derselben Surface. Ein vorhandener Raster->Flow-Weg darf daher
nicht behauptet werden.

### Arbeit

1. Ausgewählter Block erhaelt am Ding eine generische Aktion
   `Verschieben nach ...`.
2. Ziele kommen ausschliesslich aus Registry-/Parent-Vertrag und umfassen:
   - gueltigen Flow-Container derselben Seite;
   - Hauptflaeche;
   - andere Popup-Seite, soweit der Typ dort erlaubt ist.
3. Flow->Raster vergibt eine freie Rasterzelle und normalisiert `childIds`.
4. Raster->Flow entfernt/ignoriert Surface-Position nur im neuen Parent,
   ohne andere Props zu verlieren.
5. Raster->Raster (Root<->Popup) behaelt `w/h`, klemmt `w` auf maximal 24 und
   setzt deterministisch `x=0`, `y=naechsteFreieZeile` im Ziel; danach wird
   dessen logische Reihenfolge normalisiert.
6. Nach Cross-Page-Move wird die Zielseite aktiv und der verschobene Block
   bleibt sichtbar ausgewaehlt; der Inspector zeigt ihn sofort. Undo/Redo
   aktiviert entsprechend Ziel-/Quellseite oder filtert die Auswahl, niemals
   bleibt eine unsichtbare Auswahl.
7. Move und Undo/Redo sind je ein Zustandsschritt; kein Clone-and-delete.

### Nutzerprobe

- Flow-Container -> Popup-Raster;
- Popup-Raster -> sichtbarer Flow-Container;
- Root -> Popup und Popup -> Root;
- Ziel ist bereits belegt und Block ist breiter als freie Stelle;
- unzulaessiges Ziel erscheint nicht;
- nach Move ist Zielseite sichtbar und Inspector zeigt den richtigen Block;
- Export, Reload und Undo/Redo behalten Parent, aktive Seite, Auswahl und
  Layout korrekt.

### Nutzer-Abnahmematrix fuer Welle C

1. Altes Schema-5-Popup vor und nach Migration vergleichen.
2. Popup mit bisherigen 240-/400-px-Werten, migrierten 520 px, grosser Breite
   und Host kleiner als 544 px.
3. Elemente einfuegen, verschieben, vergroessern, duplizieren, Undo/Redo.
4. Zeile mit verschachteltem Datum bleibt Flow.
5. Palette-Drop weit oben erzeugt passende DOM-/Tab-Reihenfolge.
6. DnD nach vertikalem und horizontalem Scroll; Kopf, Rahmen und Overlay
   zeigen keinen Geist und akzeptieren keinen Drop.
7. Ueberlappung folgt der festgelegten stabilen Paint-Reihenfolge.
8. Reparenting in beide Richtungen und zwischen Root/Popup.
9. Tabelle beginnt geschlossen, erhaelt Daten, oeffnet und misst korrekt;
   Schliessen/Oeffnen dupliziert weder Listener noch Observer.
10. Speichern, Reload, Maskendatei speichern und erneut oeffnen.
11. Export in SoftEngine: Positionen entsprechen Editor.
12. Tab folgt sichtbar oben-links nach unten-rechts.
13. Zwei Popups in beiden Erstellreihenfolgen gegenseitig oeffnen.
14. Fokus vorwaerts/rueckwaerts sowie nach Oeffnen, Wechsel und Schliessen.
15. Leer-, Whitespace-, Gross-/Kleinschreibungs-Duplikat und fehlendes
    Runtimeziel werden klar verhindert, ohne aktuelles Popup zu schliessen.
16. Dialogkopf-X und Seiten-Loeschknopf zeigen ihre verschiedenen Wirkungen.
17. Loeschen ueber Seitenknopf, Inspector und Tastatur verhaelt sich gleich;
    eingehende Aktionen blockieren es mit Verwendungsanzeige.
18. Maske nur mit Popup und leere Hauptseite zeigt korrekten Leerzustand.

---

# Welle D — Eine echte Tabelle im Nachschlagen

## D0 · Nur bei Bedarf verhaltensneutral schneiden

Vor D1 wird anhand des geplanten Diffs entschieden, welche Datei wirklich
geteilt werden muss.

- `FormFeldBlock.ts` wird nicht vorsorglich geschnitten, wenn die neue Logik
  dort nicht entsteht.
- Wahrscheinlicher braucht `TabelleBlock.ts` einen thematischen Schnitt fuer
  Datenbesitz, Aktivierung oder Fokus.
- Jeder noetige Schnitt ist ein eigener byte- und verhaltensneutraler Commit.

## D1 · Allgemeiner Tabellenzeilen-Aktivierungsvertrag

### Ziel

Eine Tabellenzeile kann unabhaengig von Geber-ID und dauerhafter Auswahl
allgemein aktiviert werden.

### Vertrag

1. Ein einziger interner Pfad behandelt Maus und Tastatur.
2. Semantik ist vollstaendig und nicht nur ein fokussierbares `div`:
   Tabellencontainer `role=table`, Kopf-/Datenzeilen `role=row`, Kopfzellen
   `role=columnheader`, Datenzellen `role=cell`; `aria-selected` nur bei echter
   Auswahlsemantik.
3. Jede aktivierbare Datenzeile behaelt wie das heutige Nachschlagen
   `tabindex=0`. Es wird in diesem Umbau kein halbes roving-tabindex ohne
   Pfeilnavigation eingefuehrt. Eine spaetere Roving-Variante waere nur mit
   vollstaendiger Up/Down/Home/End-Navigation ein eigener Auftrag.
4. Enter aktiviert die Zeile; weitere Tasten werden nur mit klarer Semantik
   hinzugefuegt.
5. Exaktes generisches Custom Event `ff-zeile-aktiviert`:
   - `bubbles: true`;
   - `composed: true`;
   - Detail `{ rohzeile, rohIndex, ansichtIndex }`;
   - `rohIndex` zeigt stabil in den unveraenderten gelieferten Rohdatensatz;
   - `ansichtIndex` ist die Position nach Filter/Sortierung auf der aktuellen
     Seite.
6. Aktivierung funktioniert ohne `data-ff-id` und ohne Auswahl-Geber.
7. Normale Tabelle darf bei Aktivierung zusaetzlich ihre heutige Auswahl
   toggeln.
8. Aktivierung und Auswahl-Toggle bleiben getrennte Begriffe und Funktionen.
9. Nach Sortieren/Filtern/Blaettern wird Zeilenfokus nur restauriert, wenn vor
   dem Re-Render tatsaechlich eine Datenzeile DOM-Fokus hatte. Fokus in Suche,
   Tabellenkopf oder Paging bleibt dort. War eine Zeile fokussiert, bleibt
   dieselbe Rohzeile fokussiert, wenn sichtbar; sonst erste Datenzeile, bei
   leerer Seite der Tabellencontainer.

### Nutzerprobe

- normale Tabelle per Maus und Enter aktivieren;
- Auswahlverhalten bleibt wie vorher;
- sortieren, filtern, Seite wechseln;
- kein doppeltes Event;
- Fokus ist sichtbar und nachvollziehbar.

## D2 · Allgemeiner Modus fuer bereitgestellte Daten

### Ziel

Dieselbe Tabellenkomponente kann entweder ihre normalen SoftEngine-Daten
besitzen oder Zeilen von einem umgebenden Verbraucher erhalten.

### Vertrag

1. Expliziter Besitzmodus, sinngemaess:
   - `softengine`;
   - `provided`.
2. Modus wird vor DOM-Anschluss gesetzt.
3. Im `provided`-Modus:
   - kein `connectTable`;
   - kein `bootSe`;
   - kein vorgetaeuschtes `source`-Attribut;
   - eine einzige atomar gesetzte, nicht als HTML-Attribut reflektierte API
     `bereitgestellteZeilen` ist die Wahrheit:
     `{ rohzeile, zellen, zusatz }[]`;
   - interne `datenzeilen`, `rohzeilen` und `zusatzzeilen` werden nur gemeinsam
     daraus abgeleitet, niemals einzeln vom Verbraucher gesetzt;
   - `datenGeliefert/hatDaten` wird ausdruecklich aus diesem Modus bestimmt.
4. Beim Moduswechsel werden alle abgeleiteten Felder konsistent
   zurueckgesetzt:
   - Anzeigezeilen;
   - Rohzeilen;
   - Zusatzdaten;
   - Auswahlindex;
   - Filter-/Suchzustand;
   - Paging;
   - Messzustand;
   - `durchAuswahlGefiltert = false`.
5. Beim Besitzmoduswechsel wird nur das SoftEngine-Datenabo getrennt oder
   aufgebaut. Der ResizeObserver bleibt in beiden Modi aktiv, solange die
   Tabelle verbunden und sichtbar ist, und wird erst beim DOM-Abbau entfernt.
6. Normale Tabellen bleiben byte- und verhaltensgleich, soweit die neue
   allgemeine Aktivierung keinen bewusst dokumentierten Exportdiff erfordert.

### Bestehende Tests

- provided vor Connection;
- keine SoftEngine-Anmeldung;
- Datenpush ueberschreibt provided nicht;
- Rohzeile bleibt vollstaendig;
- Wechsel/Abbau hinterlaesst keine Auswahl- oder Filterreste;
- beide Richtungen `softengine -> provided -> softengine` bleiben atomar;
- normale Tabelle hydriert weiterhin mehrfach korrekt.

## D3 · Nachschlagen komponiert `ff-tabelle`

### Ziel

Die manuell gebaute Nachschlage-Zeilenliste wird vollstaendig durch die echte
Tabellenkomponente im bereitgestellten Modus ersetzt.

### Arbeit

1. Bestehender `DialogRahmen` bleibt Rahmen.
2. Nachschlagen friert die relevante Datenmenge beim Oeffnen wie heute ein.
   Ein Datenpush waehrend des offenen Dialogs veraendert diese Ansicht nicht;
   erst Schliessen und erneutes Oeffnen zeigt den neuen Stand.
3. `holeEintraege` inklusive bestehender Auswahlfolge-/Folgefilterung bleibt
   die **eine** Wahrheit fuer Dialog und automatische Einzeluebernahme. Ein
   Beispiel `Kunde -> nur dessen Tiere` muss vor und nach Umbau identisch sein.
4. Es erzeugt genau die fachlich benoetigten Spalten:
   - Anzeigename;
   - Technikwert;
   vorerst als Text, ohne erfundene Bild-/Statuskonfiguration.
5. Tabelle erhaelt die atomaren `bereitgestellteZeilen` mit vollstaendigen
   Rohzeilen.
6. Allgemeines Zeilenaktivierungs-Event waehlt die Rohzeile und schliesst den
   Dialog.
7. Genau ein Treffer wird weiterhin ohne geoeffneten Dialog automatisch ueber
   denselben `holeEintraege`-Stand uebernommen.
8. Maus und Enter liefern dieselbe Zeile.
9. Suche, Kein-Treffer-Zustand, Paging und Groessenmessung verwenden die
   allgemeinen Tabellenfaehigkeiten.
10. Im Modus mit fuellender eingebetteter Tabelle ist
   `DialogRahmen.inhalt` `overflow:hidden`; allein der Tabellenkoerper scrollt.
11. Fokus geht beim Oeffnen sicher in die Suche und nach Schliessen/Übernahme
   zur Lupe beziehungsweise zum ausloesenden Feld zurueck.
12. Vorwaerts- und Rueckwaerts-Tab bleiben im Nachschlagedialog; der sichtbare
    Titel ist per `aria-labelledby` verknuepft. `aria-modal=true` wird nur mit
    funktionierender Fokusgrenze behauptet.
13. Mehrfaches Oeffnen/Schliessen erzeugt keine Listener- oder
   ResizeObserver-Dopplung.
14. Alte handgebaute Tabellenzeilen, Styles und Eventpfade werden restlos
    entfernt. Keine zweite Darstellung bleibt als „Fallback" liegen.

### Bewusste sichtbare Entscheidungen

- Tabellenkopf, Sortierbarkeit, Technikwert-Schrift und Footer werden vor der
  Implementierung anhand des bestehenden Tabellenverhaltens benannt.
- Marken, Tierbilder oder spezielle Spaltenbreiten erscheinen nur, wenn die
  Spaltenart dies wirklich konfiguriert. Zwei Textspalten erfinden sie nicht.
- WinUI ohne verlaessliche ResizeObserver-Messung behaelt einen ehrlichen
  begrenzten Fallback statt geratenem Vollbildverhalten.

### Nutzer-Abnahmematrix Welle D

1. Nachschlagen mit vielen, wenigen und null Datensaetzen.
2. Suche mit Treffer und ohne Treffer.
3. Mauswahl und Enterwahl derselben Zeile.
4. Paging und Sortierung, sofern bewusst aktiviert.
5. Vollstaendige Rohzeile befuellt das Zielfeld korrekt.
6. Auswahlfolge `Kunde -> nur dessen Tiere` und automatische Uebernahme bei
   genau einem Treffer.
7. Mehrfach oeffnen, schliessen, erneut oeffnen.
8. Datenpush waehrend des offenen Dialogs: Ansicht bleibt eingefroren;
   nach Schliessen/erneutem Oeffnen erscheint der neue Stand.
9. Fokus zurueck zur Lupe.
10. Normale Tabelle ausserhalb des Dialogs unveraendert.
11. SoftEngine-Probe in WinUI und, soweit verfuegbar, WebUI.

---

# Welle E — Der grosse Innenumbau

Diese Welle ist der Teil, den Fassung 5 zu stark auf „spaeter" verschoben hat.
Sie erfolgt erst nach den sichtbaren Vertragsklaerungen, damit die Registry
nicht gleichzeitig mit Popup und Tabelle umgebaut wird.

## E1 · Vollstaendiges Registry-Inventar und Waechter zuerst

### Vor jedem Metadatenumbau erfassen

Fuer jeden Bausteintyp:

- `blockType`;
- `tagName`;
- Kategorie;
- Default-Props und deren Reihenfolge;
- Parent-/Child-Faehigkeiten;
- Resize-/Raster-Faehigkeiten;
- Bindungsstellen;
- Blockevents;
- Visible-When-/Auswahlfaehigkeiten;
- Exportattribute;
- reine Editor-Angaben wie Icon, Hilfetext und Palettenname.

Das Inventar wird im Plan-/Review-Chat vorgelegt, nicht als neue dauerhafte
Dokumentationsablage.

Der Regelwaechter muss vor der Migration beweisen:

- zwei unabhaengig aus realen Code-/Registrierungseinstiegen abgeleitete
  Mengen stimmen ueberein; keine manuelle Soll-Typenliste;
- exakt alle tatsaechlichen Bausteintypen erkannt;
- keiner doppelt;
- keiner fehlt;
- jeder weiterhin in Exporttest, Positivliste und Referenzabzug vertreten;
- zehn von elf erkannten Definitionen koennen nicht faelschlich gruen sein.

## E2 · Eine runtime-sichere Baustein-Definition

### Ziel

Faehigkeiten und Defaults haben eine kanonische runtime-sichere Quelle.

### Grenze

`editorAngaben` bleibt getrennt. Icons, React-/Lucide-Werte und reine
Editor-Hilfen duerfen nicht in das Runtime-Bundle jeder SoftEngine-Maske
gelangen.

### Arbeit

1. `BlockCategory` und andere von Core/Editor gemeinsam benoetigte reine Typen
   vorab an einen neutralen runtime-sicheren Ort verschieben.
2. Direkte Metadatenleser als Abhakliste pruefen:
   - `editorAngaben`;
   - Kanban-Runtime;
   - `seAktionen`;
   - Kindtyp-/Parentpruefung;
   - Tabellenbindung;
   - Default-/Export-Anker;
   - Regelwaechter und Runtime-Einstieg.
3. Runtime-sichere Definition enthaelt Typ, Tag, Defaults und Faehigkeiten.
4. `BasicBlock` liest Metadaten aus dieser Definition, kopiert sie nicht mehr
   als unabhaengige statische Wahrheiten.
5. Registry liest dieselbe Definition.
6. Editor-Angaben referenzieren den Typ, bleiben aber in editor-only Modul.
7. Vorhandene Default-Reihenfolge bleibt deterministisch, damit nicht jede
   Maske ohne fachlichen Grund Exportbytes aendert.
8. Importgraph wird vor und nach dem Umbau geprueft:
   - Core importiert keine konkreten Bausteine;
   - Runtime importiert keine Editor-Icons;
   - keine neuen Zyklen.
9. Toter Instanz-Metadaten-Getter wird entfernt, wenn nachweislich kein Leser
   verbleibt.
10. `CLAUDE.md` wird im selben Commit an die neue kanonische Wahrheit
    angepasst.

### Vorgehen

- ein repraesentativer Baustein darf lokal/uncommittet als Schnittbeweis
  dienen;
- Diff und Runtime-Bundle daran pruefen und den Probediff danach in die
  vollstaendige Migration integrieren;
- committed wird erst die vollstaendige Migration ohne dauerhaften Dual-Path
  aus alter und neuer Registry;
- mechanische Migration der uebrigen Bausteine bleibt derselbe klar begrenzte
  Architekturauftrag;
- keine gleichzeitige sichtbare Eigenschaftsaenderung.

### Fertig, wenn

- neue Faehigkeit an genau einer runtime-sicheren Stelle deklariert wird;
- Defaultwert genau eine kanonische Quelle hat;
- Waechter exakt alle Definitionen erkennt;
- Runtime-Bundle keine Editor-Abhaengigkeit traegt;
- Referenzexport ohne unbeabsichtigten Diff bleibt;
- alte parallele Metadatenlisten entfernt sind.

## E3 · Property-Schreibnaht absichern

### Ziel

`Editor.updateProperty` speichert keine Tippfehler oder Eigenschaften, die der
Baustein gar nicht besitzt und erst beim naechsten Reload verschwinden.

### Arbeit

1. Gegen die kanonische Definition beziehungsweise erlaubte Property-Menge
   validieren.
2. Raster-/interne Props haben einen ausdruecklichen zentralen Vertrag.
3. Ungueltige Property wird **vor** `pushHistory`, State-Zuweisung, Version/
   `notify` und Autosave abgelehnt. Sie veraendert weder Baum noch Undo/Redo,
   Listenerbenachrichtigung oder Speicherplanung.
4. Entwicklerdiagnose nennt Blocktyp und Propertyname und wird fuer denselben
   Fehler dedupliziert statt bei jedem Render erneut gespammt.
5. Alle heutigen Aufrufer inventarisieren; kein generischer Doppel-Cast wird
   nur aus optischen Gruenden entfernt, wenn TypeScript ihn fuer die
   React-Lit-Grenze benoetigt.
6. Sanitizer und Schreibnaht verwenden dieselbe Property-Wahrheit.

### Fertig, wenn

- Tippfehler sofort auffallen;
- gueltige heutige Controls unveraendert arbeiten;
- Property nicht erst nach Reload verschwindet;
- keine zweite Property-Liste nur fuer den Editor entsteht;
- Test beweist bei ungueltigem Key: kein History-Eintrag, keine Version/
  Benachrichtigung und kein Autosave.

---

# Welle F — Relationen, Aktionen und Designsprache

Diese Welle ist nicht bloss Kosmetik. Sie schliesst den Gesamtumfang aus
Fassung 4 ab, wird aber bewusst nach der Daten- und Komponentenarchitektur
gebaut.

## F1 · Relationen- und Aktionsbedienung erst entwerfen

**AUFGEGANGEN IN WELLE U (2026-08-12, Nutzer-Auftrag Generalsanierung).**
Nicht mehr getrennt bearbeiten. Die Regeln und die Entwurfsfragen unten
gelten in Welle U unveraendert weiter.

### Regeln

- kein Code, bevor der Nutzer den sichtbaren Entwurf in Klartext beziehungsweise
  als kleines Bild/Wireframe bestaetigt;
- keine Tutorial- und Erklaertexte in der Steuerung;
- SoftEngine-Begriffe bleiben wie entschieden sichtbar:
  `START_TOOL`, `GET_RELATION`, `PUT_RELATION`, `PUTADD_RELATION`;
- Technikwerte und IDs bleiben technisch, sichtbare Auswahl verwendet
  Klarnamen;
- `aus` ist klarer Parameterzustand, kein verschwundener Formularplatz;
- START_TOOL zeigt keine erfundenen Parameter;
- Ketten bleiben sichtbar und sind der einzige Schreibweg;
- Verwendung und Folgen einer Relation werden vollstaendig angezeigt;
- der Entwurf nimmt die Bedien-Befunde der Zwischenbilanz 2026-08-10 als
  Eingabe: sechs verschiedene Bauformen fuer „Feld einer Quelle waehlen",
  namenlose Inspector-Sektionen (bis 26 Bedienelemente ohne Ueberschrift),
  die StepForm als groesste Eingabemaske in der 340-px-Spalte, roher
  Jargon (PINDEX/VALUE/Rohsyntax) trotz vorhandenem Klartext
  (`helfer.ts:50-59`).

### Entwurf beantwortet mindestens

1. Wo sieht der Nutzer Quelle, Schrittart und Ziel?
2. Wie erkennt er fehlende Pflichtparameter?
3. Wie sieht `aus` aus, ohne einen Parameter zu verschieben?
4. Wie werden „Ergebnis von Schritt N" und Blockwerte unterschieden?
5. Wie werden geloeschte Ziele/Quellen sichtbar?
6. Wie werden lange Ketten lesbar, ohne einen neuen versteckten Wizard zu
   erfinden?
7. Wie bleiben Tastatur und Fokus nachvollziehbar?

## F2 · Bestaetigten Relations-/Aktionsentwurf implementieren

**AUFGEGANGEN IN WELLE U (2026-08-12).** Die Punkte unten gelten dort als
Bau-Regeln weiter.

- bestehendes Datenmodell nur aendern, wenn der bestaetigte Entwurf es
  wirklich verlangt;
- keine Migration ohne eigenen Schutz und Altbestandstest;
- keine zweite Terminologie;
- Preflight-Fehler verlinken/benennen die sichtbare Stelle;
- alte UI restlos entfernen, wenn sie ersetzt ist;
- normale bestehende Ketten muessen bytegleich exportieren, sofern keine
  bewusste Semantikaenderung beschlossen wurde.

Nutzerprobe umfasst Anlegen, Bearbeiten, `aus`, Schritt-Ergebnisse,
geloeschte Referenz, Reload, Undo/Redo und SoftEngine-Ausfuehrung.

## F3 · Designsprache systematisch abgleichen

### Quelle

Die eingecheckte `designsprache/` und `masken-tokens.css` sind das Vorbild.
Es wird abgeschrieben, nicht aus KI-Geschmack neu gestaltet. Fehlt eine
Entscheidung im Musterbogen, wird gefragt.

### Reihenfolge

1. Gemeinsame Atome/Styles pruefen, nicht jeden Baustein einzeln flicken.
2. Dialog/Popup/Tabelle gegen Tafel-Rahmen und Tokens vergleichen.
3. Tabelle: Spaltenbreiten nach Art, nicht nach zufaelligem Inhalt.
4. Status: Rohwert ohne Zuordnung grau; Bedeutung bestimmt feste Farbe.
5. `Bild + Name` verwendet geteilte Bilder/Assets.
6. Datum nur ausrichten, nie inhaltlich umrechnen.
7. Kanban-Karte gegen fehlende Reiter/Fusszeile pruefen.
8. Veraltete Meldungs-Fallbackfarben an heutige Tokens angleichen.
9. Editor-UI-Tokens und Masken-/Runtime-Tokens nicht vermischen.

### Fertig, wenn

- jede sichtbare Abweichung entweder korrigiert oder als bewusste
  Nutzerentscheidung benannt ist;
- kein bausteinspezifischer Hex-Farbwert neu entsteht;
- Editor und Export dieselbe Web Component zeigen;
- Designaenderungen keinen Daten- oder Runtime-Vertrag veraendern;
- Nutzer den Vergleich im Browser und bei betroffenen Runtime-Komponenten in
  SoftEngine bestaetigt hat.

---

## R · Zeilen per Relation holen (eingeschoben 2026-08-11, Nutzer-Auftrag)

**Auftrag des Nutzers vom 2026-08-11** nach einem Tag Echttests an seiner
laufenden Maske: eine freistehende Maske zeigt die Positionen des Belegs, den
der Bediener in der Belege-Tabelle anklickt. Der Schiebe-Weg (SEFILELOOP)
kann das nachweislich nicht: ohne Kopfsatz liefert SoftEngine nichts, die
Feld-Referenz `BEL_0_11` loest nur IM Beleg auf, ein Literal-Index nagelt die
Datei auf genau EINEN Beleg fest (Echttests 2026-08-10/11, Gedaechtnis
`pos-braucht-kopfsatz`).

**Abgrenzung — WICHTIG fuer jeden neuen Chat:**

- **R ist NICHT die gestrichene Welle Q** („Daten auf Abruf", Einschub
  `1884394`, Revert `b484e11`, Gedaechtnis `daten-auf-abruf-gestrichen`).
  Q war ein Generalumbau: JEDE Quelle umschaltbar, generische Frage-Funktion,
  Nachschlagen fragt beim Tippen, eigene Tabellen-Ausloeser. R ist EINE
  zusaetzliche Lade-Art fuer den EINEN belegten Fall; bestehende Quellen,
  Masken und Exporte bleiben byte-gleich. Der Nutzer hat R am 2026-08-11 in
  Kenntnis der Q-Streichung ausdruecklich beauftragt („B bauen").
- **R ist nicht D2:** D2 gibt einer TABELLEN-Komponente Zeilen von einem
  umgebenden Baustein (fuer D3/Nachschlagen). R fuellt die QUELLE; alle
  Verbraucher (Tabelle, Einzelwerte, Ketten, Verknuepfung, Auswahl
  geben/folgen) lesen sie unveraendert ueber den normalen Datenweg.

**Alles Folgende ist am 2026-08-10/11 in der SoftEngine des Nutzers LIVE
belegt** (Testmaske `Desktop\test69` + Handbau-Lader in seiner echten Maske;
Kurzfassung auch in CLAUDE.md, Kapitel SoftEngine-Kontrakte):

- Relation 69 („Relation Position") liefert zur Laufzeit Positionsfelder:
  `basisHTML_SND_MSG('GET_RELATION', { NR: '69', PARAMS: [BELART, POS, LEN,
  BELNR, JAHR, ARCHIV, '', POSNR, '', '', '', ''] })`, Antwort
  `{"RESULT":"..."}` ueber den REGISTER-Callback, 2–19 ms je Frage.
- JAHR/ARCHIV muessen mit (BEL-Felder `0_1`/`1_1` der angeklickten Zeile):
  leer fand die Relation nur den aktuellen Nummernkreis (262er), mit Werten
  auch die 261er.
- Ein breiter Schnitt `POS=0, LEN=255` liefert die vordere Positionszeile in
  EINEM Aufruf (die Antwort-Variable fasst 255 Zeichen, SE-Log `zlen=255`);
  nur Felder dahinter (z. B. `280_12`) kosten je eine weitere Frage.
- Ende der Liste: `11_6` UND `18_25` beide leer. Der Positionsident `645_10`
  ist in dieser Installation LEER und taugt nicht als Ende-Marker.
- Streng seriell fragen: GET-Antworten tragen keine Zuordnung zur Frage.
  `ALS_ARRAY`/`ALIAS` (offizielle Framework-Felder) aendern daran nichts:
  Antwort wird eine 10er-Liste, gefuellt bleibt EIN Wert.
- Einspeisen: Zeilen als Objekte mit direkten `pos_len`-Properties plus
  SATZ-Rohstring in den normalen Datenweg; `getField`
  (`src/softengine/data.ts:59`) schneidet die uebrigen Spalten selbst.
- ERPAPICALL zur Laufzeit friert die WinUI-Maske des Nutzers EIN (nur
  Task-Manager hilft) — NICHT verwenden, bis die ErpApiCall-Referenz der
  Installation vorliegt (Gedaechtnis `erpapicall-laufzeit-form`).
- Referenz-Implementierung: der Handbau-Lader in der Nutzer-Maske
  (`Downloads\index.basis.source.html`, Block „Klick-Lader v3") — der
  Editor-Code muss sich exakt daran messen.

### R1 · Lade-Art am Quellen-Modell, Steuerung und Export

**Ziel:** Eine Datenquelle traegt sichtbar die Lade-Art „Zeilen per Relation
holen": Relationsnummer, Geber-Quelle (deren gewaehlte Zeile den Beleg
bestimmt), die vier Parameter-Zuordnungen (Belegart/Belegnummer/Jahr/Archiv
<- Feldcodes der Geber-Zeile) und die Ende-Felder. Vorbelegung = der belegte
Fall (69, 2_1/3_8/0_1/1_1, Ende 11_6+18_25).

**Arbeit:**

- Modell als Daten am Quellen-Eintrag (`core/data/dataSources.ts`-Umfeld,
  kein Baustein-Sondercode, Regel 2); Persistenz additiv, KEIN Schema-Bump
  (die 6 bleibt fuer C2 frei).
- Formular in der Steuerung (Datenquellen-Formular), Abschnitt „Woher kommen
  die Zeilen?" mit den zwei Arten.
- Export schreibt die Einstellung als Daten an die Maske und laesst fuer
  solche Quellen den SEFILELOOP-Eintrag weg (`export/exportMask.ts`,
  `collectDataSources`).
- Export-Testfaelle (Round-Trip); Referenzabzug bleibt gruen, weil die
  Referenzmaske die neue Art nicht nutzt.

**Wo sichtbar:** Steuerung -> Datenquellen; die Export-Datei. In SoftEngine
noch nichts — R1 laedt bewusst nicht.

### R2 · Laufzeit: die Quelle holt bei Auswahl-Wechsel

**Ziel:** Wechselt die Auswahl der Geber-Quelle, holt die Quelle ihre Zeilen
selbst (Schnitt je Position + Einzelfelder, Ende-Erkennung, streng seriell,
Anzeige erst am Ende) und speist sie in den normalen Datenweg. Danach
verhaelt sich die Quelle wie jede andere: Tabelle, Verknuepfung, Ketten,
Auswahl geben/folgen — alles unveraendert nutzbar.

**Arbeit:**

- Lader als generisches Modul in `src/softengine/` (kennt NIE einen
  Baustein), gespeist aus der R1-Einstellung; Ausloeser = Auswahl-Abo
  (`blocks/shared/auswahl`-Mechanik von aussen, Schichtregel beachten).
- Ein GET in Flug (bestehende Warteschlange, `seGetNewIndex`-Muster);
  Generationszaehler gegen ueberholte Antworten; Timeout still-harmlos.
- Runtime-Buendel bewusst neu (`build:runtime`), Veralten-Waechter und
  Export-Referenzabzug entsprechend.

**Nutzerprobe (SE-Echttest, gebuendelt nach R2):** Beleg anklicken ->
Positionen erscheinen (261er UND 262er Nummernkreis); Abwahl leert;
Verknuepfung auf den Artikelstamm an einer geholten Zeile; **PUT ueber eine
sichtbare Kette auf eine geholte Position** (Schreiben — ausdrueckliche
Nutzer-Anforderung 2026-08-11); Maske ausserhalb von SoftEngine bleibt
still-harmlos.

**Was der bauende Agent nicht pruefen kann:** alles in SoftEngine — macht
der Nutzer.

### R3 · Beleg per Nachschlage-Formularfeld waehlen (eingeschoben 2026-08-12)

**Nutzer-Wunsch 2026-08-12:** einen Beleg ansehen/beschreiben, ohne immer
eine Belege-Tabelle auf der Maske zu haben — das Nachschlage-Formularfeld
soll ihn waehlen.

**Kein Sonderweg (Nutzer-Klarstellung 2026-08-12: „ich will einfach ganz
normal Auswahl folgt benutzen koennen"):** R3 vervollstaendigt genau das —
Folger-Bausteine hoeren heute schon auf das Nachschlagefeld, nur das
NACHLADEN holender Quellen (holendeQuellen) tat es nicht. Danach geben
Tabelle, Kanban und Nachschlagefeld ihre Auswahl ueber EINEN Mechanismus.

**Stand im Code:** Der Ausloeser `blocks/shared/holendeQuellen.ts` kennt
heute nur Geber-BLOECKE mit `source`-Attribut (Tabelle/Kanban). Das
Nachschlage-Formularfeld gibt seine Wahl bereits als Auswahl weiter
(satzWahl ueber `nachschlagQuelle`, `setzeAuswahl` in
`blocks/formfeld/FormFeldBlock.ts`) — es fehlt NUR das Mapping in
holendeQuellen; die Luecke ist dort im Kommentar dokumentiert.

**Arbeit:** Mapping generisch ueber die Registry-Angabe erweitern
(satzWahl.quelleProp), KEIN Formularfeld-Sondercode (Regel 2).
Runtime-Buendel bewusst neu (`build:runtime`). Bestehende Testdatei
(`softengine/relationLader.test.ts`-Umfeld) um den Fall erweitern — keine
neue Test-Gattung.

**Nutzerprobe (SE):** Beleg im Nachschlagefeld waehlen -> Positionen
erscheinen; Wahl leeren -> Positionen leeren.

### R4 · Beleg anlegen und sofort sehen — WARTET auf das Anlege-Protokoll

**Nutzer-Wunsch 2026-08-12.** GET 1020 ist laut Nutzer die Anlege-Relation
seiner Installation („Neuanlage Belegkopf", steht schon in seiner
Relations-Bibliothek). Es FEHLT das Echttest-Protokoll: die PARAMS-Form,
die Antwort (liefert sie die neue Belegnummer?), und ob der frische Beleg
sofort ueber Relation 69 lesbar ist. KEIN Bau ohne diese Belege (Regel 5).
Zusaetzlich noetig und eine EIGENE Entwurfs-Entscheidung: „Ketten-Ergebnis
wird Auswahl" — der neu angelegte Beleg soll sich anschliessend selbst
zeigen. Der erste Versuch des Nutzers, das Protokoll zu liefern, wurde von
der Refresh-Flut abgewuergt -> R5 hat Vorrang.

### R5 · Refresh-Flut: Zeilenfilter FREISELEKT (BAUBAR — Form belegt 2026-08-12)

**Belegtes Problem (Nutzer 2026-08-12, sein Blocker):** Ein Refresh ist
noetig, damit neue Saetze erscheinen — aber SoftEngine schiebt dabei ALLE
Zeilen ALLER bestellten Quellen erneut (Nutzer: „diese 20000 zeilen im
debug ... das geht nicht weiter, OHNE das wir das problem beheben"). Die
Menge bestimmt allein unsere Bestellung (vgl. S5.1: 5 953 Bild-Nachschlaege
beim Oeffnen).

**Form belegt (Durchsuchung `Desktop\VORLAGEN` am 2026-08-12 — 267 echte
SEvariablen-Dateien, 10 Dateien mit Treffern):** `FREISELEKT` ist ein
optionales Filter-Praedikat direkt am SEFILELOOP- (und WINDOWLOOP-)
Eintrag; die Doku-Vorlage des HTMLEditors nennt es woertlich „ein freier
Selektionsausdruck". Echte Beispiele:

- `"FREISELEKT": "BEL_3_8<99990000"` — daneben im selben Eintrag
  `"SORTIERUNG": "ABSTEIGEND"` (MIS_V3\LANDINGPAGES\KDE\HTML\01 und
  LFR\HTML\01, dort im SEFILELOOP; nur EIN Geschwister-Eintrag traegt
  den Filter, die uebrigen nicht — es ist je Eintrag optional).
- `"FREISELEKT": "SERPOS_3_1='N'"` — Textwert in einfachen
  Anfuehrungszeichen (SER\HTML\01).
- `"FREISELEKT": "ART_1_25<>''"` und
  `"SUBLGR_BESTAND<>0&SUBLGR_BESTAND_KALKULIERT<>0"` — ungleich und
  UND-Verkettung mit `&` (LGR_LagerPlatz\HTML\01).
- `"FREISELEKT": "BEL_11_8=ADA_1_8"` — Feld-mit-Feld-Vergleich
  (ADA\HTML\01). Leerer String kommt vor und ist erlaubt
  (BESTELLSYSTEM_STANDARD).

Felder tragen den DATEI-Praefix (`BEL_3_8`); belegte Operatoren `=`,
`<>`, `<`, `&` (UND); die Doku-Vorlage zeigt zusaetzlich `#` (ODER) und
Klammern.

**Arbeit:** Die Datenquelle bekommt ein optionales Feld „Zeilenfilter"
(freier Ausdruck; Installations-Daten, der Editor prueft und erfindet
nichts). Der Export schreibt ihn unveraendert als `FREISELEKT` in den
SEFILELOOP-Eintrag der Quelle, weggelassen wenn leer. Persistenz additiv,
KEIN Schema-Bump. Ein Export-Testfall (Round-Trip). Runtime unveraendert
— gefiltert wird von SoftEngine.

**Nutzerprobe (SE):** grosse Quelle (Belege) mit Filter versehen —
Refresh liefert sichtbar weniger Zeilen, die Debug-Flut faellt.

**Daneben belegt, bewusst NICHT gebaut (Regel 10):**
`VON_INDEX`/`BIS_INDEX` + `INDEX_NR` (Index-Bereich, auch mit
CONCAT-Formeln — pinnt einen Loop z. B. auf Adresse+Belegart),
`MAX_DURCHLAEUFE` (haengt nur an WINDOWLOOP — ein Loop-Typ, den unser
Export nicht schreibt), `NUR_AKTUELLE_ZEILE` (TABELLE-Eintraege),
`MAX_ZEILEN` (nur in der Doku-Vorlage, in KEINER echten Maske).
Lazy-Loading (Welle Q) bleibt gestrichen.

---

# Welle U — Generalsanierung der Editor-Bedienung (eingeschoben 2026-08-12)

**Auftrag des Nutzers vom 2026-08-12 (Kern woertlich):** „die funktionen
sind ja echt gut mittlerweile aber die umsetzung ist widerlich" · „es ist
alles zusammengeflickt, zusammengeschmissen, das sieht aus wie 1999 [...]
allgemein die art und weise, form, design, layout" · „ich glaube es gibt
zig stellschrauben fuer jede einstellung, zu viele abhaengigkeiten".
Dazu drei Screenshots (Steuerung/Datenquellen-Formular,
Steuerung/Relationen, Inspector Formularfeld + Tabelle) und die
Einzel-Befunde in U0. Eingabe ist AUSSERDEM die Bedien-Befundliste der
Zwischenbilanz 2026-08-10 (s. Entscheidung 5 in 0.1) und die Inventur vom
2026-08-12 (Etappen U1 ff.).

**Geltungsbereich:** NUR die Editor-Bedienoberflaeche — Steuerung,
Inspector, Palette, Tab-Leiste, Meldungen, Begriffe, Editor-Optik. Die
Maske selbst (Bausteine, Export-Bytes, Runtime, SoftEngine-Anschluss)
bleibt UNVERAENDERT; der Export-Referenzabzug beweist das bei jeder
Etappe. Eine Etappe, die davon abweichen muss, sagt es in ihrer Ansage
ausdruecklich und begruendet es.

**Ersetzt F1/F2.** Deren Regeln gelten hier unveraendert weiter — vor
allem: kein Code fuer die Relations-Bedienung vor bestaetigtem Entwurf;
keine Tutorial-/Erklaertexte in der Steuerung; die SE-Fachbegriffe
START_TOOL/GET_RELATION/PUT_RELATION/PUTADD_RELATION bleiben sichtbar;
Klarnamen vor Technikwerten; Ketten bleiben sichtbar und der einzige
Schreibweg; alte UI wird restlos entfernt, wenn sie ersetzt ist; keine
zweite Terminologie.

**Arbeitsmodus (Token-Entscheidung des Nutzers 2026-08-12):** Gebaut wird
von OPUS in frischen Sitzungen — eine Etappe je Sitzung, mit diesem
Kopier-Auftrag (nur die Etappen-Nummer tauschen):

```text
Lies CLAUDE.md, dann UMBAU-PLAN-V6.md: Abschnitt 0, Abschnitt 3, den
zugehoerigen Wellen-Kopf und die Etappe <NUMMER> (z. B. U1 oder R3).
Der Einwurf dieses Auftrags ist das go fuer genau diese EINE Etappe:
gib vor dem ersten Code die kurze Ansage nach 0.2, dann baue — nichts
daneben. Pruefbuendel einmal am Ende (Abschnitt 3.3), ein Commit, KEIN
Push. Im selben Commit: Zeiger 0.1 nachziehen und die Etappe als GEBAUT
markieren. Danach im Chat: kurze Klickanleitung (was oeffnen, was tun,
was zu sehen sein muss) und was du NICHT pruefen konntest. Widerspricht
dir der Plan oder der Code: STOPP und fragen, nicht raten.
```

Der Planer-Chat (Fable) liest danach nur den Diff und meldet Abweichungen.

**Inventur 2026-08-12 — Kurzbefund (drei Lese-Trupps; Belege stehen als
datei:zeile in den Etappen):**

- **Das Fundament traegt.** Inspector und Palette sind rein generisch (kein
  einziges `if type === ...`), keine Schichtverstoesse ausser den zwei
  dokumentierten Waechter-Ausnahmen, `any`/Stummschaltung exakt am
  eingefrorenen Budget (nur `softengine/bridge.ts`), keine Handschrift-Datei
  ueber 500 Zeilen. Der Verfall sitzt NICHT in der Architektur.
- **Der Muell sitzt in der Bedienschicht:** sechs Bauformen fuer „ein
  SE-Feld benennen" · zwei Dropdown-Bauteile · Schluesselzeilen,
  Loesch-Rueckfragen und Feld-Popups je doppelt gebaut · drei verschiedene
  Speicher-Verhalten (Speichern-Knopf vs sofort vs Formular) ·
  Belehrungstexte inkl. installationsindividueller „69" als UI-Tatsache ·
  Datenverlust beim Schliessen ueber X/Hintergrund-Klick · Entf loescht
  ohne, Kreuzchen mit Rueckfrage · Zaehler und „Alle Bloecke loeschen"
  zaehlen unsichtbar alle Popup-Seiten mit · leere Inspector-Panels ohne
  ein Wort (Datum, Popup) · Relation anlegen = rohe SE-Syntax in ein
  Textfeld tippen · der Editor meldet NUR Fehler, nie Erfolg — daher das
  Gefuehl „dauernd Meldungen".
- **Kleinkram im Code:** pos/len-Parser viermal, POS_LEN-Regex doppelt,
  `warnChecks`/`setzeHolendeQuellenZurueck` ohne Aufrufer, veralteter
  POPUP_RAND-Kommentar im Waechter, drei Englisch-Ausreisser in der
  Infra-Schicht (`dateiDownload.ts`/`downloadFile`, `speicherGate` vs
  Prosa „Riegel").

## U0 · Entscheidungsliste — der Nutzer antwortet je Zeile (Ja/Nein reicht)

Ohne die Antworten 1/2/3/4 baut U1/U2 nicht. Empfehlung steht dabei.

1. **Dialog umbenennen:** „Steuerung" -> „Datencenter" (das Wort des
   Nutzers)? Empfehlung: Ja.
2. **Belehrungs-/Warntexte ersatzlos raus:** rote Kaesten („Ohne Felder
   liefert SoftEngine ... nichts", `FeldListe.tsx:70` /
   `DatenquellenBereich.tsx:200`), „bei euch die 69"
   (`DataSourceForm.tsx:262`), Erklaer-Fliesstexte. Empfehlung: Ja —
   gleiche Linie wie „keine Warn-Anzeigen" (2026-08-10).
3. **Loeschen fragt NIE nach:** die Kreuzchen-Rueckfrage
   (`BlockHost.tsx:167`) faellt, Entf/Kreuzchen/Papierkorb verhalten sich
   gleich, Undo ist das Netz (Nutzer 2026-08-12: „ohne rueckfragen ist
   ok"). Die zwei Bibliotheks-Rueckfragen in der Steuerung („wird
   BENUTZT. Trotzdem loeschen?") bleiben vorerst. Empfehlung: Ja.
4. **„Andere Datei" umbenennen** — Vorschlag „SoftEngine-Datei
   (Kuerzel)"; der Nutzer darf ein eigenes Wort setzen.
5. **Baustein „Zeile" BLEIBT** — im Popup ist er bis C2 der einzige Weg,
   Dinge nebeneinanderzustellen (`rasterLayout.ts:10-14`; die
   Hauptflaeche hat dafuer ihr Raster). Nur Erklaerung wird besser.
   Einverstanden?
6. **Namens-Kollision „Text":** der Baustein „Text" (Anzeige) und der
   Formularfeld-Feldtyp „Text" (Eingabe) tragen denselben Namen
   (`TextBlock.ts:98` vs `feldEigenschaften.ts:25`). Welche Seite wird
   umbenannt — Baustein (z. B. „Ueberschrift") oder Feldtyp (z. B.
   „Eingabezeile")?
7. **Popup bleibt VORERST ein Reiter** — technischer Grund: Hauptflaeche
   ist ein Raster, das Popup ein eigenes Fenster; Bearbeiten auf der
   Flaeche haengt an C2/C3. Jetzt wird nur Beschriftung/Zugang besser.
   Einverstanden, Konzeptfrage auf nach C2 vertagt?
8. **Optik-Vorbild:** 1–2 Screenshots von Software, die dem Nutzer
   gefaellt — ODER die Ansage „Fellnase-Demo als Richtung". Ohne Vorbild
   startet U7 nicht (abschreiben statt gestalten).

**Antworten des Nutzers (2026-08-12, im Chat):**

1. Ja — Name ist ihm „egal", also gilt der Vorschlag: **Datencenter**.
2. **Ja, raus.**
3. **Ja — Loeschen fragt nie nach.**
4. Ersetzt: nicht umbenennen, sondern die **Arten-Liste wird im
   U4-Entwurf gemeinsam durchgegangen** (was gibt es, was braucht er,
   wie heisst es verstaendlich).
5. **GEAENDERT — „Zeile" fliegt RAUS**, umgesetzt im Popup-Umbau (C2,
   dort als Zusatzauftrag vermerkt); bis dahin bleibt sie, weil das
   Popup ohne Raster sonst kein Nebeneinander kann.
6. Der Text-Baustein ist fuer den Nutzer „sinnlos wie es jetzt ist —
   ich kann den kaum einstellen": er wird im **U4-Entwurf neu gedacht**
   (was muss er koennen, wie heisst er); die Namens-Kollision wird dort
   mitgeloest.
7. **ABGELEHNT — der Reiter faellt.** Vorgeschlagenes Konzept (liegt dem
   Nutzer vor): das Popup wird ueber der abgedunkelten Hauptseite
   bearbeitet, genau wie es in der Maske erscheint; Zugang ueber eine
   Popups-Liste in der Werkzeugleiste und ueber die oeffnende Kette;
   X schliesst. Eigene Etappe, Zuschnitt erst nach dem Ok des Nutzers
   (vor oder mit C2).
8. **JA — Fellnase** („schon geil", 2026-08-12), ausdruecklich AUCH als
   Richtung fuer das Editor-Gesicht selbst. Kein externes Vorbild mehr
   noetig; U7 ist damit zugeschnitten (U7a/b/c, s. dort).

## U1 · Wortlaut-Putz in der Steuerung (BAUBAR — U0 1/2 beantwortet; Punkt 4 wanderte in U4)

**Belegte Stellen:** Belehrungstexte `FeldListe.tsx:70-80`,
`DatenquellenBereich.tsx:199-204`, `DataSourceForm.tsx:134/262/294`
(inkl. „bei euch die 69" — ein installationsindividueller Wert als
UI-Tatsache); Jargon-Labels „IDB-ID"/„Dateikuerzel"/„Haengt an"
(`quellenArten.ts`, `DataSourceForm.tsx:291-307`); Dialogname in
`Toolbar.tsx:147` und `Kommandozentrale.tsx`.

**Arbeit:** Texte gemaess U0 entfernen/ersetzen; Dialog und
Toolbar-Knopf umbenennen; Platzhalter neutral (kein Kundenwert); KEINE
neuen Erklaertexte. Der Export-Referenzabzug bleibt byte-gleich.

**Fertig, wenn:** kein roter Belehrungskasten mehr; kein
installationsindividueller Wert in einem UI-Text; ein Begriff je Ding.

**Nutzerprobe (Browser):** Steuerung oeffnen, Quelle anlegen — Texte
weg bzw. neu, Verhalten unveraendert.

## U2 · Loeschen und Browser-Kaesten vereinheitlichen (BAUBAR — U0-3: Ja)

**Belegte Stellen:** drei Loeschwege, zwei Verhalten
(`BlockHost.tsx:167-173` fragt; `useKeyboardShortcuts.ts:45` und
`Inspector.tsx:254` nicht — `loescheBaustein.ts:32` prueft `frageNach`
nur, wenn uebergeben) · Zaehler zaehlt alle Seiten inkl. Popups
(`Editor.ts:155`, `StatusBar.tsx:18`), und „Alle N Bloecke loeschen?"
(`Toolbar.tsx:36`) verschweigt, dass auch Popup-Seiten fallen ·
window.alert/window.confirm als rohe Browser-Kaesten
(`Toolbar.tsx:36/60/97/109/120`, `loescheBaustein.ts:15`,
`persistence.ts:120`, `notfallkopie.ts:101/148`).

**Arbeit:** Kreuzchen-Rueckfrage entfernen (EIN Verhalten; Undo ist das
Netz) · „Alle Bloecke loeschen"-Text nennt die Popup-Seiten ehrlich ·
Statuszeile zaehlt die AKTIVE Seite ODER schreibt „alle Seiten" dazu
(kleinere Loesung waehlen) · window.alert/confirm durch EINEN
app-eigenen, nicht blockierenden Meldungsweg ersetzen, wo gefahrlos;
blockierend bleibt nur, was Datenverlust verhindert (Maske laden
ueberschreibt alles). KEINE neuen Rueckfragen, KEINE Erfolgs-Toasts auf
Verdacht.

**Fertig, wenn:** Entf/Kreuzchen/Papierkorb identisch; kein nackter
window.alert im Editor-Alltag; Texte ehrlich.

**Nutzerprobe (Browser):** Baustein mit Inhalt per Kreuzchen loeschen —
keine Frage, Undo holt ihn zurueck; fehlerhafte Maskendatei laden —
app-eigene Meldung statt Browser-Kasten.

## U3 · Doppelbauten zusammenlegen (Verhalten identisch, Code halbiert)

**Belegte Paare:** SelectControl vs SchrittSelect
(`QuellenListe.tsx:38-46` benennt die Zweiheit selbst) ·
Schluesselregel-Zeile doppelt (`QuellenListe.tsx:145-179` /
`AuswahlFolgeSektion.tsx:145-169`) · Loesch-Rueckfrage-Helfer doppelt
(`DatenquellenBereich.tsx:64-85` / `RelationenBereich.tsx:64-76`) ·
zwei fast gleiche Feld-Popups (`FieldPicker.tsx` /
`FeldUebernahmePicker.tsx`) · pos/len-Parser VIERMAL (`splitFieldCode`
`core/data/relations.ts:106` ist kanonisch; Kopien `ladeRelation.ts:80`,
`softengine/data.ts:95` und `:131`) · POS_LEN-Regex doppelt
(`dataSources.ts:129` vs `ladeRelation.ts:58`).

**Arbeit:** je Paar EINE Komponente/Funktion, Aufrufer umziehen,
Duplikat loeschen. Kleinputz dazu: `warnChecks` (`validator.ts:89`) samt
seines einzigen Test-Aufrufs raus · `setzeHolendeQuellenZurueck`
(`holendeQuellen.ts:75`) raus · POPUP_RAND-Kommentar im Waechter
(`scripts/check-regeln.mjs:263`) berichtigen. `istOffenerSatz` BLEIBT
(dokumentierte VAR-Bauanleitung, `datenquellen.test.ts:210-225`).

**Fertig, wenn:** je Aufgabe eine Bauform; Verhalten, Export-Bytes und
Referenzabzug unveraendert; 500er-Deckel ueberall eingehalten.

**Nutzerprobe (Browser, Stichprobe):** Verknuepfung anlegen, „Auswahl
folgen" einstellen, Feld uebernehmen — sieht aus und verhaelt sich wie
vorher.

## U4 · ENTWURF: Quelle anlegen, Feld waehlen, Relation anlegen (kein Code)

Hier gilt die F1-Regel woertlich: KEIN Code, bevor der Nutzer den
sichtbaren Entwurf bestaetigt hat. Der Entwurf beantwortet die
F1-Fragen (Wellen-Kopf F) UND:

- EINE Bedienform fuer „ein SE-Feld benennen" — heute sechs:
  Handeingabe (`FeldListe.tsx:89-116`) · rohe Syntax
  (`RelationForm.tsx:70-83`) · Dropdowns (`ParameterZeile.tsx:161-186`,
  QuellenListe, AuswahlFolge) · unsichtbar fest (`DataSourceForm.tsx:78-84`)
  · Kombi-String „BEL_0_11" (`DataSourceForm.tsx:291-307`) · Such-Popup
  mit unerklaerlicher Sichtbarkeitsbedingung (`StepForm.tsx:203-206`).
- Der gefuehrte Weg „neue Quelle" (Nutzer woertlich: „Wie hole ich
  andere quellen? ich weiss es nicht mal"): Stolpersteine weg — leere
  Pflicht-Feldzeile mit unsichtbarem Fehler (`DataSourceForm.tsx:85-91`),
  „Beleg kommt aus" leer ohne zweite Quelle (`:107`), DTK-Import kann
  NUR IDB-Quellen anlegen (`DtkImportForm.tsx:62-76`).
- Relation anlegen OHNE rohe SoftEngine-Syntax zu tippen (die SE-Verben
  bleiben sichtbar, Entscheidung 2026-07-15).
- EIN Speicher-Verhalten fuer Formulare (heute drei: Speichern-Knopf im
  Dialog, Sofort-Schreiben im Inspector, StepForm mit eigenem Speichern).
- Schliessen ohne Datenverlust-Ueberraschung (X/Hintergrund vs Escape,
  `Kommandozentrale.tsx:69-83`) — der Entwurf legt das Verhalten fest.

**Ergebnis:** Klartext-/Wireframe-Entwurf im Chat; der Nutzer bestaetigt
oder korrigiert. Erst DANN wird U5 zugeschnitten.

## U5 · Umsetzung des bestaetigten Entwurfs (ein bis drei Etappen)

Zuschnitt folgt aus U4 (z. B. 5a Quellen-Formular, 5b Relationen,
5c Inspector-Angleich). Es gelten die F2-Bauregeln (alte UI restlos weg,
keine zweite Terminologie, bestehende Masken exportieren byte-gleich,
Migration nur mit eigenem Schutz).

## U6 · Inspector-Kleinputz (unabhaengig, jederzeit baubar)

**Belegte Stellen:** leere Panels ohne ein Wort bei Datum
(`DatumBlock.ts:35`) und Popup (`popup/editorAngaben.ts`) — Zeile und
Karte zeigen fuer denselben Zustand einen Satz
(`zeile/editorAngaben.ts:16`) · Label „Farbe" fuer ein
Bedeutungs-Konzept (`shared/statusVariant.ts:55`; die eigene
Beschreibung sagt „Bedeutung") · Ankreuzfeld: bindbare Stelle
deklariert, aber bewusst unerreichbar (`FormFeldBlock.ts:124-134` vs
`:206-207`, `Inspector.tsx:201-203`) — Deklaration an die Zusage
„Ankreuzfeld bleibt unbindbar" angleichen.

**Arbeit:** zwei Hinweis-Saetze ergaenzen (Muster Zeile/Karte, KEIN
Tutorial) · „Farbe" -> „Bedeutung" · Checkbox-Deklaration ehrlich
machen. Export-Bytes unveraendert.

**Nutzerprobe (Browser):** Datum anklicken — statt Leere ein Satz;
Karten-/Spaltenregler heisst „Bedeutung".

## U7 · Optik: der Editor uebernimmt die Fellnase-Richtung (zugeschnitten 2026-08-12)

**Entscheidung des Nutzers:** die eingecheckte Demo (`designsprache/`)
ist das Vorbild — auch fuer den Editor selbst. Die Grenze aus CLAUDE.md
bleibt hart: Masken-Tokens und Editor-Tokens werden NIE gemischt. Der
Editor bekommt EIGENE Tokens mit den Fellnase-Werten; `masken-tokens.css`
und die Export-Bytes bleiben byte-gleich.

- **U7a · Musterbogen ergaenzen (kein Editor-Code):** die Muster, die der
  Demo fehlen, weil sie Masken-Bausteine zeigt und keine Editor-Teile:
  Formularzeile, Auswahlmenue, Liste-mit-Detail, Fenster/Dialog,
  Knopfreihe, Meldung. Aus den vorhandenen Atomen (`atome.css`)
  ABGELEITET, nicht erfunden; fehlt eine Entscheidung, wird gefragt.
  In `designsprache/` einchecken; der Nutzer nickt sie IM BROWSER ab,
  bevor irgendwer den Editor anfasst. U7a darf frueh laufen.
- **U7b · Editor-Tokens umstellen:** `src/index.css` (shadcn-Variablen)
  auf die abgenickten Werte, Schrift wie die Demo.
- **U7c · Steuerung/Inspector/Palette angleichen:** Stelle fuer Stelle
  gegen den ergaenzten Musterbogen; die app-eigene Meldung aus U2 nimmt
  ihr Aussehen von dort.

**Reihenfolge-Ehrlichkeit:** U7b/U7c laufen NACH U4/U5 — sonst werden
Formulare angestrichen, die kurz danach neu gebaut werden.

---

# Welle N — Ansichten und Navi (eingeschoben 2026-08-12, Nutzer-Auftrag)

**Auftrag:** Der Nutzer will Masken wie die empfang-Vorlage bauen koennen:
mehrere ANSICHTEN in einer Maske (z. B. Empfang / Terminkalender), links
eine Navi, die umschaltet, dazu gestaltete Leerzustaende. Optik-Vorbild
ist der Mix `designsprache/mix-fellnase-empfang.html` (gebaut 2026-08-12,
wartet auf das Nutzer-Urteil).

**Bauart — ausdruecklich ohne Overengineering (Nutzer-Ansage 2026-08-12:
kein „falls der Bediener vergisst"-Kram):** kein Router, kein Verlauf,
keine Uebergangs-Animationen, keine neuen Warnungen, keine neuen
Test-Gattungen. Der vorhandene Seiten-Unterbau (Hauptseite/Popup,
pageBlock) traegt alles.

**Ablauf und Kosten (Nutzer-Fragen 2026-08-12):** Der Nutzer entscheidet
je Maske, OB eine Navi da ist (normaler Baustein aus der Palette, keine
Automatik). „+" IN der Navi legt einen Eintrag an: benennen, Farbe
waehlen, und wahlweise eine vorhandene Ansicht verknuepfen ODER eine neue
LEERE Ansicht anlegen — die Flaeche wechselt sofort dorthin und wird
aufgebaut (Bedienung am Ding, Regel 7). Technisch ist Umschalten nur
Ein-/Ausblenden im selben Dokument: sofort, kein Neuladen. Die
Datenquellen werden EINMAL bestellt und von allen Ansichten geteilt.
Ehrliche Kosten: die Maskendatei waechst mit jeder Ansicht, und ein
Daten-Push aktualisiert auch verborgene Ansichten — genau wie heute
schon bei Popups.

## N1 · Ansicht als zweite Hauptseite

Registry-Eintrag „Ansicht": pageBlock wie das Popup, aber volle
Rasterflaeche wie die Hauptseite, kein Fenster. Die Seiten-Leiste zeigt
Ansichten wie heute die Seiten (die Popup-Reiter ziehen laut U0-7 spaeter
in die Overlay-Bearbeitung um — die Leiste gehoert dann den Ansichten).
Export: alle Ansichten stehen in der Datei, die Hauptseite ist sichtbar,
weitere Ansichten tragen `hidden` (empfang-Muster setView). Pflicht des
Waechters: Export-Testfall, Veralten-Positivliste, Referenzabzug.

## N2 · Navi-Baustein

Normaler Baustein aus der Palette. Eintraege = Ansichten der Maske
(Referenz auf die Seiten-id, sichtbar ist der Ansichtsname); Klick
schaltet um — im Editor auf die Seite, in der Maske per hidden-Toggle
(Runtime-Buendel bewusst neu). Optik aus dem Mix (Espresso-Leiste,
aktiver Eintrag in Koralle). Keine freien Links, keine externen Ziele.
Je Eintrag eine FARBE aus den Palettentoenen (Nutzer-Anforderung
2026-08-12, „navi mit farbmoeglichkeiten"). KEIN automatischer
Bediener-Fuss und keine sonstigen eingebauten Zonen — wer so etwas will,
baut es aus normalen Bausteinen.

## N3 · Kanban lebendig (Optik-Angleich an den Mix)

Getoente Spaltenhuelle nach Bedeutung (dieselbe Bedeutungs-Zuordnung wie
die Marke, `shared/statusVariant`) und gestalteter Leerzustand nach dem
leer-Atom des Mix (der Text kommt weiter aus „Text ohne Datensaetze",
nichts Neues zu bedienen). AENDERT die Masken-Optik: Runtime/CSS bewusst
neu, SE-/Browserprobe des Nutzers. Aktions-Knopf auf der Karte und
Zimmer-/Untergruppen sind NICHT Teil von N3 — eigene Entscheidungen,
erst auf Nutzer-Wunsch.

**Nutzer-Urteil zu Mix v1 (2026-08-12): „leblos / ki slop".** v2 ist
gebaut: die EIGENEN Tierbilder des Nutzers (tier-*.png in designsprache/;
seine Ansage dazu gab es schon am 2026-08-06 — SEINE Zeichen, nicht die
Demo-Silhouetten), Marke auf jeder Karte, getoente Zaehler; die
erfundenen Aktions-Knoepfe, das Tag/Woche-Segment und der
Bediener-Kasten sind raus (nichts zeigen, was es nicht gibt). v2 wartet
auf das Urteil des Nutzers.

---

## 5. Gesamtreihenfolge der Commits

Die genaue Nummerierung darf bei notwendigen verhaltensneutralen Dateischnitten
Unterpunkte bekommen. Die fachliche Reihenfolge bleibt.

**Commits sind klein, Proben sind gebuendelt.** Der Nutzer liest keine
Commits — kleine Commits kosten ihn nichts. Was ihn kostet, ist die
Browserprobe. Darum gilt: ein Thema = ein Commit (3.1 unveraendert), aber
**eine Klickanleitung pro Block**. Acht Bloecke statt 37 Proberunden.

Die Spalte „Wo im sichtbaren Editor" ist die Kurzform der Ansage aus 0.2. Sie
ersetzt die Ansage nicht — sie verhindert nur, dass eine Etappe ohne
sichtbare Verankerung in den Plan rutscht. Mit `*` markierte Zeilen sind am
Code belegt; die uebrigen sind aus dem Plan abgeleitet und werden bei der
Ansage belegt oder korrigiert.

### Block 0 — Baseline · keine Probe

| # | Etappe | Wo im sichtbaren Editor |
|---|---|---|
| 1 | A0 Baseline | nichts sichtbar — Arbeitsstand gesichert, Pruefbuendel gruen |

### Block S — Sichtbare Fehler und Tempo (eingeschoben 2026-08-10) · EINE Probe am Ende

| # | Etappe | Wo im sichtbaren Editor |
|---|---|---|
| S1 | GESTRICHEN (Nutzer 2026-08-10) | entfaellt — keine Warn-Anzeige, s. Etappenkopf S1 |
| S2 | Tabellen-Reststreifen | \* Tabelle: keine leere/duennere Scheinzeile mehr unter der letzten Datenzeile — Editor UND Maske |
| S2.1 | Tabellen-Nachschlag (entschieden 2026-08-11, wartet auf go) | Tabelle: kein Leerraum mehr zwischen letzter Zeile und Fusszeile; Zeilen-Waehler faellt weg — immer „passend zur Hoehe" |
| S3 | Render-Bremsen | \* ueberall spuerbar: Tippen/Ziehen ohne Haenger; optisch nichts anders |
| S4 | Dev-Laden | Editor-Start im Dev-Server schneller; optisch nichts anders |
| S5 | Masken-Tempo | OPTIONAL, eigenes go; nichts sichtbar, SE-Echttest Pflicht |

Die SoftEngine-Probe fuer Block S ist wegen S2 (Runtime-Bytes) noetig und
wird EINMAL am Blockende gebuendelt, zusammen mit der Browserprobe.

### Block 1 — „ergibt keinen Sinn"-Fehler · EINE Probe am Ende

| # | Etappe | Wo im sichtbaren Editor |
|---|---|---|
| 2 | A1 `aus` | \* Steuerung → Aktion → Parameterzeile, Knopf „Parameter N fuer diese Aktion weglassen": die Kette ist nach dem Neuladen noch da. Heute ist sie **ganz** weg |
| 3 | A2 Demo-Putzer | nichts sichtbar heute; wirkt erst bei C2 — getippte Kartenwerte („Heute", „09:15") ueberleben den Schema-Sprung |
| 4 | A2.1 Migrationsergebnis | nichts sichtbar — Voraussetzung fuer Zeile 3 |
| 5 | A3 Zukunftsschema | nur im Fehlerfall: Sperrmeldung mit drei Wegen statt leerem Editor |
| 6 | A4 Teilverlust | nur im Fehlerfall: die Meldung nennt Eintrag und Grund; nichts verschwindet mehr stumm |
| 7 | A5 Duplizieren | \* Flaeche: Baustein duplizieren (Strg+D) — die Kopie steuert die Kopie, nicht mehr das Original |
| 8 | A6 Tastatur | \* Flaeche: Text in einem Baustein bearbeiten — Entf/Strg+Z/Strg+D treffen den Text, nicht den Baustein |
| 9 | A7.1 Listener | nichts sichtbar — eine Aenderung wird auch dann gespeichert, wenn woanders ein Fehler auftritt |
| 10 | A7.2 Transaktionen | Flaeche: Ziehen und Groesse aendern — nach einem Fehler wieder normale Rueckgaengig-Schritte |
| 11 | A7.3 Auswahlzyklen | moeglicherweise gar kein Code — nur Beleg |
| 12 | A8.1 Regelwaechter | nichts sichtbar (Werkzeug) |
| 13 | A8.2 Wahrheitskommentare | nichts sichtbar (Kommentare, CLAUDE.md) |

### Block P — Tempo (eingeschoben 2026-08-11) · EINE Probe am Ende

| # | Etappe | Wo im sichtbaren Editor |
|---|---|---|
| P1 | Messen | nichts sichtbar — Zahlen statt Gefuehl, kein Code |
| P2 | Top-Bremsen | Start schneller und/oder Arbeiten fluessiger; optisch nichts anders |
| S2.1 | Tabellen-Nachschlag | Tabelle: kein Leerraum mehr ueber der Fusszeile; Zeilen-Waehler weg (s. Block-S-Tabelle) |

Die SoftEngine-Probe (Tabelle, aus Block S offen) und die Browserproben
(Tempo-Gefuehl, A5/A6-Bedienung) buendeln sich am Ende dieses Blocks.

### Block 2 — Beleg und Export

| # | Etappe | Wo im sichtbaren Editor |
|---|---|---|
| 14 | A9 SE-Ausgangslauf | nichts geaendert — der Nutzer belegt, was heute in SoftEngine geht |
| 15 | A10 Sitzungsbesitz (bedingt) | nichts sichtbar; nur nach eigenem Go |
| 16 | B1 GESTRICHEN (Nutzer 2026-08-11) | entfaellt — die zwei automatischen Downloads bleiben, s. Etappenkopf B1 |

### Block 3 — Popup · das riskante, steht allein

| # | Etappe | Wo im sichtbaren Editor |
|---|---|---|
| 17 | C1 Dialograhmen | \* Popup bekommt denselben Fensterrahmen wie das Nachschlagen (Kopf mit Titel und X) |
| 18 | C2 Schema 6 + Raster | Popup-Inhalt: Bausteine frei platzierbar statt untereinander; **bestehende Popups werden einmalig umgestellt** — Maskendatei vorher sichern |
| 19 | C3.1 Namen | leerer oder doppelter Popup-Name wird in der Bedienung verhindert, statt spaet beim Export zu knallen |
| 20 | C3.2 ein Popup | in der Maske: ein zweites Popup oeffnen schliesst das erste |
| 21 | C3.3 Fokus | Tab-Taste im Popup bleibt im Fenster |
| 22 | C3.4 Loeschen | Kreuz, Inspector und Entf loeschen gleich, mit derselben Rueckfrage |
| 23 | C4 Reparenting | Baustein in Zeile oder Gruppe ziehen — ein klarer Weg dafuer |

### Block 4 — Tabelle und Nachschlagen

| # | Etappe | Wo im sichtbaren Editor |
|---|---|---|
| 24 | D0 Dateischnitt | nichts sichtbar |
| 25 | D1 Zeilenaktivierung | Tabelle: Zeile mit der Tastatur anwaehlen, Enter aktiviert sie |
| 26 | D2 Datenmodus | nichts sichtbar |
| 27 | D3 Nachschlagen | \* Lupe am Formularfeld: die echte Tabelle statt der handgebauten Liste |

### Block 5 — Innenumbau · nichts sichtbar

| # | Etappe | Wo im sichtbaren Editor |
|---|---|---|
| 28–30 | E1, E2, E3 | nichts sichtbar. Probe = Reload und Export unveraendert. Wird hier etwas sichtbar, ist es ein Fehler |

### Block 6 — Bedienung und Design · eigene Entscheidungen

| # | Etappe | Wo im sichtbaren Editor |
|---|---|---|
| 31 | F1 Entwurf | AUFGEGANGEN in Welle U (2026-08-12) |
| 32 | F2 Relationsoberflaeche | AUFGEGANGEN in Welle U (2026-08-12) |
| 33 | F3 Designabgleich | ueberall sichtbar; Vorbild ist `designsprache/` — bleibt eigenstaendig (Masken-Design, nicht Editor) |

### Block R — Zeilen per Relation (eingeschoben 2026-08-11) · SE-Echttest Pflicht

| # | Etappe | Wo im sichtbaren Editor |
|---|---|---|
| 34 | R1 Lade-Art + Export | Steuerung/Datenquellen: Abschnitt „Woher kommen die Zeilen?" |
| 35 | R2 Laufzeit | im Editor nichts Neues — in SoftEngine fuellt der Beleg-Klick die Positionen (SE-Kern BESTANDEN 2026-08-12) |
| 36 | R3 Formularfeld als Geber | in SoftEngine: Beleg im Nachschlagefeld waehlen fuellt die Positionen |
| 37 | R4 Beleg anlegen (WARTET auf Anlege-Protokoll) | Kette legt Beleg an, Maske zeigt ihn sofort |
| 38 | R5 Zeilenfilter FREISELEKT (BAUBAR) | weniger Daten je Refresh — die Debug-Flut faellt weg |

### Block U — Generalsanierung Bedienung (eingeschoben 2026-08-12) · Browserproben je Etappe

| # | Etappe | Wo im sichtbaren Editor |
|---|---|---|
| U0 | Entscheidungsliste | kein Code — der Nutzer antwortet je Zeile |
| U1 | Wortlaut-Putz | Steuerung: Belehrungstexte weg, neue Namen |
| U2 | Loeschen/Meldungen | ein Loeschverhalten; app-eigene Meldungen statt Browser-Kaesten |
| U3 | Doppelbauten | nichts sichtbar — gleiche Bedienung, halber Code |
| U4 | Entwurf Quellen/Felder/Relationen | kein Code — der Nutzer bestaetigt den Entwurf |
| U5 | Umsetzung Entwurf | Steuerung und Inspector, vollstaendig |
| U6 | Inspector-Kleinputz | Datum/Popup erklaeren sich; „Farbe" heisst „Bedeutung" |
| U7 | Optik: Fellnase-Richtung (U7a Musterbogen frueh; U7b/c nach U5) | Steuerung/Inspector/Palette im neuen Gesicht |

### Block N — Ansichten und Navi (eingeschoben 2026-08-12) · SE-Echttest wegen Runtime

| # | Etappe | Wo im sichtbaren Editor |
|---|---|---|
| N1 | Ansicht-Seite | Seiten-Leiste: neue Ansicht anlegen, Flaeche wie Hauptseite |
| N2 | Navi-Baustein | Palette: „Navi"; in der Maske schaltet er die Ansichten um |
| N3 | Kanban lebendig | Kanban: getoente Spalten nach Bedeutung, gestalteter Leerzustand |

Nicht jeder Punkt muss gleich gross sein. Die Liste verhindert, dass ein
Agent unter dem Etikett „Aufraeumen" fuenf unabhaengige Risiken in einen
unpruefbaren Grosscommit legt.

---

## 6. Was ausdruecklich nicht Teil dieses Umbaus ist

- kein neuer Bausteintyp nur zum Testen der Registry;
- kein Redux/Zustand/MobX;
- keine neue Testumgebung, Playwright-, DOM- oder Screenshottests;
- keine Neuerfindung der SoftEngine-Bridge;
- kein Entfernen des offiziellen Interface-Tags ohne eigenen A/B-Auftrag;
- kein Auto-PUT oder versteckter Schreibweg;
- kein CREATE_RECORD;
- keine mehrstufigen Quellenverknuepfungen;
- keine Wiederbelebung geloeschter Projektkarten, Wizards oder
  Dokumentationssysteme;
- keine Popup-Stack-Architektur;
- kein editierbarer Nachschlage-Seitentyp;
- keine Designaenderung ohne Musterbogen oder Nutzerentscheidung;
- kein Aufraeumen fachfremder Stellen „wenn man schon da ist".

---

## 7. Endabnahme des gesamten Umbaus

### 7.1 Maschinelle Pflicht

- sauberer Arbeitsbaum;
- fuenf Pruefungen gruen;
- keine Datei ueber 500 Zeilen;
- keine unerwarteten Runtime-Bundle-Bytes;
- Referenzabzug vollstaendig erklaert;
- direkte und stufenweise Upgrades alter Schema-1/2/3/4/5-Masken sowie neue
  Schema-6-Masken geprueft;
- zukuenftige Schema-Version wird sicher abgelehnt;
- kein Sanitizer-Test erlaubt stillen Teilverlust;
- keine kopierte interne Blockreferenz zeigt unbemerkt aufs Original;
- Registry-Waechter erkennt exakt alle Bausteine;
- Runtime-Bundle enthaelt keine Editor-Icons/-Komponenten;
- B1: Event/Relation/Quelle aendert Export-Fingerprint, reine UI-Aenderung
  nicht;
- D2: `provided` meldet sich niemals bei SoftEngine an und sein Datensatz wird
  atomar gesetzt;
- D3: keine handgebaute Nachschlagetabelle/-Zeilenlogik bleibt parallel;
- E2: kein Registry-Dual-Path und keine kopierten kanonischen Defaults;
- E3: ungueltiger Property-Key ohne History, Version/Notify und Autosave.

### 7.2 Nutzer-Browserprobe

- Hauptseite und Popup bauen;
- DnD, Resize, Reihenfolge, Undo/Redo;
- Texteditieren plus globale Kuerzel;
- Popup oeffnen, wechseln, schliessen, loeschen, duplizieren;
- Fokus- und Tab-Reihenfolge;
- normale Tabelle und Nachschlagetabelle;
- Quellen, Relationen, Aktionsparameter und `aus`;
- Export erzeugen, veralten lassen, beide Dateien einzeln anfordern;
- Reload und Maskendatei-Roundtrip.

### 7.3 Nutzer-SoftEngine-Probe

- bestehende Referenzmaske vor Umbau belegt;
- nach jeder Runtime-/Exportetappe gezielte Delta-Probe;
- abschliessend WinUI und, soweit verfuegbar, WebUI;
- Datenpush und Mehrfachhydrierung;
- Tabelle/Kanban/Nachschlagen;
- Popup-Positionen, genau-ein-Popup und Fokus;
- Ereignisketten, `aus`, START_TOOL und Relationsschritte;
- HTML und SEvariablen gehoeren nachweislich zum selben Exportstand.

### 7.4 Abschlussbericht

Der Abschlussbericht nennt nur:

1. welche Etappen und Commits gebaut wurden;
2. welche fuenf Pruefungen gruen sind;
3. welche Browser-/SE-Proben der Nutzer bestaetigt hat;
4. welche konkrete Grenze der Nutzer bewusst verschoben hat, falls A10 oder
   ein Designpunkt nicht umgesetzt wurde;
5. ob neue Produktfunktionen auf dem bereinigten Fundament wieder freigegeben
   sind.

Keine Vorschlagsrubrik und keine neue Dauer-Chronik.

---

## 8. Go-/No-Go-Punkte

### Erstes `go`

**Ein `go` gilt fuer genau eine Etappe** (Nutzer-Ansage 2026-08-10, siehe 0.3).
Das erste `go` erlaubt A0 — nicht A0 bis A9. Danach wird jede weitere Etappe
einzeln angesagt und einzeln freigegeben.

Der Korridor bleibt trotzdem beschraenkt: ohne neue Entscheidung geht es
hoechstens bis A9. A10 braucht den separaten Entscheidungsstopp. Popup-,
Tabellen-, Registry- und Designumbau sind vom ersten `go` nicht erfasst.

### Entscheidungsstopp nach A9

Nach bestaetigtem SoftEngine-Ausgangslauf wird A10 getrennt entschieden. Erst
nach Umsetzung oder ausdruecklich dokumentierter Verschiebung werden B1 und C
freigegeben.

### Go vor Schema 6

Nur wenn Maskendatei-Backup, A2-Regression und C1-Nutzerprobe bestaetigt sind.

### Go vor E2 Registry-Umbau

E1 erzeugt zuerst Inventar und Waechterbeweis. E2 beginnt nur nach fertigem
Popup/Nachschlagen und ausdruecklicher Vorlage dieses Ergebnisses.

### Go vor Store-Besitz A10

Explizite Nutzerbestaetigung direkt nach A9. Technische Injection und
fachliche Lebensdauer der Bibliotheken werden getrennt entschieden.
Empfehlung: technisches Sitzungsobjekt ja, heutige fachliche Lebensdauer
zunaechst beibehalten.

### Go vor Relations-/Designwelle

Der Nutzer bestaetigt den sichtbaren Entwurf beziehungsweise die konkreten
Abweichungen. Technikagenten entscheiden diese Produktoptik nicht allein.

---

## 9. Endurteil

Der Bau ist nicht „alles falsch" und wird nicht weggeworfen. Er besitzt gute
Grundgrenzen, aber mehrere von KI-Agenten unabhaengig getroffene Entscheidungen
sind nicht bis Laden, Export, Runtime, Shadow DOM und Migration durchgezogen.

Fassung 6 raeumt deshalb in dieser Reihenfolge auf:

1. **Verlust verhindern.**
2. **Vertraege vereinheitlichen.**
3. **Doppelte Komponenten entfernen.**
4. **Metadaten und State-Besitz konsolidieren.**
5. **Bedienung und Design bewusst abschliessen.**

Erst danach gilt der Editor wieder als belastbares Fundament fuer groessere
neue Funktionen.
