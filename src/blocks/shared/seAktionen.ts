import { ACTION_VALUE_ID_ATTR, parseBlockEvents, type RuntimeStep } from '../../core/data/aktionen'
import type { ErfassungsTraegerElement } from '../../core/blocks/BlockDefinition'
import { auswahlFuer } from './auswahl'
import { PopupBlock } from '../popup/PopupBlock'
import {
  formatNowDate,
  resolveParams,
  type RelationContext,
} from '../../core/data/relations'
import { bootSe, seGlobal } from '../../softengine/bridge'
import { meldeFehler } from '../../softengine/meldung'
import {
  executeRelation,
  findRuntimeRelation,
  resolveActionParam,
} from '../../softengine/relations'

export function buildStartToolLink(nr: string, params: readonly string[]): string {
  let link = '0,START_TOOL,' + nr
  if (params.length > 0) {
    link += ',' + params.map((p) => encodeURIComponent(p)).join(',')
  }
  return link
}

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

export function applyPopupStep(root: ParentNode, name: string, oeffnen: boolean): void {
  if (name.trim() === '') return
  const alle = Array.from(root.querySelectorAll(PopupBlock.tagName))

  const treffer = alle.filter(
    (el) => (el.getAttribute('name') ?? PopupBlock.defaultProps.name) === name,
  )
  if (treffer.length === 0) {
    meldeFehler('Fenster „' + name + '“ gibt es in dieser Maske nicht.')
    return
  }
  if (treffer.length > 1) {
    meldeFehler('Fenster „' + name + '“ gibt es mehrfach — keines ist gemeint.')
    return
  }
  const ziel = treffer[0]
  if (!oeffnen) {
    ziel.removeAttribute('offen')
    return
  }
  for (const el of alle) {
    if (el !== ziel) el.removeAttribute('offen')
  }
  ziel.setAttribute('offen', '')
}

const laufend = new WeakMap<HTMLElement, Set<string>>()

export function meldeKettenFehler(fehler: unknown): void {
  const text = fehler instanceof Error ? fehler.message : String(fehler)
  meldeFehler('Aktionskette fehlgeschlagen: ' + text)
}

// Die Tabellen, deren Erfassungszellen die Kette liest — ueber die Parameter
// der Schritte, nicht ueber einen Bausteintyp (Regel 2).
function erfassungsTraegerIds(steps: readonly RuntimeStep[]): string[] {
  const ids = new Set<string>()
  for (const step of steps) {
    if (step.type !== 'RELATION') continue
    for (const binding of [...step.params, ...step.extraParams]) {
      if (binding.source === 'erfassungszelle' && (binding.blockId ?? '') !== '') {
        ids.add(binding.blockId ?? '')
      }
    }
  }
  return [...ids]
}

function sucheTraeger(
  root: ParentNode,
  blockId: string,
): (HTMLElement & Partial<ErfassungsTraegerElement>) | undefined {
  return Array.from(root.querySelectorAll<HTMLElement>(`[${ACTION_VALUE_ID_ATTR}]`))
    .find((el) => el.getAttribute(ACTION_VALUE_ID_ATTR) === blockId)
}

async function laufeSchritte(
  el: HTMLElement,
  steps: readonly RuntimeStep[],
  context: RelationContext,
  erfassteZelle: ((blockId: string, spaltenIndex: number) => string) | undefined,
): Promise<void> {
  const values: Record<string, string | undefined> = {
    ...context,
    NOW_DATE: formatNowDate(new Date()),
  }
  let previousResult = ''

  const stepResults: string[] = []

  const rohErgebnisse: unknown[] = []
  const ohneErgebnis = (): void => {
    stepResults.push('')
    rohErgebnisse.push(undefined)
  }
  for (const step of steps) {
    if (step.type === 'START_TOOL') {
      seStartTool(step.toolNr, resolveParams({ params: step.toolParams }, values))
      ohneErgebnis()
      continue
    }
    if (step.type === 'POPUP_OPEN' || step.type === 'POPUP_CLOSE') {
      applyPopupStep(el.ownerDocument ?? document, step.popup ?? '', step.type === 'POPUP_OPEN')
      ohneErgebnis()
      continue
    }
    const relation = findRuntimeRelation(seGlobal().FF_RELATIONS, step.relationId)
    if (!relation) {
      ohneErgebnis()
      continue
    }

    const runtimeValues = {
      context: values,
      previousResult,
      stepResults,
      stepRohErgebnisse: rohErgebnisse,
      gewaehlteZeile: auswahlFuer,
      ...(erfassteZelle ? { erfassteZelle } : {}),
    }
    const params = [...step.params, ...step.extraParams]
      .map((binding) => resolveActionParam(binding, runtimeValues))
    const antwort = await executeRelation(relation, params)
    const result = antwort.wert
    stepResults.push(result)
    rohErgebnisse.push(antwort.roh)

    if (relation.verb === 'GET_RELATION') previousResult = result
    if (step.resultKey !== '') values[step.resultKey] = result
  }
}

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
    const traegerIds = erfassungsTraegerIds(steps)
    if (traegerIds.length === 0) {
      await laufeSchritte(el, steps, context, undefined)
      return
    }
    // Liest die Kette Erfassungszellen, laeuft sie EINMAL JE ERFASSTER ZEILE
    // (G4). Zwei Tabellen in einer Kette waeren zwei Zeilen-Listen — welche
    // gibt den Takt? Darum eine je Kette.
    if (traegerIds.length > 1) {
      meldeFehler('Die Kette liest Erfassungszellen aus mehreren Tabellen — nur eine Tabelle je Kette.')
      return
    }
    const traeger = sucheTraeger(el.ownerDocument ?? document, traegerIds[0])
    const zeilen = traeger?.erfassteZeilen
    if (!traeger || !Array.isArray(zeilen)) {
      meldeFehler('Die Tabelle der Erfassungszellen gibt es in dieser Maske nicht.')
      return
    }
    // Keine erfasste Zeile: nichts zu schreiben, kein Lauf. Kein Fehler —
    // der Bediener sieht in der Tabelle, dass nichts erfasst ist.
    for (const zeile of zeilen) {
      await laufeSchritte(el, steps, context, (blockId, spaltenIndex) =>
        (blockId === traegerIds[0] ? String(zeile[spaltenIndex] ?? '') : ''))
    }
    // Geleert wird erst, wenn ALLE Zeilen gelaufen sind — bricht ein Schritt
    // ab (wirft), bleiben die restlichen Zeilen stehen statt zu verschwinden.
    if (zeilen.length > 0) traeger.erfassungLeeren?.()
  } finally {
    locks.delete(eventKey)
  }
}

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
    runEvent(el, eventKey, {}).catch(meldeKettenFehler)
  })
}
