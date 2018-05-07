import { JSSStyles } from 'styles/jss';
import colors from 'styles/colors';

export const styles: JSSStyles = {
  dynaDropTarget: {
    backgroundColor: colors.grayLighter,
    border: [[1, 'solid', colors.grayLight]],
    height: 40,
    padding: 4,
  },
  targetHover: {
    border: [[2, 'dashed', '#f4bf42']],
  },
};
