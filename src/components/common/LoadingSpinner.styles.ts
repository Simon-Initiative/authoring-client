import colors from 'styles/colors';
import { JSSStyles } from 'styles/jss';

export const styles: JSSStyles = {
  LoadingSpinner: {
    padding: '20px 0',
    textAlign: 'center',
    fontSize: '0.8em',
    color: colors.gray,

    '&i': {
      margin: '0 5px',
      animationDuration: '1s',
      '-webkit-animation-duration': '1s',
    },
  },
};