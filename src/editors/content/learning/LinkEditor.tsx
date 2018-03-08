import * as React from 'react';
import * as Immutable from 'immutable';
import { injectSheet, classNames, JSSProps } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';

import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { LinkTarget } from 'data/content/learning/common';
import { Checkbox, Select, TextInput } from '../common/controls';
import { Label, VerticalSpacer, Header } from '../common/Sidebar';

import styles from './Entity.style';


export interface LinkEditorProps extends AbstractContentEditorProps<contentTypes.Link> {
  className?: string;
}

export interface LinkEditorState {

}

/**
 * React Component
 */
@injectSheet(styles)
export class LinkEditor
    extends AbstractContentEditor<contentTypes.Link, LinkEditorProps & JSSProps, LinkEditorState> {

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.model !== nextProps.model) {
      return true;
    }
    return false;
  }

  renderMain() {
    return null;
  }

  renderSidebar() {
    const { className, classes, children, editMode, model, onEdit } = this.props;

    return (
      <div className={classNames([classes.entityRenderer, className])}>

        <Header>External Link</Header>

        <Label>URL</Label>
        <TextInput
          editMode={editMode}
          width="100%"
          label=""
          value={model.href}
          type="string"
          onEdit={href => onEdit(model.with({ href }))}
          />

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
    const { className, classes, children } = this.props;

    return (
      <div className={classNames([classes.entityRenderer, className])}>
        Link
      </div>
    );
  }

}
