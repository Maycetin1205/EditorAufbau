// Ein Schritt im bestehenden Ablauf: Baustein -> Ereignis -> Aktion.
// START_TOOL und RELATION teilen nur die Huelle; ihre Felder bleiben durch
// das typisierte Kernmodell strikt getrennt.
// START_TOOL traegt nur die Nummer — KEINE Parameter im Formular
// (Nutzer-Entscheidung 2026-07-15); toolParams bleibt im Modell fuer
// Altbestaende und die Laufzeit, gespeichert wird leer.
//
// Wohnt seit dem R3-Feinschliff (2026-07-21) in der umgeblätterten
// Inspector-Ansicht (kein Modal/Overlay mehr): Titel + Zurückblättern +
// Escape stellt der Inspector über die SidePanel-Rückzeile, das Formular
// liefert nur seinen Inhalt. Für die 340-px-Spalte stehen die
// Parameterzeilen einzeilig (Name | Quelle | Wert, R3-Abschluss 2026-07-21)
// — Felder und Verhalten unverändert, nur das Layout ist schmaler.

import { useState, type SelectHTMLAttributes } from 'react'
import { ChevronDown, Link2, Plus, Search, X } from 'lucide-react'
import { Button } from '@/ui/atoms/button'
import { IconButton } from '@/ui/atoms/icon-button'
import { TextInput } from '@/ui/atoms/text-input'
import { Field } from '@/ui/molecules/field'
import { cn } from '@/lib/utils'
import {
  ACTION_PARAM_SOURCES,
  AKTIONS_PLATZHALTER,
  STEP_TYPES,
  defaultRelationParams,
  ergebnisSchritteVor,
  stepProblem,
  type ActionParamBinding,
  type ActionParamSource,
  type ActionStep,
  type ErgebnisSchritt,
  type StepTypeKey,
} from '../../core/data/aktionen'
import type { DataSource } from '../../core/data/dataSources'
import {
  formatRelationSyntax,
  relationGroup,
  relationMatchesSearch,
  type RelationGroup,
  type RelationTemplate,
} from '../../core/data/relations'
import { istUngetaufteVorlage, relationAnzeige } from './relationAnzeige'
import { FeldUebernahmePicker } from './FeldUebernahmePicker'
import {
  feldUebernahmeArt,
  feldUebernehmen,
  type FeldUebernahmeZiel,
  uebernahmeIdbQuellen,
  uebernahmeQuellen,
} from './feldUebernahme'
import { RELATION_GRUPPEN } from './helfer'
import { useRelations } from '../../state/useRelations'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'
import { SegmentControl } from '../inspector/controls/SegmentControl'
import { SelectControl } from '../inspector/controls/SelectControl'

interface StepFormProps {
  step?: ActionStep
  // Die AKTUELLE Kette des Ereignisses — für die Auswahl „Ergebnis von
  // Schritt N" (nur GET-Schritte VOR diesem Schritt sind wählbar).
  kette: readonly ActionStep[]
  onSave: (step: ActionStep) => void
  onClose: () => void
}

// Anzeige = der Platzhalter selbst, wie er in der Relations-Syntax steht
// (Fachbegriff-Entscheidung 2026-07-15, keine erfundenen Klarnamen).
const CONTEXT_OPTIONS = AKTIONS_PLATZHALTER.map((value) => ({ value, label: value }))

// Klarnamen der Parameterquellen — Editor-Tabelle (Muster optionColors):
// kurz genug für die schmale Quelle-Spalte (Nutzer-Go 2026-07-22), und die
// Namen bleiben aus dem Runtime-Bündel heraus (dort zählen nur die Keys).
const QUELLEN_NAMEN: Record<ActionParamSource, string> = {
  fixed: 'Fest',
  context: 'Ereigniswert',
  data_field: 'Datenfeld',
  previous_result: 'Vorheriger Schritt',
  step_result: 'Ergebnis von Schritt',
  se_variable: 'SE VAR-Array',
}

