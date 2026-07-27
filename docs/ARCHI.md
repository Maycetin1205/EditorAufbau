# ARCHI.md — Aufbau-Editor (EditorAufbau)

> Architektur-Karte für Mensch und KI-Agenten (Claude, Codex). Sie beschreibt,
> WAS wo liegt und WIE die Teile zusammenspielen. Regeln, Entscheidungen und
> Projektstand leben in `CLAUDE.md` — bei Widerspruch gewinnt CLAUDE.md bzw.
> der Nutzer. Pflege dieser Datei: siehe `docs/ARCHI-rules.md`.

## 1. Überblick

Visueller Baukasten für **SoftEngine-ERP-Masken**: Bausteine (Kanban,
Formularfeld, Schaltfläche, Popup, …) werden auf eine Fläche gezogen, an
ERP-Daten gebunden und als fertiges Paar **HTML + SEvariablen-JSON**
exportiert. Das Ergebnis läuft in SoftEngine (BüroWARE/WEBWARE) **ohne
Nachbesserung von Hand**.

Kernversprechen (beweisbar, nicht behauptet): **Was im Editor zu sehen ist,
IST der Export** — dieselben Web Components rendern im Editor und in der
exportierten Maske (eine Render-Quelle).

Projekt-Typ: **Web-Frontend (React-Editor)**, Besonderheit: der Editor ist
zugleich ein **Code-Generator** — die Export-Pipeline und die mitreisende
Laufzeit (`ff-runtime`) sind gleichwertige Architektur-Säulen neben der
Editor-Oberfläche.

## 2. Technologie-Stack

| Bereich | Technik | Zweck |
| --- | --- | --- |
| Editor-UI | React 19 + TypeScript 6 | Oberfläche (Canvas, Inspector, Steuerung) |
| Bausteine | Lit 3 (Web Components) | EINE Render-Quelle für Editor UND Export |
| Build | Vite 8 (`vite.config` + `vite.runtime.config`) | Dev-Server, App-Build, Runtime-Bündel |
| Styling Editor | Tailwind 3 + shadcn-Muster (radix, cva, lucide) | helles, blaues Editor-UI |
| Styling Masken | eigene CSS-Tokens (`--se-*`) | kantiges, grünes SoftEngine-Design |
| Tests | Vitest 4 (Unit/Snapshot) | fünf Wächter + Prüfbündel (Playwright/e2e entfernt 2026-07-23) |
| Version | `package.json` (`0.1.1`) | SemVer |

## 3. Projektstruktur

