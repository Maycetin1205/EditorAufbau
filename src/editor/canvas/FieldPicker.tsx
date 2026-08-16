// FieldPicker
// "Stelle anklicken → Feld wählen". Kleines
// Auswahlfeld direkt an der angeklickten Stelle — zeigt AUSSCHLIESSLICH
// Klarnamen aus dem Feld-Wörterbuch (nie Feldcodes, keine erfundenen
// Beispielwerte); der Feldcode (Technikwert) wird unsichtbar in die
// Bindungs-Prop geschrieben. "— nicht gebunden —" löst die Bindung wieder.
//
// Seit 2026-07-28 kann ein Baustein mehrere Datenquellen tragen. Der Picker
// zeigt sie deshalb als GRUPPEN: erste Quelle oben, danach die weiteren in
// Reihenfolge. Bei den weiteren steht dabei, WORÜBER verknüpft ist — der
// Bediener soll sehen, warum diese Quelle hier angeboten wird. Gibt es nur
// eine Quelle, sieht der Picker aus wie vorher (eine Gruppe, eine Kopfzeile).
//
// Reine Editor-Hilfe (Editor-UI-Tokens/Tailwind, KEIN Masken-Design):
// lebt im BlockHost über der Maske und erscheint nie im Export.
//
// Den Rahmen (Portal, feste Position, Schließ-Wege) stellt seit U3 das geteilte
// AuswahlFenster — hier steht nur noch, was DIESES Fenster zeigt.

import { AuswahlFenster } from '@/ui/molecules/auswahl-fenster'
import {
  QUELLEN_TRENNER,
  bindungMitQuelle,
  zerlegeBindung,
  type ZuordnungZeile,
} from '../../core/blocks/BlockDefinition'
import type { DataSourceField } from '../../core/data/dataSources'
import type { Eingabesitzung } from '../inspector/controls/eingabeSitzung'

// Eine Quelle als Abschnitt im Picker.
export interface PickerGruppe {
  // Technikwert; '' = erste Quelle des Bausteins (Bindung bleibt unqualifiziert).
  quelleId: string
  // Klarname der Quelle — was der Bediener liest (Regel 3).
  name: string
  // SE-Kennung in Bediener-Form ('ID0001', 'ADR', 'POS') als dezente
  // Technik-Marke NEBEN dem Klarnamen (Nutzer-Wunsch 2026-08-06: „nicht
  // nur der Alias"). Leer = keine Marke.
  kennung?: string
  // Bei weiteren Quellen: worüber verknüpft ist, in Klarnamen
  // ('Adressnummer'). Bei der ersten Quelle leer.
  hinweis?: string
  fields: readonly DataSourceField[]
}

// Eine zusätzliche WAHL über der Feldliste (Registry: ListenBindung.
// eintragsWahl — bei der Tabelle die Darstellung einer Spalte). Der Picker
// zeichnet sie generisch: er kennt nur Beschriftung, Optionen und den
// aktuellen Wert, nie deren Bedeutung.
export interface PickerWahl {
  label: string
  optionen: readonly { wert: string; name: string }[]
  aktuell: string
  onWaehle: (wert: string) => void
}

// Ein ZUSAETZLICHES Feld der gewaehlten Wahl (Registry: EintragsWahlOption.
// felder — bei der Tabelle Bild und Unterzeile der Art „Bild + Name"). Auch das
// zeichnet der Picker generisch: er kennt Beschriftung, aktuelle Bindung und
// einen Rueckkanal, nie deren Bedeutung.
export interface PickerFeld {
  key: string
  label: string
  // Aktuell gebunden, ROH wie gespeichert ('' = nicht gebunden).
  aktuell: string
  onWaehle: (wert: string) => void
}

