// BlockDefinition
// Technischer Registry-Eintrag fuer einen registrierten Block-Typ.
// Wird aus den statischen Klassenfeldern + customProperties-Getter einer
// Block-Klasse abgeleitet (siehe BasicBlock.defineAndRegister).

import type { BlockCategory } from './BlockComponent'
import type { FlowDirection, FlowWidth } from './flowLayout'
import type { RasterSpec } from './rasterLayout'
import type {
  PropertyDescription,
  PropertyVisibilityCondition,
} from './PropertyDescription'

export type { BlockCategory }

// Beispieldaten-Bauplan: beschreibt, mit welchem Teilbaum ein
// Block eingefügt wird ("nie ein leeres Gerippe"). Reine Daten — die Factory
// materialisiert daraus BlockNodes. `children` überschreibt die
// defaultChildren des Kind-Typs; fehlt es, gelten dessen eigene.
export interface DefaultChildSpec {
  type: string
  props?: Record<string, unknown>
  children?: readonly DefaultChildSpec[]
}

// Bindbare Stelle: eine Text-Stelle des Blocks,
// die per Klick an ein Feld der Datenquelle in Reichweite gebunden werden
// kann. `prop` = die Anzeige-Prop der Stelle (z. B. 'heading'); die Bindung
// selbst (Feldcode = Technikwert) liegt in der Prop `<prop>Field` und muss
// in den defaultProps des Blocks stehen (Default '' = ungebunden), damit
// Persistenz sie erhält und der Export sie als Attribut mitnimmt.
// `label` = Klarname der Stelle für den Feld-Picker (z. B. 'Titel').
// Der Block markiert das Stellen-Element im Template mit
// data-ff-spot="<prop>" (Klick-Ziel) und data-ff-bound (Daten-Markierung,
// sichtbar nur im Editor — gated über data-ff-editor am Host).
// Eine Stelle zeigt IMMER alle Felder ihrer Quelle: welches Feld passt,
// entscheidet der Bediener (Nutzer-Entscheidung 2026-07-27, nachdem eine
// Einschraenkung auf Feld-Arten nur Pflegearbeit erzeugte).
export interface BindableSpot {
  prop: string
  label: string
}

export interface ActionValueSpot {
  prop: string
  label: string
}

// Bindbare LISTE (Registry-Opt-in, Regel 2): eine Prop des Blocks haelt eine
// Liste gleichartiger Eintraege, von denen JEDER an ein Feld der Datenquelle
// gebunden wird — die Tabelle bindet so ihre Spalten. Ohne diesen Eintrag
// muesste der generische BlockHost den Baustein persoenlich kennen (Import +
// Sondercode) — genau das, was Regel 2 verbietet.
//
// Unterschied zu bindableSpots: dort sind es FESTE, im Voraus bekannte Stellen
// (Titel, Untertitel …); hier ist die Anzahl erst zur Laufzeit bekannt, weil
// der Bediener Eintraege hinzufuegt und entfernt.
export interface ListenBindung {
  // Prop mit der Liste (Tabelle: 'spalten').
  prop: string
  // Schluessel des Klarnamens IM Eintrag (Tabelle: 'titel').
  titelKey: string
  // Schluessel des Feldcodes IM Eintrag (Tabelle: 'feld') — Technikwert.
  feldKey: string
  // Vorlage des noch unbenannten Titels, `{n}` = 1-basierte Nummer
  // (Tabelle: 'Spalte {n}'). Nur ein Titel, der EXAKT dieser Vorlage
  // entspricht, gilt als „vom Bediener nicht angefasst" und darf beim Binden
  // durch den Feld-Klarnamen ersetzt werden. Alles andere hat der Bediener
  // selbst getippt und wird NIE ueberschrieben.
  standardTitel: string
}

// Titel eines noch unbenannten Listen-Eintrags aus der Vorlage ('Spalte {n}').
export function listenStandardTitel(b: ListenBindung, index: number): string {
  return b.standardTitel.replace('{n}', String(index + 1))
}

