import { connect } from 'react-redux';
import { FeedbackMultipleChoiceEditor } from './FeedbackMultipleChoiceEditor';
import * as contentTypes from 'data/contentTypes';
import { toggleAdvancedScoring } from 'actions/questionEditor';
import { State } from 'reducers';

interface StateProps {
}

interface DispatchProps {
}

interface OwnProps {

}

const mapStateToProps = (state: State, props: OwnProps): StateProps => {
  return {
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(FeedbackMultipleChoiceEditor);

export { controller as FeedbackMultipleChoice };
