import * as Immutable from 'immutable';
import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import DeleteResourceModal from './DeleteResourceModal';
import { Resource } from 'data/contentTypes';
import { OrganizationModel, CourseModel } from 'data/models';
import { LegacyTypes } from 'data/types';
import { ResourceState } from 'data/content/resource';
import { updateCourseResources } from 'actions/course';
import * as viewActions from 'actions/view';
import { modalActions } from 'actions/modal';

interface StateProps {

}

interface DispatchProps {
  onDeleteResource: (resource: Resource | OrganizationModel, course: CourseModel) => void;
  // how can I pull the course out of redux state instead of passing as parameter?
  onClickResource: (id: string, course: CourseModel) => any;
}

interface OwnProps {
  resource: Resource | OrganizationModel;
  course: CourseModel;
  onDismissModal: () => void;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {

  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    // should resource be a union type? having trouble updating when it's an org
    onDeleteResource: (resource: Resource | OrganizationModel, course: CourseModel) => {
      const updatedResource = (resource as Resource)
      .with({ resourceState: ResourceState.DELETED });
      const resources = Immutable.OrderedMap<string, Resource>([[
        updatedResource.guid, updatedResource,
      ]]);
      dispatch(updateCourseResources(resources));

      switch (resource.type as LegacyTypes) {
        case 'x-oli-workbook_page':
          dispatch(viewActions.viewPages(course.guid));
          break;
        case 'x-oli-inline-assessment':
          dispatch(viewActions.viewFormativeAssessments(course.guid));
          break;
        case 'x-oli-assessment2':
          dispatch(viewActions.viewSummativeAssessments(course.guid));
          break;
        case 'x-oli-assessment2-pool':
          dispatch(viewActions.viewPools(course.guid));
          break;

        // does not refresh page with updated resources
        case 'x-oli-organization':
          dispatch(viewActions.viewOrganizations(course.guid));
          break;
        default:
          break;
      }
      dispatch(modalActions.dismiss());
    },
    onClickResource: (id: string, course: CourseModel) => {
      dispatch(viewActions.viewDocument(id, course.guid));
      dispatch(modalActions.dismiss());
    },
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(DeleteResourceModal);

export { controller as DeleteResourceModal };
