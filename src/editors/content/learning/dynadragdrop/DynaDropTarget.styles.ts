import { JSSStyles } from 'styles/jss';
import { disableSelect } from 'styles/mixins';
import colors from 'styles/colors';

export const styles: JSSStyles = {
  dynaDropTarget: {
    extend: [disableSelect],
    backgroundColor: colors.grayLighter,
    padding: 4,
    color: colors.gray,
    fontWeight: 600,
  },
  label: {
    margin: 5,
    whiteSpace: 'nowrap',
  },
  targetHover: {
    border: [[2, 'dashed', 'transparent']],
  },
  targetHovered: {
    border: [[2, 'dashed', '#f4bf42']],
  },
};
