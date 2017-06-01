import * as React from 'react';
import * as Immutable from 'immutable';

import * as persistence from '../../../data/persistence';
import * as models from '../../../data/models';
import * as types from '../../../data/types';
import { AppServices } from '../../common/AppServices';
import { AppContext } from '../../common/AppContext';

export interface AbstractEditor<ModelType, P extends AbstractEditorProps<ModelType>, S extends AbstractEditorState> {
  
  undoStack: Immutable.Stack<ModelType>;
  redoStack: Immutable.Stack<ModelType>;
}

export interface AbstractEditorProps<ModelType> {

  // The initial document model passed into the editor.
  model: ModelType;

  // Handles edits to the model
  onEdit: (model: ModelType) => void;  

  // Handles edits to the model driven by undo/redo
  onUndoRedoEdit: (model: ModelType) => void;  

  services: AppServices;

  context: AppContext;
  
  editMode: boolean;

}

export interface AbstractEditorState {
  
  undoStackSize: number;

  redoStackSize: number;
}

/**
 * An abstract editor that provides the basis for reusable 
 * persistence and undo/redo. 
 */
export abstract class AbstractEditor<ModelType, 
  P extends AbstractEditorProps<ModelType>, S extends AbstractEditorState>
  extends React.Component<P, S> {

    constructor(props: P, childState: Object) {
      super(props);

      this.undoStack = Immutable.Stack<ModelType>().push(props.model);
      this.redoStack = Immutable.Stack<ModelType>();

      this.state = (Object.assign({}, { 
        undoStackSize: 0, 
        redoStackSize: 0
      }, childState) as S);
    }

    undo() {
      const currentModel = this.undoStack.peek();
      this.redoStack = this.redoStack.push(currentModel);

      this.undoStack = this.undoStack.pop();

      let model = this.undoStack.peek();

      this.setState({ 
        undoStackSize: this.undoStack.size - 1, 
        redoStackSize: this.redoStack.size
      }, () => this.props.onUndoRedoEdit(model));
     
    }

    handleEdit(model: ModelType) {
      this.undoStack = this.undoStack.push(model);
      this.redoStack = Immutable.Stack<ModelType>();

      this.setState({ 
        undoStackSize: this.undoStack.size - 1, 
        redoStackSize: this.redoStack.size
      }, () => this.props.onEdit(model));

    }

    redo() {
      const model = this.redoStack.peek();
      this.undoStack = this.undoStack.push(model);
      this.redoStack = this.redoStack.pop();

      this.setState({ 
        undoStackSize: this.undoStack.size - 1, 
        redoStackSize: this.redoStack.size
      }, () => this.props.onUndoRedoEdit(model));
    }


}

