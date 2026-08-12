// VorlagenStore — gemeinsames Fundament der Vorlagen-Bibliotheken.
//
// Datenquellen und Relations-Vorlagen sind beides BENUTZERDEFINIERTE
// Bibliotheken: Felder, Relations-NRs und Werkzeug-Nummern sind je
// SoftEngine-Installation individuell (Regel 5 — Installations-Individuelles
// sind Daten, nie Code). Beide taten bis 2026-08-04 dasselbe in zwei fast
// wortgleichen Dateien: laden + bereinigen, Beobachter melden, anlegen /
// aendern / ersetzen / loeschen, entprellt speichern. Ein Fehler in der einen
// war ein Fehler, den die andere nicht hatte — genau die Bauart, die den
// Vorgaenger unwartbar gemacht hat. Was die beiden WIRKLICH unterscheidet,
// steht jetzt in ihrem Bauplan (VorlagenBauplan), nicht in doppeltem Code.
//
// EISERNE INVARIANTE: Speicher-Schluessel und JSON-Form bleiben, was sie
// waren ({"sources":[…]} bzw. {"relations":[…]}). Die Bibliotheken im Browser
// des Bedieners muessen unveraendert lesbar bleiben — es gibt KEINE Migration.
//
// Bewusst KEIN Undo/Redo: eine Bibliothek ist kein Canvas-Gestenraum; vor
// destruktiven Aktionen fragt die UI nach (wie das Kreuzchen).

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

// Jeder Eintrag traegt einen stabilen Technikwert: Bausteine und Ketten
// verweisen ueber die id auf ihn, sie aendert sich nie wieder.
export interface VorlagenEintrag {
  id: string
}

// Bauplan EINER Bibliothek — alles, worin sich die beiden unterscheiden.
export interface VorlagenBauplan<T extends VorlagenEintrag> {
  // localStorage-Schluessel. Nie aendern: ein anderer Schluessel heisst, dass
  // die Bibliothek des Bedieners wortlos leer startet.
  schluessel: string
  // Schluessel der JSON-Huelle: { "<huelle>": [ …Eintraege ] }.
  huelle: string
  // Klarname in der Meldung „gespeicherter Stand war beschaedigt".
  klarnameLesen: string
  // Klarname in der Meldung „konnte nicht gespeichert werden". Weicht bei den
  // Relationen vom Lese-Klarnamen ab („Relationen" statt „Relations-Vorlagen").
  // Beide Texte stehen so vor dem Bediener und bleiben wortgleich erhalten —
  // Meldungstexte zu vereinheitlichen ist eine eigene Entscheidung, nicht die
  // Nebenwirkung eines Aufraeumens.
  klarnameSchreiben: string
  // Defensives Bereinigen beim Laden (pruefe*): wirft nie, wirft Unbrauchbares
  // weg — und sagt, WAS es weggeworfen hat. Die Fundliste liest hier niemand
  // mehr (die Quarantaene ist auf Nutzer-Ansage 2026-08-12 restlos raus);
  // gebraucht wird sie weiter vom DATEI-Weg (maskenDatei).
  pruefe: (roh: unknown) => { liste: T[]; probleme: EintragProblem[] }
  // Mitgelieferter Startbestand beim ALLERERSTEN Start — nur die Relationen
  // haben einen (der Standard-PUT). Ohne Startbestand beginnt ein frischer
  // Browser leer; so wollen es die Datenquellen seit 2026-07-30.
  startbestand?: readonly T[]
}

