import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { withStyles, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { ContentElement } from 'data/content/common/interfaces';
import { ContentElements } from 'data/content/common/elements';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarDropdown, ToolbarDropdownSize } from 'components/toolbar/ToolbarDropdown';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { TextInput } from 'editors/content/common/controls';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';

import ConjugateEditor from 'editors/content/learning/conjugation/ConjugateEditor';
import { Maybe } from 'tsmonad';
import { isFirefox, isEdge, isIE } from 'utils/browser';
import {
  DiscoverableId,
} from 'components/common/Discoverable.controller';

import { styles } from 'editors/content/learning/conjugation/Conjugation.styles';

export interface ConjugationEditorProps
  extends AbstractContentEditorProps<contentTypes.Conjugation> {
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
}

export interface ConjugationEditorState {

}

// Get the key of the nth element in an ordered map
function getKey(
  index: number, collection:
    Immutable.OrderedMap<string,
      contentTypes.ConjugationCell | contentTypes.Cr>) {
  return collection.toArray()[index].guid;
}

/**
 * The content editor for tables.
 */
class ConjugationEditor
  extends AbstractContentEditor<contentTypes.Conjugation,
  StyledComponentProps<ConjugationEditorProps, typeof styles>, ConjugationEditorState> {
  selectionState: any;

  constructor(props) {
    super(props);

    this.onInsertColumn = this.onInsertColumn.bind(this);
    this.onInsertRow = this.onInsertRow.bind(this);
    this.onRemoveRow = this.onRemoveRow.bind(this);
    this.onRemoveColumn = this.onRemoveColumn.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);
  }

  renderSidebar() {

    return (
      <SidebarContent title="Conjugation">
      </SidebarContent>
    );
  }

  renderToolbar() {

    return (
      <ToolbarGroup label="Conjugation" columns={5} highlightColor={CONTENT_COLORS.Conjugation}>
      </ToolbarGroup>
    );
  }

  onCellEdit(row, cell, src) {

    const updatedRow = row.with({ cells: row.cells.set(cell.guid, cell) });
    const model = this.props.model
      .with({ rows: this.props.model.rows.set(updatedRow.guid, updatedRow) });

    this.props.onEdit(model, src);
  }


  renderCell(row: contentTypes.Cr, cell: contentTypes.ConjugationCell) {

    const { className, classes } = this.props;

    // Passing this fake parent to the CellEditor so that the
    // empty supportedElements causes all Insert Toolbar buttons
    // to be disabled, but allows editing of the cell's attributes

    // For now, we disable duplication, removal, and reordering of cells.
    // This doesn't disable the buttons, though.
    const noManualControl = {
      supportedElements: Immutable.List<string>(),
      onAddNew: (e) => { },
      onEdit: (e, s) => {
        this.onCellEdit.call(this, row, e, s);
      },
      onPaste: (e) => { },
      onRemove: (e) => { },
      onDuplicate: (e) => { },
      onMoveUp: (e) => { },
      onMoveDown: (e) => { },
      props: this.props,
    };

    const style = {};
    if (!isFirefox && !isIE && !isEdge) {
      style['height'] = '1px';
    }

    const cellEditor = <ConjugateEditor
      {...this.props}
      model={cell}
      parent={noManualControl}
      onEdit={this.onCellEdit.bind(this, row)}
    />;

    if (cell.contentType === 'Conjugate') {
      return (
        <td
          key={cell.guid}
          style={style}
          className={classNames([classes.cell, className])}>
          {cellEditor}
        </td>
      );
    }
    return (
      <th
        key={cell.guid}
        style={style}
        className={classNames([classes.cell, className])}>
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
        {this.renderRowDropdown(
          index, this.onInsertRow, this.onInsertHeaderRow, this.onRemoveRow, false)}
      </td>
    );

  }

  renderColumnHeader(index: number) {

    const { classes, className } = this.props;

    return (
      <td
        key={'column-' + index}
        className={classNames([classes.colHeader, className])}>
        {this.renderColumnDropdown(
          index, this.onInsertColumn,
          this.onInsertHeaderColumn, this.onRemoveColumn, true)}
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
      const cell = new contentTypes.CellHeader();
      kvPairs.push([cell.guid, cell]);
    }

    const cells = Immutable.OrderedMap
      <string, contentTypes.ConjugationCell>(kvPairs);

    const row = new contentTypes.Cr({ cells });
    const rows = this.insertAt(this.props.model.rows, row, index);

    this.props.onEdit(this.props.model.with({ rows }), row);
  }


  onInsertHeaderRow(index: number) {

    const columnsToAdd = this.props.model.rows.last().cells.size;

    const kvPairs = [];
    for (let i = 0; i < columnsToAdd; i += 1) {
      const cell = new contentTypes.CellHeader();
      kvPairs.push([cell.guid, cell]);
    }

    const cells = Immutable.OrderedMap
      <string, contentTypes.ConjugationCell>(kvPairs);

    const row = new contentTypes.Cr({ cells });
    const rows = this.insertAt(this.props.model.rows, row, index);

    this.props.onEdit(this.props.model.with({ rows }), row);
  }



  onInsertColumn(index: number) {

    const { model } = this.props;
    let i = 0;

    const rows = model.rows.map((row) => {

      let cell: contentTypes.ConjugationCell = new contentTypes.Conjugate();

      // Use as a template the last cell in the first row, that
      // way if it is a row of headers in place we continue it
      if (i === 0 && row.cells.last().contentType === 'CellHeader') {
        cell = new contentTypes.CellHeader();
      }
      i = i + 1;

      const cells = this.insertAt(row.cells, cell, index);
      return row.with({ cells });

    }).toOrderedMap();

    this.props.onEdit(model.with({ rows }));
  }


  onPronunciationEdit(pronunciations, src) {

    if (pronunciations.content.size === 0) {
      const model = this.props.model.with({
        pronunciation: Maybe.nothing(),
      });

      this.props.onEdit(model, src);
    } else {
      const model = this.props.model.with({
        pronunciation: Maybe.just(pronunciations.content.first()),
      });

      this.props.onEdit(model, src);
    }
  }

  onAddPronunciation() {

    const pronunciation = new contentTypes.Pronunciation();
    const model = this.props.model.with({
      pronunciation: Maybe.just(pronunciation),
    });

    this.props.onEdit(model, pronunciation);
  }

  onInsertHeaderColumn(index: number) {

    const { model } = this.props;

    const rows = model.rows.map((row) => {

      const cell = new contentTypes.CellHeader();
      const cells = this.insertAt(row.cells, cell, index);
      return row.with({ cells });

    }).toOrderedMap();

    this.props.onEdit(model.with({ rows }));
  }

  onRemoveRow(index: number) {

    if (this.props.model.rows.size > 1) {
      const rows = this.props.model.rows.delete(getKey(index, this.props.model.rows));
      this.props.onEdit(this.props.model.with({ rows }));
    }

  }

  onEditVerb(verb: string) {
    const model = this.props.model.with({ verb });
    this.props.onEdit(model, model);
  }

  onRemoveColumn(index: number) {
    const model = this.props.model;
    let rows = model.rows;

    // Do not allow removal of only column
    if (model.rows.first() && model.rows.first().cells.size <= 1) {
      return;
    }

    rows = rows.map((row) => {

      const before = row.cells.toSeq().slice(0, index);
      const after = row.cells.toSeq().slice(index + 1);
      const cells = before.concat(after).toOrderedMap();

      return row.with({ cells });

    }).toOrderedMap();

    this.props.onEdit(model.with({ rows }));
  }

  renderRowDropdown(
    index: number, onInsert: (index: number) => void,
    onInsertHeader: (index: number) => void,
    onRemove: (index: number) => void, showOnRight: boolean) {

    const { classes, className, editMode } = this.props;
    return (
      <div className={classNames([classes.dropdown, className])}>
        <ToolbarDropdown
          size={ToolbarDropdownSize.Tiny}
          hideArrow
          positionMenuOnRight={showOnRight}
          label={<i className={classNames(['fa fa-ellipsis-v', classes.dropdownLabel,
            classes.moreLabel])} />} >
          <button className="dropdown-item"
            disabled={!editMode}
            onClick={() => onInsert(index)}>
            {'Insert row before'}
          </button>
          <button className="dropdown-item"
            disabled={!editMode}
            onClick={() => onInsert(index + 1)}>
            {'Insert row after'}
          </button>
          <button className="dropdown-item"
            disabled={!editMode}
            onClick={() => onInsertHeader(index)}>
            {'Insert header row before'}
          </button>
          <button className="dropdown-item"
            disabled={!editMode}
            onClick={() => onInsertHeader(index + 1)}>
            {'Insert header row after'}
          </button>
          <button className="dropdown-item"
            disabled={!editMode}
            onClick={() => onRemove(index)}>
            {'Remove row'}
          </button>
        </ToolbarDropdown>
      </div>
    );
  }

  renderColumnDropdown(
    index: number, onInsert: (index: number) => void,
    onInsertHeader: (index: number) => void,
    onRemove: (index: number) => void,
    showOnRight: boolean) {

    const { classes, className, editMode } = this.props;
    return (
      <div className={classNames([classes.dropdown, className])}>
        <ToolbarDropdown
          size={ToolbarDropdownSize.Tiny}
          hideArrow
          positionMenuOnRight={showOnRight}
          label={<i className={classNames(['fa fa-ellipsis-v', classes.dropdownLabel,
            classes.moreLabel])} />} >
          <button className="dropdown-item"
            disabled={!editMode}
            onClick={() => onRemove(index)}>
            {'Remove column'}
          </button>
        </ToolbarDropdown>
      </div>
    );
  }

  onTitleEdit(ct: ContiguousText, sourceObject) {
    const content = this.props.model.title.text.content.set(ct.guid, ct);
    const text = this.props.model.title.text.with({ content });
    const title = this.props.model.title.with({ text });
    const model = this.props.model.with({ title });

    this.props.onEdit(model, sourceObject);
  }

  renderMain(): JSX.Element {

    const { className, classes, model, editMode } = this.props;

    let maxColumns = 0;
    const rows = model.rows.toArray().map((row, i) => {

      maxColumns = Math.max(maxColumns, row.cells.size);

      return (
        <tr key={row.guid}>
          {this.renderRowHeader(i)}
          {row.cells.toArray().map(cell => this.renderCell(row, cell))}
        </tr>
      );
    });

    const headerRow = this.renderHeaderRow(maxColumns);

    const canAddPronunciation = model.pronunciation.caseOf({
      just: n => false,
      nothing: () => true,
    });

    const pronunciations = new ContentElements().with({
      content: model.pronunciation.caseOf({
        just: p => Immutable.OrderedMap<string, ContentElement>().set(p.guid, p),
        nothing: () => Immutable.OrderedMap<string, ContentElement>(),
      }),
    });

    const pronunciationEditor = model.pronunciation.caseOf({
      just: p => <ContentContainer
        {...this.props}
        model={pronunciations}
        onEdit={this.onPronunciationEdit.bind(this)}
      />,
      nothing: () => null,
    });

    return (
      <div className={classNames(['ConjugationEditor', classes.conjugationEditor, className])}>

        <TitleTextEditor
          context={this.props.context}
          services={this.props.services}
          onFocus={this.props.onFocus}
          model={(this.props.model.title.text.content.first() as ContiguousText)}
          editMode={this.props.editMode}
          onEdit={this.onTitleEdit}
          editorStyles={{ fontSize: 20 }} />

        <TextInput
          editMode={editMode}
          width="100px"
          label="Verb"
          value={model.verb}
          type="string"
          onEdit={this.onEditVerb.bind(this)}
        />
        {pronunciationEditor}
        <button type="button"
          disabled={!editMode || !canAddPronunciation}
          onClick={this.onAddPronunciation.bind(this)}
          className="btn btn-link">+ Add pronunciation</button>
        <table className={classNames([classes.conjugation, className])}>
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
          onClick={this.onInsertColumn.bind(this, model.rows.size)}
          className="btn btn-link">+ Add column</button>
      </div>
    );
  }

}

const StyledConjugationEditor = withStyles<ConjugationEditorProps>(styles)(ConjugationEditor);
export default StyledConjugationEditor;
