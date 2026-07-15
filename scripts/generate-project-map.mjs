import fs from 'node:fs'
import { builtinModules } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'
import * as ts from 'typescript'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const templatePath = path.join(root, 'scripts', 'project-map-template.html')
const outputPath = path.join(root, 'public', 'project-map.html')

const ignoredDirectories = new Set([
  '.git', '.codex', '.agents', '.tmp', 'coverage', 'dist', 'grundlast', 'node_modules',
  'playwright-report', 'public', 'test-results', 'tmp',
])
const ignoredFiles = new Set(['package-lock.json'])
const sourceExtensions = new Set(['.cjs', '.cts', '.css', '.html', '.js', '.jsx', '.json', '.mjs', '.mts', '.ts', '.tsx'])
const resolveExtensions = ['', '.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs', '.css', '.json', '.html']
const codeExtensions = new Set(['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs'])
const nodeBuiltins = new Set(builtinModules.flatMap((name) => [name, name.replace(/^node:/, '')]))

const categories = [
  { id: 'entry', label: 'Start & App', description: 'Startet die Anwendung und setzt ihren äußeren Rahmen zusammen.' },
  { id: 'editor', label: 'Editor', description: 'Die sichtbare Arbeitsoberfläche: Seitenleisten, Zeichenfläche, Inspector und Steuerung.' },
  { id: 'ui', label: 'UI-Bauteile', description: 'Kleine wiederverwendbare Bedienelemente wie Knöpfe, Felder und Dialoge.' },
  { id: 'state', label: 'Zustand', description: 'Merkt sich Maske, Auswahl, Datenquellen und Relationen und verbindet sie mit React.' },
  { id: 'core', label: 'Fachlicher Kern', description: 'Gemeinsame Regeln und Datenformen für Bausteine, Aktionen, Quellen und Relationen.' },
  { id: 'blocks', label: 'Bausteine', description: 'Die eigentlichen Maskenbausteine und ihre Laufzeitlogik.' },
  { id: 'softengine', label: 'SoftEngine', description: 'Die gemeinsame Brücke für Daten, Nachrichten und Relationen in SoftEngine.' },
  { id: 'export', label: 'Export', description: 'Erzeugt und prüft die fertige SoftEngine-Maske.' },
  { id: 'design', label: 'Design', description: 'Globale Gestaltung und Designwerte für Editor und exportierte Maske.' },
  { id: 'demos', label: 'Entwürfe', description: 'Eigenständige HTML-Entwürfe als Diskussions- und Gestaltungshilfe.' },
  { id: 'tests', label: 'Prüfungen', description: 'Automatische Prüfungen, die wichtiges Verhalten absichern.' },
  { id: 'config', label: 'Werkzeuge', description: 'Projekt-, Build- und Dokumentationskonfiguration.' },
  { id: 'other', label: 'Sonstiges', description: 'Weitere Dateien, die keinem fachlichen Bereich zugeordnet sind.' },
  { id: 'external', label: 'Pakete', description: 'Installierte Bibliotheken außerhalb dieses Projekts.' },
]

// Die Architektur-Ansicht ist bewusst kuratiert: Imports können Dateien
// verbinden, aber keine fachlichen Systemgrenzen erklären. Die Kategorien
// bleiben automatisch, ihre Zusammenfassung zu Laufzeitbereichen ist Daten.
const architecture = [
  {
    id: 'editor-system',
    label: 'Editor-Oberfläche',
    eyebrow: 'Bedienung',
    description: 'Setzt Arbeitsfläche, Seitenleisten, Inspector und Kommandozentrale zusammen.',
    categories: ['entry', 'editor', 'ui'],
    tone: 'blue',
  },
  {
    id: 'foundation-system',
    label: 'Zustand & fachlicher Kern',
    eyebrow: 'Modell',
    description: 'Verwaltet Blockbaum, Vorlagen und die gemeinsamen Regeln aller Bausteine.',
    categories: ['state', 'core'],
    tone: 'teal',
  },
  {
    id: 'blocks-system',
    label: 'Masken-Bausteine',
    eyebrow: 'Darstellung',
    description: 'Web Components, die im Editor und in der exportierten Maske dieselbe Darstellung liefern.',
    categories: ['blocks', 'design'],
    tone: 'amber',
  },
  {
    id: 'export-system',
    label: 'Export-Pipeline',
    eyebrow: 'Ausgabe',
    description: 'Erzeugt, prüft und bündelt HTML und SEvariablen für die fertige Maske.',
    categories: ['export'],
    tone: 'violet',
  },
  {
    id: 'softengine-system',
    label: 'SoftEngine-Anbindung',
    eyebrow: 'Laufzeit',
    description: 'Empfängt ERP-Daten und sendet Relations- oder Werkzeug-Nachrichten an SoftEngine.',
    categories: ['softengine'],
    tone: 'rose',
  },
  {
    id: 'support-system',
    label: 'Prüfungen & Werkzeuge',
    eyebrow: 'Absicherung',
    description: 'Tests, Konfigurationen und eigenständige Entwürfe rund um den Produktcode.',
    categories: ['tests', 'config', 'demos', 'other'],
    tone: 'slate',
  },
]

