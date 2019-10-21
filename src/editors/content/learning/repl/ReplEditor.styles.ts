import { JSSStyles } from 'styles/jss';
import colors from 'styles/colors';
import { disableSelect } from 'styles/mixins';

export const styles: JSSStyles = {
  EmbedActivityEditor: {
    extend: [disableSelect],
  },
};
