const darkGray = '#aaaaaa';
const lightGray = '#eeeeee';

export default {
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
    '&:hover': {
      border: '2px solid #ff9999',
    },
  },
  innerCellSelected: {
    height: '100%',
    width: '100%',
    border: '2px solid #b30000',
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
