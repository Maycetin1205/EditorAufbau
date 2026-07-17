# SE HTML-Editor-Module (fertige UI-Bausteine, client-seitig)

> **Quellen:** SE-Wiki, Beiträge **#35275** „Initialisierung Datenbasis"
> (19.05.2022, Julian Winter), **#36474** „SEInfoBox" (15.09.2022, geändert
> 28.09.2022), **#34931** „SEFeldliste" (12.05.2022, geändert 27.07.2022).
> Sichtbarkeit: Verfahrensdokumentation / SE Partner (#36474/#34931 auch
> Service Plus 3). Wörtlich übernommen und strukturiert.

> **Welcher Weg ist das?** **Weg 2** (client-seitig, siehe
> [Wiki-Index](README.md)) — aber nicht unsere eigenen Web Components,
> sondern **SoftEngines eigene, fertige UI-Module**. Man baut ein
> Custom-HTML-Tag ein (`<SEInfoBox>`, `<SEFeldListe>`, …) und füttert es per
> JavaScript-API mit Daten. Die Anbindung an die SE-Daten läuft über eine
> **Schnittstelle** (`InitialisiereSchnittstelle()`) und ist SEDATA-basiert.

## Welche Module gibt es

Module mit eigener Datenbasis (laut #35275):

- **Tabelle** (`SETabelle`)
- **Feldliste** (`SEFeldListe`) → [Abschnitt](#sefeldliste-34931)
- **ButtonBar**
- **Chart**
- **InfoBox** (`SEInfoBox`) → [Abschnitt](#seinfobox-36474)
- **Liste**

---

## Der gemeinsame Lebenszyklus (#35275)

Jedes Modul wird nach demselben Muster benutzt:

1. **Custom-Tag ins HTML** einbauen — Groß-/Kleinschreibung **exakt**, mit
   eindeutiger **ID**.
2. **Schnittstelle** anmelden: `InitialisiereSchnittstelle()` (verbindet das
   Modul mit den SE-Daten).
3. **Datenbasis initialisieren:** `InitialisiereDatenBasis()` — nimmt die IDs
   **aller zum Aufruf-Zeitpunkt vorhandenen** Modul-Tags und initialisiert sie.
   - Jedes Modul hat auch eine eigene `Set<ModulName>DatenBasis`, die ein
     Array von Tag-IDs annimmt. `InitialisiereDatenBasis()` ist die globale
     Vereinfachung darüber.
   - ⚠ **Wichtig:** Werden Tags **nach** dem Aufruf per
     `document.createElement()` erzeugt, muss `InitialisiereDatenBasis()`
     **erneut** aufgerufen werden.
4. **Daten setzen** (modulspezifisch, s. u.).
5. **Einstellungen** setzen (modulspezifisch).
6. **Erzeugen:** `Create<ModulName>()` zeichnet das Modul.

### Daten zurücksetzen

Ändern sich Daten zur Laufzeit, müssen sie **vorher** zurückgesetzt werden:

- **`ResetDataBasis()`** — ohne Parameter: setzt **alle** Module mit
  Datenbasis zurück. Mit Array von **Modul-Arten** nur diese:
  `["tabelle", "feld", "buttonbar", "chart", "infobox", "liste"]`.
- **`ResetDataBasisSpeziell([IDs])`** — Array aus **Tag-IDs**: setzt gezielt
  einzelne Modul-**Instanzen** zurück (auch mehrere verschiedene gleichzeitig),
  nicht alle Module einer Art.

---

## SEInfoBox (#36474)

Stellt gezielt Informationen dar.

**1. HTML:** Custom-Tag `<SEInfoBox>` mit **ID**, Schreibweise exakt.

**2. Init:** `InitialisiereSchnittstelle()`, dann `InitialisiereDatenBasis()`
vor dem Setzen der Daten. `ResetDataBasisSpeziell()` davor stellt sicher, dass
die Datenstruktur bei erneutem Aufruf zurückgesetzt ist (keine Überschneidungen).

**3. Daten:** erst in benannten Variablen sammeln, dann hinzufügen:
```js
InfoBox.AddInfoBoxDatenZeile(ID, Daten)
// Daten = [["Überschrift 1", "Information1"], …, ["Überschrift X", "InformationX"]]
```
⚠ Bei mehreren Zeilen muss die **Anzahl der Informationen je Zeile identisch**
sein — ggf. mit Leerspalten auffüllen.

**4. Einstellungen + Erzeugen:**
```js
InfoBox.SetEinstellungen(/* … */)
InfoBox.CreateInfoBox()
```
Einstellung **Art**:
- `1` — Datensätze **zeilenmäßig** ausgerichtet
- `2` — Datensätze **spaltenmäßig** ausgerichtet
- `3` — Datensätze **stichpunktartig**
  - ⚠ Bei Art 3 müssen die Datensätze **anders im HTML** eingestellt werden
    (nicht mehr tabellarisch).

Anhang zum Beitrag: `Vorlage.txt`.

---

## SEFeldListe (#34931)

Key-Value-Liste (linker Wert grün hervorgehoben + zugehöriger Text).

**1. HTML:** Custom-Tag `<SEFeldListe>` mit **ID**, Schreibweise exakt
(Fehlerfalle).

**2. Init:** `InitialisiereDatenBasis()` vor dem Setzen der Daten.

**3. Einstellungen:** `Feldliste.SetEinstellung(ID, { LinkArt: 1–4 })`
- `1` — a-Link, **fett**
- `2` — onclick, **fett** *(Standard)*
- `3` — onclick
- `4` — a-Link

Empfehlung: JS-Funktionen aufrufen → Art **2/3**; Links zur BW oder ins Web →
Art **1/4**.

**4. Daten:** `Feldliste.AddListeDaten(...)` — bis zu **9 Parameter**:

| # | Bedeutung |
|---|---|
| 1 | ID des Feldlisten-Elements |
| 2 | Key (linker, grün dargestellter Wert). *Sonderfall:* ist Param 8 = `"J"`, hier stattdessen der **Bildpfad** → grüner Wert wird durch Bild ersetzt |
| 3 | zugehöriger Text (Value) |
| 4 | Link — JS-Funktion **oder** normaler Link (je nach LinkArt, s. Einstellungen) |
| 5 | `"J"` → Überschrift **fett + größer** (dann Param 3 weglassen = nur Überschrift) |
| 6 | `"J"` → Überschrift (Param 2) wird **nicht** gezeichnet |
| 7 | Breite zwischen Param 2 und 3 in px — **nur Zahl** (z. B. `400`, nicht `400px`) |
| 8 | siehe Sonderfall Param 2 (`"J"` = Bild) |
| 9 | Größe/Höhe des Bildes — **mit Einheit** (`12` → `12px`) |

**Leerzeile:** `FeldListe.AddLeerzeile(ID, Höhe)` — Höhe mit Einheit
(`50` → `50px`).

**Reihenfolge:** Reihenfolge im JS-Code = Anzeige-Reihenfolge (zuerst
hinzugefügt = zuerst angezeigt).

**5. Erzeugen:** `FeldListe.CreateFeldListen()` — erstellt alle im HTML
vorhandenen FeldListen-Tags.

---

## Was das für uns bedeutet

**Der Kernpunkt (ehrlich):** SoftEngine hat für **Tabelle, Feldliste,
InfoBox, ButtonBar, Chart, Liste** bereits **fertige, client-seitige Module**
mit Datenanbindung. Unser Editor baut für dieselben Zwecke **eigene Web
Components**. Das ist eine echte Weggabelung — besonders für unseren nächsten
Merklisten-Punkt **Tabelle**: es gibt ein natives `SETabelle`.

**Warum das nicht sofort „nimm die nativen Module" heißt:**

- **WYSIWYG-Beweisbarkeit (Regel 1):** Unser Prinzip ist EINE Render-Quelle,
  die im Editor UND im Export identisch läuft. Die SE-Module rendern erst
  **zur Laufzeit in SoftEngine** (`Create…()` zeichnet dann) — im Editor
  hätten wir sie nicht 1:1 zu sehen. Das müssten wir erst lösen (Editor-
  Vorschau vs. echtes Modul).
- **Bindung/Interaktion:** Wie diese Module schreiben (PUT) bzw. auf Klicks
  reagieren, ist hier **nur teilweise** dokumentiert (LinkArt/onclick, aber
  kein PUT-Weg). Per Regel 5 nicht raten → bräuchte Beleg an echter Maske.
- **Passung zu unseren Bausteinen:** Kanban/Karte/Popup haben kein natives
  Gegenstück; nur ein Teil unserer Bibliothek überlappt mit den SE-Modulen.

**ENTSCHIEDEN (Nutzer, 2026-07-17): eigene Tabelle-Web-Component.**
Zur SETabelle ist im SE-Wiki nichts auffindbar — ohne Originalquelle gibt es
nichts einzubetten (Regel 5, nie raten). Die Weiche ist damit zu; sollte je
eine echte SETabelle-Doku auftauchen, kann man neu bewerten.
- Der Lebenszyklus `InitialisiereSchnittstelle()` / `InitialisiereDatenBasis()`
  / `Reset…` ist zu merken, falls wir je ein SE-Modul einbetten.

> Vollständige Vorlagen liegen als Wiki-Anhänge (`Vorlage.txt` bei #36474).
> Wenn du sie hast, können wir sie hier als belegte Beispiele ergänzen.
