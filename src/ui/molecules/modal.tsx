// Modal: Molekül — Overlay + zentrierte Karte für Formulare (Editor-UI).
// Handgebaut nach dem FieldPicker-Muster (Escape schließt, Klick außerhalb
// schließt) statt einer neuen Dialog-Abhängigkeit — die Editor-UI braucht
// nur diese eine, einfache Form.

import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { IconButton } from '@/ui/atoms/icon-button'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // stopPropagation: das Modal ist die oberste Schicht — sein Escape
      // darf einen darunterliegenden Träger (z. B. die Kommandozentrale,
      // Bubble-Listener) nicht mitschließen.
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-6"
      onPointerDown={(e) => {
        // Nur echte Overlay-Klicks schließen — Klicks in der Karte nicht.
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-full w-full max-w-xl flex-col rounded-lg border border-border bg-background shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          <IconButton aria-label="Schließen" onClick={onClose}>
            <X size={16} />
          </IconButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
