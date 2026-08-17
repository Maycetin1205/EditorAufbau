// SchrittListe — die Schritte EINER Aktionskette, untereinander.
//
// Volle Breite, eine Zeile je Schritt (Nutzer-Vorgabe 2026-08-17). Die erste
// Fassung stellte sie in eine 22-rem-Spalte neben das Formular; dort stand
// von jeder Zeile die Haelfte. Jetzt traegt die Zeile alles nebeneinander:
// Nummer, was der Schritt tut, die eigene Notiz, die Knoepfe — und der
// angeklickte Schritt klappt DARUNTER auf, statt in eine zweite Spalte
// auszuwandern. Damit bleibt beim Ausfuellen sichtbar, was drumherum
// passiert.
//
// Jede Zeile traegt zwei Angaben (s. ./schrittZusammenfassung):
//   Zeile 1  was der Schritt IST   (Vorlagenname bzw. Schritt-Art)
//   Zeile 2  was er TUT            (Zielfeld  <-  Herkunft des Werts)
// Zeile 2 faellt weg, wo nichts aufloesbar ist — eine leere Zeile waere nur
// Hoehe (Regel 7: nichts erfinden).
//
// Eingerueckt steht, was sich auf das Ergebnis eines frueheren Schritts
// beruft: so ist zu sehen, welche Schreib-Schritte in den Satz gehen, den ein
// „neuen Satz anlegen" davor erzeugt hat.

import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, Copy, X } from '@/ui/zeichen'
import { IconButton } from '@/ui/atoms/icon-button'
import { TextInput } from '@/ui/atoms/text-input'
import { actionValueTargets, auswahlGeberImBaum } from '../../core/blocks/treeQuery'
import { ergebnisSchritteVor, stepTypeName, type ActionStep } from '../../core/data/aktionen'
import { formatRelationSyntax } from '../../core/data/relations'
import { stepProblem } from '../../core/data/schrittPruefung'
import { istFensterSeite } from '../../state/pageOps'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'
import { useRelations } from '../../state/useRelations'
import { istUngetaufteVorlage, relationAnzeige } from './relationAnzeige'
import { ankerSchrittId, schrittZusammenfassung } from './schrittZusammenfassung'

interface SchrittListeProps {
  steps: readonly ActionStep[]
  // Der aufgeklappte Schritt.
  aktivId?: string
  // Zeile angeklickt. Fehlt der Rueckkanal, sind die Zeilen nicht anklickbar.
  onWaehle?: (step: ActionStep) => void
  // Die Umbau-Knoepfe (hoch/runter/duplizieren/loeschen) und die Notiz. Ohne
  // `onAendern` ist die Liste reine Anzeige.
  onAendern?: (steps: ActionStep[]) => void
  // Was unter der aufgeklappten Zeile steht (das Schritt-Formular).
  aufgeklappt?: ReactNode
}

