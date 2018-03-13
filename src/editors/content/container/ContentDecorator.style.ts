import chroma from 'chroma-js';
import colors from 'styles/colors';
import { getContentColor } from 'editors/content/utils/content';

const gripBGTemplate = (color: string) => `-webkit-repeating-radial-gradient(\
  center center, ${color}, ${color} 1px, transparent 1px, transparent 100%)`;

export default {
  contentDecorator: {
    display: 'flex',
    flexDirection: 'row',

    '&:hover': {
      '& $handle': {
        borderLeft: props => '2px solid ' + getContentColor(props.contentType),
      },
    },
  },
  handle: {
    width: 18,
    marginRight: 4,
    cursor: 'grab',
    display: 'flex',
    flexDirection: 'column',
    color: 'rgba(0,0,0,.2)',
    borderLeft: '2px solid transparent',
    padding: [0, 2, 2, 2],

    '&.active-content': {
      color: colors.white,
      backgroundColor: props => getContentColor(props.contentType),
      borderColor: props => getContentColor(props.contentType),
      borderLeft: '2px solid',
      borderTopLeftRadius: 4,
      borderBottomLeftRadius: 4,

      '& $grip': {
        backgroundImage: props => gripBGTemplate(
          chroma(getContentColor(props.contentType)).brighten(1).hex()),
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
  },
};
