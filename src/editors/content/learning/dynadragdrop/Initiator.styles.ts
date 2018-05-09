import { JSSStyles } from 'styles/jss';
import { disableSelect } from 'styles/mixins';
import * as chroma from 'chroma-js';

export const styles: JSSStyles = {
  initiator: {
    extend: [disableSelect],
    display: 'inline-block',
    padding: 6,
    marginRight: 5,
    marginBottom: 5,
    borderRadius: 4,
    color: chroma('#E7F4FE').darken(3).hex(),
    backgroundColor: '#E7F4FE',
    boxShadow: '2px 2px 10px 0px rgba(155,165,173,1)',
    fontSize: 14,
    cursor: 'pointer',

    '& .dragHandleGrab': {
      marginRight: 4,
    },

    '&:active': {
      cursor: 'grabbing',
    },
  },
  removeBtn: {
    float: 'none',

    '& button': {
      padding: [0, 10, 3, 10],
      color: chroma('#E7F4FE').darken(3).hex(),
    },
  },
};
