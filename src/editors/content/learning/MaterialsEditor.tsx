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
import { ContentElements } from 'data/content/common/elements';


import styles from './MaterialsEditor.styles';

export interface MaterialsEditorProps
  extends AbstractContentEditorProps<contentTypes.Materials> {
  onShowSidebar: () => void;

}

export interface MaterialsEditorState {

}

@injectSheet(styles)
export default class MaterialsEditor
    extends AbstractContentEditor<contentTypes.Materials,
    StyledComponentProps<MaterialsEditorProps>, MaterialsEditorState> {

  constructor(props) {
    super(props);
  }

  renderSidebar() {
    return (
      <SidebarContent title="Horizontal Layout" />
    );
  }

  renderToolbar() {
    return (
      <ToolbarGroup label="Horizontal Layout" highlightColor={CONTENT_COLORS.Materials}/>
    );
  }

  onEdit(content, src) {
    this.props.onEdit(this.props.model.with({ content }), src);
  }

  renderMain() : JSX.Element {

    const { model, classes, className } = this.props;

    const elements = new ContentElements().with({
      content: model.content,
    });

    return (
      <div className={classNames([classes.materials, className])}>
        <ContentContainer
          {...this.props}
          model={elements}
          classNames={classNames([classes.materialsContents, className])}
          onEdit={this.onEdit.bind(this)}
        />
      </div>
    );
  }

}
