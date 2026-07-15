// RelationenBereich — Master-Detail für die Relation-Vorlagen (Gerüst
// 2026-07-15, ersetzt die frühere schmale RelationList). Links die
// Vorlagen mit Verb+NR-Chip, rechts das Detail: die Parameter in genau
// ihrer Reihenfolge MIT Klartext-Bedeutung, die SoftEngine-Syntaxzeile
// und „Verwendung in dieser Maske". Bearbeiten inline (FormularKarte).
// Löschen fragt nach, mit Warnung bei Benutzung (Registry-Scan über
// kind-'relation'-Properties, kein `if type===`).

import { useState } from 'react'
import { Plus, Share2 } from 'lucide-react'
import { Button } from '@/ui/atoms/button'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import type { RelationTemplate } from '../../core/data/relations'
import { useEditor } from '../../state/useEditor'
import { useRelations } from '../../state/useRelations'
import { RelationForm } from './RelationForm'
import { bausteinName, parameterBedeutung, VERB_KURZ, VERB_LABELS } from './helfer'

export function RelationenBereich() {
  const store = useRelations()
  const ed = useEditor()
  const [auswahlId, setAuswahlId] = useState<string | null>(store.list[0]?.id ?? null)
  const [modus, setModus] = useState<'lesen' | 'bearbeiten' | 'neu'>('lesen')

  const auswahl = store.list.find((r) => r.id === auswahlId) ?? store.list[0]

  // Bausteine der Maske, die diese Vorlage benutzen (Klarnamen).
  const verwendungFor = (id: string): string[] =>
    Object.values(ed.tree)
      .filter((n) => {
        const def = getBlockDefinition(n.type)
        return def?.customProperties.some(
          (p) => p.kind === 'relation' && n.props[p.attributeName] === id,
        )
      })
      .map((n) => bausteinName(n))

  function loeschen(r: RelationTemplate) {
    const frage = verwendungFor(r.id).length > 0
      ? `„${r.name}" wird in der Maske BENUTZT. Trotzdem löschen? Die Bausteine bleiben stehen, ihr Schreibweg ruht.`
      : `Relation „${r.name}" löschen?`
    if (!window.confirm(frage)) return
    store.remove(r.id)
    setModus('lesen')
  }

  return (
    <div className="flex min-h-0 flex-1">
      {/* Master */}
      <div className="flex w-64 shrink-0 flex-col border-r border-border">
        <div className="border-b border-border p-2">
          <Button variant="outline" size="sm" className="w-full" onClick={() => setModus('neu')}>
            <Plus size={14} /> Neue Relation
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {store.list.map((r) => {
            const aktiv = modus !== 'neu' && auswahl?.id === r.id
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => { setAuswahlId(r.id); setModus('lesen') }}
                className={`mb-1 w-full rounded-md border px-2.5 py-1 text-left text-xs transition-colors ${
                  aktiv ? 'border-ring bg-secondary' : 'border-transparent hover:bg-secondary/60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Share2 size={12} className="shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate font-medium">{r.name}</span>
                  <span className="shrink-0 rounded-full bg-secondary px-1.5 font-mono text-[10px] text-muted-foreground">
                    {VERB_KURZ[r.verb]} {r.nr}
                  </span>
                </div>
              </button>
            )
          })}
          {store.list.length === 0 && (
            <p className="px-1 py-2 text-xs text-muted-foreground">
              Noch keine Relationen.
            </p>
          )}
        </div>
      </div>

      {/* Detail */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {modus === 'neu' && <RelationForm onClose={() => setModus('lesen')} />}
        {modus === 'bearbeiten' && auswahl && (
          <RelationForm relation={auswahl} onClose={() => setModus('lesen')} />
        )}
        {modus === 'lesen' && !auswahl && (
          <p className="text-xs text-muted-foreground">Keine Relation gewählt.</p>
        )}
        {modus === 'lesen' && auswahl && (
          <div className="flex flex-col gap-4 text-xs">
            <div>
              <h3 className="text-sm font-semibold">{auswahl.name}</h3>
              <p className="text-muted-foreground">
                {VERB_LABELS[auswahl.verb]} · Nummer {auswahl.nr}
              </p>
            </div>

            <div>
              <h4 className="mb-1 font-semibold uppercase tracking-wide text-[10px] text-muted-foreground">
                Parameter — in genau dieser Reihenfolge
              </h4>
              <div className="overflow-hidden rounded-md border border-border">
                <table className="w-full">
                  <tbody>
                    {auswahl.params.map((p, i) => (
                      <tr key={i} className="border-b border-border last:border-b-0">
                        <td className="w-6 px-2 py-1 text-right font-mono text-[11px] text-muted-foreground">
                          {i + 1}
                        </td>
                        <td className="px-2 py-1 font-mono text-[11px]">{p}</td>
                        <td className="px-2 py-1 text-muted-foreground">{parameterBedeutung(p)}</td>
                      </tr>
                    ))}
                    {auswahl.params.length === 0 && (
                      <tr><td className="px-2.5 py-1 text-muted-foreground">Keine Parameter.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="mb-1 font-semibold uppercase tracking-wide text-[10px] text-muted-foreground">
                So sieht SoftEngine diesen Aufruf
              </h4>
              <code className="block overflow-x-auto rounded-md bg-secondary px-2.5 py-1.5 font-mono text-[11px]">
                {auswahl.verb}[{[auswahl.nr, ...auswahl.params].join('!')}]
              </code>
            </div>

            <div>
              <h4 className="mb-1 font-semibold uppercase tracking-wide text-[10px] text-muted-foreground">
                Verwendung in dieser Maske
              </h4>
              {verwendungFor(auswahl.id).length === 0 ? (
                <p className="text-muted-foreground">Von keinem Baustein verwendet.</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {verwendungFor(auswahl.id).map((name, i) => (
                    <li key={i} className="rounded-md border border-border bg-card px-2.5 py-1">
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex gap-2 border-t border-border pt-3">
              <Button size="sm" onClick={() => setModus('bearbeiten')}>Bearbeiten</Button>
              <Button variant="outline" size="sm" onClick={() => loeschen(auswahl)}>
                Löschen…
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
