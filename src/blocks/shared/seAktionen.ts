// seAktionen (Z2)
// Ausfuehrung der Aktionsketten in der EXPORTIERTEN SoftEngine-Maske.
// Die Ketten reisen als data-ff-aktionen-Attribut am Element (exportMask);
// hier werden sie gelesen (parseBlockEvents) und Schritt fuer Schritt
// ausgefuehrt. Z2 kennt nur den Schritt-Typ START_TOOL („Werkzeug
// starten"); Z3 ergaenzt Relation ausfuehren / Wert setzen / Daten neu
// laden samt Antwort-Warteschlange.
//
// Laeuft NUR im Export: Editor-Elemente tragen data-ff-editor (BlockHost)
// und werden abgewiesen — im Editor existiert die Ausfuehrung nicht
// (Muster connectBoard in seRuntime).
//
// „Werkzeug starten" EXAKT nach der verbindlichen Referenz behandlung-umbau
// empfang/index.basis.source.html Z. 861-882 (seStartTool): primaer
// sendBWLinkIntern('0,START_TOOL,<nr>[,<params URL-kodiert>]'), Fallback
// basisHTML_SND_MSG('START_TOOL', { NR: nr, PARAMS: params }) — beide nur,
// wenn SoftEngine die Bridge gestellt hat (ausserhalb passiert nichts).
//
// Doppel-Ausloesung: je Element+Ereignis laeuft immer nur EINE Kette
// (Sperre, Muster __FF_CHAIN_LOCK des alten Editors). Bewusst KEIN
// Zeit-Debounce wie opts.debounce der Referenz — eine Kette darf zwei
// verschiedene Werkzeuge nacheinander starten; erweist sich Doppel-Klick
// im SE-Echttest als Problem, wird der Debounce nachgezogen (Beleg statt
// Verdacht).

import { parseBlockEvents } from '../../core/data/aktionen'
import { PopupBlock } from '../popup/PopupBlock'
import {
  formatNowDate,
  resolveParams,
  type RelationContext,
} from '../../core/data/relations'
import { bootSe, seGlobal } from '../../softengine/bridge'
import {
  executeRelation,
  findRuntimeRelation,
  resolveActionParam,
} from '../../softengine/relations'

// ---------- Pure Helfer (Node-testbar, kein DOM) ----------

// BW-Link fuer START_TOOL — exakt die Form der Referenz (Z. 873-874):
// '0,START_TOOL,<nr>' + optional ',<params URL-kodiert>'.
export function buildStartToolLink(nr: string, params: readonly string[]): string {
  let link = '0,START_TOOL,' + nr
  if (params.length > 0) {
    link += ',' + params.map((p) => encodeURIComponent(p)).join(',')
  }
  return link
}

// ---------- SoftEngine-Anbindung (nur im Export aktiv) ----------

// Werkzeug starten — Transport exakt nach Referenz-seStartTool. Ohne
// Bridge (Vorschau, Tests ohne Stub) passiert nichts.
function seStartTool(nr: string, params: readonly string[]): void {
  if (nr.trim() === '') return
  const g = seGlobal()
  try {
    if (typeof g.sendBWLinkIntern === 'function') {
      g.sendBWLinkIntern(buildStartToolLink(nr, params))
      return
    }
  } catch { /* faellt auf den obj-Weg zurueck, wie die Referenz */ }
  try {
    if (typeof g.basisHTML_SND_MSG === 'function') {
      const obj: Record<string, unknown> = { NR: nr }
      if (params.length > 0) obj.PARAMS = [...params]
      g.basisHTML_SND_MSG('START_TOOL', obj)
    }
  } catch { /* nicht in SE */ }
}

// ---------- Popup-Schritte (P-B) ----------

// Schaltet das offen-Attribut des Popups mit dem Klarnamen `name` (die
// Preflight erzwingt eindeutige Namen). Darstellung/Lebenszyklus bleiben
// beim Popup-Baustein selbst — hier wird NUR geschaltet. Leerer Name oder
// kein Treffer: nichts passiert (die Preflight verhindert das im Export;
// defensiv bleibt es trotzdem still-harmlos).
// Exportiert fuer den Wächter-Test (Node/jsdom, Muster seRuntime-Helfer).
export function applyPopupStep(root: ParentNode, name: string, oeffnen: boolean): void {
  if (name.trim() === '') return
  for (const el of Array.from(root.querySelectorAll(PopupBlock.tagName))) {
    if ((el.getAttribute('name') ?? '') !== name) continue
    if (oeffnen) el.setAttribute('offen', '')
    else el.removeAttribute('offen')
  }
}

