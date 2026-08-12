// PropertyDescription
// Metadaten fuer genau ein editierbares Block-Property.
// kind bestimmt das Inspector-Control; field speichert einen Feldcode,
// relation die id einer Relation-Vorlage. requiresDataSource blendet ein
// Control ohne Quelle aus. visibleWhen beschreibt registry-getrieben, wann
// ein Control zum aktuellen Blockzustand passt. exclusiveAmongSiblings
// erzwingt hoechstens ein Ja-Kennzeichen unter gleichartigen Geschwistern.
// number ist eine kompakte Zahl (unit/min/max), segment eine Options-Liste
// als Segmentgruppe statt Dropdown. inspectorRow packt benachbarte
// Properties mit gleichem Zeilen-Titel in EINE Inspector-Zeile (ein Label,
// Controls nebeneinander) — Registry-Daten, kein Sondercode je Baustein.
export type PropertyKind =
  | 'text'
  | 'textarea'
  | 'select'
  | 'number'
  | 'segment'
  | 'field'
  // quelle speichert die id einer DATENQUELLE — eine ZWEITE Quelle am
  // Baustein, fuer einen eigenen Zweck neben der Quelle, aus der er seinen
  // Inhalt liest (acceptsDataSource). Beispiel: die Liste, aus der das
  // Nachschlage-Feld waehlen laesst. Der Export sammelt sie mit in die
  // SEFILELOOP; ohne das schickte SoftEngine ihre Daten nie und das Fenster
  // bliebe in der fertigen Maske leer.
  | 'quelle'
  | 'relation'

export interface PropertySelectOption {
  value: string
  label: string
}

export interface PropertyVisibilityCondition {
  attributeName: string
  // Genau EINE der drei Formen: equals (sichtbar, wenn gleich),
  // notEquals (sichtbar, wenn UNGLEICH — z. B. das normale Feld-Control an
  // jedem Feldtyp AUSSER Nachschlagen, wo der Wert aus dem Fenster kommt
  // statt aus einer Bindung) oder keinesVon (sichtbar, wenn KEINER der
  // aufgezaehlten Werte). Ohne notEquals/keinesVon muesste jeder einzelne
  // Feldtyp aufgezaehlt werden, und ein neuer Typ fiele still hinten runter.
  equals?: unknown
  notEquals?: unknown
  // Zwei Ausnahmen statt einer. Gebraucht seit U6 (2026-08-12): die Wert-
  // Stelle des Formularfelds ist weder am Nachschlage-Feld bindbar (der Wert
  // entsteht im Fenster) noch am Ankreuzfeld (der SE-Wert-Kontrakt J/N? 1/0?
  // ist an keiner echten Maske belegt, CLAUDE.md). Bewusst hier und nicht als
  // eigene Bedingung am Baustein: es gibt EINE Sprache fuer „wann gilt das"
  // und EINE Auswertung darunter (s. propertySichtbar).
  keinesVon?: readonly unknown[]
}

// DIE eine Auswertung der Bedingung. Inspector, Export und Preflight muessen
// dieselbe Antwort bekommen: eine Prop, die der Inspector versteckt, darf der
// Export nicht mitnehmen (sonst laedt die Maske eine Tabelle, die kein
// Baustein liest) und der Preflight nicht verlangen (sonst blockte er wegen
// eines Feldes, das der Bauer nirgends sehen kann). Ohne Bedingung: immer.
//
// Seit den Raster-Varianten (2026-08-06) fragt auch rasterLayout hier: die
// senkrechte Trennlinie ist schmal und hoch statt breit und flach. Jede
// zustandsabhaengige Registry-Angabe benutzt DIESE Form und DIESE Stelle —
// eine zweite Sprache fuer „wann gilt das" waere eine zweite Fehlerquelle.
export function propertySichtbar(
  bedingung: PropertyVisibilityCondition | undefined,
  props: Record<string, unknown>,
): boolean {
  if (!bedingung) return true
  const wert = props[bedingung.attributeName]
  if (bedingung.keinesVon) {
    return !bedingung.keinesVon.some((v) => Object.is(wert, v))
  }
  if ('notEquals' in bedingung) {
    return !Object.is(wert, bedingung.notEquals)
  }
  return Object.is(wert, bedingung.equals)
}

export interface PropertyDescription {
  attributeName: string
  name: string
  description: string
  maxLength?: number
  kind: PropertyKind
  options?: PropertySelectOption[]
  /** Nur kind 'number': angezeigte Einheit (z. B. 'px') und erlaubte Grenzen. */
  unit?: string
  min?: number
  max?: number
  /** Benachbarte Properties mit gleichem Titel teilen sich EINE Inspector-Zeile. */
  inspectorRow?: string
  visibleWhen?: PropertyVisibilityCondition
  requiresDataSource?: boolean
  exclusiveAmongSiblings?: boolean
  /**
   * Nur kind 'field': die waehlbaren Felder kommen aus der Datenquelle, deren
   * id in DIESER Nachbar-Prop (kind 'quelle') steht — statt aus der Quelle in
   * Reichweite des Bausteins. Das Nachschlagen braucht es: seine Felder
   * gehoeren zur NACHSCHLAGE-Quelle, nicht zur eigenen (die es meist gar
   * nicht hat).
   */
  quelleProp?: string
  /**
   * Nur kind 'field': Prop-Name, in dem der KLARNAME des gewaehlten Feldes
   * mitgefuehrt wird (leer bei '— keins —').
   *
   * Warum es das braucht: die laufende Maske kennt nur Feldcodes. Ihre
   * Quellen-Definitionen tragen bewusst KEIN Feld-Woerterbuch — Bindungen
   * reisen als Feldcode-Attribute, und das reicht ueberall dort, wo ein Feld
   * nur GELESEN wird. Sobald ein Baustein den Feldnamen aber ANZEIGEN muss,
   * haette er nur „10_30" — sichtbarer Technikwert, Regel-3-Bruch. Statt das
   * ganze Woerterbuch in jeden Export zu legen, traegt der Baustein den einen
   * Klarnamen selbst; dieselbe Bauart wie der Titel einer Tabellenspalte.
   * Der Inspector setzt beide Props generisch, ohne einen Bausteintyp zu
   * kennen (Regel 2).
   */
  klarnameProp?: string
}
