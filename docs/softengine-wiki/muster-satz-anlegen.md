# Muster „Satz anlegen" (GET neuer Index → PUTs → Querverweis)

> **Quelle:** SE-Ausführungslog des Nutzers, 2026-07-17 — echter Vorgang
> „Termin anlegen" in der Referenz-Installation (behandlung-umbau-Umfeld).
> Originalquelle im Sinne von Regel 5; die Relations-NRs (640/174/666) sind
> **installations-individuell** und gehören NIE fest in Code.

## Der Ablauf (aus dem Log)

```
GET_RELATION[640!ID0001]              → 260   (neuer Satz-Index Tabelle ID0001)
PUT_RELATION[174!10!8!L!260!ID0001!10011]     (Feld 10_8  = Adressnummer)
PUT_RELATION[174!78!30!L!260!ID0001!Pudy]     (Feld 78_30 = Tiername)
PUT_RELATION[174!18!30!L!260!ID0001!Katze]
… ein PUT je Feld, ALLE auf Index 260 …
PUT_RELATION[174!319!12!L!260!ID0001!]        (auch LEERE Felder werden geschrieben)

GET_RELATION[640!ID0004]              → 221   (neuer Satz-Index Tabelle ID0004)
PUT_RELATION[174!10!8!L!221!ID0004!10011]
… Haustier-Felder auf Index 221 …
PUT_RELATION[174!514!10!L!221!ID0004!260]     (⚡ QUERVERWEIS: der ERSTE Index
                                               reist als WERT in die zweite Tabelle)
GET_RELATION[640!ID0005]              → 1582  (weiterer Zähler)
```

## Die Regeln, die daraus folgen (belegt)

1. **Anlegen = GET „neuer Index" + ein PUT je Feld auf diesen Index.**
   Die GET-Relation (hier NR 640) nimmt die Tabellen-ID (`ID0001`, ohne
   IDB-Präfix) und liefert den nächsten freien Satz-Index.
2. **Auch leere Felder werden geschrieben** (Initialisierung des Satzes) —
   „nur geänderte Felder" ist beim Anlegen NICHT das Referenzverhalten.
3. **Mehrere Index-Zwischenspeicher leben gleichzeitig:** der Termin-Index
   (260) wird noch benutzt (als WERT im Querverweis-PUT), nachdem längst
   ein zweiter GET (221) lief. Ketten-Laufzeiten brauchen deshalb
   adressierbare Ergebnisse je Schritt, nicht nur „das letzte Ergebnis".
4. **Querverweis-Muster:** Verknüpfung zweier Sätze = der Index des einen
   als Feld-WERT im anderen (hier `514_10` in ID0004 ← 260).

## Umsetzung im Editor (Stand 2026-07-17)

Ketten-Schritte am Auslöser (z. B. Schaltfläche „Termin anlegen"):
GET-Schritt → danach je Feld ein PUT-Schritt, dessen PINDEX (und bei
Querverweisen der WERT) über die Parameterquelle **„Ergebnis von Schritt N"**
auf den GET zeigt (Export übersetzt die Schritt-id in die Ketten-Position;
Laufzeit führt eine Ergebnis-Liste je Kette). Feld-Werte kommen über
**„Feld der Datenquelle"** (am Knopf: erste Zeile der Quelle).
