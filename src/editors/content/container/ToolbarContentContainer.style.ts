const BORDER_STYLE = '1px solid #ced4da';

export default {
  toolbarContentContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  miniToolbar: {
    display: 'flex',
    flexDirection: 'row',
    background: '#fafafa',
    border: BORDER_STYLE,
    borderBottom: 'none',
    padding: 2,
  },
  moreLabel: {
    marginLeft: 8,
  },
  toolbarButton: {
    width: 36,
    height: 32,
  },
  content: {
    flex: 1,

    '& .content-decorator': {
      border: BORDER_STYLE,
    },

    '& .contiguousTextEditor': {
      border: 'none',
      borderRadius: 0,
    },
  },
};