// Die Listen-Prop defensiv als Eintragsliste lesen — alte Staende koennen
// reine Strings enthalten (der Baustein selbst faengt das ebenfalls ab).
// Steht hier bei der ListenBindung, damit Editor UND Preflight dieselbe
// Lesart benutzen: liest der eine anders als der andere, meldet der Preflight
// eine Spalte in Ordnung, die der Editor gar nicht so sieht.
export function listeLesen(roh: unknown, b: ListenBindung): Record<string, unknown>[] {
  if (!Array.isArray(roh)) return []
  return roh.map((x, i) => {
    if (x && typeof x === 'object') return { ...(x as Record<string, unknown>) }
    return {
      [b.titelKey]: typeof x === 'string' ? x : listenStandardTitel(b, i),
      [b.feldKey]: '',
    }
  })
}

// Auslesbare Stellen liefern aktuelle Laufzeitwerte an Aktionsparameter.
// Registry-Opt-in statt fest verdrahteter Bausteintypen im Schritt-Editor.
export type ActionValueSpotsFor<Props> = ReadonlyArray<{
  prop: keyof Props & string
  label: string
}>

// ---------------------------------------------------------------------------
// Bindungs-Konvention — DIE eine, typgeprüfte Definition.
// Die Bindung einer Stelle liegt in der Prop `<prop>Field` (Feldcode =
// Technikwert, '' = ungebunden); im exportierten HTML normalisiert sie der
// Browser zum kleingeschriebenen Attribut `<prop>field`. Alle Leser gehen
// über diese Typen/Helfer statt eigener String-Bastelei:
//   - Editor: bindingProp() in useLitElement/useBindingPicker/BlockHost.
//   - Laufzeit: seRuntime/feldRuntime bauen ihre Attributnamen über
//     bindingAttr() (P-C 2026-07-17 — vorher nur Typ-Anker per satisfies;
//     seither reist diese Funktion im Runtime-Bündel mit).
//   - Bausteine: bindableSpots ist über BindableSpotsFor gegen die eigenen
//     defaultProps geprüft.

// Prop-Form der Bindung (`heading` → `headingField`).
export type BindingProp<P extends string = string> = `${P}Field`

// Attribut-Form der Bindung (`headingField` → `headingfield`): HTML-
// Attribute sind kleingeschrieben, das Suffix bleibt `field`.
export type BindingAttr = `${string}field`

// Die EINE Stelle, die den Bindungs-Prop-Namen baut.
export function bindingProp<P extends string>(prop: P): BindingProp<P> {
  return `${prop}Field`
}

// Die EINE Stelle, die den Bindungs-Attributnamen baut (Laufzeit liest
// Attribute, nicht Props — HTML normalisiert `valueField` zu `valuefield`).
export function bindingAttr(prop: string): BindingAttr {
  return `${prop.toLowerCase()}field`
}

// ---------------------------------------------------------------------------
// Qualifizierte Bindung: aus WELCHER Quelle kommt das Feld? (2026-07-28)
//
// Ein Baustein kann mehrere Datenquellen tragen (Nutzer-Fall: eine Karte zeigt
// den Termin aus dem Terminplaner UND Rasse/Notiz aus Kundenhaustieren). Ein
// Feldcode allein ist dann nicht mehr eindeutig: im Bestand des Nutzers heisst
// „Tiername" im Terminplaner 78_30 und in Kundenhaustieren 18_30 — ohne
// Quellenangabe waere jede Bindung an die zweite Quelle geraten (Regel 7).
//
// Darum eine VORSILBE im gespeicherten Wert:
//   '128_350'                   -> Feld der ERSTEN Quelle (unveraendert)
//   'kundenhaustiere::128_350'  -> Feld einer weiteren Quelle des Bausteins
//
// Warum eine Vorsilbe im String und keine zweite Prop: der Feldcode wohnt an
// zwei voellig verschiedenen Orten — als Prop `<prop>Field` (feste Stellen)
// und als Schluessel IM Listen-Eintrag (`spalten[i].feld`, Anzahl erst zur
// Laufzeit bekannt). Beide halten einen einfachen String, also reist eine
// Vorsilbe durch beide. Eine Parallel-Prop haette bei der Liste gar keinen Ort
// (Regel 10: kein Umbau, wo eine Konvention genuegt).
//
// Abwaertskompatibel per Konstruktion: kein Trenner = erste Quelle. Alte
// Speicherstaende, alte Masken und der Referenzabzug bleiben unberuehrt, es
// gibt KEINE Schema-Migration.