// ---------- Ketten-Ausfuehrung ----------

// Laufende Ketten je Element (Sperre gegen erneutes Ausloesen desselben
// Ereignisses, solange die Kette laeuft).
const laufend = new WeakMap<HTMLElement, Set<string>>()

// Fuehrt die Kette eines Ereignisses aus. `context` liefert die Werte der
// Platzhalter ({PINDEX}/{VALUE}; {NOW_DATE} fuellt diese Funktion selbst).
// Kein Attribut / keine Kette am Ereignis -> nichts passiert.
export async function runEvent(
  el: HTMLElement,
  eventKey: string,
  context: RelationContext,
): Promise<void> {
  if (el.hasAttribute('data-ff-editor')) return
  const steps = parseBlockEvents(el.getAttribute('data-ff-aktionen'))[eventKey]
  if (!steps || steps.length === 0) return

  let locks = laufend.get(el)
  if (!locks) {
    locks = new Set()
    laufend.set(el, locks)
  }
  if (locks.has(eventKey)) return
  locks.add(eventKey)
  try {
    // Der ZWISCHENSPEICHER (benannte Schritt-Ergebnisse via resultKey,
    // Nutzer-Kernanforderung) steckt ab Tag 1 im MODELL; hier ausgefuehrt
    // wird er erst mit „Relation ausfuehren" (Z3, seGetNewIndex-Muster) —
    // „Werkzeug starten" liefert kein Ergebnis.
    const values: Record<string, string | undefined> = {
      ...context,
      NOW_DATE: formatNowDate(new Date()),
    }
    let previousResult = ''
    // Ergebnis je Schritt in Ketten-Reihenfolge — dieselben Positionen, die
    // der Export in step_result-Bindungen schreibt (serializeBlockEvents).
    // Jeder Schritt bekommt GENAU einen Eintrag, auch ergebnislose ('').
    const stepResults: string[] = []
    for (const step of steps) {
      if (step.type === 'START_TOOL') {
        seStartTool(step.toolNr, resolveParams({ params: step.toolParams }, values))
        stepResults.push('')
        continue
      }
      if (step.type === 'POPUP_OPEN' || step.type === 'POPUP_CLOSE') {
        applyPopupStep(el.ownerDocument ?? document, step.popup ?? '', step.type === 'POPUP_OPEN')
        stepResults.push('')
        continue
      }
      const relation = findRuntimeRelation(seGlobal().FF_RELATIONS, step.relationId)
      if (!relation) {
        stepResults.push('')
        continue
      }
      const runtimeValues = { context: values, previousResult, stepResults }
      const params = [...step.params, ...step.extraParams]
        .map((binding) => resolveActionParam(binding, runtimeValues))
      const result = await executeRelation(relation, params)
      stepResults.push(result)
      // NUR GET liefert ein Ergebnis — PUT/PUTADD überschreiben den
      // Zwischenspeicher NICHT mehr (Nutzer-Befund 2026-07-17: in der Kette
      // GET → PUT → PUT bekam nur der erste PUT den Index, danach war der
      // „vorherige Schritt" leer).
      if (relation.verb === 'GET_RELATION') previousResult = result
      if (step.resultKey !== '') values[step.resultKey] = result
    }
  } finally {
    locks.delete(eventKey)
  }
}

// Einfaches Klick-Ereignis eines Blocks verdrahten (Schaltflaeche 'onClick').
// Nur im Export (data-ff-editor-Wächter) und nur, wenn Ketten mitreisen —
// ein Block ohne Aktionen bekommt keinen Listener.
const verdrahtet = new WeakSet<HTMLElement>()

export function connectClickAktionen(el: HTMLElement, eventKey: string): void {
  if (el.hasAttribute('data-ff-editor')) return
  if (!el.hasAttribute('data-ff-aktionen')) return
  if (verdrahtet.has(el)) return
  verdrahtet.add(el)
  const chains = parseBlockEvents(el.getAttribute('data-ff-aktionen'))
  if (Object.values(chains).some((steps) => steps.some((step) => step.type === 'RELATION'))) {
    bootSe()
  }
  el.addEventListener('click', () => {
    void runEvent(el, eventKey, {})
  })
}
