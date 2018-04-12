import * as React from 'react';

import { Resource } from 'data/content/resource';
import ModalSelection from './ModalSelection';
import './ResourceSelection.scss';
import { SortDirection, SortableTable, DataRow } from 'components/common/SortableTable';
import { compareDates, relativeToNow, adjustForSkew } from 'utils/date';
import * as models from 'data/models';
import SearchBar from 'components/common/SearchBar';

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
      resources: this.getFilteredRows(),
    };
  }

  getFilteredRows(): Resource[] {
    return this.props.course.resources
      .toArray()
      .filter(this.props.filterPredicate);
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
      resources: this.getFilteredRows().filter(filterFn),
    });
  }

  render() {
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
      (direction, a, b) => safeCompare('title', direction, a, b),
      (direction, a, b) => safeCompare('id', direction, a, b),
      (direction, a, b) => direction === SortDirection.Ascending
        ? compareDates(a.dateCreated, b.dateCreated)
        : compareDates(b.dateCreated, a.dateCreated),
    ];

    // r : Resource
    const columnRenderers = [
      r => highlightMatches('title', r),
      r => highlightMatches('id', r),
      r => <span>{relativeToNow(
        adjustForSkew(r.dateCreated, this.props.timeSkewInMs))}</span>,
    ];


    // This is extremely slow - how to fix?

    // Split the text into matched/unmatched segments to
    // allow each matched segment to be highlighted
    const highlightMatches = (prop: string, r: Resource) => {
      const textToSearchIn = r[prop].trim().toLowerCase();
      const { searchText } = this.state;
      const splitText = textToSearchIn.split(searchText);

      return (
        <span>
          {splitText.map(
            (part, i) => highlightMatch(part, searchText, i, splitText.length))}
        </span>
      );
    };

    // Highlight the matched segment. Splitting text on a delimiter
    // removes the delimiter from the resulting array, so we need to add
    // it back in after each segment.
    const highlightMatch = (unmatchedText, matchedText, i, length) => {
      return (
        <span key={i}>{unmatchedText}
          {/* Don't insert an extra match at the end */}
          { i !== length - 1
              ? <span className={'searchMatch'}>{matchedText}</span>
              : null }
        </span>
      );
    };

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
      <ModalSelection
        title="Select Resource"
        onCancel={this.props.onCancel}
        onInsert={() => this.props.onInsert(this.state.selected)}
        disableInsert={this.state.selected === undefined}>
        <SearchBar
          placeholder="Search by Title or Unique ID"
          onChange={searchText => this.filterBySearchText(searchText)}
        />
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
