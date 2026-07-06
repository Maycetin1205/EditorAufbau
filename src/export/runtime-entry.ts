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
