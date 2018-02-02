import * as Immutable from 'immutable';
import { containerPrecondition, createTitle, insertBlocksAfter, stateFromKey } from './common';
import { EntityTypes, generateRandomKey } from 'data/content/learning/common';
import { AbstractCommand } from '../../command';
import {
  CharacterMetadata, ContentBlock, EditorState,
} from 'draft-js';


export class InsertPulloutCommand extends AbstractCommand<EditorState> {

  precondition(editorState: EditorState) : boolean {
    return true;
  }

  execute(editorState: EditorState, context, services) : Promise<EditorState> {



    return Promise.resolve(editorState);
  }
}
