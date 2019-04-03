import { AbstractCommand } from '../../command';
import { AtomicBlockUtils, EditorState, Modifier } from 'draft-js';

export class InsertBlockEntityCommand
  extends AbstractCommand<EditorState> {

  type: string;
  data: Object;

  constructor(type: string, mutability: string, data: Object) {
    super();

    this.type = type;
    this.data = data;
  }

  execute(editorState: EditorState, context, services): Promise<EditorState> {

    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      this.type,
      'IMMUTABLE',
      this.data);

    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(
      editorState,
      { currentContent: contentStateWithEntity },
    );

    return Promise.resolve(AtomicBlockUtils.insertAtomicBlock(
      newEditorState,
      entityKey,
      ' '));
  }
}

export class InsertInlineEntityCommand extends AbstractCommand<EditorState> {

  type: string;
  mutability: string;
  data: Object;
  backingText: string;

  constructor(type: string, mutability: string, data: Object, backingText) {
    super();

    this.type = type;
    this.mutability = mutability;
    this.data = data;
    this.backingText = backingText;
  }

  execute(editorState: EditorState, context, services): Promise<EditorState> {
    let contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    // Create the entity
    contentState = contentState.createEntity(this.type, this.mutability as any, this.data);
    const entityKey = contentState.getLastCreatedEntityKey();

    // Insert the backing text with entity
    contentState = Modifier.replaceText(
      contentState, selectionState, this.backingText, undefined, entityKey);


    return Promise.resolve(EditorState.set(editorState, { currentContent: contentState }));
  }
}

