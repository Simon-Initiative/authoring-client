import colors from 'styles/colors';
import chroma from 'chroma-js';

export default {
  toolbarButton: {
    background: 'transparent',
    fontSize: 12,
    textAlign: 'center',
    verticalAlign: 'top',
    border: '1px solid transparent',
    cursor: 'pointer',
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
      color: colors.gray,

      '&:hover': {
        cursor: 'default',
        color: colors.gray,
        border: '1px solid transparent',
      },
    },

    '&.selected': {
      backgroundColor: chroma.mix(colors.selection, 'white', 0.75).hex(),
      border: `1px solid ${chroma.mix(colors.selection, 'white', 0.75).hex()}`,
    },

    '& i': {
      fontSize: 16,
    },

    '&.small': {
      width: 36,
      height: 32,
    },
    '&.large': {
      minWidth: 72,
      height: 64,

      '& i': {
        fontSize: 24,
      },
    },
    '&.wide': {
      minWidth: 72,
      height: 32,
    },
  },
};
