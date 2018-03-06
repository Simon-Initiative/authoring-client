import * as Immutable from 'immutable';
import { EntityTypes, generateRandomKey } from '../../../../../data/content/learning/common';
import { AbstractCommand } from '../../command';
import {
    CharacterMetadata, ContentBlock, ContentState, EditorState,
} from 'draft-js';

export class InsertDefinitionCommand extends AbstractCommand<EditorState> {

  precondition(editorState: EditorState) : boolean {
    return true;
  }

  execute(editorState: EditorState, context, services) : Promise<EditorState> {
    return Promise.resolve(editorState);
  }
}