```
src/
├── app/            App-Einstieg; providers.tsx erzeugt DIE eine Editor-Instanz
│                   (EditorProvider/EditorContext — keine Weltvariable)
├── state/          Editor.ts = Zustand + öffentliche Methoden; Fächer daneben:
│                   treeOps (Baum), history (Undo), persistence (Browser-
│                   Speicher + Notfallkopie BACKUP_KEY), migrations, templateRules
├── core/
│   ├── blocks/     Registry-KONZEPTE: BlockDefinition (Fähigkeiten wie
│   │               allowedChildTypes, bindableSpots, blockEvents, bindingProp,
│   │               acceptsDataSource, resizableHeight …)
│   └── data/       Aktionsketten-MODELL (Ereignis → Schritte, echte Union der
│                   Schritt-Arten) + Datenquellen-Modell
├── blocks/         Die Bausteine, je Ordner: Definition + Web Component
│   ├── base/       Gemeinsames (BlockHost-Anbindung)
│   ├── kanban/     Kanban + Spalte + Karte; seRuntime.ts = Kanban-Hydrierung
│   ├── card/       Karte (acht bindbare Stellen, LEER-Regel, tierIcon.ts)
│   ├── formfeld/   Formularfeld (bindbar, feldRuntime = Feld-Hydrierung)
│   ├── datum/      Datumsanzeige (ungebunden Uhr, gebunden Feldwert)
│   ├── button/     Schaltfläche (trägt Aktionsketten)
│   ├── popup/      Popup-Seite (pageBlock: zentriertes Fenster, X, Abdunklung)
│   ├── zeile/      Zeilen-Layout
│   └── shared/     seAktionen.ts = Ketten-LAUFZEIT (Schritte ausführen)
├── softengine/     Die SoftEngine-SCHICHT (kennt NIE einen Baustein):
│   ├── bridge.ts   Anmeldung basisHTML_REGISTER, Daten-Push, Abo-Punkt
│   │               onSeDaten, Diagnose-Overlay (Strg+Alt+D)
│   ├── data.ts     getField/setField (Präfix-Scan), rowsFor, Quellen
│   └── relations.ts Vorlagen (GET/PUT/PUTADD), serielle GET-Warteschlange
├── editor/         Editor-Oberfläche (NICHT im Export):
│   ├── canvas/     Fläche, CanvasNode, Drag&Drop (dndState), Seiten-Reiter
│   │               (SeitenLeiste/PopupSeite), Anfasser (zieheGroesse = DIE
│   │               eine Zieh-Mechanik), useBindingPicker/useBlockResize
│   ├── inspector/  Eigenschaften-Panel (nur für Unzeigbares)
│   ├── zentrale/   Steuerung: Datenquellen | Verknüpfungen | Relationen
│   │               (Master-Detail);
│   │               StepForm (Schritt-Formular) blättert im Inspector auf;
│   │               feldUebernahme.ts + FeldUebernahmePicker.tsx = „Feld
│   │               übernehmen" (Pos/Länge/Tabelle aus gewähltem Feld,
│   │               Auslöser an der Parameter-Zeile, editor-only)
│   ├── sidebar/    Bausteine-Bibliothek
│   └── shell/      Rahmen, Kopfleiste
├── export/         Export-Pipeline:
│   ├── exportMask.ts  Baum → HTML + SEvariablen (deterministisch)
│   ├── validator.ts   + preflight.ts — blocken mit Klartext, nichts scheitert still
│   ├── serializer.ts  DIE eine Zeichen-Regel-Stelle (LF-only, ASCII-Escaping)
│   ├── generated/     ff-runtime.js (gebündelte Masken-Laufzeit; Veralten-
│   │                  Wächter im export.test)
│   └── referenz/      Referenzmaske für den Byte-Vergleich (5. Wächter)
├── design/         masken-tokens.css (--se-*) — Masken-Welt
├── ui/             Editor-Kleinteile (atoms/molecules, shadcn-Stil)
├── lib/ · test/    Helfer · Test-Aufbau
docs/               ARCHI.md (diese Datei), TRIP-Ordner (1-plans …), decisions/,
                    softengine-wiki/ (SE-Kontrakte)
scripts/            check-runtime-bundle.mjs (Bündel-Wächter) + check-docs.mjs (Doku-Wächter)
                    + check-regeln.mjs (Regel-Wächter: bewacht die Bauart)
```

## 4. Kern-Architekturprinzipien (Kurzfassung der 10 Regeln)

Verbindlicher Wortlaut in `CLAUDE.md`. Für die tägliche Arbeit:

1. **WYSIWYG beweisbar** — eine Render-Quelle; Editor-Hilfen im BlockHost, nie im Baustein.
2. **Fähigkeiten = Registry-Einträge** — nirgends `if typ === 'kanban'`.
3. **Technikwert ≠ Anzeigename** — Feldcodes/IDs unsichtbar, Klarnamen sichtbar.
4. **Ein Export, nichts scheitert still** — Validator + Preflight blocken mit Klartext.
5. **SE-Kontrakte nur aus Originalquellen** — Installations-Individuelles ist DATEN (Vorlagen), nie Code.
7. **Bedienung am Ding** — der Editor erfindet nie Daten (Striche statt Demo-Werte).
9. **Prüfungen gebündelt vor dem Commit** — fünf Wächter + Test-Bremse (s. Abschnitt 9).
10. **Nichts auf Verdacht bauen** — erst der echte zweite Fall erzwingt Gemeinsames.

