# SoftEngine-Kontrakte — geerntet aus den Code-Kommentaren

Diese Datei entstand beim Kommentar-Schnitt 2026-08-17. Die Kommentare in
`src/` sind entfernt; was hier steht, ist der Teil davon, den man **nur durch
einen Echttest in SoftEngine wieder herausfinden könnte**.

Kein Bauverlauf, keine Begründungen — nur Fakten und wo sie gelten.
Bei Widerspruch gewinnt `CLAUDE.md`.

---

## 1. Dateiform

- Export-Dateien heißen `index.basis.source.html` + `index.basis.SEvariablen.json`.
  Belegt an allen 124 Referenzmasken. Nicht von Hand umbenennen.
- LF-only, reines ASCII. Escaping macht der Export maschinell
  (`export/serializer.ts`). Schlägt `validateMaskHtml` an, lädt SoftEngine die
  Datei gar nicht erst.
- Eine Maske ist EINE Datei — Bilder und Schriften werden eingebettet, nie
  nachgeladen.

## 2. Anmeldung und Datenempfang

- `basisHTML_REGISTER(cb, document.title, '1.0')`, Retry 25 ms × 400.
  Jeder Push hydriert neu. Fallbacks: `message { MSG: { DATA } }`, SEDATA-Poll.
- Das offizielle `basisHTML_REGISTER` vereinheitlicht `BWMSG` (BüroWARE/WinUI)
  und `WWMSG` (WEBWARE) zu demselben Callback. **Nie direkt nur auf `BWMSG`
  lauschen.**
- Immer nur EINE GET-Anfrage in Flug (Warteschlange).
- Gilt in: `softengine/bridge.ts`, `softengine/relations.ts`.

## 3. Feldcodes

- Die einzige belegte Form eines Feldcodes in einer SoftEngine-Liste ist
  **`Position_Länge`** (`2_8`, `3292_30`). Belegt an jeder Stamm-Quelle der
  Chef-Masken und am POS-Loop von `docs/chef-maske/JsonBeleg.json`.
- Zeilen-Properties tragen ein **Tabellen-Präfix**: `IDBID0001_253_30` für den
  Code `253_30`. Schlüssel-Scan: gleich / Präfix `code_` / Endung `_code` —
  für Lesen UND Schreiben.
- Eine ERP-Abfrage liefert Schlüssel mit festem Vorsatz: `LFA_pos_len`.
- Gilt in: `core/data/ladeRelation.ts` (`POS_LEN`), `softengine/data.ts`
  (`getField`/`setField`), `core/data/relations.ts` (`splitFieldCode`).

## 4. SEvariablen — Bestellung

- Quellen-Arten bestimmen die Form:
  - **IDB** → SEFILELOOP. Beide Chef-Masken führen `FELDER: '*'`.
  - **Stamm (ADR/ART/BEL/POS)** → explizite `pos_len`-Liste.
  - **ERP-Abfrage** → eigener `ERPAPICALL`-Block, nicht in der SEFILELOOP.
- Unser Export schreibt für IDB die explizite Liste der BENUTZTEN Felder statt
  `*`. Grund: SoftEngine macht für jeden gelieferten Wert einen Bild-Nachschlag
  (`GET_RELATION 1911` — Nutzer-Log 2026-08-11: 5 953 Aufrufe in 9,2 s beim
  Öffnen). Bestätigt 2026-08-12: die Maske liefert damit.
- **Sicherheitsventil:** sobald EIN Code sich nicht als `pos_len` ausdrücken
  lässt, fällt die ganze Bestellung auf `*` zurück.
- Was in einer expliziten Liste fehlt, liefert SoftEngine **nie** — die
  gebundene Stelle bleibt still leer.
- Gilt in: `core/data/dataSources.ts` (`felderFor`), `export/sevariablen.ts`.

## 4a. REFRESH — den Klartext zu einem Code-Feld bestellen

Ein Code-Feld (Adressgruppe `4`, Land `DE`, Lieferadresse `10024`) liefert nur
die Nummer. Der zugehörige TEXT kommt nur, wenn die Maske ihn EXTRA bestellt.

Belegt in `docs/chef-maske/JsonBeleg.json` — ein eigener Block neben VAR,
SEFILELOOP und ERPAPICALL:

```json
"REFRESH": [
  { "ID": 300700, "ALIAS": "RefreshAdresseLand",
    "PK": "ADR_1450_3", "PKLEN": 3, "TRENNER": " : ", "FILEID": "" },
  { "ID": 300055, "ALIAS": "RefreshLieferadresse",
    "PK": "BEL_747_8", "PKLEN": 8, "TRENNER": " : ", "FILEID": "" },
  { "ID": 300033, "ALIAS": "AnsprechpartnerRefresh",
    "PK": "BEL_197_8", "FORMAT": "R0", "PKLEN": 8, "TRENNER": " : ", "FILEID": "" }
]
```

