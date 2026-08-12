// AktionenSektion — Inspector-Abschnitt „Aktionen" (R3, 2026-07-21).
// Die Ereignis-Ketten wohnen jetzt AM BAUSTEIN statt in der Steuerung:
// erscheint nach Inhalt/Daten, aber NUR für Bausteine, die per Registry
// Ereignisse deklarieren (blockEvents — kein `if typ===`). Je Ereignis eine
// kompakte Schrittliste mit „+ Schritt", Bearbeiten/Löschen/Sortieren/
// Duplizieren — Verhalten, Wortlaut und Undo-Kopplung sind exakt die der
// früheren AktionenBereich-Detailspalte (nur ohne deren Master-Liste, weil
// der Baustein hier schon feststeht). Ein Bedienschritt = EIN Undo-Eintrag
// (editor.updateBlockEvents), Ctrl+Z gilt auch hier.
//
// Das Anlegen/Bearbeiten eines Schritts blättert das Inspector-Panel um
// (R3-Feinschliff 2026-07-21): diese Sektion meldet den Wunsch nur über
// `onEditStep` — den Zustand und die UNVERÄNDERTE StepForm besitzt der
// Inspector (Rückzeile „← <Baustein>", 340 px, Escape blättert zurück).
// Sortieren/Löschen/Duplizieren bleiben hier (kein Umblättern nötig).

import { ArrowDown, ArrowUp, Copy, Pencil, Plus, X } from '@/ui/zeichen'
import { IconButton } from '@/ui/atoms/icon-button'
import type { BlockNode } from '../../core/blocks/BlockData'
import type { BlockEventSpec } from '../../core/blocks/BlockDefinition'
import { actionValueTargets, auswahlGeberImBaum } from '../../core/blocks/treeQuery'
import {
  ergebnisSchritteVor,
  stepTypeName,
  type ActionStep,
} from '../../core/data/aktionen'
import { stepProblem } from '../../core/data/schrittPruefung'
import { formatRelationSyntax } from '../../core/data/relations'
import { istUngetaufteVorlage, relationAnzeige } from '../zentrale/relationAnzeige'
import { istFensterSeite } from '../../state/pageOps'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'
import { useRelations } from '../../state/useRelations'

interface AktionenSektionProps {
  block: BlockNode
  events: readonly BlockEventSpec[]
  // Schritt anlegen (step weggelassen) oder bearbeiten — der Inspector
  // blättert daraufhin das Panel zur StepForm um.
  onEditStep: (eventKey: string, step?: ActionStep) => void
}

