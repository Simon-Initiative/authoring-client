import { JSSStyles } from 'styles/jss';
import colors from 'styles/colors';
import { disableSelect } from 'styles/mixins';

export const styles: JSSStyles = {
  ReplEditor: {
    extend: [disableSelect],
    width: '100%',
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
