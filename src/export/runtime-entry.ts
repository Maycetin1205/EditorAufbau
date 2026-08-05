// runtime-entry
// Einstiegspunkt für das Export-Runtime-Bündel (vite.runtime.config.ts).
// Importiert DIESELBE Block-Registrierung wie der Editor — das ist der
// Nordstern "1 Render": die Custom Elements, die im Editor laufen, laufen
// wortwörtlich identisch in der exportierten SoftEngine-Maske.
// Gebaut mit: npm run build:runtime  →  src/export/generated/ff-runtime.js
// (Die gebaute Datei ist eingecheckt, damit der Export ohne Build-Schritt
// funktioniert; nach Block-Änderungen build:runtime erneut ausführen —
// ein Test wacht darüber, dass sie nicht veraltet.)

import '../blocks/register'
import { meldeFehler } from '../softengine/meldung'

// Letztes Auffangnetz der Maske (Regel 4 — nichts scheitert still): jeder
// abgelehnte Promise, den niemand aufgefangen hat, landet im Fehlerbalken
// statt nur in einer Konsole, die in SoftEngine niemand aufmacht. Die
// gezielten .catch-Stellen bleiben trotzdem die erste Wahl — sie sagen, WAS
// schiefging; das hier faengt nur, was durchgerutscht ist.
// Mehrfach-Fehler buendelt der Balken selbst.
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (e) => {
    const grund: unknown = e.reason
    meldeFehler(
      'Unerwarteter Fehler in der Maske: '
      + (grund instanceof Error ? grund.message : String(grund)),
    )
  })
}
