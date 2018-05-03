import { JSSStyles } from 'styles/jss';
import colors from 'styles/colors';
import { disableSelect } from 'styles/mixins';
import * as chroma from 'chroma-js';

export const styles: JSSStyles = {
  customEditor: {

  },
  dynaDropTable: {

  },
  cell: {
    border: [[1, 'solid', colors.grayLight]],
    width: 50,
    height: 40,
    padding: 4,
  },
  targetCell: {
    backgroundColor: colors.grayLighter,
  },
  initiators: {
    marginTop: 10,
  },
  initiator: {
    extend: [disableSelect],
    display: 'inline-block',
    padding: 6,
    marginRight: 5,
    marginBottom: 5,
    borderRadius: 4,
    color: chroma('#E7F4FE').darken(.4),
    backgroundColor: '#E7F4FE',
    boxShadow: '2px 2px 10px 0px rgba(155,165,173,1)',
    fontSize: 14,
    cursor: 'grab',

    '& .dragHandleGrab': {
      marginRight: 4,
    },

    '&:active': {
      cursor: 'grabbing',
    },
  },
};
