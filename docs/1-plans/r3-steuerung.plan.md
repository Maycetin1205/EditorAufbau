# R3 — Aktions-Ketten an den Baustein; Steuerung wird schlankes Verwaltungsfenster

> Plan von Fable (2026-07-21) für die ausführende Sitzung. R1 + R2 sind
> abgenommen und gepusht (`0b62eea`, `86b53f9`) — der bestehende Code IST
> die Stil-Referenz. CLAUDE.md gilt; bei Widerspruch gewinnt CLAUDE.md
> bzw. der Nutzer. **Start erst nach Nutzer-„go".**

## Zuschnitt (korrigiert, Nutzer-Entscheidung 2026-07-21)

Die Steuerung stirbt NICHT. Es zieht NUR die Ketten-Bedienung um:

1. **Inspector-Abschnitt „Aktionen"** — erscheint nach Inhalt/Daten, NUR
   für Bausteine, die per Registry Ereignisse deklarieren (`blockEvents`
   — kein `if typ === …`). Je Ereignis eine kompakte Liste seiner
   Schritte (Anzeige-Wortlaut wie heute: SE-Fachbegriffe sind die Namen,
   „Popup öffnen — <Name>" usw.), „+ Schritt", Bearbeiten/Löschen wie
   heute. Bearbeiten öffnet die VORHANDENE FormularKarte/StepForm als
   aufklappende Karte in voller Panelbreite (Escape-Schichtung erhalten).
2. **StepForm/FormularKarte wiederverwenden:** EINE gemeinsame
   Implementierung (bei Bedarf Datei-Umzug aus `zentrale/` an einen
   gemeinsamen Ort). Verhalten, Felder, Reihenfolge, Klarnamen, Regeln
   (START_TOOL nur Nummer!) — UNVERÄNDERT. Nichts neu erfinden.
3. **Zentrale:** Bereich „Aktionen" (`AktionenBereich.tsx`) entfällt
   restlos — die Bedienung wohnt jetzt am Baustein. Bereiche
   **Datenquellen | Relationen bleiben** mit unverändertem Verhalten
   (Master-Detail, Inline-Bearbeiten, „Verwendung in dieser Maske");
   Optik auf die R1/R2-Skala ziehen (dicht, Tooltips statt ⓘ, gemeinsame
   Label-Stelle — dabei Opus' R2-Hinweis „11-px-Labels wirken in der
   Steuerung mit" sauber auflösen). Der Toolbar-Knopf „Steuerung" bleibt.

## Design-Kontrakt

Wie R1/R2 (verbindlich): Inter, EIN kleiner Radius, 24–28-px-Dichte,
11–13-px-Schrift, keine Abschnitts-Überschriften-Orgien, kein „ⓘ",
Farb-/Token-Disziplin, keine verschwendete Fläche.

## Harte Verbote

- **Datenmodell der Ketten bleibt EXAKT gleich** — es zieht nur
  Bedien-Oberfläche um. NICHTS anfassen in `src/blocks/`, `src/core/`,
  `src/export/`, `src/softengine/`, `src/design/masken-tokens.css`.
  `check:runtime` muss „Bündel identisch" melden, Referenzabzug grün.
- **KEINE Testdatei anfassen, keine neuen e2e** (Test-Bremse). Geprüft
  2026-07-21: Die Wächter bauen Ketten per HTML-Injektion
  (`data-ff-aktionen`), NICHT über die Steuerungs-UI — der Umzug braucht
  null Spec-Änderungen. Sollte wider Erwarten doch ein Spec an der alten
  UI hängen: STOPPEN und den Nutzer fragen, nicht selbst entscheiden.
- e2e-Verträge erhalten (wie R2-Plan): Bibliotheks-Namen exact,
  Inspector-Kopf-Überschriften, `Daten anschließen…`-Fluss, Gruppen
  `Datenquelle`/`Einsortieren nach`/`Feld`, Top-Bar-Namen.

## Offene Detailfrage (im Bau entscheiden, Maßstab: kein Gequetsche)

StepForm in der 340-px-Inspector-Spalte: erst als aufklappende Karte in
voller Panelbreite versuchen; wird es zu eng, darf die FormularKarte das
Panel ÜBERLAGERN (Karte am Panel) — aber NIE ein neuer
Vollbild-Weltwechsel.

## Prüfungen + Abschluss (Regel 9)

`npx tsc -b` → `npx eslint src` → `npm run check:runtime` („Bündel
identisch", sonst stoppen) → `npm test` → `npx playwright test`. Alles
grün → EIN Commit. **KEINE Screenshots/Galerien** — der Nutzer prüft
live im Browser; Beweis = Prüfbündel in Textform. Abschlussbericht mit
„Aufgefallen unterwegs". CLAUDE.md nachziehen (R3 als gebaut vermerken).
Push nur nach Nutzer-Go.
