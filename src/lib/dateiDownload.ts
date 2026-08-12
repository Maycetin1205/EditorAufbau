// dateiDownload — DIE eine Stelle, die dem Bediener eine Datei hinlegt.
//
// Aus Toolbar.tsx herausgeloest (A3, 2026-08-10) fuer die inzwischen restlos
// entfernte Sperransicht. Verhaltensgleich uebernommen, inklusive der zwei
// Stolpersteine, die hier schon teuer gelernt wurden.

export function downloadFile(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  // Der Anker MUSS im Dokument haengen: ein programmatischer Klick auf ein
  // loses Element loest in Firefox keinen Download aus — die Datei kaeme
  // wortlos nicht, und der Bediener stuende ohne Maske da.
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Die Blob-URL erst NACH diesem Zyklus freigeben. Ein revoke direkt hinter
  // click() zieht dem gerade gestarteten Download bei groesseren Dateien die
  // Quelle unter den Fuessen weg (bekanntes Timing-Risiko, v. a. Firefox);
  // dass es meistens gutgeht, macht es nicht richtig.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
