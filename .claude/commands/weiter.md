Setze die Arbeit am Aufbau-Editor fort. Halte dich EXAKT an dieses Ritual —
es ersetzt Urteilsvermögen durch Prüfschritte. Keine Abkürzungen.

1. LIES zuerst CLAUDE.md komplett (verbindliche Wahrheit), dann ARCHITEKTUR.md.
2. PRÜFE den Ist-Zustand, bevor du irgendetwas änderst:
   npx tsc -b && npx eslint src && npm test
   Wenn etwas rot ist: STOPP, dem Nutzer melden, nicht "nebenbei fixen".
3. NIMM den nächsten offenen Roadmap-Punkt aus CLAUDE.md. Nur diesen.
   Steht dort [kritisch]: weise den Nutzer darauf hin, dass dieser Schritt
   fuer ein starkes Modell markiert ist, und lass ihn entscheiden.
4. SPIELE den Schritt erst aus Bedienersicht durch (Was sieht der Nutzer?
   Was klickt er?) und zeige den Plan. WARTE auf "go" vor Code-Aenderungen.
5. BAUE klein. Nach JEDER Aenderung: tsc + eslint + npm test.
   Nach Block-Aenderungen zusaetzlich: npm run build:runtime.
6. VERIFIZIERE im Browser (Screenshot fuer den Nutzer), nicht nur per Tests.
7. AKTUALISIERE die Roadmap in CLAUDE.md (Haken + Datum + 2 Saetze was/wie).
8. COMMITTE das fertige Kapitel mit ausfuehrlicher Message und pushe.

VERBOTE (nicht verhandelbar, stehen auch in CLAUDE.md):
- Tests niemals loeschen/abschwaechen, um gruen zu werden.
- Keine Farb-/Groessen-Literale in src/blocks/** (Tokens benutzen).
- Kein `if (type === '...')` ausserhalb des jeweiligen Baustein-Ordners.
- Nichts am alten Editor (react--app) umbauen. Er ist nur Referenz.
- Nicht mehrere Kapitel parallel anfangen.
- Keine Erklaertexte/Tutorials in die Editor-Flaeche bauen.

Wenn du unsicher bist: kleiner bauen, frueher fragen, nie raten.
