import { connect } from 'react-redux';
import * as contentTypes from 'data/contentTypes';
import { OwnQuestionProps } from '../question/Question';
import { MultipartInput, PartAddPredicate } from './MultipartInput';
import { State } from 'reducers';
import { setActiveItemIdActionAction, insertInputRef } from 'actions/inputRef';
import { Maybe } from 'tsmonad';
import { RouterState } from 'reducers/router';
import { clearSearchParam } from 'actions/router';
import { AnalyticsState } from 'reducers/analytics';
import { AssessmentModel } from 'data/models';

interface StateProps {
  selectedInput: Maybe<string>;
  router: RouterState;
  analytics: AnalyticsState;
  assessmentId: string;
}

interface DispatchProps {
  setActiveItemIdActionAction: (activeItemId: string) => void;
  onClearSearchParam: (name) => void;
  onInsertInputRef: (inputRef: contentTypes.InputRef) => void;
}

interface OwnProps extends OwnQuestionProps<contentTypes.QuestionItem> {
  canInsertAnotherPart: PartAddPredicate;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    selectedInput: state.inputRef,
    router: state.router,
    analytics: state.analytics,
    // this line assumes this component is only used within an assessment and document is loaded
    assessmentId: (state.documents.first().document.model as AssessmentModel).resource.id,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    setActiveItemIdActionAction: (activeItemId: string) =>
      dispatch(setActiveItemIdActionAction(activeItemId)),
    onClearSearchParam: name => dispatch(clearSearchParam(name)),
    onInsertInputRef: inputRef => dispatch(insertInputRef(inputRef)),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(MultipartInput);

export { controller as MultipartInput };
