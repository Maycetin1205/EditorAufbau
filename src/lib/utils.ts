// cn(): shadcn-Standard-Helper.
// Verbindet Tailwind-Klassen und loest Kollisionen via tailwind-merge.
// Wird in jeder src/ui-Komponente fuer className-Composition benutzt.

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
