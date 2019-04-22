import colors from 'styles/colors';
import { JSSStyles } from 'styles/jss';

export const styles: JSSStyles = {
  LoadingSpinner: {
    textAlign: 'center',
    color: colors.gray,

    '&i': {
      margin: '0 5px',
      animationDuration: '1s',
      '-webkit-animation-duration': '1s',
    },
  },
  sizeSmall: {
    fontSize: '0.8em',
  },
  sizeNormal: {
    fontSize: '1em',
  },
  sizeLarge: {
    fontSize: '1.2em',
  },
};
