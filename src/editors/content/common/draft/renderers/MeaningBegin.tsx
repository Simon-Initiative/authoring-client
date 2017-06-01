import * as React from 'react';
import { Dropdown, DropdownItem } from '../../Dropdown';
import { InteractiveRenderer, InteractiveRendererProps, 
  InteractiveRendererState } from './InteractiveRenderer';
import { BlockProps } from './properties';
import { MeaningToolbar } from './MeaningToolbar';
import { Select } from '../../Select';
import { EntityTypes, generateRandomKey } from '../../../../../data/content/html/common';

import { within, insert, findKeyOfLast, isPredicate } from './common';

import './markers.scss';

export interface MeaningBeginProps extends InteractiveRendererProps {
  
}

export interface MeaningBeginState extends InteractiveRendererState {
  
}

export interface MeaningBegin {
  
}

export class MeaningBegin extends InteractiveRenderer<MeaningBeginProps, MeaningBeginState> {

  constructor(props) {
    super(props, {});

    this.onAddExample = this.onAddExample.bind(this);
  }

  onAddExample() {
    const insertionKey = findKeyOfLast(
      this.props.block.key, ['meaning_end'], this.props.contentState,
      'material_end', 'example_end');

    const updated = insert(
      insertionKey, this.props.contentState, 
      EntityTypes.example_begin, EntityTypes.example_end,
      { type: 'example_begin' }, 
      { type: 'example_end' });

    this.props.blockProps.onContentChange(updated);
  }

  render() {
    
    return (
      <span ref={c => this.focusComponent = c} className="MeaningSentinel">
        Meaning&nbsp;
        
          <MeaningToolbar 
            onAddExample={this.onAddExample}
          />
        
      </span>);
  }
}
