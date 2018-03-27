import colors from 'styles/colors';
import { disableSelect } from 'styles/mixins';

export const SIDEBAR_WIDTH = 310;
export const SIDEBAR_CLOSE_ANIMATION_DURATION_MS = 200;

const SIDEBAR_CLOSE_ANIMATION_DURATION_S = SIDEBAR_CLOSE_ANIMATION_DURATION_MS / 1000;

export default {
  contextAwareSidebar: {
    display: 'flex',
    flexDirection: 'column',
    width: SIDEBAR_WIDTH,
    overflow: 'hidden',
    height: '100%',
    backgroundColor: '#fafafa',
    borderLeft: [[1, 'solid', colors.grayLight]],
  },

  sidebarRow: {
    '& p': {
      marginBottom: '.5rem',
    },
    '& .toggle-switch': {
      fontSize: '.8em',
    },
    '& input': {
      marginBottom: '6px',
    },
    marginBottom: '1rem',
  },

  sidebarRowLabel: {
    fontWeight: 600,
    color: colors.grayDarker,
  },

  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    width: SIDEBAR_WIDTH,
    padding: 10,
    overflowY: 'auto',
  },

  header: {
    extend: [disableSelect],
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 20,
    fontSize: 20,
  },

  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    marginTop: -2,

    '&:hover': {
      color: colors.hover,
    },

    '&:active': {
      color: colors.selection,
    },

    '& i': {
      fontSize: 16,
    },

    '&:focus': {
      outline: 0,
    },
  },

  sidebarContent: {

  },

  sidebarEmptyMsg: {
    color: colors.gray,
    fontSize: '.9em',
    marginTop: 80,
    textAlign: 'center',
  },

  sidebarGroup: {

  },

  sidebarGroupLabel: {
    marginTop: 10,
    marginBottom: 10,
    borderBottom: `1px solid ${colors.grayLighter}`,
    color: colors.gray,
    fontSize: 16,
    textTransform: 'uppercase',
  },

  // slide-in/out animations
  enter: {
    width: 0,
    opacity: 0,
    transition: `width ${SIDEBAR_CLOSE_ANIMATION_DURATION_S}s ease-out, \
      opacity ${SIDEBAR_CLOSE_ANIMATION_DURATION_S / 2}s ease-out`,
  },
  enterActive: {
    width: SIDEBAR_WIDTH,
    opacity: 1,
  },
  leave: {
    width: SIDEBAR_WIDTH,
    opacity: 1,
    transition: `width ${SIDEBAR_CLOSE_ANIMATION_DURATION_S}s ease-out, \
    opacity ${SIDEBAR_CLOSE_ANIMATION_DURATION_S / 2}s ease-out`,
  },
  leaveActive: {
    width: 0,
    opacity: 0,
  },
};
