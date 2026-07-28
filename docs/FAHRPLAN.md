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

Daneben laufend: **Verknuepfte Quellen**, Paket 3 von 4.

## Als Naechstes (Reihenfolge = Nutzer-Entscheidung)

1. **Verknuepfte Quellen** Paket 3 + 4 — ab Paket 3 ist ein SE-Echttest faellig.
2. **Zeilen-Auswahl / Nachschlagen** — die markierte Zeile als Parameterquelle,
   dazu der vom Nutzer benannte Lookup-Fall („ganz wichtig"): Formularfeld
   anklicken → Enter → Popup mit Tabelle oeffnet sich → Bediener waehlt eine
   Zeile → der gewollte Wert landet im Feld. Setzt die fertige Tabelle voraus.
3. **Optik-Feinschliff des Editors** — die Farbrichtung ist neu gesetzt
   (warmes Papier statt kaltem Grau, 2026-07-27); der Rest ist offen.
4. **Wizard** — mehrstufige Maske. Zuschnitt offen, braucht einen eigenen Plan;
   Fragen erst, wenn er dran ist.
5. **Kommentar-Diaet** — rund 900 Zeilen tote Kapitel-/Paket-Verweise im Code.
6. README · CI · Fehlerbild.
7. Meilenstein: **Demo beim Chef** mit einer echten Maske.

**Geparkt** (nicht ohne neue Entscheidung anfassen): Relations-Vertiefung ·
Mehr-Quellen-Ausbau · Feld-Extras (Pflichtfeld/Pruefung/Standardwert/Hilfetext,
zurueckgestuft 2026-07-23) · Schritt-Arten-Registry (nur mit eigenem Plan +
Doppel-Review) · App-Ausbau: mehrere Masken, Server-Speicherung, Login, Rechte,
Ein-Bearbeiter-Sperre, Versionsstaende.

## Verknuepfte Quellen — die vier Pakete

Zwei Festlegungen des Nutzers (2026-07-25), **nicht ohne Rueckfrage aendern**:

1. **Hoechstens 3 Schluesselfelder** je Verknuepfung, UND-verknuepft
   („Kunde *und* Jahr"). Mehr waere Theorie ohne echten Fall (Regel 10).
2. **Kein Partner gefunden → kein Wert.** Das Feld bleibt leer, die Zeile
   bleibt stehen. Sie verschwindet NICHT: verschwundene Zeilen waeren
   unsichtbarer Datenverlust — der Bediener saehe 240 statt 250 Saetze und
   merkte nie, dass zehn fehlen. Ein leeres Feld sieht er.

| | Was | Export beruehrt? | Stand |
|---|---|---|---|
| 1 | Modell + Bestand (`core/data/sourceLinks`, `state/SourceLinkStore`) | nein | fertig 2026-07-25 |
| 2 | Bereich in der Steuerung: anlegen und pflegen | nein | fertig 2026-07-27 |
| 3 | Bindung mit Quellenangabe (`quelleId::feldcode`), an EINER Stelle | ja | offen |
| 4 | Laufzeit-Aufloeser + Export (`FF_SOURCE_LINKS`) + Preflight | ja | offen |

Als Ideengeber fuer Paket 3 + 4 liegt ein verworfener Torso bereit:
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
