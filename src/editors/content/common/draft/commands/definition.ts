import * as Immutable from 'immutable';
import { containerPrecondition, insertBlocksAfter, stateFromKey } from './common';
import { EntityTypes, generateRandomKey } from '../../../../../data/content/html/common';
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
    return containerPrecondition(
      editorState.getSelection(), editorState.getCurrentContent(),
      [EntityTypes.pullout_begin, EntityTypes.example_begin, EntityTypes.definition_begin],
      [EntityTypes.pullout_end, EntityTypes.example_end, EntityTypes.definition_end],

    );
  }

  execute(editorState: EditorState, context, services) : Promise<EditorState> {

    const ss = editorState.getSelection();
    let content = editorState.getCurrentContent();
    const key = ss.getAnchorKey();
    const contentKey = generateRandomKey();

    const blocks = [];

    buildEntityBlock(
      blocks, content,
      EntityTypes.definition_begin, { type: 'definition_begin', term: '' });
    buildEntityBlock(
      blocks, content,
      EntityTypes.meaning_begin, { type: 'meaning_begin' });
    buildEntityBlock(
      blocks, content,
      EntityTypes.material_begin, { type: 'material_begin' });

    buildTextBlock(contentKey, blocks);

    buildEntityBlock(
      blocks, content,
      EntityTypes.material_end, { type: 'material_end' });
    buildEntityBlock(
      blocks, content,
      EntityTypes.meaning_end, { type: 'meaning_end' });
    buildEntityBlock(
      blocks, content,
      EntityTypes.definition_end, { type: 'definition_end' });
    buildTextBlock(generateRandomKey(), blocks);

    content = insertBlocksAfter(content, key, blocks);

    return Promise.resolve(EditorState.forceSelection(
      EditorState.push(editorState, content, 'insert-fragment'), stateFromKey(contentKey)));
  }
}
