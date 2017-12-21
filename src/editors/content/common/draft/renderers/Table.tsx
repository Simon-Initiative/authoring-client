import * as React from 'react';

import * as contentTypes from '../../../../../data/contentTypes';
import { Table as TableType } from '../../../../../data/content/html/table';
import { CellHeader } from '../../../../../data/content/html/cellheader';
import {
  InteractiveRenderer, InteractiveRendererProps, InteractiveRendererState,
} from './InteractiveRenderer';
import ModalTableEditor from '../../../table/ModalTableEditor';
import { Html } from '../../../../../data/content/html';
import AutoHideEditRemove from './AutoHideEditRemove';

type Data = {
  table: TableType;
};

export interface TableProps extends InteractiveRendererProps {
  data: Data;
}

export interface TableState extends InteractiveRendererState {

}

export interface TableProps {

}

export function getHtmlDetails(html : contentTypes.Html) : JSX.Element {

  const blocks = html.contentState.getBlocksAsArray();

  const filtered = html.contentState.getBlocksAsArray()
    .filter(b => b.getType !== 'atomic'
      && b.getCharacterList().toArray().every(e => e.getEntity() === null));

  if (filtered.length !== blocks.length) {
    return <i>Click &apos;Edit&apos; to see cell content</i>;
  }

  return blocks.map(b => <p key={b.getKey()}>{b.getText()}</p>);
}


export class Table extends InteractiveRenderer<TableProps, TableState> {

  constructor(props) {
    super(props, {});

    this.onClick = this.onClick.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }

  onEdit(model) {

  }

  onClick() {
    const b = this.props.blockProps;
    this.props.blockProps.services.displayModal(
      <ModalTableEditor
        editMode={true}
        context={b.context}
        services={b.services}

        model={this.props.data.table}
        onCancel={() => this.props.blockProps.services.dismissModal()}
        onInsert={(model) => {
          this.props.blockProps.services.dismissModal();
          this.props.blockProps.onEdit({ table: model });
        }
      }/>);
  }

  onRemove() {
    this.props.blockProps.onRemove();
  }

  render() : JSX.Element {

    const rows = this.props.data.table.rows.toArray();
    const empty = <tr><td>&nbsp;&nbsp;&nbsp;</td><td>&nbsp;&nbsp;&nbsp;</td></tr>;
    let renderedRows;

    const renderCell = (cell) => {
      let colspan = 1;
      if (cell.colspan !== '') {
        colspan = parseInt(cell.colspan, 10);
      }
      if (cell instanceof CellHeader) {

        return <th colSpan={colspan} key={cell.guid}>
          {getHtmlDetails(new Html({ contentState: cell.content }))}</th>;
      }

      return <td colSpan={colspan} key={cell.guid}>
        {getHtmlDetails(new Html({ contentState: cell.content }))}</td>;
    };

    if (rows.length > 0) {
      renderedRows = rows.map(r => <tr key={r.guid}>{r.cells.map(renderCell)}</tr>);
    } else {
      renderedRows = empty;
    }

    return (
      <div ref={c => this.focusComponent = c} onFocus={this.onFocus} onBlur={this.onBlur}>
        <AutoHideEditRemove onEdit={this.onClick} onRemove={this.onRemove}
          editMode={this.props.blockProps.editMode} >
          <table className="table table-bordered" style={ { width: '50%' } }>
            <tbody>
              {renderedRows}
            </tbody>
          </table>
        </AutoHideEditRemove>
      </div>);
  }
}
