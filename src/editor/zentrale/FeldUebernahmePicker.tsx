import { useMemo, useState } from 'react'
import { AuswahlFenster } from '@/ui/molecules/auswahl-fenster'
import { TextInput } from '@/ui/atoms/text-input'
import type {
  FeldUebernahmeZiel,
  UebernahmeFeld,
  UebernahmeQuelle,
} from './feldUebernahme'

interface FeldUebernahmePickerProps {
  sources: readonly UebernahmeQuelle[]
  fields: readonly UebernahmeFeld[]
  ziel: FeldUebernahmeZiel
  current: string
  top: number
  left: number
  onPick: (sourceId: string, code: string) => void
  onClose: () => void
}

export function FeldUebernahmePicker({
  sources,
  fields,
  ziel,
  current,
  top,
  left,
  onPick,
  onClose,
}: FeldUebernahmePickerProps) {
  const [suche, setSuche] = useState('')
  const [quelle, setQuelle] = useState<UebernahmeQuelle | null>(null)
  const needle = suche.trim().toLocaleLowerCase('de')

  // Das Suchfeld verspricht „Feld oder Quelle" — also zeigt die Quellenliste
  // auch Quellen, bei denen erst ein FELD auf den Suchbegriff passt.
  const sichtbareQuellen = useMemo(
    () => sources.filter((source) =>
      needle === ''
      || source.sourceName.toLocaleLowerCase('de').includes(needle)
      || fields.some((field) =>
        field.sourceId === source.sourceId
        && field.label.toLocaleLowerCase('de').includes(needle))),
    [needle, sources, fields],
  )
  const sichtbareFelder = useMemo(
    () => fields.filter((field) => field.sourceId === quelle?.sourceId && (
      needle === ''
      || `${field.label} ${field.sourceName}`.toLocaleLowerCase('de').includes(needle)
    )),
    [fields, needle, quelle?.sourceId],
  )

  return (
    <AuswahlFenster
      bezeichnung="Feld übernehmen"
      oben={top}
      links={left}
      onClose={onClose}
      imBildHalten
      escapeAbfangen
      className="max-h-72 w-64 max-w-[calc(100vw-1rem)]"
    >
      <TextInput
        aria-label="Feld oder Quelle suchen"
        autoFocus
        value={suche}
        placeholder="Feld oder Quelle suchen"
        onChange={(e) => setSuche(e.target.value)}
        className="mb-1"
      />

      {quelle && ziel === 'feld' ? (
        <>
          <button
            type="button"
            className="px-2 py-1 text-xs text-primary hover:underline"
            onClick={() => {
              setQuelle(null)
              setSuche('')
            }}
          >
            ← Quellen
          </button>
          <p className="px-2 pb-0.5 pt-1 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">
            {quelle.sourceName}
          </p>
          {sichtbareFelder.map((field) => (
            <button
              key={`${field.sourceId}:${field.code}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onPick(field.sourceId, field.code)
              }}
              className="flex w-full items-baseline gap-3 rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground"
            >
              <span>{field.label}</span>
              {field.code === current && <span className="text-muted-foreground">✓</span>}
            </button>
          ))}
          {sichtbareFelder.length === 0 && (
            <p className="px-2 py-2 text-xs text-muted-foreground">Keine Felder.</p>
          )}
        </>
      ) : (
        <>
          <p className="px-2 pb-0.5 pt-1.5 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">
            Datenquelle wählen
          </p>
          {sichtbareQuellen.map((source) => (
            <button
              key={source.sourceId}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (ziel === 'idb') {
                  onPick(source.sourceId, '')
                } else {
                  setQuelle(source)
                  setSuche('')
                }
              }}
              className="flex w-full rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground"
            >
              {source.sourceName}
            </button>
          ))}
          {sichtbareQuellen.length === 0 && (
            <p className="px-2 py-2 text-xs text-muted-foreground">Keine IDB-Quellen.</p>
          )}
        </>
      )}
    </AuswahlFenster>
  )
}
