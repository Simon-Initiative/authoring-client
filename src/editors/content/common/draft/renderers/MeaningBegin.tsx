import * as React from 'react';
import { Dropdown, DropdownItem } from '../../Dropdown';
import { InteractiveRenderer, InteractiveRendererProps, 
  InteractiveRendererState } from './InteractiveRenderer';
import { BlockProps } from './properties';

import { Select } from '../../Select';
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
  }

  render() {
    
    return (
      <span ref={c => this.focusComponent = c} className="MeaningSentinel">
        Meaning&nbsp;
      </span>);
  }
}
