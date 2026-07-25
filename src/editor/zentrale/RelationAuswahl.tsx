// RelationAuswahl — Vorlagen-Suche + -Liste fuer den Relation-Schritt.
//
// Aus StepForm herausgeloest (2026-07-24): eigener Zustand (welcher Tab),
// eigene Aufgabe (eine Vorlage finden und waehlen). Das Formular reicht nur
// die gefilterten Eintraege herein.
//
// Lesen (GET) und Schreiben (PUT/PUTADD) stehen NIE gemischt (Nutzer
// 2026-07-22): zwei Mini-Tabs statt gestapelter Abschnitte — derselbe
// Umschalter (SegmentControl) wie im Inspector und im Steuerungs-Filter.
//
// Die volle Relations-Syntax ist NIE Anzeigetext (Regel 3): sichtbar ist der
// Klarname bzw. „VERB · Nr." bei ungetauften Vorlagen; die Syntax lebt als
// Hover-Tooltip und als Suchtreffer.

import { useState } from 'react'
import { Search } from 'lucide-react'
import { TextInput } from '@/ui/atoms/text-input'
import {
  formatRelationSyntax,
  relationGroup,
  type RelationGroup,
  type RelationTemplate,
} from '../../core/data/relations'
import { SegmentControl } from '../inspector/controls/SegmentControl'
import { istUngetaufteVorlage, relationAnzeige } from './relationAnzeige'
import { RELATION_GRUPPEN } from './helfer'

export function RelationAuswahl({
  label,
  eintraege,
  relationId,
  suche,
  onSuche,
  onSelect,
}: {
  label: string
  eintraege: readonly RelationTemplate[]
  relationId: string
  suche: string
  onSuche: (value: string) => void
  onSelect: (id: string) => void
}) {
  // Startwert = Gruppe der gewaehlten Vorlage (beim Bearbeiten), sonst „Lesen".
  const [tab, setTab] = useState<RelationGroup>(() => {
    const gewaehlt = eintraege.find((entry) => entry.id === relationId)
    return gewaehlt ? relationGroup(gewaehlt) : 'lesen'
  })
  // Die Suche findet in BEIDEN Gruppen (Nutzer 2026-07-22): eintraege ist
  // schon suchgefiltert; wir zaehlen je Gruppe und springen zum Tab mit
  // Treffern, wenn der aktive leer ist — Lesen/Schreiben bleiben getrennt.
  const lesen = eintraege.filter((entry) => relationGroup(entry) === 'lesen')
  const schreiben = eintraege.filter((entry) => relationGroup(entry) === 'schreiben')
  const zaehler: Record<RelationGroup, number> = { lesen: lesen.length, schreiben: schreiben.length }
  const anderer: RelationGroup = tab === 'lesen' ? 'schreiben' : 'lesen'
  const aktiv: RelationGroup = zaehler[tab] === 0 && zaehler[anderer] > 0 ? anderer : tab
  const sichtbar = aktiv === 'lesen' ? lesen : schreiben
  // Trefferzahl nur bei aktiver Suche an die Tabs (sonst nur Lesen | Schreiben).
  const sucht = suche.trim().length > 0
  const tabOptionen = RELATION_GRUPPEN.map((gruppe) => ({
    ...gruppe,
    label: sucht ? `${gruppe.label} · ${zaehler[gruppe.value as RelationGroup]}` : gruppe.label,
  }))
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-medium">{label}</span>
      <div className="relative">
        <Search size={13} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <TextInput
          aria-label={`${label} suchen`}
          value={suche}
          placeholder="Name, Nummer oder Syntax"
          className="pl-7"
          onChange={(e) => onSuche(e.target.value)}
        />
      </div>
      <SegmentControl
        name="Lesen oder Schreiben"
        value={aktiv}
        options={tabOptionen}
        onChange={(value) => setTab(value as RelationGroup)}
      />
      {/* Nur der aktive Tab; leere Gruppe zeigt „Keine Treffer"
          (die Suche darüber bleibt aktiv). */}
      <div className="max-h-36 divide-y divide-border overflow-y-auto border-y border-border">
        {sichtbar.map((entry) => {
          const ungetauft = istUngetaufteVorlage(entry)
          return (
            <button
              key={entry.id}
              type="button"
              title={formatRelationSyntax(entry)}
              onClick={() => onSelect(entry.id)}
              className={`w-full px-2 py-1.5 text-left text-xs ${
                entry.id === relationId ? 'bg-secondary font-medium' : 'hover:bg-secondary/60'
              }`}
            >
              <span className="block truncate">{relationAnzeige(entry)}</span>
              {!ungetauft && (
                <span className="block truncate text-[10px] text-muted-foreground">
                  {entry.verb} · Nr. {entry.nr}
                </span>
              )}
            </button>
          )
        })}
        {sichtbar.length === 0 && (
          <p className="px-2 py-1 text-xs text-muted-foreground">Keine Treffer.</p>
        )}
      </div>
    </div>
  )
}
