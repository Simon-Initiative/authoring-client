import { JSSStyles } from 'styles/jss';
import colors from 'styles/colors';

export const styles: JSSStyles = {
  RectangleEditor: {

  },
  selected: {
    cursor: [['grab'], '!important'],

    '&:hover': {
      fill: [[colors.selection], '!important'],
      stroke: [[colors.selection], '!important'],
    },
  },
  handle: {
    stroke: colors.white,
    strokeWidth: 2,
    fill: colors.selection,
    boxShadow: '0px 0px 1px 1px rgba(0,0,0,0.75)',
  },
  nesw: {
    cursor: 'nesw-resize',
  },
  nwse: {
    cursor: 'nwse-resize',
  },
};
