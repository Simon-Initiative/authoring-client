import colors from 'styles/colors';
import { disableSelect } from 'styles/mixins';

export const TOOLBAR_HIDE_ANIMATION_DURATION_MS = 250;

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
    maxWidth: 366,
    minWidth: 200,
  },
  toolbarGroupContainer: {
    overflowX: 'hidden',
    height: 86,
    flexShrink: 0,
    maxWidth: 400,
    marginRight: 5,
    paddingRight: 5,
    borderRight: '1px solid #ddd',

    '&:last-child': {
      marginRight: 0,
      paddingRight: 0,
      borderRight: 'none',
    },

    '&.hide': {
      maxWidth: 0,
      opacity: 0,
      marginRight: 0,
      paddingRight: 0,
      borderRight: 'none',
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
  },
  toolbarFormatGroup: {
    width: 150,
  },
  toolbarActionsGroup: {
    width: 'initial',
  },
};
