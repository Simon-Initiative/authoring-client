import { containerPrecondition } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';
import { AbstractCommand } from '../../command';
import {
  EditorState,
} from 'draft-js';


export class InsertExampleCommand extends AbstractCommand<EditorState> {

  precondition(editorState: EditorState) : boolean {
    return containerPrecondition(
      editorState.getSelection(), editorState.getCurrentContent(),
      [EntityTypes.image, EntityTypes.image],
      [EntityTypes.image, EntityTypes.image],
    );
  }

  execute(editorState: EditorState, context, services) : Promise<EditorState> {

    return Promise.resolve(editorState);
  }
}
