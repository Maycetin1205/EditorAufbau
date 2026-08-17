import type { EintragProblem } from './ladeProblem'

export type RelationVerb = 'GET_RELATION' | 'PUT_RELATION' | 'PUTADD_RELATION'

export const RELATION_VERBS: readonly RelationVerb[] = [
  'GET_RELATION', 'PUT_RELATION', 'PUTADD_RELATION',
]

export const RELATION_PLACEHOLDERS = [
  'FELD_POS', 'FELD_LEN', 'PINDEX', 'SELKEY', 'DROP_PINDEX',
  'RELID', 'VALUE', 'ZIMMER', 'NOW_DATE',
] as const

export type RelationContext = Readonly<Record<string, string | undefined>>

export interface RelationTemplate {
  id: string

  name: string
  verb: RelationVerb

  nr: string

  params: readonly string[]

  allowExtraParams?: boolean
}

export type ParsedRelationSyntax = Pick<
  RelationTemplate,
  'verb' | 'nr' | 'params' | 'allowExtraParams'
>

export const BUILTIN_RELATION_TEMPLATES: readonly RelationTemplate[] = [
  {
    id: 'standard-put',
    name: 'Standard-Schreiben (PUT)',
    verb: 'PUT_RELATION',
    nr: '174',
    params: ['{FELD_POS}', '{FELD_LEN}', 'L', '{PINDEX}', '{RELID}', '{VALUE}'],
  },
]

export function relIdFromIdbId(idbId: string): string {
  return idbId.replace(/^IDB/, '')
}

export function formatNowDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${d.getFullYear()}`
}

export function splitFieldCode(code: string): { pos: string; len: string } | null {
  const m = /^(\d+)_(\d+)$/.exec(code)
  return m ? { pos: m[1], len: m[2] } : null
}

export function parseRelationSyntax(input: string): ParsedRelationSyntax | null {
  const raw = input.trim()
  const head = /^(GET_RELATION|PUTADD_RELATION|PUT_RELATION)\[/i.exec(raw)
  if (!head || !raw.endsWith(']') || /[\r\n]/.test(raw)) return null

  const body = raw.slice(head[0].length, -1)
  const parts = body.split('!')
  const nr = parts.shift() ?? ''
  if (!/^\d+$/.test(nr)) return null

  let allowExtraParams = false
  if (parts.at(-1) === '...') {
    allowExtraParams = true
    parts.pop()
  }

  const params = parts.map((param) => {
    const doubled = /^\{\{([A-Za-z0-9_]+)\}\}$/.exec(param)
    return doubled ? `{${doubled[1]}}` : param
  })

  return {
    verb: head[1].toUpperCase() as RelationVerb,
    nr,
    params,
    allowExtraParams,
  }
}

export function formatRelationSyntax(
  relation: Pick<RelationTemplate, 'verb' | 'nr' | 'params' | 'allowExtraParams'>,
): string {
  const parts = [relation.nr, ...relation.params]
  if (relation.allowExtraParams) parts.push('...')
  return `${relation.verb}[${parts.join('!')}]`
}

export type RelationGroup = 'lesen' | 'schreiben'

export function relationGroup(relation: Pick<RelationTemplate, 'verb'>): RelationGroup {
  return relation.verb === 'GET_RELATION' ? 'lesen' : 'schreiben'
}

export function relationMatchesSearch(
  relation: Pick<RelationTemplate, 'name' | 'verb' | 'nr' | 'params' | 'allowExtraParams'>,
  query: string,
): boolean {
  const needle = query.trim().toLocaleLowerCase('de')
  if (needle === '') return true
  return [relation.name, relation.nr, formatRelationSyntax(relation)]
    .some((value) => value.toLocaleLowerCase('de').includes(needle))
}

export function relationPlaceholderNames(
  relation: Pick<RelationTemplate, 'params'>,
): string[] {
  const seen = new Set<string>()
  const names: string[] = []
  for (const param of relation.params) {
    for (const match of param.matchAll(/\{([A-Za-z0-9_]+)\}/g)) {
      const name = match[1]
      if (seen.has(name)) continue
      seen.add(name)
      names.push(name)
    }
  }
  return names
}

export function resolveParams(
  template: Pick<RelationTemplate, 'params'>,
  context: RelationContext,
): string[] {
  return template.params.map((p) =>
    p.replace(/\{([A-Za-z0-9_]+)\}/g, (_, key: string) =>
      String(context[key] ?? ''),
    ),
  )
}

export function unknownPlaceholders(
  param: string,
  known: readonly string[] = RELATION_PLACEHOLDERS,
): string[] {
  const acc: string[] = []
  for (const m of param.matchAll(/\{([A-Z_]+)\}/g)) {
    if (!known.includes(m[1])) acc.push(m[1])
  }
  return acc
}

export function sanitizeRelationTemplates(raw: unknown): RelationTemplate[] {
  return pruefeRelationsVorlagen(raw).liste
}

export function pruefeRelationsVorlagen(
  raw: unknown,
): { liste: RelationTemplate[]; probleme: EintragProblem[] } {
  const probleme: EintragProblem[] = []
  if (!Array.isArray(raw)) return { liste: [], probleme }
  const acc: RelationTemplate[] = []
  const seen = new Set<string>()
  let nr = 0
  for (const entry of raw) {
    nr++
    const stelle = entry && typeof entry === 'object'
      && typeof (entry as Record<string, unknown>).id === 'string'
      && (entry as Record<string, unknown>).id !== ''
      ? (entry as Record<string, unknown>).id as string
      : `Eintrag ${nr}`
    const weg = (grund: string): void => { probleme.push({ stelle, grund }) }
    if (!entry || typeof entry !== 'object') {
      weg('die Relations-Vorlage ist unlesbar')
      continue
    }
    const e = entry as Record<string, unknown>
    if (typeof e.id !== 'string' || e.id === '') {
      weg('der Vorlage fehlt ihre Kennung')
      continue
    }
    if (seen.has(e.id)) {
      weg('diese Kennung kommt zweimal vor')
      continue
    }
    if (typeof e.name !== 'string' || e.name.trim() === '') {
      weg('der Klarname fehlt')
      continue
    }
    if (typeof e.verb !== 'string' || !RELATION_VERBS.includes(e.verb as RelationVerb)) {
      weg('die Art des Aufrufs (GET/PUT/PUTADD) fehlt oder ist unbekannt')
      continue
    }
    if (typeof e.nr !== 'string' || e.nr.trim() === '') {
      weg('die Relations-Nummer fehlt')
      continue
    }
    if (!Array.isArray(e.params) || e.params.some((p) => typeof p !== 'string')) {
      weg('die Parameter-Syntax ist unbrauchbar')
      continue
    }
    seen.add(e.id)
    acc.push({
      id: e.id,
      name: e.name,
      verb: e.verb as RelationVerb,
      nr: e.nr,
      params: [...(e.params as string[])],
      allowExtraParams: e.allowExtraParams === true,
    })
  }
  return { liste: acc, probleme }
}
