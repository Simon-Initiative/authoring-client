import { Resource } from 'data/content/resource';
import * as React from 'react';
import ModalSelection from 'utils/selection/ModalSelection';
import { Edge } from 'types/edge';
import { OrderedMap } from 'immutable';
import * as persistence from 'data/persistence';
import { SortDirection, SortableTable } from 'components/common/SortableTable';
import * as viewActions from 'actions/view';
import { OrganizationModel, CourseModel } from 'data/models';
import './DeleteResourceModal.scss';
import { LegacyTypes } from 'data/types';

export interface DeleteResourceModalProps {
  onDismissModal: () => void;
  resource: Resource | OrganizationModel;
  course: CourseModel;
  dispatch: any;
}

interface DeleteResourceModalState {
  edges: OrderedMap<string, Edge>;
  edgesAreLoaded: boolean;
  edgeLoadFailure: boolean;
}

export default class DeleteResourceModal extends
  React.Component<DeleteResourceModalProps, DeleteResourceModalState> {
  viewActions: any;

  constructor(props) {
    super(props);

    this.state = {
      edges: OrderedMap<string, Edge>(),
      edgesAreLoaded: false,
      edgeLoadFailure: false,
    };

    this.onDelete = this.onDelete.bind(this);
    this.clickResource = this.clickResource.bind(this);
  }

  componentDidMount() {
    // change to parameterized version after backend changes for fetching resource edges
    persistence.fetchWebContentReferences(this.props.course.guid)
      .then((edges) => {
        console.log('edges', edges);
        this.setState({
          edges: OrderedMap<string, Edge>(edges.map(e => [e.guid, e])),
          edgesAreLoaded: true,
        });
      })
      .catch(err => this.setState({ edgeLoadFailure: true }));
  }

  onDelete() {
    const { dispatch, course, resource } = this.props;

    persistence.deleteResource(course.id, resource.id)
      .then((_) => {
        switch (resource.type as LegacyTypes) {
          case 'x-oli-workbook_page':
            return dispatch(viewActions.viewPages(course.id));
          case 'x-oli-inline-assessment':
            return dispatch(viewActions.viewFormativeAssessments(course.id));
          case 'x-oli-assessment2':
            return dispatch(viewActions.viewSummativeAssessments(course.id));
          case 'x-oli-assessment2-pool':
            return dispatch(viewActions.viewPools(course.id));
          case 'x-oli-organization':
            return dispatch(viewActions.viewOrganizations(course.id));
          default:
            return;
        }
      });
  }

  prettyPrintResourceType(type: LegacyTypes): string {
    switch (type) {
      case 'x-oli-workbook_page':
        return 'Workbook Page';
      case 'x-oli-inline-assessment':
      case 'x-oli-assessment2':
        return 'Assessment';
      case 'x-oli-assessment2-pool':
        return 'Assessment Pool';
      case 'x-oli-organization':
        return 'Organization';
      default:
        return type;
    }
  }

  clickResource(id) {
    const { dispatch, course, onDismissModal } = this.props;

    dispatch(viewActions.viewDocument(id, course.id));
    // dismiss modal
  }

  render() {
    const { course, resource, onDismissModal } = this.props;
    const { edges, edgesAreLoaded, edgeLoadFailure } = this.state;

    const resourceTypeUppercase = this.prettyPrintResourceType(resource.type as LegacyTypes);
    const resourceTypeLowercase = resourceTypeUppercase.toLowerCase();

    const rows = this.state.edges.toArray().map(e => ({ key: e.guid, data: e }));

    const labels = [
      'Resource Name',
      'Resource Type',
      'Reference Type',
    ];

    const safeCompare =
      (key: string, direction: SortDirection, a, b) => {
        if (a[key] === null && b[key] === null) {
          return 0;
        }
        if (a[key] === null) {
          return direction === SortDirection.Ascending ? 1 : -1;
        }
        if (b[key] === null) {
          return direction === SortDirection.Ascending ? -1 : 1;
        }
        if (a[key] === b[key]) {
          return 0;
        }
        return direction === SortDirection.Ascending
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      };

    const comparators = [
      // how to get this to compare on name?
      (direction, a, b) => safeCompare('sourceId', direction, a, b),
      (direction, a, b) => safeCompare('sourceType', direction, a, b),
      (direction, a, b) => safeCompare('referenceType', direction, a, b),
    ];

    const link = resource => text =>
      <button onClick={this.clickResource.bind(this, resource.guid)}
        className="btn btn-link">{text}</button>;

    // Edge sourceId is of the form ':{resourceId}', so parse out the resourceId
    const resourceId = (edge: Edge) => edge.sourceId.slice(edge.sourceId.lastIndexOf(':') + 1);
    const resourceName = (id: string) => course.resourcesById.get(id);

    const columnRenderers = [
      (edge: Edge) => link(edge)(resourceName(resourceId(edge))),
      (edge: Edge) => <span>{this.prettyPrintResourceType(edge.sourceType)}</span>,
      (edge: Edge) => <span>{edge.referenceType}</span>,
    ];


    let modalBody;

    if (edgeLoadFailure) {
      modalBody = <div key="loading" className="loading">
        <i className="fa fa-times-circle" />
        Something went wrong - please try again
    </div>;
    }
    if (!edgesAreLoaded) {
      modalBody = <div key="loading" className="loading">
        <i className="fa fa-circle-o-notch fa-spin fa-1x fa-fw" />
        Checking if this {resourceTypeLowercase} can be safely deleted
      </div>;
    }
    if (edgesAreLoaded && edges.size === 0) {
      // tslint:disable-next-line:max-line-length
      modalBody = <p>Are you sure you want to delete this {resourceTypeLowercase}? This action cannot be undone.</p>;
    }
    if (edgesAreLoaded && edges.size > 0) {
      modalBody = <React.Fragment>
        {/* tslint:disable-next-line:max-line-length */}
        <p>The following {edges.size} resources use this {resourceTypeLowercase}. All references must be removed before the {resourceTypeLowercase} can be deleted:</p>
        <SortableTable
          model={rows}
          columnComparators={comparators}
          columnRenderers={columnRenderers}
          columnLabels={labels}
        />
      </React.Fragment>;
    }

    return (
      <ModalSelection
        title={`Delete ${resourceTypeUppercase} '${resource.title}'?`}
        onCancel={onDismissModal}
        onInsert={this.onDelete}
        okClassName="danger"
        okLabel="Delete"
        disableInsert={edgesAreLoaded && edges.size !== 0}>
        {modalBody}
      </ModalSelection>
    );
  }
}
