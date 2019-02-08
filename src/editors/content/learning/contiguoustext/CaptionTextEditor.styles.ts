import colors from 'styles/colors';
import * as chroma from 'chroma-js';
import { JSSStyles } from 'styles/jss';

export const styles: JSSStyles = {
  captionTextEditor: {

  },
  content: {
    display: 'flex',
    flexDirection: 'row',
  },
  flex: {
    flex: 1,
  },
  createCaptionBtn: {
    width: '100%',
    padding: [4, 10],
    color: colors.gray,
    background: colors.grayLighter,
    borderRadius: 6,
    fontSize: 12,
    cursor: 'text',

    '&:hover': {
      background: chroma(colors.grayLighter).brighten(0.1).hex(),
    },
  },
  removeBtn: {
    padding: [2, 4],
  },
};
