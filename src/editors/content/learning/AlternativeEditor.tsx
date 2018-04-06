import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, classNames } from 'styles/jss';
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
import { Select, TextInput } from '../common/controls';
import { Maybe } from 'tsmonad';
import styles from './Alternatives.styles';

export interface AlternativeEditorProps
  extends AbstractContentEditorProps<contentTypes.Alternative> {
  onShowSidebar: () => void;
}

export interface AlternativeEditorState {

}

/**
 * The content editor for table cells.
 */
@injectSheet(styles)
export default class AlternativeEditor
    extends AbstractContentEditor<contentTypes.Alternative,
    StyledComponentProps<AlternativeEditorProps>, AlternativeEditorState> {

  constructor(props) {
    super(props);
  }

  onCellEdit(content, src) {
    const model = this.props.model.with({ content });
    this.props.onEdit(model, src);
  }


  render() : JSX.Element {

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
      <div style={ { height: '100%' } }
        onFocus={e => this.handleOnFocus(e)} onClick={e => this.handleOnClick(e)}>
        {this.renderMain()}
      </div>
    );

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

  renderToolbar() {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Table Cell" columns={4} highlightColor={CONTENT_COLORS.CellData}>
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

  renderMain() : JSX.Element {
    const { className, classes, model, parent, activeContentGuid } = this.props;

    return (
      <div className={classNames([cellClass, className])}
        onClick={() => this.props.onFocus(model, parent, Maybe.nothing())}>
        <ContentContainer
          {...this.props}
          model={this.props.model.content}
          onEdit={this.onCellEdit.bind(this)}
        />
      </div>
    );
  }

}
