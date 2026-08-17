// ParameterZeile — EINE Zeile eines Aktions-Parameters: Name | Herkunft | Ziel.
//
// Aus StepForm herausgeloest (2026-07-24), weil die Datei ueber den
// 500-Zeilen-Deckel gewachsen war. Der Schnitt ist der natuerliche: hier die
// EINZELNE Parameterzeile mit ihren Wert-Steuerungen, drueben das Formular,
// das die Zeilen anordnet.
//
// UMGESTELLT 2026-08-17 (Schritt 2 des Umbaus): jede Auswahl in dieser Zeile
// laeuft ueber DAS eine Waehler-Bauteil (ui/molecules/waehler). Vorher waren
// es NEUN eigene Auswahlfelder, und das wichtigste davon — die Klappliste
// „woher kommt der Wert" mit acht Eintraegen — schnitt in der 340-px-Spalte
// des Inspectors hart ab: sechs der acht Eintraege standen unlesbar da
// (ein <select> kuerzt nicht mit Auslassungspunkten, es schneidet).
// Der Waehler oeffnet als schwebendes Fenster mit Suchzeile; die Zeile selbst
// zeigt nur noch den gewaehlten Klarnamen und kuerzt mit „…".
//
// „Weggelassen" (aus) ist dabei der Zustand, den man NICHT waehlt (das tut das
// x an der Zeile) — er wird nur ANGEZEIGT, und die Zeile sagt jetzt auch, was
// dann hinausgeht. Bis hierhin zeigte das Auswahlfeld irgendeinen fremden
// Eintrag und der Platzhalter daneben behauptete, der Vorlagenwert werde
// geschickt; geschickt wurde ein leerer String (dokumentierter Fehler A1).

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
import { blockValueKey, type AuswahlGeberOption, type BlockValueOption } from './helfer'
import { PLATZHALTER_KLARTEXT } from './helfer'

// Anzeige = der Platzhalter selbst, wie er in der Relations-Syntax steht
// (Fachbegriff-Entscheidung 2026-07-15, keine erfundenen Klarnamen). Was er
// BEDEUTET, steht seit dem Umbau als leise Marke daneben — derselbe Klartext,
// den die Relations-Bibliothek schon fuehrt, keine zweite Wahrheit.
const CONTEXT_EINTRAEGE: WaehlerEintrag[] = AKTIONS_PLATZHALTER.map((wert) => ({
  wert,
  name: wert,
  kennung: PLATZHALTER_KLARTEXT[wert] ?? '',
}))

// Klarnamen der Parameterquellen — Editor-Tabelle (Muster optionColors):
// die Namen bleiben aus dem Runtime-Buendel heraus (dort zaehlen nur die Keys).
const QUELLEN_NAMEN: Record<ActionParamSource, string> = {
  fixed: 'Fest',
  context: 'Ereigniswert',
  data_field: 'Datenfeld',
  block_value: 'Baustein',
  gewaehlte_zeile: 'Gewählte Zeile',
  previous_result: 'Vorheriger Schritt',
  step_result: 'Ergebnis von Schritt',
  se_variable: 'SE VAR-Array',
  // Nie im Auswahlfeld angeboten (nicht in ACTION_PARAM_SOURCES) — gesetzt
  // wird der Zustand mit dem x an der Zeile. Der Name steht hier, weil die
  // Zeile ihn ANZEIGEN muss, sobald er gilt.
  aus: 'Weggelassen',
}

// Die Wert-Steuerung EINES Parameters — welche es ist, bestimmt die Herkunft.
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
    // Links: die GET-Schritte davor, per Position angeboten — kein
    // Namen-Vergeben, nur anklicken (Nutzer-Entscheidung 2026-07-17).
    //
    // Rechts: WELCHES Feld des Ergebnisses (2026-08-07). Ohne Wahl gilt das
    // ganze Ergebnis. Die Felder kommen aus der Quelle des Ziel-Schritts;
    // kennt er keine (der haeufige Fall — ein GET-Schritt braucht keine
    // Datenquelle), wird der Feldcode getippt statt geraten.
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
            // Anderer Schritt = andere Antwort: ein Feldcode der alten laese
            // in der neuen still nichts (dieselbe Linie wie der Quellwechsel
            // bei „Datenfeld").
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
    // Zwei Auswahlen wie bei „Datenfeld": erst WER die Auswahl gibt, dann
    // WELCHES Feld seiner Zeile. Die Felder kommen aus der Quelle des Gebers —
    // die gewaehlte Zeile stammt von dort, andere Felder gaebe es in ihr gar
    // nicht (Regel 7: nichts erfinden).
    const gewaehlter = geber.find((g) => g.blockId === binding.blockId)
    // Geber geloescht: den Zustand benennen statt still leer (Regel 4). Hier
    // ist es die EINZIGE Anzeige davon — der Export laeuft auch mit dem toten
    // Verweis durch.
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

  // Was hier NICHT waehlbar ist, bleibt trotzdem stehen (deaktiviert) — sonst
  // suchte der Bediener eine Moeglichkeit, die es sehr wohl gibt, nur eben
  // noch ohne Datenquelle/Geber/GET-Schritt in der Maske.
  const herkunft: WaehlerEintrag[] = ACTION_PARAM_SOURCES.map((source) => ({
    wert: source,
    name: QUELLEN_NAMEN[source],
    deaktiviert: (source === 'data_field' && dataSources.length === 0)
      || (source === 'block_value' && blockValues.length === 0)
      || (source === 'gewaehlte_zeile' && geber.length === 0)
      || (source === 'step_result' && schritte.length === 0),
  }))
  // „Weggelassen" waehlt man nicht — es steht nur da, solange es gilt.
  if (binding.source === 'aus') {
    herkunft.push({ wert: 'aus', name: QUELLEN_NAMEN.aus, deaktiviert: true })
  }

  return (
    <div className="flex items-center gap-1">
      <span className="w-14 shrink-0 truncate font-mono text-[0.6875rem]" title={label}>{label}</span>
      {/* Herkunft und Ziel teilen sich den Platz. Beide kuerzen jetzt mit „…"
          statt hart abzuschneiden — der Waehler ist ein Knopf, kein <select>. */}
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