// Das EINE handgebaute Auswahlfeld der Schritt-Bedienung: eigener Pfeil mit
// reserviertem Platz rechts (pr-6), damit der gewählte Text NIE unter dem
// Aufklapp-Pfeil verschwindet (Nutzer-Korrektur 2026-07-22 — der Browser-
// Pfeil liegt sonst AUF dem Text). Layout-Klassen (Breite/Flex) gehören auf
// die Hülle; das <select> füllt sie immer ganz.
function SchrittSelect({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cn('relative', className)}>
      <select
        {...props}
        className="h-7 w-full appearance-none rounded border border-input bg-background pl-2 pr-6 text-xs"
      >
        {children}
      </select>
      <ChevronDown
        size={12}
        className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}

function BindingValue({
  binding,
  dataSources,
  schritte,
  onChange,
}: {
  binding: ActionParamBinding
  dataSources: readonly DataSource[]
  schritte: readonly ErgebnisSchritt[]
  onChange: (binding: ActionParamBinding) => void
}) {
  if (binding.source === 'previous_result') {
    return (
      <div className="flex h-7 items-center rounded border border-input bg-secondary/50 px-2 text-xs text-muted-foreground">
        Ergebnis des vorherigen Schritts
      </div>
    )
  }
  if (binding.source === 'step_result') {
    // Der Zwischenspeicher des Nutzers (2026-07-17): GET-Schritte davor,
    // per Position angeboten — kein Namen-Vergeben, nur anklicken.
    return (
      <SchrittSelect
        value={binding.value}
        onChange={(e) => onChange({ ...binding, value: e.target.value })}
      >
        <option value="">
          {schritte.length === 0 ? '(kein GET-Schritt davor)' : '— wählen —'}
        </option>
        {schritte.map((s) => (
          <option key={s.id} value={s.id}>{`Schritt ${s.nr} — ${s.name}`}</option>
        ))}
      </SchrittSelect>
    )
  }
  if (binding.source === 'context') {
    return (
      <SchrittSelect
        value={binding.value}
        onChange={(e) => onChange({ ...binding, value: e.target.value })}
      >
        <option value="">— wählen —</option>
        {CONTEXT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </SchrittSelect>
    )
  }
  if (binding.source === 'data_field') {
    const selectedSource = dataSources.find((source) => source.id === binding.dataSourceId)
    return (
      <div className="grid grid-cols-2 gap-1">
        <SchrittSelect
          className="min-w-0"
          value={binding.dataSourceId ?? ''}
          onChange={(e) => onChange({ ...binding, dataSourceId: e.target.value, value: '' })}
        >
          <option value="">— Quelle —</option>
          {dataSources.map((source) => (
            <option key={source.id} value={source.id}>{source.name}</option>
          ))}
        </SchrittSelect>
        <SchrittSelect
          className="min-w-0"
          value={binding.value}
          onChange={(e) => onChange({ ...binding, value: e.target.value })}
        >
          <option value="">— Feld —</option>
          {selectedSource?.fields.map((field) => (
            <option key={field.code} value={field.code}>{field.label}</option>
          ))}
        </SchrittSelect>
      </div>
    )
  }
  return (
    <TextInput
      value={binding.value}
      placeholder={binding.source === 'se_variable' ? 'Variablenname' : 'Wert'}
      onChange={(e) => onChange({ ...binding, value: e.target.value })}
    />
  )
}

function BindingRow({
  label,
  binding,
  dataSources,
  schritte,
  removable = false,
  ausloeser,
  onChange,
  onAusloeser,
  onRemove,
}: {
  label: string
  binding: ActionParamBinding
  dataSources: readonly DataSource[]
  schritte: readonly ErgebnisSchritt[]
  removable?: boolean
  ausloeser?: FeldUebernahmeZiel
  onChange: (binding: ActionParamBinding) => void
  onAusloeser?: (anchor: HTMLElement) => void
  onRemove?: () => void
}) {
  const setSource = (source: ActionParamSource) => {
    const value = source === 'context'
      ? 'VALUE'
      // Genau EIN GET davor: direkt vorwählen — der häufigste Fall
      // (GET Index holen → benutzen) kommt dann ohne zweiten Klick aus.
      : source === 'step_result' && schritte.length === 1
        ? schritte[0].id
        : ''
    onChange({ source, value })
  }

  // EINE Zeile je Parameter (R3-Abschluss 2026-07-21): Name | Quelle | Wert
  // nebeneinander — halbiert die Höhe der Parameterliste in der schmalen
  // Panel-Ansicht. Lange Technikwerte kürzen sich, der Tooltip zeigt sie
  // ganz. Felder/Verhalten unverändert.
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-16 shrink-0 truncate font-mono text-[11px]" title={label}>{label}</span>
      <SchrittSelect
        className="w-32 shrink-0"
        value={binding.source}
        onChange={(e) => setSource(e.target.value as ActionParamSource)}
      >
        {ACTION_PARAM_SOURCES.map((source) => (
          <option
            key={source}
            value={source}
            disabled={(source === 'data_field' && dataSources.length === 0)
              || (source === 'step_result' && schritte.length === 0)}
          >
            {QUELLEN_NAMEN[source]}
          </option>
        ))}
      </SchrittSelect>
      <div
        className="min-w-0 flex-1"
        onKeyDown={(e) => {
          if (e.key !== 'Enter' || !ausloeser || !onAusloeser) return
          e.preventDefault()
          onAusloeser(e.currentTarget)
        }}
      >
        <BindingValue binding={binding} dataSources={dataSources} schritte={schritte} onChange={onChange} />
      </div>
      {ausloeser && onAusloeser && (
        <IconButton
          aria-label={ausloeser === 'feld' ? 'Feld übernehmen' : 'Tabelle übernehmen'}
          onClick={(e) => onAusloeser(e.currentTarget)}
        >
          <Link2 size={13} />
        </IconButton>
      )}
      {removable && onRemove && (
        <IconButton aria-label={`${label} entfernen`} onClick={onRemove}><X size={13} /></IconButton>
      )}
    </div>
  )
}

