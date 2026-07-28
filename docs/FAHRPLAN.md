# Fahrplan & Stand

> Tagesordnung, kein Gesetz — **bei Widerspruch gewinnt CLAUDE.md.**
>
> Eingedampft am 2026-07-27 (Nutzer-Entscheidung): 342 → gut 100 Zeilen. Die
> Chronik „was wann gebaut wurde" ist ersatzlos gestrichen, ebenso die
> Planungsdateien in `docs/1-plans/` und das Neuschnitt-Archiv. Das stand
> dreifach da — git-Historie und `docs/2-changelog/` erzaehlen dasselbe, und
> keine der drei Fassungen hat je jemand gelesen.

## Jetzt

**Tabelle stabil machen.** Der Baustein steht und wurde aus dem Live-Test
nachgebessert (Inhaltssuche, Fusszeile auch im Editor, Tagesfilter, richtige
Datensatz-Anzeige, fluchtende Spaltentrenner). Offen: die volle Bedien-Abnahme
durch den Nutzer und der grosse SE-Echttest.

Daneben: **Bausteine verbinden**. Schritt 1 (mehrere Datenquellen je Baustein)
ist am 2026-07-28 gebaut (v0.3.0) und wartet auf Bedienabnahme + SE-Echttest;
Schritt 2 (Auswahl steuert) ist noch nicht geplant.

## Als Naechstes (Reihenfolge = Nutzer-Entscheidung)

1. **Bausteine verbinden** — Schritte 1 bis 3, s. eigener Abschnitt unten.
   Deckt die frueheren Punkte „Verknuepfte Quellen Paket 3 + 4" und
   „Zeilen-Auswahl / Nachschlagen" zusammen ab; Zuschnitt am 2026-07-28 auf
   Nutzer-Ansage geaendert. SE-Echttest faellig, sobald die Laufzeit drankommt.
2. **Optik-Feinschliff des Editors** — die Farbrichtung ist neu gesetzt
   (warmes Papier statt kaltem Grau, 2026-07-27); der Rest ist offen.
3. **Wizard** — mehrstufige Maske. Zuschnitt offen, braucht einen eigenen Plan;
   Fragen erst, wenn er dran ist.
4. **Kommentar-Diaet** — rund 900 Zeilen tote Kapitel-/Paket-Verweise im Code.
5. README · CI · Fehlerbild.
6. Meilenstein: **Demo beim Chef** mit einer echten Maske.

**Geparkt** (nicht ohne neue Entscheidung anfassen): Relations-Vertiefung ·
Mehr-Quellen-Ausbau · Feld-Extras (Pflichtfeld/Pruefung/Standardwert/Hilfetext,
zurueckgestuft 2026-07-23) · Schritt-Arten-Registry (nur mit eigenem Plan +
Doppel-Review) · App-Ausbau: mehrere Masken, Server-Speicherung, Login, Rechte,
Ein-Bearbeiter-Sperre, Versionsstaende.

## Bausteine verbinden — die Faelle des Nutzers

> **Diese Liste ist die Anforderung, nicht der Plan.** Sie steht hier, damit
> kein Fall verlorengeht, waehrend gebaut wird. Faellt dem Nutzer ein weiterer
> ein: hier eintragen, egal wie unfertig formuliert. Aufgenommen 2026-07-28 aus
> seinen eigenen Beispielen.

**Die gemeinsame Zutat aller Faelle** ist die Schluesselregel: „welches Feld
hier entspricht welchem Feld dort" (Adressnummer = Adressnummer). Modell dafuer
steht seit 2026-07-25 (`SchluesselPaar` in `core/data/sourceLinks`) und ist seit
2026-07-28 erstmals angeschlossen — an den Bausteinen, nicht an der Bibliothek.

