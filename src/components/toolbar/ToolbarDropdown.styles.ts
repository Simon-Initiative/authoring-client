import { JSSStyles } from 'styles/jss';
import colors from 'styles/colors';
import * as chroma from 'chroma-js';

export const styles: JSSStyles = {
  toolbarDropdown: {
    '& button': {
      cursor: 'pointer',
      '&:active': {
        color: colors.selection,
      },
      '&:focus': {
        outline: 0,
      },

      '&[disabled]': {
        cursor: 'default',
        color: colors.gray,
      },
    },
  },
  toolbarDropdownButton: {
    display: 'flex',
    flexDirection: 'row',
    background: 'transparent',
    fontSize: 12,
    textAlign: 'center',
    verticalAlign: 'top',
    border: '1px solid transparent',

    '&:hover': {
      color: colors.hover,
      border: `1px solid ${colors.grayLighter}`,
    },
    '&[disabled]': {
      '&:hover': {
        color: colors.gray,
        border: '1px solid transparent',
      },
    },

    '&.selected': {
      backgroundColor: chroma.mix(colors.selection, 'white', 0.75).hex(),
      border: `1px solid ${chroma.mix(colors.selection, 'white', 0.75).hex()}`,
    },

    '& .droparrow': {
      margin: [0, 5],
    },

    '& i': {
      fontSize: 16,
    },
    '&.tiny': {
      width: 24,
      height: 32,
    },
    '&.small': {
      width: props => props.hideArrow ? 36 : 52,
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
