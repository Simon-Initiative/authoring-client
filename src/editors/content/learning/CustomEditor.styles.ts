import { JSSStyles } from 'styles/jss';
import colors from 'styles/colors';
import { disableSelect } from 'styles/mixins';

export const styles: JSSStyles = {
  customEditor: {

  },
  customEditorOther: {
    extend: [disableSelect],
    padding: [10, 4],
    background: colors.grayLighter,
    border: [[2, 'solid', colors.grayLight]],
  },
};
