import colors from 'styles/colors';
import { JSSStyles } from 'styles/jss';

export const styles: JSSStyles = {
  titleTextEditor: {
    position: 'relative',

    '&:hover $hoverUnderline': {
      width: '100%',
      transition: 'width 200ms ease, opacity 100ms ease',
      opacity: 1,
    },

    '&:hover $editIcon': {
      opacity: 1,
      transition: 'opacity 200ms ease',
    },
  },
  contiguousTextEditor: {
    backgroundColor: 'transparent',
    border: 'none',
    padding: 0,
  },
  editIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    color: colors.selection,
    opacity: 0,
  },
  hoverUnderline: {
    borderBottom: [1, 'solid', colors.selection],
    width: '50%',
    opacity: 0,
  },
};
