# GOLDREFERENZ_SOFTENGINE

Status: gebaut, lokal technisch geprueft, SoftENGINE-Test nach Datenloader-Fix erneut offen.

Dieses Paket ist keine Editor-UI und kein Architektur-Vorbild fuer den neuen Editor.
Es ist ein lauffaehiger SoftENGINE-Pruefstand fuer die stabil bewiesenen Grundlagen.

## Dateien

- `index.basis.source.html`
- `index.basis.SEvariablen.json`
- `GOLDREFERENZ_SOFTENGINE.md`
- `BOOTSTRAP_ANALYSE.md`

## Stabil eingebaut

- SEFILELOOP mit `Terminplaner`, `Kundenhaustiere`, `Beleg_1`
- IDB lesen aus `SEDATA.Daten.SEFileLoop` und Fallback `SEDATA.Daten.Tabellen`
- Beleg lesen ueber Alias `Beleg_1`
- Join/Selection:
  - `Terminplaner 10_8` zu `Kundenhaustiere 10_8`
  - `Terminplaner 10_8` zu `Beleg_1 11_8`
- GET_RELATION:
  - NR `640`
  - PARAMS: `ID0005`, leer, leer
  - Wichtig: `IDBID0005` wird fuer Relation-Parameter zu `ID0005`
- PUT_RELATION:
  - NR `174`
  - PARAMS: `POS`, `LEN`, `VART`, `PINDEX`, `IDBID`, `QUELLDATEN`
  - Default-Test: `118`, `30`, `L`, ausgewaehlter PINDEX, `ID0005`, Status
  - Fire-and-forget, wie alter Editor
- START_TOOL:
  - zuerst `sendBWLinkIntern("0,START_TOOL,...")`
  - Fallback `basisHTML_SND_MSG("START_TOOL", { NR, PARAMS })`

## Bewusst nicht eingebaut

- MASKENEVENT
- normales VAR-Lesen
- PUTADD_RELATION
- echtes Refresh/Lifecycle-Verhalten
- Maskenfeld schreiben

Diese Punkte bleiben Labor, bis sie in SoftENGINE echt getestet sind.

## Beispiele, keine Grenzen

Die verwendeten Aliasnamen, Felder und Relationen sind Testbeispiele aus dem funktionierenden Export.
Sie sind keine Grenze fuer den spaeteren Editor.

Wichtig:

- In `index.basis.SEvariablen.json` bleibt `IDBID0005`.
- In Relation-Parametern wird daraus `ID0005`.
- `ID005` ist falsch.

## SoftENGINE-Pruefliste

1. Paket in SoftENGINE laden.
2. Pruefen, ob oben `SEDATA erkannt` erscheint.
3. Pruefen, ob Terminplaner-Zeilen angezeigt werden.
4. Termin anklicken.
5. Pruefen, ob Detailbereich Werte aus Terminplaner zeigt.
6. Pruefen, ob Join zu Kundenhaustiere ueber `10_8` Werte findet.
7. Pruefen, ob Join zu Beleg_1 ueber `11_8` Werte findet.
8. Button `GET_RELATION 640 testen` klicken.
9. Pruefen, ob ein Ergebnis oder Timeout sauber im Log steht.
10. Status auswaehlen und `PUT_RELATION 174 senden` klicken.
11. Pruefen, ob SoftENGINE die Aenderung annimmt.
12. Toolnummer eintragen und `START_TOOL testen` klicken.

## Lokale Pruefung

- JSON mit Node geparst.
- HTML-Basis auf stabile und Labor-Keywords geprueft.
- Script-Inhalt aus HTML mit `node --check` syntaktisch geprueft.
- Keine aktiven Calls fuer `MASKENEVENT`, `PUTADD_RELATION`, `VARArrays` im HTML.

## Fix nach erstem SoftENGINE-Test

Problem:

- Es wurden keine Datensaetze angezeigt.

Korrektur:

- SEvariablen-XHR/fetch-Intercept aus dem funktionierenden alten Export uebernommen.
- Bewiesene alten Bootstrap-Namen werden genutzt: `__FF_SEFILELOOP`, `__FF_SEVARS`, `__FF_ALIAS_TO_ID`.
- `InitialisiereDatenBasis()` wird beim Start angestossen, falls noch kein `SEDATA.Daten` vorhanden ist.
- Message-Hook uebernimmt `MSG.DATA.Daten` in `window.SEDATA.Daten`.
- Row-Reader akzeptiert jetzt auch direkte Array-Container.

## Fix nach Konsolenfehlern

Problem:

- `Erstellen is not defined`
- Duplicate-Script-Fehler aus SoftENGINE-Framework-Dateien

Korrektur:

- `window.Erstellen`, `window.initData` und `window.ReloadData` werden jetzt frueh im Head definiert.
- `SeHtmlFrameworkV2_Files` wurde entfernt, weil diese Goldreferenz keine SE-Framework-Widgets nutzt und die Umgebung die Dateien bereits laedt.

## Laufende Fehlersuche

- XHR/fetch-Interceptor wurde auf die bewiesene alte Struktur angepasst:
  Getter fuer `readyState`, `status`, `responseText`, `response` und asynchroner Callback.
- Fruehes `Erstellen()` ruft wieder `ResetDataBasis()` und `InitialisiereDatenBasis()` wie im funktionierenden Export.
- Log zeigt jetzt, ob `SEvariablen` ueber XHR/fetch abgefangen wurde.
- Log zeigt bei vorhandenem `SEDATA.Daten` die grobe Datenstruktur.
- Tabellenueberschriften zeigen sprechende Namen statt nur technische Feldnummern.
- SE-Kommunikationsstart aus funktionierendem Export ergaenzt:
  `selib.Json.InitializeERPConnection()` mit Fallback `InitialisiereSchnittstelle()`.

## Offen

- Echter SoftENGINE-Lauf.
- Ergebnisformat von `GET_RELATION 640` im Zielsystem.
- Ob `PUT_RELATION 174` mit `POS=118`, `LEN=30`, `VART=L` im Zielsystem genau das erwartete Feld schreibt.
