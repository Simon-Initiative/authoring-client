import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { ActionsToolbar } from './ActionsToolbar';
import { resetActive } from 'actions/active';
import { showSidebar } from 'actions/editorSidebar';
import { preview } from 'actions/preview';
import { Resource } from 'data/content/resource';
import * as persistence from 'data/persistence';
import * as models from 'data/models';

interface StateProps {
  courseId: string;
}

interface DispatchProps {
  onShowPageDetails: () => void;
  onPreview: (courseId: string, resource: Resource) => Promise<any>;
}

interface OwnProps {

}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    courseId: state.course.guid,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    onShowPageDetails: () => {
      dispatch(resetActive());
      dispatch(showSidebar(true));
    },
    onPreview: (courseId: string, resource: Resource) => {
      return dispatch(preview(courseId, resource, false));
    },
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(ActionsToolbar);

export { controller as ActionsToolbar };
