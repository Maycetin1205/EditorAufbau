// Providers
// Wraps App in alle benoetigten Context-Provider.
// MantineProvider: Mantine-UI-Komponenten.
// Notifications: globaler Toast-Mechanismus (showNotification ueberall verfuegbar).
// Spaeter koennen weitere Provider hier dazugehaengt werden.

import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import { Notifications } from '@mantine/notifications'
import '@mantine/notifications/styles.css'
import type { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <MantineProvider>
      <Notifications position="bottom-right" />
      {children}
    </MantineProvider>
  )
}
