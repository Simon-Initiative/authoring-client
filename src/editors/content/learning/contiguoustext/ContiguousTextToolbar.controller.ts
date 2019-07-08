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
import { State } from 'reducers';
import { DocumentId } from 'data/types';

interface StateProps {
  selection: TextSelection;
  resource: Resource;
  courseModel: CourseModel;
}

interface DispatchProps {
  onDisplayModal: (component) => void;
  onDismissModal: () => void;
  onAddEntry: (e, documentId: DocumentId) => Promise<void>;
  onFetchContentElementByPredicate: (documentId: DocumentId, predicate)
    => Promise<Maybe<ContentElement>>;
}

interface OwnProps extends AbstractContentEditorProps<ContiguousText> {

}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {

  const { activeContext } = state;
  const courseModel = state.course;
  const documentId = activeContext.documentId.caseOf({ just: d => d.value(), nothing: () => '' });
  const resource = (state.documents.get(documentId).document.model as any).resource;

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
    onFetchContentElementByPredicate: (documentId: DocumentId, predicate) =>
      dispatch(fetchContentElementByPredicate(documentId, predicate)),
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(ContiguousTextToolbar);
