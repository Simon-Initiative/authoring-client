import { connect } from 'react-redux';
import * as contentTypes from 'data/contentTypes';
import { OwnQuestionProps } from '../question/Question';
import { Ordering } from './Ordering';
import { PermutationsMap } from 'types/combinations';
import { computePermutations } from 'actions/choices';
import { toggleAdvancedScoring } from 'actions/questionEditor';
import { AnalyticsState } from 'reducers/analytics';
import { AssessmentModel } from 'data/models';
import { ResourceId } from 'data/types';

interface StateProps {
  advancedScoringInitialized: boolean;
  advancedScoring: boolean;
  analytics: AnalyticsState;
  assessmentId: ResourceId;
}

interface DispatchProps {
  onGetChoicePermutations: (comboNum: number) => PermutationsMap;
  onToggleAdvancedScoring: (id: string, value?: boolean) => void;
}

interface OwnProps extends OwnQuestionProps<contentTypes.Ordering> {

}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
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
    onGetChoicePermutations: (comboNum: number): PermutationsMap => {
      return dispatch(computePermutations(comboNum));
    },
    onToggleAdvancedScoring: (id: string, value?: boolean) => {
      dispatch(toggleAdvancedScoring(id, value));
    },
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(Ordering);

export { controller as Ordering };
