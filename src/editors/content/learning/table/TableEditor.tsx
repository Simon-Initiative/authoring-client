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
import { ToolbarContentContainer } from 'editors/content/container/ToolbarContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { Select, TextInput } from '../../common/controls';
import { Maybe } from 'tsmonad';

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
export default class TableEditor
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
      <ToolbarGroup label="Table" columns={8} highlightColor={CONTENT_COLORS.Ol}>
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

    const row = new contentTypes.Row();
    const model = this.props.model.with({
      rows: this.props.model.rows.set(row.guid, row),
    });

    this.props.onEdit(model, row);
  }

  onRowEdit(elements, src) {

    const items = elements
      .content
      .toArray()
      .map(e => [e.guid, e]);

    const model = this.props.model.with({
      rows: Immutable.OrderedMap<string, contentTypes.Row>(items),
    });

    this.props.onEdit(model, src);
  }

  renderMain() : JSX.Element {

    const { className, classes, model } = this.props;
    const { rowstyle } = model;

    const totalItems = model.rows.size;

    const elements = new ContentElements().with({
      content: model.rows,
    });

    return (
      <div className={classNames([classes.list, className])}>
        <ContentContainer
          {...this.props}
          model={elements}
          onEdit={this.onRowEdit.bind(this)}
        />
        <button type="button" onClick={this.onRowAdd.bind(this)}
          className="btn btn-link">+ Add row</button>
      </div>
    );
  }

}

