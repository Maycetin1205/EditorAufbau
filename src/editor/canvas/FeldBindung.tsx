import { useCallback, useEffect, useState, type ReactNode, type RefObject } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import type { BlockNode } from '../../core/blocks/BlockData'
import {
  bindingProp,
  eintragsFelderLesen,
  eintragsFelderVon,
  eintragsFelderWahlWerte,
  eintragsQuellenWahlWert,
  eintragsWahlWert,
  eintragsZuordnungLesen,
  listenStandardTitel,
  listeLesen,
  type BindableSpot,
  type GewaehltesFeld,
  type ListenBindung,
} from '../../core/blocks/BlockDefinition'
import { zerlegeBindung } from '../../core/blocks/BlockDefinition'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { propertySichtbar } from '../../core/blocks/PropertyDescription'
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

  quellen: readonly QuelleInReichweite[]

  containerRef: RefObject<HTMLDivElement | null>

  onSelect?: (aufStelle: boolean) => void
}

function pickerGruppen(quellen: readonly QuelleInReichweite[]): PickerGruppe[] {
  // Der Hinweis nennt die Felder, an denen die Quelle haengt — die stehen in
  // der Quelle, an der sie haengt, nicht zwangslaeufig in der eigenen
  // (zweite Stufe: die Tierart haengt am Artikelstamm).
  const quelleMit = (id: string) => quellen.find((x) => x.source.id === id)?.source
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
        hinweis: paarKlartext(
          q.paare ?? [],
          q.vonQuelleId === undefined ? quellen[0]?.source : quelleMit(q.vonQuelleId),
        ),
        fields: q.source.fields,
      }))
}

