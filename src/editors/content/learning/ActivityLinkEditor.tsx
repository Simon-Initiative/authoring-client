import * as React from 'react';
import { injectSheet, classNames, JSSProps } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';

import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { LinkTarget, PurposeTypes } from 'data/content/learning/common';
import { Select } from '../common/controls';
import { Label, VerticalSpacer, Header } from '../common/Sidebar';

import styles from './Entity.style';
import { LegacyTypes } from 'data/types';

export interface ActivityLinkEditorProps
  extends AbstractContentEditorProps<contentTypes.ActivityLink> {
  className?: string;
}

export interface ActivityLinkEditorState {

}

/**
 * React Component
 */
@injectSheet(styles)
export class ActivityLinkEditor
    extends AbstractContentEditor
    <contentTypes.ActivityLink, ActivityLinkEditorProps & JSSProps, ActivityLinkEditorState> {

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
    const { className, classes, editMode, model, onEdit, context } = this.props;

    const highStakesOptions = context.courseModel.resources
      .toArray()
      .filter(resource => resource.type === LegacyTypes.assessment2)
      .map(r => <option key={r.id} value={r.id}>{r.title}</option>);

    return (
      <div className={classNames([classes.entityRenderer, className])}>

        <Header>Activity Link</Header>

        <Label>Activity</Label>
        <Select
          editMode={this.props.editMode}
          label=""
          value={model.idref}
          onChange={idref => onEdit(model.with({ idref }))}>
          {highStakesOptions}
        </Select>

        <VerticalSpacer/>

        <Label>Purpose</Label>
        <Select
          editMode={this.props.editMode}
          label=""
          value={model.purpose}
          onChange={purpose => onEdit(model.with({ purpose }))}>
          {PurposeTypes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </Select>

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
        Activity Link
      </div>
    );
  }

}