// Trennzeichen zwischen Quellen-id und Feldcode. Quellen-ids duerfen es nicht
// enthalten — dafuer sorgt sanitizeDataSources (dort, nicht hier beim Lesen:
// Eindeutigkeit wird an der Quelle garantiert, nie im Nachhinein erraten).
export const QUELLEN_TRENNER = '::'

// Zerlegtes Bindungsziel. `quelleId: ''` heisst „erste Quelle des Bausteins".
export interface FeldZiel {
  quelleId: string
  code: string
}

// Die EINE Stelle, die einen qualifizierten Bindungswert BAUT.
// Leere Quellen-id -> nackter Feldcode. Die erste Quelle wird NIE qualifiziert:
// sonst gaebe es zwei Schreibweisen fuer dasselbe Ziel, und der Export waere
// nicht mehr deterministisch (Regel 4).
export function bindungMitQuelle(quelleId: string, code: string): string {
  if (quelleId === '' || code === '') return code
  return `${quelleId}${QUELLEN_TRENNER}${code}`
}

// Die EINE Stelle, die einen gespeicherten Bindungswert ZERLEGT.
//
// Defensiv wie die sanitize*-Funktionen: wirft nie. Alles Mehrdeutige —
// mehrfacher Trenner, fuehrender/abschliessender Trenner, leere Haelfte — gilt
// als NICHT qualifiziert und kommt als nackter Code zurueck. Der laeuft dann
// ins Leere (Feld nicht gefunden -> Stelle bleibt leer) und der Preflight sagt
// es im Klartext. Ein handgepfuschter Speicherstand darf den Editor nicht
// anhalten.
export function zerlegeBindung(wert: string): FeldZiel {
  const teile = wert.split(QUELLEN_TRENNER)
  if (teile.length !== 2) return { quelleId: '', code: wert }
  const [quelleId, code] = teile
  if (quelleId === '' || code === '') return { quelleId: '', code: wert }
  return { quelleId, code }
}

// Typgeprüfte bindableSpots: eine Stelle ist nur deklarierbar, wenn ihre
// Bindungs-Prop `<prop>Field` in den defaultProps des Blocks existiert —
// sonst könnten Persistenz und Export die Bindung nicht mitnehmen.
export type BindableSpotProp<Props> = keyof Props extends infer K
  ? K extends BindingProp<infer P> ? P : never
  : never

export type BindableSpotsFor<Props> = ReadonlyArray<{
  prop: BindableSpotProp<Props>
  label: string
}>

// Ereignis eines Blocks (Kommandozentrale Z1, Vorgriff): was bei
// diesem Baustein passieren kann. `name` = Klarname für den Bediener
// („Karte angeklickt"), `key` = Technikwert — das Vokabular des alten
// Editors (onClick/onCardClick/onCardDrop), an dem ab Z2 die
// Aktionsketten hängen. Der Bediener sieht NIE den key.
export interface BlockEventSpec {
  key: string
  name: string
}

