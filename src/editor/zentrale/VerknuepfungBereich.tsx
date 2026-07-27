// VerknuepfungBereich — Master-Detail fuer die VERKNUEPFUNGEN zwischen
// Datenquellen. Links die Liste, rechts die Regel: welche zwei Quellen
// gehoeren zusammen, und ueber welche Felder erkennt man das.
//
// Bauart wie DatenquellenBereich und RelationenBereich daneben (dritter Fall
// desselben Musters), damit niemand eine dritte Bedienlogik lernen muss.
//
// Der Bediener waehlt AUSSCHLIESSLICH Klarnamen — Quellennamen und
// Feldbezeichnungen. Die Technikwerte (Quell-ids, Feldcodes) arbeiten
// unsichtbar darunter (Regel 3).
//
// Kein Speichern-Knopf: jede Aenderung geht sofort in den Bestand. Eine
// halbfertige Verknuepfung ist erlaubt (der Bediener tippt ja gerade) — sie
// wird nur nicht zum Verbinden benutzt, und der Bereich sagt das im
// Klartext, statt still nichts zu tun (Regel 4).

import { useState } from 'react'
import { Link2, Plus, X } from 'lucide-react'
import { Button } from '@/ui/atoms/button'
import { IconButton } from '@/ui/atoms/icon-button'
import type { DataSource } from '../../core/data/dataSources'
import {
  MAX_SCHLUESSELPAARE,
  istBrauchbar,
  leereVerknuepfung,
  type SchluesselPaar,
  type SourceLink,
} from '../../core/data/sourceLinks'
import { useDataSources } from '../../state/useDataSources'
import { useSourceLinks } from '../../state/useSourceLinks'
import { SchrittSelect } from './SchrittSelect'

// Anzeigename einer Quelle; unbekannte id (Quelle geloescht) wird benannt
// statt verschwiegen — sonst steht da eine leere Zeile ohne Erklaerung.
function quellenName(sources: readonly DataSource[], id: string): string {
  if (id === '') return '— keine —'
  return sources.find((s) => s.id === id)?.name ?? '(gelöschte Quelle)'
}

