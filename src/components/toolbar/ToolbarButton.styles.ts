import { JSSStyles } from 'styles/jss';
import colors from 'styles/colors';
import * as chroma from 'chroma-js';

export const styles: JSSStyles = {
  toolbarButton: {
    background: 'transparent',
    fontSize: 12,
    color: colors.grayDarkest,
    textAlign: 'center',
    verticalAlign: 'center',
    border: '1px solid transparent',
    cursor: 'pointer',

    '&:hover': {
      color: colors.selection,
      border: `1px solid ${colors.grayLighter}`,
    },
    '&:active': {
      color: colors.selection,
    },
    '&:focus': {
      outline: 0,
    },

    '&[disabled]': {
      color: colors.grayLight,

      '&:hover': {
        cursor: 'default',
        color: colors.grayLight,
        border: '1px solid transparent',
      },
    },

    '&.selected': {
      backgroundColor: chroma.mix(colors.selection, 'white', 0.75).hex(),
      border: `1px solid ${chroma.mix(colors.selection, 'white', 0.75).hex()}`,
    },

    '& i': {
      fontSize: 16,

      'not(.fa)': {
        font: {
          style: 'normal',
          family: 'serif',
          weight: 700,
        },
      },
    },

    '&.small': {
      width: 36,
      height: 32,

      '& i': {
        fontSize: 16,
      },
    },
    '&.large': {
      minWidth: 72,
      height: 64,

      '& i': {
        fontSize: 24,
      },
    },
    '&.wide': {
      minWidth: 86,
      maxWidth: 86,
      height: 32,
      textAlign: 'left',

      '& i': {
        width: 18,
      },
    },
    '&.full': {
      width: '100%',
      height: 32,
      textAlign: 'left',

      '& i': {
        width: 18,
      },
    },
    '&.extraWide': {
      minWidth: 120,
      maxWidth: 120,
      height: 32,
      textAlign: 'left',
    },
    '&.fit': {
      height: 32,
      textAlign: 'left',
    },
  },
};
