// schrittPruefung — „Ist dieser Ketten-Schritt exportfaehig?"
//
// Aus aktionen.ts herausgeloest (2026-08-06), weil die Datei ueber den
// 500-Zeilen-Deckel gewachsen war. Der Schnitt ist der natuerliche: drueben
// das MODELL der Ketten (Typen, Anlegen, Transport), hier die eine Frage, die
// Editor UND Preflight stellen — jeder Schritt, den die Maske nicht ausfuehren
// koennte, muss VOR dem Export im Klartext benannt werden (Regel 4).
//
// Alles Optionale ist optional, weil nicht jeder Aufrufer alles weiss: nur wer
// den Baum sieht (Steuerung, Preflight), kann geloeschte Ziele erkennen. Wer
// weniger hereinreicht, bekommt weniger Meldungen — nie falsche.

import type { DataSource } from './dataSources'
import type { RelationTemplate } from './relations'
import { unknownPlaceholders } from './relations'
import {
  AKTIONS_PLATZHALTER,
  stepTypeName,
  type ActionParamBinding,
  type ActionStep,
} from './aktionen'


function bindingProblem(binding: ActionParamBinding | undefined): boolean {
  if (!binding) return true
  // 'aus' = bewusst leer gelassen (x im Formular), kein unvollstaendiger Schritt.
  if (binding.source === 'fixed' || binding.source === 'previous_result') return false
  if (binding.source === 'aus') return false
  if (binding.source === 'data_field') {
    return !binding.dataSourceId?.trim() || binding.value.trim() === ''
  }
  // Beide brauchen BEIDES: welcher Baustein, und was von ihm.
  if (binding.source === 'block_value' || binding.source === 'gewaehlte_zeile') {
    return !binding.blockId?.trim() || binding.value.trim() === ''
  }
  if (binding.source === 'step_result') {
    // OHNE Feld (der Normalfall) gilt das ganze Ergebnis — dann zaehlt nur,
    // dass ein Schritt gewaehlt ist. MIT Feld muss es auch eins sein: kennt
    // die Steuerung die Quelle des Ziel-Schritts nicht, wird der Feldcode
    // frei getippt, und ein Code aus lauter Leerzeichen liesse den Parameter
    // still leer hinausgehen (Regel 4 — nichts scheitert stumm).
    if (binding.ergebnisFeld !== undefined && binding.ergebnisFeld.trim() === '') return true
    return binding.value.trim() === ''
  }
  return binding.value.trim() === ''
}

export function stepProblem(
  step: ActionStep,
  relations?: readonly RelationTemplate[],
  dataSources?: readonly DataSource[],
  // Vorhandene Popup-Seiten (ids) — nur wer sie kennt (Zentrale, Preflight),
  // bekommt die Meldung über eine gelöschte Seite.
  popupIds?: readonly string[],
  // Gültige „Ergebnis von Schritt"-Ziele für DIESEN Schritt (ids der GET-
  // Schritte davor, ergebnisSchritteVor) — nur wer die Kette kennt, prüft.
  ergebnisIds?: readonly string[],
  // Gueltige auslesbare Bausteinwerte der Maske. Nur Aufrufer mit Baumblick
  // (Editor/Preflight) pruefen geloeschte oder nicht mehr freigegebene Ziele.
  actionValues?: readonly { blockId: string; prop: string }[],
  // Baum-ids der vorhandenen Auswahl-GEBER (auswahlGeberImBaum). Ebenfalls
  // nur fuer Aufrufer mit Baumblick — ein Parameter „Feld der gewaehlten
  // Zeile" auf einen geloeschten Geber loeste in der Maske still zu '' auf.
  auswahlGeberIds?: readonly string[],
): string | null {
  // step_result muss auf einen GET-Schritt DAVOR zeigen — ein gelöschter,
  // späterer oder Nicht-GET-Schritt liefe in der Maske still auf ''.
  const ergebnisKaputt = (binding: ActionParamBinding | undefined): boolean =>
    binding?.source === 'step_result'
    && ergebnisIds !== undefined
    && !ergebnisIds.includes(binding.value)
  if (step.type === 'POPUP_OPEN' || step.type === 'POPUP_CLOSE') {
    const name = stepTypeName(step.type)
    if (step.popupId.trim() === '') return `Schritt "${name}" hat kein Popup gewählt.`
    if (popupIds && !popupIds.includes(step.popupId)) {
      return `Schritt "${name}" verweist auf eine gelöschte Popup-Seite.`
    }
    return null
  }
  if (step.type === 'START_TOOL') {
    if (step.toolNr.trim() === '') {
      // „Nummer", nicht „Werkzeug-Nummer" — keine Erklärtexte in der Steuerung.
      return `Schritt "${stepTypeName(step.type)}" hat keine Nummer.`
    }
    if (step.toolParams.some((param) => param.trim() === '')) {
      return `Schritt "${stepTypeName(step.type)}" hat einen leeren Parameter.`
    }
    const unknown = step.toolParams.flatMap((param) => unknownPlaceholders(param, AKTIONS_PLATZHALTER))
    if (unknown.length > 0) {
      return `Schritt "${stepTypeName(step.type)}" hat einen unbekannten Platzhalter.`
    }
    return null
  }
  if (step.relationId === '') return 'Schritt "Relation" hat keine Vorlage.'
  if (!relations) return null
  const relation = relations.find((entry) => entry.id === step.relationId)
  if (!relation) return 'Schritt "Relation" verweist auf eine geloeschte Vorlage.'
  if (step.params.length !== relation.params.length) {
    return 'Schritt "Relation" hat nicht alle Syntaxparameter uebernommen.'
  }
  const missing = step.params.findIndex(bindingProblem)
  if (missing >= 0) return `Schritt "Relation": Parameter ${missing + 1} ist unvollstaendig.`
  if (!relation.allowExtraParams && step.extraParams.length > 0) {
    return 'Schritt "Relation" hat nicht erlaubte Zusatzparameter.'
  }
  if (step.extraParams.some(bindingProblem)) {
    return 'Schritt "Relation" hat einen leeren Zusatzparameter.'
  }
  const allBindings = [
    ...step.params,
    ...step.extraParams,
  ]
  const missingSource = allBindings.find((binding) =>
    binding?.source === 'data_field'
    && dataSources
    && !dataSources.some((source) => source.id === binding.dataSourceId),
  )
  if (missingSource) return 'Schritt "Relation" verweist auf eine geloeschte Datenquelle.'
  const missingBlock = allBindings.find((binding) =>
    binding?.source === 'block_value'
    && actionValues
    && !actionValues.some((target) =>
      target.blockId === binding.blockId && target.prop === binding.value),
  )
  if (missingBlock) return 'Schritt "Relation" verweist auf einen geloeschten Baustein.'
  const missingGeber = allBindings.find((binding) =>
    binding?.source === 'gewaehlte_zeile'
    && auswahlGeberIds
    && !auswahlGeberIds.includes(binding.blockId ?? ''),
  )
  if (missingGeber) {
    return 'Schritt "Relation" liest die gewaehlte Zeile eines Bausteins, den es nicht mehr gibt (oder der keine Auswahl mehr gibt).'
  }
  if (allBindings.some(ergebnisKaputt)) {
    return 'Schritt "Relation": ein Parameter zeigt auf keinen GET-Schritt davor.'
  }
  return null
}
