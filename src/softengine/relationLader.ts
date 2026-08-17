import { meldeNeueDaten } from './bridge'
import { getField, type RuntimeLadeRelation } from './data'
import { geholteZeilenFuer, setzeGeholteZeilen } from './geholteZeilen'
import { executeRelation } from './relations'
import { meldeFehler } from './meldung'

const MAX_POSITIONEN = 999

const SCHNITT_POS = '0'
const SCHNITT_LEN = '255'

export interface HolQuelle {
  id: string
  name: string
}

const generationen = new Map<string, number>()

function leereQuelle(name: string): void {
  const vorher = geholteZeilenFuer(name)
  setzeGeholteZeilen(name, [])
  if (vorher !== undefined && vorher.length > 0) meldeNeueDaten()
}

async function frage(
  lade: RuntimeLadeRelation,
  schluessel: { belegart: string; belegnummer: string; jahr: string; archiv: string },
  posNr: number,
  pos: string,
  len: string,
): Promise<string> {
  const antwort = await executeRelation(
    { id: 'relation-lader', verb: 'GET_RELATION', nr: lade.nr, params: [] },
    [
      schluessel.belegart,
      pos,
      len,
      schluessel.belegnummer,
      schluessel.jahr,
      schluessel.archiv,
      '',
      String(posNr),
      '',
      '',
      '',
      '',
    ],
    { still: true, satzAntwort: true },
  )
  return antwort.wert
}

export function ladeZeilenPerRelation(
  quelle: HolQuelle,
  lade: RuntimeLadeRelation,
  geberZeile: unknown,
): void {
  const gen = (generationen.get(quelle.id) ?? 0) + 1
  generationen.set(quelle.id, gen)

  if (geberZeile === undefined) {
    leereQuelle(quelle.name)
    return
  }

  const schluessel = {
    belegart: getField(geberZeile, lade.belegartFeld),
    belegnummer: getField(geberZeile, lade.belegnummerFeld),

    jahr: lade.jahrFeld === '' ? '' : getField(geberZeile, lade.jahrFeld),
    archiv: lade.archivFeld === '' ? '' : getField(geberZeile, lade.archivFeld),
  }

  if (schluessel.belegart === '' || schluessel.belegnummer === '') {
    leereQuelle(quelle.name)
    return
  }

  leereQuelle(quelle.name)

  void (async () => {
    const zeilen: Record<string, string>[] = []
    let endeGesehen = false

    for (let posNr = 1; posNr <= MAX_POSITIONEN; posNr += 1) {
      const satz = await frage(lade, schluessel, posNr, SCHNITT_POS, SCHNITT_LEN)
      if (generationen.get(quelle.id) !== gen) return

      if (lade.endeFelder.every((feld) => getField({ SATZ: satz }, feld) === '')) {
        endeGesehen = true
        break
      }

      const zeile: Record<string, string> = { SATZ: satz }
      for (const feld of lade.zusatzFelder) {
        const trenner = feld.indexOf('_')
        const wert = await frage(
          lade,
          schluessel,
          posNr,
          feld.slice(0, trenner),
          feld.slice(trenner + 1),
        )
        if (generationen.get(quelle.id) !== gen) return
        zeile[feld] = wert
      }
      zeilen.push(zeile)
    }

    if (!endeGesehen) {
      meldeFehler(
        `Positionen laden: nach ${MAX_POSITIONEN} Zeilen ohne Ende-Kennung abgebrochen `
        + `(Relation Nr. ${lade.nr}) — die Liste ist wahrscheinlich unvollständig, `
        + 'vermutlich passen Relationsnummer oder Ende-Felder nicht.',
      )
    }

    if (generationen.get(quelle.id) === gen) {
      setzeGeholteZeilen(quelle.name, zeilen)
      meldeNeueDaten()
    }
  })()
}
