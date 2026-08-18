import { useState } from 'react'
import { Plus } from '@/ui/zeichen'
import { Button } from '@/ui/atoms/button'
import { TextInput } from '@/ui/atoms/text-input'
import { Field } from '@/ui/molecules/field'
import {
  STEP_TYPES,
  defaultRelationParams,
  ergebnisSchritteVor,
  type ActionParamBinding,
  type ActionStep,
  type StepTypeKey,
} from '../../core/data/aktionen'
import { stepProblem } from '../../core/data/schrittPruefung'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import {
  actionValueTargets,
  auswahlGeberImBaum,
  erfassungsTraegerImBaum,
} from '../../core/blocks/treeQuery'
import { relationMatchesSearch } from '../../core/data/relations'
import { FeldUebernahmePicker } from './FeldUebernahmePicker'
import {
  feldUebernahmeArt,
  feldUebernehmen,
  type FeldUebernahmeZiel,
  uebernahmeIdbQuellen,
  uebernahmeQuellen,
} from './feldUebernahme'
import { bausteinName } from '../../core/blocks/bausteinName'
import { istFensterSeite } from '../../state/pageOps'
import {
  auswahlGeberOptionen,
  blockValueKey,
  erfassungsOptionen,
  type BlockValueOption,
} from './helfer'
import { ParameterZeile } from './ParameterZeile'
import { RelationAuswahl } from './RelationAuswahl'
import { WaehlerKnopf } from '@/ui/molecules/waehler'
import { useRelations } from '../../state/useRelations'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'
import { SelectControl } from '../inspector/controls/SelectControl'

interface StepFormProps {
  step?: ActionStep

  kette: readonly ActionStep[]
  onSave: (step: ActionStep) => void
  onClose: () => void
}

