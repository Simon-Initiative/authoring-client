import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';

import { styles } from './Composite.styles';

export interface InstructionsEditorProps
  extends AbstractContentEditorProps<contentTypes.Instructions> {
  onShowSidebar: () => void;

}

export interface InstructionsEditorState {

}

@injectSheet(styles)
export default class InstructionsEditor
    extends AbstractContentEditor<contentTypes.Instructions,
    StyledComponentProps<InstructionsEditorProps>, InstructionsEditorState> {

  constructor(props) {
    super(props);
  }

  renderSidebar() {
    return (
      <SidebarContent title="Instructions" />
    );
  }

  renderToolbar() {
    return (
      <ToolbarGroup label="Instructions" highlightColor={CONTENT_COLORS.Instructions}/>
    );
  }

  onInstructionsEdit(content, src) {
    this.props.onEdit(this.props.model.with({ content }), src);
  }

  renderMain() : JSX.Element {

    const { model, classes, className } = this.props;

    return (
      <div className={classNames([classes.instructions, className])}>
        <div className={classNames([classes.instructionsLabel, className])}>Instructions</div>
        <div className={classNames([classes.instructionsContent, className])}>
          <ContentContainer
          {...this.props}
          model={model.content}
          onEdit={this.onInstructionsEdit.bind(this)}
          />
        </div>
      </div>
    );
  }

}
