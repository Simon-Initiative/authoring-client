import * as React from 'react';

import * as types from '../../data/types';
import * as persistence from '../../data/persistence';
import { Resource } from 'data/content/resource';
import ModalSelection from './ModalSelection';
import './ResourceSelection.scss';
import { SortDirection, SortableTable } from 'components/common/SortableTable';
import { adjustForSkew, compareDates, relativeToNow } from 'utils/date';
import * as models from 'data/models';

// export type SelectableResource = {
//   id: types.DocumentId,
//   type: string,
//   title: string,
// };

export interface ResourceSelectionProps {
  serverTimeSkewInMs: number;
  course: models.CourseModel;
  onInsert: (item: Resource) => void;
  onCancel: () => void;
  courseId: string;
  filterPredicate: (res: Resource) => boolean;
}

export interface ResourceSelectionState {
  // resources: Resource[];
  selected: Resource;
}

export default class ResourceSelection
  extends React.Component<ResourceSelectionProps, ResourceSelectionState> {

  constructor(props) {
    super(props);

    this.state = {
      // resources: [],
      selected: undefined,
      // { id: '', type: '', title: '' },
    };
  }

  render() {

    const link = (r: Resource) =>
      <button onClick={_ => this.setState({ selected: r })}
        className={this.state.selected &&
          // how to inject this into the TR instead of the link?
          r.guid === this.state.selected.guid
            ? 'table-active'
            : ''
          + ' btn btn-link'}>{r.title}</button>;

    // const active = r.guid === this.state.selected.id ? 'table-active' : '';
    // return <tr key={r.guid} className={active}>
    //   <td>{link(r)}</td>
    // </tr>;

    const rows = this.props.course.resources
      .toArray()
      .filter(this.props.filterPredicate)
      .map(r => ({ key: r.guid, data: r }));

    const labels = [
      'Title',
      'Unique ID',
      'Last Updated',
    ];

    const safeCompare = (property: string, direction: SortDirection, a, b) => {
      if (a[property] === null && b[property] === null) {
        return 0;
      }
      if (a[property] === null) {
        return direction === SortDirection.Ascending ? 1 : -1;
      }
      if (b[property] === null) {
        return direction === SortDirection.Ascending ? -1 : 1;
      }
      return direction === SortDirection.Ascending
        ? a[property].localeCompare(b[property])
        : b[property].localeCompare(a[property]);
    };

    const comparators = [
      safeCompare.bind(undefined, 'title'),
      safeCompare.bind(undefined, 'id'),
      (direction, a, b) => direction === SortDirection.Ascending
        ? compareDates(a.dateCreated, b.dateCreated)
        : compareDates(b.dateCreated, a.dateCreated),
    ];

    const renderers = [
      r => link(r),
      r => <span>{r.id}</span>,
      r => <span>{relativeToNow(
        adjustForSkew(r.dateCreated, this.props.serverTimeSkewInMs))}</span>,
    ];

    return (
      <ModalSelection
        title="Select Resource"
        onCancel={this.props.onCancel}
        onInsert={() => this.props.onInsert(this.state.selected)}
        disableInsert={this.state.selected === undefined}>
        <SortableTable
          // Create tr element function
          // rowRenderer={() => {}}
          model={rows}
          columnComparators={comparators}
          columnRenderers={renderers}
          columnLabels={labels}/>
      </ModalSelection>
    );
  }
}
