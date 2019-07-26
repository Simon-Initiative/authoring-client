import { connect } from 'react-redux';
import { TextSelection } from 'types/active';
import {
  AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import ContiguousTextToolbar from './ContiguousTextToolbar';
import { ContiguousText } from 'data/content/learning/contiguous';
import { modalActions } from 'actions/modal';
import { Resource } from 'data/content/resource';
import { CourseModel } from 'data/models/course';
import { addEntry } from 'actions/bibliography';
import { Maybe } from 'tsmonad';
import { ContentElement } from 'data/content/common/interfaces';
import { fetchContentElementByPredicate } from 'actions/document';

interface StateProps {
  selection: TextSelection;
  resource: Resource;
  courseModel: CourseModel;
  orderedIds?: any;
}

interface DispatchProps {
  onDisplayModal: (component) => void;
  onDismissModal: () => void;
  onAddEntry: (e, documentId) => Promise<void>;
  onFetchContentElementByPredicate: (documentId: string, predicate)
    => Promise<Maybe<ContentElement>>;
}

interface OwnProps extends AbstractContentEditorProps<ContiguousText> {

}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {

  const { activeContext } = state;
  const courseModel = state.course;
  const documentId = activeContext.documentId.caseOf({ just: d => d, nothing: () => '' });
  const resource = state.documents.get(documentId).document.model.resource;

  return {
    courseModel,
    resource,
    selection: activeContext.textSelection.caseOf({
      just: s => s, nothing: () => {
        return TextSelection.createEmpty('');
      },
    }),
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onDisplayModal: component => dispatch(modalActions.display(component)),
    onDismissModal: () => dispatch(modalActions.dismiss()),
    onAddEntry: (e, documentId) => dispatch(addEntry(e, documentId)),
    onFetchContentElementByPredicate: (documentId: string, predicate) =>
      dispatch(fetchContentElementByPredicate(documentId, predicate)),
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(ContiguousTextToolbar);
