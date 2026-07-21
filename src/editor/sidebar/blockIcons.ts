// blockIcons — Baustein-Typ -> lucide-Icon fuer die Baustein-Bibliothek.
//
// Reine Editor-seitige Zuordnungstabelle (Muster tierIcon.ts; Regel 2:
// Daten-Tabelle statt `if typ === …`). Lucide lebt AUSSCHLIESSLICH in der
// Editor-UI und darf NIE ins Runtime-Buendel (Export) — deshalb wohnt diese
// Tabelle unter src/editor/ und nicht bei den Bausteinen. Ein unbekannter
// oder neuer Typ bekommt das generische Fallback-Icon; der Editor bleibt so
// immer bedienbar, auch wenn ein Typ hier (noch) fehlt.
//
// blockIcon gibt das FERTIGE Element zurueck (createElement), nicht die
// Komponente: die Icon-Komponenten sind modulfest, der Aufrufer erzeugt zur
// Render-Zeit also keinen neuen Komponenten-Wert (react-hooks/static-components).

import { createElement, type ReactElement } from 'react'
import {
  AppWindow,
  CalendarDays,
  Component,
  CreditCard,
  FormInput,
  LayoutList,
  MousePointerClick,
  SquareKanban,
  StretchHorizontal,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  zeile: StretchHorizontal,
  button: MousePointerClick,
  formfeld: FormInput,
  datum: CalendarDays,
  kanban: SquareKanban,
  'kanban-spalte': LayoutList,
  card: CreditCard,
  popup: AppWindow,
}

// Fallback fuer unbekannte/neue Typen: ein neutraler Baustein.
const FALLBACK: LucideIcon = Component

export function blockIcon(type: string, props?: LucideProps): ReactElement {
  return createElement(ICONS[type] ?? FALLBACK, props)
}
