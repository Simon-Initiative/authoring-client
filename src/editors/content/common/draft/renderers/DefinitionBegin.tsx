import * as React from 'react';
import * as Immutable from 'immutable';
import { Dropdown, DropdownItem } from '../../Dropdown';
import { InteractiveRenderer, InteractiveRendererProps, 
  InteractiveRendererState } from './InteractiveRenderer';
import { BlockProps } from './properties';
import { DefinitionToolbar } from './DefinitionToolbar';
import { Select } from '../../Select';
import { TextInput } from '../../TextInput';
import { insertBlocksAfter } from '../commands/common';
import { EntityTypes, generateRandomKey } from '../../../../../data/content/html/common';
import { ContentState, Entity, ContentBlock, Modifier, CharacterMetadata } from 'draft-js';

import './markers.scss';

type Data = {
  term: string;
};

export interface DefinitionBeginProps extends InteractiveRendererProps {
  data: Data;
}

export interface DefinitionBeginState extends InteractiveRendererState {
  
}

export interface DefinitionBegin {
  
}

function isPredicate(beginBlockType: string, block: ContentBlock) : boolean {
  if (block.type === 'atomic') {
    const entity = Entity.get(block.getEntityAt(0));
    if (entity.data.type === beginBlockType) {
      return true;
    }
  }
  return false;
}

function findKeyOfLast(
  beginKey: string, stopTypes: string[], contentState: ContentState,
  ...endTypes): string {

  const arr = contentState.getBlocksAsArray();
  let inside = false;
  let key = beginKey;

  for (let i = 0; i < arr.length; i += 1) {
    const block = arr[i];
    if (!inside && block.key === beginKey) {
      inside = true;
    } else if (inside) {

      if (block.type === 'atomic') {

        const entity = Entity.get(block.getEntityAt(0));
        
        if (stopTypes.indexOf(entity.data.type) !== -1) {
          return key;
        }
        
        if (endTypes.indexOf(entity.data.type) !== -1) {
          key = block.key;
        }
      }
      
    }
  }
  return key; 
}

function within(
  beginKey: string, endBlockType: string, contentState: ContentState,
  predicate: (block: ContentBlock) => boolean) {

  const arr = contentState.getBlocksAsArray();
  let inside = false;
  for (let i = 0; i < arr.length; i += 1) {
    const block = arr[i];
    if (!inside && block.key === beginKey) {
      inside = true;
    } else if (inside) {

      if (block.type === 'atomic') {
        const entity = Entity.get(block.getEntityAt(0));
        if (entity.data.type === endBlockType) {
          return false;
        }
      }
      if (predicate(block)) {
        return true;
      }
    }
  }
  return false;
}

function insert(
  key: string, contentState: ContentState, 
  beginType: EntityTypes, endType: EntityTypes,
  beginData: Object, endData: Object) : ContentState {

  const beginBlockKey = generateRandomKey();
  const contentKey = generateRandomKey();
  const endBlockKey = generateRandomKey();

  let content = contentState;

  content = content.createEntity(
    beginType, 
    'IMMUTABLE', beginData);
  const beginKey = content.getLastCreatedEntityKey();

  content = content.createEntity(
    endType, 
    'IMMUTABLE', endData);
  const endKey = content.getLastCreatedEntityKey();

  const beginCharList = Immutable.List().push(new CharacterMetadata({ entity: beginKey }));
  const emptyCharList = Immutable.List().push(new CharacterMetadata());
  const endCharList = Immutable.List().push(new CharacterMetadata({ entity: endKey }));

  const blocks = [
    new ContentBlock({ type: 'atomic', key: beginBlockKey, 
      text: ' ', characterList: beginCharList }),
    new ContentBlock({ type: 'unstyled', key: contentKey, 
      text: ' ', characterList: emptyCharList }),
    new ContentBlock({ type: 'atomic', key: endBlockKey, text: ' ', characterList: endCharList }),
    new ContentBlock({ type: 'unstyled', 
      key: contentKey, text: ' ', characterList: emptyCharList }),
  ];

  return insertBlocksAfter(content, key, blocks);

}

export class DefinitionBegin 
  extends InteractiveRenderer<DefinitionBeginProps, DefinitionBeginState> {

  constructor(props) {
    super(props, {});

    this.onAddMeaning = this.onAddMeaning.bind(this);
    this.onAddTitle = this.onAddTitle.bind(this);
    this.onAddPronunciation = this.onAddPronunciation.bind(this);
    this.onAddTranslation = this.onAddTranslation.bind(this);

  }

  onAddTitle() {
    // Only allow a title to be inserted if there isn't one already
    if (!within(
      this.props.block.key, 'definition_end', this.props.contentState, 
      isPredicate.bind(undefined, 'title_begin'))) {

      const updated = insert(
        this.props.block.key, this.props.contentState, 
        EntityTypes.title_begin, EntityTypes.title_end,
        { type: 'title_begin' }, { type: 'title_end' });

      this.props.blockProps.onContentChange(updated);
    }
  }

  onAddMeaning() {
    const insertionKey = findKeyOfLast(
      this.props.block.key, ['definition_end'], this.props.contentState,
      'title_end', 'pronunciation_end', 'translation_end', 'meaning_end');

    const updated = insert(
      insertionKey, this.props.contentState, 
      EntityTypes.meaning_begin, EntityTypes.meaning_end,
      { type: 'meaning_begin' }, 
      { type: 'meaning_end' });

    this.props.blockProps.onContentChange(updated);
  }

  onAddPronunciation() {
    // Only allow a pronunciation to be inserted if there isn't one already
    if (!within(
      this.props.block.key, 'definition_end', this.props.contentState, 
      isPredicate.bind(undefined, 'pronunciation_begin'))) {

      const insertionKey = findKeyOfLast(
        this.props.block.key, 
        ['translation_begin', 'meaning_begin', 'definition_end'], 
        this.props.contentState,
        'title_end');

      const updated = insert(
        insertionKey, this.props.contentState, 
        EntityTypes.pronunciation_begin, EntityTypes.pronunciation_end,
        { type: 'pronunciation_begin', src: '', srcType: '' }, 
        { type: 'pronunciation_end' });

      this.props.blockProps.onContentChange(updated);
    }
  }

  onAddTranslation() {
    const insertionKey = findKeyOfLast(
      this.props.block.key, 
      ['meaning_begin', 'definition_end'], 
      this.props.contentState,
      'title_end', 'pronunciation_end', 'translation_end');

    const updated = insert(
      insertionKey, this.props.contentState, 
      EntityTypes.translation_begin, EntityTypes.translation_end,
      { type: 'translation_begin' }, 
      { type: 'translation_end' });

    this.props.blockProps.onContentChange(updated);
  }

  render() {
    return (
      <span ref={c => this.focusComponent = c} 
        className="DefinitionSentinel" onFocus={this.onFocus} onBlur={this.onBlur}>
        Definition&nbsp;
        <TextInput width="150px" label="Term" value={this.props.data.term} type="text"
          onEdit={term => this.props.blockProps.onEdit({ term })}
        />
        <span className="SentinelUI"> 
          <DefinitionToolbar 
            onAddTitle={this.onAddTitle}
            onAddPronunciation={this.onAddPronunciation}
            onAddTranslation={this.onAddTranslation}
            onAddMeaning={this.onAddMeaning}
          />
        </span>
      </span>);
  }
}
