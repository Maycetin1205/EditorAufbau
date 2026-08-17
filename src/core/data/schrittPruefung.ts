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

  if (binding.source === 'fixed' || binding.source === 'previous_result') return false
  if (binding.source === 'aus') return false
  if (binding.source === 'data_field') {
    return !binding.dataSourceId?.trim() || binding.value.trim() === ''
  }

  if (binding.source === 'block_value' || binding.source === 'gewaehlte_zeile') {
    return !binding.blockId?.trim() || binding.value.trim() === ''
  }
  if (binding.source === 'step_result') {
    if (binding.ergebnisFeld !== undefined && binding.ergebnisFeld.trim() === '') return true
    return binding.value.trim() === ''
  }
  return binding.value.trim() === ''
}

export function stepProblem(
  step: ActionStep,
  relations?: readonly RelationTemplate[],
  dataSources?: readonly DataSource[],

  popupIds?: readonly string[],

  ergebnisIds?: readonly string[],

  actionValues?: readonly { blockId: string; prop: string }[],

  auswahlGeberIds?: readonly string[],
): string | null {
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
  if (!relation) return 'Schritt "Relation" verweist auf eine gelöschte Vorlage.'
  if (step.params.length !== relation.params.length) {
    return 'Schritt "Relation" hat nicht alle Syntaxparameter übernommen.'
  }
  const missing = step.params.findIndex(bindingProblem)
  if (missing >= 0) return `Schritt "Relation": Parameter ${missing + 1} ist unvollständig.`
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
  if (missingSource) return 'Schritt "Relation" verweist auf eine gelöschte Datenquelle.'
  const missingBlock = allBindings.find((binding) =>
    binding?.source === 'block_value'
    && actionValues
    && !actionValues.some((target) =>
      target.blockId === binding.blockId && target.prop === binding.value),
  )
  if (missingBlock) return 'Schritt "Relation" verweist auf einen gelöschten Baustein.'
  const missingGeber = allBindings.find((binding) =>
    binding?.source === 'gewaehlte_zeile'
    && auswahlGeberIds
    && !auswahlGeberIds.includes(binding.blockId ?? ''),
  )
  if (missingGeber) {
    return 'Schritt "Relation" liest die gewählte Zeile eines Bausteins, den es nicht mehr gibt (oder der keine Auswahl mehr gibt).'
  }
  if (allBindings.some(ergebnisKaputt)) {
    return 'Schritt "Relation": ein Parameter zeigt auf keinen GET-Schritt davor.'
  }
  return null
}
