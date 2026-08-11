// AuswahlFolgeSektion — Inspector-Sektion „Auswahl folgen".
//
// Der Fall (Nutzer 2026-08-05): Tabelle 1 zeigt Kunden, Tabelle 2 Belege.
// HIER, an Tabelle 2, stellt der Bauer ein: „folgt der Auswahl von
// Tabelle 1" plus die Feldpaare, an denen man die zusammengehoerigen
// Zeilen erkennt (Adressnummer = Adressnummer). In der laufenden Maske
// filtert Tabelle 2 dann nach der angeklickten Kundenzeile — ohne Auswahl
// zeigt sie alles, nichts passiert automatisch.
//
// Bedienmuster und Bauteile sind DIESELBEN wie in der QuellenListe daneben
// (SelectControl fuer die Wahl, SchrittSelect-Zeilen fuer „Feld = Feld") —
// zwei Verknuepfungs-Formulare, die verschieden aussehen, waeren fuer den
// Bediener zwei Sprachen fuer dieselbe Sache.
//
// Der Bediener sieht ausschliesslich Klarnamen (Baustein-Name + Quellen-
// Name, Feld-Klarnamen); die Technikwerte (Baum-id, Feldcodes) arbeiten
// unsichtbar (Regel 3). Kein Speichern-Knopf: jede Aenderung geht sofort
// in den Baum. Wer Geber ist, leitet istAuswahlGeber aus Registry + Zustand
// her — kein Bausteintyp-Wissen hier (Regel 2). Angeboten wird damit auch das
// Nachschlage-Feld (es greift im Fenster einen Satz heraus), und NICHT
// angeboten wird eine Tabelle ohne Datenquelle: ihr zu folgen sah eingestellt
// aus und filterte nie.
//
// Am Nachschlage-Feld heisst „folgen" etwas anderes, ohne dass diese Sektion
// davon wissen muss: dort engt die Auswahl das FENSTER ein (die Lupe zeigt nur
// die Haustiere des gewaehlten Kunden), nicht einen angezeigten Wert. Die
// Einstellung ist dieselbe — Geber plus Feldpaare.

import { Plus, X } from '@/ui/zeichen'
import { Button } from '@/ui/atoms/button'
import { IconButton } from '@/ui/atoms/icon-button'
import { SchrittSelect } from '@/ui/atoms/schritt-select'
import { cn } from '@/lib/utils'
import type { BlockNode } from '../../core/blocks/BlockData'
import { auswahlQuelleIdVon, istAuswahlGeber } from '../../core/blocks/treeQuery'
import {
  AUSWAHL_FOLGE_PROP,
  auswahlFolgenAus,
  folgeBrauchbar,
  type AuswahlFolge,
} from '../../core/data/auswahlFolge'
import { quellenKennung } from '../../core/data/dataSources'
import { MAX_SCHLUESSELPAARE, type SchluesselPaar } from '../../core/data/sourceLinks'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'
import { bausteinName } from '../../core/blocks/bausteinName'
import { SelectControl } from './controls/SelectControl'

// Radix-Select verbietet '' als Option-Wert — Platzhalter wie in QuellenListe.
const KEINER = '__keiner__'

interface AuswahlFolgeSektionProps {
  block: BlockNode
  // true = ueber der Sektion steht schon Inhalt -> feine Trennlinie davor
  // (dieselbe Optik wie die Nachbarsektionen im Inspector).
  mitTrenner: boolean
}

