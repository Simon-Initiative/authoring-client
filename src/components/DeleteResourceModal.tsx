import { Resource } from 'data/content/resource';
import * as React from 'react';
import ModalSelection from 'utils/selection/ModalSelection';
import { Maybe } from 'tsmonad/lib/src';
import { Edge } from 'types/edge';
import { OrderedMap } from 'immutable';
import * as persistence from 'data/persistence';
import { SortDirection, SortableTable } from 'components/common/SortableTable';
import * as viewActions from 'actions/view';

import './DeleteResourceModal.scss';

export interface DeleteResourceModalProps {
  onDismissModal: () => void;
  resource: Resource;
  courseId: string;
  dispatch: any;
}

interface DeleteResourceModalState {
  edges: OrderedMap<string, Edge>;
  edgesAreLoaded: boolean;
}

export default class DeleteResourceModal extends
  React.Component<DeleteResourceModalProps, DeleteResourceModalState> {
  viewActions: any;

  constructor(props) {
    super(props);

    this.state = {
      edges: OrderedMap<string, Edge>(),
      edgesAreLoaded: false,
    };

    this.onDelete = this.onDelete.bind(this);
    this.clickResource = this.clickResource.bind(this);
  }

  componentDidMount() {
    // change to parameterized version after backend changes for fetching resource edges
    persistence.fetchWebContentReferences(this.props.courseId)
      .then((edges) => {
        console.log('edges', edges);
        this.setState({
          edges: OrderedMap<string, Edge>(edges.map(e => [e.guid, e])),
          edgesAreLoaded: true,
        });
      });
  }

  onDelete() {
    const { dispatch, courseId, resource } = this.props;

    persistence.deleteResource(courseId, resource.id)
      .then((_) => {
        switch (resource.type) {
          case 'x-oli-workbook_page':
            return dispatch(viewActions.viewPages(courseId));
          case 'x-oli-inline-assessment':
            return dispatch(viewActions.viewFormativeAssessments(courseId));
          case 'x-oli-assessment2':
            return dispatch(viewActions.viewSummativeAssessments(courseId));
          case 'x-oli-assessment2-pool':
            return dispatch(viewActions.viewPools(courseId));
          case 'x-oli-organization':
            return dispatch(viewActions.viewOrganizations(courseId));
          default:
            return;
        }
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

  clickResource(id) {
    const { dispatch, courseId, onDismissModal } = this.props;

    dispatch(viewActions.viewDocument(id, courseId));
    // dismiss modal
  }

  render() {
    const { courseId, resource, onDismissModal } = this.props;
    const { edges, edgesAreLoaded } = this.state;

    const resourceTypeUppercase = this.prettyPrintResourceType(resource.type);
    const resourceTypeLowercase = resourceTypeUppercase.toLowerCase();

    const rows = this.state.edges.toArray().map(e => ({ key: e.guid, data: e }));

    const labels = [
      'Resource ID',
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
      (direction, a, b) => safeCompare('sourceId', direction, a, b),
      (direction, a, b) => safeCompare('sourceType', direction, a, b),
      (direction, a, b) => safeCompare('referenceType', direction, a, b),
    ];

    const link = resource => text =>
      <button onClick={this.clickResource.bind(this, resource.guid)}
        className="btn btn-link">{text}</button>;

    // Change to look up resource name instead of displaying ID
    const columnRenderers = [
      r => link(r)(r.sourceId.slice(r.sourceId.lastIndexOf(':') + 1)),
      r => this.prettyPrintResourceType(r.sourceType),
      r => r.referenceType,
    ];


    let modalBody;

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
