import * as Immutable from 'immutable';
import { insertBlocksAfter, createTitle,
  stateFromKey, containerPrecondition } from './common';
import { EntityTypes, generateRandomKey } from '../../../../../data/content/html/common';
import { AbstractCommand } from '../../command';
import { EditorState, RichUtils, SelectionState,
  ContentBlock, Modifier, CharacterMetadata} from 'draft-js';



export class InsertExampleCommand extends AbstractCommand<EditorState> {

  precondition(editorState: EditorState) : boolean {
    return containerPrecondition(
      editorState.getSelection(), editorState.getCurrentContent(),
      [EntityTypes.pullout_begin, EntityTypes.example_begin],
      [EntityTypes.pullout_end, EntityTypes.example_end],
    );
  }

  execute(editorState: EditorState, context, services) : Promise<EditorState> {

    const ss = editorState.getSelection();
    const key = ss.getAnchorKey();

    const beginBlockKey = generateRandomKey();
    const contentKey = generateRandomKey();
    const endBlockKey = generateRandomKey();

    let content = editorState.getCurrentContent();
    content = content.createEntity(EntityTypes.example_begin, 'IMMUTABLE', {
      type: 'example_begin',
    });
    const beginKey = content.getLastCreatedEntityKey();

    content = content.createEntity(EntityTypes.example_end, 'IMMUTABLE', {
      type: 'example_end', beginBlockKey,
    });
    const endKey = content.getLastCreatedEntityKey();

    const beginCharList = Immutable.List().push(new CharacterMetadata({ entity: beginKey }));
    const emptyCharList = Immutable.List().push(new CharacterMetadata());
    const endCharList = Immutable.List().push(new CharacterMetadata({ entity: endKey }));

    const titleBlocks = [];
    content = createTitle(content, titleBlocks);

    const blocks = [
      new ContentBlock({
        type: 'atomic', key: beginBlockKey, text: ' ', characterList: beginCharList,
      }),
      ...titleBlocks,
      new ContentBlock({
        type: 'unstyled', key: contentKey, text: ' ', characterList: emptyCharList,
      }),
      new ContentBlock({
        type: 'atomic', key: endBlockKey, text: ' ', characterList: endCharList,
      }),
      new ContentBlock({
        type: 'unstyled', key: contentKey, text: ' ', characterList: emptyCharList,
      }),
    ];

    content = insertBlocksAfter(content, key, blocks);

    return Promise.resolve(EditorState.forceSelection(
        EditorState.push(editorState, content, 'insert-fragment'),
        stateFromKey(contentKey),
    ));
  }
}
