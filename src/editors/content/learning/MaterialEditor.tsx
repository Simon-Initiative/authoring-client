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

export interface MaterialEditorProps
  extends AbstractContentEditorProps<contentTypes.Material> {
  onShowSidebar: () => void;

}

export interface MaterialEditorState {

}

@injectSheet(styles)
export default class MaterialEditor
    extends AbstractContentEditor<contentTypes.Material,
    StyledComponentProps<MaterialEditorProps>, MaterialEditorState> {

  constructor(props) {
    super(props);
  }

  renderSidebar() {
    return (
      <SidebarContent title="Container" />
    );
  }

  renderToolbar() {
    return (
      <ToolbarGroup label="Container" highlightColor={CONTENT_COLORS.Materials}/>
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
      <div className={classNames([classes.Material, className])}>
        <ContentContainer
          {...this.props}
          model={elements}
          classNames={classNames([classes.MaterialContents, className])}
          onEdit={this.onEdit.bind(this)}
        />
      </div>
    );
  }

}
