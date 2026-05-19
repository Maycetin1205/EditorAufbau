// BasicBlock
// Abstrakte Basisklasse fuer alle Block-Typen.
// Erbt von LitElement (Custom-Element-Lifecycle + Rendering).
// Implementiert BlockComponent (Vertrag).
// Konkrete Blocks erweitern diese Klasse.

import { LitElement } from 'lit'
import type { BlockComponent } from './BlockComponent'
import type { PropertyDescription } from './PropertyDescription'

export abstract class BasicBlock extends LitElement implements BlockComponent {
  protected _id: string
  protected _type: string
  protected _width: number = 50
  protected _height: number = 50

  // Optional defaults: Custom Elements werden vom Browser ohne Argumente erzeugt.
  // Beim programmatischen Anlegen via new ButtonBlock(id) werden Werte ueber super(...) gesetzt.
  constructor(
    id: string = crypto.randomUUID(),
    type: string = 'block',
    width: number = 50,
    height: number = 50,
  ) {
    super()
    this._id = id
    this._type = type
    this._width = width
    this._height = height
  }

  get id(): string {
    return this._id
  }

  get type(): string {
    return this._type
  }

  get width(): number {
    return this._width
  }
  set width(v: number) {
    const old = this._width
    this._width = v
    this.requestUpdate('width', old)
  }

  get height(): number {
    return this._height
  }
  set height(v: number) {
    const old = this._height
    this._height = v
    this.requestUpdate('height', old)
  }

  get customProperties(): PropertyDescription[] {
    return []
  }
}
