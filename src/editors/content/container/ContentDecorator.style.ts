import chroma from 'chroma-js';
import colors from 'styles/colors';
import { disableSelect } from 'styles/mixins';
import { getContentColor } from 'editors/content/utils/content';

const gripBGTemplate = (color: string) => `-webkit-repeating-radial-gradient(\
  center center, ${color}, ${color} 1px, transparent 1px, transparent 100%)`;

export default {
  contentDecorator: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
  },
  hover: {
    '& > $handle': {
      // display: 'flex',
      left: -18,
      opacity: 1,
      cursor: 'pointer',
      borderLeft: props => '2px solid ' + getContentColor(props.contentType),

      transition: 'opacity .1s ease-in',
    },
  },
  handle: {
    extend: [disableSelect],
    position: 'absolute',
    zIndex: 999,
    top: 0,
    left: -14,
    width: 18,
    height: '100%',
    flexDirection: 'column',
    color: 'rgba(0,0,0,.2)',
    borderLeft: '2px solid transparent',
    padding: [0, 2, 2, 2],
    // display: 'none',         // switch opacity to diplay to disable invisible handle grab
    display: 'flex',
    opacity: 0,
    backgroundColor: '#f1f1f1',

    '&.active-content': {
      // display: 'flex',
      opacity: 1,
      left: -22,
      width: 22,
      color: colors.white,
      backgroundColor: props => getContentColor(props.contentType),
      borderColor: props => getContentColor(props.contentType),
      borderLeft: '2px solid',
      borderTopLeftRadius: 4,
      borderBottomLeftRadius: 4,

      transition: 'left .1s ease-in, width .1s ease-in, margin-left .1s ease-in',

      '& $grip': {
        backgroundImage: props => gripBGTemplate(
          chroma(getContentColor(props.contentType)).brighten(1).hex()),
      },

      '& $label': {
        marginLeft: 2,
      },

      '& .contiguousTextEditor': {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
      },
    },
  },
  label: {
    font: {
      size: 11,
    },

    '& i.unicode-icon': {
      font: {
        size: 14,
      },
      marginLeft: 1,
    },
  },
  grip: {
    flex: 1,
    backgroundImage: gripBGTemplate('rgba(0,0,0,0.2)'),
    backgroundRepeat: 'repeat',
    backgroundSize: '4px 4px',
  },
  content: {
    flex: 1,

    '&.active-content .contiguousTextEditor': {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
  },
};
