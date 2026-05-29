# Aufbau-Editor — Hier weitermachen

> **Für KI-Chats:** Diese Datei zuerst lesen. Sie ist die verbindliche Wahrheit
> für Ziel + Arbeitsweise + Stand. Architektur-Details: `ARCHITEKTUR.md`.
> Wenn der Nutzer „wir machen weiter" sagt → hier den nächsten offenen Punkt
> der Roadmap nehmen.

## Was der Editor ist (Nordstern)

Ein visueller Baukasten für **SoftEngine-Masken**: Blöcke (Button, Text, später
Kanban / DetailCard / DataTable …) auf einen Canvas ziehen, an ERP-Daten
(IDB-Tabellen) binden und als **fertiges HTML exportieren**, das in SoftEngine
läuft.

**Nordstern (oberstes Ziel — alles daran messen):**
1. **1 Render / WYSIWYG:** Was im Editor zu sehen ist, IST der Export. EINE
   Render-Quelle (Web Components, die im Editor *und* im Export laufen). Kein
   separater Preview.
2. **Ersetzt den manuellen Programmierer:** Der Export muss so sauber + komplett
   sein, dass niemand mehr von Hand HTML/JSON nachbessern muss. Wenn doch nötig
   → das Tool hat versagt.

Kontext: Es gibt einen ALTEN, „vibe-gecodeten" Editor
(`C:\Users\mu.aycetin\Desktop\Projekte\Editor\react-app`), der funktioniert
(inkl. Export in SoftEngine), aber unwartbar ist. **Dieses Projekt baut ihn
sauber neu** und löst ihn dann ab.

## Arbeitsweise (verbindlich)

- **Strangler-Fig-Migration:** Den alten Editor **Kapitel für Kapitel** sauber
  ins Neue umziehen. Alter bleibt nutzbar, neuer wächst bis zur Parität, dann
  Ablösung. Kein 28k-Zeilen-Big-Bang.
- **Schritt für Schritt, klein.** Ein abgeschlossenes Stück pro Schritt.
- **Code immer zeigen + besprechen.** Der Nutzer will jeden Schritt sehen (auch
  wenn er nicht alles versteht) und mitreden.
- **Erlaubnis vor Code-Änderungen:** erst Plan zeigen, „go" abwarten. Lesen /
  Analysieren ist jederzeit ok.
- **Nicht mit Mini-Entscheidungen nerven** (Snap-Grid, Farbnuancen): sinnvolle
  Defaults selbst wählen, kurz erwähnen.
- **Keine Komplimente / kein Cheerleading.** Sachlich, direkt, knapp.
- **Alter Editor = Referenz/Spec:** bei jedem Kapitel in den alten Editor
  (`C:\Users\mu.aycetin\Desktop\Projekte\Editor\react-app`) schauen, WAS ein
  Feature können muss — **Funktion übernehmen, NICHT das Aussehen** (UI/UX wird
  neu gemacht). Goldreferenz fürs Verhalten/Export = der alte Export.
- **Architektur nie opfern** (siehe `ARCHITEKTUR.md`).
- **Verifizieren nach jeder Änderung:** `npx tsc -b` und `npx eslint src`.
- **Prinzipien + Quellen (immer dranhalten):**
  - **DRY** — keine Wiederholung; Gemeinsames rausziehen.
  - **OOP / Vererbung vs. Composition** — Vererbung nur für echte „is-a"-Basis
    (LSP einhalten); Features per Composition. Quellen: refactoring.guru, MDN
    Classes, Lit-Docs.
  - **React** — Komponenten/Props, „Composition over Inheritance". Quelle: react.dev.
  - **Atomic Design** — atoms → molecules → organisms → templates. Quelle: Brad Frost.
  - **Page-Builder-Architektur** — Drag&Drop, serialisierbarer JSON-State.
    Quelle: craft.js.

## Roadmap (Strangler-Fig-Kapitel)

- ✅ **Kap. 0 — Fundament:** Block-Modell, Canvas, Verschieben (Drag, mit
  Transaktion = 1 Undo pro Geste), Inline-Edit (Doppelklick auf Block),
  Undo/Redo, localStorage-Persistenz.
