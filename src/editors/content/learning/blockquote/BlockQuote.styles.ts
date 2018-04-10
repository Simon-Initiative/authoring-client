import { JSSStyles } from 'styles/jss';
import distinct from 'styles/palettes/distinct';

export const styles: JSSStyles = {
  quoteWrapper: {
    borderLeft: '5px solid ' + distinct.distinctLavender,
  },
  quoteEditor: {
    '& .contiguousTextEditor': {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      border: '1px solid ' + distinct.distinctLavender,
    },
  },
};
