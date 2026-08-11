// zeichen — die Symbole der Editor-Oberflaeche.
//
// Warum es diese Datei gibt (Welle P, 2026-08-11): 33 Stellen holten ihre
// Symbole ueber den Sammel-Eingang `from 'lucide-react'`. Der Dev-Server muss
// dafuer das ganze Paket vorbuendeln — gemessen 1 139 089 Byte JS plus 2,24 MB
// Quellkarte, und 1616 ms von 2303 ms der gesamten Vorbuendelung (70 %), fuer
// 46 von 2007 Symbolen. Ein gezielter Einzel-Import ist kein oeffentlicher Weg
// (Fassung 1.27.0 hat kein `exports`-Feld; geprueft in Etappe S4), und
// `optimizeDeps` hat keinen Schalter, der einen Sammel-Eingang eindampft.
//
// Darum stehen die Zeichnungen jetzt im Projekt (./zeichenDaten): 46 Eintraege,
// 112 SVG-Knoten, 26 KB statt 1,14 MB. Das ist keine neue Abhaengigkeit und
// kein Griff in den Innenbau eines Pakets, sondern eine Abschrift der
// Zeichnungen samt Lizenz (dort). Das Paket bleibt in package.json, bis jemand
// es ausbaut — dieser Commit tut es nicht.
//
// GLEICHE OPTIK ist zugesagt und nachrechenbar: `zeichenFabrik` setzt genau die
// Attribute, die lucides eigener `Icon` setzt (24x24, viewBox 0 0 24 24, fill
// none, stroke currentColor, Strichbreite 2, runde Enden und Ecken) und dieselbe
// Klassenliste `lucide lucide-<name>` — seine `mergeClasses` entdoppelt die
// beiden gleichen Namen, die es dort erzeugt, das Ergebnis ist genau dieses.
//
// Die Symbole sind EDITOR-Sache. Sie erreichen das Runtime-Buendel nie
// (dieselbe Regel wie core/blocks/editorAngaben, bewacht von check:runtime).

import { createElement, forwardRef, type ReactElement, type SVGProps } from 'react'
import { KNOTEN, type Knoten } from './zeichenDaten'

// Was ein Symbol annimmt. `size` setzt Breite UND Hoehe (so wie bisher), alles
// andere sind die ueblichen SVG-Angaben. Traegt die Rolle, die der Rest des
// Editors bisher als `LucideProps` kannte.
export interface ZeichenProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  size?: number | string
}

// Der Typ eines Symbols — bisher `LucideIcon`. Er steht in einer oeffentlichen
// Schnittstelle (core/blocks/editorAngaben, `symbol?: Zeichen`), darum ein
// eigener Name statt eines Alias auf ein fremdes Paket.
export type Zeichen = ReturnType<typeof zeichenFabrik>

// Dieselben Grundattribute wie lucides `defaultAttributes`. Sie stehen hier
// EINMAL — ein zweiter Satz waere der Weg zu Symbolen, die sich um ein halbes
// Pixel unterscheiden.
const GRUND = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

function zeichenFabrik(name: string, knoten: readonly Knoten[]) {
  const Komponente = forwardRef<SVGSVGElement, ZeichenProps>(
    ({ size = 24, strokeWidth = 2, className, ...rest }, ref): ReactElement =>
      createElement(
        'svg',
        {
          ref,
          ...GRUND,
          width: size,
          height: size,
          strokeWidth,
          // Die Klassen bleiben, obwohl sie niemand gestaltet (geprueft
          // 2026-08-11: kein `.lucide` in irgendeinem Stylesheet) — dieser
          // Umbau soll am DOM nichts veraendern.
          className: ['lucide', `lucide-${name}`, className].filter(Boolean).join(' '),
          // Ein Symbol ohne eigene Beschriftung ist Dekoration: es bleibt fuer
          // Vorleseprogramme unsichtbar, solange der Aufrufer nichts anderes
          // sagt — `rest` steht danach und gewinnt.
          'aria-hidden': 'true',
          ...rest,
        },
        knoten.map(([tag, attrs], i) => createElement(tag, { ...attrs, key: i })),
      ),
  )
  Komponente.displayName = name
  return Komponente
}