SoftEngine liefert daraufhin einen ZWEITEN Wert je Feld, mit `REFRESH_`
davor — belegt in `docs/chef-maske/BeispielBeleg.html`:

```js
BelegInfo.BEL_552_2            // "01"
BelegInfo.REFRESH_BEL_552_2    // der Text dazu
```

**Die ID ist `300000 + RefreshId` des Felds.** `RefreshId` steht in der
Felddefinition der Installation (`RefreshArt: "3"` heißt: dieses Feld hat eine
Auswahltabelle). Zweimal gegengeprüft am Vorlagen-Bestand des Nutzers
(2026-08-17):

| Feld | RefreshId | REFRESH-ID |
|---|---|---|
| `BEL_197_8` Ansprechpartner | 33 | 300033 |
| `BEL_747_8` Lieferadresse | 55 | 300055 |
| `ADR_1988_2` Adressgruppe | 708 | 300708 (abgeleitet, nicht getestet) |

⚠ **Offen:** in JsonBeleg.json zeigen ALLE `PK` auf Felder des OFFENEN Satzes
(`BEL_…`, `ADR_…`). Ob REFRESH auch für die Zeilen einer SEFILELOOP-LISTE
liefert, ist NICHT belegt. Das entscheidet ein Echttest.

Ein vierter Block `MASKE` kommt in derselben Datei vor und trägt
`REFRESH_FELDER: "*"` — andere Mechanik, nicht abgelesen:

```json
"MASKE": [{ "ID": "1211S5OPT44", "BEREICH": "BEL",
            "FELDER": "*", "REFRESH_FELDER": "*", "ALIAS": "Rabatt" }]
```

- Unser Export schreibt **keinen** REFRESH-Block. Deshalb kommen Code-Felder
  ohne ihren Text an.

## 4b. Feldpositionen der Installation (2026-08-17)

Abgelesen an den Chef-Masken und am Vorlagen-Bestand des Nutzers. Alles
installations-individuell — steht hier als NOTIZ, gehört nie in den Code
(Regel 5).

| Tabelle | Feld | Code | Anmerkung |
|---|---|---|---|
| ART | Warengruppe | `36_5` | in der FELDER-Liste der behandlung-Maske |
| ADR | Adressgruppe | `1988_2` | RefreshId 708; NICHT in der ADR-Liste der Masken |
| ADR | Adress-Typ | `3362_1` | `1` = Privat |
| ADR | Suchbegriff/Matchcode | `1881_30` | darüber läuft die Namenssuche |
| ADR | „Adressgruppe" 30 Zeichen | `769_30` | **leer geprüft 2026-08-17** — kein Name |
| ADR | (veraltet) Adressgruppe | `1219_2` | RefreshId 56 |
| BEL | Stat: Adressgruppe | `3521_2` | ohne Refresh |

Warengruppen-Nummern der Installation (aus der behandlung-Maske): 1 Medikamente,
2 Artikel, 3 Leistungen, 4 Impfstoffe, 5 Futtermittel, 6 Koffer/Stücklisten,
7 Kleintier, 31 Allgemein, 32 Alpaka, 33 Kalb, 37 Labor. Verglichen wird
getrimmt und ohne führende Nullen (`007` = `7`).

Adressgruppen-Stamm (vom Nutzer in SoftEngine abgelesen): Nr `0_2`,
Bezeichnung `180_60`. **Seine SEFILELOOP-Kennung ist unbekannt** — in keiner
der 267 Vorlagen wird die Tabelle per SEFILELOOP geladen. Als Quelle im Editor
damit nicht anlegbar.

## 4c. GET_RELATION — Muster aus JsonBeleg.json

Alle mit `PARAMETER` als Liste und `RUECKGABE_ALS_ARRAY: false`:

| NR | Parameter | liefert |
|---|---|---|
| 43 | `BEL_516_3`, `3`, `30` | Name eines Bedieners |
| 208 | `EINGABE_116_2`, `180`, `60` | Name einer Adressgruppe |
| 230 | `CONCAT[BEL_2_1!BEL_1893_2]`, `180`, `60` | Belegart-Gruppe |
| 516 | Datum, Zeit, `DATUM_0_10`, `ZEIT_0_5`, `0`, `1` | Alter in Tagen |

Muster: `<Schlüssel>, <Position>, <Länge>` liest ein Feld des Zielsatzes.
`CONCAT[a!b]` setzt einen Schlüssel aus zwei Feldern zusammen.

## 5. ⚠ Die REIHENFOLGE der SEFILELOOP-Einträge ist ein Kontrakt

Belegt 2026-08-11 durch einen A/B-Echttest mit derselben Maske:

