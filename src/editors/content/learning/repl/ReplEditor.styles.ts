import { JSSStyles } from 'styles/jss';
import colors from 'styles/colors';
import { disableSelect } from 'styles/mixins';

export const styles: JSSStyles = {
  ReplEditor: {
    extend: [disableSelect],
    width: '100%',

    '& h4': {
      fontSize: 20,
    }
  },
  replActivityLabel: {
    color: '#666666',
    marginBottom: 10,
  },
  subtext: {
    color: '#666666',
    marginBottom: 10,
  },
  explanation: {
    color: '#666666',
    marginBottom: 10,
    fontSize: 14,

    '& .help-popover-container': {
      maxWidth: 500,
    }
  },
  prompt: {
    marginBottom: 10,
    width: 700,
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
  inlineTextInput: {
    marginLeft: 10,
    padding: 5,
    backgroundColor: 'white',
    border: '1px solid #ced4da',
    borderRadius: 4,
  },
  showCodeEditorToggle: {
    marginRight: 10,
  },
  isGradedToggle: {
    marginTop: 10,
    marginBottom: 10,
  },
  combined: {
    marginTop: 10,
    marginBottom: 10,
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
  options: {
    marginTop: 20,
    marginBottom: 10,
  },
  gradingEditor: {
    marginTop: 30,
    marginBottom: 10,
    maxWidth: 700,
  },
  testCases: {
    marginTop: 20,
    marginBottom: 10,
    border: [1, 'solid', '#ddd'],
    borderRadius: 2,
    backgroundColor: colors.white,
  },
  monospace: {
    fontFamily: 'monospace',
  },
  testCase: {
    display: 'flex',
    flexDirection: 'row',
    padding: 10,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottom: [1, 'solid', '#cacaca'],

    '&:last-child': {
      borderBottom: 'none',
    },
  },
  testCaseNumber: {
    marginRight: 20,
    fontWeight: 600,
  },
  codeInput: {
    marginLeft: 10,
    marginRight: 10,
    padding: 5,
    backgroundColor: 'white',
    border: '1px solid #ced4da',
    width: 300,
  },
  resultLabel: {
    fontSize: 14,
    marginTop: 10,
  },
  testCaseButtons: {
    marginTop: 10,
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'row',
  },
  noTestCasesMsg: {
    padding: 40,
    textAlign: 'center',
    fontSize: 14,
  },
  solutionEditor: {
    marginTop: 20,
    marginBottom: 10,
    width: 700,
  },
  helpPopover: {
    textAlign: 'left',
  },
  languageDropdown: {
    marginLeft: 30,

    '& .btn-group': {
      verticalAlign: 'initial',
    },
    '& button': {
      border: [[1, 'solid', colors.primary], '!important'],
      marginLeft: 10,
    },
  },
};
