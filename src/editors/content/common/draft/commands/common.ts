import { EditorState, SelectionState, Modifier } from 'draft-js';

export abstract class AbstractDraftCommand {
  abstract execute(editorState: EditorState) : Promise<EditorState>;
}

export function appendText(contentBlock, contentState, text) {

  const targetRange = new SelectionState({
    anchorKey: contentBlock.key,
    focusKey: contentBlock.key,
    anchorOffset: contentBlock.text.length,
    focusOffset: contentBlock.text.length
  })

  return Modifier.insertText(
    contentState,
    targetRange,
    text);
}
