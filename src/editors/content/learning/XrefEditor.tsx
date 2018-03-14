import * as React from 'react';
import { injectSheet, classNames, JSSProps } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';

import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { LinkTarget } from 'data/content/learning/common';
import { Select, TextInput } from '../common/controls';
import { Label, VerticalSpacer } from '../common/Sidebar';

import styles from './Entity.style';
import { LegacyTypes } from 'data/types';

export interface XrefEditorProps
  extends AbstractContentEditorProps<contentTypes.Xref> {
  className?: string;
}

export interface XrefEditorState {

}

/**
 * React Component
 */
@injectSheet(styles)
export class XrefEditor
    extends AbstractContentEditor
    <contentTypes.Xref, XrefEditorProps & JSSProps, XrefEditorState> {

  constructor(props) {
    super(props);
  }

  renderMain() {
    return null;
  }

  renderSidebar() {
    const { className, classes, editMode, model, onEdit, context } = this.props;

    const pages = context.courseModel.resources
      .toArray()
      .filter(resource => resource.type === LegacyTypes.workbook_page)
      .map(r => <option key={r.id} value={r.id}>{r.title}</option>);

    return (
      <div className={classNames([classes.entityRenderer, className])}>

        <Label>Page to link to</Label>
        <Select
          editMode={this.props.editMode}
          label=""
          value={model.page}
          onChange={page => onEdit(model.with({ page }))}>
          {pages}
        </Select>

        <VerticalSpacer/>

        <Label>Element to link to</Label>
        <TextInput
          editMode={this.props.editMode}
          label=""
          width="100%"
          type="string"
          value={model.idref}
          onEdit={idref => onEdit(model.with({ idref }))}/>

        <VerticalSpacer/>

        <Label>Target</Label>
        <Select
          editMode={editMode}
          value={model.target}
          onChange={v =>
            onEdit(model.with({ target: v === 'self' ? LinkTarget.Self : LinkTarget.New }))}>
          <option value={LinkTarget.Self}>Open in this window</option>
          <option value={LinkTarget.New}>Open in new window</option>
        </Select>
      </div>
    );
  }

  renderToolbar() {
    const { className, classes } = this.props;

    return (
      <div className={classNames([classes.entityRenderer, className])}>
        Cross-reference
      </div>
    );
  }

}
