import * as React from 'react';
import { Dropdown, DropdownItem } from '../../Dropdown';
import { InteractiveRenderer, InteractiveRendererProps, InteractiveRendererState } from './InteractiveRenderer';
import { BlockProps } from './properties';

import { Select } from '../../Select';
import './markers.scss';

type Data = {
  purpose: string;
};

export interface SectionBeginProps extends InteractiveRendererProps {
  data: Data;
}

export interface SectionBeginState extends InteractiveRendererState {
  
}

export interface SectionBegin {
  
}

export class SectionBegin extends InteractiveRenderer<SectionBeginProps, SectionBeginState> {

  constructor(props) {
    super(props, {});
  }

  render() {
    const onClick = (purpose) => {  
      this.props.blockProps.onEdit({ purpose });
    };

    return (
      <span ref={(c) => this.focusComponent = c} className="PulloutSentinel" onFocus={this.onFocus} onBlur={this.onBlur}>
        Section&nbsp;
        <span className="SentinelUI">
          <Select editMode={this.props.blockProps.editMode} 
            label="Purpose" value={this.props.data.purpose} onChange={onClick}>
            
            <option value="">- none -</option>
            <option value="checkpoint">Checkpoint</option>
            <option value="didigetthis">Did I get this</option>
            <option value="lab">Lab</option>
            <option value="learnbydoing">Learn by doing</option>
            <option value="learnmore">Learn more</option>
            <option value="manystudentswonder">Many students wonder</option>
            <option value="myresponse">My response</option>
            <option value="quiz">Quiz</option>
            <option value="simulation">Simulation</option>
            <option value="walkthrough">Walkthrough</option>
            
          </Select>
        </span>
      </span>);
  }
}