// Vorlagen-Suche + -Liste für den Relation-Schritt.
function RelationAuswahl({
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
  // Lesen (GET) und Schreiben (PUT/PUTADD) stehen NIE gemischt (Nutzer
  // 2026-07-22): zwei Mini-Tabs statt gestapelter Abschnitte — derselbe
  // Umschalter (SegmentControl) wie im Inspector und im Steuerungs-Filter.
  // Startwert = Gruppe der gewählten Vorlage (beim Bearbeiten), sonst „Lesen".
  const [tab, setTab] = useState<RelationGroup>(() => {
    const gewaehlt = eintraege.find((entry) => entry.id === relationId)
    return gewaehlt ? relationGroup(gewaehlt) : 'lesen'
  })
  // Die Suche findet in BEIDEN Gruppen (Nutzer 2026-07-22): eintraege ist
  // schon suchgefiltert; wir zählen je Gruppe und springen zum Tab mit
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
      {/* Je Zeile der Klarname (bzw. „VERB · Nr." bei ungetauften Vorlagen);
          die volle Syntax ist NIE Anzeigetext — nur Hover-Tooltip + Suche
          (R3-Abschluss 2026-07-21, Regel 3). Nur der aktive Tab; leere Gruppe
          zeigt „Keine Treffer" (die Suche darüber bleibt aktiv). */}
      <div className="max-h-36 overflow-y-auto border-y border-border py-1">
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

export function StepForm({ step, kette, onSave, onClose }: StepFormProps) {
  const relations = useRelations()
  const dataSources = useDataSources()
  const ed = useEditor()
  // Wählbare GET-Ergebnisse: nur Schritte VOR diesem (neuer Schritt = Ende).
  const ergebnisSchritte = ergebnisSchritteVor(kette, step?.id, relations.list)
  const ergebnisIds = ergebnisSchritte.map((s) => s.id)
  // Popup-Seiten der Maske (P-B): Auswahl per Klarname, gespeichert wird
  // die stabile Seiten-id (übersteht Umbenennen).
  const popupSeiten = ed.pages.filter((seite) => !seite.istHauptseite)
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

  // Auslöser sitzt an der Positions-Zeile (Nutzer-Entscheidung 2026-07-22):
  // der Picker öffnet direkt unter dem angeklickten „Feld wählen"-Link.
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

  const currentUebernahmeCode = relation
    ? relation.params
        .map((_, index) => bindingFor(index))
        .find((binding) => binding.source === 'data_field')?.value ?? ''
    : ''

  function candidate(): ActionStep {
    const id = step?.id ?? crypto.randomUUID()
    if (typ === 'POPUP_OPEN' || typ === 'POPUP_CLOSE') {
      return { id, type: typ, resultKey: '', popupId }
    }
    if (typ === 'START_TOOL') {
      return {
        id,
        type: 'START_TOOL',
        resultKey: '',
        toolNr: toolNr.trim(),
        toolParams: [],
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
      // Das freie Feld „Ergebnisname" ist entfernt (Nutzer 2026-07-22 —
      // „Ergebnis von Schritt" ersetzt es); ein vorhandener Alt-Name bleibt
      // beim Bearbeiten erhalten, die Laufzeit liest ihn unverändert.
      resultKey: step?.resultKey ?? '',
    }
  }

  const popupIds = popupSeiten.map((seite) => seite.id)
  const problem = stepProblem(candidate(), relations.list, dataSources.list, popupIds, ergebnisIds)

  function speichern() {
    const next = candidate()
    if (stepProblem(next, relations.list, dataSources.list, popupIds, ergebnisIds)) {
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
        <Field label="Popup" error={zeigeFehler ? problem ?? '' : ''}>
          {(field) => (
            <SchrittSelect
              {...field}
              value={popupId}
              onChange={(e) => setPopupId(e.target.value)}
            >
              <option value="">
                {popupSeiten.length === 0 ? '(keine Popup-Seite vorhanden)' : '— wählen —'}
              </option>
              {popupSeiten.map((seite) => (
                <option key={seite.id} value={seite.id}>{seite.name}</option>
              ))}
            </SchrittSelect>
          )}
        </Field>
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
                  const parameterArt = feldUebernahmeArt(raw)
                  const ausloeser = parameterArt === 'relid'
                    ? 'idb'
                    : parameterArt === 'pos' && feldAusloeserAktiv
                      ? 'feld'
                      : undefined
                  const row = (
                    <BindingRow
                      label={`${index + 1}. ${raw === '' ? '(leer)' : raw}`}
                      binding={bindingFor(index)}
                      dataSources={dataSources.list}
                      schritte={ergebnisSchritte}
                      ausloeser={ausloeser}
                      onChange={(binding) => setBinding(index, binding)}
                      onAusloeser={ausloeser
                        ? (anchor) => oeffneUebernahmePicker(ausloeser, anchor)
                        : undefined}
                    />
                  )
                  return <div key={index}>{row}</div>
                })}
                {relation.params.length === 0 && (
                  <p className="text-xs text-muted-foreground">Keine Parameter.</p>
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
                <span className="text-[11px] font-medium">Zusatzparameter</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExtraParams((current) => [...current, { source: 'fixed', value: '' }])}
                >
                  <Plus size={14} /> Parameter
                </Button>
              </div>
              {extraParams.map((binding, index) => (
                <BindingRow
                  key={index}
                  label={`${index + 1}.`}
                  binding={binding}
                  dataSources={dataSources.list}
                  schritte={ergebnisSchritte}
                  removable
                  onChange={(next) => setExtraParams((current) => current.map((value, at) => at === index ? next : value))}
                  onRemove={() => setExtraParams((current) => current.filter((_, at) => at !== index))}
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
