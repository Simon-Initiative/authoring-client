import { connect } from 'react-redux';
import AssessmentEditor from './AssessmentEditor';
import { fetchSkills } from 'actions/skills';
import { AbstractEditorProps } from '../common/AbstractEditor';
import { AssessmentModel } from 'data/models';
import * as activeActions from 'actions/active';
import { ParentContainer, TextSelection } from 'types/active';
import { Maybe } from 'tsmonad';

interface StateProps {

}

interface DispatchProps {
  onFetchSkills: (courseId: string) => any;
  onUpdateContent: (documentId: string, content: Object) => void;
  onUpdateContentSelection: (
    documentId: string, content: Object, container: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
}

interface OwnProps extends AbstractEditorProps<AssessmentModel> {}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  const { activeContext } = state;

  return {
    activeContext,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onFetchSkills: (courseId: string) => {
      return dispatch(fetchSkills(courseId));
    },
    onUpdateContent: (documentId: string, content: Object) => {
      return dispatch(activeActions.updateContent(documentId, content));
    },
    onUpdateContentSelection: (
      documentId: string, content: Object,
      parent: ParentContainer, textSelection: Maybe<TextSelection>) => {

      return dispatch(activeActions.updateContext(documentId, content, parent, textSelection));
    },
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(AssessmentEditor);
