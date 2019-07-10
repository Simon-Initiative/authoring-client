import { connect } from 'react-redux';
import * as contentTypes from 'data/contentTypes';
import { QuestionProps, OwnQuestionProps } from '../question/Question';
import { DynaDropInput, DynaDropInputProps } from './DynaDropInput';
import { State } from 'reducers';
import { ActiveContext } from 'types/active';
import { toggleAdvancedScoring } from 'actions/questionEditor';
import { AnalyticsState } from 'reducers/analytics';
import { AssessmentModel } from 'data/models';
import { ResourceId } from 'data/types';

interface StateProps {
  activeContext: ActiveContext;
  selectedInitiator: string;
  advancedScoringInitialized: boolean;
  advancedScoring: boolean;
  analytics: AnalyticsState;
  assessmentId: ResourceId;
}

interface DispatchProps {
  onToggleAdvancedScoring: (id: string, value?: boolean) => void;
}

interface OwnProps extends OwnQuestionProps<contentTypes.QuestionItem> {
  onAddItemPart: (item, part, body) => void;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    activeContext: state.activeContext,
    selectedInitiator: state.dynadragdrop.selectedInitiator,
    advancedScoringInitialized: state.questionEditor.hasIn(['scoring', ownProps.model.guid]),
    advancedScoring: state.questionEditor.getIn(['scoring', ownProps.model.guid]),
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
  (mapStateToProps, mapDispatchToProps)(DynaDropInput);

export { controller as DynaDropInput };