// null = noch nie gespeichert (→ Startbestand bzw. leer); sonst die bereinigte
// Liste (auch wenn leer — der Bediener hat dann alles geloescht).
//
// Ein BESCHAEDIGTER Stand endet in derselben leeren Liste, ist aber etwas
// anderes: bis 2026-07-27 fielen beide still auf den Startbestand zurueck, die
// echten Vorlagen des Bedieners waren damit wortlos weg. Darum wird ein
// unlesbarer Stand gesichert und GEMELDET, statt nur ersetzt (Regel „nichts
// scheitert still", siehe notfallkopie.ts — dieselbe Behandlung wie beim
// Block-Baum).
function ladeAusSpeicher<T extends VorlagenEintrag>(bauplan: VorlagenBauplan<T>): T[] | null {
  // Diese Funktion laeuft schon beim MODUL-Import (die Singletons unten),
  // also VOR dem Aufbau der Oberflaeche. Wirft der Speicherzugriff
  // (Privatmodus, gesperrte Cookies), startete der Editor bis 2026-08-05 als
  // weisse Seite ohne ein Wort. Jetzt: wie "noch nie gespeichert" weiter,
  // einmal console.warn — kein Alert, denn verloren ist nichts.
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
    // Gueltiges JSON, aber keine Liste, wo eine stehen muss: fremder oder
    // halb-kaputter Inhalt — wie einen Lesefehler behandeln.
    if (!Array.isArray(rohListe)) {
      sichereUnlesbaren(bauplan.schluessel, roh, bauplan.klarnameLesen)
      return null
    }
    // Nachsichtig laden (Nutzer-Ansage 2026-08-12): Unbrauchbares faellt weg,
    // die brauchbaren Eintraege oeffnen. Die Bibliotheks-Quarantaene aus A4
    // (Riegel + Sperransicht bei jedem Fund) ist restlos entfernt.
    const { liste } = bauplan.pruefe(rohListe)
    return liste
  } catch {
    sichereUnlesbaren(bauplan.schluessel, roh, bauplan.klarnameLesen)
    return null
  }
}

export class VorlagenStore<T extends VorlagenEintrag> extends Subject<VorlagenStore<T>> {
  // Eigenes Feld statt Konstruktor-Kurzschreibweise: die TypeScript-Einstellung
  // `erasableSyntaxOnly` verbietet Parameter-Eigenschaften (sie waeren Code,
  // der beim Loeschen der Typen nicht verschwindet).
  private readonly bauplan: VorlagenBauplan<T>
  private _eintraege: T[]
  private _version = 0
  private _planer = new SpeicherPlaner(() => { this.schreibeJetzt() }, SPEICHER_VERZOEGERUNG_MS)
  // Riegel gegen Speichern, bevor der Startstand steht: erst wenn der
  // Konstruktor fertig geladen hat, darf eine Meldung einen Speicherlauf
  // anstossen.
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

  // Neue Vorlage mit frischem, stabilem Technikwert (Bausteine referenzieren
  // die id in ihrer source-Prop, Ketten in ihrer Vorlagen-id — sie aendert
  // sich nie wieder).
  //
  // Die `as T`-Zusicherungen in add/update sind der TypeScript-Preis dafuer,
  // dass hier EIN Fundament fuer mehrere Eintragsarten steht: dass
  // `Omit<T,'id'> + id` wieder ein T ergibt, kann der Pruefer bei einem
  // generischen T nicht selbst nachrechnen.
  add(data: Omit<T, 'id'>): T {
    const eintrag = { ...deepClone(data), id: crypto.randomUUID() } as T
    this._eintraege = [...this._eintraege, eintrag]
    this.notify(this)
    return eintrag
  }

  // Bearbeiten ersetzt alles AUSSER der id (angehaengte Bausteine und Ketten
  // behalten ihre Vorlage). Unbekannte id = kein Effekt.
  update(id: string, data: Omit<T, 'id'>): void {
    const at = this._eintraege.findIndex((e) => e.id === id)
    if (at < 0) return
    const naechste = [...this._eintraege]
    naechste[at] = { ...deepClone(data), id } as T
    this._eintraege = naechste
    this.notify(this)
  }

  // Die GANZE Bibliothek ersetzen — nur fuer das Laden einer Maskendatei
  // (2026-07-28). Ersetzen statt Zusammenfuehren: eine Maskendatei ist ein
  // vollstaendiger Stand, und Zusammenfuehren braeuchte Konfliktregeln
  // (gleiche id, anderer Inhalt — wer gewinnt?), die niemand angefordert hat
  // (Regel 10). Die Datei ist beim Auspacken bereits vollstaendig geprueft;
  // hier wird nicht noch einmal bereinigt.
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

  // Entprellt speichern: der Bediener tippt in der Bibliothek, jeder
  // Tastendruck meldet — geschrieben wird erst, wenn er kurz innehaelt. Der
  // Planer haelt dazu den Weg „ausstehenden Stand JETZT schreiben" bereit
  // (Verlassen der Seite, s. speicherPlaner).
  private planeSpeichern(): void {
    this._planer.plane()
  }

  // Einen ausstehenden Stand JETZT schreiben (providers.tsx bei pagehide).
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
