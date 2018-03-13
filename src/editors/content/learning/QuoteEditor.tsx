import * as React from 'react';
import { injectSheet, classNames, JSSProps } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import { Maybe } from 'tsmonad';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { TextInput } from '../common/controls';
import { Label } from '../common/Sidebar';

import styles from './Entity.style';

export interface QuoteEditorProps
  extends AbstractContentEditorProps<contentTypes.Quote> {
  className?: string;
}

export interface QuoteEditorState {

}

/**
 * React Component
 */
@injectSheet(styles)
export class QuoteEditor
    extends AbstractContentEditor
    <contentTypes.Quote, QuoteEditorProps & JSSProps, QuoteEditorState> {

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
          value={model.entry.caseOf({ just: n => n, nothing: () => '' })}
          type="string"
          onEdit={e => onEdit(model.with({ entry: Maybe.just(e) }))}
          />
      </div>
    );
  }

  renderToolbar() {
    const { className, classes } = this.props;

    return (
      <div className={classNames([classes.entityRenderer, className])}>
        Quote
      </div>
    );
  }

}
