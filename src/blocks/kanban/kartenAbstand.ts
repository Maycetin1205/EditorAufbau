// kartenAbstand — der Abstand zwischen zwei gestapelten Karten.
//
// EINE Stelle fuer zwei Flaechen: seit N4 (2026-08-13) koennen Karten
// entweder direkt in der Spalte liegen ODER in einem Zimmer. Beide Rumpf-
// Flaechen brauchen dieselbe Regel, und zwei Kopien waeren zwei Wahrheiten
// (Regel 10: das Gemeinsame wird herausgezogen, sobald der zweite echte Fall
// da ist — er ist jetzt da).
//
// Warum die Regel ueberhaupt existiert: eine Karte bringt ihren 24px-Vorschub
// nur mit, wenn sie eine LASCHE hat (kartenStil — der Platz gehoert der
// Lasche). Karten ohne Lasche, in der MASKE also solche ohne Datum und Zeit,
// muessen trotzdem auseinanderstehen wie in der Demo. Bewusst kein `gap` am
// Rumpf: das kaeme bei Karten MIT Lasche zu deren eigenem Vorschub dazu, also
// 48px statt 24px. Im EDITOR zeigt jede Karte ihre Lasche (Klick-Ziel), dort
// greift die Regel nie — beide Welten stehen deshalb gleich weit auseinander.
//
// Der Selektor nennt bewusst KEINEN Tag-Namen. Im Editor liegt jedes Kind in
// einem Wrapper-Element (BlockHost), im Export das Element selbst — eine
// tag-genaue Regel wuerde nur in EINER der beiden Welten greifen und die
// Abstaende auseinanderlaufen lassen (WYSIWYG-Bruch, Regel 1). Aus demselben
// Grund bekommt ein Zimmer keinen eigenen, engeren Abstand, obwohl das
// Optik-Vorbild (designsprache/mix-fellnase-empfang.html, `.zimmer` gap 8px)
// einen zeigt.

import { css } from 'lit'

export const kartenAbstandStil = css`
  ::slotted(:not([hat-reiter])) { margin-top: 24px; }
  slot { display: contents; }
`
