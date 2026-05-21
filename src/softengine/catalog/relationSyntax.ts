// Relation-Syntax: Erzeugen und Parsen von GET_RELATION / PUT_RELATION / PUTADD_RELATION.
// 1:1 portiert aus altem Editor (dataStore.ts), nur Typen ergaenzt.
// Format: "<KIND>_RELATION[relNo!sourceNo!targetNo!direction!indexValue!idbId(!fieldValue)]"
// Variable-Platzhalter in {GeschwGleich} oder {{GJ}} werden als Parameter erkannt.

import type {
  RelationDefinition,
  RelationDirection,
  RelationKind,
  RelationSyntaxParam,
} from './types'

interface ParsedRelation {
  kind: RelationKind
  relNo: string
  sourceNo: string
  targetNo: string
  direction: RelationDirection
  indexValue: string
  idbId: string
  fieldValue: string
  syntaxBased: true
  allowExtraParams: boolean
  syntaxParams: RelationSyntaxParam[]
}

export function generateRelationSyntax(relation: Partial<RelationDefinition>): string {
  const params: string[] = [
    relation.relNo ?? '',
    relation.sourceNo ?? '',
    relation.targetNo ?? '',
    relation.direction ?? '',
    relation.indexValue ?? '',
    relation.idbId ?? '',
  ]
  if (relation.kind === 'PUT' || relation.kind === 'PUTADD') {
    params.push(relation.fieldValue ?? '')
  }
  return `${relation.kind ?? 'GET'}_RELATION[${params.join('!')}]`
}

export function parseRelationSyntax(input: string): ParsedRelation | null {
  const match = input.trim().match(/^(GET|PUT|PUTADD)_RELATION\[([^\]]*)\]$/i)
  if (!match) return null

  const kind = match[1].toUpperCase() as RelationKind
  const parts = match[2].split('!')
  const relNo = parts[0] ?? ''
  const rawParams = parts.slice(1).filter((p) => p !== '...')
  const allowExtraParams = parts.includes('...')

  const syntaxParams: RelationSyntaxParam[] = rawParams.map((raw) => {
    // {GJ} oder {{GJ}} -> variabler Platzhalter
    const braceMatch = raw.match(/^\{+([^}]+)\}+$/)
    if (braceMatch) {
      return { key: braceMatch[1], label: braceMatch[1], value: '', source: 'variable' }
    }
    return { key: raw, label: raw, value: raw, source: 'fixed' }
  })

  // Bei Platzhaltern in alten Feldern: leeren statt literal "{GJ}" speichern.
  const clean = (val: string): string => {
    const m = val.match(/^\{+([^}]+)\}+$/)
    return m ? '' : val
  }

  const dir = clean(parts[3] ?? '') as RelationDirection
  return {
    kind,
    relNo,
    sourceNo: clean(parts[1] ?? ''),
    targetNo: clean(parts[2] ?? ''),
    direction: dir || 'L',
    indexValue: clean(parts[4] ?? ''),
    idbId: clean(parts[5] ?? ''),
    fieldValue: clean(parts[6] ?? ''),
    syntaxBased: true,
    allowExtraParams,
    syntaxParams,
  }
}
