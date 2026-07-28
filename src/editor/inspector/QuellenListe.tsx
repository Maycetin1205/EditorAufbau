// QuellenListe — die Datenquellen EINES Bausteins als Liste.
//
// Nutzer-Kurskorrektur 2026-07-28: „allgemeine Verknuepfung ergibt keinen
// Sinn". Vorher sollte die Regel „Terminplaner und Kundenhaustiere gehoeren
// ueber die Adressnummer zusammen" als eigener Eintrag in der Kommandozentrale
// liegen. Sie liegt jetzt dort, wo sie wirkt: am Baustein (Regel 7).
//
// Wie viele Quellen es sind, steht nicht fest — „koennte auch sein, dass ich
// nur eins haben will, und vielleicht sogar einen dritten". Darum eine Liste
// mit „+ Datenquelle" statt eines festen Paares und ohne Obergrenze.
//
// Eintrag 1 liefert die ZEILEN (die bestehende `source`-Prop). Ab Eintrag 2
// kommt die Frage dazu, woran man die zusammengehoerige Zeile erkennt — und
// die bezieht sich IMMER auf Eintrag 1, nie auf Eintrag 2 (eine Stufe).
//
// Der Bediener sieht ausschliesslich Klarnamen (Quellenname, Feldbezeichnung);
// die Technikwerte (Quellen-ids, Feldcodes) arbeiten unsichtbar darunter
// (Regel 3). Kein Speichern-Knopf: jede Aenderung geht sofort in den Baum.

import { Plus, X } from 'lucide-react'
import { Button } from '@/ui/atoms/button'
import { IconButton } from '@/ui/atoms/icon-button'
import { SchrittSelect } from '@/ui/atoms/schritt-select'
import type { BlockNode } from '../../core/blocks/BlockData'
import {
  MAX_SCHLUESSELPAARE,
  quelleBrauchbar,
  WEITERE_QUELLEN_PROP,
  weitereQuellenAus,
  type BausteinQuelle,
  type SchluesselPaar,
} from '../../core/data/sourceLinks'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'
import { SelectControl } from './controls/SelectControl'

// Zwei Auswahl-Bauteile, je nach Platz (Angleichung 2026-07-28 — vorher ein
// selbstgebautes nacktes <select>, das anders aussah als die
// Eigenschaftsfelder darueber im selben Panel):
//   - Quellen-Auswahl je Eintrag (EIN beschriftetes Feld pro Zeile) →
//     dasselbe Radix-SelectControl wie die Nachbarfelder.
//   - Schluesselregel-Zeilen („Feld = Feld", drei Dinge nebeneinander) →
//     SchrittSelect: kompakt, ohne das Label/Beschreibungs-Gepaeck des
//     Field-Molekuels, mit eigenem Aufklapp-Pfeil (der Browser-Pfeil laege
//     sonst auf dem Text, Nutzer-Korrektur 2026-07-22).
//
// Radix-Select verbietet '' als Option-Wert — interner Platzhalter fuer
// „keine Quelle" (die Prop bleibt dabei der Leer-String; dasselbe Muster
// wie in der frueheren DataSection).
const KEINE = '__keine__'

interface QuellenListeProps {
  block: BlockNode
}

