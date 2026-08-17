import { formatRelationSyntax, type RelationTemplate } from '../../core/data/relations'

export function istUngetaufteVorlage(entry: RelationTemplate): boolean {
  const name = entry.name.trim()
  return name === ''
    || name === formatRelationSyntax(entry)
    || name.startsWith(`${entry.verb}[`)
}

export function relationAnzeige(entry: RelationTemplate): string {
  return istUngetaufteVorlage(entry) ? `${entry.verb} · Nr. ${entry.nr}` : entry.name
}
