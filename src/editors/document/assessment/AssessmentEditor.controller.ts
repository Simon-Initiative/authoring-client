import { connect } from 'react-redux';
import AssessmentEditor from './AssessmentEditor';
import { fetchSkills } from 'actions/skills';
import { AbstractEditorProps } from '../common/AbstractEditor';
import { AssessmentModel } from 'data/models';
import * as activeActions from 'actions/active';
import { updateHover } from 'actions/hover';
import { ParentContainer, TextSelection } from 'types/active';
import { Maybe } from 'tsmonad';

interface StateProps {
  activeContext: any;
  hover: string;
}

interface DispatchProps {
  onFetchSkills: (courseId: string) => any;
  onUpdateContent: (documentId: string, content: Object) => void;
  onUpdateContentSelection: (
    documentId: string, content: Object, container: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
  onUpdateHover: (hover: string) => void;
}

interface OwnProps extends AbstractEditorProps<AssessmentModel> {}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  const { activeContext, hover } = state;

  return {
    activeContext,
    hover,
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
    onUpdateHover: (hover: string) => {
      return dispatch(updateHover(hover));
    },
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(AssessmentEditor);