// Echte, im Code belegte Wege. Jeder Schritt verweist auf Dateien der Karte,
// damit die Ablaufansicht bis zur Importkarte hinunterführen kann.
const flows = [
  {
    id: 'editing',
    label: 'Bearbeiten im Editor',
    description: 'Von der sichtbaren Bedienung bis zum neu gerenderten Web Component.',
    steps: [
      { id: 'edit-shell', label: 'Editor bedienen', detail: 'Canvas, Palette oder Inspector lösen eine Änderung aus.', files: ['src/editor/shell/EditorShell.tsx', 'src/editor/canvas/Canvas.tsx', 'src/editor/inspector/Inspector.tsx'] },
      { id: 'edit-state', label: 'Zustand ändern', detail: 'Der Editor-Store aktualisiert den serialisierbaren Blockbaum.', files: ['src/state/Editor.ts', 'src/state/useEditor.ts'] },
      { id: 'edit-rules', label: 'Regeln anwenden', detail: 'Registry, Factory und Baumregeln bestimmen das erlaubte Ergebnis.', files: ['src/core/blocks/blockRegistry.ts', 'src/core/blocks/blockFactory.ts', 'src/core/blocks/treeQuery.ts'] },
      { id: 'edit-render', label: 'Baustein darstellen', detail: 'BlockHost setzt den Knoten als registriertes Web Component um.', files: ['src/editor/canvas/BlockHost.tsx', 'src/core/blocks/BasicBlock.ts', 'src/blocks/register.ts'] },
    ],
  },
  {
    id: 'exporting',
    label: 'Maske exportieren',
    description: 'Aus demselben Baum entstehen die geprüften SoftEngine-Dateien.',
    steps: [
      { id: 'export-model', label: 'Arbeitsbaum lesen', detail: 'Blöcke, Datenquellen, Relationen und Aktionen bilden eine Quelle.', files: ['src/state/Editor.ts', 'src/state/DataSourceStore.ts', 'src/state/RelationStore.ts'] },
      { id: 'export-build', label: 'Export zusammensetzen', detail: 'Die Export-Pipeline erzeugt Markup, Laufzeitdaten und SEvariablen.', files: ['src/export/exportMask.ts'] },
      { id: 'export-check', label: 'Ergebnis prüfen', detail: 'Preflight und Validator blockieren ungültige oder unvollständige Masken.', files: ['src/export/preflight.ts', 'src/export/validator.ts'] },
      { id: 'export-runtime', label: 'Runtime einbetten', detail: 'Registrierte Web Components und Laufzeitlogik reisen im HTML mit.', files: ['src/export/runtime-entry.ts', 'src/export/generated/ff-runtime.js', 'src/blocks/register.ts'] },
      { id: 'export-output', label: 'SoftEngine-Maske', detail: 'Ausgabe sind HTML und SEvariablen aus derselben Quelle.', files: ['src/export/exportMask.ts'] },
    ],
  },
  {
    id: 'data-push',
    label: 'SoftEngine-Daten empfangen',
    description: 'Der Daten-Push wird einmal angenommen und an interessierte Bausteine verteilt.',
    steps: [
      { id: 'push-se', label: 'SoftEngine sendet Daten', detail: 'REGISTER-Callback, message-Fallback oder SEDATA liefern das Paket.', files: ['src/softengine/bridge.ts'] },
      { id: 'push-bridge', label: 'Bridge nimmt Paket an', detail: 'Die gemeinsame Brücke aktualisiert SEDATA und benachrichtigt Zuhörer.', files: ['src/softengine/bridge.ts'] },
      { id: 'push-data', label: 'Felder und Zeilen lesen', detail: 'Pure Helfer lösen Quellen, Zeilen und SoftEngine-Feldcodes auf.', files: ['src/softengine/data.ts'] },
      { id: 'push-block', label: 'Baustein hydrieren', detail: 'Die Kanban-Runtime setzt empfangene Zeilen als Karten um.', files: ['src/blocks/kanban/seRuntime.ts', 'src/blocks/kanban/KanbanBlock.ts', 'src/blocks/card/CardBlock.ts'] },
    ],
  },
  {
    id: 'writing',
    label: 'Kanban-Wert zurückschreiben',
    description: 'Ein Karten-Drop aktualisiert den lokalen Satz und sendet die konfigurierte PUT-Relation.',
    steps: [
      { id: 'write-drop', label: 'Karte verschieben', detail: 'Die Kanban-Runtime erkennt Karte, Zielspalte und Datensatz.', files: ['src/blocks/kanban/seRuntime.ts'] },
      { id: 'write-field', label: 'Feld lokal setzen', detail: 'Die gemeinsame Datenschicht aktualisiert alle passenden Feldformen.', files: ['src/softengine/data.ts'] },
      { id: 'write-template', label: 'Relation auflösen', detail: 'Die gespeicherte Vorlage liefert Verb, Nummer und Parameter.', files: ['src/core/data/relations.ts', 'src/softengine/relations.ts'] },
      { id: 'write-send', label: 'PUT an SoftEngine', detail: 'Die SoftEngine-Schicht sendet die aufgelöste Nachricht über die Bridge.', files: ['src/softengine/relations.ts', 'src/softengine/bridge.ts'] },
    ],
  },
  {
    id: 'actions',
    label: 'Werkzeug-Aktion ausführen',
    description: 'Ein Blockereignis wird als exportierte Aktionskette bis zur SoftEngine-Nachricht ausgeführt.',
    steps: [
      { id: 'action-model', label: 'Aktion konfigurieren', detail: 'Ereignisse und Schritte liegen als Daten am Block.', files: ['src/core/data/aktionen.ts', 'src/editor/zentrale/AktionenBereich.tsx', 'src/editor/zentrale/StepForm.tsx'] },
      { id: 'action-export', label: 'Kette exportieren', detail: 'Der Export serialisiert die verwendeten Aktionsschritte am Element.', files: ['src/export/exportMask.ts'] },
      { id: 'action-event', label: 'Ereignis auslösen', detail: 'Der exportierte Baustein startet seine konfigurierte Kette.', files: ['src/blocks/button/ButtonBlock.ts', 'src/blocks/shared/seAktionen.ts'] },
      { id: 'action-send', label: 'Werkzeug starten', detail: 'Die Runtime sendet START_TOOL über den verfügbaren SoftEngine-Transport.', files: ['src/blocks/shared/seAktionen.ts'] },
    ],
  },
]

