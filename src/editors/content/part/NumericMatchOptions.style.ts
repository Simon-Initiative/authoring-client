import { JSSStyles } from 'styles/jss';
import colors from 'styles/colors';

export const styles: JSSStyles = {
  NumericMatchOptions: {

  },
  optionsRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  conditionType: {
    marginRight: 10,
  },
  condition: {
    minWidth: 170,
    marginRight: 10,
  },
  optionItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
  },
  value: {
    flex: 1,
  },
  precision: {
    fontSize: '0.8em',
    marginTop: 10,
  },
  precisionToggle: {
    marginRight: 10,
    paddingTop: 5,
  },
  precisionValue: {
    marginRight: 10,
    width: 150,
  },
  precisionLabel: {
    marginRight: 10,
    paddingTop: 5,
  },
  precisionLabelDisabled: {
    color: colors.gray,
  },
  precisionSpacer: {
    flex: 1,
  },
  range: {
    display: 'flex',
    flexDirection: 'row',
    fontSize: '0.8em',

    '& > *:last-child': {
      marginRight: 0,
    },
  },
  rangeInput: {
    flex: 1,
    marginRight: 10,
  },
  rangeLabel: {
    marginRight: 10,
    paddingTop: 5,
  },
  rangeInstr: {
    fontSize: '0.8em',
    marginTop: 5,
    color: colors.gray,
  },
  rangeErrMsg: {
    fontSize: '0.8em',
    marginTop: 5,
    color: colors.danger,
  },
  rangeSpacer: {
    flex: 1,
  },
};
