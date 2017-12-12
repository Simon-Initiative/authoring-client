import * as React from 'react';
import { AppServices } from '../../common/AppServices';
import {
  toggleInlineStyle,
  toggleBlockType,
  insertInlineEntity,
  AuthoringActionsHandler,
} from '../../../actions/authoring';
import { EntityTypes } from '../../../data/content/html/common';

import './UndoRedoToolbar.scss';

export interface UndoRedoToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  undoEnabled: boolean;
  redoEnabled: boolean;
}

export class UndoRedoToolbar extends React.Component<UndoRedoToolbarProps, {}> {

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.undoEnabled !== this.props.undoEnabled ||
      nextProps.redoEnabled !== this.props.redoEnabled;
  }

  button(icon, handler, enabled) {
    return (
      <button
        disabled={!enabled}
        onClick={handler}
        type="button"
        className="btn">
        <i className={`icon icon-${icon}`}></i>
      </button>
    );
  }

  render() {
    return (
      <div className="undo-redo-toolbar">
        <div className="flex-spacer"/>
        <div
          className="btn-group btn-group-sm asxToolbar"
          role="group"
          aria-label="Assessment Toolbar">

          {this.button('undo', this.props.onUndo, this.props.undoEnabled)}
          {this.button('repeat', this.props.onRedo, this.props.redoEnabled)}

        </div>
      </div>
    );
  }

}

export default UndoRedoToolbar;


