import { JSSStyles } from 'styles/jss';
import colors from 'styles/colors';

export const styles: JSSStyles = {
  customEditor: {
    paddingLeft: 10,
  },
  instructions: {
    fontSize: 14,
    color: colors.grayDark,
    maxWidth: 800,
    marginTop: 10,
  },
  dynaDropTable: {

  },
  header: {
    padding: 4,
  },
  cell: {
    border: [[1, 'solid', colors.grayLight]],
    height: 40,
    padding: 4,
    minWidth: 50,
    minHeight: 50,
  },
  initiators: {
    marginTop: 10,
  },
};
