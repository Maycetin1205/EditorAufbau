import { zeilePasst } from '../shared/textSuche'

export { zeilePasst }

export function passendeIndizes(
  zeilen: readonly (readonly string[])[],
  suchtext: string,
): number[] {
  const raus: number[] = []
  zeilen.forEach((z, i) => {
    if (zeilePasst(z, suchtext)) raus.push(i)
  })
  return raus
}

export function zeigtEchteDaten(imEditor: boolean, source: string): boolean {
  return !imEditor && source.trim() !== ''
}

export function zeigtLeerzustand(
  hatQuelle: boolean,
  datenGeliefert: boolean,
  zeilen: number,
): boolean {
  return hatQuelle && datenGeliefert && zeilen === 0
}

export function datensatzText(args: {
  hatQuelle: boolean
  sichtbar: number
  gesamt: number
  suchtAktiv: boolean
  auswahlAktiv?: boolean
}): string {
  if (!args.hatQuelle) return '— Datensätze'
  const zusatz = args.auswahlAktiv ? ' · durch Auswahl gefiltert' : ''

  const wort = (n: number): string => (n === 1 ? 'Datensatz' : 'Datensätze')
  const wortDativ = (n: number): string => (n === 1 ? 'Datensatz' : 'Datensätzen')
  if (!args.suchtAktiv) {
    return (args.gesamt === 0 ? 'Keine Datensätze' : `${args.gesamt} ${wort(args.gesamt)}`) + zusatz
  }
  if (args.sichtbar === 0) return `Kein Treffer von ${args.gesamt} ${wortDativ(args.gesamt)}` + zusatz
  return `${args.sichtbar} von ${args.gesamt} ${wortDativ(args.gesamt)}` + zusatz
}