function toProjectPath(file) {
  return path.relative(root, file).replaceAll('\\', '/')
}

function collectFiles(directory, result = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && (ignoredDirectories.has(entry.name) || entry.name.startsWith('src.vibe-backup-'))) continue
    if (entry.isFile() && ignoredFiles.has(entry.name)) continue
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) collectFiles(absolute, result)
    else if (sourceExtensions.has(path.extname(entry.name).toLowerCase())) result.push(absolute)
  }
  return result
}

function categoryFor(file) {
  if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(file) || file.startsWith('e2e/') || file.startsWith('src/test/')) return 'tests'
  if (file === 'index.html' || file.startsWith('src/app/') || file === 'src/main.tsx') return 'entry'
  if (file.startsWith('src/editor/')) return 'editor'
  if (file.startsWith('src/ui/') || file === 'src/lib/utils.ts') return 'ui'
  if (file.startsWith('src/state/')) return 'state'
  if (file.startsWith('src/core/')) return 'core'
  if (file.startsWith('src/blocks/')) return 'blocks'
  if (file.startsWith('src/softengine/')) return 'softengine'
  if (file.startsWith('src/export/')) return 'export'
  if (file.startsWith('src/design/') || file === 'src/index.css' || file.startsWith('dashboard/stil')) return 'design'
  if (file.startsWith('dashboard/')) return 'demos'
  if (file.startsWith('scripts/') || /(^|\/)([^/]*config|package)\.[^/]+$/.test(file) || file === 'components.json') return 'config'
  return 'other'
}