export function VerknuepfungBereich() {
  const links = useSourceLinks()
  const sources = useDataSources()
  const [auswahlId, setAuswahlId] = useState<string | null>(links.list[0]?.id ?? null)

  const auswahl = links.list.find((l) => l.id === auswahlId) ?? links.list[0]

  function neu() {
    const angelegt = links.add(leereVerknuepfung())
    setAuswahlId(angelegt.id)
  }

  function loeschen(link: SourceLink) {
    const name = `${quellenName(sources.list, link.fromSourceId)} ↔ ${quellenName(sources.list, link.toSourceId)}`
    if (!window.confirm(`Verknüpfung „${name}" löschen?`)) return
    links.remove(link.id)
    setAuswahlId(null)
  }

  // Eine Eigenschaft der gewaehlten Verknuepfung aendern und sofort sichern.
  function aendere(link: SourceLink, teil: Partial<Omit<SourceLink, 'id'>>) {
    links.update(link.id, {
      fromSourceId: link.fromSourceId,
      toSourceId: link.toSourceId,
      keyPairs: link.keyPairs,
      ...teil,
    })
  }

  function setzePaar(link: SourceLink, index: number, teil: Partial<SchluesselPaar>) {
    const paare = link.keyPairs.map((p, i) => (i === index ? { ...p, ...teil } : p))
    aendere(link, { keyPairs: paare })
  }

  const felderVon = (id: string) => sources.list.find((s) => s.id === id)?.fields ?? []

  return (
    <div className="flex min-h-0 min-w-0 flex-1">
      {/* Master */}
      <div className="flex w-64 shrink-0 flex-col border-r border-border">
        <div className="border-b border-border p-2">
          <Button variant="outline" size="sm" className="w-full" onClick={neu}>
            <Plus size={14} /> Neue Verknüpfung
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {links.list.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setAuswahlId(l.id)}
              className={`flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs ${
                l.id === auswahl?.id ? 'bg-secondary font-medium' : 'hover:bg-secondary/60'
              }`}
            >
              <Link2 size={13} className="shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">
                {quellenName(sources.list, l.fromSourceId)} ↔ {quellenName(sources.list, l.toSourceId)}
              </span>
              {/* Unvollstaendig? Sagen, nicht verschweigen. */}
              {!istBrauchbar(l) && (
                <span className="shrink-0 text-[0.625rem] text-muted-foreground">unfertig</span>
              )}
            </button>
          ))}
          {links.list.length === 0 && (
            <p className="p-3 text-xs text-muted-foreground">
              Noch keine Verknüpfung. Eine Verknüpfung sagt, welche zwei Datenquellen
              zusammengehören — zum Beispiel „Auftrag" und „Kunde" über die Kundennummer.
            </p>
          )}
        </div>
      </div>

      {/* Detail */}
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-3">
        {!auswahl ? (
          <p className="text-xs text-muted-foreground">Links eine Verknüpfung wählen oder neu anlegen.</p>
        ) : (
          <div className="flex max-w-xl flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Welche zwei Quellen?
              </span>
              <IconButton aria-label="Verknüpfung löschen" onClick={() => loeschen(auswahl)}>
                <X size={13} />
              </IconButton>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(['fromSourceId', 'toSourceId'] as const).map((seite) => (
                <SchrittSelect
                  key={seite}
                  aria-label={seite === 'fromSourceId' ? 'Erste Quelle' : 'Zweite Quelle'}
                  value={auswahl[seite]}
                  onChange={(e) => aendere(auswahl, { [seite]: e.target.value })}
                >
                  <option value="">— Quelle wählen —</option>
                  {sources.list.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </SchrittSelect>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Woran erkennt man, dass zwei Zeilen zusammengehören?
              </span>
              <p className="text-xs text-muted-foreground">
                Alle Zeilen müssen passen. Mehr als eine braucht man nur, wenn ein Feld
                allein nicht eindeutig ist — etwa Kunde <em>und</em> Jahr.
              </p>
              {auswahl.keyPairs.map((paar, i) => (
                <div key={i} className="flex items-center gap-2">
                  <SchrittSelect
                    className="min-w-0 flex-1"
                    aria-label={`Feld ${i + 1} der ersten Quelle`}
                    value={paar.fromField}
                    onChange={(e) => setzePaar(auswahl, i, { fromField: e.target.value })}
                  >
                    <option value="">— Feld —</option>
                    {felderVon(auswahl.fromSourceId).map((f) => (
                      <option key={f.code} value={f.code}>{f.label}</option>
                    ))}
                  </SchrittSelect>
                  <span className="shrink-0 text-xs text-muted-foreground">ist gleich</span>
                  <SchrittSelect
                    className="min-w-0 flex-1"
                    aria-label={`Feld ${i + 1} der zweiten Quelle`}
                    value={paar.toField}
                    onChange={(e) => setzePaar(auswahl, i, { toField: e.target.value })}
                  >
                    <option value="">— Feld —</option>
                    {felderVon(auswahl.toSourceId).map((f) => (
                      <option key={f.code} value={f.code}>{f.label}</option>
                    ))}
                  </SchrittSelect>
                  {auswahl.keyPairs.length > 1 && (
                    <IconButton
                      aria-label={`Zeile ${i + 1} entfernen`}
                      onClick={() => aendere(auswahl, {
                        keyPairs: auswahl.keyPairs.filter((_, at) => at !== i),
                      })}
                    >
                      <X size={13} />
                    </IconButton>
                  )}
                </div>
              ))}
              {auswahl.keyPairs.length < MAX_SCHLUESSELPAARE && (
                <Button
                  variant="outline"
                  size="sm"
                  className="self-start"
                  onClick={() => aendere(auswahl, {
                    keyPairs: [...auswahl.keyPairs, { fromField: '', toField: '' }],
                  })}
                >
                  <Plus size={13} /> Feld dazu
                </Button>
              )}
            </div>

            {/* Klartext statt stillem Nichtstun (Regel 4). */}
            {!istBrauchbar(auswahl) && (
              <p className="rounded border border-border bg-secondary/50 p-2 text-xs text-muted-foreground">
                Noch nicht benutzbar: es fehlen zwei verschiedene Quellen und mindestens
                ein Feldpaar, bei dem <em>beide</em> Seiten gefüllt sind.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
