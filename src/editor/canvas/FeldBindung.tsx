// FeldBindung — „Stelle anklicken → Feld wählen", vollständig an EINEM Ort.
//
// Bis 2026-07-28 lag das in zwei Hälften im BlockHost: der Picker für feste
// Stellen (bindableSpots) und der für bindbare Listen (listenBindung), dazu
// die Helfer für beide. Beide beantworten dieselbe Frage — „welche Felder
// bietet diese Stelle an, und was passiert bei der Wahl" — und beide bekamen
// dieselbe Datenquelle zweimal zusammengebaut.
//
// Herausgezogen, BEVOR die Mehr-Quellen-Auswahl dazukommt: die Antwort auf
// „welche Felder" wächst dort, und sie soll an einer Stelle wachsen, nicht an
// zwei. Der BlockHost behält Auswahl, Anfasser, Drag&Drop und Plus-Knopf.
//
// Generischer Editor-Code: importiert KEINEN Baustein (Regel 2) und kennt
// weder „Tabelle" noch „Spalte" — Prop-Name und Schlüssel kommen aus dem
// Registry-Eintrag. Reine Editor-Hilfe, erscheint nie im Export.
//
// BIBLIOTHEKS-ANGEBOT (Nutzer-Auftrag 2026-08-03, „eine Auswahl statt
// zwei"): trägt der Träger dieses Bausteins noch KEINE Quelle, tat der
// Klick auf eine bindbare Stelle bisher still gar nichts — der Bediener
// musste erst im Inspector „Datenquelle 1" setzen und dann NOCH EINMAL
// klicken. Jetzt bietet der Picker in dem Fall die GANZE Bibliothek an;
// die Wahl setzt Quelle (am Träger) und Bindung in einem Schritt. Ohne
// Träger in Reichweite bleibt alles beim Alten — es gäbe keinen Ort, an
// dem die Quelle wohnen könnte.

import { useCallback, useEffect, useState, type ReactNode, type RefObject } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import type { BlockNode } from '../../core/blocks/BlockData'
import {
  bindingProp,
  eintragsFelderLesen,
  eintragsFelderVon,
  eintragsWahlWert,
  eintragsZuordnungLesen,
  listenStandardTitel,
  listeLesen,
  type BindableSpot,
  type ListenBindung,
} from '../../core/blocks/BlockDefinition'
import { zerlegeBindung } from '../../core/blocks/BlockDefinition'
import { quellenKennung } from '../../core/data/dataSources'
import { paarKlartext, type QuelleInReichweite } from '../../core/data/sourceLinks'
import type { Editor } from '../../state/Editor'
import { quellenTraeger } from '../../state/quellenOps'
import { useDataSources } from '../../state/useDataSources'
import { useEingabeSitzung } from '../inspector/controls/eingabeSitzung'
import { FieldPicker, type PickerGruppe } from './FieldPicker'
import { bindingCode, useBindingPicker } from './useBindingPicker'

interface FeldBindungArgs {
  editor: Editor
  blockRef: RefObject<BlockNode>
  block: BlockNode
  selected: boolean | undefined
  bindableSpots: readonly BindableSpot[]
  listenBindung: ListenBindung | undefined
  // Alle Quellen in Reichweite, erste zuerst (Editor.quellenFor). Leer =
  // keine Quelle -> kein Picker.
  quellen: readonly QuelleInReichweite[]
  // Container-Element des Hosts: dort läuft das `ff-listen-bind`-Ereignis auf.
  containerRef: RefObject<HTMLDivElement | null>
  onSelect?: () => void
}

// Aus den erreichbaren Quellen die Abschnitte des Pickers bauen. Die ERSTE
// bleibt unqualifiziert (quelleId '') — sonst gäbe es zwei Schreibweisen für
// dasselbe Ziel; bei den weiteren steht der Verknüpfungs-Hinweis dabei.
function pickerGruppen(quellen: readonly QuelleInReichweite[]): PickerGruppe[] {
  const erste = quellen[0]?.source
  return quellen.map((q, i) => (i === 0
    ? {
        quelleId: '',
        name: q.source.name,
        kennung: quellenKennung(q.source),
        fields: q.source.fields,
      }
    : {
        quelleId: q.source.id,
        name: q.source.name,
        kennung: quellenKennung(q.source),
        hinweis: paarKlartext(q.paare ?? [], erste),
        fields: q.source.fields,
      }))
}