## 5. Zustand, Seiten & Persistenz

- **Ein Baum, ein Store:** `Editor.ts` hält den Block-Baum; Änderungen laufen
  über öffentliche Methoden (treeOps), jede Nutzer-Geste = EINE Undo-Transaktion
  (history). Undo ist seitenübergreifend.
- **Seiten-Modell:** Maske = Hauptseite + Popup-Seiten. Eine Popup-Seite ist ein
  **Popup-Knoten als Kind der Wurzel** im selben Baum (kein eigenes Schema);
  `Editor.rootId` zeigt auf die Wurzel der AKTIVEN Seite, `childNodesOf` filtert
  Seiten-Bausteine aus jedem Fluss. Bedienung über Seiten-Reiter am Canvas.
- **Persistenz:** Browser-Speicher; unlesbarer Speicherstand → Notfallkopie
  (`BACKUP_KEY`) + Klartext-Meldung. Schema-Migrationen in `migrations`
  (verlustfrei, z. B. v2-Vollbild, Karten-Demo-Putzer).

## 6. SoftEngine-Schicht (`src/softengine/`)

**Abhängigkeitsregel: Bausteine importieren die Schicht — die Schicht kennt
NIE einen Baustein.**

- **bridge.ts:** SoftEngine SCHIEBT die Daten. Anmeldung
  `basisHTML_REGISTER(cb, document.title, '1.0')` mit Retry; jeder Push
  hydriert neu. BWMSG (BüroWARE) und WWMSG (WEBWARE) landen vereinheitlicht im
  selben Callback. Fallbacks: `message {MSG:{DATA}}`, SEDATA-Poll.
  Diagnose-Overlay: `Strg+Alt+D`.
- **data.ts:** Zeilen-Properties tragen Tabellen-Präfix (`IDBID0001_253_30`);
  Schlüssel-Scan gleich/`code_`-Präfix/`_code`-Endung — für Lesen UND
  Schreiben. `setField` patcht die Zeile lokal.
- **relations.ts:** Vorlagen (GET/PUT/PUTADD) sind DATEN mit stabiler ID.
  GET: immer nur EINE Anfrage in Flug (serielle Warteschlange), Antwort primär
  über den REGISTER-Callback. PUT: `basisHTML_SND_MSG('PUT_RELATION',
  {NR, PARAMS})`, PARAMS = sechs Strings `[pos, len, 'L', pindex, relId, wert]`,
  relId OHNE `IDB`-Präfix. START_TOOL: `sendBWLinkIntern('0,START_TOOL,<nr>…')`.
- **Export-Anschluss:** jede Maske lädt
  `<!--SOFTENGINE-VAR!EditorPfad-->/JS/JS/basis.html.interface.js` — ohne ihn
  keine SEFILELOOP-Daten und keine Relationen.

## 7. Aktionsketten

Baustein → Ereignis (z. B. „Wert geändert", „Karte verschoben", Klick) →
Schritte. Schritt-Arten (echte Union, Anzeige in Klammern):

| Technikwert | Anzeige | Kern |
| --- | --- | --- |
| `START_TOOL` | START_TOOL | nur Werkzeug-Nummer (SE-Fachbegriff = Anzeigename) |
| `RELATION` | GET_RELATION / PUT_RELATION / PUTADD_RELATION | Vorlagen-ID + positionsgetreue Parameter-Zuordnung |
| `POPUP_OPEN` / `POPUP_CLOSE` | Popup öffnen/schließen | stabile Seiten-id, Export übersetzt in Klarnamen |

Parameterquellen: Fest / Ereignis ({VALUE}, {PINDEX}) / Datenfeld / vorheriges
Ergebnis / SE-VAR-Array. Benannte GET-Ergebnisse bleiben in der Kette verfügbar.
Laufzeit: `src/blocks/shared/seAktionen.ts`. Verwendete Vorlagen reisen als
`FF_RELATIONS`, Schritt-Quellen als `FF_DATA_SOURCES` in die Maske.

