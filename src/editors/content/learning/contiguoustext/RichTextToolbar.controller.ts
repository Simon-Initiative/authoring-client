import { connect } from 'react-redux';
import {
  AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import GeneralTextToolbar from './RichTextToolbar';
import { modalActions } from 'actions/modal';
import { Resource } from 'data/content/resource';
import { CourseModel } from 'data/models/course';
import { Maybe } from 'tsmonad';
import { Editor, Value } from 'slate';

interface StateProps {
  resource: Resource;
  courseModel: CourseModel;
  editor: Maybe<Editor>;
}

interface DispatchProps {
  onDisplayModal: (component) => void;
  onDismissModal: () => void;
}

interface OwnProps extends AbstractContentEditorProps<Value> {

}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {

  const { activeContext } = state;
  const courseModel = state.course;
  const documentId = activeContext.documentId.caseOf({ just: d => d, nothing: () => '' });
  const resource = state.documents.get(documentId).document.model.resource;

  return {
    editor: activeContext.editor,
    courseModel,
    resource,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onDisplayModal: component => dispatch(modalActions.display(component)),
    onDismissModal: () => dispatch(modalActions.dismiss()),
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(GeneralTextToolbar);
