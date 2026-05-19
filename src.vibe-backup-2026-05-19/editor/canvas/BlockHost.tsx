// BlockHost legt nur Editor-Chrome um die echte Web Component.
import { Box, Badge, Group } from '@mantine/core'
import { createElement, useEffect, useRef } from 'react'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { useEditorStore } from '../../store/editorStore'

type BlockActionDetail = {
  actionId?: string
  label?: string
}

export function BlockHost({ id }: { id: string }) {
  const block = useEditorStore((state) => state.blocks[id])
  const isSelected = useEditorStore((state) => state.selectedBlockId === id)
  const selectBlock = useEditorStore((state) => state.selectBlock)
  const noteBlockAction = useEditorStore((state) => state.noteBlockAction)
  const hostRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const handleAction = (event: Event) => {
      const detail = (event as CustomEvent<BlockActionDetail>).detail
      noteBlockAction(id, detail.actionId || detail.label || '')
    }

    // CustomEvents der Web Component steigen bis zum Host hoch.
    host.addEventListener('ff-action', handleAction)
    return () => host.removeEventListener('ff-action', handleAction)
  }, [id, noteBlockAction])

  if (!block) return null

  const definition = getBlockDefinition(block.type)
  const liveElement = createElement(definition.tagName, {
    ...block.props,
  })

  return (
    <Box
      ref={hostRef}
      onClick={(event) => {
        event.stopPropagation()
        selectBlock(id)
      }}
      style={{
        border: isSelected ? '2px solid #4c6ef5' : '1px solid transparent',
        borderRadius: 8,
        padding: 10,
        width: 'fit-content',
        background: isSelected ? '#edf2ff' : 'transparent',
      }}
    >
      <Group gap="xs" align="center">
        {liveElement}
        {isSelected && (
          <Badge color="indigo" variant="light">
            {definition.title}
          </Badge>
        )}
      </Group>
    </Box>
  )
}