export function AktionenSektion({ block, events, onEditStep }: AktionenSektionProps) {
  const ed = useEditor()
  const relations = useRelations()
  const dataSources = useDataSources()

  const kette = (eventKey: string): ActionStep[] => ed.tree[block.id]?.events?.[eventKey] ?? []

  // Kette eines Ereignisses ersetzen (alle Mutationen laufen hierüber).
  const setChain = (eventKey: string, steps: ActionStep[]): void => {
    const node = ed.tree[block.id]
    if (!node) return
    ed.updateBlockEvents(block.id, { ...(node.events ?? {}), [eventKey]: steps })
  }

  const moveStep = (eventKey: string, steps: ActionStep[], from: number, to: number): void => {
    const next = [...steps]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setChain(eventKey, next)
  }

  const duplicateStep = (eventKey: string, steps: ActionStep[], at: number): void => {
    const source = steps[at]
    const copy: ActionStep = source.type === 'START_TOOL'
      ? { ...source, toolParams: [...source.toolParams], id: crypto.randomUUID() }
      : source.type === 'RELATION'
        ? {
            ...source,
            params: source.params.map((binding) => ({ ...binding })),
            extraParams: source.extraParams.map((binding) => ({ ...binding })),
            id: crypto.randomUUID(),
          }
        : { ...source, id: crypto.randomUUID() }
    const next = [...steps]
    next.splice(at + 1, 0, copy)
    setChain(eventKey, next)
  }

  // Nur FENSTER-Seiten: eine Ansicht kann kein Popup-Schritt öffnen.
  const popupSeiten = ed.pages.filter(istFensterSeite)
  const actionValueRefs = actionValueTargets(ed.tree).map(({ node, spot }) => ({
    blockId: node.id,
    prop: spot.prop,
  }))
  // Auswahl-Geber der Maske — sonst bliebe ein Parameter „Feld der gewählten
  // Zeile" auf einem gelöschten Geber in dieser Liste unauffällig und
  // schlüge erst beim Export zu.
  const geberIds = auswahlGeberImBaum(ed.tree).map((n) => n.id)

  return (
    <div className="flex flex-col gap-2">
      {events.map((ev) => {
        const steps = kette(ev.key)
        return (
          <div key={ev.key} className="text-xs">
            {/* Genau EINE Zeile je Ereignis: Name links, kleiner „+"-Knopf
                rechts. Kein Leerzustand-Text, keine eigene Knopf-Zeile — ein
                Ereignis ohne Schritte kostet null zusätzliche Höhe (Punkt 10,
                Nutzer 2026-07-21). Schritte hängen als dichte Zeilen darunter. */}
            <div className="flex min-h-7 items-center justify-between gap-2">
              <span className="text-[0.6875rem] font-semibold text-foreground">{ev.name}</span>
              <IconButton
                aria-label="Schritt hinzufügen"
                title="Schritt hinzufügen"
                onClick={() => onEditStep(ev.key)}
              >
                <Plus size={14} />
              </IconButton>
            </div>
            {steps.length > 0 && (
              <ol className="mt-0.5 divide-y divide-border/70">
                {steps.map((s, i) => {
                  const problem = stepProblem(
                    s, relations.list, dataSources.list, popupSeiten.map((seite) => seite.id),
                    ergebnisSchritteVor(steps, s.id, relations.list).map((g) => g.id),
                    actionValueRefs,
                    geberIds,
                  )
                  const relation = s.type === 'RELATION' ? relations.get(s.relationId) : undefined
                  const popupName = s.type === 'POPUP_OPEN' || s.type === 'POPUP_CLOSE'
                    ? popupSeiten.find((seite) => seite.id === s.popupId)?.name
                    : undefined
                  return (
                    <li
                      key={s.id}
                      className={`flex items-center gap-0.5 border-l-2 px-1 py-1.5 transition-colors ${
                        problem !== null
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-transparent hover:bg-secondary/50'
                      }`}
                    >
                      {/* w-5, nicht w-4: ab dem zehnten Schritt braucht „10."
                          zwei Ziffern und den Punkt — in 16px stand der Punkt
                          halb ausserhalb. */}
                      <span className="w-5 shrink-0 text-right text-muted-foreground">{i + 1}.</span>
                      {/* Nie die Syntax-Wurst als Zeilentext (Regel 3): Vorlagen
                          zeigen Klarname bzw. „VERB · Nr."; die volle Syntax
                          liegt im Tooltip (R3-Abschluss 2026-07-21). */}
                      <span
                        className="min-w-0 flex-1 truncate"
                        title={problem ?? (relation ? formatRelationSyntax(relation) : undefined)}
                      >
                        {s.type === 'RELATION' && relation
                          ? (istUngetaufteVorlage(relation)
                              ? relationAnzeige(relation)
                              : `${stepTypeName(s.type)} — ${relation.name}`)
                          : stepTypeName(s.type)}
                        {s.type === 'START_TOOL' && s.toolNr.trim() !== '' ? ` — Nr. ${s.toolNr}` : ''}
                        {popupName ? ` — ${popupName}` : ''}
                        {problem !== null ? ' — unvollständig' : ''}
                      </span>
                      <IconButton
                        aria-label={`Schritt ${i + 1} nach oben`}
                        disabled={i === 0}
                        onClick={() => moveStep(ev.key, steps, i, i - 1)}
                      >
                        <ArrowUp size={12} />
                      </IconButton>
                      <IconButton
                        aria-label={`Schritt ${i + 1} nach unten`}
                        disabled={i === steps.length - 1}
                        onClick={() => moveStep(ev.key, steps, i, i + 1)}
                      >
                        <ArrowDown size={12} />
                      </IconButton>
                      <IconButton
                        aria-label={`Schritt ${i + 1} bearbeiten`}
                        onClick={() => onEditStep(ev.key, s)}
                      >
                        <Pencil size={12} />
                      </IconButton>
                      <IconButton
                        aria-label={`Schritt ${i + 1} duplizieren`}
                        onClick={() => duplicateStep(ev.key, steps, i)}
                      >
                        <Copy size={12} />
                      </IconButton>
                      <IconButton
                        aria-label={`Schritt ${i + 1} löschen`}
                        onClick={() => setChain(ev.key, steps.filter((x) => x.id !== s.id))}
                      >
                        <X size={12} />
                      </IconButton>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        )
      })}
    </div>
  )
}
