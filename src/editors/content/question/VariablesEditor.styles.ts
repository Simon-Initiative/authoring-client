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
  error: {
    color: colors.danger,
  },
  evaluated: {
    color: colors.black,
  },
  variableLabel: {
    fontFamily: 'monospace',
    fontSize: '9pt',
  },
  variableResult: {
    fontFamily: 'monospace',
    fontSize: '9pt',
  },
  header: {
    flex: 1,
  },
};