export function AuswahlFolgeSektion({ block, mitTrenner }: AuswahlFolgeSektionProps) {
  const ed = useEditor()
  const bibliothek = useDataSources().list

  // Die Oberflaeche fuehrt genau EINE Folge (eine Stufe, ein Geber).
  const folge: AuswahlFolge | undefined = auswahlFolgenAus(block.props[AUSWAHL_FOLGE_PROP])[0]

  // Geber-Kandidaten: alle Auswahl-Geber im Baum ausser diesem Baustein.
  const kandidaten = Object.values(ed.tree).filter(
    (n) => n.id !== block.id && istAuswahlGeber(n),
  )
  // Nichts anzubieten und nichts eingestellt: Sektion ganz weglassen —
  // ein leeres Formular ohne waehlbaren Geber waere nur Raetselraten.
  if (kandidaten.length === 0 && !folge) return null

  // BEIDE Seiten von „Feld = Feld" fragen DIESELBE Herleitung
  // (auswahlQuelleIdVon): links die Quelle, aus der der Satz des GEBERS stammt,
  // rechts die Quelle, deren Zeilen DIESER Baustein einengt. Meist ist das
  // schlicht die Datenquelle des jeweiligen Bausteins — beim Nachschlage-Feld
  // aber seine Nachschlage-Quelle, auf beiden Seiten: aus ihr stammt der Satz,
  // den es abgibt, und ihre Zeilen zeigt sein Fenster. Mit den Feldcodes der
  // falschen Tabelle liefe die Folge in der Maske still ins Leere.
  const quelleVon = (n: BlockNode | undefined) =>
    bibliothek.find((s) => s.id === auswahlQuelleIdVon(n))
  const eigeneQuelle = quelleVon(block)
  const geberNode = folge ? ed.tree[folge.geberId] : undefined
  const geberQuelle = quelleVon(geberNode)

  // Klarname eines Kandidaten: Baustein-Name plus Quellen-Name zur
  // Unterscheidung — zwei Tabellen heissen sonst beide nur „Tabelle".
  // Die SE-Kennung dazu als dezente Technik-Marke (detail, 2026-08-06).
  const anzeige = (n: BlockNode): { label: string; detail?: string } => {
    const q = quelleVon(n)
    return q
      ? { label: `${bausteinName(n)} (${q.name})`, detail: quellenKennung(q) }
      : { label: bausteinName(n) }
  }

  function setze(neu: AuswahlFolge[]): void {
    ed.updateProperty(block.id, AUSWAHL_FOLGE_PROP, neu)
  }
  function setzeGeber(v: string): void {
    if (v === KEINER) {
      setze([])
      return
    }
    setze([{
      geberId: v,
      keyPairs: folge && folge.keyPairs.length > 0
        ? folge.keyPairs
        : [{ fromField: '', toField: '' }],
    }])
  }
  function setzePaar(at: number, teil: Partial<SchluesselPaar>): void {
    if (!folge) return
    setze([{
      ...folge,
      keyPairs: folge.keyPairs.map((p, i) => (i === at ? { ...p, ...teil } : p)),
    }])
  }

  return (
    <div className={cn('flex flex-col gap-2', mitTrenner && 'mt-4 border-t border-border pt-4')}>
      <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
        Auswahl folgen
      </span>
      <SelectControl
        label="Folgt der Auswahl von"
        value={folge && folge.geberId !== '' ? folge.geberId : KEINER}
        options={[
          { value: KEINER, label: '— keinem —' },
          ...kandidaten.map((n) => ({ value: n.id, ...anzeige(n) })),
          // Geber geloescht: den Zustand benennen statt still leer (Regel 4);
          // der Preflight blockt den Export dazu im Klartext. (Leere Geber-id
          // faellt auf „keinem" zurueck — Radix verbietet '' als Wert.)
          ...(folge && folge.geberId !== '' && !kandidaten.some((k) => k.id === folge.geberId)
            ? [{ value: folge.geberId, label: '(gelöschter Baustein)' }]
            : []),
        ]}
        onChange={setzeGeber}
      />
      {folge && (
        <>
          <span className="text-xs text-muted-foreground">
            Woran erkennt man die zusammengehörigen Zeilen?
          </span>
          {folge.keyPairs.map((paar, at) => (
            <div key={at} className="flex items-center gap-1.5">
              <SchrittSelect
                className="min-w-0 flex-1"
                aria-label={`Feld ${at + 1} beim Auswahl-Geber`}
                value={paar.fromField}
                onChange={(e) => setzePaar(at, { fromField: e.target.value })}
              >
                <option value="">— Feld —</option>
                {(geberQuelle?.fields ?? []).map((f) => (
                  <option key={f.code} value={f.code}>{f.label}</option>
                ))}
              </SchrittSelect>
              <span className="shrink-0 text-xs text-muted-foreground">=</span>
              <SchrittSelect
                className="min-w-0 flex-1"
                aria-label={`Feld ${at + 1} in diesem Baustein`}
                value={paar.toField}
                onChange={(e) => setzePaar(at, { toField: e.target.value })}
              >
                <option value="">— Feld —</option>
                {(eigeneQuelle?.fields ?? []).map((f) => (
                  <option key={f.code} value={f.code}>{f.label}</option>
                ))}
              </SchrittSelect>
              {folge.keyPairs.length > 1 && (
                <IconButton
                  aria-label={`Feldpaar ${at + 1} entfernen`}
                  onClick={() => setze([{
                    ...folge,
                    keyPairs: folge.keyPairs.filter((_, x) => x !== at),
                  }])}
                >
                  <X size={13} />
                </IconButton>
              )}
            </div>
          ))}
          {folge.keyPairs.length < MAX_SCHLUESSELPAARE && (
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => setze([{
                ...folge,
                keyPairs: [...folge.keyPairs, { fromField: '', toField: '' }],
              }])}
            >
              <Plus size={13} /> Feld dazu
            </Button>
          )}
          {/* Klartext statt stillem Nichtstun (Regel 4). */}
          {(!geberQuelle || !eigeneQuelle) && (
            <p className="text-xs text-muted-foreground">
              Beide Bausteine brauchen zuerst eine Datenquelle — sonst gibt es
              keine Felder, an denen man die Zeilen erkennen könnte.
            </p>
          )}
          {geberQuelle && eigeneQuelle && !folgeBrauchbar(folge) && (
            <p className="text-xs text-muted-foreground">
              Noch nicht wirksam: es fehlt ein Feldpaar, bei dem <em>beide</em>{' '}
              Seiten gefüllt sind.
            </p>
          )}
        </>
      )}
    </div>
  )
}
