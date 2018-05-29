import { Resource } from 'data/content/resource';
import * as React from 'react';
import ModalSelection from 'utils/selection/ModalSelection';
import { Edge } from 'types/edge';
import { OrderedMap } from 'immutable';
import * as persistence from 'data/persistence';
import { SortDirection, SortableTable } from 'components/common/SortableTable';
import { CourseModel } from 'data/models';
import './DeleteResourceModal.scss';
import { LegacyTypes } from 'data/types';

export interface DeleteResourceModalProps {
  resource: Resource;
  course: CourseModel;
  onDeleteResource: (resource: Resource, course: CourseModel) => void;
  onDismissModal: () => void;
}

interface DeleteResourceModalState {
  edges: OrderedMap<string, Edge>;
  edgesAreLoaded: boolean;
  edgeLoadFailure: boolean;
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

    persistence.fetchWebContentReferences(course.guid, {}, true, resource.guid)
      .then((edges) => {
        this.setState({
          edges: OrderedMap<string, Edge>(edges.map(e => [e.guid, e])),
          edgesAreLoaded: true,
        });
      })
      .catch(err => this.setState({ edgeLoadFailure: true }));
  }

  onDelete() {
    const { course, resource, onDeleteResource } = this.props;

    persistence.deleteResource(course.guid, resource.guid)
      .then(_ =>  onDeleteResource(resource, course));
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

  render() {
    const { course, resource, onDismissModal } = this.props;
    const { edges, edgesAreLoaded, edgeLoadFailure } = this.state;

    const resourceTypeUppercase = this.prettyPrintResourceType(resource.type as LegacyTypes);
    const resourceTypeLowercase = resourceTypeUppercase.toLowerCase();

    const rows = this.state.edges.toArray().map(e => ({ key: e.guid, data: e }));

    const labels = [
      'Resource Name',
      'Resource Type',
    ];

    const safeCompare =
      (key: string, direction: SortDirection, a: Edge, b: Edge): number => {
        const aValue = key === 'title' ? edgeResourceTitle(edgeResourceId(a)) : a[key];
        const bValue = key === 'title' ? edgeResourceTitle(edgeResourceId(b)) : b[key];

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

    // Edge sourceId looks like 'javascript-evz4jsnu:1.0:welcome',
    // in the form '{courseId}:{version}:{resourceId}'.
    const edgeResourceId: (edge: Edge) => string =
      edge => edge.sourceId.slice(edge.sourceId.lastIndexOf(':') + 1);

    const edgeResource: (resourceId: string) => Resource =
      resourceId => course.resourcesById.get(resourceId);

    const edgeResourceTitle: (id: string) => string =
      id => edgeResource(id).title;

    const link = (edge: Edge) => (text: string) =>
      <a href={`/#${edgeResource(edgeResourceId(edge)).guid}-${course.guid}`}
        className="btn btn-link">{text}</a>;

    const columnRenderers = [
      (edge: Edge) => link(edge)(edgeResourceTitle(edgeResourceId(edge))),
      (edge: Edge) => <span>{this.prettyPrintResourceType(edge.sourceType)}</span>,
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
        <p>The following {edges.size} resource{edges.size === 1 ? '' : 's'} use{edges.size === 1 ? 's' : ''} this {resourceTypeLowercase}. All references must be removed before the {resourceTypeLowercase} can be deleted.</p>
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
