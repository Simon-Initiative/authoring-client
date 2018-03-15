import colors from 'styles/colors';
import { disableSelect } from 'styles/mixins';

export const TOOLBAR_HIDE_ANIMATION_DURATION_MS = 200;

const TOOLBAR_HIDE_ANIMATION_DURATION_S = TOOLBAR_HIDE_ANIMATION_DURATION_MS / 1000;

export default {
  toolbar: {
    extend: [disableSelect],
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'auto',
    overflowY: 'hidden',
    margin: [10, 0],
    padding: 5,
    paddingBottom: 8,
    height: 100,
    fontSize: 12,
    color: colors.grayDark,
    borderBottom: [1, 'solid', colors.grayLight],
  },
  toolbarGroup: {
    width: 366,
  },
  toolbarGroupContainer: {
    overflowX: 'hidden',
    height: 86,
    flexShrink: 0,
    maxWidth: 400,
    padding: [0, 15],
    borderRight: '1px solid #ddd',

    '&.contextToolbar-enter': {
      maxWidth: 0,
      opacity: 0,
    },

    '&.contextToolbar-enter.contextToolbar-enter-active': {
      maxWidth: 400,
      opacity: 1,
    },

    '&.contextToolbar-leave': {
      maxWidth: 400,
      opacity: 1,
    },

    '&.contextToolbar-leave.contextToolbar-leave-active': {
      maxWidth: 0,
      opacity: 0,
    },

    transition: `max-width ${TOOLBAR_HIDE_ANIMATION_DURATION_S}s ease-in, \
      opacity ${TOOLBAR_HIDE_ANIMATION_DURATION_S}s ease-in`,
  },
  toolbarLayoutInline: {
    display: 'inline-block',
    height: 72,
  },
  toolbarLayoutGrid: {
    display: 'inline-block',
    width: 72,
    height: 72,
  },
  toolbarLayoutRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  toolbarLayoutColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  tbGroupItems: {
    display: 'flex',
    flexDirection: 'row',
    height: 64,
  },
  tbGroupLabel: {
    display: 'block',
    textAlign: 'center',
    textTransform: 'uppercase',
    color: colors.grayDark,
    borderBottom: props => `4px solid ${props.highlightColor || 'transparent'}`,
  },
  toolbarInsertGroup: {
    width: 336,
    paddingLeft: 0,
  },
  toolbarItemGroup: {
    width: 150,
  },
  toolbarActionsGroup: {
    width: 'initial',
    paddingRight: 0,
    borderRight: 'none',
  },
};