const germanDescriptionWords = new Map(Object.entries({
  abhaengigkeit: 'Abhängigkeit',
  aenderung: 'Änderung',
  ausschliesslich: 'ausschließlich',
  ausgefuehrt: 'ausgeführt',
  ausfuehrung: 'Ausführung',
  bloecke: 'Blöcke',
  duenner: 'dünner',
  faelle: 'Fälle',
  flaeche: 'Fläche',
  fruehere: 'frühere',
  fuenf: 'fünf',
  fuer: 'für',
  gehoert: 'gehört',
  geschuetztes: 'geschütztes',
  grundgeruest: 'Grundgerüst',
  haelt: 'hält',
  huelle: 'Hülle',
  loeschen: 'löschen',
  loescht: 'löscht',
  loest: 'löst',
  molekuel: 'Molekül',
  nachgeruestet: 'nachgerüstet',
  prueft: 'prüft',
  pruefung: 'Prüfung',
  spaeter: 'später',
  ueber: 'über',
  urspruenglich: 'ursprünglich',
  vollstaendigkeitspruefung: 'Vollständigkeitsprüfung',
  vorpruefung: 'Vorprüfung',
  waehlt: 'wählt',
  zurueck: 'zurück',
}))

function germanDescription(text) {
  return text.replace(/\b[A-Za-z]+\b/g, (word) => {
    const replacement = germanDescriptionWords.get(word.toLowerCase())
    if (!replacement) return word
    if (word === word.toUpperCase()) return [...replacement].map((character) => character === 'ß' ? 'ẞ' : character.toUpperCase()).join('')
    if (word[0] === word[0].toUpperCase()) return replacement[0].toUpperCase() + replacement.slice(1)
    return replacement.toLowerCase()
  })
}

function shortenDescription(text, maximum = 260) {
  if (text.length <= maximum) return text
  const boundary = text.lastIndexOf(' ', maximum - 1)
  return text.slice(0, boundary > maximum * .7 ? boundary : maximum - 1).trimEnd() + '…'
}

function leadingComment(source) {
  const comments = []
  for (const line of source.split(/\r?\n/).slice(0, 18)) {
    const match = line.match(/^\s*\/\/\s?(.*)$/)
    if (match) {
      const text = match[1].trim()
      if (text && !/^[-\w.]+\.(tsx?|jsx?|css|html)$/i.test(text)) comments.push(text)
    } else if (comments.length > 0 && line.trim() !== '') break
  }
  return shortenDescription(germanDescription(comments.join(' ')))
}

function inferredDescription(file) {
  const name = path.posix.basename(file).replace(/\.[^.]+$/, '')
  if (/\.(test|spec)\./.test(file)) return 'Automatische Prüfung für ' + name.replace(/\.(test|spec)$/, '') + '.'
  if (file.startsWith('src/state/use')) return 'React-Verbindung zum Zustand „' + name.replace(/^use/, '') + '“.'
  if (file.endsWith('Store.ts')) return 'Speichert und verwaltet „' + name.replace(/Store$/, '') + '“.'
  if (file.endsWith('Block.ts')) return 'Definition und Darstellung des Bausteins „' + name.replace(/Block$/, '') + '“.'
  if (file.endsWith('.tsx')) return 'Sichtbarer React-Baustein „' + name + '“.'
  if (file.endsWith('.css')) return 'Gestaltungsregeln für ' + name + '.'
  if (file.endsWith('.html')) return 'Eigenständige Browseransicht „' + name + '“.'
  if (file.includes('config.')) return 'Konfiguration für ' + name.replace(/\.config$/, '') + '.'
  return 'Projektmodul „' + name + '“.'
}

function scriptKind(extension) {
  if (extension === '.tsx') return ts.ScriptKind.TSX
  if (extension === '.jsx') return ts.ScriptKind.JSX
  if (['.js', '.mjs', '.cjs'].includes(extension)) return ts.ScriptKind.JS
  return ts.ScriptKind.TS
}

function literalSpecifier(node) {
  return ts.isStringLiteralLike(node) ? node.text : null
}

