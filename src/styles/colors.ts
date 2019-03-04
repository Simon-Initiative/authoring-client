import * as chroma from 'chroma-js';

// Base Colors
export default {
  black: 'black',
  white: 'white',
  offwhite: '#f0f4fa',
  blue: '#0067cb',
  blueLight: '#a3b8cc',
  pink: 'pink',

  grayBase: '#999',
  get grayDarkest() { return chroma(this.grayBase).darken(2).hex(); },
  get grayDarker() { return chroma(this.grayBase).darken(1.5).hex(); },
  get grayDark() { return chroma(this.grayBase).darken().hex(); },
  get gray() { return chroma(this.grayBase).hex(); },
  get grayLight() { return chroma(this.grayBase).brighten().hex(); },
  get grayLighter() { return chroma(this.grayBase).brighten(1.5).hex(); },
  get grayLightest() { return chroma(this.grayBase).brighten(2).hex(); },

  youtubeRed: '#ff0000',

  // Indication Colors
  primary: '#608AD8',
  secondary: '#a3b8cc',
  success: '#3FB618',
  info: '#9954BB',
  warning: '#FFC118',
  danger: '#da3232',
  pageBackground: '#F8F9Fa',

  // Action Colors
  get remove() { return this.danger; },
  get add() { return chroma(this.primary).darken().hex(); },

  selection: '#608AD8',
  get hover() { return chroma(this.selection).brighten().hex(); },
  get active() { return chroma(this.selection).darken(2).hex(); },

  contentSelection: '#eca037',

  // Misc
  pureApple: '#6ab04c',
};
