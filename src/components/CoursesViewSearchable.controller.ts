import { connect } from 'react-redux';
import { State } from 'reducers';
import CoursesViewSearchable from './CoursesViewSearchable';
import * as viewActions from 'actions/view';
import * as Messages from 'types/messages';
import * as messageActions from 'actions/messages';
import { CourseIdVers } from 'data/types';
import { Maybe } from 'tsmonad';


interface StateProps {

}

interface DispatchProps {
  createCourse: () => any;
  importCourse: () => any;
  onSelect: (id: CourseIdVers) => any; // the id of the course to be viewed
  sendMessage: (msg: Messages.Message) => any;
}

interface OwnProps {
  serverTimeSkewInMs: number;
  userId: string;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {};
};

const mapDispatchToProps = (dispatch, ownProps: OwnProps): DispatchProps => {
  return {
    onSelect: (id: CourseIdVers) => viewActions.viewCourse(id, Maybe.nothing()),
    createCourse: () => (viewActions.viewCreateCourse()),
    importCourse: () => (viewActions.viewImportCourse()),
    sendMessage: (msg: Messages.Message) => dispatch(messageActions.showMessage(msg)),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(CoursesViewSearchable);

export { controller as CoursesViewSearchable };
