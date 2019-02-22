import { connect } from 'react-redux';
import { Maybe } from 'tsmonad';
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
import { loadCourse } from 'actions/course';
import * as models from 'data/models';

interface StateProps {
  user: UserState;
  modal: ModalState;
  course: Maybe<CourseState>;
  expanded: ExpandedState;
  router: RouterState;
  server: ServerState;
  hover: HoverState;
}

interface DispatchProps {
  onLoad: (courseId: string, documentId: string) => Promise<persistence.Document>;
  onRelease: (documentId: string) => Promise<{}>;
  onLoadOrg: (courseId: string, documentId: string) => Promise<persistence.Document>;
  onReleaseOrg: (documentId: string) => Promise<{}>;
  onSetServerTimeSkew: () => void;
  onLoadCourse: (courseId: string) => Promise<models.CourseModel>;
  onDispatch: (...args: any[]) => any;
  onUpdateHover: (hover: string) => void;
}

interface OwnProps {

}

const mapStateToProps = (state): StateProps => {
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
    course: Maybe.maybe(course),
    expanded,
    router,
    server,
    hover: state.hover,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onLoad: (courseId: string, documentId: string) => dispatch(load(courseId, documentId)),
    onRelease: (documentId: string) => dispatch(release(documentId)),
    onLoadOrg: (courseId: string, documentId: string) => dispatch(loadOrg(courseId, documentId)),
    onReleaseOrg: (documentId: string) => Promise.resolve({}),
    onSetServerTimeSkew: () => dispatch(setServerTimeSkew()),
    onLoadCourse: (courseId: string) => dispatch(loadCourse(courseId)),
    onDispatch: dispatch,
    onUpdateHover: (hover: string) => {
      return dispatch(updateHover(hover));
    },
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(Main);
