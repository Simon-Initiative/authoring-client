import * as React from 'react';
import { injectSheet, classNames, JSSProps } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';

import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { MathEditor as SourceBasedMathEditor } from 'utils/math/MathEditor';
import { Label } from '../common/Sidebar';

import styles from './Entity.style';

export interface MathEditorProps
  extends AbstractContentEditorProps<contentTypes.Math> {
  className?: string;
}

export interface MathEditorState {

}

/**
 * React Component
 */
@injectSheet(styles)
export class MathEditor
    extends AbstractContentEditor
    <contentTypes.Math, MathEditorProps & JSSProps, MathEditorState> {

  constructor(props) {
    super(props);
  }

  renderMain() {
    return null;
  }

  renderSidebar() {
    const { className, classes, model, onEdit, editMode } = this.props;

    return (
      <div className={classNames([classes.entityRenderer, className])}>

        <Label>Math Editor</Label>
        <SourceBasedMathEditor
          content={model.data}
          editMode={editMode}
          onChange={(data) => {
            onEdit(model.with({ data }));
          }}
          />
      </div>
    );
  }

  renderToolbar() {
    const { className, classes } = this.props;

    return (
      <div className={classNames([classes.entityRenderer, className])}>
        Math
      </div>
    );
  }

}
