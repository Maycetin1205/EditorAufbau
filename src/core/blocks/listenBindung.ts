// listenBindung — die Registry-Faehigkeit „bindbare Liste" samt allem, was der
// generische Code zum Lesen eines Listen-Eintrags braucht.
//
// Aus BlockDefinition herausgeloest (2026-08-06), weil die Datei mit den
// Zusatzfeldern der Spalten-Arten ueber den 500-Zeilen-Deckel wuchs
// (check:regeln). Der Schnitt ist der natuerliche: hier EIN Thema — wie eine
// Liste von Eintraegen an Felder gebunden und je Eintrag eingestellt wird —,
// drueben der Rest der Baustein-Beschreibung. BlockDefinition gibt alles hier
// unveraendert weiter, damit keine Import-Zeile im Projekt umgeschrieben
// werden muss.
//
// Kennt KEINEN Baustein (Regel 2): dass es „Spalten" sind, weiss nur der
// Registry-Eintrag der Tabelle.

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
  // Optional: eine WAHL je Listen-Eintrag, die der Picker zusaetzlich zur
  // Feldliste anbietet (Tabelle: die Darstellung einer Spalte — Text, Zahl,
  // Datum, Status). Registry-Daten: der Picker zeichnet sie generisch und
  // weiss nicht, worum es geht — er kennt weder „Tabelle" noch „Spalte"
  // (Regel 2). Fehlt der Eintrag, bietet der Picker wie bisher nur Felder an.
  eintragsWahl?: EintragsWahl
  // Optional: eine ZUORDNUNGSTABELLE je Listen-Eintrag (Tabelle: was ein
  // Status-Datenwert bedeutet). Wie eintragsWahl reine Registry-Daten — der
  // Picker zeichnet Zeilen aus Datenwert, Klarname und einer Bedeutung und
  // weiss nicht, wovon sie handeln.
  eintragsZuordnung?: EintragsZuordnung
}

export interface EintragsZuordnung {
  // Schluessel IM Eintrag, unter dem die Liste steht (Tabelle: 'zuordnung').
  key: string
  label: string
  // Nur anbieten, wenn die eintragsWahl auf diesem Wert steht (Tabelle:
  // 'status'). Eine Zuordnung an einer Textspalte waere sinnlos, und der
  // Picker soll nicht mit Feldern zugestellt sein, die nichts tun.
  nurBeiWahl: string
  // Beschriftungen der drei Spalten einer Zeile.
  wertLabel: string
  nameLabel: string
  bedeutungLabel: string
  // Die waehlbaren Bedeutungen (Technikwert -> Klarname). Die FARBE haengt
  // fest an der Bedeutung und ist nirgends waehlbar — darum stehen hier
  // Bedeutungen und keine Farben.
  bedeutungen: readonly { wert: string; name: string }[]
}

export interface EintragsWahl {
  // Schluessel IM Eintrag, unter dem der Technikwert steht (Tabelle: 'art').
  key: string
  // Beschriftung des Abschnitts im Picker (Tabelle: 'Darstellung').
  label: string
  // Technikwert -> Klarname. Sichtbar ist NUR der Klarname (Regel 3).
  optionen: readonly EintragsWahlOption[]
  // Was gilt, wenn im Eintrag nichts (oder Unbekanntes) steht.
  standard: string
  // Schluessel IM Eintrag, unter dem die Zusatz-Feldbindungen der gewaehlten
  // Option als Record stehen (Tabelle: 'felder'). Nur noetig, wenn ueberhaupt
  // eine Option `felder` deklariert.
  felderKey?: string
}

// Eine waehlbare Option — und was sie zusaetzlich braucht.
//
// `felder` ist der Grund, warum eine Option mehr ist als ein Paar aus
// Technikwert und Klarname (2026-08-06): manche Darstellungen brauchen MEHRERE
// Werte aus derselben Datenzeile. Die Tabellen-Spalte „Bild + Name" zeigt drei
// — ihr eigenes Feld ist der Name, dazu kommen Bild und Unterzeile. Der Picker
// bietet diese Felder nur an, solange DIESE Option gewaehlt ist, und schreibt
// sie unter `felderKey` in den Eintrag. Reine Registry-Daten: er weiss nicht,
// was ein Bild ist (Regel 2).
export interface EintragsWahlOption {
  wert: string
  name: string
  felder?: readonly { key: string; label: string }[]
}

// Eine Zeile der Zuordnungstabelle, wie der Picker sie kennt. Der Baustein
// bringt seine eigene, deckungsgleiche Form mit (Tabelle: Zuordnung) — der
// generische Code braucht davon nur diese drei Felder.
export interface ZuordnungZeile {
  wert: string
  name: string
  bedeutung: string
}

// Der gerade gewaehlte Wert eines Listen-Eintrags — leer/unbekannt faellt auf
// den Standard zurueck, damit im Picker immer genau eine Option markiert ist.
export function eintragsWahlWert(w: EintragsWahl, eintrag: Record<string, unknown>): string {
  const roh = eintrag[w.key]
  return typeof roh === 'string' && w.optionen.some((o) => o.wert === roh) ? roh : w.standard
}

// Die Zuordnungszeilen eines Listen-Eintrags defensiv lesen (nie werfen):
// fehlt der Schluessel oder steht Unsinn darin, ist die Liste leer. Fehlende
// Einzelfelder werden zu '' ergaenzt, damit der Picker sie anzeigen und
// nachtragen kann — eine halbfertige Zeile zu verwerfen naehme dem Bediener
// wortlos seine Eingabe weg.
export function eintragsZuordnungLesen(
  z: EintragsZuordnung,
  eintrag: Record<string, unknown>,
): ZuordnungZeile[] {
  const roh = eintrag[z.key]
  if (!Array.isArray(roh)) return []
  return roh
    .filter((r): r is Record<string, unknown> => Boolean(r) && typeof r === 'object')
    .map((r) => ({
      wert: typeof r.wert === 'string' ? r.wert : '',
      name: typeof r.name === 'string' ? r.name : '',
      bedeutung: typeof r.bedeutung === 'string' ? r.bedeutung : '',
    }))
}

// Welche Zusatzfelder die GERADE gewaehlte Option verlangt (leer, wenn keine).
export function eintragsFelderVon(
  w: EintragsWahl,
  eintrag: Record<string, unknown>,
): readonly { key: string; label: string }[] {
  const wert = eintragsWahlWert(w, eintrag)
  return w.optionen.find((o) => o.wert === wert)?.felder ?? []
}

// Die Zusatz-Feldbindungen eines Listen-Eintrags defensiv lesen (nie werfen):
// fehlt der Schluessel oder steht Unsinn darin, ist nichts gebunden. Dieselbe
// Haltung wie eintragsZuordnungLesen — ein alter Stand oder ein von Hand
// verstelltes Attribut darf nie den Editor anhalten.
export function eintragsFelderLesen(
  w: EintragsWahl,
  eintrag: Record<string, unknown>,
): Record<string, string> {
  const roh = w.felderKey === undefined ? undefined : eintrag[w.felderKey]
  if (!roh || typeof roh !== 'object' || Array.isArray(roh)) return {}
  const raus: Record<string, string> = {}
  for (const [k, v] of Object.entries(roh as Record<string, unknown>)) {
    if (typeof v === 'string') raus[k] = v
  }
  return raus
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