// Eine ZUORDNUNGSTABELLE unter der Wahl (Registry: ListenBindung.
// eintragsZuordnung — bei der Tabelle: welcher Status-Datenwert was bedeutet).
// Auch sie zeichnet der Picker generisch: drei Beschriftungen, eine Liste
// waehlbarer Bedeutungen, die Zeilen selbst und ein Rueckkanal.
export interface PickerZuordnung {
  label: string
  wertLabel: string
  nameLabel: string
  bedeutungLabel: string
  bedeutungen: readonly { wert: string; name: string }[]
  zeilen: readonly ZuordnungZeile[]
  // Die GANZE Liste zurueck — der Picker rechnet nicht mit Indizes im Store.
  onAendern: (zeilen: ZuordnungZeile[]) => void
  // Eine Tipp-Sitzung = EIN Undo-Schritt (s. controls/eingabeSitzung). Ohne
  // sie waere jeder Buchstabe in „Datenwert" und „Klarname" ein eigener
  // Verlaufs-Schritt und ein Klarname von 12 Zeichen spuelte den halben
  // Verlauf weg (Deckel 50).
  sitzung: Eingabesitzung
}

interface FieldPickerProps {
  // Klarname der Stelle (aus bindableSpots, z. B. 'Titel').
  spotLabel: string
  gruppen: readonly PickerGruppe[]
  // Optional, s. PickerWahl. Fehlt sie, sieht der Picker aus wie bisher.
  wahl?: PickerWahl
  // Optional, s. PickerFeld. Leer, wenn die gewaehlte Wahl keine hat.
  felder?: readonly PickerFeld[]
  // Optional, s. PickerZuordnung. Der Aufrufer laesst sie weg, wenn die
  // aktuelle Wahl gar keine Zuordnung kennt.
  zuordnung?: PickerZuordnung
  // Aktuell gebundener Wert, ROH wie gespeichert ('' = ungebunden,
  // 'quelle::code' = Feld einer weiteren Quelle).
  current: string
  // Position in VIEWPORT-Koordinaten: der Picker haengt per Portal als
  // fixiertes Overlay am body — kein Scroll-/Overflow-Container (z. B.
  // der Kanban-Spaltenrumpf) kann ihn einfangen oder abschneiden.
  top: number
  left: number
  // Der fertige Wert, wie er gespeichert wird ('' = nicht gebunden).
  onPick: (wert: string) => void
  onClose: () => void
}

