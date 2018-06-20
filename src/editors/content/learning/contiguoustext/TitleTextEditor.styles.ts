import colors from 'styles/colors';
import { JSSStyles } from 'styles/jss';

export const styles: JSSStyles = {
  titleTextEditor: {
    position: 'relative',
    padding: '6px',
    border: '2px solid #f3f3f4',
    transition: 'all .2s ease-in-out',
    borderRadius: 4,

    '&:hover': {
      backgroundColor: 'white',
    },
    '&:focus': {
      backgroundColor: 'white',
      borderColor: 'rgb(76, 154, 255)',
    },
    '&:active': {
      backgroundColor: 'white',
      borderColor: 'rgb(76, 154, 255)',
    },
  },
  contiguousTextEditor: {
    // backgroundColor: 'transparent',
    '&:focus': {
      backgroundColor: 'white',
      borderColor: 'rgb(76, 154, 255)',
    },
    '&:active': {
      backgroundColor: 'white',
      borderColor: 'rgb(76, 154, 255)',
    },
  },
};
