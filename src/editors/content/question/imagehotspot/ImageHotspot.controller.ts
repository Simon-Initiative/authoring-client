import { connect } from 'react-redux';
import { ImageHotspot } from './ImageHotspot';
import * as contentTypes from 'data/contentTypes';
import { toggleAdvancedScoring } from 'actions/questionEditor';
import { State } from 'reducers';
import { OwnQuestionProps } from '../question/Question';
import { AnalyticsState } from 'reducers/analytics';
import { AssessmentModel } from 'data/models';

interface StateProps {
  advancedScoringInitialized: boolean;
  advancedScoring: boolean;
  analytics: AnalyticsState;
  assessmentId: string;
}

interface DispatchProps {
  onToggleAdvancedScoring: (id: string, value?: boolean) => void;
}

interface OwnProps extends OwnQuestionProps<contentTypes.ImageHotspot> {

}

const mapStateToProps = (state: State, props: OwnProps): StateProps => {
  return {
    advancedScoringInitialized: state.questionEditor.hasIn(['scoring', props.model.guid]),
    advancedScoring: state.questionEditor.getIn(['scoring', props.model.guid]),
    analytics: state.analytics,
    // this line assumes this component is only used within an assessment and document is loaded
    assessmentId: (state.documents.first().document.model as AssessmentModel).resource.id,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onToggleAdvancedScoring: (id: string, value?: boolean) => {
      dispatch(toggleAdvancedScoring(id, value));
    },
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(ImageHotspot);

export { controller as ImageHotspot };
