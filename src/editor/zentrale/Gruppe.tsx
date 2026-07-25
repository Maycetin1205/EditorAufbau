// Gruppe — die EINE Label-Stelle für die Lese-Ansichten der Steuerung
// (R3 2026-07-21): eine kleine Eyebrow-Überschrift („Felder", „Verwendung
// in dieser Maske", …) über einem Inhaltsblock. Vorher stand dieses Markup
// in DatenquellenBereich und RelationenBereich mehrfach wortgleich kopiert —
// jetzt an genau einem Ort (löst die „Abschnitts-Überschriften-Orgie" auf).
//
// Label-Stufen der Editor-UI, bewusst getrennt und je an EINER Stelle
// gepflegt — es gibt genau diese Stellen, nichts Ad-hoc daneben:
//   · Eyebrow (hier):        10 px, versal — Gruppen einer Lese-Ansicht.
//   · Feld-Label (Field):    11 px — beschriftet EIN Eingabe-Control, im
//     Inspector UND in den Steuerungs-Formularen identisch.
//   · Detail-Titel (h3):     14 px — der Name des gewählten Eintrags.

import type { ReactNode } from 'react'

interface GruppeProps {
  titel: string
  children: ReactNode
}

export function Gruppe({ titel, children }: GruppeProps) {
  return (
    <div>
      <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {titel}
      </h4>
      {children}
    </div>
  )
}
