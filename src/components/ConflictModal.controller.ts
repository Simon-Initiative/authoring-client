import { connect } from 'react-redux';
import { State } from 'reducers';
import { load } from 'actions/document';
import { ConflictModal } from './ConflictModal';
import { DocumentId, CourseIdVers } from 'data/types';

interface StateProps {

}

interface DispatchProps {
  onLoadDocument: (courseId: CourseIdVers, documentId: DocumentId) => Promise<any>;
}

interface OwnProps {
  courseId: CourseIdVers;
  documentId: DocumentId;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {

  };
};

const mapDispatchToProps = (dispatch, ownProps: OwnProps): DispatchProps => {
  return {
    onLoadDocument: (courseId: CourseIdVers, documentId: DocumentId) =>
      dispatch(load(courseId, documentId)),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(ConflictModal);

export { controller as ConflictModal };
