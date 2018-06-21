import colors from 'styles/colors';
import { JSSStyles } from 'styles/jss';

export const styles: JSSStyles = {
  titleTextEditor: {
    position: 'relative',

  },
  contiguousTextEditor: {
    transition: 'all .2s ease-in-out',
    padding: '6px',
    // backgroundColor: 'transparent',
    backgroundColor: 'white',
    border: '2px solid #f3f3f4',
    borderRadius: 5,

    // padding: 6,
    '&:hover': {
      // backgroundColor: 'white',
      borderColor: 'rgb(76, 154, 255)',
    },
    '&:active': {
      // backgroundColor: 'white',
      borderColor: 'rgb(76, 154, 255)',
    },
  },
};
