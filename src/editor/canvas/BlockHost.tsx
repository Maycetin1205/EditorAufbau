import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { MouseEvent as ReactMouseEvent } from 'react'
import type { BlockNode } from '../../core/blocks/BlockData'
import {
  quellenAufloesen,
  WEITERE_QUELLEN_PROP,
  type QuelleInReichweite,
} from '../../core/data/sourceLinks'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { istRandBaustein } from '../../core/blocks/maskenRand'
import { rasterSpecOf } from '../../core/blocks/rasterLayout'
import { bindbareStellenVon, traegtEigeneQuelle } from '../../core/blocks/treeQuery'
import { useEditorInstance } from '../../state/EditorContext'
import { loescheBaustein } from '../../state/loescheBaustein'
import { quellenTraeger } from '../../state/quellenOps'
import { useDataSources } from '../../state/useDataSources'
import { useFeldBindung } from './FeldBindung'
import { useBlockResize } from './useBlockResize'
import { useLitElement } from './useLitElement'

interface BlockHostProps {
  block: BlockNode
  selected?: boolean

  onSelect?: (aufStelle: boolean) => void

  raster?: boolean

  children?: ReactNode
}

const KEINE_QUELLEN: readonly QuelleInReichweite[] = []

export function BlockHost({ block, selected, onSelect, raster = false, children }: BlockHostProps) {
  const editor = useEditorInstance()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const def = getBlockDefinition(block.type)
  const isContainer = def?.acceptsChildren ?? false

  const quellenBibliothek = useDataSources()

  const bindableSpots = useMemo(() => bindbareStellenVon(block), [block])

  const traeger = quellenTraeger(editor.tree, block.id)
  const braucht = bindableSpots.length > 0 || traegtEigeneQuelle(block)
  const bibliothek = quellenBibliothek.list
  const quellen = useMemo(
    () => (braucht && traeger
      ? quellenAufloesen(traeger.props.source, traeger.props[WEITERE_QUELLEN_PROP], bibliothek)
      : KEINE_QUELLEN),
    [braucht, traeger, bibliothek],
  )

  const blockRef = useRef<BlockNode>(block)
  useLayoutEffect(() => {
    blockRef.current = block
  })

  const { containerRef, elementRef, element } = useLitElement({
    editor,
    blockRef,
    block,
    selected,
    bindableSpots,
    quellen,
    raster,
  })

  const { onClick, onDoubleClick, pickers } = useFeldBindung({
    editor,
    blockRef,
    block,
    selected,
    bindableSpots,
    listenBindung: def?.listenBindung,
    quellen,
    containerRef,
    onSelect,
  })

  const { startResize, startRasterResize } = useBlockResize(editor, blockRef, elementRef, rootRef)

  const resizable = def?.resizableWidth ?? true
  const heightResizable = def?.resizableHeight === true

  const rasterSpec = rasterSpecOf(def, block.props)

  const rand = istRandBaustein(block)
  const rasterZiehbar = raster && !rand

  const eltern = block.parentId ? editor.getNode(block.parentId) : undefined
  const amRand = rand || (eltern ? istRandBaustein(eltern) : false)

  const kreuzStil = amRand ? { top: 4, right: 4 } : { top: -9, right: -9 }
  const plusStil = amRand ? { bottom: 4, left: 4 } : { top: -9, right: 14 }

  const templateMark = editor.templateMarkFor(block.id)

  function onRemoveClick(e: ReactMouseEvent<HTMLButtonElement>) {
    e.stopPropagation()

    loescheBaustein(editor, blockRef.current.id)
  }

  return (
    <div
      ref={rootRef}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      data-block-id={block.id}
      style={{
        display: 'block',
        position: 'relative',

        height: '100%',
        cursor: selected ? 'default' : 'pointer',
        outline: selected ? '2px solid hsl(var(--ring))' : '2px solid transparent',
        outlineOffset: amRand ? -2 : 1,
        borderRadius: 6,
        userSelect: 'none',
      }}
    >
      <div
        ref={containerRef}
        style={{
          pointerEvents: 'auto',
          height: '100%',

          ...(isContainer && def?.containerHint !== false
            ? {
                border: '1.5px dashed hsl(var(--border))',
                borderRadius: 4,
                minHeight: 40,
              }
            : null),
        }}
      >
        {element && isContainer && children != null
          ? createPortal(children, element)
          : null}
      </div>
      {pickers}
      {def?.addChildButton
        && editor.selectedId !== null
        && editor.isInSubtree(block.id, editor.selectedId) && (
        <AddChildButton
          label={def.addChildButton.label}
          childType={def.addChildButton.childType}
          parentId={block.id}
          platz={plusStil}
        />
      )}
      {selected && !templateMark && (
        <button
          type="button"
          aria-label="Entfernen"
          title="Entfernen"
          onClick={onRemoveClick}
          onPointerDown={(e) => e.stopPropagation()}
          onDragStart={(e) => { e.preventDefault(); e.stopPropagation() }}
          style={{
            position: 'absolute',
            ...kreuzStil,
            width: 18,
            height: 18,
            padding: 0,
            border: 'none',
            borderRadius: 9999,
            background: 'hsl(var(--ring))',
            color: '#fff',
            fontSize: 12,
            lineHeight: '16px',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          ×
        </button>
      )}

      {selected && rasterZiehbar && rasterSpec.breiteZiehbar && (
        <div
          draggable={false}
          onPointerDown={(e) => startRasterResize(e, 'x')}
          onDragStart={(e) => e.preventDefault()}
          onDoubleClick={(e) => {
            e.stopPropagation()
            const node = blockRef.current
            const spec = rasterSpecOf(getBlockDefinition(node.type), node.props)
            editor.updateProperty(node.id, 'rasterW', spec.startW)
          }}
          title="Breite ziehen (rastet auf Zellen) · Doppelklick: Startgröße"
          style={{
            position: 'absolute',
            right: -4,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 7,
            height: 26,
            borderRadius: 4,
            background: 'hsl(var(--ring))',
            cursor: 'ew-resize',
          }}
        />
      )}
      {selected && rasterZiehbar && (
        <div
          draggable={false}
          onPointerDown={(e) => startRasterResize(e, 'y')}
          onDragStart={(e) => e.preventDefault()}
          onDoubleClick={(e) => {
            e.stopPropagation()
            const node = blockRef.current
            const spec = rasterSpecOf(getBlockDefinition(node.type), node.props)
            editor.updateProperty(node.id, 'rasterH', spec.startH)
          }}
          title="Höhe ziehen (rastet auf Zellen) · Doppelklick: Startgröße"
          style={{
            position: 'absolute',
            bottom: -4,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 26,
            height: 7,
            borderRadius: 4,
            background: 'hsl(var(--ring))',
            cursor: 'ns-resize',
          }}
        />
      )}
      {selected && !raster && resizable && (
        <div
          draggable={false}
          onPointerDown={(e) => startResize(e, 'width', 40)}
          onDragStart={(e) => e.preventDefault()}
          onDoubleClick={(e) => {
            e.stopPropagation()
            const standard = getBlockDefinition(blockRef.current.type)?.defaultProps.width ?? 'auto'
            editor.updateProperty(blockRef.current.id, 'width', standard)
          }}
          title="Breite ziehen · Doppelklick: Standard"
          style={{
            position: 'absolute',
            right: -4,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 7,
            height: 26,
            borderRadius: 4,
            background: 'hsl(var(--ring))',
            cursor: 'ew-resize',
          }}
        />
      )}
      {selected && !raster && heightResizable && (
        <div
          draggable={false}
          onPointerDown={(e) => startResize(e, 'height', 120)}
          onDragStart={(e) => e.preventDefault()}
          onDoubleClick={(e) => {
            e.stopPropagation()
            const standard = getBlockDefinition(blockRef.current.type)?.defaultProps.height ?? 'auto'
            editor.updateProperty(blockRef.current.id, 'height', standard)
          }}
          title="Höhe ziehen · Doppelklick: Standard"
          style={{
            position: 'absolute',
            bottom: -4,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 26,
            height: 7,
            borderRadius: 4,
            background: 'hsl(var(--ring))',
            cursor: 'ns-resize',
          }}
        />
      )}
    </div>
  )
}

interface AddChildButtonProps {
  label: string
  childType: string
  parentId: string

  platz: { top?: number; right?: number; bottom?: number; left?: number }
}

function AddChildButton({ label, childType, parentId, platz }: AddChildButtonProps) {
  const editor = useEditorInstance()
  return (
    <button
      type="button"
      data-ff-editor-helper
      draggable={false}
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation()
        editor.addBlock(childType, parentId)
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onDragStart={(e) => { e.preventDefault(); e.stopPropagation() }}
      style={{
        position: 'absolute',
        ...platz,
        width: 18,
        height: 18,
        padding: 0,
        border: 'none',
        borderRadius: 9999,
        background: 'hsl(var(--ring))',
        color: '#fff',
        fontSize: 13,
        lineHeight: '16px',
        cursor: 'pointer',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      +
    </button>
  )
}
