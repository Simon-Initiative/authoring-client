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
  dropdown: {
    '& button': {
      color: colors.grayDarker,
    },
  },
  showOnRight: {
    float: 'right',
  },
  headerRow: {
    '& $cell': {
      fontWeight: 600,
      backgroundColor: colors.grayLight,
      textAlign: 'center',
    },
  },
  cell: {
    border: [[1, 'solid', colors.grayLight]],
    minWidth: 50,
    minHeight: 50,
    position: 'relative',

    '&:hover': {
      '& .TargetToggle': {
        display: 'initial',
      },
    },
  },
  cellHeader: {
    padding: 4,
    border: [[1, 'solid', 'transparent']],
    borderBottom: [[1, 'solid', colors.grayLight]],
  },
  initiators: {
    marginTop: 10,
  },
};
