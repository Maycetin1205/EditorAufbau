import { useState } from 'react'
import { Search } from '@/ui/zeichen'
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
  // Start auf der Gruppe der gewählten Relation, sonst auf der nicht-leeren;
  // danach gewinnt der Klick (s. RelationenBereich, gleiche Lehre).
  const [tab, setTab] = useState<RelationGroup>(() => {
    const gewaehlt = eintraege.find((entry) => entry.id === relationId)
    if (gewaehlt) return relationGroup(gewaehlt)
    return eintraege.some((entry) => relationGroup(entry) === 'lesen') || eintraege.length === 0
      ? 'lesen'
      : 'schreiben'
  })

  const lesen = eintraege.filter((entry) => relationGroup(entry) === 'lesen')
  const schreiben = eintraege.filter((entry) => relationGroup(entry) === 'schreiben')
  const zaehler: Record<RelationGroup, number> = { lesen: lesen.length, schreiben: schreiben.length }
  const aktiv: RelationGroup = tab
  const sichtbar = aktiv === 'lesen' ? lesen : schreiben

  const sucht = suche.trim().length > 0
  const tabOptionen = RELATION_GRUPPEN.map((gruppe) => ({
    ...gruppe,
    label: sucht ? `${gruppe.label} · ${zaehler[gruppe.value as RelationGroup]}` : gruppe.label,
  }))
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[0.6875rem] font-medium">{label}</span>
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
                <span className="block truncate text-[0.625rem] text-muted-foreground">
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
