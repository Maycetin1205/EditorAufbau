// Zentrale App-Provider: hier wird die gemeinsame Editor-UI einmal eingerichtet.
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import type { PropsWithChildren } from 'react'
import { theme } from '../ui/theme'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications position="bottom-right" />
      {children}
    </MantineProvider>
  )
}
