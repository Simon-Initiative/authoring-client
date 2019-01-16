import { connect } from 'react-redux';
import { MultipleChoice } from './MultipleChoice';
import * as contentTypes from 'data/contentTypes';
import { toggleAdvancedScoring } from 'actions/questionEditor';
import { State } from 'reducers';
import { QuestionProps } from './Question';

interface StateProps {
  advancedScoringInitialized: boolean;
  advancedScoring: boolean;
}

interface DispatchProps {
  onToggleAdvancedScoring: (id: string, value?: boolean) => void;
}

interface OwnProps extends QuestionProps<contentTypes.MultipleChoice> {

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
  (mapStateToProps, mapDispatchToProps)(MultipleChoice);

export { controller as MultipleChoice };
