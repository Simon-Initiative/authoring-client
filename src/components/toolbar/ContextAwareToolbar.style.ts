import chroma from 'chroma-js';
import colors from 'styles/colors';
import { disableSelect } from 'styles/mixins';

export default {
  toolbar: {
    extend: [disableSelect],
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'auto',
    overflowY: 'hidden',
    margin: [10, 10],
    padding: 5,
    height: props => props.hideLabels ? 74 : 92,
    fontSize: 12,
    borderBottom: [1, 'solid', colors.grayLight],
  },
  unicodeIcon: {
    font: {
      style: 'normal',
      family: 'serif',
      weight: 700,
    },
  },
  toolbarGroup: {
    flexShrink: 0,
    maxWidth: 300,
    marginRight: 5,
    paddingRight: 5,
    borderRight: '1px solid #ddd',

    '&:last-child': {
      marginRight: 0,
      paddingRight: 0,
      borderRight: 'none',
    },
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
  tbGroupItems: {
    display: 'flex',
    flexDirection: 'row',
    height: 64,
    overflow: 'hidden',
  },
  tbGroupLabel: {
    display: props => props.hideLabels ? 'none' : 'block',
    textAlign: 'center',
    textTransform: 'uppercase',
    color: colors.gray,
    borderBottom: props => `4px solid ${props.highlightColor || 'transparent'}`,
  },
  toolbarInsertGroup: {

  },
  toolbarFormatGroup: {
    maxWidth: 150,
  },
  toolbarContextGroup: {

  },
  toolbarActionsGroup: {
    maxWidth: 'initial',
  },
};
