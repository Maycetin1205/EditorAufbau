import { useEffect, type ReactNode } from 'react'
import { X } from '@/ui/zeichen'
import { IconButton } from '@/ui/atoms/icon-button'

interface FormularKarteProps {
  title: string
  onClose: () => void
  children: ReactNode
}

export function FormularKarte({ title, onClose, children }: FormularKarteProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [onClose])

  return (
    <div className="border-t border-border pt-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <IconButton aria-label="Abbrechen" onClick={onClose}>
          <X size={16} />
        </IconButton>
      </div>
      <div>{children}</div>
    </div>
  )
}
