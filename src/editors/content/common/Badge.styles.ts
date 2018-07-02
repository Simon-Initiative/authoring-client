import { JSSStyles } from 'styles/jss';
import colors from 'styles/colors';

export const styles: JSSStyles = {
  Badge: {
    display: 'inline-block',
    minWidth: 10,
    padding: [3, 7],
    marginTop: -3,
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1,
    color: colors.white,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
    backgroundColor: colors.gray,
    borderRadius: 10,
  },
};
