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

import { within, insert, insertNoSpace, findKeyOfLast, isPredicate } from './common';

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



export class DefinitionBegin 
  extends InteractiveRenderer<DefinitionBeginProps, DefinitionBeginState> {

  constructor(props) {
    super(props, {});

    this.onAddMeaning = this.onAddMeaning.bind(this);
    this.onAddTitle = this.onAddTitle.bind(this);
    this.onAddPronunciation = this.onAddPronunciation.bind(this);
    this.onAddTranslation = this.onAddTranslation.bind(this);
    this.onTermEdit = this.onTermEdit.bind(this);
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

    let updated = insertNoSpace(
      insertionKey, this.props.contentState, 
      EntityTypes.meaning_begin, EntityTypes.meaning_end,
      { type: 'meaning_begin' }, 
      { type: 'meaning_end' }, false);

    const meaningBeginKey = findKeyOfLast(
      this.props.block.key, ['meaning_end'], updated,
      'meaning_begin');

    updated = insert(
      meaningBeginKey, updated, 
      EntityTypes.material_begin, EntityTypes.material_end,
      { type: 'material_begin' }, 
      { type: 'material_end' }, false);

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

  onTermEdit(term) {
    this.props.blockProps.onEdit({ term });
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
        
        
          <form className="form-inline">
          Term:&nbsp;&nbsp;
          <TextInput editMode={this.props.blockProps.editMode} 
            width="300px" label="Term" value={this.props.data.term} type="text"
            onEdit={this.onTermEdit}
          />
          <DefinitionToolbar 
            onAddTitle={this.onAddTitle}
            onAddPronunciation={this.onAddPronunciation}
            onAddTranslation={this.onAddTranslation}
            onAddMeaning={this.onAddMeaning}
          />
          </form>
      </span>);
  }
}