export function SchrittListe({
  steps, aktivId, onWaehle, onAendern, aufgeklappt,
}: SchrittListeProps) {
  const ed = useEditor()
  const relations = useRelations()
  const dataSources = useDataSources()

  const popupSeiten = ed.pages.filter(istFensterSeite)
  const actionValueRefs = actionValueTargets(ed.tree).map(({ node, spot }) => ({
    blockId: node.id,
    prop: spot.prop,
  }))
  // Auswahl-Geber der Maske — sonst bliebe ein Parameter „Feld der gewählten
  // Zeile" auf einem gelöschten Geber unauffällig und schlüge erst beim
  // Export zu.
  const geberIds = auswahlGeberImBaum(ed.tree).map((n) => n.id)

  const verschiebe = (from: number, to: number): void => {
    if (!onAendern) return
    const next = [...steps]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onAendern(next)
  }

  // Die eigene Beschriftung EINES Schritts. Leer heisst weg — ein leerer
  // String in jeder Maskendatei waere Ballast.
  const setzeNotiz = (at: number, text: string): void => {
    if (!onAendern) return
    const next = steps.map((s, i) => {
      if (i !== at) return s
      const kopie = { ...s }
      if (text.trim() === '') delete kopie.notiz
      else kopie.notiz = text
      return kopie
    })
    onAendern(next)
  }

  const dupliziere = (at: number): void => {
    if (!onAendern) return
    const quelle = steps[at]
    const kopie: ActionStep = quelle.type === 'START_TOOL'
      ? { ...quelle, toolParams: [...quelle.toolParams], id: crypto.randomUUID() }
      : quelle.type === 'RELATION'
        ? {
            ...quelle,
            params: quelle.params.map((binding) => ({ ...binding })),
            extraParams: quelle.extraParams.map((binding) => ({ ...binding })),
            id: crypto.randomUUID(),
          }
        : { ...quelle, id: crypto.randomUUID() }
    const next = [...steps]
    next.splice(at + 1, 0, kopie)
    onAendern(next)
  }

  return (
    <ol className="divide-y divide-border/70">
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
        const was = s.type === 'RELATION' && relation
          ? (istUngetaufteVorlage(relation) ? relationAnzeige(relation) : relation.name)
          : stepTypeName(s.type)
        const zus = schrittZusammenfassung(
          s, was, relation, ed.tree, dataSources.list,
          (id) => steps.findIndex((x) => x.id === id) + 1,
        )
        // Zielfeld schlaegt Tabelle: ein Schreib-Schritt sagt, WAS er
        // beschreibt; ein Schritt ohne Zielfeld (neuen Satz anlegen) sagt
        // wenigstens, WO.
        const naeher = [zus.ziel !== '' ? zus.ziel : zus.tabelle, zus.herkunft]
          .filter((t) => t !== '')
          .join('  ←  ')
        const anker = ankerSchrittId(s)
        const eingerueckt = anker !== '' && steps.some((x) => x.id === anker)

        return (
          <li key={s.id} className="border-b border-border/70 last:border-b-0">
            <div
              className={`flex items-center gap-2 border-l-2 py-1.5 pr-1 transition-colors ${
                eingerueckt ? 'pl-5' : 'pl-1'
              } ${
                problem !== null
                  ? 'border-amber-500 bg-amber-500/10'
                  : s.id === aktivId
                    ? 'border-primary bg-primary/10'
                    : 'border-transparent hover:bg-secondary/50'
              }`}
            >
              {/* w-6, nicht w-4: ab dem zehnten Schritt braucht „10." zwei
                  Ziffern und den Punkt. */}
              <span className="w-6 shrink-0 text-right text-[0.6875rem] tabular-nums text-muted-foreground">
                {i + 1}.
              </span>
              <button
                type="button"
                disabled={!onWaehle}
                onClick={() => onWaehle?.(s)}
                title={problem ?? (relation ? formatRelationSyntax(relation) : undefined)}
                className="min-w-0 flex-[3] text-left disabled:cursor-default"
              >
                <span className="block truncate text-xs">
                  {zus.was}
                  {s.type === 'START_TOOL' && s.toolNr.trim() !== '' ? ` — Nr. ${s.toolNr}` : ''}
                  {popupName ? ` — ${popupName}` : ''}
                  {problem !== null ? ' — unvollständig' : ''}
                </span>
                {naeher !== '' && (
                  <span className="block truncate text-[0.6875rem] text-muted-foreground">
                    {naeher}
                  </span>
                )}
              </button>
              {/* Die eigene Beschriftung. Sie steht IN der Zeile, nicht in
                  einer eigenen Spalte daneben: sie gehoert zum Schritt. */}
              {onAendern ? (
                <TextInput
                  aria-label={`Notiz zu Schritt ${i + 1}`}
                  placeholder="Notiz"
                  value={s.notiz ?? ''}
                  onChange={(e) => setzeNotiz(i, e.target.value)}
                  className="h-7 min-w-0 flex-[2] border-transparent bg-transparent text-[0.6875rem] hover:border-input focus:border-input"
                />
              ) : (
                s.notiz !== undefined && s.notiz !== '' && (
                  <span className="min-w-0 flex-[2] truncate text-[0.6875rem] text-muted-foreground">
                    {s.notiz}
                  </span>
                )
              )}
              {onAendern && (
                <span className="flex shrink-0 items-center">
                  <IconButton
                    aria-label={`Schritt ${i + 1} nach oben`}
                    disabled={i === 0}
                    onClick={() => verschiebe(i, i - 1)}
                  >
                    <ArrowUp size={12} />
                  </IconButton>
                  <IconButton
                    aria-label={`Schritt ${i + 1} nach unten`}
                    disabled={i === steps.length - 1}
                    onClick={() => verschiebe(i, i + 1)}
                  >
                    <ArrowDown size={12} />
                  </IconButton>
                  <IconButton
                    aria-label={`Schritt ${i + 1} duplizieren`}
                    onClick={() => dupliziere(i)}
                  >
                    <Copy size={12} />
                  </IconButton>
                  <IconButton
                    aria-label={`Schritt ${i + 1} löschen`}
                    onClick={() => onAendern(steps.filter((x) => x.id !== s.id))}
                  >
                    <X size={12} />
                  </IconButton>
                </span>
              )}
            </div>
            {/* Aufgeklappt: das Formular steht UNTER seiner Zeile, in voller
                Breite, die Liste bleibt drumherum stehen. */}
            {s.id === aktivId && aufgeklappt !== undefined && (
              <div className="border-t border-border bg-secondary/20 px-3 py-3">
                {aufgeklappt}
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
