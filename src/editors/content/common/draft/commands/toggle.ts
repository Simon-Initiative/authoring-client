import { appendText } from './common';
import { AbstractCommand } from '../../command';
import { EditorState, RichUtils, SelectionState } from 'draft-js';

export class ToggleStyleCommand extends AbstractCommand<EditorState> {

  style: string;

  constructor(style: string) {
    super();
    this.style = style;
  }

  execute(editorState: EditorState, context, services) : Promise<EditorState> {

    const updateStyle = RichUtils.toggleInlineStyle(editorState, this.style);

    const key : string = editorState.getSelection().getAnchorKey();
    return Promise.resolve(EditorState.acceptSelection(
      updateStyle, SelectionState.createEmpty(key)),
    );
  }
}

export class ToggleBlockTypeCommand extends AbstractCommand<EditorState> {

  type: string;

  constructor(type: string) {
    super();
    this.type = type;
  }

  execute(editorState: EditorState, context, services) : Promise<EditorState> {
    return Promise.resolve(RichUtils.toggleBlockType(editorState, this.type));
  }
}
