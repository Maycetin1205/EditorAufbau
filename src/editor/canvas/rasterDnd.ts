// rasterDnd
// Editor-seitige Drag-Helfer der RASTERFLÄCHE (E2 „Bewegen"): aus der
// Zeigerposition die Zielzelle lesen und die Zellmaße des gerade Gezogenen
// bestimmen. Reine Editor-Hilfe — misst das DOM über getComputedStyle, läuft
// NIE in der Maske und hat keinen Export-Einfluss (Regel 1: die Platzierung
// selbst liegt weiter in den Rasterprops, die Canvas UND Export teilen).
//
// Arbeitsteilung: die Zell-GEOMETRIE (Spaltenzahl, gap) kommt aus der EINEN
// Quelle rasterLayout; hier lebt nur, was das DOM braucht — die
// Zeiger→Zelle-Vermessung.

import type { DragEvent } from 'react'
import { canContain, getBlockDefinition } from '../../core/blocks/blockRegistry'
import { RASTER, rasterSpecOf } from '../../core/blocks/rasterLayout'
import type { useEditor } from '../../state/useEditor'
import { newBlockDragType } from './dnd'
import type { DndState, DropTarget } from './dndState'

// Zielzelle (x,y) unter dem übergebenen Punkt (der Aufrufer hat den Greif-
// Versatz bereits abgezogen). Spalten wachsen mit dem Fenster (1fr), Zeilen sind
// fest (zeilePx) → in BEIDEN Achsen werden die tatsächlichen Track-Größen aus
// getComputedStyle gemessen (das löst 1fr in px auf), kumulativ mit dem gap
// durchlaufen; unterhalb der belegten Zeilen mit der nominalen Zeilenhöhe
// extrapoliert.
export function zelleAusZeiger(
  gridEl: HTMLElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const stil = getComputedStyle(gridEl)
  const rect = gridEl.getBoundingClientRect()
  const padL = parseFloat(stil.paddingLeft) || 0
  const padT = parseFloat(stil.paddingTop) || 0
  const spaltenGap = parseFloat(stil.columnGap) || RASTER.gapPx
  const zeilenGap = parseFloat(stil.rowGap) || RASTER.gapPx

  // Lokale Koordinaten im INHALT (nach Padding, inkl. Scroll der Fläche).
  const lx = clientX - rect.left - padL + gridEl.scrollLeft
  const ly = clientY - rect.top - padT + gridEl.scrollTop

  // X: gemessene Spalten-Tracks (px je Spalte) aus getComputedStyle — die Spalten
  // wachsen mit dem Fenster (1fr), darum KEIN fester Pitch (getComputedStyle löst
  // 1fr in die tatsächliche Pixelbreite auf). Kumulativ mit dem Spalten-gap
  // durchlaufen; rechts der letzten Spalte in die letzte Spalte klemmen.
  const spalten = stil.gridTemplateColumns
    .split(' ')
    .map((t) => parseFloat(t))
    .filter((n) => Number.isFinite(n))
  let x = 0
  let xkante = 0
  while (x < spalten.length) {
    if (lx < xkante + spalten[x]) break
    xkante += spalten[x] + spaltenGap
    x++
  }
  x = Math.max(0, Math.min(RASTER.spalten - 1, x))

  // Y: gemessene Zeilen-Tracks (px je belegter Zeile), kumulativ mit gap.
  const tracks = stil.gridTemplateRows
    .split(' ')
    .map((t) => parseFloat(t))
    .filter((n) => Number.isFinite(n))
  let y = 0
  let kante = 0 // Oberkante der aktuellen Zeile
  while (y < tracks.length) {
    if (ly < kante + tracks[y]) break
    kante += tracks[y] + zeilenGap
    y++
  }
  if (y >= tracks.length) {
    // Unterhalb aller belegten Zeilen: mit nominaler Zeilenhöhe weiterzählen.
    const pitch = RASTER.zeilePx + zeilenGap
    y = tracks.length + (pitch > 0 ? Math.max(0, Math.floor((ly - kante) / pitch)) : 0)
  }
  return { x, y: Math.max(0, y) }
}

// Zellmaße des gerade Gezogenen für die Fläche parentId — oder null, wenn der
// Drop dort nicht erlaubt ist (canContain, Kap. 4K.4) → kein Ziel/keine
// Vorschau. HTML5-Drops auf die Rasterfläche sind immer „von woanders" (neu aus
// der Bibliothek ODER ein Block aus einem Container): beide bekommen die
// Registry-Startgröße, nie Vollbreite (der Block hatte außerhalb des Rasters
// keine sinnvollen Zellmaße). Ein bereits auf der Fläche liegender Block wird
// per POINTER bewegt (rasterMove) und läuft NICHT hierüber.
export function gezogeneGroesse(
  ed: ReturnType<typeof useEditor>,
  dnd: DndState,
  dt: DataTransfer,
  parentId: string,
): { w: number; h: number } | null {
  const parent = ed.getNode(parentId)
  if (!parent) return null
  if (dnd.dragId !== null) {
    const node = ed.getNode(dnd.dragId)
    if (!node || !canContain(parent.type, node.type)) return null
    const spec = rasterSpecOf(getBlockDefinition(node.type))
    return { w: spec.startW, h: spec.startH }
  }
  const type = newBlockDragType(dt)
  const def = type ? getBlockDefinition(type) : undefined
  if (!type || !def || !canContain(parent.type, type)) return null
  const spec = rasterSpecOf(def)
  return { w: spec.startW, h: spec.startH }
}

// Aus einem dragover-Event die Raster-Zielzelle bestimmen (HTML5-Drops auf die
// Rasterfläche = Bibliothek-Block oder Block aus einem Container): Größe
// ermitteln, Zielzelle unter dem Zeiger lesen (die Ecke sitzt an der
// Zeigerzelle) und in x klemmen, damit der Block in der Breite passt. null =
// kein gültiges Ziel (Drop nicht erlaubt). Das POINTER-Bewegen eines
// vorhandenen Rasterblocks läuft NICHT hierüber, sondern über rasterMove.
export function rasterZiel(
  e: DragEvent,
  ed: ReturnType<typeof useEditor>,
  dnd: DndState,
  parentId: string,
  gridEl: HTMLElement,
): Extract<DropTarget, { kind: 'raster' }> | null {
  const groesse = gezogeneGroesse(ed, dnd, e.dataTransfer, parentId)
  if (!groesse) return null
  const zelle = zelleAusZeiger(gridEl, e.clientX, e.clientY)
  const x = Math.max(0, Math.min(zelle.x, RASTER.spalten - groesse.w))
  const y = Math.max(0, zelle.y)
  return { kind: 'raster', parentId, x, y, w: groesse.w, h: groesse.h }
}
