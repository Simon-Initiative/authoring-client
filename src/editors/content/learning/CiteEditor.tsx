import * as React from 'react';
import { injectSheet, classNames, JSSProps } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { TextInput } from '../common/controls';
import { Label } from '../common/Sidebar';

import styles from './Entity.style';

export interface CiteEditorProps
  extends AbstractContentEditorProps<contentTypes.Cite> {
  className?: string;
}

export interface CiteEditorState {

}

/**
 * React Component
 */
@injectSheet(styles)
export class CiteEditor
    extends AbstractContentEditor
    <contentTypes.Cite, CiteEditorProps & JSSProps, CiteEditorState> {

  constructor(props) {
    super(props);
  }

  renderMain() {
    return null;
  }

  renderSidebar() {
    const { className, classes, editMode, model, onEdit } = this.props;

    return (
      <div className={classNames([classes.entityRenderer, className])}>

        <Label>Entry</Label>
        <TextInput
          editMode={editMode}
          width="100%"
          label=""
          value={model.entry}
          type="string"
          onEdit={entry => onEdit(model.with({ entry }))}
          />
      </div>
    );
  }

  renderToolbar() {
    const { className, classes } = this.props;

    return (
      <div className={classNames([classes.entityRenderer, className])}>
        Cite
      </div>
    );
  }

}
