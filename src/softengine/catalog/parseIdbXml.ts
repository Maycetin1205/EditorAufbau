// IDB-XML-Parser
// 1:1 portiert aus altem Editor (components/data/parseIdbXml.ts).
// Liest IDB-Definitionen aus SoftEngine-XML-Exporten (zwei Formate: A = mit
// <idname>+<dsatz>+<position>/<feldlaenge>; B = SoftEngine-Dump mit <vPOSEntry>+<Data>).
// Gibt eine Liste vorgemappter IDB-Definitionen zurueck, die im Catalog landen koennen.

interface ParsedField {
  name: string
  field: string
  _p: number
}

export interface ParsedIdb {
  alias: string
  idbId: string
  key: string
  fields: { name: string; field: string }[]
}

// Latin-Alphabet inkl. Umlaute via Unicode-Range (vermeidet Encoding-Probleme
// in der Quelldatei). Bereich U+00C0..U+024F deckt Latin Extended-A/B ab.
const NAME_PATTERN = new RegExp(
  '([A-Za-z\\u00C0-\\u024F][A-Za-z\\u00C0-\\u024F\\s\\-./]{2,})\\s+$',
)

export function parseIdbXml(text: unknown): ParsedIdb[] {
  let src = String(text || '')
  const firstTag = src.indexOf('<')
  if (firstTag > 0) src = src.slice(firstTag)
  // XXE-Praevention: DTD/ENTITY-Direktiven entfernen.
  src = src.replace(/<!(DOCTYPE|ELEMENT|ATTLIST|ENTITY|NOTATION)[^>]*>/gi, '')

  const doc = new DOMParser().parseFromString(src, 'application/xml')
  if (doc.getElementsByTagName('parsererror').length > 0) throw new Error('XML ungueltig')

  const tagName = (n: Element | null | undefined): string =>
    String((n?.localName || n?.nodeName || '').replace(/^.*:/, '')).toLowerCase()
  const findAll = (root: Element | Document | null | undefined, name: string): Element[] => {
    const want = name.toLowerCase()
    return Array.from(root?.getElementsByTagName('*') || []).filter((n) => tagName(n) === want)
  }
  const childrenNamed = (root: Element | Document | null | undefined, name: string): Element[] => {
    const want = name.toLowerCase()
    return Array.from((root as Element)?.children || []).filter((n) => tagName(n) === want)
  }
  const firstText = (root: Element | Document | null | undefined, names: string | string[]): string => {
    for (const n of Array.isArray(names) ? names : [names]) {
      const el = findAll(root, n)[0]
      if (el) {
        const t = (el.textContent || '').trim()
        if (t) return t
      }
    }
    return ''
  }
  const cleanLabel = (s: unknown): string =>
    String(s || '')
      .replace(/\s+/g, ' ')
      .trim()
  const pickAlias = (node: Element): string => {
    const skip = /^(Get Relation|Put Relation|Globaler MEM-Pointer|Rechenoperatoren|Selektionsparameter)$/i
    for (const el of findAll(node, 'beschreibungfuersatname')) {
      const txt = cleanLabel(el.textContent || '')
      if (txt && !skip.test(txt)) return txt
    }
    return ''
  }

  const root = findAll(doc, 'aworkflowscripte')[0] || doc.documentElement
  const allItems = childrenNamed(root, 'item')

  const formatAItems = allItems.filter(
    (n) => findAll(n, 'idname').length > 0 && (findAll(n, 'dsatz').length > 0 || findAll(n, 'vposentry').length > 0),
  )
  const formatBItems = allItems.filter((n) => findAll(n, 'idname').length === 0 && findAll(n, 'vposentry').length > 0)

  const out: ParsedIdb[] = []

  // === FORMAT A ===
  const parseFormatA = (nodes: Element[]) => {
    nodes.forEach((node) => {
      const idName = firstText(node, ['idname']) || ''
      const alias = pickAlias(node) || cleanLabel(idName)
      if (!alias) return

      const ds = findAll(node, 'dsatz')[0] || findAll(node, 'vposentry')[0] || node
      const aEntrys = findAll(ds, 'aentrys')[0] || findAll(ds, 'aentries')[0] || ds
      const items = findAll(aEntrys, 'item')
      let idbId = ''
      const fields: ParsedField[] = []

      items.forEach((it: Element) => {
        const posRaw = firstText(it, ['position', 'feldposition', 'pos'])
        const lenRaw = firstText(it, ['feldlaenge', 'laenge', 'len'])
        const varName = firstText(it, ['variablenname'])
        const label = cleanLabel(firstText(it, ['feldbeschreibung', 'beschreibung', 'name']))

        if (!idbId) {
          const m = (varName || '').match(/(IDBID\d{4})/i)
          if (m) idbId = m[1].toUpperCase()
        }

        let p = parseInt(String(posRaw || '').replace(/[^\d-]/g, ''), 10)
        let l = parseInt(String(lenRaw || '').replace(/[^\d-]/g, ''), 10)

        if ((!isFinite(p) || !isFinite(l) || l <= 0) && varName) {
          const vm = varName.match(/IDBID\d{4}_(\d+)_(\d+)/i)
          if (vm) {
            p = parseInt(vm[1], 10)
            l = parseInt(vm[2], 10)
          }
        }
        if (!isFinite(p) || !isFinite(l) || l <= 0) return
        fields.push({ name: label || `${p}_${l}`, field: `${p}_${l}`, _p: p })
      })

      if (!idbId) {
        const m = idName.match(/^ID(\d{4})$/i)
        idbId = m ? `IDBID${m[1]}` : firstText(node, ['idbid', 'datenbankid', 'idnummer']) || alias
      }

      const seen = new Set<string>()
      const cleanFields = fields
        .sort((a, b) => a._p - b._p)
        .filter((f) => {
          if (!f.field || seen.has(f.field)) return false
          seen.add(f.field)
          return true
        })
        .map((f) => ({ name: f.name, field: f.field }))

      if (cleanFields.length > 0) out.push({ alias, idbId, key: '', fields: cleanFields })
    })
  }

  // === FORMAT B ===
  const parseFormatB = (nodes: Element[]) => {
    const byPrefix = new Map<string, ParsedField[]>()

    nodes.forEach((node: Element) => {
      const vPos = findAll(node, 'vposentry')[0]
      if (!vPos) return
      const aEntrys = findAll(vPos, 'aentrys')[0] || vPos

      findAll(aEntrys, 'item').forEach((it: Element) => {
        const dataEl = findAll(it, 'data')[0]
        const dataStr = (dataEl?.textContent || it.textContent || '').trim()
        if (!dataStr) return

        const prefix = dataStr.match(/^(ID\d+)/)?.[1] || ''
        if (!prefix) return

        const posLenIdx = dataStr.search(/\b\d{1,4}\s{2,}\d{1,4}[A-Z][ \t]/)
        if (posLenIdx < 0) return

        const posLenMatch = dataStr.slice(posLenIdx).match(/^(\d{1,4})\s{2,}(\d{1,4})([A-Z])/)
        if (!posLenMatch) return

        const p = parseInt(posLenMatch[1], 10)
        const l = parseInt(posLenMatch[2], 10)
        if (!isFinite(p) || !isFinite(l) || l <= 0) return

        const before = dataStr.slice(0, posLenIdx)
        const nameMatch = before.match(NAME_PATTERN)
        const name = nameMatch ? nameMatch[1].trim() : `${p}_${l}`

        if (!byPrefix.has(prefix)) byPrefix.set(prefix, [])
        byPrefix.get(prefix)!.push({ name, field: `${p}_${l}`, _p: p })
      })
    })

    byPrefix.forEach((fields: ParsedField[], prefix: string) => {
      const m = prefix.match(/^ID(\d+)$/i)
      const idbId = m ? `IDBID${m[1].padStart(4, '0')}` : prefix

      const seen = new Set<string>()
      const cleanFields = fields
        .sort((a, b) => a._p - b._p)
        .filter((f) => {
          if (!f.field || seen.has(f.field)) return false
          seen.add(f.field)
          return true
        })
        .map((f) => ({ name: f.name, field: f.field }))

      if (cleanFields.length > 0) out.push({ alias: idbId, idbId, key: '', fields: cleanFields })
    })
  }

  if (formatAItems.length > 0) parseFormatA(formatAItems)
  else if (formatBItems.length > 0) parseFormatB(formatBItems)
  else {
    const genericIdbs = findAll(doc, 'idb')
    if (genericIdbs.length) parseFormatA(genericIdbs)
  }

  const deduped = new Set<string>()
  return out.filter((i) => {
    const k = `${i.alias}|${i.idbId}`.toLowerCase()
    if (deduped.has(k)) return false
    deduped.add(k)
    return true
  })
}