// SatzWahl: der Bediener greift an diesem Baustein einen SATZ heraus — Zeile
// anklicken (Tabelle), Karte anklicken (Kanban), Satz im Nachschlage-Fenster
// uebernehmen (Formularfeld).
//
// Das ist die EINE Haelfte des Auswahl-GEBERS. Die andere ist eine wirklich
// angehaengte Datenquelle: ohne Saetze gibt es nichts herauszugreifen. Wer
// Geber IST, wird daraus hergeleitet (istAuswahlGeber in treeQuery) — bis
// 2026-08-06 stand daneben ein absoluter Hand-Schalter `auswahlGeber`, den
// jeder Baustein selbst setzte. Der war falsch in beide Richtungen: das
// Nachschlage-Feld greift offensichtlich einen Satz heraus und stand trotzdem
// nicht in der Geber-Liste, und eine Tabelle OHNE Quelle stand darin, obwohl
// sie nur Platzhalter zeigt — ein Folger haette ihr stumm nie folgen koennen.
export interface SatzWahl {
  // Prop, die die Quelle des herausgegriffenen Satzes traegt. Ohne Angabe die
  // normale Datenquelle des Bausteins ('source'). Das Nachschlage-Feld nennt
  // hier seine ZWEITE Quelle: der uebernommene Satz stammt aus ihr, also holen
  // Folger auch ihre Schluesselfelder von dort.
  quelleProp?: string
  // Nur in diesem Zustand greift der Bediener wirklich einen Satz heraus
  // (Formularfeld: nur beim Feldtyp „Nachschlagen" — sonst tippt er einfach).
  // Ohne Bedingung gilt sie immer (Tabelle/Kanban). DIESELBE Bedingungs-Form
  // und -Auswertung wie visibleWhen der Properties (propertySichtbar): eine
  // zweite Sprache fuer „wann gilt das" waere eine zweite Fehlerquelle.
  wenn?: PropertyVisibilityCondition
}

// KannAuswahlFolgen: der Baustein kann der Auswahl eines Gebers FOLGEN —
// true = in jedem Zustand (Tabelle/Text), mit `wenn` nur in diesem Zustand.
// Das Formularfeld folgt an jedem Feldtyp AUSSER „Nachschlagen": dort
// ENTSTEHT der Wert durch die Auswahl im Fenster — eine Folge obendrauf
// konkurrierte um denselben Wert (dieselbe Begruendung wie beim dort
// versteckten valueField). DIESELBE Bedingungs-Form und -Auswertung wie
// satzWahl.wenn (propertySichtbar): eine zweite Sprache fuer „wann gilt
// das" waere eine zweite Fehlerquelle. Ob ein Baustein GERADE folgen darf,
// beantwortet darfAuswahlFolgen (treeQuery) fuer Inspector, Export und
// Preflight gemeinsam.
export type KannAuswahlFolgen = boolean | { wenn: PropertyVisibilityCondition }

