import * as React from 'react';
import { Dropdown, DropdownItem } from '../../Dropdown';
import { InteractiveRenderer, InteractiveRendererProps, InteractiveRendererState} from './InteractiveRenderer'
import { BlockProps } from './properties';

import { Select } from '../../Select';
import './markers.scss';

export interface ExampleBeginProps extends InteractiveRendererProps {
  subType: string;
}

export interface ExampleBeginState extends InteractiveRendererState {
  
}

export interface ExampleBegin {
  
}

export class ExampleBegin extends InteractiveRenderer<ExampleBeginProps, ExampleBeginState> {

  constructor(props) {
    super(props, {});
  }

  render() {
    const onClick = (subType) => {  
      this.props.blockProps.onEdit({subType});
    }

    return (
      <span ref={(c) => this.focusComponent = c} className='ExampleSentinel'>
        Example&nbsp;
      </span>);
    }
}
