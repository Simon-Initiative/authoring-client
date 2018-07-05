import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';

import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames } from 'styles/jss';

import { styles } from './VariablesEditor.styles';

export interface VariablesEditorProps extends AbstractContentEditorProps<Variables> {

}

export interface VariablesEditorState {

}

type Variables = Immutable.OrderedMap<string, contentTypes.Variable>;

/**
 * VariablesEditor React Component
 */
@injectSheet(styles)
export class VariablesEditor
  extends AbstractContentEditor<Variables,
  StyledComponentProps<VariablesEditorProps>, VariablesEditorState> {


  constructor(props) {
    super(props);
  }

  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }

  renderMain() {
    const { classes, className } = this.props;
    return (
      <div className={classNames([classes.VariablesEditor, className])}>

      </div>
    );
  }
}
