import { AbstractDraftCommand, appendText } from './common';
import { EditorState, RichUtils, SelectionState } from 'draft-js';

export class ToggleStyleCommand extends AbstractDraftCommand {

  style: string;

  constructor(style: string) {
    super()
    this.style = style;
  }

  execute(editorState: EditorState) : EditorState {

    const updateStyle = RichUtils.toggleInlineStyle(editorState, this.style);

    const key : string = editorState.getSelection().getAnchorKey();
    return Promise.resolve(EditorState.acceptSelection(updateStyle, SelectionState.createEmpty(key)))
  }
}

export class ToggleBlockTypeCommand extends AbstractDraftCommand {

  type: string;

  constructor(type: string) {
    super()
    this.type = type;
  }

  execute(editorState: EditorState) : EditorState {
    return Promise.resolve(RichUtils.toggleBlockType(editorState, this.type));
  }
}
