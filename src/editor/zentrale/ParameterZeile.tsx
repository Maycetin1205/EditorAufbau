// ParameterZeile — EINE Zeile eines Aktions-Parameters: Name | Quelle | Wert.
//
// Aus StepForm herausgeloest (2026-07-24), weil die Datei ueber den
// 500-Zeilen-Deckel gewachsen war. Der Schnitt ist der natuerliche: hier die
// EINZELNE Parameterzeile mit ihren Wert-Steuerungen, drueben das Formular,
// das die Zeilen anordnet.
//
// Einzeilig, damit die Parameterliste in der schmalen Inspector-Spalte
// (340 px) nicht doppelt so hoch wird wie noetig. Lange Technikwerte kuerzen
// sich, der Tooltip zeigt sie ganz.

import { Link2, X } from 'lucide-react'
import { IconButton } from '@/ui/atoms/icon-button'
import { TextInput } from '@/ui/atoms/text-input'
import {
  ACTION_PARAM_SOURCES,
  AKTIONS_PLATZHALTER,
  type ActionParamBinding,
  type ActionParamSource,
  type ErgebnisSchritt,
} from '../../core/data/aktionen'
import type { DataSource } from '../../core/data/dataSources'
import type { FeldUebernahmeZiel } from './feldUebernahme'
import { blockValueKey, type AuswahlGeberOption, type BlockValueOption } from './helfer'
import { SchrittSelect } from '@/ui/atoms/schritt-select'

// Anzeige = der Platzhalter selbst, wie er in der Relations-Syntax steht
// (Fachbegriff-Entscheidung 2026-07-15, keine erfundenen Klarnamen).
const CONTEXT_OPTIONS = AKTIONS_PLATZHALTER.map((value) => ({ value, label: value }))

// Klarnamen der Parameterquellen — Editor-Tabelle (Muster optionColors):
// kurz genug fuer die schmale Quelle-Spalte (Nutzer-Go 2026-07-22), und die
// Namen bleiben aus dem Runtime-Buendel heraus (dort zaehlen nur die Keys).
const QUELLEN_NAMEN: Record<ActionParamSource, string> = {
  fixed: 'Fest',
  context: 'Ereigniswert',
  data_field: 'Datenfeld',
  block_value: 'Baustein',
  gewaehlte_zeile: 'Gewählte Zeile',
  previous_result: 'Vorheriger Schritt',
  step_result: 'Ergebnis von Schritt',
  se_variable: 'SE VAR-Array',
  // Nie im Auswahlfeld angeboten (nicht in ACTION_PARAM_SOURCES). Der Name
  // steht hier, weil die Tabelle jede Quelle kennen muss.
  //
  // ACHTUNG (nachgelesen 2026-08-10): Hier stand, die Zeile eines
  // abgeschalteten Parameters werde „gar nicht erst gezeichnet". Das stimmt
  // nicht — ParameterZeile zeichnet IMMER. Ein Parameter auf 'aus' sieht
  // deshalb heute so aus:
  //   - das <select> hat keinen passenden <option> und zeigt irgendetwas
  //     anderes an, meist den ersten Eintrag. Der Zustand ist unsichtbar.
  //   - BindingValue faellt durch alle Zweige bis zum TextInput und zeigt den
  //     grauen Platzhalter, also den VORLAGENWERT — mit der Aussage „ohne
  //     eigene Eingabe wird das geschickt". Bei 'aus' wird ein LEERER String
  //     geschickt. Der Platzhalter sagt an dieser Stelle das Gegenteil.
  // Beides ist ein echter Bedienfehler und gehoert zu Etappe A1; hier wird nur
  // der Kommentar geradegerueckt, damit ihn niemand fuer erledigt haelt.
  aus: 'Weggelassen',
}

