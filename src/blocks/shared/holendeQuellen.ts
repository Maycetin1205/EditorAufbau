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
// als data-ff-id und ihre Quelle als Attribut (exportMask).
//
// WELCHES Attribut die Quelle trägt, sagt die Registry — nicht dieser Code
// (Regel 2): `satzWahl.quelleProp`, sonst die normale Datenquelle `source`.
// Bis R3 (2026-08-12) stand hier hart `source`; damit sahen Tabelle und
// Kanban ihre Auswahl, das Nachschlage-FELD aber nie — es nennt seine
// Nachschlage-Quelle (`nachschlagQuelle`), und `source` reist bei ihm gar
// nicht erst mit (traegtEigeneQuelle in exportMask). Es GAB seine Wahl also
// längst ab (setzeAuswahl/klareAuswahl im FormFeldBlock), nur dieser
// Auslöser hörte nicht hin. Dieselbe Registry-Angabe beantwortet die Frage
// im Editor (auswahlQuelleIdVon in core/blocks/treeQuery) — eine zweite
// Antwort hier wäre eine zweite Wahrheit.
//
// Die Zustands-Bedingung der SatzWahl (`wenn`) braucht die Laufzeit nicht
// nachzubauen: data-ff-id steht NUR an Bausteinen, die gerade wirklich Geber
// sind (istAuswahlGeber prüft sie beim Export). Ein Feld vom Typ „Text"
// trägt die Kennung nicht und wird hier nie angesehen.
//
// Wiederholungsschutz (JSON-Abdruck, Muster auswahl/merkmalVon): geladen
// wird NUR, wenn sich die gewählte GEBER-Zeile wirklich geändert hat. Ohne
// ihn würde JEDER Auswahl-Wechsel irgendwo in der Maske — auch der Klick
// auf eine GEHOLTE Position für die PUT-Kette — die Liste leeren und neu
// holen und dabei genau diese Auswahl wegwerfen.

import { getAllBlockDefinitions } from '../../core/blocks/blockRegistry'
import { QUELLE_PROP } from '../../core/blocks/treeQuery'
import { seGlobal } from '../../softengine/bridge'
import { findRuntimeDataSource, isRecord } from '../../softengine/data'
import { ladeZeilenPerRelation } from '../../softengine/relationLader'
import { aufAuswahlHoeren, auswahlFuer, merkmalVon } from './auswahl'

const letzterAbdruck = new Map<string, string>()
let verdrahtet = false

// Tag-Name -> das Attribut, das die Auswahl-QUELLE dieses Bausteins nennt.
// Beides klein: HTML normalisiert Attributnamen, und der Export schreibt den
// Tag ebenfalls klein.
//
// Nicht zwischengespeichert: die Registry füllt sich beim Laden der
// Baustein-Module, und ein Speicher hier hinge davon ab, wer zuerst dran war.
// Es sind eine Handvoll Einträge, gebaut einmal je Auswahl-Wechsel.
export function quelleAttrJeTag(): Map<string, string> {
  const map = new Map<string, string>()
  for (const def of getAllBlockDefinitions()) {
    if (!def.satzWahl) continue // kein Satz zum Herausgreifen, nie Geber
    map.set(def.tagName.toLowerCase(), (def.satzWahl.quelleProp ?? QUELLE_PROP).toLowerCase())
  }
  return map
}

// Die gewählte Zeile der Geber-QUELLE: der erste Geber-Baustein
// (data-ff-id) mit dieser Quelle UND aktiver Auswahl. Kein Treffer =
// undefined = keine Auswahl (der Lader leert dann).
function gewaehlteZeileDerQuelle(quelleId: string, attrJeTag: Map<string, string>): unknown {
  if (quelleId === '' || typeof document === 'undefined') return undefined
  for (const el of Array.from(document.querySelectorAll('[data-ff-id]'))) {
    const attr = attrJeTag.get(el.tagName.toLowerCase())
    if (attr === undefined || el.getAttribute(attr) !== quelleId) continue
    const zeile = auswahlFuer(el.getAttribute('data-ff-id') ?? '')
    if (zeile !== undefined) return zeile
  }
  return undefined
}

function pruefeHolendeQuellen(): void {
  const liste: unknown = seGlobal().FF_DATA_SOURCES
  if (!Array.isArray(liste)) return
  const attrJeTag = quelleAttrJeTag()
  for (const eintrag of liste) {
    if (!isRecord(eintrag) || typeof eintrag.id !== 'string') continue
    const quelle = findRuntimeDataSource(liste, eintrag.id)
    if (!quelle?.ladeRelation) continue
    const zeile = gewaehlteZeileDerQuelle(quelle.ladeRelation.geberQuelleId, attrJeTag)
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
