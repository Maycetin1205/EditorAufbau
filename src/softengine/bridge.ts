// softengine/bridge — Anmeldung, Daten-Push, Diagnose
//
// Teil der gemeinsamen SoftEngine-Schicht (Umzug 2026-07-15 aus
// blocks/kanban/seRuntime.ts, verhaltensgleich): der EINE Anschluss der
// exportierten Maske an SoftEngine. SoftEngine SCHIEBT die Daten — die
// Maske meldet sich per basisHTML_REGISTER an (Retry-Schleife 25ms x 400)
// bzw. empfängt das message-Event und setzt SEDATA.Daten SELBST. Exakt
// nach der verbindlichen Referenz behandlung-umbau
// empfang/index.basis.source.html BLOCK 1/9 (regSE + __seConsume) + altem
// Editor (runtime/boot.ts). Der Poll bleibt nur als Fallback für
// Umgebungen, die SEDATA direkt stellen (Tests, alte Einbettungen).
//
// Der ABO-PUNKT ist die einzige strukturelle Änderung des Umzugs: statt
// fest „hydriere alle Boards" zu rufen, klingelt die Brücke bei jedem
// angenommenen Daten-Push alle angemeldeten Zuhörer (heute: die
// Kanban-Boards; später melden sich Formularfelder/Tabelle einfach
// zusätzlich an — am Empfang wird dafür nie wieder gebaut).
//
// Abhängigkeitsregel der Schicht: Bausteine importieren src/softengine/*,
// diese Schicht kennt NIE einen Baustein.

import { isRecord, messagePayload, payloadDaten } from './data'

/* eslint-disable @typescript-eslint/no-explicit-any -- SEDATA/selib sind
   fremde, untypisierte SoftEngine-Globals (Formen siehe Referenzmaske). */
export function seGlobal(): any {
  return globalThis as any
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function hasSeData(): boolean {
  const g = seGlobal()
  return isRecord(g.SEDATA) && isRecord(g.SEDATA.Daten)
}

// Schnittstelle initialisieren — exakt die Aufrufe der Referenzmaske; alle
// optional, weil sie nur in SoftEngine existieren.
function tryInitSe(): void {
  const g = seGlobal()
  try { g.selib?.Json?.InitializeERPConnection?.() } catch { /* nicht in SE */ }
  try { if (typeof g.InitialisiereSchnittstelle === 'function') g.InitialisiereSchnittstelle() } catch { /* s.o. */ }
}

function refreshDataBasis(): void {
  const g = seGlobal()
  try { if (typeof g.ResetDataBasis === 'function') g.ResetDataBasis() } catch { /* nicht in SE */ }
  try { if (typeof g.InitialisiereDatenBasis === 'function') g.InitialisiereDatenBasis() } catch { /* s.o. */ }
}

// ---------- Abo-Punkt ----------

const zuhoerer = new Set<() => void>()

// Zuhörer anmelden: wird bei JEDEM angenommenen Daten-Push (und den
// SE-Einstiegspunkten Erstellen/initData/ReloadData) gerufen. Die Zuhörer
// prüfen selbst, ob Daten da sind (hasSeData) — wie bisher hydrateAll.
export function onSeDaten(cb: () => void): void {
  zuhoerer.add(cb)
}

function klingeln(): void {
  zuhoerer.forEach((cb) => cb())
}

// ---------- Diagnose ----------

// Diagnose-Ausgabe: das ERSTE angenommene SE-Paket wird roh in eine
// versteckte Textarea gelegt — Strg+Alt+D blendet sie ein, der Bediener
// kann den Inhalt ohne Konsole kopieren. Reines Diagnose-Werkzeug,
// unsichtbar, darf die Maske nie stören.
let diagnoseDumped = false
function dumpDiagnose(raw: unknown): void {
  if (diagnoseDumped) return
  diagnoseDumped = true
  try {
    const text = typeof raw === 'string' ? raw : JSON.stringify(raw)
    const ta = document.createElement('textarea')
    ta.id = 'ff-se-diagnose'
    ta.readOnly = true
    ta.value = text ?? ''
    ta.style.cssText = 'display:none;position:fixed;left:8px;right:8px;bottom:8px;'
      + 'height:40vh;z-index:99999;font:11px monospace;'
    document.body.appendChild(ta)
  } catch { /* Diagnose darf nie stören */ }
}

// ---------- SE-Push-Empfang ----------

// Ein geschobenes SE-Paket annehmen: SEDATA.Daten SELBST setzen (exakt wie
// __seConsume der Referenz), Datenbasis auffrischen, Zuhörer klingeln.
// Jeder weitere Push aktualisiert erneut — das ist der Live-Weg von
// SoftEngine (der Poll feuerte nur einmal).
function seConsume(raw: unknown): void {
  const daten = payloadDaten(raw)
  if (!daten) return
  const g = seGlobal()
  if (!isRecord(g.SEDATA)) g.SEDATA = {}
  g.SEDATA.Daten = daten
  dumpDiagnose(raw)
  refreshDataBasis()
  klingeln()
}

// Bei SoftEngine anmelden: Retry-Schleife wie regSE der Referenz (25ms x
// 400 = 10s), denn die Bridge-Funktion erscheint erst, wenn SE sein
// Framework injiziert hat. basisHTML_SetConsoleLog wie die Referenz —
// JS-Logs landen damit im SE-Protokoll.
function registerSe(tries = 0): void {
  const g = seGlobal()
  if (typeof g.basisHTML_REGISTER === 'function') {
    try { g.basisHTML_SetConsoleLog?.(true, true) } catch { /* optional */ }
    try {
      g.basisHTML_REGISTER((data: unknown) => { seConsume(data) }, document.title, '1.0')
    } catch { /* nicht in SE */ }
    return
  }
  if (tries < 400) setTimeout(() => { registerSe(tries + 1) }, 25)
}

let booted = false

// Einmal pro Maske: Schnittstelle starten, bei SE anmelden (Push),
// message-Fallback + Diagnose-Taste verdrahten, Einstiegspunkte anbieten,
// zusätzlich auf direkt gestelltes SEDATA warten (Poll, nur Fallback).
// Idempotent — jeder Konsument darf rufen, gestartet wird einmal.
export function bootSe(): void {
  if (booted) return
  booted = true
  tryInitSe()
  const g = seGlobal()
  g.Erstellen = () => { refreshDataBasis(); klingeln() }
  g.initData = g.Erstellen
  g.ReloadData = () => { klingeln() }
  registerSe()
  // message-Fallback NUR ohne Register-Weg (Referenz: sonst käme jedes
  // Paket doppelt an); capture wie Referenz + alter Editor.
  window.addEventListener('message', (evt) => {
    if (typeof seGlobal().basisHTML_REGISTER === 'function') return
    const payload = messagePayload(evt.data)
    if (payload !== undefined) seConsume(payload)
  }, true)
  // Strg+Alt+D: Diagnose-Textarea ein-/ausblenden (s. dumpDiagnose).
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'd') {
      const ta = document.getElementById('ff-se-diagnose')
      if (ta) ta.style.display = ta.style.display === 'none' ? 'block' : 'none'
    }
  })
  let tries = 0
  const poll = setInterval(() => {
    tries += 1
    if (hasSeData()) {
      clearInterval(poll)
      refreshDataBasis()
      klingeln()
    } else if (tries > 100) {
      clearInterval(poll)
    }
  }, 300)
}
