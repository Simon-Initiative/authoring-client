import { AbstractCommand } from '../../command';
import {
    EditorState,
} from 'draft-js';

export class InsertDefinitionCommand extends AbstractCommand<EditorState> {

  precondition(editorState: EditorState) : boolean {
    return true;
  }

  execute(editorState: EditorState, context, services) : Promise<EditorState> {
    return Promise.resolve(editorState);
  }
}
