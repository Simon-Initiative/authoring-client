import { JSSStyles } from 'styles/jss';
import colors from 'styles/colors';

export const styles: JSSStyles = {
  targetToggle: {
    position: 'absolute',
    display: 'none',
    top: 4,
    right: 6,
    cursor: 'pointer',
    color: colors.grayDark,

    '&:hover': {
      color: colors.hover,
    },

    '&:active': {
      color: colors.selection,
    },
  },
  disabled: {
    cursor: 'default',
    color: colors.grayLight,

    '&:hover': {
      color: colors.grayLight,
    },

    '&:active': {
      color: colors.grayLight,
    },
  },
};