export const AlignCenter = zeichenFabrik('text-align-center', KNOTEN.AlignCenter)
export const AlignLeft = zeichenFabrik('text-align-start', KNOTEN.AlignLeft)
export const AlignRight = zeichenFabrik('text-align-end', KNOTEN.AlignRight)
export const ArrowDown = zeichenFabrik('arrow-down', KNOTEN.ArrowDown)
export const ArrowLeft = zeichenFabrik('arrow-left', KNOTEN.ArrowLeft)
export const ArrowUp = zeichenFabrik('arrow-up', KNOTEN.ArrowUp)
export const Boxes = zeichenFabrik('boxes', KNOTEN.Boxes)
export const Calendar = zeichenFabrik('calendar', KNOTEN.Calendar)
export const Check = zeichenFabrik('check', KNOTEN.Check)
export const ChevronDown = zeichenFabrik('chevron-down', KNOTEN.ChevronDown)
export const ChevronUp = zeichenFabrik('chevron-up', KNOTEN.ChevronUp)
export const Columns3 = zeichenFabrik('columns-3', KNOTEN.Columns3)
export const Component = zeichenFabrik('component', KNOTEN.Component)
export const Copy = zeichenFabrik('copy', KNOTEN.Copy)
export const Database = zeichenFabrik('database', KNOTEN.Database)
export const Download = zeichenFabrik('download', KNOTEN.Download)
export const FileText = zeichenFabrik('file-text', KNOTEN.FileText)
export const FileUp = zeichenFabrik('file-up', KNOTEN.FileUp)
export const FolderOpen = zeichenFabrik('folder-open', KNOTEN.FolderOpen)
export const Link2 = zeichenFabrik('link-2', KNOTEN.Link2)
export const MoreHorizontal = zeichenFabrik('ellipsis', KNOTEN.MoreHorizontal)
export const MousePointer2 = zeichenFabrik('mouse-pointer-2', KNOTEN.MousePointer2)
export const MousePointerClick = zeichenFabrik('mouse-pointer-click', KNOTEN.MousePointerClick)
export const PanelTop = zeichenFabrik('panel-top', KNOTEN.PanelTop)
export const Pencil = zeichenFabrik('pencil', KNOTEN.Pencil)
export const Plus = zeichenFabrik('plus', KNOTEN.Plus)
export const RectangleEllipsis = zeichenFabrik('rectangle-ellipsis', KNOTEN.RectangleEllipsis)
export const RectangleHorizontal = zeichenFabrik('rectangle-horizontal', KNOTEN.RectangleHorizontal)
export const Redo2 = zeichenFabrik('redo-2', KNOTEN.Redo2)
export const Rows2 = zeichenFabrik('rows-2', KNOTEN.Rows2)
export const Rows3 = zeichenFabrik('rows-3', KNOTEN.Rows3)
export const Save = zeichenFabrik('save', KNOTEN.Save)
export const Search = zeichenFabrik('search', KNOTEN.Search)
export const Share2 = zeichenFabrik('share-2', KNOTEN.Share2)
export const SlidersHorizontal = zeichenFabrik('sliders-horizontal', KNOTEN.SlidersHorizontal)
export const SquareKanban = zeichenFabrik('square-kanban', KNOTEN.SquareKanban)
export const StickyNote = zeichenFabrik('sticky-note', KNOTEN.StickyNote)
export const Table = zeichenFabrik('table', KNOTEN.Table)
export const Trash = zeichenFabrik('trash', KNOTEN.Trash)
export const Trash2 = zeichenFabrik('trash-2', KNOTEN.Trash2)
export const TriangleAlert = zeichenFabrik('triangle-alert', KNOTEN.TriangleAlert)
export const Type = zeichenFabrik('type', KNOTEN.Type)
export const Undo2 = zeichenFabrik('undo-2', KNOTEN.Undo2)
export const Users = zeichenFabrik('users', KNOTEN.Users)
export const Wand2 = zeichenFabrik('wand-sparkles', KNOTEN.Wand2)
export const X = zeichenFabrik('x', KNOTEN.X)
