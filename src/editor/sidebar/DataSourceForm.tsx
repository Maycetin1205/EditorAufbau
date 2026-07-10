// DataSourceForm
// Kap. 5.4b: Anlegen/Bearbeiten einer Datenquellen-Vorlage. Der Bediener
// gibt NUR Klarnamen + Positionen/Längen ein — die Technikwerte (Feldcode
// 'pos_len', Tabellen-ID 'IDBIDnnnn') entstehen unsichtbar (Regel
// Technikwert ≠ Anzeigename; pure Helfer in dataSources.ts).
//
// Beim Bearbeiten bleibt die id der Vorlage stabil (angehängte Blöcke
// behalten ihre Quelle) — das erledigt dataSourceStore.update.

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/ui/atoms/button'
import { IconButton } from '@/ui/atoms/icon-button'
import { TextInput } from '@/ui/atoms/text-input'
import { Field } from '@/ui/molecules/field'
import { Modal } from '@/ui/molecules/modal'
import {
  DATA_SOURCE_KINDS,
  fieldCode,
  idbIdFromNumber,
  numberFromIdbId,
  type DataSource,
  type DataSourceField,
  type DataSourceKind,
} from '../../core/data/dataSources'
import { splitFieldCode } from '../../core/data/relations'
import { useDataSources } from '../../state/useDataSources'
import { SelectControl } from '../inspector/controls/SelectControl'

// Klarnamen der Quellen-Arten (der Technikwert `kind` bleibt unsichtbar).
const KIND_LABELS: Record<DataSourceKind, string> = {
  idb: 'IDB-Tabelle',
  adressstamm: 'Adressstamm',
  artikelstamm: 'Artikelstamm',
  beleg: 'Beleg',
}

const FELDCODE = /^\d+_\d+$/

// Eine Formular-Zeile des Feld-Wörterbuchs. `rawCode` trägt den bisherigen
// Technikwert eines Bestandsfelds, dessen Code KEIN pos_len ist (direkter
// Property-Name): lässt der Bediener Position/Länge leer, bleibt er erhalten
// — sonst ersetzt die neue Eingabe den Code.
interface FeldZeile {
  label: string
  pos: string
  len: string
  rawCode: string
}

function zeileFromField(f: DataSourceField): FeldZeile {
  const pl = splitFieldCode(f.code)
  return {
    label: f.label,
    pos: pl?.pos ?? '',
    len: pl?.len ?? '',
    rawCode: pl ? '' : f.code,
  }
}

const LEERE_ZEILE: FeldZeile = { label: '', pos: '', len: '', rawCode: '' }

// Feldcode einer Zeile ('' = ungültig): Eingaben gewinnen, sonst rawCode.
function zeilenCode(z: FeldZeile): string {
  if (z.pos.trim() === '' && z.len.trim() === '' && z.rawCode !== '') return z.rawCode
  return fieldCode(z.pos, z.len)
}

interface DataSourceFormProps {
  // Vorhandene Vorlage = Bearbeiten; undefined = Anlegen.
  source?: DataSource
  onClose: () => void
}

