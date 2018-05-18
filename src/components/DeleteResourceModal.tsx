import { Resource } from 'data/content/resource';
import * as React from 'react';
import ModalSelection from 'utils/selection/ModalSelection';
import { Maybe } from 'tsmonad/lib/src';
import { Edge } from 'types/edge';
import { OrderedMap } from 'immutable';
// import './DeleteResourceModal.scss';

export interface DeleteResourceModalProps {
  onCancel: () => void;
  onDelete: () => void;
  resource: Resource;
  edges: Maybe<OrderedMap<string, Edge>>;
}

interface DeleteResourceModalState {
}

export default class DeleteResourceModal extends
    React.Component<DeleteResourceModalProps, DeleteResourceModalState> {
  viewActions: any;

  constructor(props) {
    super(props);
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
    const { onCancel, onDelete, resource } = this.props;

    const resourceType = this.prettyPrintResourceType(resource.type);

    return (
      <ModalSelection
        title={`Delete ${resourceType} '${resource.title}'?`}
        onCancel={onCancel}
        onInsert={onDelete}
        okLabel="Delete"
        disableInsert={false} /* numEdges === 0*/ >
        {/* <SortableTable
          rowRenderer={rowRenderer}
          model={rows}
          columnComparators={comparators}
          columnRenderers={columnRenderers}
          columnLabels={labels}/> */}
          <p>Edges up in here</p>
      </ModalSelection>
    );
  }

}