export function StepForm({ step, kette, onSave, onClose }: StepFormProps) {
  const relations = useRelations()
  const dataSources = useDataSources()
  const ed = useEditor()

  const ergebnisSchritte = ergebnisSchritteVor(kette, step?.id, relations.list)
  const ergebnisIds = ergebnisSchritte.map((s) => s.id)

  const popupSeiten = ed.pages.filter(istFensterSeite)
  const blockValues: BlockValueOption[] = actionValueTargets(ed.tree).map(({ node, spot }) => {
    const def = getBlockDefinition(node.type)
    const name = bausteinName(node, dataSources.list)
    const mehrereStellen = (def?.actionValueSpots?.length ?? 0) > 1
    return {
      key: blockValueKey(node.id, spot.prop),
      blockId: node.id,
      prop: spot.prop,
      label: mehrereStellen ? `${name} — ${spot.label}` : name,
    }
  })
  const actionValueRefs = blockValues.map(({ blockId, prop }) => ({ blockId, prop }))

  const geber = auswahlGeberOptionen(auswahlGeberImBaum(ed.tree), dataSources.list)
  const geberIds = geber.map((g) => g.blockId)
  const erfassungen = erfassungsOptionen(erfassungsTraegerImBaum(ed.tree), dataSources.list)
  const [typ, setTyp] = useState<StepTypeKey>(step?.type ?? 'START_TOOL')
  const [toolNr, setToolNr] = useState(step?.type === 'START_TOOL' ? step.toolNr : '')
  const [popupId, setPopupId] = useState(
    step?.type === 'POPUP_OPEN' || step?.type === 'POPUP_CLOSE' ? step.popupId : '',
  )
  const [relationId, setRelationId] = useState(
    step?.type === 'RELATION' ? step.relationId : '',
  )
  const initialRelation = step?.type === 'RELATION' ? relations.get(step.relationId) : undefined
  const [relationParams, setRelationParams] = useState<ActionParamBinding[]>(() => {
    if (step?.type !== 'RELATION') return []
    if (initialRelation && step.params.length !== initialRelation.params.length) {
      return defaultRelationParams(initialRelation)
    }
    return step.params.map((binding) => ({ ...binding }))
  })
  const [extraParams, setExtraParams] = useState<ActionParamBinding[]>(
    step?.type === 'RELATION' ? step.extraParams.map((binding) => ({ ...binding })) : [],
  )
  const [suche, setSuche] = useState('')
  const [zeigeFehler, setZeigeFehler] = useState(false)
  const [pickerZiel, setPickerZiel] = useState<FeldUebernahmeZiel | null>(null)
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 })
  const [uebernahmeBestaetigung, setUebernahmeBestaetigung] = useState('')

  const relation = relations.get(relationId)
  const sichtbareRelationen = relations.list.filter((entry) => relationMatchesSearch(entry, suche))
  const uebernahmeFelder = uebernahmeQuellen(dataSources.list)
  const uebernahmeQuellenListe = uebernahmeIdbQuellen(dataSources.list)
  const defaultParams = relation ? defaultRelationParams(relation) : []
  const bindingFor = (index: number): ActionParamBinding =>
    relationParams[index] ?? defaultParams[index] ?? { source: 'fixed', value: '' }

  const platzhalterFor = (raw: string): string => (raw === '' ? '(leer)' : raw)

  const ausgelassen = relation
    ? relation.params.map((_, index) => index).filter((i) => bindingFor(i).source === 'aus')
    : []
  const holeAlleZurueck = () => {
    setRelationParams((current) => current.map((binding, index) =>
      binding.source === 'aus' ? defaultParams[index] ?? { source: 'fixed', value: '' } : binding))
  }
  const setBinding = (index: number, binding: ActionParamBinding) => {
    setUebernahmeBestaetigung('')
    setRelationParams((current) => {
      const next = relation ? defaultRelationParams(relation) : [...current]
      current.forEach((value, at) => { if (at < next.length) next[at] = value })
      next[index] = binding
      return next
    })
  }

  function selectRelation(id: string) {
    const selected = relations.get(id)
    setRelationId(id)
    setPickerZiel(null)
    setUebernahmeBestaetigung('')
    if (!selected) return
    setRelationParams(defaultRelationParams(selected))
    if (!selected.allowExtraParams) setExtraParams([])
  }

  function oeffneUebernahmePicker(ziel: FeldUebernahmeZiel, anchor: HTMLElement) {
    const rect = anchor.getBoundingClientRect()
    setPickerPosition({ top: rect.bottom + 4, left: rect.left })
    setPickerZiel(ziel)
  }

  function uebernehmeFeld(sourceId: string, code: string) {
    if (!relation || !pickerZiel) return
    const source = dataSources.list.find((entry) => entry.id === sourceId)
    if (!source) return
    const field = pickerZiel === 'feld'
      ? source.fields.find((entry) => entry.code === code)
      : undefined
    if (pickerZiel === 'feld' && !field) return
    const aktuelleBindungen = relation.params.map((_, index) => bindingFor(index))
    const result = feldUebernehmen(aktuelleBindungen, relation, source, code, pickerZiel)
    const details = result.gesetzt.map((treffer) => {
      const name = treffer.art === 'pos'
        ? 'Position'
        : treffer.art === 'len'
          ? 'Länge'
          : 'Tabelle'
      return `${name} ${treffer.wert}`
    })
    setRelationParams(result.params)
    setPickerZiel(null)
    const suffix = details.length > 0 ? ' - ' + details.join(' - ') : ''
    setUebernahmeBestaetigung((field?.label ?? source.name) + ' übernommen' + suffix)
  }

  const feldAusloeserAktiv = relation
    ? relation.params.some((raw) => feldUebernahmeArt(raw) === 'pos')
      && relation.params.some((raw) => feldUebernahmeArt(raw) === 'len')
    : false

  // Übernommen wird als fixed-Wert (feldUebernehmen) — der Haken im Picker
  // entsteht also aus den POS/LEN-Parametern, nicht aus einer Feld-Bindung.
  const uebernommenerWert = (art: 'pos' | 'len'): string | null => {
    if (!relation) return null
    const index = relation.params.findIndex((raw) => feldUebernahmeArt(raw) === art)
    if (index < 0) return null
    const binding = bindingFor(index)
    return binding.source === 'fixed' && /^\d+$/.test(binding.value) ? binding.value : null
  }
  const uebernahmePos = uebernommenerWert('pos')
  const uebernahmeLen = uebernommenerWert('len')
  const currentUebernahmeCode = uebernahmePos !== null && uebernahmeLen !== null
    ? `${uebernahmePos}_${uebernahmeLen}`
    : ''

  function candidate(): ActionStep {
    const id = step?.id ?? crypto.randomUUID()
    // Das Formular zeigt toolParams/resultKey nicht an (Entscheidung: nur die
    // Nummer) — geladene Werte darf Speichern trotzdem nicht wegwerfen.
    if (typ === 'POPUP_OPEN' || typ === 'POPUP_CLOSE') {
      return { id, type: typ, resultKey: step?.type === typ ? step.resultKey : '', popupId }
    }
    if (typ === 'START_TOOL') {
      const vorher = step?.type === 'START_TOOL' ? step : undefined
      return {
        id,
        type: 'START_TOOL',
        resultKey: vorher?.resultKey ?? '',
        toolNr: toolNr.trim(),
        toolParams: vorher ? [...vorher.toolParams] : [],
      }
    }
    const normalizedParams = relation
      ? relation.params.map((_, index) => {
          const binding = bindingFor(index)
          return { ...binding, value: binding.value.trim() }
        })
      : []
    return {
      id,
      type: 'RELATION',
      relationId,
      params: normalizedParams,
      extraParams: extraParams.map((binding) => ({ ...binding, value: binding.value.trim() })),

      resultKey: step?.resultKey ?? '',
    }
  }

  const popupIds = popupSeiten.map((seite) => seite.id)
  const problem = stepProblem(
    candidate(), relations.list, dataSources.list, popupIds, ergebnisIds, actionValueRefs, geberIds,
  )

  function speichern() {
    const next = candidate()
    if (stepProblem(next, relations.list, dataSources.list, popupIds, ergebnisIds, actionValueRefs, geberIds)) {
      setZeigeFehler(true)
      return
    }
    onSave(next)
    onClose()
  }

  return (
    <div className="flex flex-col gap-3">
      <SelectControl
        label="Aktion"
        value={typ}
        options={STEP_TYPES.map((entry) => ({ value: entry.key, label: entry.name }))}
        onChange={(value) => {
          setTyp(value as StepTypeKey)
          setPickerZiel(null)
          setUebernahmeBestaetigung('')
        }}
      />

      {(typ === 'POPUP_OPEN' || typ === 'POPUP_CLOSE') && (
        /* Kein Leer-Eintrag: ohne Popup meldet stepProblem "kein Popup" —
           dieser Zustand darf also nicht waehlbar sein. */
        <WaehlerKnopf
          label="Popup"
          fehler={zeigeFehler ? problem ?? '' : ''}
          bezeichnung="Popup"
          gruppen={[{
            key: 'popups',
            eintraege: popupSeiten.map((seite) => ({ wert: seite.id, name: seite.name })),
          }]}
          wert={popupId}
          platzhalter={popupSeiten.length === 0 ? '(keine Popup-Seite vorhanden)' : '— wählen —'}
          onWaehle={setPopupId}
        />
      )}

      {typ === 'START_TOOL' && (
        <Field label="Nummer" error={zeigeFehler ? problem ?? '' : ''}>
          {(field) => (
            <TextInput
              {...field}
              value={toolNr}
              className="w-28"
              onChange={(e) => setToolNr(e.target.value)}
            />
          )}
        </Field>
      )}

      {typ === 'RELATION' && (
        <>
          <RelationAuswahl
            label="Relation"
            eintraege={sichtbareRelationen}
            relationId={relationId}
            suche={suche}
            onSuche={setSuche}
            onSelect={selectRelation}
          />

          {relation && (
            <>
              <div className="flex flex-col gap-2">
                {relation.params.map((raw, index) => {
                  if (bindingFor(index).source === 'aus') return null
                  const parameterArt = feldUebernahmeArt(raw)
                  const ausloeser = parameterArt === 'relid'
                    ? 'idb'
                    : parameterArt === 'pos' && feldAusloeserAktiv
                      ? 'feld'
                      : undefined
                  return (
                    <ParameterZeile
                      key={index}
                      label={`${index + 1}. ${raw === '' ? '(leer)' : raw}`}
                      binding={bindingFor(index)}
                      dataSources={dataSources.list}
                      blockValues={blockValues}
                      geber={geber}
                      erfassungen={erfassungen}
                      schritte={ergebnisSchritte}
                      platzhalter={platzhalterFor(raw)}
                      entfernen={{
                        label: `Parameter ${index + 1} für diese Aktion weglassen`,
                        onClick: () => setBinding(index, { source: 'aus', value: '' }),
                      }}
                      ausloeser={ausloeser}
                      onChange={(binding) => setBinding(index, binding)}
                      onAusloeser={ausloeser
                        ? (anchor) => oeffneUebernahmePicker(ausloeser, anchor)
                        : undefined}
                    />
                  )
                })}
                {relation.params.length === 0 && (
                  <p className="text-xs text-muted-foreground">Keine Parameter.</p>
                )}
                {ausgelassen.length > 0 && (
                  <div className="flex items-center justify-between text-[0.6875rem] text-muted-foreground">
                    <span>
                      {`Weggelassen: ${ausgelassen.map((i) => i + 1).join(', ')} — gehen leer raus`}
                    </span>
                    <Button variant="outline" size="sm" onClick={holeAlleZurueck}>
                      Zurückholen
                    </Button>
                  </div>
                )}
              </div>
              {uebernahmeBestaetigung && (
                <p className="text-xs text-muted-foreground">{uebernahmeBestaetigung}</p>
              )}
              {pickerZiel && (
                <FeldUebernahmePicker
                  sources={uebernahmeQuellenListe}
                  fields={uebernahmeFelder}
                  ziel={pickerZiel}
                  current={currentUebernahmeCode}
                  top={pickerPosition.top}
                  left={pickerPosition.left}
                  onPick={uebernehmeFeld}
                  onClose={() => setPickerZiel(null)}
                />
              )}
            </>
          )}

          {relation?.allowExtraParams && (
            <div className="flex flex-col gap-2 border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <span className="text-[0.6875rem] font-medium">Zusatzparameter</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExtraParams((current) => [...current, { source: 'fixed', value: '' }])}
                >
                  <Plus size={14} /> Parameter
                </Button>
              </div>
              {extraParams.map((binding, index) => (
                <ParameterZeile
                  key={index}
                  label={`${index + 1}.`}
                  binding={binding}
                  dataSources={dataSources.list}
                  blockValues={blockValues}
                  geber={geber}
                  erfassungen={erfassungen}
                  schritte={ergebnisSchritte}
                  entfernen={{
                    label: `Zusatzparameter ${index + 1} entfernen`,
                    onClick: () => setExtraParams((current) => current.filter((_, at) => at !== index)),
                  }}
                  onChange={(next) => setExtraParams((current) => current.map((value, at) => at === index ? next : value))}
                />
              ))}
            </div>
          )}

        </>
      )}

      {zeigeFehler && problem && typ === 'RELATION' && (
        <p className="text-xs text-destructive">{problem}</p>
      )}

      <div className="flex justify-end gap-2 border-t border-border pt-3">
        <Button variant="outline" size="sm" onClick={onClose}>Abbrechen</Button>
        <Button size="sm" onClick={speichern}>Speichern</Button>
      </div>
    </div>
  )
}
