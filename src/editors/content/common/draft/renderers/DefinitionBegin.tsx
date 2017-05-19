import * as React from 'react';
import { Dropdown, DropdownItem } from '../../Dropdown';
import { InteractiveRenderer, InteractiveRendererProps, 
  InteractiveRendererState } from './InteractiveRenderer';
import { BlockProps } from './properties';
import { DefinitionToolbar } from './DefinitionToolbar';
import { Select } from '../../Select';
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
  }

  render() {
    const onClick = (subType) => {  
      this.props.blockProps.onEdit({ subType });
    };

    return (
      <span ref={c => this.focusComponent = c} 
        className="DefinitionSentinel" onFocus={this.onFocus} onBlur={this.onBlur}>
        Definition&nbsp;
        <span className="SentinelUI">
          
        </span>
      </span>);
  }
}
