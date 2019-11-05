import { JSSStyles } from 'styles/jss';
import colors from 'styles/colors';
import { disableSelect } from 'styles/mixins';

export const styles: JSSStyles = {
  ReplEditor: {
    extend: [disableSelect],
    width: '100%',
  },
  replActivityLabel: {
    color: '#666666',
    marginBottom: 10,
  },
  prompt: {
    marginBottom: 10,
  },
  textarea: {
    padding: 5,
    backgroundColor: 'white',
    border: '1px solid #ced4da',
    borderRadius: 4,

    '& p:last-child': {
      marginBottom: 0,
    },
  },
  showCodeEditorBtn: {
    marginRight: 10,
  },
  combined: {
    marginTop: 20,
    width: 700,
  },
  splitPanel: {
    height: 250,
    marginTop: 10,
  },
  editor: {
    position: 'relative',
    display: 'inline-block',
    height: 250,
    width: 350,
    border: '2px solid #CCC',
    verticalAlign: 'top',
  },
  console: {
    position: 'relative',
    display: 'inline-block',
    height: 250,
    width: 350,
    backgroundColor: 'black',
    border: '2px solid #CCC',
    margin: [0, 'auto'],
    marginTop: 0,
    verticalAlign: 'top',
  },
};
