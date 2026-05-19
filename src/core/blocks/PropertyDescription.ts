// PropertyDescription
// Beschreibt EINE editierbare Eigenschaft eines Blocks.
// Der Inspector liest customProperties() der selektierten Block-Instanz
// und baut daraus dynamisch die Editier-Controls (Mantine-Inputs).
// Vorlage: Notiz Woche 2.

export interface PropertyDescription {
  attributeName: string
  name: string
  description: string
  isArray: boolean
  maxLength: number
}