## 8. Export-Pipeline (`src/export/`)

```mermaid
flowchart LR
  A[Block-Baum] --> V[validator + preflight
Klartext-Blocker]
  V --> E[exportMask
HTML + SEvariablen]
  E --> S[serializer
LF-only, ASCII-Escaping]
  R[ff-runtime.js
gebündelte Laufzeit] --> E
  S --> H[index.basis.source.html]
  S --> J[index.basis.SEvariablen.json]
```

- **Deterministisch:** gleiche Eingabe → Byte-gleiche Ausgabe. Dateinamen nach
  Konvention der 124 Referenzmasken.
- **Escaping maschinell:** im Quellcode echte Umlaute erlaubt; der Export
  escapet (HTML `&#x…;`, JS/JSON `\uXXXX`). `serializer.ts` = die EINE Stelle.
- **SEvariablen-Formen:** IDB-Quelle → SEFILELOOP `FELDER:'*'`; Stamm
  (ADR/ART/BEL) → explizite pos_len-Liste. MEMTAB/ERPAPICALL erst nach Beleg.
- **ff-runtime:** `npm run build:runtime` bündelt die Masken-Laufzeit nach
  `src/export/generated/ff-runtime.js`; ein Veralten-Wächter im export.test
  schlägt an, wenn Quelle und Bündel auseinanderlaufen.
- **Referenzabzug:** `src/export/referenzabzug.test.ts` vergleicht den Export
  einer festen Referenzmaske Byte für Byte gegen `src/export/referenz/`.
  Absichtliche Export-Änderung → Referenz mit `npx vitest run -u` erneuern
  (Diff macht die Maskenänderung im Commit sichtbar).

## 9. Test-Strategie (fünf Wächter + Prüfbündel)

**Prüfbündel — EINMAL gebündelt vor dem Commit, nie zwischendurch:**

```bash
npx tsc -b && npx eslint src && npm run check:regeln && npm run check:runtime && npm run check:docs && npm test
```

- Fünf Wächter: export.test · seRuntime.test · persistence.test ·
  Export-Referenzabzug · Bündel-Wächter `check:runtime`. Nicht ohne Absprache
  aufblähen. (Playwright/e2e am 2026-07-23 entfernt — Nutzer-Entscheidung;
  der Nutzer prüft die Bedienung live, der bauende Agent im Browser-Preview.)
- Bündel-Wächter (Nutzer-Go 2026-07-20): `npm run check:runtime`
  (`scripts/check-runtime-bundle.mjs`) baut das Runtime-Bündel über den echten
  CLI-Weg neu und vergleicht es inhaltlich mit dem eingecheckten
  `ff-runtime.js` — fängt BELIEBIGE Bündel-Drift, nicht nur die bekannten
  Marker des Sanity-Checks in export.test.ts (der bleibt billig daneben).
  BEWUSST kein vitest-Test: In-Place-Bauen im vitest-Lauf würde die
  `?raw`-Leser (export.test.ts) flaky machen; darum eigener Schritt VOR vitest.
- Doku-Wächter `check:docs` (2026-07-24): bewacht die Doku selbst — prüft, dass
  ARCHI.md die richtige Version nennt und jedes genannte `npm run …` wirklich
  existiert. Bewusst nur diese zwei Prüfungen (Regel 10). Fing bei Einführung
  die zwei bekannten Abweichungen (Version 0.1.0→0.1.1, `test:e2e`).
