// RelationList
// Kap. 5.5: die Relation-Vorlagen-Bibliothek neben der Baustein- und der
// Datenquellen-Bibliothek (CLAUDE.md Kap. 5.5). Anlegen/Bearbeiten/Löschen —
// die Vorlagen gehören dem Bediener (RelationStore). Sichtbar sind nur
// Anzeigenamen, Technikwerte (Verb-Kürzel als Kontext, NR) begleiten sie.
// Löschen fragt nach (Bedienlogik 5), mit deutlicher Warnung, wenn die
// Vorlage gerade in der Maske benutzt wird (Registry-Scan über die
// customProperties mit kind 'relation', kein `if type===`): der Block bleibt
// dann stehen, sein Schreibweg ruht.

import { useState } from 'react'
import { Pencil, Plus, Share2, X } from 'lucide-react'
import { Button } from '@/ui/atoms/button'
import { IconButton } from '@/ui/atoms/icon-button'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import type { RelationTemplate } from '../../core/data/relations'
import { useEditor } from '../../state/useEditor'
import { useRelations } from '../../state/useRelations'
import { RelationForm } from './RelationForm'

// Kürzel der Verben für die kompakte Listenzeile (Kontext, kein Anzeigename).
const VERB_KURZ: Record<RelationTemplate['verb'], string> = {
  GET_RELATION: 'GET',
  PUT_RELATION: 'PUT',
  PUTADD_RELATION: 'PUTADD',
}

export function RelationList() {
  const store = useRelations()
  const ed = useEditor()
  // null = kein Formular; 'neu' = Anlegen; sonst die Vorlage in Bearbeitung.
  const [formular, setFormular] = useState<'neu' | RelationTemplate | null>(null)

  // Wird die Vorlage gerade von einem Block der Maske benutzt? Registry-
  // getrieben: ein Block mit einer kind-'relation'-Property, deren Wert die id
  // trägt (kein `if type===`).
  const inBenutzung = (id: string): boolean =>
    Object.values(ed.tree).some((n) => {
      const def = getBlockDefinition(n.type)
      return def?.customProperties.some(
        (p) => p.kind === 'relation' && n.props[p.attributeName] === id,
      )
    })

  function loeschen(r: RelationTemplate) {
    const frage = inBenutzung(r.id)
      ? `„${r.name}" wird in der Maske BENUTZT. Trotzdem löschen? Die Bausteine bleiben stehen, ihr Schreibweg ruht.`
      : `Relation „${r.name}" löschen?`
    if (!window.confirm(frage)) return
    store.remove(r.id)
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="outline"
        size="sm"
        className="mb-1 w-full"
        onClick={() => setFormular('neu')}
      >
        <Plus size={14} /> Neue Relation
      </Button>
      {store.list.map((r) => (
        <div
          key={r.id}
          className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] items-center gap-1.5 rounded-md border border-border bg-card py-1 pl-2.5 pr-1 text-xs"
        >
          <Share2 size={13} className="shrink-0 text-muted-foreground" />
          <span className="truncate font-medium">{r.name}</span>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {VERB_KURZ[r.verb]} {r.nr}
          </span>
          <IconButton
            aria-label={`${r.name} bearbeiten`}
            className="size-6"
            onClick={() => setFormular(r)}
          >
            <Pencil size={12} />
          </IconButton>
          <IconButton
            aria-label={`${r.name} löschen`}
            className="size-6"
            onClick={() => loeschen(r)}
          >
            <X size={13} />
          </IconButton>
        </div>
      ))}
      {store.list.length === 0 && (
        <p className="px-1 py-2 text-xs text-muted-foreground">
          Noch keine Relationen — oben anlegen.
        </p>
      )}
      {formular !== null && (
        <RelationForm
          relation={formular === 'neu' ? undefined : formular}
          onClose={() => setFormular(null)}
        />
      )}
    </div>
  )
}
