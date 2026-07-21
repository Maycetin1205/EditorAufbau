# R2 — Editor-Redesign: Bibliothek + Inspector + Baustein-Baum

> Plan von Fable (2026-07-21) für die ausführende Sitzung (Opus).
> Kontext: R1 ist gebaut und abgenommen (`76b02e3` + `0b62eea`) — der
> R1-Code IST die Stil-Referenz. CLAUDE.md gilt; bei Widerspruch gewinnt
> CLAUDE.md bzw. der Nutzer. **Start erst nach Nutzer-„go".**

## Auftrag (Fahrplan Punkt 2, Teil R2)

Bibliothek (Sidebar) und Inspector neu aufbauen + NEU: ein Baustein-Baum
links. NUR Editor-UI — Export unberührt (Beweis: `check:runtime` meldet
„Bündel identisch", Referenzabzug bleibt grün).

## Design-Kontrakt (verbindlich, aus R1 + Nutzer-Geschmack)

- Blaupause Internal-Tool-Builder (Retool-Dichte), hell + Blau; Blau NUR
  für Auswahl/Primäres.
- Schrift: Inter Variable (läuft schon, `font-sans`).
- EIN kleiner Radius über die Tokens (`rounded-md`), **keine Pillen,
  keine Bubbles**.
- Dicht: Bedienhöhen 24–28 px (h-6/h-7), Schrift 11–13 px, Abstände
  4/8/12 — **keine verschwendete Fläche** („sieht sonst KI-generiert
  aus", O-Ton Nutzer).
- Farben nur über die shadcn-Tokens (`bg-card`, `border-border`,
  `text-muted-foreground`, `primary`).
- Stil-Muster ansehen VOR dem Bauen: `EditorShell.tsx`, `Toolbar.tsx`
  (MoreMenu!), `SeitenLeiste.tsx`, `StatusBar.tsx`, Leerzustand in
  `Canvas.tsx`.

## Umfang

1. **Bibliothek** (`src/editor/sidebar/`): kompakte Baustein-Karten mit
   Icon (lucide) + Namen, Kategorien LAYOUT/EINGABE/ANZEIGE bleiben,
   Suche bleibt. Klick-zum-Hinzufügen und Drag bleiben unverändert.
2. **Baustein-Baum** (NEU, eigenes Panel im linken Bereich über der
   Bibliothek): zeigt die AKTIVE Seite als eingerückten Baum
   (`ed.childNodesOf` rekursiv ab `ed.rootId`), je Zeile Icon +
   Klarname (`displayName`), Klick = `selectBlock`, Auswahl deutlich
   markiert, Hover hebt hervor. NUR Auswahl — KEIN Ziehen/Umsortieren im
   Baum (Regel 10, erst wenn ein echter Bedarf es erzwingt). Leerer Baum
   = ein stiller Hinweis-Satz.
3. **Inspector** (`src/editor/inspector/`): Kopf aus R1 behalten (Name +
   Duplizieren/Löschen). Abschnitte mit fester Ordnung und
   Abschnitts-Überschriften im vorhandenen „DATEN"-Stil (10 px,
   uppercase): **Inhalt** (generalProps) · **Daten** (wie heute).
   Leer-Zustand („Kein Block ausgewählt.") als kleine gestrichelte
   Hinweis-Karte im Stil des Canvas-Leerzustands statt nacktem Satz.
   Controls dichter (Inputs h-7/h-8, Labels 11 px) — Verhalten und
   Reihenfolge der Controls NICHT ändern.

## Harte Verbote (Bündel-/Export-Schutz)

- NICHTS anfassen in `src/blocks/`, `src/export/`, `src/softengine/`,
  `src/design/masken-tokens.css`, `src/core/` — auch keine „nur ein
  Feld"-Erweiterung von BlockDefinition: **Baustein-Icons kommen als
  Editor-seitige Zuordnungstabelle** (z. B.
  `src/editor/sidebar/blockIcons.ts`, `Record<blockType, LucideIcon>` mit
  generischem Fallback — Daten-Tabelle wie `tierIcon.ts`, kein
  `if typ === …`-Verhalten). Lucide darf NIE ins Runtime-Bündel.
- Keine neuen e2e (Test-Bremse), keine Testdatei anfassen.
- Diese zugänglichen Namen/Texte EXAKT erhalten (e2e-Vertrag):
  - Bibliotheks-Knöpfe: `Zeile`, `Schaltfläche`, `Formularfeld`,
    `Datum`, `Kanban` (werden mit `exact: true` gesucht — Icon zusätzlich
    ist ok, Text muss der zugängliche Name bleiben)
  - Inspector: Beschreibung `${def.type} · ${id.slice(0,8)}` (Tests
    warten auf `formfeld ·` / `kanban ·`), Knopf `Daten anschließen…`,
    Dialoge `/Daten anschlie…/` und `/Feld für…/`, Gruppen `Datenquelle`,
    `Einsortieren nach`, `Feld`, Labels `Feldtyp`, `Auswahl-Optionen`,
    Option `Auswahl`, Knopf `Fertig`
  - Top-Bar (nicht Teil von R2, nur nicht kaputt machen): `Hauptseite`,
    `＋ Popup`, `Als SoftEngine-Maske exportieren`

## Prüfungen + Abschluss (Regel 9)

`npx tsc -b` → `npx eslint src` → `npm run check:runtime` (MUSS „Bündel
identisch" melden, sonst wurde Masken-Welt berührt → stoppen und
zurückbauen) → `npm test` → `npx playwright test`. Alles grün → EIN
Commit. Screenshots (Baum mit Auswahl / Bibliothek / Inspector gefüllt +
leer) an den Nutzer, Abschlussbericht mit „Aufgefallen unterwegs".
Push nur nach Nutzer-Go. CLAUDE.md: R2 im Fahrplan als gebaut vermerken.
