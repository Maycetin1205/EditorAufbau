# Billig-Atome — Text (mit Größe) + Trennlinie (Fahrplan Punkt 3)

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

⚠ UMGEPLANT (Nutzer-Entscheidungen 2026-07-21, ersetzen den ersten
Schnitt): EIN Text-Baustein statt zwei (Nutzer: „ich kann Text auch als
Überschrift nehmen, wenn Schriftgröße einstellbar ist") · die GRUPPE ist
GESTRICHEN (Nutzer versteht ihren Nutzen nicht → Regel 10, nichts auf
Verdacht; sie kommt erst wieder, wenn sie beim Popup-Bauen real vermisst
wird). Falls Text/Überschrift/Gruppe schon als getrennte Bausteine
gebaut wurden: konsolidieren bzw. RESTLOS entfernen (Definition,
Komponente, Icon-Eintrag, Bibliothek, Tests, Bündel neu).

⚠ 2. UMPLANUNG (Nutzer 2026-07-21, nach dem Bau umgesetzt im
Feinschliff-Pass): die Größen-AUSWAHL (Überschrift/Normal/Klein) unter
Punkt 1 ist ÜBERHOLT — „nicht per Auswahl: ich will entscheiden, wo es
liegt, wie viele Pixel groß, dünn, dick". Der Text-Baustein hat drei
freie Stil-Eigenschaften (groesse = Pixelzahl, gewicht = Dünn/Normal/
Fett, ausrichtung = Links/Mitte/Rechts) in EINER kompakten
Inspector-Zeile „Text-Stil". Stand + Details: CLAUDE.md, Fahrplan 3.

1. **Text** (`ff-text`, Kategorie ANZEIGE, EIN Bibliothekseintrag):
   zeigt statischen Text. Eigenschaften:
   - `text` (der Inhalt; Doppelklick am Ding editiert — Muster
     Schaltflächen-Beschriftung; Default „Text").
   - `groesse` (Auswahl, sichtbar im Inspector): „Überschrift"
     (groß + fett, Maßstab = Abschnitts-Titel der chef-maske) ·
     „Normal" (--se-fs) · „Klein" (Hinweistext, gedämpft wie
     --se-muted-Töne der Referenz). KEINE weiteren Einstellungen
     (Regel 10).
2. **Trennlinie** (`ff-trenner`, Kategorie LAYOUT): horizontale Linie
   in --se-line-Optik, volle Breite, fester dezenter Außenabstand.
   KEINE Eigenschaften (Regel 10 — erst wenn ein echter Fall mehr
   erzwingt).

## Beifang Bibliothek (Nutzer-Wunsch 2026-07-21, Editor-only)

Die Kategorien in der Bibliothek (LAYOUT / EINGABE / ANZEIGE) deutlicher
voneinander abtrennen: feine Trennlinie zwischen den Kategorie-Blöcken
(gleiches Muster wie die Trennlinien im Inspector), ggf. minimal mehr
Abstand — kein neuer Look, nur Ordnung. Reine Editor-UI.

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
   Text mit Escaping-Sonderzeichen + je Größe, Trennlinie).
   KEINE neuen e2e (statische Bausteine, Test-Bremse).
4. SE-Echttest: in die GEBÜNDELTE Warteschlange (Sichtprüfung der
   zwei Bausteine in einer echten Maske, zusammen mit dem offenen
   GET-Test — kein eigener Termin).

## e2e-Verträge (nicht brechen)

Bestehende zugängliche Namen unverändert (`Zeile`, `Schaltfläche`,
`Formularfeld`, `Datum`, `Kanban`, `Hauptseite`, `＋ Popup`,
`Als SoftEngine-Maske exportieren` …). Neue Bibliotheks-Namen exakt:
`Text`, `Trennlinie`. Falls ein bestehender Spec generisch über die
Bibliothek iteriert: prüfen, nicht raten.

## Prüfungen + Abschluss (Regel 9)

Volles Prüfbündel (tsc · eslint · check:runtime · vitest · playwright),
alles grün → EIN Commit (inkl. erneuertem Bündel + Referenzabzug).
KEINE Screenshots — der Nutzer prüft live. Abschlussbericht kurz mit
„Aufgefallen unterwegs". CLAUDE.md: Fahrplan Punkt 3 als gebaut
vermerken + Echttest-Warteschlange um die Sichtprüfung ergänzen.
Push nur nach Nutzer-Go.
