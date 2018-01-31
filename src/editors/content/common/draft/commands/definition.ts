import * as Immutable from 'immutable';
import { containerPrecondition, insertBlocksAfter, stateFromKey } from './common';
import { EntityTypes, generateRandomKey } from '../../../../../data/content/learning/common';
import { AbstractCommand } from '../../command';
import {
    CharacterMetadata, ContentBlock, ContentState, EditorState,
} from 'draft-js';

function buildTextBlock(key: string, container: Object[]) : ContentState {

  const emptyCharList = Immutable.List().push(new CharacterMetadata());

  container.push(new ContentBlock({ type: 'unstyled', key,
    text: ' ', characterList: emptyCharList }));
}

function buildEntityBlock(
  container: Object[],
  content: ContentState, type: EntityTypes, data: Object) : ContentState {

  const blockKey = generateRandomKey();
  const updated = content.createEntity(type, 'IMMUTABLE', data);
  const entityKey = content.getLastCreatedEntityKey();
  const beginCharList = Immutable.List().push(new CharacterMetadata({ entity: entityKey }));

  container.push(
    new ContentBlock({ type: 'atomic', key: blockKey,
      text: ' ', characterList: beginCharList }),
  );

  return updated;
}

export class InsertDefinitionCommand extends AbstractCommand<EditorState> {

  precondition(editorState: EditorState) : boolean {
    return true;
  }

  execute(editorState: EditorState, context, services) : Promise<EditorState> {

  }
}
