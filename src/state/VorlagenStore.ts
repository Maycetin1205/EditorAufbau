import { type EintragProblem } from '../core/data/ladeProblem'
import { deepClone } from '../lib/deepClone'
import {
  meldeSpeicherPanne,
  merkeSpeicherErfolg,
  sichereUnlesbaren,
} from './notfallkopie'
import { SpeicherPlaner } from './speicherPlaner'
import { Subject } from './Subject'

const SPEICHER_VERZOEGERUNG_MS = 500

export interface VorlagenEintrag {
  id: string
}

export interface VorlagenBauplan<T extends VorlagenEintrag> {
  schluessel: string

  huelle: string

  klarnameLesen: string

  klarnameSchreiben: string

  pruefe: (roh: unknown) => { liste: T[]; probleme: EintragProblem[] }

  startbestand?: readonly T[]
}

function ladeAusSpeicher<T extends VorlagenEintrag>(bauplan: VorlagenBauplan<T>): T[] | null {
  let roh: string | null = null
  try {
    if (typeof localStorage !== 'undefined') roh = localStorage.getItem(bauplan.schluessel)
  } catch (err) {
    console.warn(
      `Browser-Speicher nicht lesbar — „${bauplan.klarnameLesen}" startet leer.`,
      err,
    )
    return null
  }
  if (!roh) return null
  try {
    const gelesen = JSON.parse(roh) as Record<string, unknown> | null
    const rohListe = gelesen?.[bauplan.huelle]

    if (!Array.isArray(rohListe)) {
      sichereUnlesbaren(bauplan.schluessel, roh, bauplan.klarnameLesen)
      return null
    }

    const { liste } = bauplan.pruefe(rohListe)
    return liste
  } catch {
    sichereUnlesbaren(bauplan.schluessel, roh, bauplan.klarnameLesen)
    return null
  }
}

export class VorlagenStore<T extends VorlagenEintrag> extends Subject<VorlagenStore<T>> {
  private readonly bauplan: VorlagenBauplan<T>
  private _eintraege: T[]
  private _version = 0
  private _planer = new SpeicherPlaner(() => { this.schreibeJetzt() }, SPEICHER_VERZOEGERUNG_MS)

  private _hydrated = false

  constructor(bauplan: VorlagenBauplan<T>) {
    super()
    this.bauplan = bauplan
    this._eintraege = ladeAusSpeicher(bauplan)
      ?? (bauplan.startbestand ? deepClone(bauplan.startbestand) as T[] : [])
    this._hydrated = true
  }

  get list(): readonly T[] { return this._eintraege }
  get version(): number { return this._version }

  get(id: string): T | undefined {
    return this._eintraege.find((e) => e.id === id)
  }

  override notify(data: VorlagenStore<T>): void {
    this._version++
    super.notify(data)
    if (this._hydrated) this.planeSpeichern()
  }

  add(data: Omit<T, 'id'>): T {
    const eintrag = { ...deepClone(data), id: crypto.randomUUID() } as T
    this._eintraege = [...this._eintraege, eintrag]
    this.notify(this)
    return eintrag
  }

  update(id: string, data: Omit<T, 'id'>): void {
    const at = this._eintraege.findIndex((e) => e.id === id)
    if (at < 0) return
    const naechste = [...this._eintraege]
    naechste[at] = { ...deepClone(data), id } as T
    this._eintraege = naechste
    this.notify(this)
  }

  ersetzeAlle(eintraege: readonly T[]): void {
    this._eintraege = deepClone(eintraege) as T[]
    this.notify(this)
  }

  remove(id: string): void {
    const naechste = this._eintraege.filter((e) => e.id !== id)
    if (naechste.length === this._eintraege.length) return
    this._eintraege = naechste
    this.notify(this)
  }

  private planeSpeichern(): void {
    this._planer.plane()
  }

  speichereJetzt(): void {
    this._planer.sofort()
  }

  private schreibeJetzt(): void {
    try {
      localStorage.setItem(
        this.bauplan.schluessel,
        JSON.stringify({ [this.bauplan.huelle]: this._eintraege }),
      )
      merkeSpeicherErfolg(this.bauplan.schluessel)
    } catch (err) {
      meldeSpeicherPanne(this.bauplan.schluessel, this.bauplan.klarnameSchreiben, err)
    }
  }
}
