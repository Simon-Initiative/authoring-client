import { connect } from 'react-redux';
import { UserState } from 'reducers/user';
import { ModalState } from 'reducers/modal';
import { CourseState } from 'reducers/course';
import { ExpandedState } from 'reducers/expanded';
import { ServerState } from 'reducers/server';
import { HoverState } from 'reducers/hover';
import { updateHover } from 'actions/hover';
import { load, release } from 'actions/document';
import { load as loadOrg } from 'actions/orgs';
import * as persistence from 'data/persistence';
import Main from './Main';
import { RouterState } from 'reducers/router';
import { setServerTimeSkew } from 'actions/server';
import { loadCourse, updateCourseResources } from 'actions/course';
import * as viewActions from 'actions/view';
import * as models from 'data/models';
import { bindActionCreators } from 'redux';
import { State } from 'reducers/index';
import { CourseIdVers } from 'data/types';

interface StateProps {
  user: UserState;
  modal: ModalState;
  course: CourseState;
  expanded: ExpandedState;
  router: RouterState;
  server: ServerState;
  hover: HoverState;
}

interface DispatchProps {
  onLoad: (courseId: CourseIdVers, documentId: string) => Promise<persistence.Document>;
  onRelease: (documentId: string) => Promise<{}>;
  onLoadOrg: (courseId: CourseIdVers, documentId: string) => Promise<persistence.Document>;
  onSetServerTimeSkew: () => void;
  onLoadCourse: (courseId: CourseIdVers) => Promise<models.CourseModel>;
  onDispatch: (...args: any[]) => any;
  onUpdateHover: (hover: string) => void;
  onUpdateCourseResources: (updated) => void;
}

interface OwnProps {

}

const mapStateToProps = (state: State): StateProps => {
  const {
    user,
    modal,
    course,
    expanded,
    router,
    server,
  } = state;

  return {
    user,
    modal,
    course,
    expanded,
    router,
    server,
    hover: state.hover,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onLoad: (courseId: CourseIdVers, documentId: string) =>
      dispatch(load(courseId, documentId)),
    onRelease: (documentId: string) => dispatch(release(documentId)),
    onLoadOrg: (courseId: CourseIdVers, documentId: string) =>
      dispatch(loadOrg(courseId, documentId)),
    onSetServerTimeSkew: () => dispatch(setServerTimeSkew()),
    onLoadCourse: (courseId: CourseIdVers) => dispatch(loadCourse(courseId)),
    onDispatch: dispatch,
    onUpdateHover: (hover: string) => {
      return dispatch(updateHover(hover));
    },
    onUpdateCourseResources: updated => dispatch(updateCourseResources(updated)),
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(Main);
