import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { Select, TextInput } from '../../common/controls';
import { Maybe } from 'tsmonad';
import styles from './Table.styles';

export interface CellEditorProps
  extends AbstractContentEditorProps<contentTypes.CellData | contentTypes.CellHeader> {
  onShowSidebar: () => void;
}

export interface CellEditorState {

}

/**
 * The content editor for table cells.
 */
@injectSheet(styles)
export class CellEditor
    extends AbstractContentEditor<contentTypes.CellData | contentTypes.CellHeader,
    StyledComponentProps<CellEditorProps>, CellEditorState> {

  constructor(props) {
    super(props);
  }

  renderSidebar() {
    const { model, editMode } = this.props;
    const { align, colspan, rowspan } = model;

    return (
      <SidebarContent title="Table Cell">
        <SidebarGroup label="Alignment">
          <Select
            editMode={editMode}
            label=""
            value={align}
            onChange={this.onAlignmentChange.bind(this)}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </Select>
        </SidebarGroup>
        <SidebarGroup label="Column Span">
          <TextInput
            editMode={editMode}
            value={colspan}
            type="number"
            width="100%"
            label=""
            onEdit={this.onColSpanChange.bind(this)}
          />
        </SidebarGroup>
        <SidebarGroup label="Row Span">
          <TextInput
            editMode={editMode}
            value={rowspan}
            type="number"
            width="100%"
            label=""
            onEdit={this.onRowSpanChange.bind(this)}
          />
        </SidebarGroup>
      </SidebarContent>
    );
  }

  onAlignmentChange(align) {
    this.props.onEdit(this.props.model.with({ align }));
  }

  onRowSpanChange(rowspan) {
    this.props.onEdit(this.props.model.with({ rowspan }));
  }

  onColSpanChange(colspan) {
    this.props.onEdit(this.props.model.with({ colspan }));
  }

  renderToolbar() {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Table Cell" columns={8} highlightColor={CONTENT_COLORS.CellData}>
        <ToolbarButton onClick={() => onShowSidebar()} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-align-left"></i></div>
          <div>Alignment</div>
        </ToolbarButton>
        <ToolbarButton onClick={() => onShowSidebar()} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-th-list"></i></div>
          <div>Row/Col Span</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  onCellEdit(content, src) {
    const model = this.props.model.with({ content });
    this.props.onEdit(model, src);
  }

  renderMain() : JSX.Element {
    const { className, classes, model, parent, activeContentGuid } = this.props;

    const cellClass =
      activeContentGuid === model.guid
      ? classes.innerCellSelected : classes.innerCell;

    const bindProps = (element) => {

      if (element instanceof contentTypes.ContiguousText) {
        return [{ propertyName: 'hideBorder', value: true }];
      }
      return [];
    };

    return (
      <div className={classNames([cellClass, className])}
        onClick={() => this.props.onFocus(model, parent, Maybe.nothing())}>
        <ContentContainer
          {...this.props}
          topMargin="0px"
          hideSingleDecorator={true}
          bindProperties={bindProps}
          model={this.props.model.content}
          onEdit={this.onCellEdit.bind(this)}
        />
      </div>
    );
  }

}

