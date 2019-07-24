import * as React from 'react';

import { Resource } from 'data/content/resource';
import ModalSelection from './ModalSelection';
import './ResourceSelection.scss';
import { SortDirection, SortableTable, DataRow } from 'components/common/SortableTable';
import { compareDates, relativeToNow, adjustForSkew } from 'utils/date';
import * as models from 'data/models';
import SearchBar from 'components/common/SearchBar';
import { highlightMatches } from 'components/common/SearchBarLogic';
import { CourseGuid } from 'data/types';

export interface ResourceSelectionProps {
  timeSkewInMs: number;
  course: models.CourseModel;
  courseId: CourseGuid;
  title?: string;
  noResourcesMessage?: string | JSX.Element;
  filterPredicate: (res: Resource) => boolean;
  onInsert: (item: Resource) => void;
  onCancel: () => void;
}

export interface ResourceSelectionState {
  selected: Resource;
  searchText: string;
  resources: Resource[];
}

export default class ResourceSelection
  extends React.Component<ResourceSelectionProps, ResourceSelectionState> {

  constructor(props) {
    super(props);

    this.state = {
      selected: undefined,
      searchText: '',
      resources: this.getFilteredRows(props),
    };
  }

  getFilteredRows(props: ResourceSelectionProps): Resource[] {
    return props.course.resources
      .toArray()
      .filter(props.filterPredicate);
  }

  // Filter resources shown based on title and id
  filterBySearchText(searchText: string): void {
    // searchText state used for highlighting matches
    this.setState({ searchText });

    const text = searchText.trim().toLowerCase();
    const filterFn = (r) => {
      const { title, id } = r;
      const titleLower = title.toLowerCase();
      const idLower = id.toLowerCase();

      return text === '' ||
        titleLower.indexOf(text) > -1 ||
        idLower.indexOf(text) > -1;
    };

    // one row in table for each resource in state
    this.setState({
      resources: this.getFilteredRows(this.props).filter(filterFn),
    });
  }

  render() {
    const labels = [
      'Title',
      'Unique ID',
      'Last Updated',
    ];

    const safeCompare =
      (primaryKey: string, secondaryKey: string, direction: SortDirection, a, b) => {
        if (a[primaryKey] === null && b[primaryKey] === null) {
          return 0;
        }
        if (a[primaryKey] === null) {
          return direction === SortDirection.Ascending ? 1 : -1;
        }
        if (b[primaryKey] === null) {
          return direction === SortDirection.Ascending ? -1 : 1;
        }
        if (a[primaryKey] === b[primaryKey]) {
          if (a[secondaryKey] === b[secondaryKey]) {
            return 0;
          }
          return safeCompare(secondaryKey, primaryKey, direction, a, b);
        }
        return direction === SortDirection.Ascending
          ? a[primaryKey].localeCompare(b[primaryKey])
          : b[primaryKey].localeCompare(a[primaryKey]);
      };

    const comparators = [
      (direction, a, b) => safeCompare('title', 'id', direction, a, b),
      (direction, a, b) => safeCompare('id', 'title', direction, a, b),
      (direction, a, b) => direction === SortDirection.Ascending
        ? compareDates(a.dateCreated, b.dateCreated)
        : compareDates(b.dateCreated, a.dateCreated),
    ];

    const highlightedColumnRenderer = (prop: string, r: Resource) =>
      this.state.searchText.length < 3
        ? <span>{r[prop]}</span>
        : highlightMatches(prop, r, this.state.searchText);

    // r : Resource
    const columnRenderers = [
      r => highlightedColumnRenderer('title', r),
      r => highlightedColumnRenderer('id', r),
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

    const rows = this.state.resources.map(r => ({ key: r.guid, data: r }));
    return (
      <div className="resourceSelection">
        <ModalSelection
          title={this.props.title || 'Select Resource'}
          onCancel={this.props.onCancel}
          onInsert={() => this.props.onInsert(this.state.selected)}
          disableInsert={this.state.selected === undefined}>
          <div className="searchBarContainer">
            <SearchBar
              placeholder="Search by Title or Unique ID"
              onChange={searchText => this.filterBySearchText(searchText)}
            />
          </div>
          {rows.length > 0
            ? (
              <SortableTable
                rowRenderer={rowRenderer}
                model={rows}
                columnComparators={comparators}
                columnRenderers={columnRenderers}
                columnLabels={labels} />
            )
            : this.state.searchText !== ''
              ? (
                <div className="no-resources-msg">
                  No resources match the search criteria
            </div>
              )
              : (
                <div className="no-resources-msg">
                  {this.props.noResourcesMessage || 'No resources found'}
                </div>
              )
          }
        </ModalSelection>
      </div>
    );
  }
}
