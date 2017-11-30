import { connect } from 'react-redux';
import { CheckAllThatApply, CheckAllThatApplyProps } from './CheckAllThatApply';
import * as contentTypes from 'data/contentTypes';
import {
  AbstractItemPartEditorProps,
} from '../common/AbstractItemPartEditor';

interface StateProps {

}

interface DispatchProps {
  onToggleAdvancedMode: () => void;
  onToggleShuffleChoices: () => void;
}

interface OwnProps extends AbstractItemPartEditorProps<contentTypes.MultipleChoice> {
  onBodyEdit: (...args: any[]) => any;
  onGradingChange: (...args: any[]) => any;
  body: any;
  grading: any;
  hideGradingCriteria: boolean;
}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  return {};
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onToggleAdvancedMode: () => { console.log('onToggleAdvancedMode NOT IMPLEMENTED'); },
    onToggleShuffleChoices: () => { console.log('onToggleShuffleChoices NOT IMPLEMENTED'); },
  };
};

const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(CheckAllThatApply);

export { controller as CheckAllThatApply };
