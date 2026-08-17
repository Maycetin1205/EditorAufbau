// softengine/bridge — Anmeldung und Daten-Push
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
// meldung importiert selbst NICHTS — kein Kreis zurueck auf bridge.
import { meldeFehler } from './meldung'

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
const antwortZuhoerer = new Set<(raw: unknown) => void>()

// Zuhörer anmelden: wird bei JEDEM angenommenen Daten-Push (und den
// SE-Einstiegspunkten Erstellen/initData/ReloadData) gerufen. Die Zuhörer
// prüfen selbst, ob Daten da sind (hasSeData) — wie bisher hydrateAll.
export function onSeDaten(cb: () => void): void {
  zuhoerer.add(cb)
}

// Rohantworten aus dem registrierten SoftEngine-Callback. Das offizielle
// basisHTML-Interface hat an dieser Stelle BWMSG (BüroWARE/WinUI) und WWMSG
// (WEBWARE) bereits identisch auf MSG.DATA reduziert. Konsumenten dürfen
// deshalb nie selbst auf einen der beiden Transportnamen lauschen.
export function onSeAntwort(cb: (raw: unknown) => void): () => void {
  antwortZuhoerer.add(cb)
  return () => { antwortZuhoerer.delete(cb) }
}

function klingeln(): void {
  zuhoerer.forEach((cb) => cb())
}

// Der Relation-Lader (Welle R) speist geholte Zeilen ein und klingelt danach
// über DENSELBEN Abo-Punkt wie ein Daten-Push: ALLE Bausteintypen zeichnen
// neu, keiner kennt den Lader. (Hätte der Lader nur „seinen" Anschluss
// geklingelt, sähe eine Tabelle die Positionen und das Formularfeld daneben
// nicht — genau der halbe Neuzeichnen-Fehler, den der Abo-Punkt verhindert.)
export function meldeNeueDaten(): void {
  klingeln()
}

function antwortKlingeln(raw: unknown): void {
  antwortZuhoerer.forEach((cb) => {
    try { cb(raw) } catch { /* ein Konsument darf den Empfang nie stoppen */ }
  })
}

// ---------- SE-Push-Empfang ----------

// Ein geschobenes SE-Paket annehmen: SEDATA.Daten SELBST setzen (exakt wie
// __seConsume der Referenz), Datenbasis auffrischen, Zuhörer klingeln.
// Jeder weitere Push aktualisiert erneut — das ist der Live-Weg von
// SoftEngine (der Poll feuerte nur einmal).
//
// Bis 2026-08-17 hing hier eine versteckte Diagnose-Textarea (Strg+Alt+D) mit
// dem rohen ERSTEN Paket. Auf Nutzer-Ansage restlos entfernt: sie schrieb bei
// JEDEM Ereignis ihren ganzen Inhalt neu — samt dem kompletten Rohpaket, das
// niemand ansah — und das mitten im Maskenstart. Nicht wieder einbauen; was
// beim Scheitern wirklich gebraucht wird, sagt der Fehlerbalken (meldeFehler).
function seConsume(raw: unknown): void {
  const daten = payloadDaten(raw)
  if (!daten) {
    antwortKlingeln(raw)
    return
  }
  const g = seGlobal()
  if (!isRecord(g.SEDATA)) g.SEDATA = {}
  g.SEDATA.Daten = daten
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
    } catch (error) {
      meldeFehler(
        'SoftEngine-Anmeldung fehlgeschlagen: '
        + (error instanceof Error ? error.message : String(error)),
      )
    }
    return
  }
  if (tries < 400) {
    setTimeout(() => { registerSe(tries + 1) }, 25)
  } else {
    // Bis 2026-08-05 stand das NUR in der versteckten Diagnose: die Maske sah
    // fertig aus, blieb aber fuer immer ohne Daten, und niemand erfuhr warum
    // (Regel 4). Jetzt sagt es der Balken.
    meldeFehler('SoftEngine-Anschluss nicht gefunden — die Maske bleibt ohne Daten.')
  }
}

let booted = false

// Einmal pro Maske: Schnittstelle starten, bei SE anmelden (Push),
// message-Fallback verdrahten, Einstiegspunkte anbieten,
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
  let tries = 0
  const poll = setInterval(() => {
    tries += 1
    if (hasSeData()) {
      clearInterval(poll)
      refreshDataBasis()
      klingeln()
    } else if (tries > 100) {
      clearInterval(poll)
      meldeFehler('Keine Daten von SoftEngine empfangen — die Maske zeigt nichts an.')
    }
  }, 300)
}
