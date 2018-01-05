import * as React from 'react';

export interface ToolbarProps {
  onAddQuestion: () => void;
  onAddContent: () => void;
  onUndo: () => void;
  onRedo: () => void;
  undoEnabled: boolean;
  redoEnabled: boolean;
}

export class Toolbar extends React.Component<ToolbarProps, {}> {

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
        <i className={`'icon icon-${icon}`} />
      </button>
    );
  }

  render() {
    return (
      <div className="toolbar">
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

export default Toolbar;


