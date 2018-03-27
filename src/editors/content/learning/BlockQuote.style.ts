import distinct from 'styles/palettes/distinct';

export default {
  quoteWrapper: {
    borderLeft: '5px solid ' + distinct.distinctLavender,
  },
  quoteEditor: {
    fontSize: 20,
    '& .contiguousTextEditor': {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      border: '1px solid ' + distinct.distinctLavender,
    },
  },
};