export function QuellenListe({ block }: QuellenListeProps) {
  const ed = useEditor()
  const bibliothek = useDataSources().list

  const erste = typeof block.props.source === 'string' ? block.props.source : ''
  const weitere = weitereQuellenAus(block.props[WEITERE_QUELLEN_PROP])

  // Gewaehlte Quelle geloescht? Dann steht hier eine id ohne Option — die
  // Auswahl bliebe leer und der Baustein zoege still keine Daten mehr.
  // Stattdessen wird der Zustand benannt (Regel 4).
  const fehlt = (id: string) => id !== '' && !bibliothek.some((s) => s.id === id)
  const felderVon = (id: string) => bibliothek.find((s) => s.id === id)?.fields ?? []

  function setzeWeitere(next: BausteinQuelle[]) {
    ed.updateProperty(block.id, WEITERE_QUELLEN_PROP, next)
  }

  function aendere(index: number, teil: Partial<BausteinQuelle>) {
    setzeWeitere(weitere.map((q, i) => (i === index ? { ...q, ...teil } : q)))
  }

  function setzePaar(index: number, paarAt: number, teil: Partial<SchluesselPaar>) {
    aendere(index, {
      keyPairs: weitere[index].keyPairs.map((p, i) => (i === paarAt ? { ...p, ...teil } : p)),
    })
  }

  // Optionen einer Quellen-Auswahl: schon belegte Quellen fallen raus —
  // dieselbe Quelle zweimal am selben Baustein ergaebe zwei gleichnamige
  // Gruppen im Feld-Picker, zwischen denen niemand unterscheiden kann.
  function optionen(eigene: string) {
    const belegt = new Set([erste, ...weitere.map((q) => q.quelleId)])
    belegt.delete(eigene)
    return bibliothek.filter((s) => !belegt.has(s.id))
  }

  const quellenAuswahl = (wert: string, titel: string, onWert: (v: string) => void) => (
    <SelectControl
      label={titel}
      value={wert === '' ? KEINE : wert}
      options={[
        { value: KEINE, label: '— keine —' },
        ...optionen(wert).map((s) => ({ value: s.id, label: s.name })),
        ...(fehlt(wert) ? [{ value: wert, label: '(gelöschte Quelle)' }] : []),
      ]}
      onChange={(v) => onWert(v === KEINE ? '' : v)}
    />
  )

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
        Datenquellen
      </span>

      {/* Eintrag 1 — liefert die Zeilen. */}
      {quellenAuswahl(erste, 'Datenquelle 1', (v) => ed.updateProperty(block.id, 'source', v))}
      {fehlt(erste) && (
        <p className="text-xs text-destructive">
          Die gewählte Datenquelle fehlt in der Bibliothek. Neu wählen — oder
          unter Steuerung → Datenquellen wieder anlegen.
        </p>
      )}

      {/* Eintrag 2..n — je mit ihrer Schluesselregel zu Eintrag 1. */}
      {weitere.map((q, i) => (
        <div key={i} className="flex flex-col gap-1.5 rounded-md border border-border p-2">
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              {quellenAuswahl(q.quelleId, `Datenquelle ${i + 2}`, (v) => aendere(i, { quelleId: v }))}
            </div>
            <IconButton
              aria-label={`Datenquelle ${i + 2} entfernen`}
              onClick={() => setzeWeitere(weitere.filter((_, at) => at !== i))}
            >
              <X size={13} />
            </IconButton>
          </div>
          <span className="text-xs text-muted-foreground">
            Woran erkennt man die zusammengehörige Zeile?
          </span>
          {q.keyPairs.map((paar, at) => (
            <div key={at} className="flex items-center gap-1.5">
              <SchrittSelect
                className="min-w-0 flex-1"
                aria-label={`Feld ${at + 1} der ersten Datenquelle`}
                value={paar.fromField}
                onChange={(e) => setzePaar(i, at, { fromField: e.target.value })}
              >
                <option value="">— Feld —</option>
                {felderVon(erste).map((f) => (
                  <option key={f.code} value={f.code}>{f.label}</option>
                ))}
              </SchrittSelect>
              <span className="shrink-0 text-xs text-muted-foreground">=</span>
              <SchrittSelect
                className="min-w-0 flex-1"
                aria-label={`Feld ${at + 1} der Datenquelle ${i + 2}`}
                value={paar.toField}
                onChange={(e) => setzePaar(i, at, { toField: e.target.value })}
              >
                <option value="">— Feld —</option>
                {felderVon(q.quelleId).map((f) => (
                  <option key={f.code} value={f.code}>{f.label}</option>
                ))}
              </SchrittSelect>
              {q.keyPairs.length > 1 && (
                <IconButton
                  aria-label={`Zeile ${at + 1} entfernen`}
                  onClick={() => aendere(i, { keyPairs: q.keyPairs.filter((_, x) => x !== at) })}
                >
                  <X size={13} />
                </IconButton>
              )}
            </div>
          ))}
          {q.keyPairs.length < MAX_SCHLUESSELPAARE && (
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => aendere(i, { keyPairs: [...q.keyPairs, { fromField: '', toField: '' }] })}
            >
              <Plus size={13} /> Feld dazu
            </Button>
          )}
          {/* Klartext statt stillem Nichtstun (Regel 4). */}
          {!quelleBrauchbar(q) && (
            <p className="text-xs text-muted-foreground">
              Noch nicht benutzbar: es fehlt eine Datenquelle oder ein Feldpaar,
              bei dem <em>beide</em> Seiten gefüllt sind.
            </p>
          )}
        </div>
      ))}

      {/* Eine weitere Quelle hat nur Sinn, wenn Eintrag 1 steht — sie haengt
          ueber ihre Schluesselregel an ihm. */}
      {erste !== '' && (
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => setzeWeitere([...weitere, { quelleId: '', keyPairs: [{ fromField: '', toField: '' }] }])}
        >
          <Plus size={13} /> Datenquelle
        </Button>
      )}
    </div>
  )
}
