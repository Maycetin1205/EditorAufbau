import { Link2, X } from '@/ui/zeichen'
import { IconButton } from '@/ui/atoms/icon-button'
import { TextInput } from '@/ui/atoms/text-input'
import { WaehlerKnopf, type WaehlerEintrag } from '@/ui/molecules/waehler'
import {
  ACTION_PARAM_SOURCES,
  AKTIONS_PLATZHALTER,
  type ActionParamBinding,
  type ActionParamSource,
  type ErgebnisSchritt,
} from '../../core/data/aktionen'
import { quellenKennung, type DataSource } from '../../core/data/dataSources'
import type { FeldUebernahmeZiel } from './feldUebernahme'
import {
  blockValueKey,
  type AuswahlGeberOption,
  type BlockValueOption,
  type ErfassungsOption,
} from './helfer'
import { PLATZHALTER_KLARTEXT } from './helfer'

const CONTEXT_EINTRAEGE: WaehlerEintrag[] = AKTIONS_PLATZHALTER.map((wert) => ({
  wert,
  name: wert,
  kennung: PLATZHALTER_KLARTEXT[wert] ?? '',
}))

const QUELLEN_NAMEN: Record<ActionParamSource, string> = {
  fixed: 'Fest',
  context: 'Ereigniswert',
  data_field: 'Datenfeld',
  block_value: 'Baustein',
  gewaehlte_zeile: 'Gewählte Zeile',
  erfassungszelle: 'Erfassungszelle',
  previous_result: 'Vorheriger Schritt',
  step_result: 'Ergebnis von Schritt',
  se_variable: 'SE VAR-Array',

  aus: 'Weggelassen',
}

