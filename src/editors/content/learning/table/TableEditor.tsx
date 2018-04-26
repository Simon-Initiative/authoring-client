import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarDropdown, ToolbarDropdownSize } from 'components/toolbar/ToolbarDropdown';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { Select, TextInput } from '../../common/controls';
import CellEditor from './CellEditor';
import { isFirefox, isEdge, isIE } from 'utils/browser';

import { styles } from './Table.styles';

export interface TableEditorProps
  extends AbstractContentEditorProps<contentTypes.Table> {
  onShowSidebar: () => void;
}

export interface TableEditorState {

}

// Get the key of the nth element in an ordered map
function getKey(
  index: number, collection:
  Immutable.OrderedMap<string,
    contentTypes.CellData | contentTypes.CellHeader | contentTypes.Row>) {
  return collection.toArray()[index].guid;
}

/**
 * The content editor for tables.
 */
@injectSheet(styles)
export default class TableEditor
    extends AbstractContentEditor<contentTypes.Table,
    StyledComponentProps<TableEditorProps>, TableEditorState> {
  selectionState: any;

  constructor(props) {
    super(props);

    this.onInsertColumn = this.onInsertColumn.bind(this);
    this.onInsertRow = this.onInsertRow.bind(this);
    this.onRemoveRow = this.onRemoveRow.bind(this);
    this.onRemoveColumn = this.onRemoveColumn.bind(this);

  }

  onTitleEdit(title) {
    this.props.onEdit(this.props.model.with({ title }));
  }

  renderSidebar() {
    const { model } = this.props;

    const title = model.title;
    const rowStyle = model.rowstyle;

    return (
      <SidebarContent title="Table">
        <SidebarGroup label="Title">
          <TextInput
            width="100%"
            editMode={this.props.editMode}
            value={title}
            label=""
            type="text"
            onEdit={this.onTitleEdit.bind(this)} />
        </SidebarGroup>
        <SidebarGroup label="Row Style">
          <Select
            editMode={this.props.editMode}
            label=""
            value={rowStyle}
            onChange={this.onStyleChange.bind(this)}>
            <option value="plain">Plain</option>
            <option value="alternating">Alternating</option>
          </Select>
        </SidebarGroup>
      </SidebarContent>
    );
  }

  onStyleChange(rowstyle) {
    this.props.onEdit(this.props.model.with({ rowstyle }));
  }

  renderToolbar() {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Table" columns={4} highlightColor={CONTENT_COLORS.Table}>
        <ToolbarButton onClick={() => onShowSidebar()} size={ToolbarButtonSize.Large}>
          <div><i style={{ textDecoration: 'underline' }}>Abc</i></div>
          <div>Title</div>
        </ToolbarButton>
        <ToolbarButton onClick={() => onShowSidebar()} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-th-list"></i></div>
          <div>Row Style</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  onColumnAdd() {

    const rows = this.props.model.rows.map((row) => {
      const cell = new contentTypes.CellData();
      return row.with({ cells: row.cells.set(cell.guid, cell) });
    }).toOrderedMap();

    const model = this.props.model.with({ rows });

    const firstCell = rows.first().cells.first();

    this.props.onEdit(model, firstCell);
  }

  onCellEdit(row, cell, src) {

    const updatedRow = row.with({ cells: row.cells.set(cell.guid, cell) });
    const model = this.props.model
      .with({ rows: this.props.model.rows.set(updatedRow.guid, updatedRow) });

    this.props.onEdit(model, src);
  }


  onCellRemove(row, cell, src) {

    const updatedRow = row.with({ cells: row.cells.delete(cell.guid) });
    const model = this.props.model
      .with({ rows: this.props.model.rows.set(updatedRow.guid, updatedRow) });

    this.props.onEdit(model, src);
  }


  renderCell(row: contentTypes.Row, cell: contentTypes.CellData | contentTypes.CellHeader) {

    const { className, classes } = this.props;

    const textAlign = cell.align;

    // Passing this fake parent to the CellEditor so that the
    // empty supportedElements causes all Insert Toolbar buttons
    // to be disabled, but allows editing of the cell's attributes

    // For now, we disable duplication, removal, and reordering of cells.
    // This doesn't disable the buttons, though.
    const noManualControl = {
      supportedElements: Immutable.List<string>(),
      onAddNew: (e) => {},
      onEdit: (e, s) => {
        this.onCellEdit.call(this, row, e, s);
      },
      onRemove: (e) => {
        this.onCellRemove(row, e, null);
      },
      onPaste: (e) => {},
      onDuplicate: (e) => {},
      onMoveUp: (e) => {},
      onMoveDown: (e) => {},
      props: this.props,
    };

    const style = { textAlign };

    if (!isFirefox && !isIE && !isEdge) {
      style['height'] = '1px';
    }

    const cellEditor = <CellEditor
      {...this.props}
      model={cell}
      parent={noManualControl}
      onEdit={this.onCellEdit.bind(this, row)}
    />;

    if (cell.contentType === 'CellData') {
      return (
        <td
          key={cell.guid}
          style={style}
          className={classNames([classes.cell, className])}
          colSpan={parseInt(cell.colspan, 10)}
          rowSpan={parseInt(cell.rowspan, 10)}>
          {cellEditor}
        </td>
      );
    }
    return (
      <th
        key={cell.guid}
        style={style}
        className={classNames([classes.cell, className])}
        colSpan={parseInt(cell.colspan, 10)}
        rowSpan={parseInt(cell.rowspan, 10)}>
        {cellEditor}
      </th>
    );


  }

  renderHeaderRow(columns: number) {

    const { classes, className } = this.props;

    const headers = [];
    for (let i = 0; i < columns; i += 1) {
      headers.push(
        this.renderColumnHeader(i),
      );
    }

    return (
      <tr key="headerRow">
        <td className={classNames([classes.cornerHeader, className])}></td>
        {headers}
      </tr>
    );
  }

  renderRowHeader(index: number) {

    const { classes, className } = this.props;

    return (
      <td
        key={'row-' + index}
        className={classNames([classes.rowHeader, className])}>
        {this.renderDropdown(index, this.onInsertRow, this.onRemoveRow, 'row', false)}
      </td>
    );

  }

  renderColumnHeader(index: number) {

    const { classes, className } = this.props;

    return (
      <td
        key={'column-' + index}
        className={classNames([classes.colHeader, className])}>
        {this.renderDropdown(index, this.onInsertColumn, this.onRemoveColumn, 'column', true)}
      </td>
    );

  }

  insertAt(model, toInsert, index) {
    const arr = model
      .map((v, k) => [k, v])
      .toArray();

    arr.splice(index, 0, [toInsert.guid, toInsert]);

    return Immutable.OrderedMap<string, any>(arr);
  }

  onInsertRow(index: number) {

    const columnsToAdd = this.props.model.rows.last().cells.size;

    const kvPairs = [];
    for (let i = 0; i < columnsToAdd; i += 1) {
      const cell = new contentTypes.CellData();
      kvPairs.push([cell.guid, cell]);
    }

    const cells = Immutable.OrderedMap
      <string, contentTypes.CellData | contentTypes.CellHeader>(kvPairs);

    const row = new contentTypes.Row({ cells });
    const rows = this.insertAt(this.props.model.rows, row, index);

    this.props.onEdit(this.props.model.with({ rows }), row);
  }

  onInsertColumn(index: number) {

    const { model } = this.props;

    const rows = model.rows.map((row) => {

      const cell = new contentTypes.CellData();
      const cells = this.insertAt(row.cells, cell, index);
      return row.with({ cells });

    }).toOrderedMap();

    this.props.onEdit(model.with({ rows }));
  }

  onRemoveRow(index: number) {
    const rows = this.props.model.rows.delete(getKey(index, this.props.model.rows));
    this.props.onEdit(this.props.model.with({ rows }));
  }

  onRemoveColumn(index: number) {
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

  renderDropdown(
    index: number, onInsert: (index: number) => void,
    onRemove: (index: number) => void,
    term: string, showOnRight: boolean) {

    const { classes, className, editMode } = this.props;
    return (
      <div className={classNames([classes.dropdown, className])}>
        <ToolbarDropdown
          size={ToolbarDropdownSize.Tiny}
          hideArrow
          positionMenuOnRight={showOnRight}
          label={<i className={classNames(['fa fa-ellipsis-v', classes.dropdownLabel,
            classes.moreLabel])}/>} >
          <button className="dropdown-item"
            disabled={!editMode}
            onClick={() => onInsert(index) }>
            {`Insert ${term} before`}
          </button>
          <button className="dropdown-item"
            disabled={!editMode}
            onClick={() => onInsert(index + 1) }>
            {`Insert ${term} after`}
          </button>
          <button className="dropdown-item"
            disabled={!editMode}
            onClick={() => onRemove(index) }>
            {`Remove ${term}`}
          </button>
        </ToolbarDropdown>
      </div>
    );
  }

  renderMain() : JSX.Element {

    const { className, classes, model, editMode } = this.props;
    const { rowstyle } = model;

    let maxColumns = 0;
    const rows = model.rows.toArray().map((row, i) => {

      maxColumns = Math.max(maxColumns, row.cells.size);

      const styleClass = rowstyle === 'alternating' && (i % 2 === 0)
        ? classNames([classes.stripedRow, className])
        : classNames([classes.regularRow, className]);
      return (
        <tr
          key={row.guid}
          className={styleClass}>
          {this.renderRowHeader(i)}
          {row.cells.toArray().map(cell => this.renderCell(row, cell))}
        </tr>
      );
    });

    const headerRow = this.renderHeaderRow(maxColumns);

    return (
      <div className={classNames(['TableEditor', classes.tableEditor, className])}>
        <table className={classNames([classes.table, className])}>
          <tbody>
          {headerRow}
          {rows}
          </tbody>
        </table>
        <button type="button" onClick={this.onInsertRow.bind(this, model.rows.size)}
          disabled={!editMode}
          className="btn btn-link">+ Add row</button>
        <button type="button"
          disabled={!editMode}
          onClick={this.onColumnAdd.bind(this)}
          className="btn btn-link">+ Add column</button>
      </div>
    );
  }

}

