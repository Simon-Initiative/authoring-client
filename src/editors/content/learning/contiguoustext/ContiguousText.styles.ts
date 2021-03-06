import { JSSStyles } from 'styles/jss';

export const styles: JSSStyles = {
  activeStyle: {
    color: 'blue',
  },
  contiguousText: {
    padding: 5,
    backgroundColor: 'white',
  },
  viewOnly: {
    backgroundColor: 'transparent',
    border: 'none',
    padding: 0,
  },
  disabled: {
    backgroundColor: 'transparent',
  },
  showBorder: {
    border: '1px solid #ced4da',
    borderRadius: 4,
  },
  contiguousTextSlateEditor: {
    '& p:last-child': {
      marginBottom: 0,
    },
  },
};
