import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { Row, Cell }  from '../../../data/content/html/row';
import { CellData }  from '../../../data/content/html/celldata';
import { CellHeader }  from '../../../data/content/html/cellheader';
import { Html } from '../../../data/content/html';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import guid from '../../../utils/guid';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';
import { InputLabel } from '../common/InputLabel';

import '../common/editor.scss';


export interface TableEditor {
  
}

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

  onCellEdit(rowGuid: string, cellGuid: string, content ) {
    let model = this.props.model;
    let row = this.props.model.rows.get(rowGuid);
    let cell = row.cells.get(cellGuid);

    cell = cell.with({content: content.contentState});
    row = row.with({cells: row.cells.set(cellGuid, cell)});
    model = model.with({rows: model.rows.set(rowGuid, row)});

    this.props.onEdit(model);
  }

  renderRow(row: Row, inlineToolbar: any, blockToolbar: any) {
    return (
      <tr key={row.guid}>
        {row.cells.toArray().map(c => this.renderCell(row.guid, c, inlineToolbar, blockToolbar))}
      </tr>
    )
  }

  onRowAdd() {
    const colCount = this.props.model.rows.size === 0 ? 1 : this.props.model.rows.last().cells.size;
    let cells = Immutable.OrderedMap<string, Cell>();
    for (let i = 0; i < colCount; i++) {
      const cell = new CellData();
      cells = cells.set(cell.guid, cell);
    }
    
    const newRow = new Row({cells});
    const rows = this.props.model.rows.set(newRow.guid, newRow);

    this.props.onEdit(this.props.model.with({rows}));
  }

  onRowRemove(rowGuid: string) {
    const rows = this.props.model.rows.delete(rowGuid);
    this.props.onEdit(this.props.model.with({rows}));
  }

  onColAdd() {
    let model = this.props.model;
    let rows = model.rows;

    rows = rows.map((row) => {

      let newCell;
      if (row.cells.first().contentType === 'CellData') {
        newCell = new CellData();
      } else {
        newCell = new CellHeader();
      }
      return row.with({cells: row.cells.set(newCell.guid, newCell)})
    }).toOrderedMap();

    this.props.onEdit(model.with({rows}));
  }

  onColRemove(index: number) {
    let model = this.props.model;
    let rows = model.rows;

    rows = rows.map((row) => {

      const before = row.cells.toSeq().slice(0, index);
      const after = row.cells.toSeq().slice(index + 1);
      const cells = before.concat(after).toOrderedMap();

      return row.with({cells});

    }).toOrderedMap();

    this.props.onEdit(model);
  }

  renderCell(rowGuid: string, cell: Cell, inlineToolbar: any, blockToolbar: any) {

    const bodyStyle = {
      minHeight: '20px',
      borderStyle: 'none',
      borderWith: 1,
      borderColor: '#AAAAAA'
    }
    const editor = <HtmlContentEditor 
      editorStyles={bodyStyle}
      inlineToolbar={inlineToolbar}
      blockToolbar={blockToolbar}
      {...this.props}
      model={new Html({contentState: cell.content})}
      onEdit={this.onCellEdit.bind(this, rowGuid, cell.guid)} 
      />
    if (cell.contentType === 'CellData') {
      return <td key={cell.guid}>{editor}</td>;
    } else {
      return <th key={cell.guid}>{editor}</th>;
    }
  }

  render() : JSX.Element {

    const table = this.props.model;
    const rows = table.rows.toArray();

    const inlineToolbar = <InlineToolbar/>;
    const blockToolbar = <BlockToolbar/>;

    return (
      <div className='itemWrapper'>
        <h5>Edit Table</h5>
        <div className="btn-toolbar mb-3" role="toolbar" aria-label="Toolbar with button groups">
          <div className="btn-group mr-2" role="group" aria-label="First group">
            <button onClick={this.onRowAdd} type="button" className="btn btn-secondary btn-sm">Add Row</button>
            <button onClick={this.onColAdd} type="button" className="btn btn-secondary btn-sm">Add Column</button>
          </div>
        </div>
        <table style={{width: '100%'}}>
          <tbody>
          {rows.map(row => this.renderRow(row, inlineToolbar, blockToolbar))}
          </tbody>
        </table>
      </div>);
  }

}

