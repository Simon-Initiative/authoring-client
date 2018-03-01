import colors from 'styles/colors';

export const styles = {
  toolbarButton: {
    background: 'transparent',
    fontSize: 12,
    textAlign: 'center',
    border: '1px solid transparent',
    cursor: 'pointer',
    '&:hover': {
      color: colors.hover,
      border: `1px solid ${colors.grayLighter}`,
    },

    '&[disabled]': {
      color: colors.gray,

      '&:hover': {
        cursor: 'default',
        color: colors.gray,
        border: '1px solid transparent',
      },
    },

    '& i': {
      fontSize: 16,
    },

    '&.small': {
      width: 36,
      minHeight: 32,
    },
    '&.large': {
      width: 72,
      minHeight: 64,
    },
    '&.wide': {
      width: 72,
      minHeight: 32,
    },
  },
};
