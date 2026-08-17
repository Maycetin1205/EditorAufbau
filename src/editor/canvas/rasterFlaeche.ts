export function flaecheVon(wrapper: HTMLElement): HTMLElement | null {
  return wrapper.assignedSlot?.parentElement ?? wrapper.parentElement
}

export function flaecheIn(host: Element | null | undefined): HTMLElement | null {
  const slot = host?.shadowRoot?.querySelector('slot:not([name])')
  const flaeche = slot?.parentElement
  return flaeche instanceof HTMLElement ? flaeche : null
}
