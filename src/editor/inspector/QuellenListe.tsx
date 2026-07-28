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

// Schlichtes Auswahlfeld. Bewusst NICHT das Radix-SelectControl der
// Nachbarfelder: hier stehen bis zu drei Auswahlen in EINER Zeile
// nebeneinander („Feld ist gleich Feld"), und das Field-Molekuel bringt
// Label + Beschreibung mit, die in einer Zeile nur Platz fressen.
function Auswahl({
  wert, onWert, titel, children,
}: {
  wert: string
  onWert: (v: string) => void
  titel: string
  children: React.ReactNode
}) {
  return (
    <select
      aria-label={titel}
      value={wert}
      onChange={(e) => onWert(e.target.value)}
      className="min-w-0 flex-1 rounded-md border border-input bg-background px-2 py-1 text-xs"
    >
      {children}
    </select>
  )
}

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
    <Auswahl wert={wert} onWert={onWert} titel={titel}>
      <option value="">— keine —</option>
      {optionen(wert).map((s) => (
        <option key={s.id} value={s.id}>{s.name}</option>
      ))}
      {fehlt(wert) && <option value={wert}>(gelöschte Quelle)</option>}
    </Auswahl>
  )

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
        Datenquellen
      </span>

      {/* Eintrag 1 — liefert die Zeilen. */}
      <div className="flex items-center gap-2">
        <span className="w-4 shrink-0 text-xs text-muted-foreground">1</span>
        {quellenAuswahl(erste, 'Erste Datenquelle', (v) => ed.updateProperty(block.id, 'source', v))}
      </div>
      {fehlt(erste) && (
        <p className="text-xs text-destructive">
          Die gewählte Datenquelle fehlt in der Bibliothek. Neu wählen — oder
          unter Steuerung → Datenquellen wieder anlegen.
        </p>
      )}

      {/* Eintrag 2..n — je mit ihrer Schluesselregel zu Eintrag 1. */}
      {weitere.map((q, i) => (
        <div key={i} className="flex flex-col gap-1.5 rounded-md border border-border p-2">
          <div className="flex items-center gap-2">
            <span className="w-4 shrink-0 text-xs text-muted-foreground">{i + 2}</span>
            {quellenAuswahl(q.quelleId, `Datenquelle ${i + 2}`, (v) => aendere(i, { quelleId: v }))}
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
              <Auswahl
                wert={paar.fromField}
                titel={`Feld ${at + 1} der ersten Datenquelle`}
                onWert={(v) => setzePaar(i, at, { fromField: v })}
              >
                <option value="">— Feld —</option>
                {felderVon(erste).map((f) => (
                  <option key={f.code} value={f.code}>{f.label}</option>
                ))}
              </Auswahl>
              <span className="shrink-0 text-xs text-muted-foreground">=</span>
              <Auswahl
                wert={paar.toField}
                titel={`Feld ${at + 1} der Datenquelle ${i + 2}`}
                onWert={(v) => setzePaar(i, at, { toField: v })}
              >
                <option value="">— Feld —</option>
                {felderVon(q.quelleId).map((f) => (
                  <option key={f.code} value={f.code}>{f.label}</option>
                ))}
              </Auswahl>
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
