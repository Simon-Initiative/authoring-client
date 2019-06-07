import { connect } from 'react-redux';
import * as contentTypes from 'data/contentTypes';
import { OwnQuestionProps } from '../question/Question';
import { CheckAllThatApply } from './CheckAllThatApply';
import { CombinationsMap } from 'types/combinations';
import { computeCombinations } from 'actions/choices';
import { toggleAdvancedScoring } from 'actions/questionEditor';
import { State } from 'reducers';
import { AnalyticsState } from 'reducers/analytics';
import { AssessmentModel } from 'data/models';

interface StateProps {
  advancedScoringInitialized: boolean;
  advancedScoring: boolean;
  analytics: AnalyticsState;
  assessmentId: string;
}

interface DispatchProps {
  onGetChoiceCombinations: (comboNum: number) => CombinationsMap;
  onToggleAdvancedScoring: (id: string, value?: boolean) => void;
}

interface OwnProps extends OwnQuestionProps<contentTypes.MultipleChoice> {

}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    advancedScoringInitialized: state.questionEditor.hasIn(['scoring', ownProps.model.guid]),
    advancedScoring: state.questionEditor.getIn(['scoring', ownProps.model.guid]),
    analytics: state.analytics,
    // this line assumes this component is only used within an assessment and document is loaded
    assessmentId: (state.documents.first().document.model as AssessmentModel).resource.id,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onGetChoiceCombinations: (comboNum: number): CombinationsMap => {
      return dispatch(computeCombinations(comboNum));
    },
    onToggleAdvancedScoring: (id: string, value?: boolean) => {
      dispatch(toggleAdvancedScoring(id, value));
    },
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(CheckAllThatApply);

export { controller as CheckAllThatApply };
