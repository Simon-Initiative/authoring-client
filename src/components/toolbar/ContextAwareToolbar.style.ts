import chroma from 'chroma-js';
import colors from 'styles/colors';
import { disableSelect } from 'styles/mixins';

export const styles = {
  toolbar: {
    extend: [disableSelect],
    margin: [0, 10],
    padding: 5,
    width: 82,
    fontSize: 12,
    boxShadow: `4px 4px 8px ${colors.grayLight}`,
    color: colors.grayDarker,
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  unicodeIcon: {
    font: {
      style: 'normal',
      family: 'serif',
      weight: 700,
    },
  },
};
