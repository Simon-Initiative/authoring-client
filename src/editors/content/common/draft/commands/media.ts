import { AbstractDraftCommand, appendText } from './common';
import { EditorState, ContentState, SelectionState, Modifier, AtomicBlockUtils } from 'draft-js';

export class InsertMedia extends AbstractDraftCommand {

  type: string;
  data: Object;

  constructor(type: string, mutability: string, data: Object) {
    super();

    this.type = type;
    this.data = data;
  }

  execute(editorState: EditorState) : EditorState {
    
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      this.type,
      'IMMUTABLE',
      this.data
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(
      editorState,
      {currentContent: contentStateWithEntity}
    );

    return Promise.resolve(AtomicBlockUtils.insertAtomicBlock(
        newEditorState,
        entityKey,
        ' '));
  }
}

export class InsertInlineEntityCommand extends AbstractDraftCommand {

  type: string;
  mutability: string;
  data: Object;

  constructor(type: string, mutability: string, data: Object) {
    super();

    this.type = type;
    this.mutability = mutability;
    this.data = data;
  }

  execute(editorState: EditorState) : EditorState {
    let contentState = editorState.getCurrentContent();
    let selectionState = editorState.getSelection();

    // We cannot insert an entity at the beginning of a content block,
    // to handle that case we adjust and add 1 to the focus offset 
    if (selectionState.focusOffset === 0 && selectionState.anchorOffset === 0) {
      
      selectionState = new SelectionState({ 
        anchorKey: selectionState.anchorKey,
        focusKey: selectionState.focusKey,
        anchorOffset: 0,
        focusOffset: 1
      });
    }

    const block = contentState.getBlockForKey(selectionState.anchorKey);
    const text = block.getText();

    if (text.length < selectionState.focusOffset) {
      contentState = appendText(block, contentState, '  ');
    }

    const contentStateWithEntity = contentState.createEntity(this.type, this.mutability, this.data);
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const contentStateWithLink = Modifier.applyEntity(
      contentState,
      selectionState,
      entityKey
    );

    return Promise.resolve(EditorState.set(editorState, { currentContent: contentStateWithLink }));
  }
}

