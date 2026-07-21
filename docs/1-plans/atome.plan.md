# Billig-Atome — Text/Überschrift, Trennlinie, Gruppe (Fahrplan Punkt 3)

> Plan von Fable (2026-07-21) für die ausführende Sitzung (Opus).
> R1–R3 sind abgeschlossen und LIVE abgenommen. CLAUDE.md gilt; bei
> Widerspruch gewinnt CLAUDE.md bzw. der Nutzer. **Start erst nach
> Nutzer-„go".** Referenz-Wahrheit für die Masken-Optik:
> `docs/chef-maske/` (empfang + behandlung) + `src/design/masken-tokens.css`.

## Auftrag

Drei neue STATISCHE Bausteine (Masken-Welt, laufen im Editor UND im
Export — Regel 1). Keine Datenbindung, keine Ereignisse, keine
Anfasser-Sonderlocken. Fachlich trivial, aber sie berühren den Export
(Runtime-Bündel wächst) — Verfahren s. unten.

1. **Text** (`ff-text`): zeigt statischen Text. EINE Web Component,
   ZWEI Bibliothekseinträge über zwei BlockDefinitions mit
   vorbelegter Art-Eigenschaft:
   - „Überschrift" (Kategorie ANZEIGE): größer/fett — Maßstab sind die
     Abschnitts-Titel der chef-maske (h2/h3-Klasse, --se-ink).
   - „Text" (Kategorie ANZEIGE): normaler Fließtext (--se-fs).
   Eigenschaften: `text` (der Inhalt; Doppelklick am Ding editiert —
   Muster Schaltflächen-Beschriftung), `art` (ueberschrift | text,
   hiddenInInspector wenn per Definition fest? → NEIN: sichtbar als
   Auswahl, damit man umschalten kann). Default-Texte: „Überschrift"
   bzw. „Text" (Platzhalter-Charakter, sofort editierbar).
2. **Trennlinie** (`ff-trenner`, Kategorie LAYOUT): horizontale Linie
   in --se-line-Optik, volle Breite, fester dezenter Außenabstand.
   KEINE Eigenschaften (Regel 10 — erst wenn ein echter Fall mehr
   erzwingt).
3. **Gruppe** (`ff-gruppe`, Kategorie LAYOUT): Container mit
   Karten-Optik (Fläche --se-surface, Rahmen --se-line, kleiner
   Radius wie die Masken-Welt ihn kennt) und OPTIONALEM Titel
   (leer = keine Titelzeile, LEER-Regel wie bei der Karte).
   `allowedChildTypes` wie die Zeile (alle Nicht-Seiten-Bausteine),
   Kinder fließen als Spalte. Titel per Doppelklick am Ding.
   ⚠ Bedienung: KEINE neue Drop-Logik bauen — der Canvas behandelt
   Container GENERISCH über die Registry (Beweis: Zeile). Mitte =
   hinein ans Ende, Randzone = davor/dahinter, Einfüge-Linie als
   Vorschau, nie-in-sich-selbst — alles vorhanden. Die Gruppe
   deklariert nur ihre Fähigkeiten; leer verhält sie sich exakt wie
   eine leere Zeile heute (gleiche Editor-Hilfen, nichts Neues).
   Wird an irgendeiner Stelle doch eigene Drop-/Sonderlogik nötig →
   STOPPEN und Fable/Nutzer fragen, nicht erfinden.

## Regeln (verbindlich)

- Alles Registry (Regel 2): keine `if typ === …`-Stellen in Canvas/
  Inspector/Export. Icons: Editor-Tabelle `blockIcons.ts` ergänzen.
- Masken-Optik NUR über vorhandene `--se-*`-Tokens — masken-tokens.css
  möglichst NICHT anfassen; falls doch zwingend (fehlender Token),
  im Bericht begründen.
- Editor-Hilfen (Auswahl, Doppelklick-Editier-Overlay) leben im
  BlockHost/Editor — NIE in der Komponente (Regel 1).
- Der Editor erfindet keine Daten (Regel 7): die Default-Texte sind
  Nutzer-Inhalt zum Überschreiben, keine Demo-Daten-Simulation.

## Export-Verfahren (dieses Paket berührt den Export — geplant!)

1. Komponenten bauen → `npm run build:runtime` (Bündel wächst —
   ABSICHTLICH; `check:runtime` ist danach wieder grün).
2. Referenzabzug erneuern (`npx vitest run -u`) — der Datei-Diff im
   Commit macht die Bündel-Änderung sichtbar (das ist das dokumentierte
   Verfahren aus Regel 9 für absichtliche Export-Änderungen).
3. `export.test` um je EINEN Fall je Baustein erweitern (HTML-Form:
   Text mit Escaping-Sonderzeichen!, Trennlinie, Gruppe mit/ohne Titel).
   KEINE neuen e2e (statische Bausteine, Test-Bremse).
4. SE-Echttest: in die GEBÜNDELTE Warteschlange (Sichtprüfung der
   drei Bausteine in einer echten Maske, zusammen mit dem offenen
   GET-Test — kein eigener Termin).

## e2e-Verträge (nicht brechen)

Bestehende zugängliche Namen unverändert (`Zeile`, `Schaltfläche`,
`Formularfeld`, `Datum`, `Kanban`, `Hauptseite`, `＋ Popup`,
`Als SoftEngine-Maske exportieren` …). Neue Bibliotheks-Namen exakt:
`Überschrift`, `Text`, `Trennlinie`, `Gruppe`. Falls ein bestehender
Spec generisch über die Bibliothek iteriert: prüfen, nicht raten.

## Prüfungen + Abschluss (Regel 9)

Volles Prüfbündel (tsc · eslint · check:runtime · vitest · playwright),
alles grün → EIN Commit (inkl. erneuertem Bündel + Referenzabzug).
KEINE Screenshots — der Nutzer prüft live. Abschlussbericht kurz mit
„Aufgefallen unterwegs". CLAUDE.md: Fahrplan Punkt 3 als gebaut
vermerken + Echttest-Warteschlange um die Sichtprüfung ergänzen.
Push nur nach Nutzer-Go.