function locationOf(sourceFile, node) {
  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
  return `${position.line + 1}:${position.character + 1}`
}

function analyzeCodeImports(source, extension) {
  const found = []
  const unresolved = []
  const sourceFile = ts.createSourceFile(`project-map-source${extension}`, source, ts.ScriptTarget.Latest, true, scriptKind(extension))

  function addLiteral(node, kind, label) {
    const specifier = literalSpecifier(node)
    if (specifier === null) unresolved.push(`${label} ohne festen String bei ${locationOf(sourceFile, node)}`)
    else found.push({ specifier, kind })
  }

  function visit(node) {
    if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
      const clause = node.importClause
      const named = clause?.namedBindings
      const onlyNamedTypes = named && ts.isNamedImports(named) && named.elements.length > 0
        && named.elements.every((element) => element.isTypeOnly)
      addLiteral(node.moduleSpecifier, clause?.isTypeOnly || (!clause?.name && onlyNamedTypes) ? 'type' : 'runtime', 'Import')
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      const clause = node.exportClause
      const onlyNamedTypes = clause && ts.isNamedExports(clause) && clause.elements.length > 0
        && clause.elements.every((element) => element.isTypeOnly)
      addLiteral(node.moduleSpecifier, node.isTypeOnly || onlyNamedTypes ? 'type' : 'runtime', 'Export')
    } else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference) && node.moduleReference.expression) {
      addLiteral(node.moduleReference.expression, node.isTypeOnly ? 'type' : 'runtime', 'Import-Require')
    } else if (ts.isCallExpression(node)) {
      const isDynamicImport = node.expression.kind === ts.SyntaxKind.ImportKeyword
      const isRequire = ts.isIdentifier(node.expression) && node.expression.text === 'require'
      if (isDynamicImport || isRequire) {
        const argument = node.arguments[0]
        if (!argument) unresolved.push(`${isDynamicImport ? 'Dynamischer Import' : 'Require'} ohne Ziel bei ${locationOf(sourceFile, node)}`)
        else addLiteral(argument, isDynamicImport ? 'dynamic' : 'runtime', isDynamicImport ? 'Dynamischer Import' : 'Require')
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return { imports: found, unresolved }
}

function cssImportSpecifier(params) {
  const value = params.trim()
  const quoted = /^(?:url\(\s*)?(['"])(.*?)\1\s*\)?(?:\s|$)/.exec(value)
  if (quoted) return quoted[2]
  const unquotedUrl = /^url\(\s*([^\s)'";]+)\s*\)(?:\s|$)/.exec(value)
  return unquotedUrl ? unquotedUrl[1] : null
}

function analyzeCssImports(source) {
  const found = []
  const unresolved = []
  const rootNode = postcss.parse(source)
  rootNode.walkAtRules('import', (rule) => {
    const specifier = cssImportSpecifier(rule.params)
    if (specifier === null) unresolved.push(`CSS-Import ohne eindeutig lesbares Ziel bei ${rule.source?.start?.line ?? '?'}:${rule.source?.start?.column ?? '?'}`)
    else found.push({ specifier, kind: 'style' })
  })
  return { imports: found, unresolved }
}

function tagEnd(source, start) {
  let quote = null
  for (let index = start + 1; index < source.length; index += 1) {
    const char = source[index]
    if (quote) {
      if (char === quote) quote = null
    } else if (char === '"' || char === "'") quote = char
    else if (char === '>') return index
  }
  return -1
}

function attributesOf(tag) {
  const result = new Map()
  let index = tag.search(/\s/)
  if (index < 0) return result
  while (index < tag.length) {
    while (/\s|\//.test(tag[index] ?? '')) index += 1
    const start = index
    while (/[\w:-]/.test(tag[index] ?? '')) index += 1
    if (start === index) { index += 1; continue }
    const name = tag.slice(start, index).toLowerCase()
    while (/\s/.test(tag[index] ?? '')) index += 1
    if (tag[index] !== '=') { result.set(name, ''); continue }
    index += 1
    while (/\s/.test(tag[index] ?? '')) index += 1
    const quote = tag[index] === '"' || tag[index] === "'" ? tag[index++] : null
    const valueStart = index
    if (quote) while (index < tag.length && tag[index] !== quote) index += 1
    else while (index < tag.length && !/[\s>]/.test(tag[index])) index += 1
    result.set(name, tag.slice(valueStart, index))
    if (quote && tag[index] === quote) index += 1
  }
  return result
}

function analyzeHtmlImports(source) {
  const found = []
  const unresolved = []
  const lower = source.toLowerCase()
  let index = 0
  while (index < source.length) {
    const start = source.indexOf('<', index)
    if (start < 0) break
    if (source.startsWith('<!--', start)) {
      const endComment = source.indexOf('-->', start + 4)
      index = endComment < 0 ? source.length : endComment + 3
      continue
    }
    const end = tagEnd(source, start)
    if (end < 0) { unresolved.push('HTML-Tag ohne Abschluss'); break }
    const raw = source.slice(start + 1, end).trim()
    const nameMatch = /^([\w:-]+)/.exec(raw)
    if (!nameMatch) { index = end + 1; continue }
    const name = nameMatch[1].toLowerCase()
    if (name === 'script' || name === 'link') {
      const attributes = attributesOf(raw)
      const isDependency = name === 'script' || /(^|\s)(stylesheet|modulepreload)(\s|$)/i.test(attributes.get('rel') ?? '')
      const attribute = name === 'script' ? 'src' : 'href'
      const specifier = isDependency ? attributes.get(attribute) : null
      if (specifier) found.push({ specifier, kind: 'asset' })
    }
    if (name === 'script') {
      const close = lower.indexOf('</script', end + 1)
      if (close >= 0) { const closeEnd = tagEnd(source, close); index = closeEnd < 0 ? source.length : closeEnd + 1; continue }
    }
    index = end + 1
  }
  return { imports: found, unresolved }
}

export function analyzeImports(source, extension) {
  if (codeExtensions.has(extension)) return analyzeCodeImports(source, extension)
  if (extension === '.css') return analyzeCssImports(source)
  if (extension === '.html') return analyzeHtmlImports(source)
  return { imports: [], unresolved: [] }
}

export function importsFrom(source, extension) {
  return analyzeImports(source, extension).imports
}

function externalPackage(specifier) {
  const normalized = specifier.replace(/^node:/, '')
  if (specifier.startsWith('node:') || nodeBuiltins.has(normalized)) return null
  if (specifier.startsWith('@')) return specifier.split('/').slice(0, 2).join('/')
  return specifier.split('/')[0]
}

function resolveLocal(fromFile, specifier, knownFiles) {
  const clean = specifier.split('?')[0].split('#')[0]
  let base
  if (clean.startsWith('@/')) base = path.join(root, 'src', clean.slice(2))
  else if (clean.startsWith('.')) base = path.resolve(path.dirname(fromFile), clean)
  else if (clean.startsWith('/')) base = path.join(root, clean.slice(1))
  else return null

  const candidates = []
  for (const extension of resolveExtensions) candidates.push(base + extension)
  for (const extension of resolveExtensions.slice(1)) candidates.push(path.join(base, 'index' + extension))
  return candidates.map(toProjectPath).find((candidate) => knownFiles.has(candidate)) ?? null
}

export function buildMapData() {
  const absoluteFiles = collectFiles(root).sort((a, b) => toProjectPath(a).localeCompare(toProjectPath(b), 'de'))
  const knownFiles = new Set(absoluteFiles.map(toProjectPath))
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
  const declaredPackages = new Set(Object.keys({
    ...(manifest.dependencies ?? {}),
    ...(manifest.devDependencies ?? {}),
    ...(manifest.optionalDependencies ?? {}),
    ...(manifest.peerDependencies ?? {}),
  }))
  const nodes = []
  const edges = []
  const packages = new Set()
  const analysisProblems = []
  let latestMtime = 0

  for (const absolute of absoluteFiles) {
    const file = toProjectPath(absolute)
    const source = fs.readFileSync(absolute, 'utf8')
    latestMtime = Math.max(latestMtime, fs.statSync(absolute).mtimeMs)
    nodes.push({
      id: file,
      label: path.posix.basename(file),
      folder: path.posix.dirname(file) === '.' ? 'Projektwurzel' : path.posix.dirname(file),
      category: categoryFor(file),
      description: leadingComment(source) || inferredDescription(file),
      test: categoryFor(file) === 'tests',
      external: false,
    })

    const analysis = analyzeImports(source, path.extname(file).toLowerCase())
    analysis.unresolved.forEach((problem) => analysisProblems.push(`${file}: ${problem}`))
    for (const imported of analysis.imports) {
      const target = resolveLocal(absolute, imported.specifier, knownFiles)
      if (target) {
        edges.push({ from: file, to: target, kind: imported.kind })
      } else if (!imported.specifier.startsWith('.') && !imported.specifier.startsWith('/') && !imported.specifier.startsWith('@/')) {
        const packageName = externalPackage(imported.specifier)
        if (packageName) {
          if (!declaredPackages.has(packageName)) analysisProblems.push(`${file}: nicht deklariertes Paket oder unbekannter Alias "${imported.specifier}"`)
          packages.add(packageName)
          edges.push({ from: file, to: 'npm:' + packageName, kind: 'package' })
        }
      } else {
        analysisProblems.push(`${file}: lokaler Import nicht auflösbar "${imported.specifier}"`)
      }
    }
  }

  for (const packageName of [...packages].sort()) {
    nodes.push({
      id: 'npm:' + packageName,
      label: packageName,
      folder: 'Installierte Pakete',
      category: 'external',
      description: 'Externe Bibliothek, die über package.json installiert wird.',
      test: false,
      external: true,
    })
  }

  const uniqueEdges = [...new Map(edges.map((edge) => [edge.from + '>' + edge.to + '>' + edge.kind, edge])).values()]
    .sort((a, b) => (a.from + a.to).localeCompare(b.from + b.to))

  return {
    generatedAt: new Date(latestMtime).toISOString(),
    nodes,
    edges: uniqueEdges,
    categories,
    architecture,
    flows,
    analysis: {
      method: 'TypeScript AST + PostCSS AST + HTML tokenizer',
      problems: analysisProblems,
    },
  }
}

function validateMapData(data) {
  const nodeIds = new Set(data.nodes.map((node) => node.id))
  const categoryIds = new Set(data.categories.map((category) => category.id))
  const problems = []

  problems.push(...data.analysis.problems)

  for (const edge of data.edges) {
    if (!nodeIds.has(edge.from)) problems.push(`Abhängigkeit startet bei unbekannter Datei: ${edge.from}`)
    if (!nodeIds.has(edge.to)) problems.push(`Abhängigkeit endet bei unbekannter Datei: ${edge.to}`)
  }
  for (const system of data.architecture) {
    for (const category of system.categories) {
      if (!categoryIds.has(category)) problems.push(`Architekturbereich nutzt unbekannte Kategorie: ${category}`)
    }
  }
  for (const flow of data.flows) {
    for (const step of flow.steps) {
      for (const file of step.files) {
        if (!nodeIds.has(file)) problems.push(`Ablauf ${flow.id}/${step.id} nutzt unbekannte Datei: ${file}`)
      }
    }
  }
  if (problems.length > 0) throw new Error('Projektkarte ist inkonsistent:\n' + problems.join('\n'))
}

export function renderProjectMap() {
  const mapData = buildMapData()
  validateMapData(mapData)
  const data = JSON.stringify(mapData).replaceAll('<', '\\u003c')
  return fs.readFileSync(templatePath, 'utf8').replace('/*__PROJECT_MAP_DATA__*/', data)
}

export function isProjectMapCurrent() {
  return fs.existsSync(outputPath) && fs.readFileSync(outputPath, 'utf8') === renderProjectMap()
}

export function projectMapStatus() {
  const data = buildMapData()
  validateMapData(data)
  return {
    current: isProjectMapCurrent(),
    verified: data.analysis.problems.length === 0,
    method: data.analysis.method,
    problems: data.analysis.problems,
  }
}

export function generateProjectMap() {
  const html = renderProjectMap()
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  if (fs.existsSync(outputPath) && fs.readFileSync(outputPath, 'utf8') === html) return false
  fs.writeFileSync(outputPath, html, 'utf8')
  return true
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--check')) {
    const current = isProjectMapCurrent()
    console.log(current ? 'Projektkarte ist aktuell.' : 'Projektkarte ist veraltet. Bitte npm run docs:map ausführen.')
    if (!current) process.exitCode = 1
  } else {
    const changed = generateProjectMap()
    console.log(changed ? 'Projektkarte aktualisiert: public/project-map.html' : 'Projektkarte ist bereits aktuell.')
  }
}
