import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer, Layout } from 'editors/content/container/ContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';
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

  onInsert(item) {
    const { model, onEdit } = this.props;

    const innerContent = this.props.model.content.content.set(item.guid, item);
    const outerContent = this.props.model.content.with({ content: innerContent });

    const updatedModel = model.with({ content: outerContent });

    onEdit(updatedModel, item);
  }

  renderEmptyInactive() {
    const { classes, className } = this.props;

    return (
      <div className={classNames([classes.emptyMaterial, className])}>
        <div>Click to select</div>
      </div>
    );
  }

  renderEmptyActive() {

    const { classes, className } = this.props;

    return (
      <div className={classNames([classes.emptyMaterialActive, className])}>
        <div>Add content using toolbar above</div>
      </div>
    );
  }

  renderMain() : JSX.Element {

    const { model, classes, className, activeContentGuid } = this.props;

    if (model.content.content.size === 0) {
      if (activeContentGuid === model.guid) {
        return this.renderEmptyActive();
      }
      return this.renderEmptyInactive();
    }

    return (
      <div className={classNames([classes.material, className])}>
        <ContentContainer
          {...this.props}
          layout={Layout.Vertical}
          model={model.content}
          onEdit={this.onEdit.bind(this)}
        />
      </div>
    );
  }

}