- ✅ **Aufräumen:** Atomic-Design-Struktur etabliert (`ui/atoms` + `ui/molecules`);
  „Variante" aus ButtonBlock entfernt; Inspector-Felder bei Button/Text raus →
  stattdessen Inline-Edit.
- ✅ **Kap. 1 — Design-Grundlage:** Design-Tokens überarbeitet (Canvas = abgesetztes
  Hellgrau, Panels weiß, dezent sichtbare Borders); Inspector an die rahmenlose
  Sidebar-Struktur angeglichen (kein Box-in-Box mehr); shadcn formal eingerichtet
  (`components.json`, `@radix-ui/react-select`); natives `<select>` →
  Radix-/shadcn-Dropdown. Editor ist reines Hell-Design.
- ⚑ **Architektur-Schwenk (wichtig):** Editor nutzt jetzt ein **Container/Flow-
  Baum-Modell** (BlockNode mit `parentId`/`childIds`), **nicht** absolutes x/y.
  Grund: SoftEngine-Masken sind fließendes HTML (Container + Flexbox/Grid).
  Damit sind „Resize/Snap/Mehrfachauswahl" im absoluten Sinn hinfällig; der alte
  Editor ist dafür KEINE Referenz. Details: `ARCHITEKTUR.md` (Datenmodell).
- → **Kap. 2 (LÄUFT) — Container/Flow-Fundament:**
  - ✅ 2.1 Datenmodell auf Baum (BlockNode-Map + Wurzel, Migration alter Stände,
    Flow-Rendering im Canvas statt Koordinaten).
  - 2.2 ContainerBlock + rekursives Rendering (Slot/Light-DOM).
  - 2.3 Canvas: Drop-Zonen + Einfügen-in-Container + Reordering (Drag).
  - 2.4 Inspector: Flow-Props (direction/gap/padding, width fill/auto/fix).
- **Kap. 3 — mehr Basis-Blöcke** sauber portieren.
- **Kap. 4 — Daten-Anbindung:** IDB-Tabellen (z.B. Terminplaner) an Blöcke binden.
- **Kap. 5 — komplexe Blöcke:** Kanban, DetailCard, DataTable. Hier Atomic Design
  real ausbauen (Card = Organismus aus atoms/molecules).
- **Kap. 6 — Verknüpfungen** zwischen Blöcken (Auswahl/Filter, z.B. Kanban →
  DetailCard).
- **Kap. 7 — Events/Aktionen:** Klick→Popup, Drop→Relation usw.
- **Kap. 8 — 🌟 Export nach SoftEngine:** der Nordstern. Deterministischer
  Baum-Durchlauf → sauberes Flow-HTML. Maßgeblich ist, was **SoftEngine
  konsumiert**, NICHT der alte Editor (der ist das unwartbare Altsystem).
- **Kap. 9 — Umschalten:** alten Editor ablösen.

## Design-Richtung (für Kap. 1)

Hell: Basis weiß / hellgrau. ABER **kein „Weiß-Matsch"** — kein verwaschenes
Fast-Weiß, in dem alles ineinanderfließt. Stattdessen:
- **klare Kontraste** und **sichtbare Trennlinien** zwischen Sidebar / Canvas /
  Inspector
- **abgesetzte Flächen-Ebenen** (Canvas vs. Panels erkennbar unterschiedlich hell)
- **deutliche Rahmen** (keine 2%-Grau-Andeutungen, die man nicht sieht)
- Vibe: Figma / Linear — ruhig, aber mit klarer, gut lesbarer Struktur

## Stack

React 19, TypeScript, Vite, **Lit** (Web Components = die Blöcke), Tailwind +
shadcn-Stil (Editor-UI), eigener Store mit Observer-Pattern.

## Wichtige Stellen

- Architektur + Regeln: `ARCHITEKTUR.md`
- Store: `src/state/Editor.ts` (Observer: `src/state/Subject.ts`)
- Block-Basisklasse: `src/core/blocks/BasicBlock.ts` · Blöcke: `src/blocks/`
- Brücke React ↔ Web Component: `src/editor/canvas/BlockHost.tsx`
- Verifizieren: `npx tsc -b` + `npx eslint src`