- Regel-Wächter `check:regeln` (2026-07-24, Nutzer-Entscheidung):
  `scripts/check-regeln.mjs` bewacht die BAUART gegen die Architektur-Regeln,
  die vorher nur als Prosa in CLAUDE.md standen. Sechs Prüfungen:
  (1) kein Bausteintyp-Vergleich in generischem Code · (2) jeder Baustein im
  export.test UND in der Veralten-Positivliste · (3) Dateien ≤ 500 Zeilen
  (StepForm.tsx/Editor.ts als Altlast eingefroren, dürfen nur schrumpfen) ·
  (4) `any`/`ts-ignore` eingefroren · (5) keine Hex-Farben im Baustein-CSS ·
  (6) kein Baustein-IMPORT in generischem Code. Ausnahmen stehen einzeln MIT
  Begründung im Script (`migrations.ts` kennt alte Typnamen von Berufs wegen;
  `PopupSeite.tsx` teilt `POPUP_RAND` mit dem Baustein). Die Bausteinliste
  liest er aus dem Code, nie aus einer gepflegten Liste — er kann nicht
  veralten. Anlass: Prosa-Regeln halten niemanden auf; der Tabellen-Bug
  2026-07-24 (Spalten-Export still kaputt) entstand genau dort, wo die
  Regel nur im Kopf existierte. Prüfung (6) kam noch am selben Tag dazu,
  nachdem ein Tabellen-Import im generischen BlockHost durch (1) schlüpfte.
- **Test-Bremse:** KEINE neuen Browser-/e2e-Tests (die Playwright-Suite ist
  2026-07-23 entfernt). Berührt ein Paket Export/Laufzeit, deckt ein schlanker
  vitest-Fall die Byte-/Kontrakt-Seite ab; die Bedienung prüft der bauende
  Agent im Browser-Preview (Port 5173) und der Nutzer live.
- Berührt ein Paket den Export → zusätzlich **SE-Echttest durch den Nutzer**
  in echter SoftEngine-Umgebung (wird auf Nutzer-Wunsch gebündelt).

## 10. Design: zwei Welten, nie mischen

| | Masken-Welt | Editor-Welt |
| --- | --- | --- |
| Datei | `src/design/masken-tokens.css` | `src/index.css` |
| Tokens | `--se-*` | shadcn/Tailwind |
| Optik | kantig, Grün | hell, Blau |
| Gilt für | Bausteine/Export | Canvas, Inspector, Steuerung |

## 11. Datenfluss (Lesen und Schreiben)

```mermaid
sequenceDiagram
  participant SE as SoftEngine
  participant BR as bridge.ts
  participant RT as seRuntime/feldRuntime
  participant B as Baustein
  participant K as Kette (seAktionen)
  SE->>BR: Daten-Push (BWMSG/WWMSG)
  BR->>RT: onSeDaten (Abo)
  RT->>B: hydrieren (erste Zeile der Quelle)
  B->>K: Ereignis (z. B. Wert geändert)
  K->>SE: PUT_RELATION / GET_RELATION / START_TOOL
  SE->>BR: nächster Push (Kreis schließt sich)
```

Merksatz: **Lesen hydriert automatisch, Schreiben läuft NUR über sichtbare
Ketten** (kein Auto-PUT; ein Kanban-Drop führt nur die Kette aus, die Karte
bleibt bis zum nächsten Push liegen).

## 12. Build & Befehle

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Dev-Server (Vite; Browser-Vorschau über `.claude/launch.json`) |
| `npm run build` | `tsc -b` + App-Build |
| `npm run build:runtime` | ff-runtime-Bündel erneuern (nach Laufzeit-Änderungen Pflicht) |
| `npm test` | Vitest (Unit/Snapshot) |
| `npm run check:runtime` | Bündel-Wächter (läuft VOR vitest) |
| `npm run check:docs` | Doku-Wächter: ARCHI.md-Version + genannte Scripts gegen package.json |
| `npm run check:regeln` | Regel-Wächter: Bauart gegen die Architektur-Regeln (s. Abschnitt 9) |

## 13. Bewusste Grenzen (Stand 2026-07-20)

- Die Feld-Hydrierung arbeitet mit der **ersten Zeile** der Quelle.
- Ankreuzfeld unbindbar, MEMTAB/ERPAPICALL ungebaut — SE-Kontrakt unbelegt.
- Werkzeug-Nummern/Relations-NRs sind installations-individuell = Vorlagen-Daten.
- Vollständige Merkliste: `CLAUDE.md`.