function klarnameVon(wert: string, quellen: readonly QuelleInReichweite[]): string {
  const { quelleId, code } = zerlegeBindung(wert)
  const quelle = quelleId === ''
    ? quellen[0]?.source
    : quellen.find((q) => q.source.id === quelleId)?.source
  return quelle?.fields.find((f) => f.code === code)?.label ?? ''
}

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

  const tippSitzung = useEingabeSitzung(
    () => editor.beginTransaction(),
    () => editor.endTransaction(),
  )
  const hatQuelle = quellen.length > 0

  const bibliotheksAngebot =
    !hatQuelle && bibliothek.length > 0 && quellenTraeger(editor.tree, block.id) !== undefined
  const hatAngebot = hatQuelle || bibliotheksAngebot

  const { picker, closePicker, onClick, onDoubleClick } = useBindingPicker({
    editor,
    blockRef,
    selected,
    bindableSpots,
    hatAngebot,
    onSelect,
  })

  const [listenPicker, setListenPicker] = useState<{
    index: number
    top: number
    left: number

    // Die Stelle, aus der der Waehler kam (Spaltenkopf, Erfassungszelle) — ein
    // Klick darauf schliesst ihn wieder.
    ausloeser: Element | null

    liste?: unknown
  } | null>(null)
  const closeListenPicker = useCallback(() => setListenPicker(null), [])
  if (!selected && listenPicker !== null) setListenPicker(null)

  // listenBindung.quelleProp: die Felder kommen NUR aus der Bibliotheks-
  // Quelle, deren id in dieser Block-Eigenschaft steht (z. B. das
  // Nachschlage-Feld) — nie aus den Quellen in Reichweite.
  const quelleAusProp = listenBindung?.quelleProp === undefined
    ? undefined
    : bibliothek.find((s) => s.id === String(block.props[listenBindung.quelleProp ?? ''] ?? ''))
  const listenPickerHatFelder = listenBindung?.quelleProp !== undefined
    ? quelleAusProp !== undefined
    : hatAngebot || listenBindung?.eintragsWahl !== undefined

  useEffect(() => {
    const el = containerRef.current
    if (!el || !listenBindung) return
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        prop?: string
        index?: number
        top?: number
        left?: number
        ausloeser?: unknown
        liste?: unknown
      }

      if (detail?.prop !== listenBindung.prop || typeof detail.index !== 'number') return
      setListenPicker({
        index: detail.index,
        top: Math.max(8, detail.top ?? 0),
        left: Math.max(8, Math.min(detail.left ?? 0, window.innerWidth - 248)),
        ausloeser: detail.ausloeser instanceof Element ? detail.ausloeser : null,
        ...(Array.isArray(detail.liste) ? { liste: detail.liste } : {}),
      })
    }
    el.addEventListener('ff-listen-bind', handler)
    return () => el.removeEventListener('ff-listen-bind', handler)
  }, [containerRef, listenBindung])

  const gruppen = bibliotheksAngebot
    ? bibliothek.map((s) => ({
        quelleId: s.id,
        name: s.name,
        kennung: quellenKennung(s),
        fields: s.fields,
      }))
    : pickerGruppen(quellen)

  function quelleSetzen(wert: string, blockId: string): string {
    const ziel = zerlegeBindung(wert)
    const traeger = quellenTraeger(editor.tree, blockId)
    if (ziel.code === '' || ziel.quelleId === '' || !traeger) return ''
    editor.updateProperty(traeger.id, 'source', ziel.quelleId)
    return ziel.code
  }

  function klarnameAusBibliothek(roh: string): string {
    const { quelleId, code } = zerlegeBindung(roh)
    return (
      bibliothek
        .find((s) => s.id === quelleId)
        ?.fields.find((f) => f.code === code)?.label ?? ''
    )
  }

  // Solange die Eigenschaft leer ist (Automatik), gilt die vom Baustein
  // mitgeschickte Anzeige-Liste — erst das Wählen schreibt sie als richtige
  // Eigenschaft fest.
  type PickerStand = { index: number; liste?: unknown }

  const eintraegeVon = (picker: PickerStand): Record<string, unknown>[] => {
    if (!listenBindung) return []
    const ausProps = listeLesen(block.props[listenBindung.prop], listenBindung)
    return ausProps.length > 0 ? ausProps : listeLesen(picker.liste, listenBindung)
  }

  // Nimmt ein GANZES Paket von Schluesseln: `block.props` ist der Stand des
  // letzten Rendervorgangs und aendert sich innerhalb desselben nicht — zwei
  // Aufrufe hintereinander laesen beide denselben alten Stand, und der zweite
  // ueberschriebe den ersten. Ein Aufruf ist zugleich EIN Undo-Schritt.
  const schreibeInEintrag = (picker: PickerStand, teil: Record<string, unknown>): void => {
    if (!listenBindung) return
    const next = eintraegeVon(picker)
    const ziel = next[picker.index]
    if (!ziel) return
    // Ein leerer Text heisst „nicht gesetzt": der Schluessel fliegt raus,
    // statt als '' mitzureisen (dieselbe Konvention wie beim Lesen der Liste,
    // und der Export traegt keine leeren Angaben).
    for (const [key, wert] of Object.entries(teil)) {
      if (wert === '') delete ziel[key]
      else ziel[key] = wert
    }
    editor.updateProperty(block.id, listenBindung.prop, next)
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
          ausloeser={picker.el}
          onPick={(wert) => {
            const prop = bindingProp(picker.spot.prop)
            if (bibliotheksAngebot) {
              editor.transaktion(() => {
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
      {selected && listenPicker && listenBindung && listenPickerHatFelder && (() => {
        const listeJetzt = (): Record<string, unknown>[] => eintraegeVon(listenPicker)
        const liste = listeJetzt()
        const eintrag = liste[listenPicker.index]
        if (!eintrag) return null

        // quelleProp-Modus: eine Gruppe, nackte Feldcodes (quelleId '').
        const proQuelle = quelleAusProp !== undefined
        const alleGruppen: PickerGruppe[] = proQuelle
          ? [{
              quelleId: '',
              name: quelleAusProp.name,
              kennung: quellenKennung(quelleAusProp),
              fields: quelleAusProp.fields,
            }]
          : gruppen
        // `nurEigeneQuelle`: die erste Gruppe ist die eigene Quelle. Die Gruppe
        // einer schon GESETZTEN Bindung bleibt daneben stehen — sonst waere
        // nicht mehr zu sehen, worauf die Spalte zeigt.
        const gesetzteQuelle = zerlegeBindung(
          String(eintrag[listenBindung.feldKey] ?? ''),
        ).quelleId
        const listenGruppen: PickerGruppe[] = listenBindung.nurEigeneQuelle === true
          ? alleGruppen.filter((g, i) => i === 0 || g.quelleId === gesetzteQuelle)
          : alleGruppen
        const titelJetzt = String(eintrag[listenBindung.titelKey] ?? '')
        const wahl = listenBindung.eintragsWahl
        const zuo = listenBindung.eintragsZuordnung
        const quellenWahl = listenBindung.eintragsQuellenWahl

        // Die Wahl unter den Verknuepfungen zeigt nur, wenn die Registry sie
        // deklariert UND die Erfassungs-Faehigkeit des Bausteins gerade an ist
        // (nurBeiErfassung) — ohne Erfassung hat sie keine Wirkung.
        const erfasst = (() => {
          const kann = getBlockDefinition(block.type)?.kannErfassen
          return kann !== undefined && propertySichtbar(kann.wenn, block.props)
        })()
        const zeigeQuellenWahl = quellenWahl !== undefined
          && !proQuelle
          && (quellenWahl.nurBeiErfassung !== true || erfasst)
          && quellen.length > 1

        // „Zeigt beim Suchen": die Felder der Quelle, die dieser Eintrag unter
        // `quelleAusKey` nennt (bei der Tabelle die Sucht-in-Wahl). Ohne
        // gewaehlte Quelle gibt es nichts anzukreuzen.
        const felderWahl = listenBindung.eintragsFelderWahl
        const suchQuelleId = felderWahl === undefined
          ? ''
          : String(eintrag[felderWahl.quelleAusKey] ?? '')
        const suchQuelle = suchQuelleId === ''
          ? undefined
          : quellen.find((q) => q.source.id === suchQuelleId)?.source
        const zeigeFelderWahl = felderWahl !== undefined
          && suchQuelle !== undefined
          && (felderWahl.nurBeiErfassung !== true || erfasst)
        const gewaehlteFelder: GewaehltesFeld[] = felderWahl === undefined
          ? []
          : eintragsFelderWahlWerte(felderWahl, eintrag)

        const zeigeZuordnung = zuo !== undefined
          && wahl !== undefined
          && eintragsWahlWert(wahl, eintrag) === zuo.nurBeiWahl

        const zusatzFelder = wahl ? eintragsFelderVon(wahl, eintrag) : []
        const gebundeneFelder = wahl ? eintragsFelderLesen(wahl, eintrag) : {}

        const schreibeFeld = (key: string, wert: string): void => {
          if (!wahl?.felderKey) return
          const next = { ...gebundeneFelder }
          if (wert === '') delete next[key]
          else next[key] = wert
          schreibeInEintrag(listenPicker, { [wahl.felderKey]: next })
        }
        return (
          <FieldPicker
            spotLabel={titelJetzt}
            gruppen={listenGruppen}
            wahl={wahl && {
              label: wahl.label,
              optionen: wahl.optionen,
              aktuell: eintragsWahlWert(wahl, eintrag),
              onWaehle: (wert) => schreibeInEintrag(listenPicker, { [wahl.key]: wert }),
            }}
            quellenWahl={zeigeQuellenWahl && quellenWahl ? {
              label: quellenWahl.label,
              leerName: quellenWahl.leerName,
              // Die Verknuepfungen des Bausteins — die erste Quelle ist die
              // eigene und keine Verknuepfung.
              optionen: quellen.slice(1).map((q) => ({ wert: q.source.id, name: q.source.name })),
              aktuell: eintragsQuellenWahlWert(quellenWahl, eintrag),
              onWaehle: (wert) => schreibeInEintrag(listenPicker, { [quellenWahl.key]: wert }),
            } : undefined}
            felderWahl={zeigeFelderWahl && felderWahl && suchQuelle ? {
              label: felderWahl.label,
              optionen: suchQuelle.fields.map((f) => ({ feld: f.code, titel: f.label })),
              gewaehlt: gewaehlteFelder.map((g) => g.feld),
              onUmschalten: (feld, titel, an) => {
                const rest = gewaehlteFelder.filter((g) => g.feld !== feld)
                schreibeInEintrag(listenPicker, {
                  [felderWahl.key]: an ? [...rest, { feld, titel }] : rest,
                })
              },
            } : undefined}
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
              onAendern: (zeilen) => schreibeInEintrag(listenPicker, { [zuo.key]: zeilen }),
              sitzung: tippSitzung,
            } : undefined}
            current={String(eintrag[listenBindung.feldKey] ?? '')}
            top={listenPicker.top}
            left={listenPicker.left}
            ausloeser={listenPicker.ausloeser}
            onPick={(roh) => {
              editor.transaktion(() => {
                // Im quelleProp-Modus ist roh schon der nackte Feldcode —
                // NIE die Quelle des Traegers umstellen.
                const wert = !proQuelle && bibliotheksAngebot
                  ? quelleSetzen(roh, block.id)
                  : roh

                if (!proQuelle && bibliotheksAngebot && wert === '') return
                const next = listeJetzt()
                const ziel = next[listenPicker.index]
                if (!ziel) return

                ziel[listenBindung.titelKey] = wert === ''
                  ? listenStandardTitel(listenBindung, listenPicker.index)
                  : (proQuelle
                      ? (quelleAusProp.fields.find((f) => f.code === wert)?.label ?? '')
                      : bibliotheksAngebot
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
