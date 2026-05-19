// Providers
// Wraps App in alle benoetigten Context-Provider.
// Aktuell: MantineProvider fuer Mantine-UI-Komponenten.
// Spaeter: hier weitere Provider stacken (Notifications, Modals, etc.).

import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import type { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return <MantineProvider>{children}</MantineProvider>
}
