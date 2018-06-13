import { JSSStyles } from 'styles/jss';
import colors from 'styles/colors';

export const styles: JSSStyles = {
  CircleEditor: {
    fill: colors.selection,
    fillOpacity: 0.5,
    stroke: 'none',
    cursor: 'pointer',

    '&:hover': {
      fill: colors.hover,
      stroke: colors.hover,
    },
    '&:active': {
      cursor: 'grabbing',
    },
  },
  selected: {
    stroke: colors.selection,
    strokeWidth: 2,
    strokeOpacity: 0.8,
    cursor: 'grab',

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
  label: {
    stroke: 'none',
    fill: colors.white,
    fontSize: 20,
    fontWeight: 600,
    pointerEvents: 'none',
  },
  ew: {
    cursor: 'ew-resize',
  },
};
