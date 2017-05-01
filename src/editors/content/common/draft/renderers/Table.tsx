import * as React from 'react';
import { Table as TableType } from '../../../../../data/content/html/table';
import PreformattedText from './PreformattedText';
import { InteractiveRenderer, InteractiveRendererProps, InteractiveRendererState} from './InteractiveRenderer'
import { BlockProps } from './properties';
import { Button } from '../../Button';
import ModalTableEditor from '../../../table/ModalTableEditor';

type Data = {
  table: TableType;
}

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
    this.props.blockProps.services.displayModal(
        <ModalTableEditor
          editMode={true}
          {...this.props.blockProps}
          model={this.props.data.table}
          onCancel={() => this.props.blockProps.services.dismissModal()} 
          onInsert={(model) => {
              this.props.blockProps.services.dismissModal();
              this.props.blockProps.onEdit({table: model});
            }
          }/>);
  }

  render() : JSX.Element {

    const table = this.props.data.table;
    const rowCount = table.rows.size;
    const colCount = rowCount > 0 ? table.rows.first().cells.size : 0;

    const rows = new Array(rowCount);
    const cols = new Array(colCount);

    return (
      <div ref={(c) => this.focusComponent = c} onFocus={this.onFocus} onBlur={this.onBlur}>
        <table>
          {rows.map(r => <tr>{cols.map(c => <td>&nbsp;</td>)}</tr>)}
        </table>
        <Button onClick={this.onClick}>Edit</Button> 
      </div>);
  }
};
