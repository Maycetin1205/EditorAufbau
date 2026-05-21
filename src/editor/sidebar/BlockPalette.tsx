// BlockPalette
// Zeigt alle registrierten Block-Typen aus der Registry.
// Klick auf einen Eintrag legt neue BlockData im Editor-State an.
// Migriert von Mantine auf src/ui (Tailwind + shadcn/ui-Style).

import { getAllBlockDefinitions } from '../../core/blocks/blockRegistry'
import { useEditor } from '../../state/useEditor'
import { Button } from '@/ui/button'

export function BlockPalette() {
  const ed = useEditor()
  const definitions = getAllBlockDefinitions()

  return (
    <div className="flex flex-col gap-2">
      {definitions.map((def) => (
        <Button
          key={def.type}
          variant="secondary"
          className="w-full justify-start"
          onClick={() => ed.addBlock(def.type)}
        >
          {def.type}
        </Button>
      ))}
    </div>
  )
}