export interface BlockDefinition {
  type: string
  tagName: string
  displayName: string
  category: BlockCategory
  defaultProps: Record<string, unknown>
  customProperties: PropertyDescription[]
  acceptsChildren: boolean
  resizableWidth: boolean
  // true = der Block hat eine einstellbare HÖHE (opt-in): Zieh-
  // Anfasser an der Unterkante; Doppelklick setzt den Block-Standard
  // (z. B. Kanban = verbleibende Höhe/fill) zurück.
  // Der Block muss dafür `height` in seinen defaultProps deklarieren
  // (Kanban: feste Höhe = Karten scrollen im Spaltenrumpf). Default false.
  resizableHeight: boolean
  // Erlaubte Kind-Typen: undefined = alle Typen erlaubt.
  // Kanban-Spalte nimmt z. B. NUR Karten. Durchgesetzt im Store (addBlock/
  // moveNode) und in der Drag-Vorschau — nie per `if type===` in der UI.
  allowedChildTypes?: readonly string[]
  // Gegenrichtung: erlaubte ELTERN-Typen. undefined = überall erlaubt.
  // Karten existieren NUR in Kanban-Spalten, Spalten NUR in Boards — eine
  // Karte lässt sich damit nicht mehr aus dem Kanban auf die Fläche ziehen.
  // Durchgesetzt an derselben EINEN Stelle wie allowedChildTypes (canContain).
  allowedParentTypes?: readonly string[]
  // Festgelegtes Breitenverhalten (opt-in — ersetzt fillMinWidth): die
  // Registry pinnt die Fluss-Breite, die width-Prop des Knotens wird
  // ignoriert; Breite-Anfasser/Inspector-Breite entfallen. Kanban-Spalte:
  // 'fill' (alle Spalten teilen sich die Zeile IMMER gleichmäßig,
  // Entscheidung A), Vorlagen-Kasten: 'auto' (volle Breite in der eigenen
  // Slot-Zeile). undefined = normales width-Verhalten (alle anderen Blöcke).
  lockedWidth?: FlowWidth
  // Teilbaum, mit dem der Block eingefügt wird (Beispieldaten).
  defaultChildren?: readonly DefaultChildSpec[]
  // Feste Fluss-Richtung der Kinder für spezialisierte Container (Kanban-
  // Board = row). Der generische Bereich steuert das weiter über seine
  // `direction`-Prop — siehe resolveChildDirection in flowLayout.
  childDirection?: FlowDirection
  // false = erscheint nicht in der Bibliothek (Kanban-Spalte entsteht nur
  // über das Board). undefined/true = sichtbar.
  showInPalette?: boolean
  // Laufzeit-Vorlage: der Container erzeugt seine Laufzeit-Kinder
  // aus der ERSTEN Nachfahren-Karte dieses Typs (Baumreihenfolge; seRuntime
  // klont sie je Datenzeile). Der Editor markiert genau diese Karte dezent
  // mit dem Label (Editor-Hilfe im BlockHost, nie im Export).
  templateChild?: { type: string; label: string }
  // false = keine gestrichelte Editor-Hilfe um den Container (Blöcke mit
  // eigenem sichtbarem Rahmen wie Kanban/Spalte). undefined/true = Hilfe an.
  containerHint?: boolean
  // Editor-Hilfe "Plus-Knopf" am Container: fügt einen Kind-Block dieses
  // Typs ans Ende ein (Kanban: "+ Spalte", Spalte: "+ Karte").
  addChildButton?: { label: string; childType: string }
  // true = an den Block lässt sich eine Datenquelle hängen. Der Block
  // trägt dann eine `source`-Prop (Technikwert =
  // Vorlagen-id aus core/data/dataSources); der Inspector zeigt die Sektion
  // "Daten", der Export erzeugt daraus den SEFILELOOP. Kein `if type===`.
  acceptsDataSource?: boolean
  // Der Bediener greift an diesem Baustein einen SATZ heraus — siehe SatzWahl.
  satzWahl?: SatzWahl
  // Der Block kann der Auswahl eines Gebers FOLGEN (Prop `folgtAuswahl`,
  // core/data/auswahlFolge): mit Auswahl zeigt er nur die Zeilen, deren
  // Schluesselfelder zur gewaehlten Zeile passen — ohne Auswahl alles.
  // Inspector zeigt dann die Sektion „Auswahl folgen". Zustands-Bedingung:
  // siehe KannAuswahlFolgen.
  kannAuswahlFolgen?: KannAuswahlFolgen
  // Bindbare Stellen des Blocks — siehe BindableSpot.
  bindableSpots?: readonly BindableSpot[]
  // Aktuelle Bausteinwerte, die als Parameterquelle angeboten werden.
  actionValueSpots?: readonly ActionValueSpot[]
  // Bindbare Liste (Tabellen-Spalten) — siehe ListenBindung.
  listenBindung?: ListenBindung
  // Ereignisse des Blocks — siehe BlockEventSpec. undefined = der
  // Baustein löst keine Ereignisse aus (erscheint nicht in der Zentrale).
  blockEvents?: readonly BlockEventSpec[]
  // true = der Block ist eine SEITE der Maske (Popup): er liegt
  // als Kind der Wurzel im Baum (Persistenz/Undo/Export laufen generisch
  // mit), erscheint aber NIE im Fluss der Hauptseite — der Canvas zeigt ihn
  // nur als eigenen Seiten-Reiter. Kein `if type===`: Editor.childNodesOf
  // und die Seitenleiste lesen ausschließlich dieses Kennzeichen.
  pageBlock?: boolean
  // Raster-Start-/Mindestgröße auf der Maskenfläche (opt-in, Regel 2): der
  // Store vergibt beim Einfügen die Startgröße, Canvas/Export lesen die
  // Position generisch über rasterLayout. Fehlt die Deklaration, gilt der
  // generische RASTER_FALLBACK. Wirkt NUR auf der Rasterfläche (oberste Ebene
  // + Popup-Rumpf) — INNERHALB von Containern gilt weiter flowLayout.
  raster?: Partial<RasterSpec>
}
