# 2026-07-14 — Kahlschlag der Bausteine (Nutzer-Entscheidung)

**Entscheidung:** Text, Bereich (Container), Infobox, Status-Chip (Badge)
und Eingabefeld (FormField) werden KOMPLETT entfernt — sie hatten für das
Ziel (Empfang-Board in SoftEngine) keine Funktion. Es bleibt, was
funktioniert: Kanban (+ Spalte/Karte) und Schaltfläche. Neue Bausteine
erst, wenn eine echte Maske sie erzwingt (Architektur-Regel 10).

**Folgen im Code (Stand der Entscheidung):**

- `src/blocks/register.ts` importiert nur noch die verbliebenen Bausteine;
  der Veralten-Wächter in `src/export/export.test.ts` blockt ein
  Runtime-Bündel, das die abgeschafften Tags (`ff-text`, `ff-container`,
  `ff-infobox`, `ff-badge`, `ff-formfield`) noch trägt.
- **Zeile** (`src/blocks/zeile/ZeileBlock.ts`) entstand am selben Tag als
  schlanker Ersatz für den abgeschafften Allzweck-„Bereich": kann genau
  EINE Sache — Bausteine nebeneinander (Nutzer-Auftrag 2026-07-14).
- **Formularfeld** (`src/blocks/formfeld/FormFeldBlock.ts`) ist ein NEUBAU
  nach der echten behandlung-Referenz (v1 statisch; SoftEngine-Logik folgte
  als eigene Pakete, Fahrplan-Schritt 4). Nutzer-Korrektur 2026-07-14:
  KEIN Label über dem Feld — der Text steht IM Feld (Platzhalter bzw.
  Ankreuzfeld-Beschriftung).
- `jaNeinProperty` (`src/blocks/shared/jaNeinProperty.ts`) entstand
  ursprünglich im FormField und wurde in B2 nach shared gezogen; seit dem
  Kahlschlag ist die Kanban-Spalte (Auffangspalte) der Nutzer.
- `statusVariant` (`src/blocks/shared/statusVariant.ts`) verlor mit
  Infobox + Status-Chip zwei Nutzer; es bleiben Karte (Chip) und
  Kanban-Spalte.
- Die Breite hat seit 2026-07-14 KEIN Inspector-Feld mehr (Nutzer-Anweisung
  + Bedienlogik 6): Breite wird am Anfasser gezogen, Doppelklick =
  Block-Standard (`src/editor/canvas/BlockHost.tsx`).
