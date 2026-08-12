// seitenWechsel — der EINE Vertrag „zeig eine andere Seite dieser Maske".
//
// Er verbindet zwei Welten, die einander nicht kennen duerfen: ein Baustein
// (die Navi) loest aus, und WER darauf hoert, haengt daran, wo er laeuft —
// im Editor die Arbeitsflaeche (sie wechselt die offene Seite), in der
// fertigen Maske die Navi-Laufzeit (sie blendet um). Genau dieselbe Bauart
// wie das X am Dialograhmen: der Baustein meldet, der Ort entscheidet.
//
// Er liegt in core/blocks und nicht im Baustein, damit generischer
// Editor-Code ihn lesen darf, ohne einen Baustein zu importieren (Regel 2,
// bewacht von check:regeln).
//
// Das Ziel reist als KLARNAME der Seite, nicht als id: die laufende Maske
// kennt keine Editor-ids. Die HAUPTSEITE hat keinen eigenen Baustein, auf
// den ein Name zeigen koennte — sie ist darum jeder Name, den keine Ansicht
// traegt (ihr eigener „Hauptseite", der leere, und der einer geloeschten).

export const SEITEN_WECHSEL_EVENT = 'ff-seiten-wechsel'

export interface SeitenWechselDetail {
  /** Klarname der Ansicht; leer = Hauptseite. */
  ansicht: string
  /**
   * id der Seite im EDITOR-Baum — nur dort gesetzt und nur dort brauchbar.
   * In der exportierten Maske ist sie leer (die Prop bleibt daheim,
   * PropertyDescription.nurImEditor).
   */
  seiteId: string
}
