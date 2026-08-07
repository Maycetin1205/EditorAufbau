// Tailwind-Konfiguration fuer das Editor-Chrome.
// shadcn-konformes Theme via CSS-Variablen (siehe src/index.css).
// Scannt nur src/, nicht den HTML-Export-Output.

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      fontFamily: {
        sans: [
          '"Inter Variable"',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
      },
      // ============================================================
      // Die Masseinheiten des Editor-Chromes (2026-08-07)
      // ============================================================
      // Bis hierher stand in dieser Datei NUR die Farbwelt. Groessen, Abstaende
      // und Hoehen hat sich jede der 30 Editor-Dateien selbst ausgedacht, ueber
      // Monate, nacheinander. Gezaehlt am 2026-08-07: fuenf Textgroessen
      // (9 / 9,9 / 10,8 / 11,7 / 12,6 px), vier Hoehen fuer Bedienelemente
      // (21,6 / 25,2 / 28,8 / 32,4 px), vier Rundungen. Das ist der Grund fuer
      // „sieht uneinheitlich aus" — kein Schlendrian, sondern eine fehlende
      // gemeinsame Liste. Ab jetzt steht sie hier.
      //
      // Die Maskenwelt hat ihre eigene Liste (design/masken-tokens.css, --se-*)
      // und bleibt davon unberuehrt. Die zwei Welten mischen nie.
      fontSize: {
        // ZWEI Stufen, nicht fuenf. Bei einer Grundschrift von 90 % (index.css)
        // liegen fuenf Groessen zwischen 9 und 12,6 px — Abstaende unter einem
        // Pixel liest niemand als Ordnung, nur als Zufall. Rangfolge macht der
        // Editor ueber Fettung und Farbe, nicht ueber ein Achtel Millimeter.
        //
        // Beide Werte sind ABSICHTLICH die von text-xs/text-sm: damit aendert
        // das Einfuehren der Liste allein noch kein Aussehen. Sichtbar wird sie
        // erst dort, wo eine Zwerggroesse durch `ui` ersetzt wird.
        ui: ['0.75rem', { lineHeight: '1rem' }], // 10,8 px — der Normalfall
        'ui-titel': ['0.875rem', { lineHeight: '1.25rem' }], // 12,6 px — Panel-Titel
      },
      spacing: {
        // EINE Hoehe fuer alles, was man bedient: Knopf, Eingabefeld,
        // Auswahlfeld, Symbolknopf. Vorher standen ein Knopf (28,8) und das
        // Feld daneben (25,2) unterschiedlich hoch in derselben Zeile.
        // 25,2 px ist der Wert, den Felder und 23 der 31 Knoepfe schon hatten —
        // die Mehrheit gewinnt, das aendert am wenigsten.
        steuer: '1.75rem',
      },
      borderRadius: {
        // EINE Rundung, wie in index.css entschieden („EIN kleiner Radius,
        // 4px, fast kantig"). Diese Entscheidung kam bisher nirgends an:
        // md rechnete radius-2px (= 2 px) und wurde 35-mal benutzt, sm
        // rechnete radius-4px (= 0 px, also gar keine Rundung) und 14-mal.
        // Jetzt loesen alle drei Namen auf denselben Wert auf — dann ist es
        // egal, welchen jemand schreibt, und die Entscheidung gilt wirklich.
        lg: 'var(--radius)',
        md: 'var(--radius)',
        sm: 'var(--radius)',
      },
    },
  },
  plugins: [],
}
