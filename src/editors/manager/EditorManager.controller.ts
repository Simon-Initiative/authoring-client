import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Document } from 'data/persistence';
import EditorManager from './EditorManager';
import { ContentModel } from 'data/models';
import { UserProfile } from 'types/user';
import { LearningObjective, Skill } from 'data/contentTypes';
import { save } from 'actions/document';
import { cut, copy, paste } from 'actions/clipboard';
import { ActiveContextState } from 'reducers/active';

interface StateProps {
  expanded: any;
  skills: Map<string, Skill>;
  objectives: Map<string, LearningObjective>;
  document: Document;
  undoRedoGuid: string;
  editingAllowed: boolean;
  hasFailed: boolean;

  activeContext: ActiveContextState;
}

interface DispatchProps {
  onSave: (documentId: string, model: ContentModel) => any;
  onDispatch: (...args: any[]) => any;

  onCut: (item: Object) => void;
  onCopy: (item: Object) => void;
  onPaste: () => void;
}

interface OwnProps {
  documentId: string;
  userId: string;
  userName: string;
  profile: UserProfile;
  course: any;

}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {

  const { expanded, skills, objectives, documents, activeContext } = state;
  const ed = documents.get(ownProps.documentId);

  let document = null;
  let undoRedoGuid = 'Loading';
  let editingAllowed = false;
  let hasFailed = false;

  if (ed !== undefined) {
    document = ed.document;
    undoRedoGuid = ed.undoRedoGuid;
    editingAllowed = ed.editingAllowed;
    hasFailed = ed.hasFailed;
  }

  return {
    activeContext,
    expanded,
    skills,
    objectives,
    document,
    undoRedoGuid,
    editingAllowed,
    hasFailed,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onSave: (documentId: string, model: ContentModel) => {
      dispatch(save(documentId, model));
    },
    onDispatch: dispatch,
    onCut: item => dispatch(cut(item)),
    onCopy: item => dispatch(copy(item)),
    onPaste: () => dispatch(paste()),
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(EditorManager);
