import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { withStyles, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps, RenderContext,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { Select, TextInput } from 'editors/content/common/controls';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { Maybe } from 'tsmonad';

import { styles } from 'editors/content/learning/table/Table.styles';

export interface CellEditorProps
  extends AbstractContentEditorProps<contentTypes.CellData | contentTypes.CellHeader> {
  onShowSidebar: () => void;
}

export interface CellEditorState {
  activeChildGuid: string;
}

/**
 * The content editor for table cells.
 */
class CellEditor
  extends AbstractContentEditor<contentTypes.CellData | contentTypes.CellHeader,
  StyledComponentProps<CellEditorProps, typeof styles>, CellEditorState> {

  constructor(props) {
    super(props);

    this.state = {
      activeChildGuid: null,
    };

    this.onFocus = this.onFocus.bind(this);
  }

  componentWillReceiveProps(nextProps: CellEditorProps) {
    const { activeChildGuid } = this.state;

    if (nextProps.activeContentGuid !== activeChildGuid) {
      this.setState({
        activeChildGuid: null,
      });
    }
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

  onCellEdit(content, src) {
    const model = this.props.model.with({ content });
    this.props.onEdit(model, src);
  }

  onFocus(model: Object, parent, textSelection) {
    const { onFocus } = this.props;

    this.setState(
      { activeChildGuid: (model as any).guid },
      () => onFocus(model, parent, textSelection),
    );
  }

  render(): JSX.Element {

    const renderContext = this.props.renderContext === undefined
      ? RenderContext.MainEditor
      : this.props.renderContext;

    if (renderContext === RenderContext.Toolbar) {
      return this.renderToolbar();
    }
    if (renderContext === RenderContext.Sidebar) {
      return this.renderSidebar();
    }
    return (
      <div style={{ height: '100%' }}
        onFocus={e => this.handleOnFocus(e)} onClick={e => this.handleOnClick(e)}>
        {this.renderMain()}
      </div>
    );

  }

  onToggleCellHeader() {
    const { model, onEdit } = this.props;

    const toggled = (model.contentType === 'CellData'
      ? new contentTypes.CellHeader()
      : new contentTypes.CellData()).with({
        align: model.align,
        colspan: model.colspan,
        rowspan: model.rowspan,
        content: model.content,
        guid: model.guid,
      });

    onEdit(toggled, toggled);
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
        <SidebarGroup label="Header">
          <ToggleSwitch
            checked={this.props.model.contentType === 'CellHeader'}
            onClick={() =>
              this.onToggleCellHeader()}
            label="Display cell as a header" />
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar() {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Table Cell" columns={5.3} highlightColor={CONTENT_COLORS.CellData}>
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

  renderMain(): JSX.Element {
    const { className, classes, model, parent, activeContentGuid } = this.props;
    const { activeChildGuid } = this.state;

    const cellClass =
      activeContentGuid === model.guid
        ? classes.innerCellSelected : classes.innerCell;

    const bindProps = (element) => {

      if (element instanceof contentTypes.ContiguousText) {
        return [{ propertyName: 'hideBorder', value: true }];
      }
      return [];
    };

    const hideDecorator = model.content.content.size === 0 ||
      (model.content.content.size === 1
        && model.content.content.first().contentType === 'ContiguousText');

    return (
      <div className={classNames([
        cellClass, className, activeChildGuid && classes.innerCellChildSelected])}
        onClick={() => this.props.onFocus(model, parent, Maybe.nothing())}>
        <div>
          <ContentContainer
            {...this.props}
            onFocus={this.onFocus}
            hideSingleDecorator={hideDecorator}
            bindProperties={bindProps}
            model={this.props.model.content}
            onEdit={this.onCellEdit.bind(this)}
          />
        </div>
        <i className={classNames(['far fa-caret-square-down', classes.selectCell])} />
      </div>
    );
  }

}

const StyledCellEditor = withStyles<CellEditorProps>(styles)(CellEditor);
export default StyledCellEditor;
