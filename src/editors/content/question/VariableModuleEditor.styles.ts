import { JSSStyles } from 'styles/jss';
import colors from 'styles/colors';

export const styles: JSSStyles = {
  VariablesEditor: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 500,
    fontSize: 14,
  },
  source: {
    borderRadius: 4,
    boxShadow: 'inset 0px 0px 10px 0px #ABABAB',
  },
  splitPane: {
    display: 'flex',
  },
  evaluatedPanel: {
    height: '100%',
    flexBasis: 400,
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
    fontFamily: 'Inconsolata, monospace',
    fontSize: '14pt',
  },
  variableResult: {
    fontFamily: 'Inconsolata, monospace',
    fontSize: '14pt',
  },
  header: {
    flex: 1,
  },
};
