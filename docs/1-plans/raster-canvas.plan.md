# Raster-Canvas — frei bewegen mit Einrasten (Lego-Prinzip)

## ⚠ E1-NACHTRAG (Fable, 2026-07-23) — ZUERST umsetzen, dann weiter

Nutzer-Befund nach E1: Auswahlrahmen riesig, Breite-Ziehen tot. Opus wurde
abgebrochen; Stand ist unkommittet.

**Ursache 1 = Planfehler von Fable (nicht Opus):** Migrations-Vorgabe
„rasterW = 24 für ALLE" macht vorher schmale Blöcke (Schaltfläche,
Formularfeld, Datum …) zu Vollbreite-Kästchen — der blaue Rahmen zeigt
das Kästchen, nicht den Inhalt. **Fix 1 (Pflicht):**
- `stapeleUntereinander` (rasterLayout.ts) nimmt Paare {w, h} statt nur
  Höhen; x=0, y fortlaufend bleibt (weiter überlappungsfrei).
- Breite je Block analog `zielZellHoehe` (migrations.ts):
  `props.width` = Zahl → Zellen genähert (Stellschraube ~40 px/Zelle,
  aufgerundet) · `'fill'` → 24 · sonst → Registry `raster.startW`.
- Registry-Startbreiten setzen (kalibrieren, Nutzer prüft live):
  Schaltfläche ~4 · Formularfeld ~6 · Datum ~4 · Text ~6 ·
  Trennlinie/Kanban/Zeile 24. `RASTER_FALLBACK.startW` 24 → 6.
- Gilt für Migration UND Klick-Einfügen. Referenzabzug danach erneuern.
- Abnahme-Kriterium: Bestandsmaske → Blöcke untereinander in
  inhaltsnaher Breite, Rahmen liegt ENG am Baustein.

**Ursache 2 = kein Bug:** Größe-Ziehen ist erst E3. **Fix 2:** E3
(Anfasser mit Zellen-Snap auf rasterW/rasterH) direkt nach Fix 1
VORZIEHEN, damit sich der Stand nicht tot anfühlt; bis dahin keine
toten Alt-Anfasser auf der Rasterfläche zeigen.

**Rollback-Option:** Nichts ist committet — will der Nutzer lieber
zurück auf den Stand vor E1, reicht `git checkout` der geänderten
Dateien (Nutzer entscheidet, vorher fragen).

> Plan von Fable (2026-07-23) für die ausführende Sitzung (**Opus baut**).
> CLAUDE.md gilt; bei Widerspruch gewinnt CLAUDE.md bzw. der Nutzer.
> **Start erst nach Nutzer-„go" — je Etappe einzeln.**
> **KEINE Annahmen:** Alles Verbindliche steht in diesem Plan. Die einzigen
> offenen Stellschrauben sind ausdrücklich markiert („kalibrieren", nur
> Optik-Feinwerte — Zellenmaß, Startgrößen) und werden dem Nutzer LIVE im
> Browser gezeigt. Für alles andere gilt: bei Unklarheit STOPPEN und den
> Nutzer fragen — nichts dazuerfinden, keine SE-Kontrakte raten, keine
> Datenwege anfassen.

## Entscheidung (Nutzer 2026-07-23)

