import * as React from 'react';
import * as Immutable from 'immutable';
import { AppServices } from '../../common/AppServices';
import { AppContext } from '../../common/AppContext';
import { handleKey, unhandleKey } from './keyhandlers';
import { Maybe } from 'tsmonad';


export interface AbstractEditor<ModelType, P extends AbstractEditorProps<ModelType>,
  S extends AbstractEditorState> {
  undoStack: Immutable.Stack<ModelType>;
  redoStack: Immutable.Stack<ModelType>;
}

export interface AbstractEditorProps<ModelType> {
  // The initial document model passed into the editor.
  model: ModelType;

  // Handles edits to the model
  onEdit: (model: ModelType) => void;

  services: AppServices;

  context: AppContext;

  editMode: boolean;

  dispatch: any;

  expanded: Maybe<Immutable.Set<string>>;
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

    this.state = (
      Object.assign(
        {},
        {
          undoStackSize: 0,
          redoStackSize: 0,
        },
        childState,
      ) as S
    );
  }

  componentDidMount() {
    handleKey(
      '⌘+z, ctrl+z',
      () => this.undoStack.size > 1,
      this.undo.bind(this));
    handleKey(
      '⌘+y, ctrl+y',
      () => this.redoStack.size > 0,
      this.redo.bind(this));
  }

  componentWillUnmount() {
    unhandleKey('⌘+z, ctrl+z');
    unhandleKey('⌘+y, ctrl+y');
  }

  undo() {


  }

  handleEdit(model: ModelType, callback?: () => void) {
    this.undoStack = this.undoStack.push(model);
    this.redoStack = Immutable.Stack<ModelType>();

    this.setState(
      {
        undoStackSize: this.undoStack.size - 1,
        redoStackSize: this.redoStack.size,
      },
      () => {
        this.props.onEdit(model);
        callback && callback();
      },
    );
  }

  redo() {

  }


}

