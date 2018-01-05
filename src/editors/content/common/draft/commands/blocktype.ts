import { AbstractCommand } from '../../command';
import { EditorState, RichUtils, SelectionState } from 'draft-js';

export class SetBlockTypeCommand extends AbstractCommand<EditorState> {

  type: string;

  constructor(type: string) {
    super();
    this.type = type;
  }

  execute(editorState: EditorState, context, services) : Promise<EditorState> {

    const updateStyle = RichUtils.toggleBlockType(editorState, this.type);

    const key : string = editorState.getSelection().getAnchorKey();
    
    return Promise.resolve(
      EditorState.acceptSelection(
        updateStyle, 
        SelectionState.createEmpty(key)));
  }
}

