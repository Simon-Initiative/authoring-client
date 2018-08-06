import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { load } from 'actions/document';
import { WritelockModal } from './WritelockModal';

interface StateProps {

}

interface DispatchProps {
  onLoadDocument: (courseId, documentId) => Promise<any>;
}

interface OwnProps {
  courseId: string;
  documentId: string;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {

  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    onLoadDocument: (courseId, documentId) => dispatch(load(courseId, documentId)),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(WritelockModal);

export { controller as WritelockModal };
