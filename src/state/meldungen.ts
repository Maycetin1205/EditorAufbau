import { Subject } from './Subject'

export interface Meldung {
  id: number
  text: string
}

class Meldungsstelle extends Subject<Meldungsstelle> {
  private _liste: Meldung[] = []
  private _version = 0
  private naechsteId = 1

  get liste(): readonly Meldung[] { return this._liste }
  get version(): number { return this._version }

  override notify(data: Meldungsstelle): void {
    this._version++
    super.notify(data)
  }

  melde(text: string): void {
    this._liste = [...this._liste, { id: this.naechsteId++, text }]
    this.notify(this)
  }

  schliesse(id: number): void {
    const rest = this._liste.filter((m) => m.id !== id)
    if (rest.length === this._liste.length) return
    this._liste = rest
    this.notify(this)
  }

  leere(): void {
    if (this._liste.length === 0) return
    this._liste = []
    this.notify(this)
  }
}

export const meldungen = new Meldungsstelle()
