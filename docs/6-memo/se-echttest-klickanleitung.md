# SE-Echttest — Klick-Anleitung (gebündelt, ohne Fachbegriffe)

> Für den offenen, gebündelten SE-Echttest. EINE Testmaske prüft den
> Lese-Weg (Schritt holt sich etwas aus SoftEngine) und die
> Stellen-Übergabe **„Ergebnis von Schritt 1"** in einer echten
> SoftEngine-Installation.
> Hinweis: „Quelle speichern" und „Neuen Satz anlegen" wurden am
> 2026-07-20 restlos entfernt und sind NICHT mehr Teil dieses Tests.

## Was vorher im Editor steht (Aufbau der Testmaske)

Eine Maske mit:

- ein paar **Eingabefeldern**, die an eine echte Datenquelle gebunden sind
  (z. B. Terminplaner: Tiername, Notiz);
- einem Knopf **„Neu anlegen"** mit einer Aktions-Kette:
  1. Schritt 1 holt eine **neue, leere Datensatz-Stelle** (Lese-Vorgang);
  2. danach **je Eingabefeld ein Schreib-Schritt**, der den Feldwert in
     **genau diese neue Stelle** schreibt — als Herkunft der Stelle ist
     bei diesen Schritten **„Ergebnis von Schritt 1"** eingestellt.

(Der Aufbau ist Editor-Arbeit; diese Anleitung beschreibt die PRÜFUNG in
SoftEngine.)

## Prüfung in SoftEngine

1. Maske in SoftEngine öffnen — die Felder zeigen Werte an bzw. lassen
   sich füllen.
2. **Neue Werte** eintragen (z. B. Tiername „Testtier", Notiz
   „Anlage-Test").
3. Auf **„Neu anlegen"** klicken.
4. **Erwartung:**
   - Es entsteht ein **neuer** Datensatz (kein vorhandener wird
     überschrieben).
   - Die eingegebenen Werte stehen **in diesem neuen Satz**.
   - Prüfen lässt sich das in der Liste/Übersicht der Datenquelle: ein
     zusätzlicher Eintrag „Testtier / Anlage-Test" ist dazugekommen.
5. **Fehlbild (der entscheidende Punkt):** Die Werte landen im falschen
   Satz, verteilen sich auf mehrere Stellen, oder ein Schreib-Schritt
   schreibt ins Leere → genau das soll „Ergebnis von Schritt 1"
   verhindern → melden.

## Nach dem Test

Ergebnis (bestanden/nicht bestanden) an Claude zurückmelden. Bei Bestehen
sind der GET-Weg und „Ergebnis von Schritt N" (Zwischenspeicher-Paket,
2026-07-20) SE-bestätigt — danach laut Fahrplan: dieses Gleis → main
mergen, Nebengleis löschen.
