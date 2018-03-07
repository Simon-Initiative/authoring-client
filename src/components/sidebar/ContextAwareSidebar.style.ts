import chroma from 'chroma-js';
import colors from 'styles/colors';
import { disableSelect } from 'styles/mixins';

export const SIDEBAR_WIDTH = 300;
export const SIDEBAR_CLOSE_ANIMATION_DURATION_MS = 200;

const SIDEBAR_CLOSE_ANIMATION_DURATION_S = SIDEBAR_CLOSE_ANIMATION_DURATION_MS / 1000;

export default {
  contextAwareSidebar: {
    display: 'flex',
    flexDirection: 'column',
    width: SIDEBAR_WIDTH,
    overflow: 'hidden',
  },

  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    width: SIDEBAR_WIDTH,
    padding: 10,
    paddingTop: 0,
  },

  header: {
    extend: [disableSelect],
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
    fontSize: 20,
  },

  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    marginTop: -2,

    '&:hover': {
      color: colors.remove,
    },

    '&:active': {
      color: chroma(colors.remove).brighten(1).hex(),
    },

    '& i': {
      fontSize: 16,
    },

    '&:focus': {
      outline: 0,
    },
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
