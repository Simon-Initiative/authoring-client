import { updateCourseResources } from 'actions/course';
import * as viewActions from 'actions/view';
import { Resource } from 'data/content/resource';
import * as models from 'data/models';
import * as persistence from 'data/persistence';
import * as Immutable from 'immutable';
import * as React from 'react';
import { isNullOrUndefined } from 'util';
import { adjustForSkew, compareDates, relativeToNow } from 'utils/date';
import { LogAttribute, LogLevel, LogStyle, LogTag, logger } from 'utils/logger';
import './DeleteResourceView.scss';
import { SortDirection, SortableTable } from './common/SortableTable';
import SearchBar from 'components/common/SearchBar';
import { highlightMatches } from 'components/common/SearchBarLogic';
import ModalSelection from 'utils/selection/ModalSelection';

export interface DeleteResourceViewProps {
  course: models.CourseModel;
  dispatch: any;
  serverTimeSkewInMs: number;
  title: string;
  resourceType: string;
  filterFn: (resource: Resource) => boolean;
  createResourceFn: (
    courseId: string,
    title: string, type: string) => models.ContentModel;
  onCancel: () => void;
  onDelete: () => void;
}

interface DeleteResourceViewState {
}

export default class DeleteResourceView extends
    React.Component<DeleteResourceViewProps, DeleteResourceViewState> {
  viewActions: any;

  constructor(props) {
    super(props);
  }


  clickResource(id) {
    this.props.dispatch(viewActions.viewDocument(id, this.props.course.guid));
  }

  render() {
    return (
      null
      // <ModalSelection
      //   title="Select Resource"
      //   onCancel={this.props.onCancel}
      //   onInsert={() => this.props.onDelete}
      //   disableInsert={false} /* numEdges === 0*/ >
      //   <SortableTable
      //     rowRenderer={rowRenderer}
      //     model={rows}
      //     columnComparators={comparators}
      //     columnRenderers={columnRenderers}
      //     columnLabels={labels}/>
      // </ModalSelection>
    );
  }

}
