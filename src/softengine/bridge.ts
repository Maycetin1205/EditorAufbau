// softengine/bridge (U3, aus blocks/kanban/seRuntime.ts, Phase 2)
// Anbindung an SoftEngine: anmelden, geschobene Daten annehmen, Diagnose —
// und die EINZIGE strukturelle Naht der Schicht (onData): wer auf frische
// SE-Daten reagieren will, abonniert hier. Die Bridge ruft die Abonnenten
// nach jedem Push bzw. über die SE-Einstiegspunkte — sie kennt dabei KEINEN
// Baustein (Abhängigkeitsregel: Baustein → Schicht, nie zurück).
//
// SoftEngine SCHIEBT die Daten — die Maske meldet sich per basisHTML_REGISTER
// an (Retry-Schleife 25ms x 400) bzw. empfaengt das message-Event und setzt
// SEDATA.Daten SELBST. Exakt nach der verbindlichen Referenz behandlung-umbau
// empfang/index.basis.source.html BLOCK 1/9 (regSE + __seConsume,
// Commit 45a8027 Z. 680-709) + altem Editor (runtime/boot.ts,
// installMessageHook). Der Poll bleibt nur als Fallback fuer Umgebungen,
// die SEDATA direkt stellen (Tests, alte Einbettungen).

import { isRecord, seGlobal, type UnknownRecord } from './types'

// ---------- SE-Verfuegbarkeit + Schnittstelle ----------

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

// ---------- Nutzlast aus einem Push/Event ziehen ----------

// Daten aus einem geschobenen SE-Paket ziehen (Push-Weg): SoftEngine
// liefert an den REGISTER-Callback einen String ODER ein Objekt (Referenz
// __seConsume). Akzeptiert wird nur ein Paket mit Daten in einer belegten
// Form — SEFileLoop/ErpApiCall (Referenzmaske) oder Tabellen (alter
// Editor); alles andere (GET-Antworten, fremde Events) -> undefined.
export function payloadDaten(raw: unknown): UnknownRecord | undefined {
  let data = raw
  if (typeof data === 'string') {
    try { data = JSON.parse(data) } catch { return undefined }
  }
  if (!isRecord(data) || !isRecord(data.Daten)) return undefined
  const daten = data.Daten
  if (!daten.SEFileLoop && !daten.Tabellen && !daten.ErpApiCall) return undefined
  return daten
}

// Nutzlast aus einem message-Event ziehen (Fallback ohne basisHTML_REGISTER):
// SoftEngine/Elternfenster senden { MSG: { DATA } }, event.data als String
// oder Objekt (Referenz Block 1/9 + alter Editor). Kein MSG -> undefined
// (fremdes Event, z.B. von Devtools/Playwright).
export function messagePayload(eventData: unknown): unknown {
  let d = eventData
  if (typeof d === 'string') {
    try { d = JSON.parse(d) } catch { return undefined }
  }
  if (!isRecord(d) || !isRecord(d.MSG)) return undefined
  return d.MSG.DATA
}

// ---------- Diagnose (Phase 2) ----------

// Diagnose-Ausgabe (Beifang fuer das geparkte "Stellen leer"-Problem):
// das ERSTE angenommene SE-Paket wird roh in eine versteckte Textarea
// gelegt — Strg+Alt+D blendet sie ein, der Bediener kann den Inhalt ohne
// Konsole kopieren. Reines Diagnose-Werkzeug fuer Phase 2, unsichtbar,
// darf die Maske nie stoeren; fliegt raus, sobald der Datenpfad steht.
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
  } catch { /* Diagnose darf nie stoeren */ }
}

// ---------- Naht: Abonnenten fuer frische SE-Daten ----------

type DataListener = () => void
const dataListeners = new Set<DataListener>()

// Wer auf frische SE-Daten reagieren will (z. B. der Kanban-Board-Hydrierer),
// meldet sich hier an; Rueckgabe = Abmelde-Funktion. Die Bridge ruft die
// Abonnenten nach jedem angenommenen Push und ueber die SE-Einstiegspunkte
// Erstellen/ReloadData.
export function onData(fn: DataListener): () => void {
  dataListeners.add(fn)
  return () => { dataListeners.delete(fn) }
}

function notifyData(): void {
  for (const fn of [...dataListeners]) fn()
}

// ---------- Push-Empfang + Anmeldung ----------

// Ein geschobenes SE-Paket annehmen: SEDATA.Daten SELBST setzen (exakt wie
// __seConsume der Referenz), Datenbasis auffrischen, Abonnenten benachrichtigen.
// Jeder weitere Push aktualisiert erneut — das ist der Live-Weg von SoftEngine
// (der Poll feuerte nur einmal).
function seConsume(raw: unknown): void {
  const daten = payloadDaten(raw)
  if (!daten) return
  const g = seGlobal()
  if (!isRecord(g.SEDATA)) g.SEDATA = {}
  g.SEDATA.Daten = daten
  dumpDiagnose(raw)
  refreshDataBasis()
  notifyData()
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
// zusaetzlich auf direkt gestelltes SEDATA warten (Poll, nur Fallback).
export function startBridge(): void {
  if (booted) return
  booted = true
  tryInitSe()
  const g = seGlobal()
  g.Erstellen = () => { refreshDataBasis(); notifyData() }
  g.initData = g.Erstellen
  g.ReloadData = () => notifyData()
  registerSe()
  // message-Fallback NUR ohne Register-Weg (Referenz: sonst kaeme jedes
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
      notifyData()
    } else if (tries > 100) {
      clearInterval(poll)
    }
  }, 300)
}