function BindingValue({
  binding,
  dataSources,
  blockValues,
  geber,
  erfassungen,
  schritte,
  platzhalter,
  onChange,
}: {
  binding: ActionParamBinding
  dataSources: readonly DataSource[]
  blockValues: readonly BlockValueOption[]
  geber: readonly AuswahlGeberOption[]
  erfassungen: readonly ErfassungsOption[]
  schritte: readonly ErgebnisSchritt[]
  platzhalter?: string
  onChange: (binding: ActionParamBinding) => void
}) {
  if (binding.source === 'aus') {
    return (
      <div className="flex h-8 items-center rounded-md border border-input bg-secondary/50 px-2.5 text-xs text-muted-foreground">
        leer
      </div>
    )
  }
  if (binding.source === 'previous_result') {
    return (
      <div className="flex h-8 items-center rounded-md border border-input bg-secondary/50 px-2.5 text-xs text-muted-foreground">
        Ergebnis des vorherigen Schritts
      </div>
    )
  }
  if (binding.source === 'step_result') {
    const ziel = schritte.find((s) => s.id === binding.value)
    const quelle = dataSources.find((q) => q.id === ziel?.quelleId)
    const felder = quelle?.fields ?? []
    const feld = binding.ergebnisFeld ?? ''
    const setzeFeld = (wert: string) => {
      const naechste: ActionParamBinding = { ...binding }
      if (wert === '') delete naechste.ergebnisFeld
      else naechste.ergebnisFeld = wert
      onChange(naechste)
    }
    return (
      <div className="grid grid-cols-2 gap-1">
        <WaehlerKnopf
          bezeichnung="Ergebnis von Schritt"
          gruppen={[{
            key: 'schritte',
            eintraege: schritte.map((s) => ({ wert: s.id, name: `Schritt ${s.nr} — ${s.name}` })),
          }]}
          wert={binding.value}
          platzhalter={schritte.length === 0 ? '(kein GET-Schritt davor)' : '— wählen —'}
          onWaehle={(id) => {
            const naechste: ActionParamBinding = { ...binding, value: id }
            delete naechste.ergebnisFeld
            onChange(naechste)
          }}
        />
        {felder.length > 0 ? (
          <WaehlerKnopf
            bezeichnung="Feld des Ergebnisses"
            gruppen={[{
              key: 'felder',
              name: quelle?.name,
              kennung: quelle ? quellenKennung(quelle) : undefined,
              eintraege: felder.map((f) => ({ wert: f.code, name: f.label, kennung: f.code })),
            }]}
            wert={feld}
            leerText="— ganzes Ergebnis —"
            onWaehle={setzeFeld}
          />
        ) : (
          <TextInput
            aria-label="Feld des Ergebnisses"
            value={feld}
            placeholder="ganzes Ergebnis"
            onChange={(e) => setzeFeld(e.target.value)}
          />
        )}
      </div>
    )
  }
  if (binding.source === 'context') {
    return (
      <WaehlerKnopf
        bezeichnung="Ereigniswert"
        gruppen={[{ key: 'platzhalter', eintraege: CONTEXT_EINTRAEGE }]}
        wert={binding.value}
        onWaehle={(wert) => onChange({ ...binding, value: wert })}
      />
    )
  }
  if (binding.source === 'data_field') {
    const gewaehlteQuelle = dataSources.find((s) => s.id === binding.dataSourceId)
    return (
      <div className="grid grid-cols-2 gap-1">
        <WaehlerKnopf
          bezeichnung="Datenquelle"
          gruppen={[{
            key: 'quellen',
            eintraege: dataSources.map((s) => ({
              wert: s.id,
              name: s.name,
              kennung: quellenKennung(s),
            })),
          }]}
          wert={binding.dataSourceId ?? ''}
          platzhalter="— Quelle —"
          onWaehle={(id) => onChange({ ...binding, dataSourceId: id, value: '' })}
        />
        <WaehlerKnopf
          bezeichnung="Feld der Datenquelle"
          gruppen={[{
            key: 'felder',
            name: gewaehlteQuelle?.name,
            kennung: gewaehlteQuelle ? quellenKennung(gewaehlteQuelle) : undefined,
            eintraege: (gewaehlteQuelle?.fields ?? []).map((f) => ({
              wert: f.code,
              name: f.label,
              kennung: f.code,
            })),
          }]}
          wert={binding.value}
          platzhalter="— Feld —"
          onWaehle={(code) => onChange({ ...binding, value: code })}
        />
      </div>
    )
  }
  if (binding.source === 'gewaehlte_zeile') {
    const gewaehlter = geber.find((g) => g.blockId === binding.blockId)

    const geberEintraege: WaehlerEintrag[] = geber.map((g) => ({ wert: g.blockId, name: g.label }))
    if (binding.blockId && !gewaehlter) {
      geberEintraege.push({ wert: binding.blockId, name: '(gelöschter Baustein)' })
    }
    return (
      <div className="grid grid-cols-2 gap-1">
        <WaehlerKnopf
          bezeichnung="Auswahl-Geber"
          gruppen={[{ key: 'geber', eintraege: geberEintraege }]}
          wert={binding.blockId ?? ''}
          platzhalter="— Baustein —"
          onWaehle={(id) => onChange({ ...binding, blockId: id, value: '' })}
        />
        <WaehlerKnopf
          bezeichnung="Feld der gewählten Zeile"
          gruppen={[{
            key: 'felder',
            eintraege: (gewaehlter?.felder ?? []).map((f) => ({
              wert: f.code,
              name: f.label,
              kennung: f.code,
            })),
          }]}
          wert={binding.value}
          platzhalter="— Feld —"
          onWaehle={(code) => onChange({ ...binding, value: code })}
        />
      </div>
    )
  }
  if (binding.source === 'erfassungszelle') {
    const tabelle = erfassungen.find((t) => t.blockId === binding.blockId)
    const tabellenEintraege: WaehlerEintrag[] = erfassungen.map((t) => ({ wert: t.blockId, name: t.label }))
    if (binding.blockId && !tabelle) {
      tabellenEintraege.push({ wert: binding.blockId, name: '(gelöschter Baustein)' })
    }
    return (
      <div className="grid grid-cols-2 gap-1">
        <WaehlerKnopf
          bezeichnung="Tabelle mit Erfassungszeile"
          gruppen={[{ key: 'tabellen', eintraege: tabellenEintraege }]}
          wert={binding.blockId ?? ''}
          platzhalter="— Tabelle —"
          onWaehle={(id) => onChange({ ...binding, blockId: id, value: '' })}
        />
        <WaehlerKnopf
          bezeichnung="Spalte der Erfassungszeile"
          gruppen={[{
            key: 'spalten',
            eintraege: (tabelle?.spalten ?? []).map((s) => ({
              wert: String(s.index),
              name: s.titel,
            })),
          }]}
          wert={binding.value}
          platzhalter="— Spalte —"
          onWaehle={(index) => onChange({ ...binding, value: index })}
        />
      </div>
    )
  }
  if (binding.source === 'block_value') {
    const current = binding.blockId ? blockValueKey(binding.blockId, binding.value) : ''
    return (
      <WaehlerKnopf
        bezeichnung="Baustein"
        gruppen={[{
          key: 'bausteine',
          eintraege: blockValues.map((o) => ({ wert: o.key, name: o.label })),
        }]}
        wert={current}
        platzhalter="— Baustein —"
        onWaehle={(key) => {
          const gewaehlt = blockValues.find((option) => option.key === key)
          onChange(gewaehlt
            ? { source: 'block_value', blockId: gewaehlt.blockId, value: gewaehlt.prop }
            : { source: 'block_value', blockId: '', value: '' })
        }}
      />
    )
  }

  return (
    <TextInput
      value={binding.value}
      placeholder={platzhalter ?? (binding.source === 'se_variable' ? 'Variablenname' : 'Wert')}
      onChange={(e) => onChange({ ...binding, value: e.target.value })}
    />
  )
}

