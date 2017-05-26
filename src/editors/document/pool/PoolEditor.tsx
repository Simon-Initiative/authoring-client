import * as React from 'react';
import * as Immutable from 'immutable';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';
import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import { UndoRedoToolbar } from '../common/UndoRedoToolbar';
import { PoolEditor as PoolContentEditor } from '../../content/selection/PoolEditor';

interface PoolEditor {
  
}

export interface PoolEditorProps extends AbstractEditorProps<models.PoolModel> {
  
}

interface PoolEditorState extends AbstractEditorState {
  
}

class PoolEditor extends AbstractEditor<models.PoolModel,
  PoolEditorProps, 
  PoolEditorState>  {

  constructor(props) {
    super(props, {});

    this.onEdit = this.onEdit.bind(this);
  }
    
  onEdit(pool: contentTypes.Pool) {
    this.handleEdit(this.props.model.with({ pool }));
  }

  render() {
    return (
      <div>
        <UndoRedoToolbar 
            undoEnabled={this.state.undoStackSize > 0}
            redoEnabled={this.state.redoStackSize > 0}
            onUndo={this.undo.bind(this)} onRedo={this.redo.bind(this)}/>
        <PoolContentEditor
          context={this.props.context}
          services={this.props.services}
          editMode={this.props.editMode}
          onRemove={() => null}
          model={this.props.model.pool}
          onEdit={this.onEdit}
        />
      </div>
    );    
  }

}

export default PoolEditor;