export function DataSourceForm({ source, onClose }: DataSourceFormProps) {
  const store = useDataSources()
  const [name, setName] = useState(source?.name ?? '')
  const [kind, setKind] = useState<DataSourceKind>(source?.kind ?? 'idb')
  const [idbNummer, setIdbNummer] = useState(numberFromIdbId(source?.idbId))
  const indexPl = splitFieldCode(source?.indexField ?? '')
  // Satznummer (pindex): braucht der Schreibweg (Kap. 5.3b). Bei neuen
  // IDB-Quellen sinnvoll vorbelegt ('0_10' wie der Terminplaner), änderbar.
  const [indexPos, setIndexPos] = useState(source ? (indexPl?.pos ?? '') : '0')
  const [indexLen, setIndexLen] = useState(source ? (indexPl?.len ?? '') : '10')
  const [zeilen, setZeilen] = useState<FeldZeile[]>(
    source && source.fields.length > 0
      ? source.fields.map(zeileFromField)
      : [{ ...LEERE_ZEILE }],
  )
  // Fehler erst nach dem ersten Speichern-Versuch anzeigen (nicht beim Tippen).
  const [zeigeFehler, setZeigeFehler] = useState(false)

  const setZeile = (at: number, patch: Partial<FeldZeile>) =>
    setZeilen((z) => z.map((row, i) => (i === at ? { ...row, ...patch } : row)))

  // ---------- Validierung (Fehlertexte '' = gültig) ----------
  const nameFehler = name.trim() === '' ? 'Anzeigename fehlt.' : ''
  const idbFehler =
    kind === 'idb' && idbIdFromNumber(idbNummer) === ''
      ? 'Tabellennummer fehlt (1–4 Ziffern, z. B. 1).'
      : ''
  const indexFehler =
    indexPos.trim() === '' && indexLen.trim() === ''
      ? '' // Satznummer ist optional (Quelle ist dann nur lesbar)
      : fieldCode(indexPos, indexLen) === ''
        ? 'Position und Länge als Zahlen angeben — oder beide leer lassen.'
        : ''
  const zeilenFehler = zeilen.map((z) => {
    if (z.label.trim() === '') return 'Klarname fehlt.'
    if (FELDCODE.test(z.label.trim())) return 'Klarname darf kein Feldcode sein.'
    if (zeilenCode(z) === '') return 'Position und Länge als Zahlen angeben.'
    return ''
  })
  const codes = zeilen.map(zeilenCode)
  const doppeltFehler = codes.some((c, i) => c !== '' && codes.indexOf(c) !== i)
    ? 'Zwei Felder haben dieselbe Position + Länge.'
    : ''
  const alleFehler = [nameFehler, idbFehler, indexFehler, doppeltFehler, ...zeilenFehler]

  function speichern() {
    if (alleFehler.some((f) => f !== '')) {
      setZeigeFehler(true)
      return
    }
    const daten: Omit<DataSource, 'id'> = {
      name: name.trim(),
      kind,
      ...(kind === 'idb' ? { idbId: idbIdFromNumber(idbNummer) } : {}),
      ...(fieldCode(indexPos, indexLen) !== ''
        ? { indexField: fieldCode(indexPos, indexLen) }
        : {}),
      fields: zeilen.map((z) => ({
        code: zeilenCode(z),
        label: z.label.trim(),
      })),
    }
    if (source) store.update(source.id, daten)
    else store.add(daten)
    onClose()
  }

  return (
    <Modal title={source ? 'Datenquelle bearbeiten' : 'Neue Datenquelle'} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Field label="Anzeigename" error={zeigeFehler ? nameFehler : ''}>
          {(f) => (
            <TextInput
              {...f}
              value={name}
              placeholder="z. B. Terminplaner"
              onChange={(e) => setName(e.target.value)}
            />
          )}
        </Field>

        <SelectControl
          label="Art"
          description="Woher die Daten kommen — bestimmt, wie die Maske die Tabelle anspricht."
          value={kind}
          options={DATA_SOURCE_KINDS.map((k) => ({ value: k, label: KIND_LABELS[k] }))}
          onChange={(v) => setKind(v as DataSourceKind)}
        />

        {kind === 'idb' && (
          <Field
            label="Tabellennummer"
            description="Nummer der IDB-Tabelle in Ihrer Installation (z. B. 1)."
            error={zeigeFehler ? idbFehler : ''}
          >
            {(f) => (
              <TextInput
                {...f}
                value={idbNummer}
                placeholder="z. B. 1"
                className="w-28"
                onChange={(e) => setIdbNummer(e.target.value)}
              />
            )}
          </Field>
        )}

        <Field
          label="Satznummer (Position / Länge)"
          description="Wo die Satznummer im Datensatz steht — nötig, damit die Maske Werte zurückschreiben kann. Leer = nur lesen."
          error={zeigeFehler ? indexFehler : ''}
        >
          {(f) => (
            <div className="flex gap-2">
              <TextInput
                {...f}
                value={indexPos}
                placeholder="Position"
                className="w-24"
                onChange={(e) => setIndexPos(e.target.value)}
              />
              <TextInput
                aria-label="Satznummer Länge"
                value={indexLen}
                placeholder="Länge"
                className="w-24"
                onChange={(e) => setIndexLen(e.target.value)}
              />
            </div>
          )}
        </Field>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Felder</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZeilen((z) => [...z, { ...LEERE_ZEILE }])}
            >
              <Plus size={14} /> Feld
            </Button>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_72px_72px_auto] items-center gap-x-2 text-[11px] text-muted-foreground">
            <span>Klarname</span>
            <span>Position</span>
            <span>Länge</span>
            <span />
          </div>
          {zeilen.map((z, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="grid grid-cols-[minmax(0,1fr)_72px_72px_auto] items-center gap-x-2">
                <TextInput
                  aria-label={`Feld ${i + 1}: Klarname`}
                  value={z.label}
                  placeholder="z. B. Vorname"
                  onChange={(e) => setZeile(i, { label: e.target.value })}
                />
                <TextInput
                  aria-label={`Feld ${i + 1}: Position`}
                  value={z.pos}
                  placeholder={z.rawCode !== '' ? '—' : '193'}
                  onChange={(e) => setZeile(i, { pos: e.target.value })}
                />
                <TextInput
                  aria-label={`Feld ${i + 1}: Länge`}
                  value={z.len}
                  placeholder={z.rawCode !== '' ? '—' : '30'}
                  onChange={(e) => setZeile(i, { len: e.target.value })}
                />
                <IconButton
                  aria-label={`Feld ${i + 1} entfernen`}
                  onClick={() => setZeilen((rows) => rows.filter((_, at) => at !== i))}
                >
                  <X size={14} />
                </IconButton>
              </div>
              {zeigeFehler && zeilenFehler[i] !== '' && (
                <p className="text-xs text-destructive">{zeilenFehler[i]}</p>
              )}
            </div>
          ))}
          {zeigeFehler && doppeltFehler !== '' && (
            <p className="text-xs text-destructive">{doppeltFehler}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-3">
          <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button onClick={speichern}>Speichern</Button>
        </div>
      </div>
    </Modal>
  )
}