- Steht ein **Kopfsatz-Loop (POS/Belegpositionen) an ERSTER Stelle**, liefert
  SoftEngine aus **keiner** Quelle Daten — auch ADR/ART/IDB dahinter bleiben leer.
- Dieselbe Datei mit POS an letzter Stelle: alle Quellen liefern.
- Erklärung: ein Kopfsatz-Loop scheitert standalone, und SoftEngine bricht beim
  ersten gescheiterten Loop die ganze Liste ab.

Der Export schreibt Kopfsatz-Arten deshalb **zuletzt**
(`loopReihenfolge` in `core/data/dataSources.ts`, Merkmal `kopfsatzMoeglich`).
Wer die Ausgabe-Reihenfolge anfasst, bricht das.

Der Kontrakt gilt nur INNERHALB der SEFILELOOP — eine `erpapicall`-Quelle fällt
aus der Liste heraus und kann sie nicht scheitern lassen.

## 6. Kopfsatz und VAR

- `KOPFSATZ_INDEX` in SoftEngine-Form `KÜRZEL_pos_len`: `'BEL_0_11'` heißt
  „der offene Beleg, ab Zeichen 0, 11 Zeichen lang".
- Belegt 2026-08-07 an der ausgelieferten Belegerfassung:
  `{ ID: 'POS', ALIAS: 'Belegpositionen', KOPFSATZ_INDEX: 'BEL_0_11', … }`
- ⚠ Der Kopfsatz zeigt in den **VAR-Abschnitt**. Fehlt dort die Variable, löst
  SoftEngine den Kopfsatz nicht auf und verwirft die ganze SEFILELOOP-Zeile
  **stillschweigend** — die Tabelle bleibt leer, ohne Fehler.
  Gemessen 2026-08-07, drei Echttests: ohne VAR jedes Mal leer.
- Bestellt wird nur das Feld, auf das der Kopfsatz zeigt.
- Gilt in: `core/data/dataSources.ts` (`varAusKopfsaetzen`, `kopfsatzFor`).

## 7. Schreiben

- `basisHTML_SND_MSG('PUT_RELATION', { NR, PARAMS })`
- `PARAMS` = sechs Strings `[pos, len, art, pindex, relId, wert]`
- `art` = Feld-Art: `'L'` Text · `'D'` Datum · `'Z'` Uhrzeit (`15:00`, belegt
  im empfang-Log 2026-08-12)
- ⚠ **`relId` OHNE `IDB`-Präfix** (`ID0001`, nicht `IDBID0001`) — die
  SEvariablen derselben Maske sagen `IDBID0001`, der PUT nicht.
- Standard-PUT NR 174 ist nur die mitgelieferte Vorlage, keine Konstante.
- Belegter Fehlerfall: schickt man Feldnamen statt Werte, landen sie als
  INHALTE in SoftEngine — `PUT_RELATION[82!0!L!…!STSPALTE!!TEXT!!EPREIS!…]`.
- Gilt in: `core/data/relations.ts`, `blocks/shared/seAktionen.ts`.

## 8. Positionen zur Laufzeit lesen (Hol-Relation)

Belegt 2026-08-10/11, Echttests:

- Relation 69 liefert je Frage EIN Feld einer Position:
  `PARAMS: [BELART, POS, LEN, BELNR, JAHR, ARCHIV, '', POSNR, '', '', '', '']`
  → `{"RESULT":"…"}` über den REGISTER-Callback, 2–19 ms.
- `JAHR`/`ARCHIV` = BEL-Felder `0_1`/`1_1` der gewählten Zeile.
  **Leer findet nur den aktuellen Nummernkreis** (Echttest 2026-08-12:
  261er-Belege lieferten nichts, 262er schon).
- Breiter Schnitt `POS=0/LEN=255` holt die vordere Positionszeile in EINEM
  Aufruf — der Antwortpuffer fasst 255 Zeichen (SE-Log `zlen=255`).
  Nur Felder, die darüber hinausragen, kosten je eine eigene Frage.
- Ende der Liste: `11_6` UND `18_25` beide leer. `645_10` (Positionsident) ist
  hier LEER und **kein** Ende-Marker.
- Immer seriell. `ALS_ARRAY`/`ALIAS` machen die Antwort nur zur 10er-Liste mit
  trotzdem EINEM Wert.
- Eine holende Quelle bestellt bei SoftEngine NICHTS — ihr SEFILELOOP-Eintrag
  entfällt.
- Gilt in: `core/data/ladeRelation.ts`, `softengine/relationLader.ts`.

## 9. START_TOOL

- `sendBWLinkIntern('0,START_TOOL,<nr>[,<params URL-kodiert>]')`
- Fallback `basisHTML_SND_MSG('START_TOOL', { NR, PARAMS })`
- Werkzeug-Nummern sind je Installation individuell → Daten, nie Code.
- Gilt in: `blocks/shared/seAktionen.ts`.

