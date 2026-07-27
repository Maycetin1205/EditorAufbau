// datumSchluessel — die EINE Stelle, die zwei Datums-Schreibweisen versoehnt.
//
// SoftEngine liefert Datumswerte deutsch ('27.07.2026'), das Datumsfeld im
// Browser (input type=date) arbeitet ausschliesslich ISO ('2026-07-27').
// Ohne Uebersetzer vergleicht der Tagesfilter Aepfel mit Birnen und findet
// GARANTIERT nie einen Treffer — genau daran scheitert so ein Filter still.
//
// Der SCHLUESSEL ist immer ISO ('JJJJ-MM-TT'): so ist er sortierbar,
// vergleichbar und direkt der Wert des Datumsfelds. '' heisst „kein Tag"
// (kein Filter) und ist nie geraten.
//
// Reine Funktionen ohne Zustand und ohne DOM — pruefbar ohne Browser.
// Vorbild ist dateKey/addDays der echten Empfang-Maske (behandlung-umbau).

// Datumswert -> Schluessel. Nimmt deutsch ('27.07.2026'), ISO
// ('2026-07-27') und beides mit angehaengter Uhrzeit; alles andere -> ''.
export function tagSchluessel(wert: unknown): string {
  const s = String(wert ?? '').trim()
  if (s === '') return ''
  const deutsch = /^(\d{1,2})\.(\d{1,2})\.(\d{4})/.exec(s)
  if (deutsch) {
    return `${deutsch[3]}-${deutsch[2].padStart(2, '0')}-${deutsch[1].padStart(2, '0')}`
  }
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s)
  return iso ? `${iso[1]}-${iso[2]}-${iso[3]}` : ''
}

// Schluessel des heutigen Tages aus der ORTSZEIT (nicht toISOString: das
// rechnet nach UTC um und liefert abends den falschen Tag).
export function heuteSchluessel(now: Date): string {
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${mm}-${dd}`
}

// Tage dazuzaehlen bzw. abziehen ('2026-07-31' + 1 -> '2026-08-01').
// Ungueltiger Schluessel -> '' (nie raten).
export function tagPlus(schluessel: string, tage: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(schluessel)
  if (!m) return ''
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  d.setDate(d.getDate() + tage)
  return heuteSchluessel(d)
}
