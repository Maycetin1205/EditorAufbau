# 2026-07-15 — Kanban-Schreibweg raus, SoftEngine-Schicht herausgezogen

Beide Entscheidungen stammen aus dem SE-Echttest-Feedback des Nutzers am
2026-07-15.

## Eingebauter Schreibweg ersatzlos entfernt (Nutzer-Entscheidung)

Vorher zog ein Karten-Drop automatisch ein Standard-PUT (Relation NR 174,
`putRelation` in der Runtime) nach und hängte die Karte lokal um. Das ist
ERSATZLOS raus:

- Ein Drop ist nur ein Auslöser — was passiert, bestimmt allein die
  sichtbare Aktionskette „Karte verschoben" (`onCardDrop`); die Karte
  bleibt liegen, der nächste Daten-Push entscheidet. Ein rein lokaler Zug
  wäre eine Täuschung (er verschwände beim nächsten Push).
- `putRelation` existiert nicht mehr; NR 174 ist nur noch eine löschbare
  Bibliotheks-Vorlage.
- „Einsortieren nach" (`statusField`) ist seitdem OPTIONAL: ohne Feld
  landen alle Zeilen in der Auffang- bzw. einer Auto-Spalte.

## SoftEngine-Schicht (Schicht-Umzug)

Alles Allgemeine wanderte aus der Kanban-Runtime nach `src/softengine/`:
`bridge.ts` (Anmeldung, Daten-Push, Diagnose, Abo-Punkt `onSeDaten`),
`data.ts` (getField/setField/rowsFor/Quellen), `relations.ts` (Vorlagen,
PUT/PUTADD, GET-Warteschlange). `src/blocks/kanban/seRuntime.ts` enthält
seitdem NUR noch Kanban (Zeilen → Karten, Spaltenwahl, Karten-Drag) und
hört als Zuhörer auf die Klingel der Brücke. Abhängigkeitsregel: Bausteine
importieren die Schicht — die Schicht kennt NIE einen Baustein.