export function ParameterZeile({
  label,
  binding,
  dataSources,
  blockValues,
  geber,
  erfassungen,
  schritte,
  platzhalter,
  entfernen,
  ausloeser,
  onChange,
  onAusloeser,
}: {
  label: string
  binding: ActionParamBinding
  dataSources: readonly DataSource[]
  blockValues: readonly BlockValueOption[]
  geber: readonly AuswahlGeberOption[]
  erfassungen: readonly ErfassungsOption[]
  schritte: readonly ErgebnisSchritt[]

  platzhalter?: string

  entfernen?: { label: string; onClick: () => void }
  ausloeser?: FeldUebernahmeZiel
  onChange: (binding: ActionParamBinding) => void
  onAusloeser?: (anchor: HTMLElement) => void
}) {
  const setSource = (source: ActionParamSource) => {
    if (source === 'block_value' && blockValues.length === 1) {
      const target = blockValues[0]
      onChange({ source, blockId: target.blockId, value: target.prop })
      return
    }

    if (source === 'gewaehlte_zeile' && geber.length === 1) {
      onChange({ source, blockId: geber[0].blockId, value: '' })
      return
    }
    if (source === 'erfassungszelle' && erfassungen.length === 1) {
      onChange({ source, blockId: erfassungen[0].blockId, value: '' })
      return
    }
    const value = source === 'context'
      ? 'VALUE'

      : source === 'step_result' && schritte.length === 1
        ? schritte[0].id
        : ''
    onChange({ source, value })
  }

  const herkunft: WaehlerEintrag[] = ACTION_PARAM_SOURCES.map((source) => ({
    wert: source,
    name: QUELLEN_NAMEN[source],
    deaktiviert: (source === 'data_field' && dataSources.length === 0)
      || (source === 'block_value' && blockValues.length === 0)
      || (source === 'gewaehlte_zeile' && geber.length === 0)
      || (source === 'erfassungszelle' && erfassungen.length === 0)
      || (source === 'step_result' && schritte.length === 0),
  }))

  if (binding.source === 'aus') {
    herkunft.push({ wert: 'aus', name: QUELLEN_NAMEN.aus, deaktiviert: true })
  }

  return (
    <div className="flex items-center gap-1">
      <span className="w-14 shrink-0 truncate font-mono text-[0.6875rem]" title={label}>{label}</span>

      <div className="min-w-0 flex-1">
        <WaehlerKnopf
          bezeichnung={`Herkunft für ${label}`}
          gruppen={[{ key: 'herkunft', eintraege: herkunft }]}
          wert={binding.source}
          onWaehle={(source) => setSource(source as ActionParamSource)}
        />
      </div>
      <div
        className="min-w-0 flex-1"
        onKeyDown={(e) => {
          if (e.key !== 'Enter' || !ausloeser || !onAusloeser) return
          e.preventDefault()
          onAusloeser(e.currentTarget)
        }}
      >
        <BindingValue
          binding={binding}
          dataSources={dataSources}
          blockValues={blockValues}
          geber={geber}
          erfassungen={erfassungen}
          schritte={schritte}
          platzhalter={platzhalter}
          onChange={onChange}
        />
      </div>
      {ausloeser && onAusloeser && (
        <IconButton
          aria-label={ausloeser === 'feld' ? 'Feld übernehmen' : 'Tabelle übernehmen'}
          onClick={(e) => onAusloeser(e.currentTarget)}
        >
          <Link2 size={13} />
        </IconButton>
      )}
      {entfernen && (
        <IconButton aria-label={entfernen.label} onClick={entfernen.onClick}>
          <X size={13} />
        </IconButton>
      )}
    </div>
  )
}
