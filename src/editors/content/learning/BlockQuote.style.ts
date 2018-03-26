import distinct from 'styles/palettes/distinct';

export default {
  quoteWrapper: {
    borderLeft: '20px solid ' + distinct.distinctLavender,
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
