import * as React from 'react';
import * as Immutable from 'immutable';
import { injectSheet, classNames, JSSProps } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import { Maybe } from 'tsmonad';
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
    const { className, classes, children, editMode, model, onEdit, context } = this.props;

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
    const { className, classes, children } = this.props;

    return (
      <div className={classNames([classes.entityRenderer, className])}>
        Cite
      </div>
    );
  }

}
