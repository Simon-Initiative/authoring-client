import * as Immutable from 'immutable';
import { containerPrecondition, insertBlocksAfter, stateFromKey } from './common';
import { EntityTypes, generateRandomKey } from '../../../../../data/content/learning/common';
import { AbstractCommand } from '../../command';
import {
  CharacterMetadata, ContentBlock, EditorState,
} from 'draft-js';
import { EDOM } from 'constants';


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
