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

    '& i': {
      fontSize: 16,
    },

    '&.small': {
      width: 36,
      height: 32,
    },
    '&.large': {
      width: 72,
      height: 64,
    },
    '&.wide': {
      width: 72,
      height: 32,
    },
  },
};