Die Maskenfläche wechselt vom Fluss (Stapel, Nachrücken) auf ein
**Raster mit Einrasten** (Retool-Modell, vom Nutzer „Lego-Noppen"
genannt). Das ÜBERSTIMMT die Grundsatz-Entscheidung 2026-07-22
(„Fundament bleibt Fluss") — der echte Fall ist da, vom Nutzer wörtlich
benannt: *Bausteine frei bewegen, in der Größe ändern, nebeneinander
packen ohne Aufwand, platzieren wie ich will.* Damit ist Regel 10
erfüllt. Das im Fahrplan offene **Größen-Paket geht vollständig in
diesem Paket auf** (Breite UND Höhe ziehbar + Startgrößen = Tobis
GridComponent-Skizze wörtlich: Baustein mit Breite×Höhe).

Fachliche Zusagen an den Nutzer (nicht verhandelbar):

- Bausteine liegen an festen Plätzen, nichts rückt ungefragt nach.
- Nebeneinander = einfach danebenlegen, kein Zeilen-Baustein nötig.
- Alles rastet ein → immer sauber ausgerichtet, kein Pixel-Gefummel.
- Die Maske atmet in der Breite mit dem SoftEngine-Fenster (Spalten
  sind relativ), Zeilenhöhe ist fest.
- Läuft ein Inhalt über (langer Text), wird NICHT abgeschnitten:
  die betroffene Rasterzeile wächst und drückt alles darunter nach
  unten (CSS `minmax` — s. Technik). Kein Überlappen, kein Abschneiden.

## Technik-Modell (die EINE neue Layout-Quelle)

Neue Datei `src/core/blocks/rasterLayout.ts` — ersetzt für die
Maskenfläche die Rolle von `flowLayout.ts` und wird wie diese von
**Canvas UND Export identisch** benutzt (WYSIWYG, Regel 1):

- Konstanten `RASTER = { spalten: 24, zeilePx: 12, gapPx: 8 }` —
  EINE Stelle, Feinwerte darf die Implementierung nach Sichtprobe
  kalibrieren (im Bericht nennen).
- Fläche: `display:grid; grid-template-columns:repeat(24, 1fr);
  grid-auto-rows:minmax(12px, auto); gap:8px` + bisheriges
  ROOT-Padding.
- Block: `grid-column: x+1 / span w; grid-row: y+1 / span h`
  (+ `min-width:0; min-height:0`-Hygiene). Kein absolute-Positioning,
  kein Transform — reines CSS-Grid, damit `minmax` das
  Überlauf-Nachgeben erledigt.
- Block-Props (universell, im Knoten): `rasterX`, `rasterY`,
  `rasterW`, `rasterH` (ganze Zellen). Parser mit Defaults wie
  `parseFlowWidth` (kaputte Werte → sichere Defaults, nie werfen).

**Geltungsbereich V1:** NUR die oberste Ebene der Maske und die
Popup-Innenfläche (gleiche 24 Spalten auf der kleineren Fläche).
IM Inneren von Containern (Kanban→Spalten→Karten, Karte, Zeile)
bleibt der Fluss UNVERÄNDERT — `flowLayout.ts` bleibt dafür bestehen.
`ff-zeile` bleibt als Baustein erhalten (Bestandsmasken!), wird durchs
Raster praktisch überflüssig; Entfernen = spätere Nutzer-Entscheidung,
NICHT Teil dieses Pakets.

**Registry (Regel 2, kein Sondercode):** BlockDefinition bekommt
optionale Deklaration `raster: { startW, startH, minW, minH }` je
Baustein (sinnvolle Startgrößen: Formularfeld z. B. 6×3, Kanban 24×20,
Schaltfläche 4×3, Text 6×2, Trennlinie 24×1 — Implementierung
kalibriert nach Sicht). Fehlt die Deklaration → generischer Default.
Canvas/Inspector/Export lesen generisch; `resizableHeight`/`width`-Prop/
`lockedWidth` gelten unverändert weiter INNERHALB von Containern.

## Interaktion (Editor-only, lebt in BlockHost/Canvas — nie im Baustein)

- **Bewegen:** Block greifen → halbtransparenter Geist folgt der Maus,
  rastet live auf Zellen (Vorschau der Zielzelle sichtbar). Ablegen:
  belegte Blöcke weichen NACH UNTEN aus (Push-down, Retool-Verhalten) —
  Überlappen ist nie möglich. Ein Drop = EINE Undo-Transaktion
  (bestehende history; auch die verschobenen Ausweicher gehören in
  DIESELBE Transaktion).
- **Größe:** Anfasser rechts (Breite), unten (Höhe), Ecke (beides) an
  JEDEM Block auf der Rasterfläche — über `zieheGroesse` (bleibt DIE
  eine Zieh-Mechanik, wird um Zellen-Snap erweitert). Minimum aus
  Registry.
- **Neu aus Bibliothek:** Drag → Geist in Startgröße rastet mit; Drop
  setzt an die Zelle (Push-down wie beim Bewegen). Klick-Einfügen →
  erste freie Stelle unten, Startgröße.
- **Führung:** die vorhandene strecke/-Vermessung darf entfallen oder
  aufs Raster reduziert werden (Einrasten ersetzt Führungslinien) —
  Entscheidung der Implementierung, im Bericht nennen.
- Die bisherige Einfüge-Linien-/Randzonen-Mechanik (dndState,
  CanvasNode-DragOver) wird für die Rasterfläche ERSETZT; für Drops IN
  Container (Karte in Spalte usw.) bleibt sie unverändert bestehen.

## Migration (Bestandsmasken, verlustfrei — Fach `migrations`)

Jeder Block auf oberster Ebene / in Popup-Flächen ohne Raster-Props
bekommt: `rasterW = 24` (volle Breite), `rasterY` fortlaufend
untereinander, `rasterH` aus Registry-Starthöhe bzw. vorhandener
`height`-Prop (px → Zellen aufgerundet). Ergebnis: **die Maske sieht
nach der Migration aus wie vorher** (alles untereinander, volle
Breite) — ab da frei verschiebbar. Kein Datenverlust, `width`/`height`-
Props bleiben stehen (Container-Innenleben nutzt sie weiter).

## Export

- `exportMask.ts`: Root-Div (und Popup-Innenfläche) schreibt die
  Grid-Styles aus `rasterLayout.ts` statt Flex; `styleAttr` je Block
  nutzt auf Rasterebene die Raster-Styles, in Containern unverändert
  flowLayout. SEvariablen-JSON: UNBERÜHRT. serializer: UNBERÜHRT.
- **ff-runtime/Web Components: UNBERÜHRT** (Layout liegt in
  style-Attributen, nicht in den Komponenten) → Bündel-Wächter muss
  „identisch" melden. Das ist der Beweis, dass die Datenwege nicht
  angefasst wurden.
- Referenzabzug ändert sich ABSICHTLICH → mit `npx vitest run -u`
  erneuern; der Datei-Diff zeigt exakt die Layout-Umstellung.

## Etappen (je Etappe: Plan-Feinschnitt → „go" → bauen → Prüfbündel)

1. **E1 Fundament (~1 Tag):** rasterLayout.ts + Props/Parser +
   Registry-Deklarationen + Migration + Canvas rendert Grid + Export
   schreibt Grid + Referenz erneuert. Sichtbar: Masken exakt wie
   vorher, nur die Bedienung fehlt noch. e2e laufen (Einfügen per
   Klick/Drag ans Ende funktioniert weiter).
2. **E2 Bewegen (~1 Tag):** Snap-Drag mit Geist + Push-down + Undo;
   Rasterflächen-Drop ersetzt Einfüge-Linie (Container-Drops bleiben).
3. **E3 Größe + Bibliothek (~½–1 Tag):** Anfasser B/H/Ecke mit Snap +
   Startgrößen + Bibliothek-Drop an Zelle.
4. **E4 Popups + Abschluss (~½ Tag):** Popup-Innenfläche aufs Raster,
   e2e-Nachzieharbeiten, Feinschliff, dann **SE-Echttest durch den
   Nutzer** (gebündelt, EIN Durchgang: Sichtprüfung Layout im echten
   SoftEngine-Fenster + ein bestehender Datenweg als Stichprobe).

## Tests (Regel 9 + Test-Bremse)

- export.test: neue Fälle für Grid-Styles (Fläche + ein Block mit
  x/y/w/h) — Unit, kein Browser.
- Referenzabzug erneuert (Diff im Commit sichtbar).
- e2e: KEINE neuen Tests; bestehende 11 anpassen, wo sie an der
  Einfüge-Mechanik hängen (kanban-/formfeld-/zwischenspeicher-data
  ziehen Blöcke auf die Fläche — auf Klick-Einfügen bzw. Zellen-Drop
  umstellen; Flüsse + Assertions bleiben inhaltlich identisch,
  Ausnahme im Bericht ausweisen wie bei R3).
- Prüfbündel komplett vor jedem Etappen-Commit.

## Risiken (ehrlich, vorab gesagt)

- Größtes Paket seit dem Redesign; der Canvas-Drag-Code wird für die
  Rasterfläche weitgehend ersetzt. Realistisch 3–4 Arbeitstage über
  4 Etappen — je Etappe ein prüfbarer Stand, KEIN Big Bang.
- Die e2e-Anpassungen (Etappe 1/2) sind Fleißarbeit mit
  Flakiness-Risiko — deshalb hängen sie an Etappen-Grenzen, nicht am
  Ende.
- Zwei Layout-Welten im Code (Raster oben, Fluss in Containern) —
  bewusster V1-Schnitt, klein gehalten über die eine
  rasterLayout-Quelle.
- Bestandsmasken: Migration ist verlustfrei gebaut, aber der Nutzer
  prüft nach E1 LIVE, dass seine Masken unverändert aussehen.

## Huckepack Doku-Korrektur (in E1, nur Text)

- CLAUDE.md: `docs/chef-maske/` präzisieren — die Masken LAUFEN echt in
  SoftEngine (Kontrakt-Beleg für Anschluss/ERPAPICALL/Stamm bleibt
  gültig), sind aber KI-GEBAUT: als Layout-/Bauart-Vorbild UNGEEIGNET
  (Nutzer-Klarstellung 2026-07-23). Regel-5-Verweis entsprechend
  einschränken.
- Grundsatz-Entscheidung 2026-07-22 (Fluss bleibt) durch diese
  Entscheidung ersetzen; Größen-Paket im Fahrplan als „geht im
  Raster-Paket auf" markieren. Tabelle kommt DANACH als Raster-Block
  (die Grundsatzfrage vor Punkt 4 ist damit entschieden).
