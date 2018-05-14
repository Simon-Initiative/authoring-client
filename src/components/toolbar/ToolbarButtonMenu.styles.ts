import { JSSStyles } from 'styles/jss';
import colors from 'styles/colors';
import * as chroma from 'chroma-js';

export const styles: JSSStyles = {
  wideMenu: {
    display: 'inline-block',
    width: 98,
  },
  toolbarButtonMenu: {
    background: 'transparent',
    fontSize: 12,
    color: colors.grayDarkest,
    textAlign: 'center',
    verticalAlign: 'top',
    border: '1px solid transparent',
    cursor: 'pointer',
    width: 98,
    height: 32,

    '&:hover': {
      color: colors.hover,
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
  },
  quadMatrix: {
    display: 'flex',
    flexDirection: 'row',
  },
  matrixCol1: {
    display: 'flex',
    flexDirection: 'column',
  },
  matrixCol2: {
    display: 'flex',
    flexDirection: 'column',
  },
  quadDropdown: {
    maxWidth: 12,
    width: 12,
    minHeight: 72,
    height: 72,
    borderLeft: '1px solid ' + colors.grayLighter,
  },
  quadButton: {
    border: 'none',
    paddingTop: 26,
    paddingLeft: 0,
    background: 'transparent',
    outline: 0,
    boxShadow: 'none',
    '&:focus': {
      outline: 0,
    },
  },
  quadMenu: {
    background: 'transparent',
    fontSize: 12,
    color: colors.grayDarkest,
    border: '1px solid transparent',
    cursor: 'pointer',
    width: 85,
    height: 63,

    '&:hover': {
      color: colors.hover,
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
  },
};
