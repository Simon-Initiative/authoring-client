import { JSSStyles } from 'styles/jss';
import { disableSelect } from 'styles/mixins';
import colors from 'styles/colors';
import distinct from 'styles/palettes/distinct';

export const styles: JSSStyles = {
  dynaDropTarget: {
    extends: [disableSelect],
    backgroundColor: colors.grayLighter,
    border: [[1, 'solid', colors.grayLight]],
    height: 40,
    padding: 4,
    color: colors.gray,
    fontWeight: 600,
  },
  targetHover: {
    border: [[2, 'dashed', '#f4bf42']],
  },
};
