import { css } from 'lit'

export const kartenAbstandStil = css`
  ::slotted(:not([hat-reiter])) { margin-top: 24px; }
  slot { display: contents; }
`
