import * as viewActions from 'actions/view';
import { Resource } from 'data/content/resource';
import * as models from 'data/models';
import * as React from 'react';
import ModalSelection from 'utils/selection/ModalSelection';
// import './DeleteResourceView.scss';

export interface DeleteResourceViewProps {
  // course: models.CourseModel;
  // dispatch: any;
  // title: string;
  // resourceType: string;
  // filterFn: (resource: Resource) => boolean;
  // createResourceFn: (
  //   courseId: string,
  //   title: string, type: string) => models.ContentModel;
  onCancel: () => void;
  onDelete: () => void;
  resource: Resource;
}

interface DeleteResourceViewState {
}

export default class DeleteResourceView extends
    React.Component<DeleteResourceViewProps, DeleteResourceViewState> {
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
          <p></p>
      </ModalSelection>
    );
  }

}
