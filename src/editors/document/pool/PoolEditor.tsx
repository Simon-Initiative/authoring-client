import * as React from 'react';
import * as Immutable from 'immutable';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';
import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import { UndoRedoToolbar } from '../common/UndoRedoToolbar';
import { PoolEditor as PoolContentEditor } from '../../content/selection/PoolEditor';
import { TitleContentEditor } from '../../content/title/TitleContentEditor';

import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

interface PoolEditor {
  
}

export interface PoolEditorProps extends AbstractEditorProps<models.PoolModel> {
  
}

interface PoolEditorState extends AbstractEditorState {
  
}

@DragDropContext(HTML5Backend)
class PoolEditor extends AbstractEditor<models.PoolModel,
  PoolEditorProps, 
  PoolEditorState>  {

  constructor(props) {
    super(props, {});

    this.onEdit = this.onEdit.bind(this);
    this.onAddQuestion = this.onAddQuestion.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);
  }
    
  onEdit(pool: contentTypes.Pool) {
    this.handleEdit(this.props.model.with({ pool }));
  }

  onAddQuestion() {
    const q = new contentTypes.Question();
    const pool = this.props.model.pool.with( 
      { questions: this.props.model.pool.questions.set(q.guid, q) });
    const updated = this.props.model.with({ pool });
    this.handleEdit(updated);
  }

  onTitleEdit(title) {
    const pool = this.props.model.pool.with({ title });
    const updated = this.props.model.with({ pool });
    this.handleEdit(updated);
  }

  render() {
    return (
      <div>
        <UndoRedoToolbar 
            undoEnabled={this.state.undoStackSize > 0}
            redoEnabled={this.state.redoStackSize > 0}
            onUndo={this.undo.bind(this)} onRedo={this.redo.bind(this)}/>
        <TitleContentEditor 
            services={this.props.services}
            context={this.props.context}
            editMode={this.props.editMode}
            model={this.props.model.pool.title}
            onEdit={this.onTitleEdit} 
            />
        <div>
          <button type="button" className="btn btn-secondary" 
            onClick={this.onAddQuestion}>Add Question</button>
        </div>
        <PoolContentEditor
          context={this.props.context}
          services={this.props.services}
          editMode={this.props.editMode}
          onRemove={() => null}
          model={this.props.model.pool}
          onEdit={this.onEdit}/>
        
      </div>
    );    
  }

}

export default PoolEditor;
