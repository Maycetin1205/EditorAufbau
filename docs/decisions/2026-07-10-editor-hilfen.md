# 2026-07-10 — Editor-Hilfen: Anstecker, Klarname-Vorschau, Demo nie exportieren

Drei Entscheidungen vom 2026-07-10 rund um die Regel „Editor-Hilfen leben
im BlockHost, nie im Baustein" (Architektur-Regel 1 + 7):

- **P1.1b — Anstecker statt Kachel (Nutzer-Beschwerde):** der „+ Karte"/
  „+ Spalte"-Knopf war zuvor eine 180px-Kachel IM Baustein und stahl den
  Kanban-Spalten Breite (WYSIWYG-Bruch). Seitdem ist er ein kleiner
  Anstecker am Wrapper-Rand (Muster Kreuzchen), sichtbar nur, wenn die
  Auswahl im Teilbaum des Containers liegt (`AddChildButton` in
  `src/editor/canvas/BlockHost.tsx`).
- **Bindungs-Vorschau revidiert:** gebundene Stellen zeigen den KLARNAMEN
  ihres Felds statt des statischen Texts — keine erfundenen Beispielwerte
  (Kap. 5.2; heute in `src/editor/canvas/useLitElement.ts`).
- **„Demo wird gar nicht erst exportiert":** unterhalb eines Blocks mit
  `templateChild` erscheinen Instanzen dieses Typs nie sichtbar in der
  Maske; die EINE Musterkarte reist als inertes `<template
  data-ff-template>` mit (`nodeToHtml` in `src/export/exportMask.ts`),
  alle weiteren Instanzen (Altbestände) werden ausgelassen.
