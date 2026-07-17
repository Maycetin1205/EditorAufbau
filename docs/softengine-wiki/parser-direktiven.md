# SE-Parser-Direktiven (Infosysteme individualisieren)

> **Quelle:** SoftENGINE-Wiki, Beitrag **#34712** „Infosysteme
> individualisieren – eine Übersicht". Erstellt 11.05.2022, geändert
> 14.11.2024. Sichtbarkeit: Verfahrensdokumentation / SE Partner / Service
> Plus 3. Wörtlich übernommen und strukturiert; nichts hinzugefügt.

> **Welcher Weg ist das?** Der **server-seitige Parser** (Weg 1 im
> [Wiki-Index](README.md)). SE parst die HTML-Datei **vor** der Auslieferung
> und ersetzt die Kommentar-Direktiven durch Werte. Gedacht für **MIS-
> Infosysteme / Landingpages**. Es ist **einweg (nur Anzeigen)** — kein
> Schreiben zurück in die ERP-Daten. **Das ist NICHT unser Export-Weg**
> (wir nutzen die JS-Bridge mit `basisHTML_REGISTER` + JSON). Der Artikel
> selbst verweist auf die „moderne Variante mittels JSON" — das ist unserer.
> Was hier für uns brauchbar ist → Abschnitt [Was das für uns bedeutet](#was-das-fuer-uns-bedeutet).

## Grundprinzip

- Jede SE-Parser-Anweisung steht in einer **HTML-Kommentar-Funktion**:
  `<!--Befehl-->`. Gilt im HTML **und** im JavaScript.
- Parameter werden mit **`!`** getrennt; verschachtelte Funktionen stehen in
  **`[ … ]`**. Funktionen dürfen ineinander verschachtelt werden.
- Test-Ablage einer Beispiel-Datei (Artikel-Infosystem, Karteikarte 01):
  `<BWROOT>\VORLAGEN_INDIV\MIS\LANDINGPAGES\ART\HTML\01\index.html`

---

## 1. DATUM_BERECHNEN

Datum bzw. Datumsbereich ermitteln. Besonders wichtig als Parameter für
STATKENNZAHL.

```
DATUM_BERECHNEN[LEN!BERECHNUNGSART!RUECKGABEART!TT!MM!JJ]
```

- **LEN** — Ausgabeformat: `4` = JJJJ · `8` = TTMMJJJJ (ohne Punkte, als
  Integer weiterverarbeitbar) · `10` = TT.MM.JJJJ (lesbar).
- **BERECHNUNGSART** — `0` = heute · `1` = ausgehend von heute ±TT/±MM/±JJ.
- **RUECKGABEART** — `0` unverändert · `1` 1. Tag Monat · `2` letzter Tag
  Monat · `3` 1. Tag Woche · `4` letzter Tag Woche · `5` 1. Tag Quartal ·
  `6` letzter Tag Quartal · `7` 1. Tag Jahr · `8` letzter Tag Jahr.
- **TT / MM / JJ** — Differenz in Tagen/Monaten/Jahren. Ein vorangestelltes
  `=` **setzt** die Komponente auf den Wert (statt zu addieren).

**Beispiel** (Umsatz März vor 7 Geschäftsjahren):
```html
<!--SOFTENGINE-VAR!STATKENNZAHL[SE0100!4!2!1!DATUM[10!1!1!0!=3!-7]!DATUM[10!1!2!0!=3!-7]!ART_1_25]!R2!!!!1!1-->
```

---

## 2. TRIM / LTRIM / RTRIM

Leerzeichen beschneiden (z. B. bei aufgefüllten Feldwerten wie `ART_1_25`).

```
TRIM[WERT]    LTRIM[WERT]    RTRIM[WERT]
```

- **TRIM** — links und rechts · **LTRIM** — nur links · **RTRIM** — nur rechts.

```html
<!--SOFTENGINE-VAR!TRIM[   Leerzeichen ueberall.   ]-->
```

---

## 3. CONCAT

Strings verketten.

```
CONCAT[TEXT!PARAMETER1-99]
```

- **TEXT** — zuerst angezeigter Text · **PARAMETER1-99** — jede weitere
  Anhängung.

```html
<!--SOFTENGINE-VAR!CONCAT[Satz: !Der Anfang, !die Mitte! und der Schluss.]-->
```

---

## 4. FILE_DREHEN

Über einen Datenbereich drehen, um dessen Werte zu laden (nur innerhalb
SOFTENGINE-LOOP).

```
FILE_DREHEN[FILEID!KEYNR!VONIND!BISIND!RICHTUNG]
```

- **FILEID** — Datenbereich (ART, ADR, BEL, …).
- **KEYNR** — Index: `0` = Primärindex, `1,2,3…` = Sekundärindizes.
- **VONIND / BISIND** — Start-/End-Key (z. B. `ART_1_25`).
- **RICHTUNG** (optional) — `0` von vorne, `1` von hinten (letzte zuerst).

**Beispiel** (erste 5 Adressnamen aus ADR):
```html
<!--SOFTENGINE-LOOP!START!Adressen!5!FILE_DREHEN[ADR!0!NUMFORMAT[   10000!R0!8]!NUMFORMAT[   70003!R0!8]!0]!!-->
<p><!--SOFTENGINE-VAR!ADR_20_60!L!!!!!--></p>
<!--SOFTENGINE-LOOP!ENDE!Adressen-->
```

---

## 5. STATKENNZAHL

Werte aus den Statistik-Kennzahlen (Designer: „Konfiguration Kennzahl und
Berichte").

```
STATKENNZAHL[ID!NUMMER!ZEITRAUMART!ZEITRAUM!ZEITPARAMETER1!ZEITPARAMETER2!SUMMENINDEX1..5]
```

- **ID** — SE-Standard-Kennzahlen beginnen mit `SE`, individuelle mit `ID`.
- **NUMMER** — eines von bis zu 10 Summenfeldern der Kennzahl.
- **ZEITRAUMART** — `0` Tag · `1` Woche · `2` Monat · `3` Quartal · `4` Jahr ·
  `5` alle Jahre.
- **ZEITRAUM** — `0` aktuell · `-1..-99` zurück · `1` aus Datum mit Beachtung
  Zeitraumart · `2/3/4` Monat aktuelles/Vor-/Vorvorjahr · `5/6` aus Datum
  Vor-/Vorvorjahr · `7` exakter Zeitraum aus Datum · `8..14` Monat 3–9 Jahre
  zurück.
- **ZEITPARAMETER 1/2** — eigener Von/Bis-Zeitraum (siehe DATUM).
- **SUMMENINDEX 1–5** — Wert-Basis, meist Primärindex (Artikel: `ART_1_25`).

```html
<!--SOFTENGINE-VAR!STATKENNZAHL[SE0100!3!0!0!!!ART_1_25]!R2!!!!1!1-->   <!-- Ertrag heute -->
<!--SOFTENGINE-VAR!STATKENNZAHL[SE0100!3!1!-1!!!ART_1_25]!R2!!!!1!1-->  <!-- Ertrag letzte Woche -->
```

---

## 6. SOFTENGINE-VAR (der Grundstein)

Werte aus der BüroWARE im HTML ausgeben — Felder **oder** Funktionen
(GET/PUT-Relations, STATKENNZAHL, DATUM …).

```
<!--SOFTENGINE-VAR!NAME!FORMAT!ZIELLEN!REFRESHTRENNER!REFRESHID!TAUSENDERTRENNER!NULLWENNLEER!ALTERNATIVTEXT-->
```

- **NAME** — Feldname (`POS_164_8`) oder Funktions-Einleitung (GET_RELATION,
  STATKENNZAHL, DATUM …).
- **FORMAT** — Ausgabeformat, alle BüroWARE-Formate (`R`, `R2`, `R0`, `L`, …).
- **ZIELLEN** — Ziellänge der Ausgabe.
- **REFRESHTRENNER** — Trennzeichen zwischen Feldwert und Hilfstabellen-Text
  (meist `:`).
- **REFRESHID** — ID der Hilfstabelle für den Zusatztext.
- **TAUSENDERTRENNER** — Boolean `0`/`1`.
- **NULLWENNLEER** — Boolean `0`/`1`: leerer Wert → `0`.
- **ALTERNATIVTEXT** — statt NULLWENNLEER ein Ersatztext (SE-Standard oft
  `-/-` oder „Nicht hinterlegt").

```html
<!--SOFTENGINE-VAR!POS_246_9!R2!!!!1!1-->              <!-- 2.119,32 -->
<!--SOFTENGINE-VAR!ART_36_5!L!!" : "!300012!!!-->      <!-- WGR01 : Warengruppe … -->
```

---

## 7. SOFTENGINE-BLOCK

Wie ein `<div>` mit **Sichtbarkeits-Selektion**; koppelbar ans Ansichts-Menü
der BW/WW.

```
<!--SOFTENGINE-BLOCK!START!NAME!SELEKTION!INANSICHTMENUEVERBERGEN!ALTERNATIVERANSICHTMENUETEXT!MENUEID-->
   … Inhalt …
<!--SOFTENGINE-BLOCK!ENDE!NAME-->
```

- **NAME** — Start und Ende müssen identisch sein.
- **SELEKTION** — Prüfung, z. B. `GET_RELATION[148!MIS1313!75!]=0` (Zugriffs-
  recht) → Block sichtbar/verborgen.
- **INANSICHTMENUEVERBERGEN** — Boolean `0` = ja (zeigen) / `1` = nein.
- **ALTERNATIVERANSICHTMENUETEXT** — eigener Menü-Text (leer → NAME).
- **MENUEID** — numerische Reihenfolge im Ansichts-Menü, Beginn bei `1`.

```html
<!--SOFTENGINE-BLOCK!START!ArtikelErtrag!GET_RELATION[148!MIS1313!75!]=0!0!Gesamtertrag des Artikels!1-->
<!--SOFTENGINE-VAR!STATKENNZAHL[SE0100!3!4!0!!!ART_1_25]!R2!!!!1!1-->
<!--SOFTENGINE-BLOCK!ENDE!ArtikelErtrag-->
```

---

## 8. SOFTENGINE-LOOP

Mehrere Datensätze ausgeben. Braucht Start- und Ende-Befehl mit **eindeutigem
Namen**.

```
<!--SOFTENGINE-LOOP!START!NAME!ANZAHL!FUNKTION!FILTER!PARAMETER-->
   … pro Durchgang SOFTENGINE-VAR …
<!--SOFTENGINE-LOOP!ENDE!NAME-->
```

- **ANZAHL** — Anzahl Durchgänge; `-1` = alle.
- **FUNKTION** — was durchlaufen wird (Tabelle unten).
- **FILTER** — Selektion auf die Ausgabe.
- **PARAMETER** — optionale Zusatzparameter, `!`-getrennt (z. B. NUMFORMAT).

**Funktionen** (Ausgabe je Wert immer per SOFTENGINE-VAR):

| Funktion | Aufbau |
|---|---|
| ARTLAGER | `ARTLAGER[ARTNR!ZUSAMMENFASSEN]` (0 = mit Bez., 1 = nur Plätze) |
| ARTBEWEGUNGEN | `ARTBEWEGUNGEN[BELART!ARTNR]` |
| ARTCHECKLISTEN | `ARTCHECKLISTEN[ARTNR]` |
| ARTATTRIBUTE | `ARTATTRIBUTE[ARTNR!ATTRTYP!LEERE_AUSLASSEN]` (Typ 0 Feld…5 Medium) |
| ATTRIBUTWERTE | `ATTRIBUTWERTE[]` (Loop-im-Loop nötig) |
| SERBEWEGUNGEN | `SERBEWEGUNGEN[VONSERNR!BISSERNR!BELPOSNDX]` |
| CHABEWEGUNGEN | `CHABEWEGUNGEN[VONCHANR!BISCHANR!BELPOSNDX]` |
| CHALAGER | `CHALAGER[CHANR]` |
| BELPOS | `BELPOS[BELNDX]` (Index `BEL_0_11`) |
| ANSPRECHPARTNER | `ANSPRECHPARTNER[ADRNR]` |
| FILE_DREHEN | `FILE_DREHEN[FILEID!KEYNR!VONIND!BISIND!RICHTUNG]` |
| TERMINE | `TERMINE[BDNR!VONDATUM!BISDATUM]` |
| EMAILS | `EMAILS[BDNR!VONDATUM!BISDATUM!E/A!U/G]` |
| AUFGABEN | `AUFGABEN[BDNR!VONDATUM!BISDATUM]` |
| FAVORITEN | `FAVORITEN[ART!BDNR]` |
| PERSONAL | `PERSONAL[]` |
| BEDIENER | `BEDIENER[ANGEMELDET]` (VAR: BDNR_NAME / BDNR_NR / BDNR_PERSONAL_NR) |
| VARIANTEN | `VARIANTEN[ARTNR]` (Index `ART_1_25`) |
| PROZ… | PROZAUFGABEN / PROZPERSONAL / PROZVERKNUEPFUNGEN / PROZBEZIEHUNGEN / PROZNACHRICHTEN / PROZKOMMENTARE / PROZANHAENGE / PROZCHECKLISTE `[PROZESSID]` |
| AUFG… | AUFGNACHRICHTEN / AUFGVERKNUEPFUNGEN / AUFGBEZIEHUNGEN / AUFGKOMMENTARE / AUFGANHAENGE / AUFGCHECKLISTE / AUFGAUTOVORGAENGE / AUFGBEOBACHTER `[AUFGABENID]` |
| ADRESS… | ADRESSTERMINE / ADRESSEMAILS / ADRESSGESPRAECHE `[ADRESSNUMMER]` (Index `ADR_1_8`) |
| KNTZUWEISUNG | `KNTZUWEISUNG[ID]` — VAR-Aufruf als `KNTZUWEISUNG_POS_LEN` |

```html
<!--SOFTENGINE-LOOP!START!ARTLAGER!-1!ARTLAGER[ART_1_25!0]!!-->
Lager: <!--SOFTENGINE-VAR!LAG_10_60!L-->
Lagerplatz: <!--SOFTENGINE-VAR!LAG_1_10!L-->
<!--SOFTENGINE-LOOP!ENDE!ARTLAGER-->
```

---

## 9. SOFTENGINE-LINK

Verknüpfungen zu Programm-Aufrufen / anderen Infosystemen.

```
<!--SOFTENGINE-LINK!START!LINKID!AUFRUFART!IDENTIFIKATION!PINDEX!SNR!KK!ASTID-->Name der URL<!--SOFTENGINE-LINK!ENDE!LINKID-->
```

- **AUFRUFART** — `START_MIS` (anderes Infosystem) · `START_TOOL` (BW/WW-Modul,
  wie im Workflow-Script) · `SET_KARTEIKARTE` (Karteikarten-Wechsel).
- **IDENTIFIKATION** — Ziel (START_MIS: `BEL`/`POS`… · START_TOOL: `1003`… ·
  SET_KARTEIKARTE: `1`,`2`,`100`…).
- **PINDEX** — Index des Datenbereichs (`POS_0_11`, `MASKE_313_25`, …).
- **SNR** — Satznummer, meist leer oder `-1` (nur bei Positionen relevant).
- **KK** — Karteikarte (`01`, `02`, ggf. `100`/`101`).
- **ASTID** — anzuspringender Ast im Baum der Karteikarte.

```html
<!--SOFTENGINE-LINK!START!LINK1!SET_KARTEIKARTE!100!101000-->
Verlinkung zur Karteikarte 100, Fokus dritter Ast
<!--SOFTENGINE-LINK!ENDE!LINK1-->
```

---

## 10. GET_REFRESH

Texte von Hilfstabellen-Einträgen abrufen.

```
<!--GET_REFRESH!REFRESHID!INDEX!POS!LEN!-->
```

- **REFRESHID** — 6-stellige Hilfstabellen-Nummer.
- **INDEX** — Feld mit dem Hilfstabellen-Text (`ART_1717_1`).
- **POS** — Startposition (Default `1`).
- **LEN** — Länge (Default `100`).

```html
<!--SOFTENGINE-VAR!GET_REFRESH[103004!ART_1717_1!1!100]-->   <!-- „Manuell eingeben" -->
```

---

## 11. NUMFORMAT

Zahlenwerte formatieren/trimmen/längen.

```
<!--NUMFORMAT!WERT!FORMAT!LAENGE!TAUSENDERTRENNER!NULLWENNLEER!TRIM!DEZIMALTRENNER-->
```

- **WERT** — zu formatierender Wert (auch BüroWARE-Zahlenfelder).
- **FORMAT** — `R`, `R2`, `R0`, `L`, …
- **LAENGE** — Ausgabelänge.
- **TAUSENDERTRENNER / NULLWENNLEER / TRIM** — Booleans `0`/`1`.
- **DEZIMALTRENNER** — Symbol (UTF-8), z. B. `,`.

```html
<!--SOFTENGINE-VAR!NUMFORMAT[4711!R2!4!1!0!0!,]-->   <!-- 4.711 -->
<!--SOFTENGINE-VAR!NUMFORMAT[4711!R2!7!1!0!1!,]-->   <!-- 4.711,00 -->
```

---

## Was das für uns bedeutet

**Bestätigt (deckt sich mit unseren Kontrakten):**

- **Feldcode-Format** `ART_1_25`, `POS_246_9`, `ADR_20_60` = `TABELLE_POS_LEN`
  — passt zu unserem pos_len-Kontrakt und „Stamm (ADR/ART/BEL) → explizite
  pos_len-Liste".
- **`!` als universeller Trenner, `[…]` für verschachtelte Funktionen** —
  genau die annahmefreie Zerlegung, die unser Relations-Syntax-Import kann.
- **Format-Codes** `R / R2 / R0 / L` — unser Format-System.
- **START_TOOL** ist eine echte SE-Verb mit Programm-Nummer (hier über
  SOFTENGINE-LINK, also andere Aufrufform als unser
  `sendBWLinkIntern('0,START_TOOL,…')` — unabhängige Bestätigung).

**Neu / evtl. später nützlich** (reine Merkliste, kein Baubefehl — jedes
braucht einen echten Fall, Regel 10):

- **SOFTENGINE-BLOCK** = konzeptionell unser `visibleWhen`, aber server-seitig.
- **NUMFORMAT / DATUM / GET_REFRESH / STATKENNZAHL** = Formatierung + Kennzahlen,
  die wir noch nicht haben.
- **SOFTENGINE-LOOP** = server-seitige Schleife; unser Gegenstück ist
  SEFILELOOP im JSON — anderer Mechanismus, gleiches Ziel.

**Grenze:** Dieser Weg kann laut Artikel **nur anzeigen, nicht schreiben**.
Für Kanban-Verschieben, Formularfeld → PUT_RELATION, Aktionsketten brauchen
wir Weg 2 (JS-Bridge). Details → nächster Abschnitt in der Antwort bzw.
[Wiki-Index](README.md).