// Klarname eines gebundenen Werts — aufgelöst gegen die GENANNTE Quelle.
// Unbekannt (Quelle weg, Feld weg) -> '' , damit der Aufrufer entscheidet.
function klarnameVon(wert: string, quellen: readonly QuelleInReichweite[]): string {
  const { quelleId, code } = zerlegeBindung(wert)
  const quelle = quelleId === ''
    ? quellen[0]?.source
    : quellen.find((q) => q.source.id === quelleId)?.source
  return quelle?.fields.find((f) => f.code === code)?.label ?? ''
}

// Liefert die Klick-Behandler für den Host-Rahmen und die fertig gerenderten
// Picker. Ein Hook statt einer Komponente, weil onClick/onDoubleClick am
// äußeren Rahmen des BlockHost hängen müssen — dieselbe Bauart wie die
// Nachbarn useBindingPicker / useBlockResize / useLitElement.
export function useFeldBindung({
  editor,
  blockRef,
  block,
  selected,
  bindableSpots,
  listenBindung,
  quellen,
  containerRef,
  onSelect,
}: FeldBindungArgs): {
  onClick: (e: ReactMouseEvent<HTMLDivElement>) => void
  onDoubleClick: (e: ReactMouseEvent<HTMLDivElement>) => void
  pickers: ReactNode
} {
  const bibliothek = useDataSources().list
  // Tipp-Sitzung fuer die Textfelder der Zuordnungstabelle: eine Eingabe =
  // EIN Undo-Schritt, dieselbe Klammer wie in den Inspector-Feldern.
  const tippSitzung = useEingabeSitzung(
    () => editor.beginTransaction(),
    () => editor.endTransaction(),
  )
  const hatQuelle = quellen.length > 0
  // Bibliotheks-Angebot (s. Kopfkommentar): kein Ersatz für „Quelle in
  // Reichweite", sondern der Weg dorthin — nur wenn ein Träger existiert,
  // der die gewählte Quelle aufnehmen kann, und die Bibliothek nicht leer ist.
  const bibliotheksAngebot =
    !hatQuelle && bibliothek.length > 0 && quellenTraeger(editor.tree, block.id) !== undefined
  const hatAngebot = hatQuelle || bibliotheksAngebot

  // ---- Klick-auf-Stelle-Binding (feste Stellen) ----
  const { picker, closePicker, onClick, onDoubleClick } = useBindingPicker({
    editor,
    blockRef,
    selected,
    bindableSpots,
    hatAngebot,
    onSelect,
  })

  // ---- Feld-Picker fuer bindbare LISTEN ----
  // Ein Baustein mit `listenBindung` (Registry) meldet per Custom Event
  // `ff-listen-bind`, dass der Bediener einen Listen-Eintrag an ein Feld
  // binden will — die Tabelle tut das an ihren Spaltenkoepfen. Gelesen werden
  // Prop-Name und Schluessel aus dem Registry-Eintrag (Regel 2 — Faehigkeiten
  // sind Registry-Eintraege), nie ein Bausteintyp.
  const [listenPicker, setListenPicker] = useState<{
    index: number
    top: number
    left: number
  } | null>(null)
  const closeListenPicker = useCallback(() => setListenPicker(null), [])
  if (!selected && listenPicker !== null) setListenPicker(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el || !listenBindung) return
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        prop?: string
        index?: number
        top?: number
        left?: number
      }
      // Nur die eigene Liste bedienen (ein Baustein koennte spaeter mehrere haben).
      if (detail?.prop !== listenBindung.prop || typeof detail.index !== 'number') return
      setListenPicker({
        index: detail.index,
        top: Math.max(8, detail.top ?? 0),
        left: Math.max(8, Math.min(detail.left ?? 0, window.innerWidth - 248)),
      })
    }
    el.addEventListener('ff-listen-bind', handler)
    return () => el.removeEventListener('ff-listen-bind', handler)
  }, [containerRef, listenBindung])

  // Im Bibliotheks-Angebot sind ALLE Gruppen qualifiziert (quelleId gefüllt):
  // die Wahl muss die Quelle mitbringen. Gespeichert wird trotzdem
  // unqualifiziert — die gewählte Quelle wird ja zur ERSTEN des Trägers,
  // und die erste wird NIE qualifiziert (s. bindungMitQuelle).
  const gruppen = bibliotheksAngebot
    ? bibliothek.map((s) => ({
        quelleId: s.id,
        name: s.name,
        kennung: quellenKennung(s),
        fields: s.fields,
      }))
    : pickerGruppen(quellen)

  // Eine Feldwahl im Bibliotheks-Angebot schreibt ZWEI Props (Quelle an den
  // Traeger, Bindung an den Baustein) — als EIN Undo-Eintrag, wie sonst im
  // Projekt auch (updateBlockEvents, eingabeSitzung, zieheGroesse). Bis
  // 2026-08-06 waren es zwei: EIN Strg+Z liess die frisch gesetzte Quelle mit
  // der alten Bindung stehen, und zwei Bedienschritte lagen auf einem.
  function inEinemSchritt(tun: () => void): void {
    editor.beginTransaction()
    try {
      tun()
    } finally {
      editor.endTransaction()
    }
  }

  // Wahl aus dem Bibliotheks-Angebot anwenden: Quelle an den Träger,
  // zurück kommt der nackte Feldcode ('' = nichts gewählt/nichts zu lösen).
  function quelleSetzen(wert: string, blockId: string): string {
    const ziel = zerlegeBindung(wert)
    const traeger = quellenTraeger(editor.tree, blockId)
    if (ziel.code === '' || ziel.quelleId === '' || !traeger) return ''
    editor.updateProperty(traeger.id, 'source', ziel.quelleId)
    return ziel.code
  }

  // Klarname im Bibliotheks-Angebot: gegen die GENANNTE Bibliotheks-Quelle
  // aufgelöst — `quellen` ist in dem Moment noch leer, klarnameVon griffe
  // ins Nichts und der Spaltentitel fiele auf den Feldcode zurück (Regel 3).
  function klarnameAusBibliothek(roh: string): string {
    const { quelleId, code } = zerlegeBindung(roh)
    return (
      bibliothek
        .find((s) => s.id === quelleId)
        ?.fields.find((f) => f.code === code)?.label ?? ''
    )
  }

  const pickers = (
    <>
      {selected && picker && hatAngebot && (
        <FieldPicker
          spotLabel={picker.spot.label}
          gruppen={gruppen}
          current={bindingCode(block.props, picker.spot)}
          top={picker.top}
          left={picker.left}
          onPick={(wert) => {
            const prop = bindingProp(picker.spot.prop)
            if (bibliotheksAngebot) {
              inEinemSchritt(() => {
                const code = quelleSetzen(wert, blockRef.current.id)
                if (code !== '') editor.updateProperty(blockRef.current.id, prop, code)
              })
            } else {
              editor.updateProperty(blockRef.current.id, prop, wert)
            }
            closePicker()
          }}
          onClose={closePicker}
        />
      )}
      {selected && listenPicker && listenBindung && (hatAngebot || listenBindung.eintragsWahl) && (() => {
        const liste = listeLesen(block.props[listenBindung.prop], listenBindung)
        const eintrag = liste[listenPicker.index]
        if (!eintrag) return null
        const titelJetzt = String(eintrag[listenBindung.titelKey] ?? '')
        const wahl = listenBindung.eintragsWahl
        const zuo = listenBindung.eintragsZuordnung
        // EIN Schluessel im EINEN Eintrag; Titel, Feldbindung und alles andere
        // an der Spalte bleiben unberuehrt. Frisch gelesen statt `liste`
        // wiederzuverwenden — zwischen Aufmachen und Klick kann der Bauer den
        // Titel umbenannt haben.
        const schreibeInEintrag = (key: string, wert: unknown): void => {
          const next = listeLesen(block.props[listenBindung.prop], listenBindung)
          const ziel = next[listenPicker.index]
          if (!ziel) return
          ziel[key] = wert
          editor.updateProperty(block.id, listenBindung.prop, next)
        }
        // Die Zuordnung gibt es nur zu DER Darstellung, die sie erklaert: an
        // einer Textspalte waere sie ein Feld, das nichts tut.
        const zeigeZuordnung = zuo !== undefined
          && wahl !== undefined
          && eintragsWahlWert(wahl, eintrag) === zuo.nurBeiWahl
        // Dieselbe Linie fuer die zusaetzlichen Felder: sie gehoeren der
        // gewaehlten Darstellung, nicht der Spalte. Wechselt der Bauer von
        // „Bild + Name" auf „Text", verschwinden sie aus dem Fenster — die
        // gespeicherten Bindungen bleiben aber im Eintrag stehen und leben
        // wieder auf, wenn er zurueckstellt (dieselbe Haltung wie bei den
        // liegen gebliebenen Props eines Bausteins).
        const zusatzFelder = wahl ? eintragsFelderVon(wahl, eintrag) : []
        const gebundeneFelder = wahl ? eintragsFelderLesen(wahl, eintrag) : {}
        // Ein Zusatzfeld binden: EIN Schluessel im `felder`-Record, alles andere
        // bleibt stehen. Ungebunden loescht den Schluessel, statt '' abzulegen —
        // sonst traegt jede Spalte leere Bindungen durch den Export.
        const schreibeFeld = (key: string, wert: string): void => {
          if (!wahl?.felderKey) return
          const next = { ...gebundeneFelder }
          if (wert === '') delete next[key]
          else next[key] = wert
          schreibeInEintrag(wahl.felderKey, next)
        }
        return (
          <FieldPicker
            spotLabel={titelJetzt}
            gruppen={gruppen}
            wahl={wahl && {
              label: wahl.label,
              optionen: wahl.optionen,
              aktuell: eintragsWahlWert(wahl, eintrag),
              onWaehle: (wert) => schreibeInEintrag(wahl.key, wert),
            }}
            felder={zusatzFelder.map((zf) => ({
              key: zf.key,
              label: zf.label,
              aktuell: gebundeneFelder[zf.key] ?? '',
              onWaehle: (wert) => schreibeFeld(zf.key, wert),
            }))}
            zuordnung={zeigeZuordnung && zuo ? {
              label: zuo.label,
              wertLabel: zuo.wertLabel,
              nameLabel: zuo.nameLabel,
              bedeutungLabel: zuo.bedeutungLabel,
              bedeutungen: zuo.bedeutungen,
              zeilen: eintragsZuordnungLesen(zuo, eintrag),
              onAendern: (zeilen) => schreibeInEintrag(zuo.key, zeilen),
              sitzung: tippSitzung,
            } : undefined}
            current={String(eintrag[listenBindung.feldKey] ?? '')}
            top={listenPicker.top}
            left={listenPicker.left}
            onPick={(roh) => {
              inEinemSchritt(() => {
                // Bibliotheks-Angebot: Quelle setzen, weiter geht es mit dem
                // nackten Feldcode — die Titel-Auflösung unten läuft dann
                // gegen die frisch gesetzte Quelle aus der Bibliothek.
                const wert = bibliotheksAngebot
                  ? quelleSetzen(roh, block.id)
                  : roh
                // Nichts gewaehlt: dann hat quelleSetzen auch nichts geschrieben.
                if (bibliotheksAngebot && wert === '') return
                const next = listeLesen(block.props[listenBindung.prop], listenBindung)
                const ziel = next[listenPicker.index]
                if (!ziel) return
                // Feld gewaehlt = Klarname in den Titel, IMMER (Nutzer-
                // Entscheidung 2026-07-27). Die Vorfassung schuetzte selbst
                // getippte Titel — nach dem ersten Binden galt aber der
                // eingesetzte Klarname selbst als getippt, und ein Umstellen
                // auf ein anderes Feld liess den alten Titel stehen: die
                // Spalte hiess „Tiername" und zeigte Zimmer. Lieber einmal
                // zu viel umbenennen als eine Spalte, die luegt; wer einen
                // eigenen Titel will, tippt ihn nach dem Binden.
                //
                // Der Titel ist REINER Klarname, ohne Quellenzusatz und ohne
                // Fremd-Zeichen: die Spaltenueberschrift ist echter
                // Masken-Inhalt, den der Bediener in SoftEngine sieht — dort
                // hat kein Editor-Hinweis etwas zu suchen (Regel 1). Aufgeloest
                // wird gegen die GENANNTE Quelle, sonst hiesse die Spalte nach
                // einem gleich codierten Feld der ersten.
                ziel[listenBindung.titelKey] = wert === ''
                  ? listenStandardTitel(listenBindung, listenPicker.index)
                  : (bibliotheksAngebot
                      ? klarnameAusBibliothek(roh)
                      : klarnameVon(wert, quellen)) || wert
                ziel[listenBindung.feldKey] = wert
                editor.updateProperty(block.id, listenBindung.prop, next)
              })
              closeListenPicker()
            }}
            onClose={closeListenPicker}
          />
        )
      })()}
    </>
  )

  return { onClick, onDoubleClick, pickers }
}