export function FieldPicker({
  spotLabel,
  gruppen,
  wahl,
  felder,
  zuordnung,
  current,
  top,
  left,
  onPick,
  onClose,
}: FieldPickerProps) {
  // Der Haken sitzt am ZERLEGTEN Wert: bei einer Bindung an eine weitere
  // Quelle muss er in DEREN Gruppe stehen, nicht beim gleichnamigen Feldcode
  // der ersten Quelle. Im Bestand des Nutzers heisst „Tiername" in beiden
  // Quellen anders codiert — ohne Zerlegen stuende der Haken irgendwo.
  const jetzt = zerlegeBindung(current)

  const eintrag = (quelleId: string, code: string, name: string) => {
    const gewaehlt = code === jetzt.code && quelleId === jetzt.quelleId
    return (
      <button
        key={`${quelleId}${QUELLEN_TRENNER}${code === '' ? '__keine__' : code}`}
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onPick(bindungMitQuelle(quelleId, code))
        }}
        className={`flex w-full items-baseline gap-3 rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground ${
          gewaehlt ? 'font-semibold' : ''
        }`}
      >
        <span>{gewaehlt ? '✓ ' : ''}{name}</span>
      </button>
    )
  }

  return (
    <AuswahlFenster
      bezeichnung={`Feld für ${spotLabel}`}
      oben={top}
      links={left}
      onClose={onClose}
      /* Mit Zuordnungstabelle oder zusaetzlichen Feldern braucht das Fenster
         mehr Platz: drei Felder je Zeile bzw. Beschriftung samt Auswahlliste
         passen nicht in die schmale Feldliste. Ohne beides bleibt es exakt so
         breit wie bisher. */
      className={zuordnung || (felder && felder.length > 0) ? 'max-h-96 w-80' : 'max-h-64 w-60'}
    >
      {/* Die zusätzliche Wahl steht OBEN und abgesetzt: sie gehört zur
          Stelle selbst, nicht zu einer der Quellen darunter. Ein Klick
          darauf schließt den Picker NICHT — Darstellung und Feld sind zwei
          Handgriffe an derselben Spalte, und wer beides ändern will, soll
          nicht zweimal aufmachen müssen. */}
      {wahl && (
        <div className="mb-1 border-b border-border pb-1">
          <p className="px-2 pb-1 pt-1.5 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">
            {wahl.label}
          </p>
          <div className="flex flex-wrap gap-1 px-1">
            {wahl.optionen.map((o) => (
              <button
                key={o.wert}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  wahl.onWaehle(o.wert)
                }}
                className={`rounded-sm border px-2 py-1 text-xs ${
                  o.wert === wahl.aktuell
                    ? 'border-primary bg-primary/10 font-semibold text-foreground'
                    : 'border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {o.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Die zusaetzlichen Felder der gewaehlten Wahl. Als Auswahlliste statt
          als Knopfliste wie unten: es sind ZWEI Stellen nebeneinander, und je
          eine volle Feldliste haette das Fenster unbedienbar lang gemacht.
          Steht die Stelle auf einer Wahl ohne Zusatzfelder, fehlt der Block
          ganz — ein leerer Kasten „Bild" an einer Textspalte waere ein Feld,
          das nichts tut. */}
      {felder && felder.length > 0 && (
        <div className="mb-1 border-b border-border pb-1">
          {felder.map((f) => (
            <label key={f.key} className="mb-1 flex items-center gap-2 px-2">
              <span className="w-20 shrink-0 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">
                {f.label}
              </span>
              <select
                value={f.aktuell}
                onChange={(e) => f.onWaehle(e.target.value)}
                className="min-w-0 flex-1 rounded-sm border border-border bg-background px-1 py-1 text-xs"
              >
                <option value="">— nicht gebunden —</option>
                {/* Gebunden an etwas, das die Listen unten nicht enthalten
                    (Quelle abgehaengt, Feld geloescht): eine eigene Option
                    dafuer. Ohne sie faellt das Auswahlfeld stumm auf „nicht
                    gebunden" zurueck und BEHAUPTET damit, hier sei nichts
                    eingestellt — waehrend die Bindung in Wahrheit steht und
                    unveraendert mit exportiert wird (Regel 4). Der Export
                    blockt sie nicht; hier ist die einzige Stelle, an der der
                    Bauer davon erfaehrt. */}
                {f.aktuell !== ''
                  && !gruppen.some((g) =>
                    g.fields.some((feld) => bindungMitQuelle(g.quelleId, feld.code) === f.aktuell))
                  && <option value={f.aktuell}>— unbekanntes Feld —</option>}
                {gruppen.map((g) => (
                  <optgroup
                    key={g.quelleId === '' ? '__erste__' : g.quelleId}
                    label={g.name}
                  >
                    {g.fields.map((feld) => (
                      <option
                        key={`${g.quelleId}${QUELLEN_TRENNER}${feld.code}`}
                        value={bindungMitQuelle(g.quelleId, feld.code)}
                      >
                        {feld.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}
      {/* Die Zuordnungstabelle sitzt unter der Wahl und ueber den Feldern:
          sie gehört zur gewählten Darstellung, nicht zur Datenquelle. Sie ist
          FREIWILLIG — eine leere Tabelle ist kein Fehlerzustand, sondern
          heißt „zeig den Rohwert". Deshalb steht hier auch kein Zwang, nur
          ein Hinweis, was ohne Zuordnung passiert. */}
      {zuordnung && (
        <div className="mb-1 border-b border-border pb-1">
          <p className="px-2 pb-1 pt-1.5 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">
            {zuordnung.label}
          </p>
          {zuordnung.zeilen.length === 0 && (
            <p className="px-2 pb-1 text-xs text-muted-foreground">
              Ohne Zuordnung zeigt die Marke den Datenwert grau.
            </p>
          )}
          {zuordnung.zeilen.map((z, i) => {
            // Immer die GANZE Liste zurueckgeben: der Picker haelt keinen
            // eigenen Zustand, jede Aenderung geht sofort in den Store und
            // kommt von dort als neue `zeilen` zurueck.
            const ersetze = (teil: Partial<ZuordnungZeile>) => {
              const next = zuordnung.zeilen.map((z2) => ({ ...z2 }))
              next[i] = { ...next[i], ...teil }
              zuordnung.onAendern(next)
            }
            return (
              <div key={i} className="mb-1 flex items-center gap-1 px-1">
                <input
                  type="text"
                  aria-label={zuordnung.wertLabel}
                  placeholder={zuordnung.wertLabel}
                  value={z.wert}
                  onChange={(e) => {
                    zuordnung.sitzung.beginnen()
                    ersetze({ wert: e.target.value })
                  }}
                  onBlur={zuordnung.sitzung.beenden}
                  className="w-16 rounded-sm border border-border bg-background px-1.5 py-1 text-xs"
                />
                <input
                  type="text"
                  aria-label={zuordnung.nameLabel}
                  placeholder={zuordnung.nameLabel}
                  value={z.name}
                  onChange={(e) => {
                    zuordnung.sitzung.beginnen()
                    ersetze({ name: e.target.value })
                  }}
                  onBlur={zuordnung.sitzung.beenden}
                  className="min-w-0 flex-1 rounded-sm border border-border bg-background px-1.5 py-1 text-xs"
                />
                <select
                  aria-label={zuordnung.bedeutungLabel}
                  value={z.bedeutung}
                  onChange={(e) => ersetze({ bedeutung: e.target.value })}
                  className="rounded-sm border border-border bg-background px-1 py-1 text-xs"
                >
                  {zuordnung.bedeutungen.map((b) => (
                    <option key={b.wert} value={b.wert}>{b.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  aria-label={`${zuordnung.wertLabel} „${z.wert}" entfernen`}
                  title="Zeile entfernen"
                  onClick={(e) => {
                    e.stopPropagation()
                    zuordnung.onAendern(zuordnung.zeilen.filter((_, k) => k !== i).map((z2) => ({ ...z2 })))
                  }}
                  className="rounded-sm px-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  ×
                </button>
              </div>
            )
          })}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              // Die erste Bedeutung als Vorbelegung: ein leeres Select waere
              // ein Wert, den die Liste gar nicht kennt.
              zuordnung.onAendern([
                ...zuordnung.zeilen.map((z2) => ({ ...z2 })),
                { wert: '', name: '', bedeutung: zuordnung.bedeutungen[0]?.wert ?? '' },
              ])
            }}
            className="mx-1 rounded-sm px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            + Zuordnung
          </button>
        </div>
      )}
      {/* Eine Quelle: Kopfzeile wie bisher. Mehrere: neutrale Kopfzeile, und
          jede Quelle bekommt ihre eigene Zwischenüberschrift. Die SE-Kennung
          steht dezent daneben (Mono, gedämpft — Nutzer 2026-08-06). */}
      <p className="px-2 pb-1 pt-1.5 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {gruppen.length === 1 ? `${spotLabel} · Feld aus ${gruppen[0].name}` : `${spotLabel} · Feld wählen`}
        {gruppen.length === 1 && gruppen[0].kennung ? (
          <span className="ml-1.5 font-mono font-normal normal-case opacity-70">{gruppen[0].kennung}</span>
        ) : null}
      </p>
      {eintrag('', '', '— nicht gebunden —')}
      {gruppen.map((g, i) => (
        <div key={g.quelleId === '' ? '__erste__' : g.quelleId}>
          {gruppen.length > 1 && (
            <p className={`px-2 pb-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground ${i > 0 ? 'mt-1.5 border-t border-border pt-1.5' : 'pt-1.5'}`}>
              {g.name}
              {g.kennung ? <span className="ml-1.5 font-mono font-normal normal-case opacity-70">{g.kennung}</span> : null}
              {g.hinweis ? <span className="font-normal normal-case"> · über {g.hinweis}</span> : null}
            </p>
          )}
          {g.fields.map((f) => eintrag(g.quelleId, f.code, f.label))}
        </div>
      ))}
    </AuswahlFenster>
  )
}
