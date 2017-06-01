import * as React from 'react';
import { Dropdown, DropdownItem } from '../../Dropdown';
import { InteractiveRenderer, InteractiveRendererProps, 
  InteractiveRendererState } from './InteractiveRenderer';
import { BlockProps } from './properties';
import { Select } from '../../Select';
import { EntityTypes, generateRandomKey } from '../../../../../data/content/html/common';

import './markers.scss';

export interface MaterialBeginProps extends InteractiveRendererProps {
  
}

export interface MaterialBeginState extends InteractiveRendererState {
  
}

export interface MaterialBegin {
  
}

export class MaterialBegin extends InteractiveRenderer<MaterialBeginProps, MaterialBeginState> {

  constructor(props) {
    super(props, {});

  }

  render() {
    
    return (
      <span ref={c => this.focusComponent = c} className="MaterialSentinel">
        Material&nbsp;
      </span>);
  }
}
