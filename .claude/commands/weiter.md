Setze die Arbeit am Aufbau-Editor fort. Halte dich EXAKT an dieses Ritual —
es ersetzt Urteilsvermögen durch Prüfschritte. Keine Abkürzungen.

1. HOLE den aktuellen Stand, BEVOR du irgendetwas liest:
   git pull origin main
   `main` ist die einzige Wahrheit (Beschluss 2026-07-06, nach dem
   Branch-Chaos mit 4x doppelt gebautem Kap. 2.2). Dein lokaler Stand kann
   veraltet sein, auch CLAUDE.md selbst. Gearbeitet wird auf dem Branch,
   den die Session vorgibt (Cloud) bzw. einem frischen Arbeits-Branch von
   origin/main (lokal). NIEMALS auf dem alten Branch einer fremden Session
   weiterarbeiten. Bei Konflikt oder Fehlermeldung: STOPP, dem Nutzer melden.
2. LIES dann CLAUDE.md komplett (verbindliche Wahrheit), dann ARCHITEKTUR.md.
3. PRÜFE den Ist-Zustand, bevor du irgendetwas änderst:
   npx tsc -b && npx eslint src && npm test
   Wenn etwas rot ist: STOPP, dem Nutzer melden, nicht "nebenbei fixen".
4. NIMM den nächsten offenen Roadmap-Punkt aus CLAUDE.md. Nur diesen.
   Steht dort [kritisch]: weise den Nutzer darauf hin, dass dieser Schritt
   fuer ein starkes Modell markiert ist, und lass ihn entscheiden.
   Sollst du trotzdem weitermachen: arbeite den Schritt nach dem
   /kritisch-Ritual ab (.claude/commands/kritisch.md).
5. SPIELE den Schritt erst aus Bedienersicht durch (Was sieht der Nutzer?
   Was klickt er?) und zeige den Plan. Der Plan enthaelt EINE konkrete
   Empfehlung (sinnvolle Standardwahl, kurz begruendet) — KEINE offenen
   Auswahlfragen an den Nutzer. Er sagt "go" oder korrigiert.
   WARTE auf "go" vor Code-Aenderungen.
6. BAUE klein. Nach JEDER Aenderung: tsc + eslint + npm test.
   Nach Block-Aenderungen zusaetzlich: npm run build:runtime.
7. VERIFIZIERE im Browser (Screenshot fuer den Nutzer), nicht nur per Tests.
8. AKTUALISIERE die Roadmap in CLAUDE.md (Haken + Datum + 2 Saetze was/wie).
9. COMMITTE das fertige Kapitel mit ausfuehrlicher Message, pushe SOFORT
   (git push -u origin <arbeits-branch>) und oeffne/aktualisiere den
   Pull Request nach main. Der Nutzer merged den PR am Ende der Sitzung —
   erst dann ist der Stand fuer die naechste Sitzung sichtbar. Ein
   ungemergter Branch ist verlorene Arbeit (siehe Branch-Chaos 2026-07-05).
   NIE direkt auf main pushen.

VERBOTE (nicht verhandelbar, stehen auch in CLAUDE.md):
- Tests niemals loeschen/abschwaechen, um gruen zu werden.
- Keine Farb-/Groessen-Literale in src/blocks/** (Tokens benutzen).
- Kein `if (type === '...')` ausserhalb des jeweiligen Baustein-Ordners.
- Nichts am alten Editor (react--app) umbauen. Er ist nur Referenz.
- Keinen fremden Code hereinkopieren (alter Editor, PageBuilder,
  Internet-Schnipsel, andere Projekte). Referenzen liefern nur die
  Funktionsliste (WAS ein Feature koennen muss) — gebaut wird
  ausschliesslich nach dem Muster der vorhandenen Bloecke
  (Button/Text/Container) in DIESEM Repo.
- Nicht mehrere Kapitel parallel anfangen.
- Keine Erklaertexte/Tutorials in die Editor-Flaeche bauen.

Wenn du unsicher bist: kleiner bauen, frueher fragen, nie raten.
