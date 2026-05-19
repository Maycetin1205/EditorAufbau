# BOOTSTRAP_ANALYSE

Status: Fehlersuche, nicht abgeschlossen.

## Bewiesener Teststand

In SoftENGINE erschien:

```txt
InitialisiereDatenBasis aufgerufen
Noch kein SEvariablen-XHR/fetch abgefangen
Goldreferenz gestartet
```

Damit ist bewiesen:

- Die Goldreferenz startet.
- `InitialisiereDatenBasis()` ist vorhanden und wird aufgerufen.
- Unsere `SEvariablen` werden in diesem Lauf nicht ueber unseren XHR/fetch-Interceptor abgefragt.
- `SEDATA.Daten` kommt nicht an.

## Unterschied zum funktionierenden Export

Der funktionierende Export hat vor dem Daten-Boot:

```js
try { selib.Json.InitializeERPConnection(); } catch(e) {
  try { if (typeof InitialisiereSchnittstelle === 'function') InitialisiereSchnittstelle(); } catch(e2) {}
}
```

Unsere Mini-Goldreferenz hatte diesen Schritt nicht.

## Schlussfolgerung

Die fehlende SE-Kommunikationsinitialisierung ist ein echter Kandidat fuer den Fehler.
Ohne diese Verbindung kann SoftENGINE eventuell keine Daten per Message/globalem `SEDATA` liefern.

Das ist noch nicht bewiesen, aber deutlich besser begruendet als weitere UI- oder Tabellen-Fixes.

## Aktuelle Korrektur

In `index.basis.source.html` wurde ergaenzt:

- `selib.Json.InitializeERPConnection()` falls verfuegbar
- Fallback `InitialisiereSchnittstelle()`
- sichtbare Logmeldung, welche Variante lief

## Naechster Test

Im Goldreferenz-Log muss jetzt eine dieser Zeilen erscheinen:

- `selib.Json.InitializeERPConnection aufgerufen`
- `InitialisiereSchnittstelle aufgerufen`
- `Keine SE-Schnittstellenfunktion gefunden`

Danach ist entscheidend:

- Kommt `SEDATA-Struktur`?
- Kommt weiterhin `Noch kein SEvariablen-XHR/fetch abgefangen`?
- Kommt eine Message im Browser-Log?
