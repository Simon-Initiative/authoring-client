import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { Actions } from './Actions';
import { modalActions } from 'actions/modal';
import { OrganizationModel, CourseModel } from 'data/models';

interface StateProps {
  course: CourseModel;
}

interface DispatchProps {
  onDisplayModal: (component: any) => void;
  onDismissModal: () => void;
}

interface OwnProps {
  onDuplicate: () => void;
  org: OrganizationModel;
  course: CourseModel;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    course: state.course,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    onDisplayModal: component => dispatch(modalActions.display(component)),
    onDismissModal: () => dispatch(modalActions.dismiss()),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(Actions);

export { controller as Actions };
