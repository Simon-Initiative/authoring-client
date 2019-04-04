import { JSSStyle } from 'styles/jss';
import colors from './colors';

export const disableSelect: JSSStyle = {
  userSelect: 'none',
};

export const enableSelect: JSSStyle = {
  userSelect: 'text',
};

export const ellipsizeOverflow: JSSStyle = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flexFlow: 'row nowrap',
};

export const link: JSSStyle = {
  color: colors.primary,
  cursor: 'pointer',

  '&:hover': {
    color: colors.hover,
    textDecoration: 'underline',
  },
};
