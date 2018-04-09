import * as React from 'react';
import './SortableTable.scss';

// A reusable, sortable table component

export enum SortDirection {
  Ascending,
  Descending,
}

export type ColumnComparator = (direction: SortDirection, a: any, b: any) => number;

export type ColumnRenderer = (item: Object) => JSX.Element;

export type DataRow = {
  key: string;
  data: Object;
};

export interface SortableTable {

}

export interface SortableTableProps {
  columnLabels: string[];
  columnComparators: ColumnComparator[];
  columnRenderers: ColumnRenderer[];
  model: DataRow[];
}

export interface SortableTableState {
  sortDirection: SortDirection;
  sortColumnIndex: number;
  sortedModel: DataRow[];
}

export class SortableTable
  extends React.Component<SortableTableProps, SortableTableState> {

  constructor(props) {
    super(props);

    this.state = {
      sortDirection: SortDirection.Ascending,
      sortColumnIndex: 0,
      sortedModel: this.sort(
        this.props.model,
        0, SortDirection.Ascending),
    };

  }


  sort(model: DataRow[], columnIndex: number, sortDirection: SortDirection) : DataRow[] {

    const i = columnIndex;
    return model.sort((a: DataRow, b: DataRow) => {
      return this.props.columnComparators[i](
        sortDirection, a.data, b.data);
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.model !== nextProps.model) {
      this.setState({
        sortedModel: this.sort(
          nextProps.model, this.state.sortColumnIndex, this.state.sortDirection),
      });
    }
  }

  onSortChange(sortColumnIndex) {

    if (sortColumnIndex === this.state.sortColumnIndex) {

      const sortDirection = this.state.sortDirection === SortDirection.Ascending
          ? SortDirection.Descending : SortDirection.Ascending;

      this.setState({
        sortDirection,
        sortedModel: this.sort(this.props.model, this.state.sortColumnIndex, sortDirection),
      });
    } else {

      this.setState({
        sortColumnIndex,
        sortedModel: this.sort(this.props.model, sortColumnIndex, this.state.sortDirection),
      });
    }
  }

  renderSortIndicator(isSorted) {

    let classes = 'fa fa-sort';
    if (isSorted) {
      classes += this.state.sortDirection === SortDirection.Ascending ? '-up' : '-down';
    }

    return (
      <span>&nbsp;&nbsp;
        <a onClick={this.onSortChange.bind(this, this.state.sortColumnIndex)}>
          <span>
          <i style={{ verticalAlign: 'center' }} className={classes}></i>
          </span>
        </a>
      </span>
    );
  }

  renderColumnHeaders() {
    return this.props.columnLabels
      .map((label, index) => {
        return (
          <th key={label} onClick={this.onSortChange.bind(this, index)}>
            <a>{label}</a>
            {index === this.state.sortColumnIndex
              ? this.renderSortIndicator(true)
              : this.renderSortIndicator(false) }
          </th>
        );
      });
  }

  renderRows() {
    return this.state.sortedModel
      .map((row) => {
        return (
          <tr key={row.key}>
            {this.props.columnRenderers.map((renderer, i) => <td key={i}>{renderer(row.data)}</td>)}
          </tr>
        );
      });
  }

  render() {
    return (
      <table className="table table-sm table-hover customTable">
        <thead>
        <tr>
          {this.renderColumnHeaders()}
        </tr>
        </thead>
        <tbody>
        {this.renderRows()}
        </tbody>
      </table>
    );
  }

}

