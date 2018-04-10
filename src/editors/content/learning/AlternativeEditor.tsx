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
import { TextInput } from '../common/controls';
import { Maybe } from 'tsmonad';
import { styles } from './Alternatives.styles';

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

  onAltEdit(content, src) {
    const model = this.props.model.with({ content });
    this.props.onEdit(model, src);
  }

  onValueEdit(value: string) {
    const spacesStripped = value.replace(' ', '');
    const model = this.props.model.with({ value: spacesStripped });
    this.props.onEdit(model, model);
  }

  renderSidebar() {
    const { model, editMode } = this.props;

    return (
      <SidebarContent title={model.value}>
        <SidebarGroup label="Label">
          <TextInput
            editMode={editMode}
            value={model.value}
            type="text"
            width="100%"
            label=""
            onEdit={this.onValueEdit.bind(this)}
          />
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar() {
    const { onShowSidebar, model } = this.props;

    return (
      <ToolbarGroup label={model.value} columns={4} highlightColor={CONTENT_COLORS.CellData}>
        <ToolbarButton onClick={() => onShowSidebar()} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-align-left"></i></div>
          <div>Key</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  renderMain() : JSX.Element {
    const { className, classes, model, parent } = this.props;

    return (
      <div className={classNames([classes.alternative, className])}
        onClick={() => this.props.onFocus(model, parent, Maybe.nothing())}>
        <ContentContainer
          {...this.props}
          model={this.props.model.content}
          onEdit={this.onAltEdit.bind(this)}
        />
      </div>
    );
  }

}
