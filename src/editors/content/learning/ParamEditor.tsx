import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { TextInput } from '../common/TextInput';
import { ParamContent } from 'data/content/learning/param';
import { styles } from './Param.styles';

export interface ParamEditorProps
  extends AbstractContentEditorProps<contentTypes.Param> {
  onShowSidebar: () => void;
}

export interface ParamEditorState {

}

/**
 * The content editor for list items.
 */
@injectSheet(styles)
export default class ParamEditor
  extends AbstractContentEditor<contentTypes.Param,
  StyledComponentProps<ParamEditorProps>, ParamEditorState> {

  constructor(props) {
    super(props);
  }

  onAddText() {
    const c = new contentTypes.ParamText();
    const u = this.props.model.content.set(c.guid, c);
    const m = this.props.model.with({ content: u });
    this.props.onEdit(m, m);
  }

  onAddPath() {
    const c = new contentTypes.WbPath().with({ href: '../default' });
    const u = this.props.model.content.set(c.guid, c);
    const m = this.props.model.with({ content: u });
    this.props.onEdit(m, m);
  }

  onAddPrefLabel() {
    const c = new contentTypes.PrefLabel().with({ preference: 'default' });
    const u = this.props.model.content.set(c.guid, c);
    const m = this.props.model.with({ content: u });
    this.props.onEdit(m, m);
  }

  onAddPrefValue() {
    const c = new contentTypes.PrefValue().with({ preference: 'default' });
    const u = this.props.model.content.set(c.guid, c);
    const m = this.props.model.with({ content: u });
    this.props.onEdit(m, m);
  }

  renderSidebar() {
    return (
      <SidebarContent title="Parameter">
        <SidebarGroup label="Content">
          <ToolbarButton onClick={this.onAddText.bind(this)} size={ToolbarButtonSize.Wide}>
            <span>Add Text</span>
          </ToolbarButton>
          <ToolbarButton onClick={this.onAddPath.bind(this)} size={ToolbarButtonSize.Wide}>
            <span>Add Path</span>
          </ToolbarButton>
          <ToolbarButton onClick={this.onAddPrefLabel.bind(this)} size={ToolbarButtonSize.Wide}>
            <span>Add Label</span>
          </ToolbarButton>
          <ToolbarButton onClick={this.onAddPrefValue.bind(this)} size={ToolbarButtonSize.Wide}>
            <span>Add Value</span>
          </ToolbarButton>
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar() {
    return <ToolbarGroup label="Parameter" highlightColor={CONTENT_COLORS.Param} />;
  }

  onEditName(name) {
    const model = this.props.model.with({ name });
    this.props.onEdit(model, model);
  }

  onRemoveContent(content) {
    const updated = this.props.model.content.delete(content.guid);
    const model = this.props.model.with({ content: updated });
    this.props.onEdit(model, model);
  }

  renderContent(content: ParamContent, totalCount: number) {

    const { classes, editMode } = this.props;

    const style: any = {
      position: 'absolute',
      right: -25,
      top: 0,
    };
    const isRemoveable = totalCount > 1;
    const remove = isRemoveable
      ? <button
        style={style}
        className="btn btn-sm remove-btn"
        disabled={!editMode}
        onClick={this.onRemoveContent.bind(this, content)}>
        <i className="fas fa-times"></i>
      </button>
      : null;

    if (content.contentType === 'WbPath') {
      return (
        <div className={classNames([classes.paramText])}>

          <TextInput width="100%"
            label=""
            editMode={this.props.editMode}
            value={content.href}
            type="text"
            onEdit={this.onEditContent.bind(this, content)} />
          {remove}
        </div>
      );
    }
    if (content.contentType === 'PrefLabel') {
      return (
        <div className={classNames([classes.paramText])}>

          <TextInput width="100%"
            label=""
            editMode={this.props.editMode}
            value={content.preference}
            type="text"
            onEdit={this.onEditContent.bind(this, content)} />
          {remove}
        </div>
      );
    }
    if (content.contentType === 'PrefValue') {
      return (
        <div className={classNames([classes.paramText])}>

          <TextInput width="100%"
            label=""
            editMode={this.props.editMode}
            value={content.preference}
            type="text"
            onEdit={this.onEditContent.bind(this, content)} />
          {remove}
        </div>
      );
    }
    return (
      <div className={classNames([classes.paramText])}>

        <TextInput width="100%"
          label=""
          editMode={this.props.editMode}
          value={content.text}
          type="text"
          onEdit={this.onEditContent.bind(this, content)} />
        {remove}
      </div>
    );
  }

  onEditContent(content: ParamContent, value: string) {

    let updated;

    if (content.contentType === 'WbPath') {
      updated = content.with({ href: value });
    } else if (content.contentType === 'ParamText') {
      updated = content.with({ text: value });
    } else {
      updated = content.with({ preference: value });
    }

    const updatedContent = this.props.model.content.set(updated.guid, updated);
    const model = this.props.model.with({ content: updatedContent });
    this.props.onEdit(model, model);
  }

  renderMain(): JSX.Element {

    const { className, classes } = this.props;

    const content = this.props.model.content.toArray()
      .map(c => this.renderContent(c, this.props.model.content.size));

    return (
      <div className={classNames([classes.param, className])}>
        <div className={classNames([classes.paramName, className])}>
          <TextInput width="150px"
            label=""
            editMode={this.props.editMode}
            value={this.props.model.name}
            type="text"
            onEdit={this.onEditName.bind(this)} />
        </div>
        <div className={classNames([classes.paramContent, className])}>
          {content}
        </div>
      </div>
    );
  }

}