| | Fall (Worte des Nutzers) | Art | Stand |
|---|---|---|---|
| F1 | „2 Datenquellen in einer Karte, dauerhaft" — Termin oben, Rasse/Notiz aus Kundenhaustieren darunter, ohne Klick | Quellen-Liste am Baustein | **gebaut 2026-07-28** (v0.3.0), Abnahme offen |
| F2 | Tabelle auf Terminplaner, eine Spalte zeigt `Notiz` aus Kundenhaustieren | Quellen-Liste am Baustein | **gebaut 2026-07-28** (v0.3.0), Abnahme offen |
| F3 | „Tabelle klicke ich eine Zeile an, zweite Tabelle zeigt dann die Selektion; wenn nichts angeklickt, zeigt er alle" | Auswahl steuert | offen, Schritt 2 |
| F4 | Tageswaehler filtert Tabelle/Kanban | Auswahl steuert | **laeuft** — aber als einzige, fest verdrahtete Leitung (`blocks/shared/gewaehlterTag.ts`); geht in Schritt 2 auf |
| F5 | Lookup („ganz wichtig"): Formularfeld → Enter → Popup mit Tabelle → Zeile waehlen → Wert landet im Feld | Auswahl steuert + Popup + schreiben | offen, Schritt 3 |
| F6 | Ziel ist nicht immer der ganze Baustein, sondern ein **Bereich darin** (Kanban-Spalte, Tabellenspalte, Stelle auf der Karte) | gilt quer ueber F1–F5 | offen |

**Nicht geklaert — beim Planen von Schritt 2 vorlegen:** Kann ein Baustein
gleichzeitig Sender UND Empfaenger sein (Tabelle 1 → Tabelle 2 → Karte)? ·
Mehrere Empfaenger an einem Sender? · Einfach- oder Doppelklick? · Bleibt die
angeklickte Zeile sichtbar markiert? · Wirkt eine Auswahl ueber Seiten-/
Popup-Grenzen hinweg?

### Reihenfolge (Nutzer-Entscheidung 2026-07-28)

1. ~~**Quellen-Liste am Baustein** (F1, F2)~~ — **fertig 2026-07-28, v0.3.0.**
   Liste im Inspector („+ Datenquelle"), Gruppen im Feld-Picker, Partnerzeile
   zur Laufzeit, beide Quellen in der SEFILELOOP. Offen: Bedienabnahme +
   SE-Echttest durch den Nutzer; Changelog `docs/2-changelog/w1_v0.3.0.md`.
2. **Auswahl steuert** (F3, F4) — ein Baustein gibt die angeklickte Zeile ab,
   andere richten sich danach; F4 wird davon ein Fall statt einer Sonderleitung.
3. **Lookup** (F5) — Verkettung dessen, was dann steht.

### Kurskorrektur 2026-07-28 — Verknuepfung raus aus der Kommandozentrale

Paket 1 + 2 legten die Verknuepfung als eigene Bibliothek in der
Kommandozentrale ab (`VerknuepfungBereich`, `SourceLinkStore`). **Der Nutzer hat
das verworfen:** „allgemeine Verknuepfung ergibt keinen Sinn". Eine Regel, die
irgendwo in einer Bibliothek liegt und vielleicht jemanden betrifft, sieht er
nicht und findet er nicht wieder — Regel 7, Bedienung am Ding.

Der Bereich fliegt raus, die Regel zieht an den Baustein. **Kosten gering:** kein
Produktivcode ruft `findLink` je auf, es wird also nichts Laufendes eingerissen.
Das Datenmodell (`SchluesselPaar`, 3 Paare, UND-verknuepft) bleibt und wandert
in die Baustein-Eigenschaften.

**Stand 2026-07-28:** die neue Haelfte steht (v0.3.0). Der alte Bereich in der
Kommandozentrale steht auf Nutzer-Ansage („darum kuemmern wir uns nachher")
NOCH da — unbenutzt wie zuvor. Zu entfernen sind dann `VerknuepfungBereich`,
`SourceLinkStore`/`useSourceLinks`, `SourceLink`+`findLink`+`paareAusSicht` in
`core/data/sourceLinks.ts` und der `verknuepfungen`-Abschnitt der Maskendatei
(Dateiversion!). `SchluesselPaar` + `vollstaendigePaare` BLEIBEN — sie tragen
die neue Haelfte.

Zwei Festlegungen des Nutzers (2026-07-25) gelten weiter, **nicht ohne
Rueckfrage aendern**:

1. **Hoechstens 3 Schluesselfelder** je Verknuepfung, UND-verknuepft
   („Kunde *und* Jahr"). Mehr waere Theorie ohne echten Fall (Regel 10).
2. **Kein Partner gefunden → kein Wert.** Das Feld bleibt leer, die Zeile
   bleibt stehen. Sie verschwindet NICHT: verschwundene Zeilen waeren
   unsichtbarer Datenverlust — der Bediener saehe 240 statt 250 Saetze und
   merkte nie, dass zehn fehlen. Ein leeres Feld sieht er.

Dazu neu: **nur EINE Stufe.** Die Zusatzquelle verbindet zur Hauptquelle des
Bausteins, nie zu einer anderen Zusatzquelle. Kein „Terminplaner → Haustier →
Besitzer → Ort" — mehrstufige Ketten waeren zur Laufzeit ein Nachschlage-Baum,
dessen Kosten in SoftEngine niemand belegt hat (Regel 10).

Als Ideengeber liegt ein verworfener Torso bereit:
`docs/decisions/2026-07-24-verknuepfte-quellen-torso.patch` (440 Zeilen; enthaelt
qualifizierte Bindung, Wert-Aufloeser, Zusammenfuehren ueber 1–3 Schluesselpaare,
`window.FF_SOURCE_LINKS`, Preflight-Sperre). **Nicht ungeprueft uebernehmen** —
lesen, dann mit eigenem Plan neu bauen.

## Feste Zusagen (gelten weiter, stehen nur hier)

- **Kein offener SE-Kontrakt.** Alle Kern-Wege sind am echten System belegt
  (zuletzt 2026-07-22: GET-Weg, „Ergebnis von Schritt N", Anlegen ueber zwei
  Quellen gleichzeitig). Merksatz aus dem Fehlversuch — **„Dreier-Regel":
  Wert, Position und Laenge sind dreimal dasselbe Feld;** nur die Satz-Stelle
  kommt aus Schritt 1.
- **Geschrieben wird nur ueber sichtbare Ketten** — kein Auto-PUT. Gelesen
  wird automatisch aus der ERSTEN Zeile der Quelle.
- **Kanban:** „Einsortieren nach" ist optional (ohne Feld landen alle Zeilen in
  der Auffang-Spalte); ein Drop fuehrt NUR die sichtbare Kette
  „Karte verschoben" aus, einen eingebauten Schreibweg gibt es nicht.
- **Ankreuzfeld bleibt unbindbar**, bis der SE-Wert-Kontrakt (J/N? 1/0?) an
  einer echten Maske belegt ist.
- **Restlos entfernt — nicht ohne neue Entscheidung wieder einbauen:**
  „Quelle speichern" samt Aenderungs-Spur · „Neuen Satz anlegen"/CREATE_RECORD ·
  Projektkarte/project-map · dashboard-Klickmodelle (alle Nutzer 2026-07-20) ·
  der Baustein-Baum (Nutzer 2026-07-21).
- **Abnahme laeuft live — und zwar durch den Nutzer** (Ansage 2026-07-28):
  Browser-Bedienpruefung UND SE-Echttest macht er selbst. Der bauende Agent
  startet keinen Dev-Server und klickt nicht im Preview; er liefert das
  Pruefbuendel plus eine kurze Klickanleitung und sagt, was er nicht pruefen
  konnte. Keine Screenshot-Galerien.
- **Codex ist wieder verfuegbar** (2026-07-27) — die TRIP-/codex-Skills in
  `.claude/skills/` werden im naechsten Paket real eingesetzt statt weiter
  ungenutzt zu liegen.

## Merkliste

Tabellen-Spalten aus verschiedenen Quellen · bausteinuebergreifende Selektion ·
pflegbare Wert→Bild-Zuordnung fuer den Karten-Avatar (installations-individuell;
bis dahin gilt die eingebaute Empfang-Liste in `src/blocks/card/tierIcon.ts`) ·
Spaltenbreiten der Tabelle in der Maske dauerhaft merken · Sortierung wie
Windows (Zahl/Datum/ABC) · Seiten-Leiste als kompakte Aufklappliste, falls viele
Popups je Maske real werden · Vorlagen-Ablage: gespeicherte Popups/Baustein-
Gruppen wiederverwenden (Nutzer-Idee 2026-07-21, Ort offen) · Markup-Bauen (nodeToHtml/styleAttr) aus exportMask
herausziehen · Export wirft unbekannte Props still weg (Preflight-Meldung fehlt) ·
Masken-Titel fest „Maske" ·
Kassensturz „tote Exporte": ein Werkzeuglauf (knip, 2026-07-28) meldete rund
zwoelf `export`-Symbole ohne Importeur — mindestens zwei Treffer waren aber
falsch (`RASTER_FALLBACK`, `sanitizeTree` werden benutzt). Vor dem Aufraeumen
Treffer fuer Treffer pruefen, sonst loescht man Benutztes ·
Editor-UI-Testabdeckung duenn — auch Migrationen/Undo/SE-Datenschicht ohne eigene
Tests, und `relations.test.ts` testet nur das Modell, nicht die gleichnamige
Laufzeit-Datei (Nachzieh-Paket ~½ Tag, kein Export) · doppelter Schluessel-Scan
in `softengine/data.ts` (getField/setField) · Feld-uebernehmen fuer Stammtabellen
(ADR/ART/BEL) wartet auf belegten Stamm-PUT-Kontrakt · Formularfeld-Option
„startet leer" fuer Anlege-Masken (Kontrakt seit 2026-07-22 belegt,
Nutzer-Bedenken notiert) · Steuerung zeigt Vorlagen-Parameter nur als „Fester
Wert" ohne den Wert selbst · Preflight warnt nicht, wenn eine Kette ein Datenfeld
liest, das kein Baustein der Maske pflegt.
