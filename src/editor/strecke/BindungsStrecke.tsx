// BindungsStrecke (V2/B3)
// EIN Ort am selektierten Board: die geführte Strecke pflegt die komplette
// Daten-Bindung — Schritt 1 Quelle, Schritt 2 Einsortieren-Feld, Schritt 3
// Spalten (Werte-Klick-Auswahl + Auffang-Wahl). Sie ersetzt die verstreuten
// Inspector-Einzelfelder (Quellen-Select aus 5.1, Wert-Textfeld aus B1,
// Auffang-Ja/Nein aus B2). Registry-getrieben über def.bindingRoute —
// kein `if type===`; die Wortlaute kommen aus den PropertyDescriptions
// der Route-Props (EINE Wahrheit, auch wenn die Controls versteckt sind).
//
// Jede Änderung schreibt SOFORT über den Store (1 Bedienschritt = 1 Undo,
// wie der Inspector) — es gibt keinen Speichern-Puffer und damit auch kein
// stilles Verwerfen. Werte entstehen NIE in einem offenen Freitextfeld:
// Standard = Spaltentitel, abweichend per Klick auf vergebene Werte oder
// über die beschriftete Ausnahme-Eingabe „Anderen Wert eintragen…".

import { useState, type ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/ui/atoms/button'
import { TextInput } from '@/ui/atoms/text-input'
import { Field } from '@/ui/molecules/field'
import { Modal } from '@/ui/molecules/modal'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { bindungsStand } from '../../core/blocks/bindungsStand'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'

// Radix-frei: die Strecke arbeitet mit Klick-Chips (aria-pressed), nicht
// mit Selects — die Auswahl IST die Bedienung (freigegebene Strecke).
function Chip({
  aktiv,
  onClick,
  children,
}: {
  aktiv: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={aktiv}
      onClick={onClick}
      className={
        aktiv
          ? 'rounded border border-ring bg-accent px-2 py-1 text-xs font-medium text-accent-foreground'
          : 'rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted'
      }
    >
      {children}
    </button>
  )
}

// Schritt der Strecke: Nummer + Titel + Haken (fertig). role="group" macht
// den Schritt für Bediener wie Tests adressierbar (Name = Titel).
function Schritt({
  nr,
  titel,
  fertig,
  children,
}: {
  nr: number
  titel: string
  fertig: boolean
  children: ReactNode
}) {
  return (
    <section role="group" aria-label={titel} className="flex flex-col gap-2">
      <h3 className="flex items-center gap-2 text-xs font-semibold">
        <span
          aria-hidden="true"
          className={
            fertig
              ? 'flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground'
              : 'flex h-5 w-5 items-center justify-center rounded-full border border-border text-[11px] text-muted-foreground'
          }
        >
          {fertig ? '✓' : nr}
        </span>
        {titel}
      </h3>
      {children}
    </section>
  )
}

const strListe = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []

interface BindungsStreckeProps {
  blockId: string
  onClose: () => void
}

export function BindungsStrecke({ blockId, onClose }: BindungsStreckeProps) {
  const ed = useEditor()
  const sources = useDataSources().list
  // Ausnahme-Eingabe „Anderen Wert eintragen…": höchstens EINE offen
  // (Spalten-id), damit das Eingabefeld eindeutig bleibt.
  const [eingabeFuer, setEingabeFuer] = useState<string | null>(null)
  const [eingabeWert, setEingabeWert] = useState('')

  const node = ed.getNode(blockId)
  const def = node ? getBlockDefinition(node.type) : undefined
  const route = def?.bindingRoute
  if (!node || !def || !route) return null

  const stand = bindungsStand(node, route, sources)
  const sourceId = typeof node.props.source === 'string' ? node.props.source : ''
  const quelle = sources.find((s) => s.id === sourceId)
  const feldRoh = node.props[route.fieldProp]
  const feld = typeof feldRoh === 'string' ? feldRoh : ''

  // Wortlaute aus den (versteckten) PropertyDescriptions — EINE Wahrheit.
  const feldProp = def.customProperties.find((p) => p.attributeName === route.fieldProp)
  const spaltenDef = getBlockDefinition(route.column.type)
  const werteProp = spaltenDef?.customProperties.find(
    (p) => p.attributeName === route.column.valuesProp,
  )

  const spalten = ed
    .childNodesOf(blockId)
    .filter((c) => c.type === route.column.type)
  const titelVon = (props: Record<string, unknown>) =>
    String(props[route.column.titleProp] ?? '')

  // Angebot der Klick-Auswahl: alle im Board bereits vergebenen Werte
  // (Reihenfolge = Board), dedupliziert. Eigene Werte einer Spalte sind
  // automatisch enthalten und erscheinen dort als aktiv.
  const vergeben: string[] = []
  for (const sp of spalten) {
    for (const w of strListe(sp.props[route.column.valuesProp])) {
      if (!vergeben.includes(w)) vergeben.push(w)
    }
  }

  const auffangSpalte = spalten.find(
    (sp) => sp.props[route.column.catchProp] === 'ja',
  )

  const setQuelle = (id: string) => {
    if (id !== sourceId) ed.updateProperty(blockId, 'source', id)
  }
  const setFeld = (code: string) => {
    if (code !== feld) ed.updateProperty(blockId, route.fieldProp, code)
  }

  const eingabeUebernehmen = (spalteId: string, werte: string[]) => {
    const w = eingabeWert.trim()
    if (w !== '' && !werte.includes(w)) {
      ed.updateProperty(spalteId, route.column.valuesProp, [...werte, w])
    }
    setEingabeFuer(null)
    setEingabeWert('')
  }

  return (
    <Modal title="Daten anschließen" onClose={onClose}>
      <div className="flex flex-col gap-5">
        {/* Schritt 1: Datenquelle wählen (Zuweisung — die Bibliothek der
            Vorlagen bleibt in der Steuerung). */}
        <Schritt nr={1} titel="Datenquelle" fertig={stand.quelleGewaehlt && stand.quelleBekannt}>
          <div className="flex flex-wrap gap-1.5">
            <Chip aktiv={sourceId === ''} onClick={() => setQuelle('')}>
              — keine —
            </Chip>
            {sources.map((s) => (
              <Chip key={s.id} aktiv={s.id === sourceId} onClick={() => setQuelle(s.id)}>
                {s.name}
              </Chip>
            ))}
          </div>
          {stand.quelleGewaehlt && !stand.quelleBekannt && (
            <p className="text-xs text-destructive">
              Die gewählte Datenquelle fehlt in der Bibliothek — eine andere
              wählen oder die Vorlage wieder anlegen (Steuerung → Datenquellen).
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Vorlagen anlegen und bearbeiten: Steuerung → Datenquellen.
          </p>
        </Schritt>

        {/* Schritt 2: Einsortieren-Feld — Klarnamen, nie Feldcodes. */}
        <Schritt nr={2} titel={feldProp?.name ?? 'Einsortieren nach'} fertig={stand.angeschlossen}>
          {!quelle ? (
            <p className="text-xs text-muted-foreground">
              Zuerst eine Datenquelle wählen (Schritt 1).
            </p>
          ) : (
            <>
              <p className="text-[11px] text-muted-foreground">
                {feldProp?.description ?? ''}
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Chip aktiv={feld === ''} onClick={() => setFeld('')}>
                  — keins —
                </Chip>
                {quelle.fields.map((f) => (
                  <Chip key={f.code} aktiv={f.code === feld} onClick={() => setFeld(f.code)}>
                    {f.label}
                  </Chip>
                ))}
              </div>
            </>
          )}
        </Schritt>

        {/* Schritt 3: Spalten (Werte-Klick-Auswahl) + Auffang-Wahl. */}
        <Schritt nr={3} titel="Spalten & Werte" fertig={stand.angeschlossen}>
          {!quelle ? (
            <p className="text-xs text-muted-foreground">
              Zuerst eine Datenquelle wählen (Schritt 1).
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-[11px] text-muted-foreground">
                {werteProp?.description ?? ''}
              </p>
              {spalten.map((sp) => {
                const titel = titelVon(sp.props)
                const werte = strListe(sp.props[route.column.valuesProp])
                const setWerte = (list: string[]) =>
                  ed.updateProperty(sp.id, route.column.valuesProp, list)
                return (
                  <div
                    key={sp.id}
                    role="group"
                    aria-label={titel}
                    className="flex flex-col gap-1.5 rounded border border-border p-2"
                  >
                    <span className="text-xs font-medium">{titel}</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Chip
                        aktiv={werte.length === 0}
                        onClick={() => {
                          if (werte.length > 0) setWerte([])
                        }}
                      >
                        Titel „{titel}“
                      </Chip>
                      {vergeben.map((w) => (
                        <Chip
                          key={w}
                          aktiv={werte.includes(w)}
                          onClick={() =>
                            setWerte(
                              werte.includes(w)
                                ? werte.filter((x) => x !== w)
                                : [...werte, w],
                            )
                          }
                        >
                          {w}
                        </Chip>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => {
                          setEingabeFuer(eingabeFuer === sp.id ? null : sp.id)
                          setEingabeWert('')
                        }}
                      >
                        <Plus size={12} /> Anderen Wert eintragen…
                      </Button>
                    </div>
                    {eingabeFuer === sp.id && (
                      <div className="flex items-end gap-2">
                        <Field
                          label="Eigener Wert"
                          description="Genau so, wie er im Sortier-Feld der Tabelle steht."
                        >
                          {(f) => (
                            <TextInput
                              {...f}
                              value={eingabeWert}
                              onChange={(e) => setEingabeWert(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') eingabeUebernehmen(sp.id, werte)
                              }}
                            />
                          )}
                        </Field>
                        <Button size="sm" onClick={() => eingabeUebernehmen(sp.id, werte)}>
                          Übernehmen
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEingabeFuer(null)
                            setEingabeWert('')
                          }}
                        >
                          Abbrechen
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Auffang-Wahl (B2-Kennzeichen, exklusiv über den Store). */}
              <div
                role="group"
                aria-label="Auffangspalte"
                className="flex flex-col gap-1.5 border-t border-border pt-3"
              >
                <span className="text-xs font-semibold">Auffangspalte</span>
                <div className="flex flex-wrap gap-1.5">
                  <Chip
                    aktiv={!auffangSpalte}
                    onClick={() => {
                      if (auffangSpalte) {
                        ed.updateProperty(auffangSpalte.id, route.column.catchProp, 'nein')
                      }
                    }}
                  >
                    Keine
                  </Chip>
                  {spalten.map((sp) => (
                    <Chip
                      key={sp.id}
                      aktiv={sp.props[route.column.catchProp] === 'ja'}
                      onClick={() => {
                        if (sp.props[route.column.catchProp] !== 'ja') {
                          ed.updateProperty(sp.id, route.column.catchProp, 'ja')
                        }
                      }}
                    >
                      {titelVon(sp.props)}
                    </Chip>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {auffangSpalte
                    ? `Einträge ohne Treffer landen in „${titelVon(auffangSpalte.props)}".`
                    : 'Ohne Auffangspalte zeigt die Maske Einträge ohne Treffer in einer eigenen Spalte „Nicht zugeordnet" — sichtbar, nie still verworfen.'}
                </p>
              </div>
            </div>
          )}
        </Schritt>
      </div>
    </Modal>
  )
}
