import { bootSe, hasSeData, onSeDaten } from '../../softengine/bridge'
import { aufAuswahlHoeren } from './auswahl'
import { aufTagHoeren } from './gewaehlterTag'
import { verdrahteHolendeQuellen } from './holendeQuellen'

export interface DatenAnschluss<T extends HTMLElement> {
  connect: (el: T) => void

  disconnect: (el: T) => void
}

export function macheDatenAnschluss<T extends HTMLElement>(opts: {
  hydriere: (el: T) => void

  verdrahte?: (el: T) => void
}): DatenAnschluss<T> {
  const elemente = new Set<T>()
  let angemeldet = false

  const hydriereAlle = (): void => {
    if (!hasSeData()) return
    elemente.forEach(opts.hydriere)
  }

  const connect = (el: T): void => {
    if (el.hasAttribute('data-ff-editor')) return
    elemente.add(el)
    opts.verdrahte?.(el)

    if (!angemeldet) {
      angemeldet = true
      onSeDaten(hydriereAlle)

      aufTagHoeren(hydriereAlle)

      aufAuswahlHoeren(hydriereAlle)

      verdrahteHolendeQuellen()
    }
    bootSe()

    if (hasSeData()) opts.hydriere(el)
  }

  const disconnect = (el: T): void => {
    elemente.delete(el)
  }

  return { connect, disconnect }
}
