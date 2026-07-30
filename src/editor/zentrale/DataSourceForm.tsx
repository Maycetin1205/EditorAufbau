// DataSourceForm
// Anlegen/Bearbeiten einer Datenquellen-Vorlage.
//
// NEU AUFGEBAUT 2026-07-30 (Nutzer-Auftrag „den Bereich Datenquelle komplett
// neu aufbauen"). Vorher ein einziges Formular, das jeder Quellen-Art
// dieselben Fragen stellte — inklusive der nach einer Tabellen-Kennung, die
// bei Stammtabellen feststeht. Jetzt drei Fragen nacheinander:
//
//   1. WAS fuer eine Quelle?  — Auswahlliste
//   2. WOHER genau?           — nur was die Art wirklich braucht
//   3. WELCHE Felder?         — FeldListe (Zeile fuer Zeile)
//
// Zwischenzeitlich stand bei Frage 1 ein Kachel-Raster mit Bild und
// Erklaersatz je Art. Wieder entfernt am selben Tag (Nutzer: „wieso
// kacheln?") — vier Werbekaesten zu lesen ist mehr Arbeit als eine Zeile
// aufzuklappen, und die Art ist eine Nebenfrage, keine Weggabelung.
//
// WAS eine Art ausmacht, steht nicht hier, sondern in der Arten-Tabelle
// (core/data/quellenArten): dieses Formular fragt generisch „hat die Art
// eine feste Kennung?" und stellt danach seine zweite Frage — es kennt
// keine Art namentlich.
//
// Der Bediener gibt Klarnamen + Positionen/Laengen ein; der Technikwert
// ('IDBID0004', Feldcode 'pos_len') entsteht unsichtbar (Regel 3).
// KEIN eigenes Formularfeld fuer die Datensatz-Nummer (Nutzer-Entscheidung
// 2026-07-15): Felder pflegt allein die Feld-Liste. Der Schreibweg-
// Technikwert indexField bleibt unsichtbar — Bestand behaelt seinen Wert,
// neue Quellen bekommen das Terminplaner-Muster '0_10'.
//
// Beim Bearbeiten bleibt die id der Vorlage stabil (angehaengte Bloecke
// behalten ihre Quelle) — das erledigt dataSourceStore.update.

import { useState } from 'react'
import { Button } from '@/ui/atoms/button'
import { TextInput } from '@/ui/atoms/text-input'
import { Field } from '@/ui/molecules/field'
import {
  artFuer,
  idbIdAnzeige,
  idbIdFromInput,
  QUELLEN_ARTEN,
  type DataSource,
  type DataSourceKind,
} from '../../core/data/dataSources'
import { useDataSources } from '../../state/useDataSources'
import { SelectControl } from '../inspector/controls/SelectControl'
import { FeldListe } from './FeldListe'
import { LEERE_ZEILE, zeileFromField, zeilenCode, type FeldZeile } from './feldZeile'
import { FormularKarte } from './FormularKarte'

const FELDCODE = /^\d+_\d+$/

interface DataSourceFormProps {
  // Vorhandene Vorlage = Bearbeiten; undefined = Anlegen.
  source?: DataSource
  onClose: () => void
}

export function DataSourceForm({ source, onClose }: DataSourceFormProps) {
  const store = useDataSources()
  const [name, setName] = useState(source?.name ?? '')
  const [kind, setKind] = useState<DataSourceKind>(source?.kind ?? 'idb')
  const [idbEingabe, setIdbEingabe] = useState(idbIdAnzeige(source?.idbId))
  const [zeilen, setZeilen] = useState<FeldZeile[]>(
    source && source.fields.length > 0
      ? source.fields.map(zeileFromField)
      : [{ ...LEERE_ZEILE }],
  )
  // Fehler erst nach dem ersten Speichern-Versuch anzeigen (nicht beim Tippen).
  const [zeigeFehler, setZeigeFehler] = useState(false)

  // Hat die gewählte Art eine feste SoftEngine-Kennung, oder muss der
  // Bediener sie eingeben? Das ist die EINZIGE Frage, die dieses Formular
  // an die Art stellt — sie kommt aus der Arten-Tabelle, nicht aus einer
  // Aufzählung hier.
  const kennungEingeben = artFuer(kind).tabellenId === ''

  // ---------- Validierung (Fehlertexte '' = gültig) ----------
  const nameFehler = name.trim() === '' ? 'Anzeigename fehlt.' : ''
  const idbFehler =
    kennungEingeben && idbIdFromInput(idbEingabe) === ''
      ? 'IDB-ID fehlt (z. B. ID0001).'
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
  const alleFehler = [nameFehler, idbFehler, doppeltFehler, ...zeilenFehler]

  function speichern() {
    if (alleFehler.some((f) => f !== '')) {
      setZeigeFehler(true)
      return
    }
    const daten: Omit<DataSource, 'id'> = {
      name: name.trim(),
      kind,
      ...(kennungEingeben ? { idbId: idbIdFromInput(idbEingabe) } : {}),
      // Unsichtbarer Schreibweg-Technikwert (s. Kopf-Kommentar): Bestand
      // bleibt, neue Quellen bekommen '0_10'.
      ...(source
        ? (source.indexField ? { indexField: source.indexField } : {})
        : { indexField: '0_10' }),
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

        {/* 1. Art — Auswahlliste; die Namen kommen aus der Arten-Tabelle. */}
        <SelectControl
          label="Art"
          value={kind}
          options={QUELLEN_ARTEN.map((a) => ({ value: a.id, label: a.name }))}
          onChange={(v) => setKind(v as DataSourceKind)}
        />

        {/* 2. Herkunft — nur wo die Art keine feste Kennung hat. Bei den
            Stammtabellen steht sie fest; danach zu fragen war vorher eine
            sinnlose Eingabe. Gezeigt wird sie im Detail der Liste. */}
        {kennungEingeben && (
          <Field label="IDB-ID" error={zeigeFehler ? idbFehler : ''}>
            {(f) => (
              <TextInput
                {...f}
                value={idbEingabe}
                placeholder="z. B. ID0001"
                className="w-28"
                onChange={(e) => setIdbEingabe(e.target.value)}
              />
            )}
          </Field>
        )}

        {/* 3. Felder */}
        <FeldListe
          kind={kind}
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
