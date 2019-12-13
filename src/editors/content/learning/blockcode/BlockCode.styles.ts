import { JSSStyles } from 'styles/jss';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import colors from 'styles/colors';

export const styles: JSSStyles = {
  codeEditor: {
    '& .contiguousTextEditor': {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      border: '1px solid ' + CONTENT_COLORS.BlockCode,
      color: 'black',
      backgroundColor: colors.white,
      fontFamily: 'Inconsolata, Consolas, monospace',
    },
  },
  codeEditorWrapper: {
    borderLeft: '5px solid ' + CONTENT_COLORS.BlockCode,
  },
};
