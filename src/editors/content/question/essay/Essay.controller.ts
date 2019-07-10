import { connect } from 'react-redux';
import { Essay } from './Essay';
import * as contentTypes from 'data/contentTypes';
import { State } from 'reducers';
import { OwnQuestionProps } from '../question/Question';
import { AnalyticsState } from 'reducers/analytics';
import { AssessmentModel } from 'data/models';
import { ResourceId } from 'data/types';

interface StateProps {
  analytics: AnalyticsState;
  assessmentId: ResourceId;
}

interface DispatchProps {

}

interface OwnProps extends OwnQuestionProps<contentTypes.Essay> {

}

const mapStateToProps = (state: State, props: OwnProps): StateProps => {
  return {
    analytics: state.analytics,
    // this line assumes this component is only used within an assessment and document is loaded
    assessmentId: (state.documents.first().document.model as AssessmentModel).resource.id,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {

  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(Essay);

export { controller as Essay };
