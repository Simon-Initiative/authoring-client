import * as React from 'react';

import { Resource } from 'data/content/resource';
import ModalSelection from './ModalSelection';
import './ResourceSelection.scss';
import { SortDirection, SortableTable, DataRow } from 'components/common/SortableTable';
import { compareDates, relativeToNow, adjustForSkew } from 'utils/date';
import * as models from 'data/models';

export interface ResourceSelectionProps {
  timeSkewInMs: number;
  course: models.CourseModel;
  onInsert: (item: Resource) => void;
  onCancel: () => void;
  courseId: string;
  filterPredicate: (res: Resource) => boolean;
}

export interface ResourceSelectionState {
  selected: Resource;
}

export default class ResourceSelection
  extends React.Component<ResourceSelectionProps, ResourceSelectionState> {

  constructor(props) {
    super(props);

    this.state = {
      selected: undefined,
    };
  }

  render() {

    const link = (r: Resource) =>
      <button className={'btn btn-link'}>{r.title}</button>;

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

    // r : Resource
    const columnRenderers = [
      r => <span style={{ fontWeight: 600 }}>{r.title}</span>,
      r => <span>{r.id}</span>,
      r => <span>{relativeToNow(
        adjustForSkew(r.dateCreated, this.props.timeSkewInMs))}</span>,
    ];


    const rowRenderer = (item: DataRow, index: number, children: any) => {
      const resource = item.data as Resource;
      const active = resource.id === (this.state.selected && this.state.selected.id)
        ? 'table-active'
        : '';

      return (
        <tr
          onClick={_ => this.setState({ selected: resource })}
          key={item.key}
          className={active}>
          {children}
        </tr>
      );
    };

    return (
      <ModalSelection
        title="Select Resource"
        onCancel={this.props.onCancel}
        onInsert={() => this.props.onInsert(this.state.selected)}
        disableInsert={this.state.selected === undefined}>
        <SortableTable
          rowRenderer={rowRenderer}
          model={rows}
          columnComparators={comparators}
          columnRenderers={columnRenderers}
          columnLabels={labels}/>
      </ModalSelection>
    );
  }
}
