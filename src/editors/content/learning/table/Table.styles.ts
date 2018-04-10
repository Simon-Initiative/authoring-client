import * as chroma from 'chroma-js';
import { JSSStyles } from 'styles/jss';

const darkGray = '#aaaaaa';
const lightGray = '#eeeeee';

const CELL_SELECTION_COLOR = '#b30000';
const CELL_SELECTION_PADDING = 3;

export const styles: JSSStyles = {
  table: {
    borderCollapse: 'collapse',
    backgroundColor: 'transparent',
  },
  tableEditor: {
    marginLeft: '20px',
  },
  stripedRow: {
    backgroundColor: 'white',
  },
  regularRow: {
    backgroundColor: 'white',
  },
  cell: {
    border: '1px solid ' + darkGray,
    minWidth: '100px',
  },
  cellSelected: {

  },
  innerCell: {
    height: '100%',
    width: '100%',
    border: '2px solid transparent',
    padding: CELL_SELECTION_PADDING,

    '&.hovering': {
      border: [2, 'solid ', chroma(CELL_SELECTION_COLOR).brighten(1).hex()],
    },
  },
  innerCellSelected: {
    height: '100%',
    width: '100%',
    border: [2, 'solid', CELL_SELECTION_COLOR],
    padding: CELL_SELECTION_PADDING,
  },
  rowHeader: {
    width: '30px',
    border: '1px solid ' + darkGray,
    backgroundColor: lightGray,
    textAlign: 'left',
    '&:hover $dropdownLabel': {
      color: 'black',
    },
    '& $dropdownLabel': {
      color: darkGray,
    },
  },
  colHeader: {
    height: '25px',
    border: '1px solid ' + darkGray,
    backgroundColor: lightGray,
    textAlign: 'right',
    '&:hover $dropdownLabel': {
      color: 'black',
    },
    '& $dropdownLabel': {
      color: darkGray,
    },
  },
  dropdown: {
    float: 'right',
  },
  dropdownLabel: {
    color: darkGray,
  },
  cornerHeader: {
    border: '1px solid ' + darkGray,
    backgroundColor: lightGray,
    height: '25px',
  },
  menuIcon: {
    color: darkGray,
  },
};
