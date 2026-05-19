# Aufbau-Editor

Neuer sauberer Aufbau fuer einen WYSIWYG-Editor, der HTML/JSON fuer SoftEngine ueberfluessig machen soll.

Die Canvas ist das Live-Dokument. Sichtbare Inhalte sind echte Web Components, keine separate Vorschau.

Aktueller Stand:

- React + Vite als Editor-Shell
- Mantine als UI-System fuer Editor-Werkzeuge
- Zustand als zentraler Editor-State
- Zod + TypeScript fuer Block-Regeln
- Lit/Web Components fuer echte WYSIWYG-Blocks
- Erste Blocks: `ff-button`, `ff-text`
- Projektzustand wird im Browser lokal gespeichert
- Ausgewaehlte Blocks koennen im Inspector geloescht werden

Alte vibe-coded Dateien sind entfernt. Alte Projekte duerfen nur als Lesematerial dienen, nicht als Bauplan.

## Entwicklung

```bash
npm install
npm run dev
```

## Verifikation

```bash
npm run build
npm run lint
```
