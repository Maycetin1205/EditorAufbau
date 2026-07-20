# SoftEngine-Wiki (unser eigenes)

Gesammeltes SE-Wissen aus **Originalquellen** (offizielles SE-Wiki, echte
Masken, bestätigte Echttests) — damit wir SE-Kontrakte nachschlagen können,
statt sie zu raten. Deckt sich mit **Regel 5** des Projektgedächtnisses:
„SE-Kontrakte nur aus Originalquellen, nie geraten."

> Jede Seite nennt ihre Quelle (Wiki-Beitragsnummer + Stand, oder „Echttest
> Datum"). Wo ein Kontrakt nur vermutet ist, steht das ausdrücklich dabei.

## Die zwei SoftEngine-Wege (wichtig, nicht verwechseln)

SoftEngine liefert HTML-Masken auf **zwei verschiedene Arten** aus. Sie
sehen ähnlich aus, sind aber technisch grundverschieden:

| | **1. Server-Parser (klassisch)** | **2. JS-Bridge / Push (modern)** |
|---|---|---|
| Wie Werte reinkommen | SE ersetzt `<!--SOFTENGINE-VAR!…-->`-Kommentare **vor** der Auslieferung | `basisHTML_REGISTER` + Callbacks; SE **schiebt** die Daten per JS nach |
| Richtung | nur **Lesen/Anzeigen** (einweg) | **Lesen UND Schreiben** (PUT_RELATION), interaktiv |
| Aktualisierung | beim Laden fest eingebacken | live bei jedem Daten-Push |
| Wo eingesetzt | MIS-Infosysteme / Landingpages (`VORLAGEN_INDIV\MIS\LANDINGPAGES\…`) | WEBWARE/basisHTML-Masken |
| **Unser Editor** | dokumentiert, aber **nicht** unser Export-Weg | **das ist unser Weg** |

Der Editor exportiert `index.basis.source.html` + `index.basis.SEvariablen.json`
und arbeitet über **Weg 2**. Das SE-Wiki nennt Weg 2 selbst die „moderne
Variante mittels JSON". Warum wir bei Weg 2 bleiben und wann Weg 1 trotzdem
einfacher wäre → siehe unten in [parser-direktiven.md](parser-direktiven.md#was-das-fuer-uns-bedeutet).

**Innerhalb von Weg 2** liefert SE außerdem **fertige UI-Module** (SETabelle,
SEFeldListe, SEInfoBox, ButtonBar, Chart, Liste) — client-seitige Custom-Tags
mit JS-API, angebunden per `InitialisiereSchnittstelle()`. Das ist eine echte
Alternative zu unseren eigenen Web Components (v. a. beim Thema Tabelle) →
[html-editor-module.md](html-editor-module.md#was-das-fuer-uns-bedeutet).

## Artikel

- [parser-direktiven.md](parser-direktiven.md) — die HTML-/JS-Kommentar-Direktiven
  des Server-Parsers (Beitrag #34712): SOFTENGINE-VAR, -BLOCK, -LOOP, -LINK,
  DATUM, TRIM, CONCAT, FILE_DREHEN, STATKENNZAHL, GET_REFRESH, NUMFORMAT.
- [html-editor-module.md](html-editor-module.md) — SEs fertige client-seitige
  UI-Module (Beiträge #35275, #36474, #34931): Datenbasis-Lebenszyklus
  (InitialisiereDatenBasis / ResetDataBasis), SEInfoBox, SEFeldListe;
  erwähnt SETabelle, ButtonBar, Chart, Liste.
- [muster-satz-anlegen.md](muster-satz-anlegen.md) — Originalquelle
  SE-Ausführungslog (Nutzer, 2026-07-17): Satz anlegen = GET „neuer Index"
  → ein PUT je Feld (auch leere!) → Querverweis-PUT; mehrere
  Index-Zwischenspeicher gleichzeitig in Gebrauch.

## Neue Seite anlegen

1. Datei `docs/softengine-wiki/<thema>.md` schreiben.
2. Oben die **Quelle** nennen (Beitragsnummer + Stand, oder Echttest-Datum).
3. Klar trennen: **belegt** (Originalquelle/Echttest) vs. **vermutet**.
4. Hier unter „Artikel" verlinken.
