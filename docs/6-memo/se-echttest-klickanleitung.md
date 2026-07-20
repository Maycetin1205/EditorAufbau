# SE-Echttest — Klick-Anleitung (gebündelt, ohne Fachbegriffe)

> Für den offenen, gebündelten SE-Echttest. EINE Testmaske prüft BEIDES:
> (A) „Quelle speichern" und (B) das Anlegen eines neuen Satzes, bei dem der
> zweite Schritt das Ergebnis des ersten Schritts benutzt. Alles in einer
> echten SoftEngine-Installation.

## Was vorher im Editor steht (Aufbau der Testmaske)

Eine Maske mit:

- ein paar **Eingabefeldern**, die an eine echte Datenquelle gebunden sind
  (z. B. Terminplaner: Tiername, Notiz);
- einem Knopf **„Speichern"** mit der Aktion „Quelle speichern";
- einem zweiten Knopf **„Neu anlegen"** mit zwei Aktions-Schritten
  hintereinander:
  1. Schritt 1 holt eine **neue, leere Datensatz-Stelle**;
  2. Schritt 2 schreibt die eingegebenen Feldwerte in **genau diese neue
     Stelle** — dafür ist beim zweiten Schritt als Herkunft der Stelle
     **„Ergebnis von Schritt 1"** eingestellt.

(Der Aufbau ist Editor-Arbeit; diese Anleitung beschreibt die PRÜFUNG in
SoftEngine.)

## Teil A — „Speichern" prüfen (vorhandenen Satz ändern)

1. Maske in SoftEngine öffnen. Die Felder zeigen die Werte des Satzes an.
2. In einem Feld den Text **ändern** (z. B. Tiername von „Minka" auf „Minka2").
3. Auf **„Speichern"** klicken.
4. **Erwartung:** Der geänderte Wert steht danach dauerhaft am Satz — nach
   einem Neu-Laden der Maske (oder Aufruf desselben Satzes an anderer Stelle)
   erscheint „Minka2", nicht mehr „Minka".
5. **Fehlbild:** Der Wert springt zurück / wird nicht gespeichert → melden.

## Teil B — „Neu anlegen" prüfen (neuer Satz, Stelle aus Schritt 1)

1. In dieselben Felder **neue Werte** eintragen (z. B. Tiername „Testtier",
   Notiz „Anlage-Test").
2. Auf **„Neu anlegen"** klicken.
3. **Erwartung:**
   - Es entsteht ein **neuer** Datensatz (kein vorhandener wird überschrieben).
   - Die eingegebenen Werte stehen **vollständig in diesem neuen Satz**
     (alle Felder, auch leere werden angelegt).
   - Prüfen lässt sich das in der Liste/Übersicht der Datenquelle: ein
     zusätzlicher Eintrag „Testtier / Anlage-Test" ist dazugekommen.
4. **Fehlbild (der entscheidende Punkt):** Die Werte landen im falschen Satz,
   verteilen sich auf mehrere Stellen, oder der zweite Schritt schreibt ins
   Leere → das wäre genau der Fehler, den „Ergebnis von Schritt 1" verhindern
   soll → melden.

## Nach dem Test

Ergebnis (A und B je bestanden/nicht bestanden) an Claude zurückmelden. Bei
Bestehen sind die beiden offenen Export-Pakete („Quelle speichern" 2026-07-17
und „Zwischenspeicher / Satz anlegen" 2026-07-20) SE-bestätigt und die
CLAUDE.md-Merkliste kann entsprechend geschlossen werden.
