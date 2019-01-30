import * as React from 'react';
import { injectSheet, JSSProps, classNames } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps, RenderContext }
  from 'editors/content/common/AbstractContentEditor';
import ContiguousTextEditor from 'editors/content/learning/contiguoustext/ContiguousTextEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { ContiguousText } from 'data/content/learning/contiguous';
import BlockCodeToolbar from './BlockCodeToolbar.controller';
import { getEditorByContentType } from 'editors/content/container/registry';
import { styles } from './BlockCode.styles';

export interface BlockCodeEditorProps
  extends AbstractContentEditorProps<contentTypes.BlockCode> {
  onShowSidebar: () => void;
}

export interface BlockCodeEditorState {

}

@injectSheet(styles)
export default class BlockCodeEditor
  extends AbstractContentEditor
  <contentTypes.BlockCode, BlockCodeEditorProps & JSSProps, BlockCodeEditorState> {

  constructor(props) {
    super(props);

    this.onEditText = this.onEditText.bind(this);
    this.onFocusOverride = this.onFocusOverride.bind(this);
  }

  onEditText(text: ContiguousText, source) {
    const model = this.props.model.with({ text });
    this.props.onEdit(model, model);
  }

  onFocusOverride(model, parent, selection) {
    this.props.onFocus(this.props.model, this.props.parent, selection);
  }

  renderSidebar() {
    return <BlockCodeToolbar {...this.props} renderContext={RenderContext.Sidebar} />;
  }

  renderToolbar() {
    return <BlockCodeToolbar {...this.props} renderContext={RenderContext.Toolbar} />;
  }

  renderMain() {
    const { classes } = this.props;

    return (
      <div className={classNames(['codeEditor', classes.codeEditor])}>
        <ContiguousTextEditor
          {...this.props}
          onInsertParsedContent={() => { }}
          onFocus={this.onFocusOverride}
          model={this.props.model.text}
          onEdit={this.onEditText}
        />
      </div>
    );
  }
}
