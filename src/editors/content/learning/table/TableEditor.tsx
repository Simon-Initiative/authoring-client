import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { ContentElements } from 'data/content/common/elements';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { Select, TextInput } from '../../common/controls';
import { ContentElement } from 'data/content/common/interfaces';
import styles from './Table.styles';

export interface TableEditorProps
  extends AbstractContentEditorProps<contentTypes.Table> {
  onShowSidebar: () => void;
}

export interface TableEditorState {

}

/**
 * The content editor for contiguous text.
 */
@injectSheet(styles)
export class TableEditor
    extends AbstractContentEditor<contentTypes.Table,
    StyledComponentProps<TableEditorProps>, TableEditorState> {
  selectionState: any;

  constructor(props) {
    super(props);
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
      <ToolbarGroup label="Table" columns={8} highlightColor={CONTENT_COLORS.Table}>
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

  onRowAdd() {

    const columnsToAdd = this.props.model.rows.last().cells.size;

    const kvPairs = [];
    for (let i = 0; i < columnsToAdd; i += 1) {
      const cell = new contentTypes.CellData();
      kvPairs.push([cell.guid, cell]);
    }

    const cells = Immutable.OrderedMap
      <string, contentTypes.CellData | contentTypes.CellHeader>(kvPairs);

    const row = new contentTypes.Row({ cells });
    const model = this.props.model.with({
      rows: this.props.model.rows.set(row.guid, row),
    });

    this.props.onEdit(model, row);
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

  onCellEdit(row, contentElements: ContentElements, src) {

    // first unpack the cell from the ephemeral contentElements
    const cell = contentElements.content.first();

    const updatedRow = row.with({ cells: row.cells.set(cell.guid, cell) });
    const model = this.props.model
      .with({ rows: this.props.model.rows.set(updatedRow.guid, updatedRow) });

    this.props.onEdit(model, src);
  }

  renderCell(row: contentTypes.Row, cell: contentTypes.CellData | contentTypes.CellHeader) {

    const { className, classes } = this.props;

    const textAlign = cell.align;

    const elements = new ContentElements().with({
      content: Immutable.OrderedMap<string, ContentElement>([[cell.guid, cell]]),
    });

    return (
      <td
        style={ { textAlign } }
        className={classNames([classes.cell, className])}
        colSpan={parseInt(cell.colspan, 10)}
        rowSpan={parseInt(cell.rowspan, 10)}>

        <ContentContainer
          {...this.props}
          model={elements}
          onEdit={this.onCellEdit.bind(this, row)}
        />

      </td>
    );
  }

  renderMain() : JSX.Element {

    const { className, classes, model, editMode } = this.props;
    const { rowstyle } = model;

    const rows = model.rows.toArray().map((row, i) => {
      const styleClass = rowstyle === 'alternating' && (i % 2 === 0)
        ? classNames([classes.stripedRow, className])
        : classNames([classes.regularRow, className]);
      return (
        <tr className={styleClass}>
          {row.cells.toArray().map(cell => this.renderCell(row, cell))}
        </tr>
      );
    });

    return (
      <React.Fragment>
        <table className={classNames(['table', 'table-bordered', classes.table, className])}>
          <tbody>
          {rows}
          </tbody>
        </table>
        <button type="button"
          disabled={!editMode}
          onClick={this.onRowAdd.bind(this)}
          className="btn btn-link">+ Add row</button>
        <button type="button"
          disabled={!editMode}
          onClick={this.onColumnAdd.bind(this)}
          className="btn btn-link">+ Add column</button>
      </React.Fragment>
    );
  }

}

