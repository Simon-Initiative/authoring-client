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
  '.ace_editor': {
    fontSize: 14,
  },
  error: {
    color: colors.danger,
  },
  evaluated: {
    color: colors.black,
  },
  variableLabel: {
    fontFamily: 'Inconsolata, monospace',
    fontSize: '14px',
  },
  variableResult: {
    fontFamily: 'Inconsolata, monospace',
    fontSize: '14px',
  },
  header: {
    flex: 1,
  },
};
