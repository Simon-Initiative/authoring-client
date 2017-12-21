import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { Cell, Row } from '../../../data/content/html/row';
import { CellData } from '../../../data/content/html/celldata';
import { CellHeader } from '../../../data/content/html/cellheader';
import { Html } from '../../../data/content/html';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';
import InlineInsertionToolbar from '../html/InlineInsertionToolbar';

export interface TableEditorProps extends AbstractContentEditorProps<contentTypes.Table> {

}

export interface TableEditorState {

}

/**
 * The content editor for Table.
 */
export class TableEditor
  extends AbstractContentEditor<contentTypes.Table, TableEditorProps, TableEditorState> {

  constructor(props) {
    super(props);

    this.onRowAdd = this.onRowAdd.bind(this);
    this.onColAdd = this.onColAdd.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  onCellEdit(rowGuid: string, cellGuid: string, content) {

    let model = this.props.model;
    let row = this.props.model.rows.get(rowGuid);
    let cell = row.cells.get(cellGuid);

    cell = cell.with({ content: content.contentState });
    row = row.with({ cells: row.cells.set(cellGuid, cell) });
    model = model.with({ rows: model.rows.set(rowGuid, row) });

    this.props.onEdit(model);
  }


  onRowAdd() {
    const colCount = this.props.model.rows.size === 0 ? 1 : this.props.model.rows.last().cells.size;
    let cells = Immutable.OrderedMap<string, Cell>();
    for (let i = 0; i < colCount; i += 1) {
      const cell = new CellData();
      cells = cells.set(cell.guid, cell);
    }

    const newRow = new Row({ cells });
    const rows = this.props.model.rows.set(newRow.guid, newRow);

    this.props.onEdit(this.props.model.with({ rows }));
  }

  onRowRemove(rowGuid: string) {

    if (!this.props.editMode) return;

    const rows = this.props.model.rows.delete(rowGuid);
    this.props.onEdit(this.props.model.with({ rows }));
  }

  onColAdd() {
    const model = this.props.model;
    let rows = model.rows;

    rows = rows.map((row) => {

      let newCell;
      if (row.cells.first().contentType === 'CellData') {
        newCell = new CellData();
      } else {
        newCell = new CellHeader();
      }
      return row.with({ cells: row.cells.set(newCell.guid, newCell) });
    }).toOrderedMap();

    this.props.onEdit(model.with({ rows }));
  }

  onColRemove(index: number) {

    if (!this.props.editMode) return;

    const model = this.props.model;
    let rows = model.rows;

    rows = rows.map((row) => {

      const before = row.cells.toSeq().slice(0, index);
      const after = row.cells.toSeq().slice(index + 1);
      const cells = before.concat(after).toOrderedMap();

      return row.with({ cells });

    }).toOrderedMap();

    this.props.onEdit(model.with({ rows }));
  }

  renderCell(
    rowGuid: string,
    cell: Cell,
    inlineToolbar: any,
    blockToolbar: any,
    insertionToolbar: any,
    totalCells: number,
  ) {

    const width = ((1 / totalCells) * 100) + '%';
    const verticalAlign = 'top';
    const bodyStyle = {
      minHeight: '20px',
      borderStyle: 'none',
      borderWith: 1,
      borderColor: '#AAAAAA',
    };
    const editor = <HtmlContentEditor
      showBorder={false}
      editorStyles={bodyStyle}
      inlineToolbar={inlineToolbar}
      blockToolbar={blockToolbar}
      inlineInsertionToolbar={insertionToolbar}
      {...this.props}
      model={new Html({ contentState: cell.content })}
      onEdit={this.onCellEdit.bind(this, rowGuid, cell.guid)}
      />;
    if (cell.contentType === 'CellData') {
      return <td style={ { width, verticalAlign } } key={cell.guid}>{editor}</td>;
    }

    return <th style={ { width, verticalAlign } } key={cell.guid}>{editor}</th>;
  }

  renderDeleteColumn() {
    const rows = this.props.model.rows.toArray();
    if (rows.length > 0) {
      const tds = [];
      for (let i = 0; i < this.props.model.rows.first().cells.size; i += 1) {
        tds.push(<td key={i}>
          <span className="closebtn input-group-addon"
            onClick={this.onColRemove.bind(this, i)}>&times;</span>
          </td>);
      }
      return <tr>{tds}</tr>;
    }

    return null;
  }

  renderRow(row: Row, inlineToolbar: any, blockToolbar: any, insertionToolbar: any) {
    return (
      <tr key={row.guid}>
        {row.cells.toArray().map(
          c => this.renderCell(
            row.guid, c, inlineToolbar,
            blockToolbar, insertionToolbar, row.cells.size))}
        <td><span className="closebtn input-group-addon"
          onClick={this.onRowRemove.bind(this, row.guid)}>&times;</span> </td>
      </tr>
    );
  }

  render() : JSX.Element {

    const table = this.props.model;
    const rows = table.rows.toArray();

    const inlineToolbar = <InlineToolbar/>;
    const blockToolbar = <BlockToolbar/>;
    const insertionToolbar = <InlineInsertionToolbar/>;

    return (
      <div className="itemWrapper">
        <div className="btn-toolbar mb-3" role="toolbar" aria-label="Toolbar with button groups">
          <div className="btn-group mr-2" role="group" aria-label="First group">
            <button disabled={!this.props.editMode} onClick={this.onRowAdd} type="button"
              className="btn btn-secondary btn-sm">Add Row</button>
            <button disabled={!this.props.editMode} onClick={this.onColAdd} type="button"
              className="btn btn-secondary btn-sm">Add Column</button>
          </div>
        </div>
        <table className="table table-bordered" style={ { width: '100%' } }>
          <tbody>
          {this.renderDeleteColumn()}
          {rows.map(row => this.renderRow(row, inlineToolbar, blockToolbar, insertionToolbar))}
          </tbody>
        </table>
      </div>);
  }

}

