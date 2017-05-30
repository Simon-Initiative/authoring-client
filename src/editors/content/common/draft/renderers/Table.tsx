import * as React from 'react';
import { Table as TableType } from '../../../../../data/content/html/table';
import PreformattedText from './PreformattedText';
import { InteractiveRenderer, InteractiveRendererProps, 
  InteractiveRendererState } from './InteractiveRenderer';
import { BlockProps } from './properties';
import { Button } from '../../Button';
import ModalTableEditor from '../../../table/ModalTableEditor';
import { getHtmlDetails } from '../../../common/details';
import { Html } from '../../../../../data/content/html';

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

export class Table extends InteractiveRenderer<TableProps, TableState> {

  constructor(props) {
    super(props, {});

    this.onClick = this.onClick.bind(this);
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

  render() : JSX.Element {

    const rows = this.props.data.table.rows.toArray();
    const empty = <tr><td>&nbsp;&nbsp;&nbsp;</td><td>&nbsp;&nbsp;&nbsp;</td></tr>;
    let renderedRows;

    const renderCell = 
      cell => <td key={cell.guid}>{getHtmlDetails(new Html({ contentState: cell.content }))}</td>;

    if (rows.length > 0) {
      renderedRows = rows.map(r => <tr key={r.guid}>{r.cells.map(renderCell)}</tr>);
    } else {
      renderedRows = empty;
    }

    return (
      <div ref={c => this.focusComponent = c} onFocus={this.onFocus} onBlur={this.onBlur}>
        <table className="table table-bordered" style={ { width: '50%' } }>
          <tbody>
            {renderedRows}
          </tbody>
        </table>
        <Button editMode={this.state.editMode} onClick={this.onClick}>Edit Table</Button> 
      </div>);
  }
}
