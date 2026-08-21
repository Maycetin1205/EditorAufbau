import { useState } from 'react'
import { Button } from '@/ui/atoms/button'
import { TextInput } from '@/ui/atoms/text-input'
import { Field } from '@/ui/molecules/field'
import {
  artFuer,
  feldVorsatzFromInput,
  kennungAnzeige,
  kennungFromInput,
  kopfsatzFromInput,
  LADE_RELATION_STANDARD,
  QUELLEN_ARTEN,
  quellenKennung,
  relationNrFromInput,
  type DataSource,
  type DataSourceKind,
} from '../../core/data/dataSources'
import { WaehlerKnopf } from '@/ui/molecules/waehler'
import { useDataSources } from '../../state/useDataSources'
import { SelectControl } from '../inspector/controls/SelectControl'
import { FeldListe } from './FeldListe'
import {
  LEERE_ZEILE,
  zeileFromField,
  zeileGefuellt,
  zeilenCode,
  type FeldZeile,
} from './feldZeile'
import { FormularKarte } from './FormularKarte'

const FELDCODE = /^\d+_\d+$/

interface DataSourceFormProps {
  source?: DataSource
  onClose: () => void
}

export function DataSourceForm({ source, onClose }: DataSourceFormProps) {
  const store = useDataSources()
  const [name, setName] = useState(source?.name ?? '')
  const [kind, setKind] = useState<DataSourceKind>(source?.kind ?? 'idb')
  const [kennungEingabe, setKennungEingabe] = useState(kennungAnzeige(source?.idbId))
  const [kopfsatzEingabe, setKopfsatzEingabe] = useState(source?.kopfsatzIndex ?? '')

  const [vorsatzEingabe, setVorsatzEingabe] = useState(source?.feldVorsatz ?? '')

  const lade = source?.ladeRelation
  const [zeilenWeg, setZeilenWeg] = useState<'geschoben' | 'holen'>(lade ? 'holen' : 'geschoben')
  const [relationNr, setRelationNr] = useState(lade?.nr ?? LADE_RELATION_STANDARD.nr)
  const [geberQuelleId, setGeberQuelleId] = useState(lade?.geberQuelleId ?? '')
  const feldZuordnung = {
    belegartFeld: lade?.belegartFeld ?? LADE_RELATION_STANDARD.belegartFeld,
    belegnummerFeld: lade?.belegnummerFeld ?? LADE_RELATION_STANDARD.belegnummerFeld,
    jahrFeld: lade?.jahrFeld ?? LADE_RELATION_STANDARD.jahrFeld,
    archivFeld: lade?.archivFeld ?? LADE_RELATION_STANDARD.archivFeld,
    endeFelder: lade?.endeFelder ?? LADE_RELATION_STANDARD.endeFelder,
  }
  const [zeilen, setZeilen] = useState<FeldZeile[]>(
    source && source.fields.length > 0

      ? source.fields.map((f) => zeileFromField(
          f, source.feldVorsatz ?? '', artFuer(source.kind).spaltenNamen,
        ))
      : [{ ...LEERE_ZEILE }],
  )

  const [zeigeFehler, setZeigeFehler] = useState(false)

  const art = artFuer(kind)
  const kennungEingeben = art.tabellenId === ''

  const kopfsatzEingeben = art.kopfsatzMoeglich

  const holenMoeglich = art.relationLadenMoeglich

  const vorsatz = feldVorsatzFromInput(vorsatzEingabe)

  // Der Vorsatz steckt in JEDEM Feldcode dieser Quelle. Wer die Art
  // wechselt, soll ihn deshalb sehen und selbst entfernen — versteckte
  // ihn das Formular (weil die neue Art keinen vorsieht), fielen die
  // Codes beim Speichern still auf die Form ohne Vorsatz zurueck.
  const vorsatzEingeben = art.feldVorsatzMoeglich || vorsatz !== ''
  const holtZeilen = holenMoeglich && zeilenWeg === 'holen'

  const geberOptionen = store.list.filter((s) => s.id !== source?.id)

  function waehleArt(neu: DataSourceKind): void {
    setKind(neu)
    const neueArt = artFuer(neu)
    if (neueArt.standardFelder.length > 0 && !zeilen.some(zeileGefuellt)) {
      setZeilen(neueArt.standardFelder.map((f) => zeileFromField(f)))
    }
    if (neueArt.kopfsatzStandard !== '' && kopfsatzEingabe.trim() === '') {
      setKopfsatzEingabe(neueArt.kopfsatzStandard)
    }
  }

  const nameFehler = name.trim() === '' ? 'Anzeigename fehlt.' : ''
  const kennungFehler =
    kennungEingeben && kennungFromInput(kennungEingabe, art.idbKurzform) === ''
      ? `${art.kennungLabel} fehlt (z. B. ${art.kennungBeispiel}).`
      : ''

  const kopfsatzFehler =
    kopfsatzEingeben && kopfsatzEingabe.trim() !== '' && kopfsatzFromInput(kopfsatzEingabe) === ''
      ? 'Ungültig — Beispiel: BEL_0_11.'
      : ''
  const zeilenFehler = zeilen.map((z) => {
    if (z.label.trim() === '') return 'Klarname fehlt.'
    if (!art.spaltenNamen && FELDCODE.test(z.label.trim())) {
      return 'Klarname darf kein Feldcode sein.'
    }
    if (zeilenCode(z, vorsatz, art.spaltenNamen) === '') {
      return art.spaltenNamen
        ? 'Spaltenname fehlt (ohne Komma).'
        : 'Position und Länge als Zahlen angeben.'
    }
    return ''
  })
  const codes = zeilen.map((z) => zeilenCode(z, vorsatz, art.spaltenNamen))
  const doppeltFehler = codes.some((c, i) => c !== '' && codes.indexOf(c) !== i)
    ? (art.spaltenNamen
        ? 'Zwei Felder zeigen auf dieselbe Spalte.'
        : 'Zwei Felder haben dieselbe Position + Länge.')
    : ''

  const relationNrFehler = holtZeilen && relationNrFromInput(relationNr) === ''
    ? 'Relationsnummer fehlt — nur Ziffern.'
    : ''
  const geberFehler = holtZeilen && geberQuelleId === ''
    ? 'Wähle die Quelle, in der der Beleg angeklickt wird.'
    : ''
  const alleFehler = [
    nameFehler, kennungFehler, kopfsatzFehler, doppeltFehler,
    relationNrFehler, geberFehler,
    ...zeilenFehler,
  ]

  function speichern() {
    if (alleFehler.some((f) => f !== '')) {
      setZeigeFehler(true)
      return
    }
    const daten: Omit<DataSource, 'id'> = {
      name: name.trim(),
      kind,
      ...(kennungEingeben ? { idbId: kennungFromInput(kennungEingabe, art.idbKurzform) } : {}),

      ...(kopfsatzEingeben && kopfsatzFromInput(kopfsatzEingabe) !== ''
        ? { kopfsatzIndex: kopfsatzFromInput(kopfsatzEingabe) }
        : {}),

      ...(vorsatz !== '' ? { feldVorsatz: vorsatz } : {}),

      ...(source
        ? (source.indexField ? { indexField: source.indexField } : {})
        : { indexField: '0_10' }),

      ...(holtZeilen
        ? {
            ladeRelation: {
              nr: relationNrFromInput(relationNr),
              geberQuelleId,
              ...feldZuordnung,
            },
          }
        : {}),
      fields: zeilen.map((z) => ({
        code: zeilenCode(z, vorsatz, art.spaltenNamen),
        label: z.label.trim(),
      })),
    }
    if (source) store.update(source.id, daten)
    else store.add(daten)
    onClose()
  }

  return (
    <FormularKarte title={source ? 'Datenquelle bearbeiten' : 'Neue Datenquelle'} onClose={onClose}>
      <div className="flex flex-col gap-3">
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
          value={kind}
          options={QUELLEN_ARTEN.map((a) => ({ value: a.id, label: a.name }))}
          onChange={(v) => waehleArt(v as DataSourceKind)}
        />

        {kennungEingeben && (
          <Field label={art.kennungLabel} error={zeigeFehler ? kennungFehler : ''}>
            {(f) => (
              <TextInput
                {...f}
                value={kennungEingabe}
                placeholder={`z. B. ${art.kennungBeispiel}`}
                className="w-32"
                onChange={(e) => setKennungEingabe(e.target.value)}
              />
            )}
          </Field>
        )}

        {vorsatzEingeben && (
          <Field label="Feld-Vorsatz">
            {(f) => (
              <TextInput
                {...f}
                value={vorsatzEingabe}
                placeholder="z. B. LFA_"
                className="w-32"
                onChange={(e) => setVorsatzEingabe(e.target.value)}
              />
            )}
          </Field>
        )}

        {holenMoeglich && (
          <SelectControl
            label="Woher kommen die Zeilen?"
            value={zeilenWeg}
            options={[
              { value: 'geschoben', label: 'SoftEngine schickt sie beim Laden' },
              { value: 'holen', label: 'Die Maske holt sie, sobald ein Beleg angeklickt ist' },
            ]}
            onChange={(v) => setZeilenWeg(v as 'geschoben' | 'holen')}
          />
        )}
        {holtZeilen && (
          <>
            <Field
              label="Relationsnummer"
              error={zeigeFehler ? relationNrFehler : ''}
            >
              {(f) => (
                <TextInput
                  {...f}
                  value={relationNr}
                  className="w-24"
                  onChange={(e) => setRelationNr(e.target.value)}
                />
              )}
            </Field>
            {/* Keine Leer-Option: eine leere Quelle ist hier ein Fehler
                (geberFehler), also darf sie nicht wählbar sein. */}
            <WaehlerKnopf
              label="Beleg kommt aus"
              bezeichnung="Beleg kommt aus"
              gruppen={[{
                key: 'quellen',
                eintraege: geberOptionen.map((s) => ({
                  wert: s.id,
                  name: s.name,
                  kennung: quellenKennung(s),
                })),
              }]}
              wert={geberQuelleId}
              platzhalter="— Quelle wählen —"
              onWaehle={setGeberQuelleId}
            />
            {zeigeFehler && geberFehler !== '' && (
              <p className="min-w-0 break-words text-ui text-destructive">{geberFehler}</p>
            )}
          </>
        )}

        {kopfsatzEingeben && !holtZeilen && (
          <Field
            label="Gehört zu"
            error={zeigeFehler ? kopfsatzFehler : ''}
          >
            {(f) => (
              <TextInput
                {...f}
                value={kopfsatzEingabe}
                placeholder="z. B. BEL_0_11"
                className="w-32"
                onChange={(e) => setKopfsatzEingabe(e.target.value)}
              />
            )}
          </Field>
        )}

        <FeldListe
          spaltenNamen={art.spaltenNamen}
          zeilen={zeilen}
          setZeilen={setZeilen}
          zeilenFehler={zeilenFehler}
          doppeltFehler={doppeltFehler}
          zeigeFehler={zeigeFehler}
        />

        <div className="flex justify-end gap-2 border-t border-border pt-3">
          <Button variant="outline" size="sm" onClick={onClose}>Abbrechen</Button>
          <Button size="sm" onClick={speichern}>Speichern</Button>
        </div>
      </div>
    </FormularKarte>
  )
}
