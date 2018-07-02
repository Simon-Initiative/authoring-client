import { JSSStyles } from 'styles/jss';

const gray = '#7a7877';
const offWhite = '#efefef';

export const styles: JSSStyles = {
  globalError: {
    backgroundColor: gray,
    color: offWhite,
    width: '100%',
    height: '100%',
    margin: 'auto',
    textAlign: 'center',
  },
  globalContent: {
    position: 'relative',
    top: '50%',
    transform: 'translateY(-50%)',
  },
};
