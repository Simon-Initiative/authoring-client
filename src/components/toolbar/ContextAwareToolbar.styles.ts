import { JSSStyles } from 'styles/jss';
import colors from 'styles/colors';
import { disableSelect } from 'styles/mixins';

export const TOOLBAR_HIDE_ANIMATION_DURATION_MS = 200;

const TOOLBAR_HIDE_ANIMATION_DURATION_S = TOOLBAR_HIDE_ANIMATION_DURATION_MS / 1000;
const TOOLBAR_GROUP_MAX_WIDTH = 600;
const TOOLBAR_COL_WIDTH = 32;
const TOOLBAR_COL_HEIGHT = 32;
const TOOLBAR_LABEL_HEIGHT = 22;
const TOOLBAR_TOP_PADDING = 5;

export const styles: JSSStyles = {
  toolbar: {
    extend: [disableSelect],
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'auto',
    overflowY: 'hidden',
    paddingLeft: 5,
    paddingRight: 5,
    height: 92,
    fontSize: 12,
    color: colors.grayDark,
    borderBottom: [1, 'solid', colors.grayLight],
    backgroundColor: colors.white,

    '& .dropdown-item': {
      cursor: 'pointer',

      '&[disabled]': {
        cursor: 'default',
      },

      '&:focus': {
        outline: 0,
      },
    },

    '& .unicode-icon': {
      padding: [0, 4],
      font: {
        style: 'normal',
        family: 'serif',
        weight: 700,
      },
    },
  },
  toolbarGroup: {
    padding: [0, 10],
    maxWidth: TOOLBAR_GROUP_MAX_WIDTH,
  },
  toolbarGroupContainer: {
    overflowX: 'hidden',
    overflowY: 'hidden',
    height: (TOOLBAR_COL_HEIGHT * 2) + TOOLBAR_LABEL_HEIGHT + TOOLBAR_TOP_PADDING,
    flexShrink: 0,
    maxWidth: TOOLBAR_GROUP_MAX_WIDTH,
    padding: [TOOLBAR_TOP_PADDING, 0, 0, 0],
    borderRight: '1px solid #ddd',

    '&.contextToolbar-enter': {
      maxWidth: 0,
      opacity: 0,
    },

    '&.contextToolbar-enter.contextToolbar-enter-active': {
      maxWidth: TOOLBAR_GROUP_MAX_WIDTH,
      opacity: 1,
    },

    '&.contextToolbar-leave': {
      maxWidth: TOOLBAR_GROUP_MAX_WIDTH,
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
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: TOOLBAR_COL_WIDTH * 2,
  },
  toolbarLayoutGrid: {
    display: 'inline-block',
    width: TOOLBAR_COL_WIDTH * 2,
    height: 64,
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
    height: TOOLBAR_COL_HEIGHT * 2,
    overflow: 'hidden',
  },
  tbGroupLabel: {
    display: 'block',
    height: TOOLBAR_LABEL_HEIGHT,
    textAlign: 'center',
    textTransform: 'uppercase',
    color: colors.grayDark,
    borderBottom: props => `4px solid ${props.highlightColor || 'transparent'}`,
  },
  toolbarInsertGroup: {
    paddingLeft: 0,
  },
  toolbarActionsGroup: {
    paddingRight: 0,
    borderRight: 'none',
  },
  tbNoAdvancedControls: {
    textAlign: 'center',
    overflow: 'hidden',
  },
  tbVerticallyCentered: {
    height: TOOLBAR_COL_HEIGHT * 2,
    display: 'flex',
    alignItems: 'center',
  },
};
