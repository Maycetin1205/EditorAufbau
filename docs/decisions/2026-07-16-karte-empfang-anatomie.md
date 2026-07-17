# 2026-07-16 — Karte nach der Empfang-Anatomie (Nutzer-Entscheidungen)

Die Karte (`src/blocks/card/CardBlock.ts`) wurde am 2026-07-16 auf das
Empfang-Vorbild (Referenzmaske vkarte) umgebaut. Die geltenden Regeln
stehen im Baustein selbst; hier die Historie der Entscheidungen:

- **Anatomie:** acht bindbare Stellen — Avatar links neben Titel + Titel 2
  (in EINER Zeile) mit Unterzeile darunter, Zeit + Datum OBEN RECHTS in
  derselben Zeile, Textzeile, Chip am unteren Rand. Der Chip unten bleibt
  unsere bewusste Abweichung vom Vorbild (Nutzer-Entscheidung 2026-07-15).
- **Auto-Höhe:** die Karte ist auto-hoch mit 112px MINDESThöhe — das
  ERSETZT die feste 112px-Höhe aus dem SE-Echttest vom 2026-07-15
  (beides Nutzer-Entscheidungen); Text maximal zwei Zeilen.
- **Leer-Regel:** in der Maske verschwinden Stellen ohne Inhalt restlos
  samt leerer Zeilen; im Editor bleiben sie Klick-Ziele (Strich bzw.
  gestrichelter Avatar-Kreis) — nur Platzhalter, nie Texte (Regel 7:
  der Editor erfindet nie Daten).
- **Stellen starten leer:** die früheren Karten-Demo-Werte ab Werk
  („Rückruf Fr. Wagner", „09:15", „Katze · EKH", „Befund Minka
  besprechen", „Heute") sehen in alten Speicherständen aus wie Eingaben —
  sie werden beim Laden geleert (exakter Textvergleich,
  `putzeAlteKartenDemos` in `src/state/migrations.ts`).
- **Muster-Anstecker abgeschafft:** das sichtbare „Muster"-Etikett an der
  Musterkarte ist raus (Nutzer-Entscheidung 2026-07-16); der Löschschutz
  bleibt (die Musterkarte hat kein Entfernen-Kreuzchen).
- **Keine einstellbare Breite:** Karten sind IMMER so breit wie ihre
  Spalte (`lockedWidth: 'fill'`, Nutzer-Entscheidung 2026-07-16); bereits
  verschmälerte Bestandskarten springen von selbst zurück.
- **Vorgeschichte P1.1:** der frühere Vorlagen-Kasten (`kanban-vorlage`)
  ist abgeschafft — die ERSTE Karte des Boards ist die Musterkarte
  (`templateChild` am Board); alte Speicherstände migriert
  `migrateKanbanVorlage` verlustfrei.
