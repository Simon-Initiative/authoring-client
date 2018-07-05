import { JSSStyles } from 'styles/jss';
import colors from 'styles/colors';

export const styles: JSSStyles = {
  VariablesEditor: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 500,
  },
  buttonPanel: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addButton: {

  },
  testButton: {

  },
  removeButton: {

  },
  variable: {
    display: 'flex',
    paddingTop: '8px',
  },
  variableLabel: {
    fontFamily: 'monospace',
    fontSize: '10pt',
  },
  variableContent: {
    flexGrow: 1,
    paddingTop: '3px',
    paddingLeft: '3px',
  },
  variableRemove: {

  },
  header: {
    flex: 1,
  },
  variables: {
    display: 'flex',
    flexDirection: 'column',
  },
};
