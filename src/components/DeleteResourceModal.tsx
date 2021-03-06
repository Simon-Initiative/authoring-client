import { Resource, ResourceState } from 'data/content/resource';
import * as React from 'react';
import ModalSelection from 'utils/selection/ModalSelection';
import { Edge } from 'types/edge';
import { OrderedMap } from 'immutable';
import * as persistence from 'data/persistence';
import { SortDirection, SortableTable } from 'components/common/SortableTable';
import { CourseModel } from 'data/models';
import './DeleteResourceModal.scss';
import { LegacyTypes } from 'data/types';
import { LoadingSpinner, LoadingSpinnerSize } from 'components/common/LoadingSpinner';
import { Severity, Toast } from 'components/common/Toast';
import * as viewActions from 'actions/view';
import { Maybe } from 'tsmonad';

export interface DeleteResourceModalProps {
  resource: Resource;
  course: CourseModel;
  onDeleteResource: (resource: Resource, course: CourseModel, orgId: string) => void;
  onDismissModal: () => void;
  orgId: string;
}

interface DeleteResourceModalState {
  edges: OrderedMap<string, Edge>;
  edgesAreLoaded: boolean;
  edgeLoadFailure: boolean;
}

export function prettyPrintResourceType(type: LegacyTypes): string {
  switch (type) {
    case LegacyTypes.workbook_page:
      return 'Workbook Page';
    case LegacyTypes.inline:
    case LegacyTypes.assessment2:
      return 'Assessment';
    case LegacyTypes.assessment2_pool:
      return 'Assessment Pool';
    case LegacyTypes.organization:
      return 'Organization';
    case LegacyTypes.feedback:
      return 'Survey';
    case LegacyTypes.embed_activity:
      return 'Embed Activity';
    default:
      return type;
  }
}

export default class DeleteResourceModal extends
  React.Component<DeleteResourceModalProps, DeleteResourceModalState> {

  constructor(props) {
    super(props);

    this.state = {
      edges: OrderedMap<string, Edge>(),
      edgesAreLoaded: false,
      edgeLoadFailure: false,
    };

    this.onDelete = this.onDelete.bind(this);
  }

  componentDidMount() {
    const { course, resource } = this.props;

    persistence.fetchWebContentReferences(course.guid, {}, true, resource.id)
      .then((edges) => {
        this.setState({
          edges: OrderedMap<string, Edge>(
            edges
              // filter out deleted resources
              .filter(edge => this.edgeResource(this.edgeResourceId(edge)).resourceState
                !== ResourceState.DELETED)
              .map(e => [e.guid, e]),
          ),
          edgesAreLoaded: true,
        });
      })
      .catch(err => this.setState({ edgeLoadFailure: true }));
  }

  // Edge sourceId looks like 'javascript-evz4jsnu:1.0:welcome',
  // in the form '{courseId}:{version}:{resourceId}'.
  edgeResourceId(edge: Edge): string {
    return edge.sourceId.slice(edge.sourceId.lastIndexOf(':') + 1);
  }

  edgeResource(resourceId: string): Resource {
    return this.props.course.resourcesById.get(resourceId);
  }

  edgeResourceTitle(id: string): string {
    return this.edgeResource(id).title;
  }

  onDelete() {
    const { course, resource, onDeleteResource, orgId } = this.props;

    persistence.deleteResource(course.idvers, resource.id)
      .then(_ => onDeleteResource(resource, course, orgId));
  }

  render() {
    const { course, resource, onDismissModal } = this.props;
    const { edges, edgesAreLoaded, edgeLoadFailure } = this.state;

    const resourceTypeUppercase = prettyPrintResourceType(resource.type as LegacyTypes);
    const resourceTypeLowercase = resourceTypeUppercase.toLowerCase();

    const rows = this.state.edges.toArray().map(e => ({ key: e.guid, data: e }));

    const labels = [
      'Resource Name',
      'Resource Type',
    ];

    const safeCompare =
      (key: string, direction: SortDirection, a: Edge, b: Edge): number => {
        const aValue = key === 'title' ? this.edgeResourceTitle(this.edgeResourceId(a)) : a[key];
        const bValue = key === 'title' ? this.edgeResourceTitle(this.edgeResourceId(b)) : b[key];

        if (aValue === null && bValue === null) {
          return 0;
        }
        if (aValue === null) {
          return direction === SortDirection.Ascending ? 1 : -1;
        }
        if (bValue === null) {
          return direction === SortDirection.Ascending ? -1 : 1;
        }
        if (aValue === bValue) {
          return 0;
        }
        return direction === SortDirection.Ascending
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      };

    const comparators = [
      (direction, a, b) => safeCompare('title', direction, a, b),
      (direction, a, b) => safeCompare('sourceType', direction, a, b),
    ];

    const link = (edge: Edge) => {
      const edgeResource = this.edgeResource(this.edgeResourceId(edge));

      // All routes must have an organization as context. If the link is to an organization,
      // use the target as the organization in the route. Otherwise, just use the current
      // org since the organization doesn't matter in that case.
      const orgId = edgeResource.type === LegacyTypes.organization
        ? edgeResource.id
        : this.props.orgId;

      return (text: string) =>
        <a onClick={(e) => {
          e.preventDefault();
          this.props.onDismissModal();
          viewActions.viewDocument(edgeResource.id, course.idvers, Maybe.just(orgId));
        }}
          href="#"
          className="btn btn-link">
          {text}
        </a>;
    };

    const columnRenderers = [
      (edge: Edge) => link(edge)(this.edgeResourceTitle(this.edgeResourceId(edge))),
      (edge: Edge) => <span>{prettyPrintResourceType(edge.sourceType)}</span>,
    ];

    const failureIcon =
      <LoadingSpinner size={LoadingSpinnerSize.Small}
        failed message="Something went wrong - please try again" />;

    const loadingSpinner =
      <LoadingSpinner size={LoadingSpinnerSize.Small} message=
        {`Checking if this ${resourceTypeLowercase} can be safely deleted`} />;

    const deletionConfirmation =
      <p>
        Are you sure you want to delete '{resource.title}'?
        <Toast
          icon={<i className="fa fa-exclamation-triangle" />}
          heading="Warning"
          content={<p>This action cannot be undone</p>}
          severity={Severity.Warning} />
      </p>;

    const edgeTable =
      <React.Fragment>
        <p><b>Cannot delete '{resource.title}'</b></p>
        <p>
          {`The following ${edges.size === 1 ? 'resource' : edges.size.toString() + ' resources'} `}
          {`use${edges.size === 1 ? 's' : ''} this ${resourceTypeLowercase}. `}
          Please remove all references before deleting.
        </p>
        <SortableTable
          model={rows}
          columnComparators={comparators}
          columnRenderers={columnRenderers}
          columnLabels={labels}
        />
      </React.Fragment>;

    return (
      <ModalSelection
        title={`Delete ${resourceTypeUppercase}`}
        onCancel={onDismissModal}
        onInsert={this.onDelete}
        okClassName="danger"
        okLabel="Delete"
        disableInsert={!edgesAreLoaded || edges.size !== 0}>
        {edgeLoadFailure
          ? failureIcon
          : !edgesAreLoaded
            ? loadingSpinner
            : edgesAreLoaded && edges.size === 0
              ? deletionConfirmation
              : edgeTable}
      </ModalSelection>
    );
  }
}
