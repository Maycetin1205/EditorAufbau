// holendeQuellen — der AUSLÖSER der Welle R („Zeilen per Relation holen").
//
// Wechselt irgendwo in der Maske die Auswahl, prüft dieses Modul für jede
// HOLENDE Quelle (FF_DATA_SOURCES-Eintrag mit ladeRelation), ob sich die
// gewählte Zeile IHRER Geber-Quelle geändert hat — und stößt dann den
// Relation-Lader an (softengine/relationLader).
//
// Warum hier und nicht in softengine: der Auswahl-Zustand wohnt in der
// Baustein-Schicht (shared/auswahl), und die SoftEngine-Schicht kennt NIE
// einen Baustein — dieselbe Schichtregel wie `gewaehlteZeile` in
// RuntimeActionValues (relations.ts). Der Lader bekommt die Zeile fertig
// hereingereicht.
//
// Geber-Zuordnung: die Hol-Relation nennt eine Geber-QUELLE, der
// Auswahl-Zustand ist aber je Geber-BAUSTEIN abgelegt (data-ff-id).
// Die Brücke ist das Markup des Exports: Auswahl-Geber tragen ihre Baum-id
// als data-ff-id und ihre Quelle als source-Attribut (exportMask). Das
// deckt alle heutigen Zeilen-Geber (Tabelle, Kanban). Ein Nachschlage-FELD
// als Geber einer holenden Quelle trägt seine Nachschlage-Quelle NICHT als
// source — dieser Fall bleibt leer, bis ihn ein echter Auftrag erzwingt
// (Regel 10).
//
// Wiederholungsschutz (JSON-Abdruck, Muster auswahl/merkmalVon): geladen
// wird NUR, wenn sich die gewählte GEBER-Zeile wirklich geändert hat. Ohne
// ihn würde JEDER Auswahl-Wechsel irgendwo in der Maske — auch der Klick
// auf eine GEHOLTE Position für die PUT-Kette — die Liste leeren und neu
// holen und dabei genau diese Auswahl wegwerfen.

import { seGlobal } from '../../softengine/bridge'
import { findRuntimeDataSource, isRecord } from '../../softengine/data'
import { ladeZeilenPerRelation } from '../../softengine/relationLader'
import { aufAuswahlHoeren, auswahlFuer, merkmalVon } from './auswahl'

const letzterAbdruck = new Map<string, string>()
let verdrahtet = false

// Die gewählte Zeile der Geber-QUELLE: der erste Geber-Baustein
// (data-ff-id) mit dieser Quelle UND aktiver Auswahl. Kein Treffer =
// undefined = keine Auswahl (der Lader leert dann).
function gewaehlteZeileDerQuelle(quelleId: string): unknown {
  if (quelleId === '' || typeof document === 'undefined') return undefined
  for (const el of Array.from(document.querySelectorAll('[data-ff-id]'))) {
    if (el.getAttribute('source') !== quelleId) continue
    const zeile = auswahlFuer(el.getAttribute('data-ff-id') ?? '')
    if (zeile !== undefined) return zeile
  }
  return undefined
}

function pruefeHolendeQuellen(): void {
  const liste: unknown = seGlobal().FF_DATA_SOURCES
  if (!Array.isArray(liste)) return
  for (const eintrag of liste) {
    if (!isRecord(eintrag) || typeof eintrag.id !== 'string') continue
    const quelle = findRuntimeDataSource(liste, eintrag.id)
    if (!quelle?.ladeRelation) continue
    const zeile = gewaehlteZeileDerQuelle(quelle.ladeRelation.geberQuelleId)
    const abdruck = merkmalVon(zeile) // '' = keine Auswahl
    if (letzterAbdruck.get(quelle.id) === abdruck) continue
    letzterAbdruck.set(quelle.id, abdruck)
    ladeZeilenPerRelation(quelle, quelle.ladeRelation, zeile)
  }
}

// Einmal je Maske anmelden — jeder Datenanschluss darf rufen (Muster
// bootSe). Im Editor kommt der Aufruf nie an: datenAnschluss.connect steigt
// für Editor-Elemente vorher aus.
export function verdrahteHolendeQuellen(): void {
  if (verdrahtet) return
  verdrahtet = true
  aufAuswahlHoeren(pruefeHolendeQuellen)
}

// Nur für gezielte Laufzeit-Tests: definierter Ausgangszustand.
export function setzeHolendeQuellenZurueck(): void {
  letzterAbdruck.clear()
}
