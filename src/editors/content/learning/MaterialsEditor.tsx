import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import MaterialEditor from './MaterialEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS, getContentIcon, insertableContentTypes } from
'editors/content/utils/content';
import { MATERIAL_ELEMENTS } from 'data/content/common/elements';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';

import { styles } from './MaterialsEditor.styles';

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

  addColumn() {
    const material = new contentTypes.Material();

    this.props.onEdit(
      this.props.model.with(
        { content: this.props.model.content.set(material.guid, material) }),
      material);
  }

  renderToolbar() {
    return (
      <ToolbarGroup label="Horizontal Layout" columns={3} highlightColor={CONTENT_COLORS.Materials}>
        <ToolbarButton onClick={this.addColumn.bind(this)} size={ToolbarButtonSize.Large}>
          <div>{getContentIcon(insertableContentTypes.Materials)}</div>
          <div>Add Column</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  onMaterialEdit(m, src) {
    return this.props.onEdit(
      this.props.model.with({ content: this.props.model.content.set(m.guid, m) }),
      src);
  }

  onRemove(m) {
    this.props.onEdit(
      this.props.model.with(
        { content: this.props.model.content.delete(m.guid) }),
      null);
  }

  onInsert(material: contentTypes.Material, item) {
    const updatedContent = material.content.content.set(item.guid, item);
    const updatedElements = material.content.with({ content: updatedContent });
    const updatedMaterial = material.with({ content: updatedElements });

    this.props.onEdit(
      this.props.model.with(
        { content: this.props.model.content.set(updatedMaterial.guid, updatedMaterial) }),
      item);
  }

  renderMain(): JSX.Element {

    const { model, classes, className } = this.props;

    const count = model.content.size;
    const width = Math.floor(100 / count) + '%';

    const editors = model.content.toArray().map((material) => {

      const substituteParent = {
        supportedElements: Immutable.List<string>(MATERIAL_ELEMENTS),
        onAddNew: e => this.onInsert(material, e),
        onEdit: (e, s) => {
          const updatedContent = material.content.content.set(s.guid, s);
          const updatedElements = material.content.with({ content: updatedContent });
          const updatedMaterial = material.with({ content: updatedElements });

          this.onMaterialEdit(updatedMaterial, s);
        },
        onRemove: e => this.onRemove(e),
        onPaste: (e) => { },
        onDuplicate: (e) => { },
        onMoveUp: (e) => { },
        onMoveDown: (e) => { },
        props: this.props,
      };

      return (
        <div key={material.guid} style={{ width }}
        className={classNames([classes.materialsContents])}>
          <MaterialEditor
            {...this.props}
            model={material}
            parent={substituteParent}
            onEdit={this.onMaterialEdit.bind(this)}
          />
        </div>
      );
    });

    return (
      <div className={classNames([classes.materials, className])}>
        {editors}
      </div>
    );
  }

}
