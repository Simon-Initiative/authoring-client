import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Document } from 'data/persistence';
import EditorManager from './EditorManager';
import { courseChanged } from 'actions/course';
import * as lockActions from 'actions/locks';
import { CourseModel, ContentModel } from 'data/models';
import { UserProfile } from 'types/user';
import { LearningObjective, Skill } from 'data/contentTypes';
import { AcquiredLock, RegisterLocks, UnregisterLocks } from 'types/locks';
import { EditedDocument, Loaded, RemoteDocument } from 'types/document';
import { save } from 'actions/document';

interface StateProps {
  expanded: any;
  skills: Map<string, Skill>;
  objectives: Map<string, LearningObjective>;
  remoteDocument: RemoteDocument;
  undoRedoGuid: string;
  editingAllowed: boolean;
}

interface DispatchProps {
  onSave: (documentId: string, model: ContentModel) => any;
  onDispatch: (...args: any[]) => any;
}

interface OwnProps {
  documentId: string;
  userId: string;
  userName: string;
  profile: UserProfile;
  course: any;

}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {

  const { expanded, skills, objectives, documents } = state;
  const { document, undoRedoGuid, editingAllowed } = documents.get(ownProps.documentId);

  return {
    expanded,
    skills,
    objectives,
    remoteDocument: document,
    undoRedoGuid,
    editingAllowed,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onSave: (documentId: string, model: ContentModel) => {
      dispatch(save(documentId, model));
    },
    onDispatch: dispatch,

  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(EditorManager);
