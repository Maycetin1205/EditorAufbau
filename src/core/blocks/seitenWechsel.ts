// seitenWechsel — der EINE Vertrag „zeig eine andere Seite dieser Maske".
//
// Ein Baustein (die Navi) loest aus, die Laufzeit der MASKE blendet um.
// Dieselbe Bauart wie das X am Dialograhmen: der Baustein meldet, der Ort
// entscheidet.
//
// WER zuhoert, hat sich mit N2.1 geaendert: nur noch die Maske. Der Editor
// hoerte bis dahin mit und wechselte die offene Seite — genau das machte die
// Navi im Editor unbearbeitbar (jeder Klick sprang weg, Nutzer-Befund
// 2026-08-12). Im Editor waehlt der Klick jetzt den Baustein; Seiten wechselt
// die Seiten-Leiste. Der Vertrag bleibt trotzdem hier in core/blocks: er
// gehoert zwischen Baustein und Registry-Welt, nicht in einen Baustein.
//
// Das Ziel reist als KLARNAME der Seite, nicht als id: die laufende Maske
// kennt keine Editor-ids. Die HAUPTSEITE hat keinen eigenen Baustein, auf
// den ein Name zeigen koennte — sie ist darum jeder Name, den keine Ansicht
// traegt (ihr eigener „Hauptseite", der leere, und der einer geloeschten).

export const SEITEN_WECHSEL_EVENT = 'ff-seiten-wechsel'

export interface SeitenWechselDetail {
  /** Klarname der Ansicht; leer = Hauptseite. */
  ansicht: string
}