## 10. ERPAPICALL

- Zweiter belegter Weg an Daten. Aus dem Quelltext der empfang-Referenzmaske:
  > „Kommen NICHT per SEFILELOOP, sondern per ERPAPICALL LIEFERADRESSE.GET
  > (ohne ADRNR = alle Sätze; verifiziert 2026-06-11).
  > Antwort: `SEDATA.Daten.ErpApiCall.Haustiere.Zeilen[]` mit Schlüsseln
  > `LFA_pos_len`."
- ⚠ **Bestellt wird nur BEIM LADEN.** Ein ERPAPICALL zur Laufzeit per
  `basisHTML_SND_MSG` **fror im Echttest 2026-08-11 die WinUI-Maske ein**
  (nur noch über den Task-Manager zu beenden). Tabu, bis die
  ErpApiCall-Referenz der Installation vorliegt.
- Nicht belegt und darum nicht angeboten: Kopfsatz, offener Satz (VAR),
  Hol-Relation, Schreibweg.
- Gilt in: `core/data/quellenArten.ts` (`erpabfrage`), `softengine/data.ts`
  (`rowsFor`).

## 11. Anlegen (SE-Wissen, wird NICHT gebaut)

Belegt im empfang-Log 2026-08-12, WinUI. Der Nutzer hat die Etappe gestrichen —
steht hier nur als Wissen:

- Neuer IDB-Satz: `GET_RELATION[640!<IDBID>]` → Antwort = die NEUE Satznummer.
- Neuer Beleg: `GET_RELATION[1020!<BELART>!!<ADRNR>!!!!]` → Beleg-INDEX
  (`0NL26105743`: Byte 3 = Belegart, ab Byte 4 = Belegnummer).
- Neue Belegposition: `PUT_RELATION[82!0!L!26105745!!ART03045!!1]` —
  `[0, Belegart, Belegnummer, '', Artikelnummer, '', Menge]`. Was die `0` und
  die Leerstellen bedeuten, ist **ungedeutet**.
- Bediener-Name: `GET_RELATION[43!_BNR_!3!30]`.
- Beim Anlegen werden auch LEERE Felder geschrieben
  (`docs/softengine-wiki/muster-satz-anlegen.md`).

## 12. DTK-Import

- „IDB exportieren" der SoftEngine-GUI schreibt `.DTK`.
- `@DSATZ`-Zeilen, zwei belegte Formen:
  `IDBID0001_0_55,,0,55,TierArtID,L` und
  `IDBID0002_0_30,1002,0,30,Tierart,L,a001,000000`
- Die Datei enthält auch ALTE Seitenstände.
- Steuerzeichen werden abgestreift (belegt: ein `0x80` vor `' von'`).
- Gilt in: `core/data/dtkImport.ts`.

## 13. Plattform-Unterschiede

- Die Maske läuft in **WinUI/BüroWARE** (`__WEBWARE__: "0"`,
  `__WINUI_MAJORVERSION__: "7"`) und in **WebUI/WEBWARE**.
- Altes WinUI hat **keinen `ResizeObserver`** — Rückfall ist Pflicht
  (`blocks/tabelle/rumpfMessung.ts`, `seitengroesse.ts`).
- HTML5-Drag ändert in SoftEngine nur den Mauszeiger.
- `<!--SOFTENGINE-VAR!EditorPfad-->/JS/JS/basis.html.interface.js` existiert und
  arbeitet (belegt 2026-07-28, WinUI). Ob der Tag NÖTIG ist, ist ungeklärt —
  s. CLAUDE.md, Regel 5.
- Nebenbeobachtung: `CONECT` wird ZWEIMAL gesendet, Empfang trotzdem nur
  1 Paket. Ungeklärt.

## 14. Ansichten/Flächen

- Befund N2.1-6 (Echttest 2026-08-12): ohne das Sicht-Attribut lagen zwei
  Flächen **übereinander** — im Editor unsichtbar, in SoftEngine kaputt.
  Wer es entfernt, bricht die Ansichten.
- Gilt in: `blocks/base/BasicBlock.ts`, `blocks/navi/seRuntime.ts`.

## 15. Optik-Belege aus den echten Masken

- Senkrechte Navi `.vnav`: 72 px schmal
  (`docs/chef-maske/empfang/index.basis.source.html`).
- Die echte empfang-Maske benutzt `color-mix` — lauffähig belegt.
- Maskenwurzel: `width:100%`, Spalten als `1fr`/flex — die Maske füllt das
  SoftEngine-Fenster wie die echten Chef-Masken.

---

## Was hier NICHT steht

- Bauverlauf, Umbau-Etappen, wer wann was entschieden hat → `git log`.
- Regeln und Entscheidungen → `CLAUDE.md`.
- Die echten Masken selbst → `docs/chef-maske/`.
