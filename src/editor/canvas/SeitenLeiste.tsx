// SeitenLeiste
// Seiten-Reiter — seit R1 (2026-07-21) als kompakte segmentierte Gruppe in
// der Top-Bar der Shell (vorher schwebend über der Fläche). Reine
// Editor-Hilfe: Hauptseite | Klarnamen der Seiten | ein „＋" je Seiten-Art.
//
// WELCHE Seiten-Arten es gibt, sagt die Registry (pageBlock) — bis N1
// (2026-08-12) stand hier ein fester „＋ Popup"-Knopf, und der Store suchte
// sich die Art selbst zusammen. Mit der Ansicht daneben legte das still die
// falsche Seite an.
//
// Bedienung am Ding (Regel 7): Doppelklick auf den Reiter benennt die Seite
// um, der Papierkorb am aktiven Reiter wirft sie weg. Beides gibt es hier,
// weil eine Ansicht sonst NICHTS Anklickbares hätte — sie ist die
// Maskenfläche selbst, kein Baustein (das Popup dagegen hat zusätzlich
// seinen Fenstertitel und seinen Rahmen). Gelöscht wird ohne Rückfrage, Netz
// ist Strg+Z (Entscheidung U2, 2026-08-12).

import { Trash } from '@/ui/zeichen'
import { Fragment, useState } from 'react'
import { getAllBlockDefinitions } from '../../core/blocks/blockRegistry'
import { useEditor } from '../../state/useEditor'

export function SeitenLeiste() {
  const ed = useEditor()
  const pages = ed.pages
  const aktiv = ed.activePageId
  // Welche Seite gerade umbenannt wird (id) und der Text im Feld.
  const [umbenennen, setUmbenennen] = useState<{ id: string; text: string } | null>(null)
  const seitenArten = getAllBlockDefinitions().filter((def) => def.pageBlock)

  const uebernehmen = () => {
    if (!umbenennen) return
    const name = umbenennen.text.trim()
    if (name !== '') ed.updateProperty(umbenennen.id, 'name', name)
    setUmbenennen(null)
  }

  return (
    <div
      className="flex max-w-[44vw] items-center gap-0.5 overflow-x-auto rounded-md border border-border bg-muted p-0.5"
      data-ff-editor-helper
    >
      {pages.map((p) => (
        umbenennen?.id === p.id ? (
          <input
            key={p.id}
            autoFocus
            value={umbenennen.text}
            onChange={(e) => setUmbenennen({ id: p.id, text: e.target.value })}
            onBlur={uebernehmen}
            onKeyDown={(e) => {
              if (e.key === 'Enter') uebernehmen()
              if (e.key === 'Escape') setUmbenennen(null)
            }}
            className="h-6 w-32 shrink-0 rounded-md border border-input bg-card px-2 text-xs text-foreground outline-none"
          />
        ) : (
          <Fragment key={p.id}>
            <button
              type="button"
              onClick={() => ed.setActivePage(p.id)}
              // Die Hauptseite hat keinen eigenen Baustein und darum keinen
              // Namen zu vergeben — sie IST die Wurzel.
              onDoubleClick={() => {
                if (!p.istHauptseite) setUmbenennen({ id: p.id, text: p.name })
              }}
              title={p.istHauptseite ? undefined : 'Doppelklick: umbenennen'}
              className={
                p.id === aktiv
                  ? 'h-6 shrink-0 whitespace-nowrap rounded-md bg-card px-2.5 text-xs font-semibold text-foreground shadow-sm'
                  : 'h-6 shrink-0 whitespace-nowrap rounded-md px-2.5 text-xs font-medium text-muted-foreground hover:bg-card/60 hover:text-foreground'
              }
            >
              {p.name}
            </button>
            {p.id === aktiv && !p.istHauptseite && (
              <button
                type="button"
                title="Seite löschen (Strg+Z stellt sie zurück)"
                onClick={() => ed.removeBlock(p.id)}
                className="flex h-6 shrink-0 items-center rounded-md bg-card pr-1.5 text-muted-foreground shadow-sm hover:text-destructive"
              >
                <Trash size={12} />
              </button>
            )}
          </Fragment>
        )
      ))}
      {seitenArten.map((def) => (
        <button
          key={def.type}
          type="button"
          onClick={() => ed.addSeite(def.type)}
          title={`Neue Seite anlegen: ${def.displayName}`}
          className="h-6 shrink-0 whitespace-nowrap rounded-md px-2 text-xs text-muted-foreground hover:bg-card/60 hover:text-foreground"
        >
          ＋ {def.displayName}
        </button>
      ))}
    </div>
  )
}
