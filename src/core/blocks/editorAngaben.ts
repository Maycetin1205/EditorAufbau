// editorAngaben — was ein Baustein im EDITOR zeigt, nicht in der Maske.
//
// Das Icon der Baustein-Bibliothek und die Hinweiszeile im Inspector sind
// Baustein-Wissen: welches Bild fuer die Tabelle steht, wo man die Karte
// bedient. Nach Regel 2 erklaert das der Baustein selbst und generischer Code
// liest es aus der Registry. Bis 2026-08-04 standen beide stattdessen als
// Tabellen im Editor (blockIcons.ts / blockHinweise.ts), nach Bausteintyp
// geschluesselt — jeder neue Baustein brauchte eine Zeile in einer fremden
// Datei, und wer sie vergass, merkte es nirgends.
//
// Warum eine EIGENE Ablage und kein Feld in der BlockDefinition daneben:
// die BlockDefinition entsteht aus den statischen Feldern der Baustein-Klasse
// (BasicBlock.defineAndRegister), und alles, was diese Klasse — oder die
// Registry, die sie einsammelt — enthaelt, landet im Runtime-Buendel und damit
// Byte fuer Byte in JEDER exportierten SoftEngine-Maske. Gemessen am
// 2026-08-04: ein einziges zusaetzliches statisches Feld = 69 Byte mehr im
// Export, die Registrier-Mechanik selbst = 33 geaenderte Zeilen im Minifikat.
// Ein Bibliotheks-Icon und ein Bediener-Hinweis haben in der Maske nichts zu
// suchen, und die Symbol-Datei (ui/zeichen) gehoert dort ohnehin nie hinein.
//
// Darum gilt fuer diese Datei EINE Regel: kein Baustein und kein
// Laufzeit-Modul darf sie importieren. Dann erreicht sie das Buendel nicht
// (bewacht von check:runtime, „Buendel identisch") und ist trotzdem die eine
// Stelle, an der generischer Editor-Code dieses Baustein-Wissen abfragt —
// genau wie bei der Registry daneben.
//
// Deklariert wird je Baustein in src/blocks/<x>/editorAngaben.ts, eingesammelt
// von src/blocks/registerEditorAngaben.ts (das laedt nur der Editor).

// Ein Symbol ist eine Komponente der Editor-Oberflaeche. Diese Datei RENDERT
// sie nie: sie legt sie ab und gibt sie unveraendert zurueck. Darum steht hier
// absichtlich kein React- und kein ui/-Typ — der fachliche Core bleibt
// frameworkfrei und importiert keine aeussere Schicht (beides bewacht von
// eslint no-restricted-imports). Bis 2026-08-11 stand hier `LucideIcon` aus
// lucide-react: das umging die Regel nur, weil das Paket nicht `react` heisst.
// Mehr als „nimmt eine Groesse und eine Klasse" muss der Core nicht wissen;
// den echten Typ kennt die zeichnende Stelle (ui/zeichen, `Zeichen`), und er
// erfuellt diesen Vertrag.
export type BausteinSymbol = (eigenschaften: {
  size?: number | string
  className?: string
}) => unknown

export interface EditorAngaben {
  // Icon der Baustein-Bibliothek in der Seitenleiste. Fehlt es, zeigt die
  // Bibliothek ein neutrales Ersatz-Icon — sie bleibt immer bedienbar, auch
  // fuer einen ganz neuen Baustein.
  symbol?: BausteinSymbol
  // EINE gedaempfte Hinweiszeile im Inspector. Nur fuer Bausteine, deren Panel
  // sonst leer oder fast leer aussieht („kaputt-leer", Nutzer 2026-07-21): sie
  // sagt, WO die Bedienung stattdessen stattfindet (Regel 7: Bedienung am
  // Ding). Kein Tutorial-Text, genau ein Satz.
  hinweis?: string
}

const ablage = new Map<string, EditorAngaben>()

// Eine gemeinsame leere Antwort statt jedes Mal ein frisches Objekt: die
// Abfrage laeuft beim Rendern und soll keine Arbeit fuer den Sammler machen.
const KEINE: EditorAngaben = {}

export function ergaenzeEditorAngaben(type: string, angaben: EditorAngaben): void {
  ablage.set(type, angaben)
}

// Immer ein Objekt, nie undefined: der Aufrufer fragt direkt das Feld ab, das
// er braucht, und behandelt „nicht deklariert" ueber dessen Fehlen.
export function editorAngabenVon(type: string): EditorAngaben {
  return ablage.get(type) ?? KEINE
}