// Die Wert-Steuerung EINES Parameters — welche es ist, bestimmt die Quelle.
function BindingValue({
  binding,
  dataSources,
  blockValues,
  geber,
  schritte,
  platzhalter,
  onChange,
}: {
  binding: ActionParamBinding
  dataSources: readonly DataSource[]
  blockValues: readonly BlockValueOption[]
  geber: readonly AuswahlGeberOption[]
  schritte: readonly ErgebnisSchritt[]
  platzhalter?: string
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
    // Links: die GET-Schritte davor, per Position angeboten — kein
    // Namen-Vergeben, nur anklicken (Nutzer-Entscheidung 2026-07-17).
    //
    // Rechts: WELCHES Feld des Ergebnisses (2026-08-07). Ohne Wahl gilt das
    // ganze Ergebnis — genau wie vorher. Die Felder kommen aus der Quelle des
    // Ziel-Schritts; kennt er keine (der haeufige Fall — ein GET-Schritt
    // braucht keine Datenquelle), wird der Feldcode getippt statt geraten.
    const ziel = schritte.find((s) => s.id === binding.value)
    const felder = dataSources.find((q) => q.id === ziel?.quelleId)?.fields ?? []
    const feld = binding.ergebnisFeld ?? ''
    const setzeFeld = (wert: string) => {
      const naechste: ActionParamBinding = { ...binding }
      if (wert === '') delete naechste.ergebnisFeld
      else naechste.ergebnisFeld = wert
      onChange(naechste)
    }
    return (
      <div className="grid grid-cols-2 gap-1">
        <SchrittSelect
          className="min-w-0"
          aria-label="Ergebnis von Schritt"
          value={binding.value}
          onChange={(e) => {
            // Anderer Schritt = andere Antwort: ein Feldcode der alten laese
            // in der neuen still nichts (dieselbe Linie wie der Quellwechsel
            // bei „Datenfeld").
            const naechste: ActionParamBinding = { ...binding, value: e.target.value }
            delete naechste.ergebnisFeld
            onChange(naechste)
          }}
        >
          <option value="">
            {schritte.length === 0 ? '(kein GET-Schritt davor)' : '— wählen —'}
          </option>
          {schritte.map((s) => (
            <option key={s.id} value={s.id}>{`Schritt ${s.nr} — ${s.name}`}</option>
          ))}
        </SchrittSelect>
        {felder.length > 0 ? (
          <SchrittSelect
            className="min-w-0"
            aria-label="Feld des Ergebnisses"
            value={feld}
            onChange={(e) => setzeFeld(e.target.value)}
          >
            <option value="">— ganzes Ergebnis —</option>
            {felder.map((f) => (
              <option key={f.code} value={f.code}>{f.label}</option>
            ))}
          </SchrittSelect>
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
  if (binding.source === 'gewaehlte_zeile') {
    // Zwei Auswahlfelder wie bei „Datenfeld": erst WER die Auswahl gibt,
    // dann WELCHES Feld seiner Zeile. Die Felder kommen aus der Quelle des
    // Gebers — die gewaehlte Zeile stammt von dort, andere Felder gaebe es
    // in ihr gar nicht (Regel 7: nichts erfinden).
    const gewaehlter = geber.find((g) => g.blockId === binding.blockId)
    return (
      <div className="grid grid-cols-2 gap-1">
        <SchrittSelect
          className="min-w-0"
          aria-label="Auswahl-Geber"
          value={binding.blockId ?? ''}
          onChange={(e) => onChange({ ...binding, blockId: e.target.value, value: '' })}
        >
          <option value="">— Baustein —</option>
          {geber.map((g) => (
            <option key={g.blockId} value={g.blockId}>{g.label}</option>
          ))}
          {/* Geber geloescht: den Zustand benennen statt still leer (Regel 4);
              der Preflight blockt den Export dazu im Klartext. */}
          {binding.blockId && !gewaehlter && (
            <option value={binding.blockId}>(gelöschter Baustein)</option>
          )}
        </SchrittSelect>
        <SchrittSelect
          className="min-w-0"
          aria-label="Feld der gewählten Zeile"
          value={binding.value}
          onChange={(e) => onChange({ ...binding, value: e.target.value })}
        >
          <option value="">— Feld —</option>
          {gewaehlter?.felder.map((f) => (
            <option key={f.code} value={f.code}>{f.label}</option>
          ))}
        </SchrittSelect>
      </div>
    )
  }
  if (binding.source === 'block_value') {
    const current = binding.blockId ? blockValueKey(binding.blockId, binding.value) : ''
    return (
      <SchrittSelect
        value={current}
        onChange={(e) => {
          const selected = blockValues.find((option) => option.key === e.target.value)
          onChange(selected
            ? { source: 'block_value', blockId: selected.blockId, value: selected.prop }
            : { source: 'block_value', blockId: '', value: '' })
        }}
      >
        <option value="">— Baustein —</option>
        {blockValues.map((option) => (
          <option key={option.key} value={option.key}>{option.label}</option>
        ))}
      </SchrittSelect>
    )
  }
  // Der Platzhalter zeigt grau, was OHNE eigene Eingabe gilt: den Wert aus der
  // Relations-Syntax. Frueher stand dieser Wert als echter Text im Feld — der
  // Bauer sah zehn ausgefuellte Felder und musste raten, welche davon er
  // selbst gesetzt hatte. Grau heisst: kommt aus der Vorlage, fasst du nichts
  // an, wird genau das geschickt.
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
  schritte: readonly ErgebnisSchritt[]
  // Was OHNE eigene Eingabe gilt, grau im Feld. Leer = kein Vorlagenwert.
  platzhalter?: string
  // Das × am Zeilenende. ZWEI Bedeutungen, darum kommt die Beschriftung von
  // aussen: ein Zusatzparameter verschwindet ganz, ein Vorlagen-Parameter
  // KANN nicht verschwinden (seine Position gehoert zur SoftEngine-Syntax) —
  // er faellt auf den Vorlagenwert zurueck. Fehlt der Eintrag, gibt es kein ×.
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
    // Genau EIN Auswahl-Geber in der Maske: direkt vorwaehlen — dann bleibt
    // nur noch das Feld zu klicken (dieselbe Abkuerzung wie oben).
    if (source === 'gewaehlte_zeile' && geber.length === 1) {
      onChange({ source, blockId: geber[0].blockId, value: '' })
      return
    }
    const value = source === 'context'
      ? 'VALUE'
      // Genau EIN GET davor: direkt vorwählen — der häufigste Fall
      // (GET Index holen → benutzen) kommt dann ohne zweiten Klick aus.
      : source === 'step_result' && schritte.length === 1
        ? schritte[0].id
        : ''
    onChange({ source, value })
  }

  return (
    <div className="flex items-center gap-1">
      <span className="w-14 shrink-0 truncate font-mono text-[0.6875rem]" title={label}>{label}</span>
      {/* Teilt sich den Platz mit dem Wert, statt auf 96px festgenagelt zu
          sein. Das Formular wohnt im Inspector (340px), die Zeile hatte damit
          64px Textbreite fuer Namen wie „Ergebnis von Schritt" — sechs der
          acht Eintraege standen abgeschnitten da, und ein <select> kuerzt
          nicht mit Auslassungspunkten, es schneidet hart ab. min-w-0 flex-1
          ist dieselbe Loesung wie bei den Schluesselregel-Zeilen der
          QuellenListe, die im SELBEN Panel nebeneinanderstehen. */}
      <SchrittSelect
        className="min-w-0 flex-1"
        value={binding.source}
        onChange={(e) => setSource(e.target.value as ActionParamSource)}
      >
        {ACTION_PARAM_SOURCES.map((source) => (
          <option
            key={source}
            value={source}
            disabled={(source === 'data_field' && dataSources.length === 0)
              || (source === 'block_value' && blockValues.length === 0)
              // Ohne Auswahl-Geber in der Maske gaebe es nichts zu waehlen.
              || (source === 'gewaehlte_zeile' && geber.length === 0)
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
        <BindingValue
          binding={binding}
          dataSources={dataSources}
          blockValues={blockValues}
          geber={geber}
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
