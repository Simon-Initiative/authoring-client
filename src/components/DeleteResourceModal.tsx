import { Resource } from 'data/content/resource';
import * as React from 'react';
import ModalSelection from 'utils/selection/ModalSelection';
import { Maybe } from 'tsmonad/lib/src';
import { Edge } from 'types/edge';
import { OrderedMap } from 'immutable';
import * as persistence from 'data/persistence';
import { SortDirection, SortableTable } from 'components/common/SortableTable';
import './DeleteResourceModal.scss';

export interface DeleteResourceModalProps {
  onDismissModal: () => void;
  resource: Resource;
  courseId: string;
}

interface DeleteResourceModalState {
  edges: OrderedMap<string, Edge>;
  // isLoadingEdges: boolean;
  edgesAreLoaded: boolean;
}

export default class DeleteResourceModal extends
  React.Component<DeleteResourceModalProps, DeleteResourceModalState> {
  viewActions: any;

  constructor(props) {
    super(props);

    this.state = {
      edges: OrderedMap<string, Edge>(),
      // isLoadingEdges: false,
      edgesAreLoaded: false,
    };
  }

  componentDidMount() {
    persistence.fetchWebContentReferences(this.props.courseId)
      .then((edges) => {
        this.setState({
          edges: OrderedMap<string, Edge>(edges.map(e => [e.guid, e])),
          edgesAreLoaded: true,
        });
      });
  }

  prettyPrintResourceType(type) {
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
    const { courseId, resource, onDismissModal } = this.props;
    const { edges, edgesAreLoaded } = this.state;

    const resourceType = this.prettyPrintResourceType(resource.type);

    const rows = this.state.edges.toArray().map(e => ({ key: e.guid, data: e }));

    const labels = [
      'Title',
      'Unique ID',
      'Created',
      'Last Updated',
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
      (direction, a, b) => safeCompare('title', direction, a, b),
      (direction, a, b) => safeCompare('id', direction, a, b),
    ];

    const columnRenderers = [
      r => r.title,
      r => r.id,
    ];

    let body;

    if (!edgesAreLoaded) {
      body = <div key="loading" className="loading">
        <i className="fa fa-circle-o-notch fa-spin fa-1x fa-fw" />
        Checking if this {resourceType.toLowerCase()} can be safely deleted
      </div>;
    }
    if (edgesAreLoaded && edges.size === 0) {
      body = <p>Are you sure you want to delete this {resourceType.toLowerCase()}?
      This action cannot be undone.</p>;
    }
    if (edgesAreLoaded && edges.size > 0) {
      body = <React.Fragment>
        <p>The following {edges.size} references must be removed before this
        {resourceType.toLowerCase()} can be deleted:</p>
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
        title={`Delete ${resourceType} '${resource.title}'?`}
        onCancel={onDismissModal}
        onInsert={() => persistence.deleteResource(courseId, resource.id)}
        okClassName="danger"
        okLabel="Delete"
        disableInsert={edgesAreLoaded && edges.size === 0} /* numEdges === 0*/ >
        {body}
      </ModalSelection>
    );
  }

}
