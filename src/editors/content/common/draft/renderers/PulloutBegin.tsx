import * as React from 'react';
import { Dropdown, DropdownItem } from '../../Dropdown';
import { InteractiveRenderer, InteractiveRendererProps, 
  InteractiveRendererState } from './InteractiveRenderer';
import { BlockProps } from './properties';

import { Select } from '../../Select';
import './markers.scss';

type Data = {
  subType: string;
};

export interface PulloutBeginProps extends InteractiveRendererProps {
  data: Data;
}

export interface PulloutBeginState extends InteractiveRendererState {
  
}

export interface PulloutBegin {
  
}

export class PulloutBegin extends InteractiveRenderer<PulloutBeginProps, PulloutBeginState> {

  constructor(props) {
    super(props, {});
  }

  render() {
    const onClick = (subType) => {  
      this.props.blockProps.onEdit({ subType });
    };

    return (
      <span ref={c => this.focusComponent = c} 
        className="PulloutSentinel" onFocus={this.onFocus} onBlur={this.onBlur}>
        Pullout&nbsp;
        <span className="SentinelUI">
          <Select editMode={this.props.blockProps.editMode} 
            label="Type" value={this.props.data.subType} onChange={onClick}>
            <option value="note">Note</option>
            <option value="notation">Notation</option>
            <option value="observation">Observation</option>
            <option value="research">Research</option>
            <option value="tip">Tip</option>
            <option value="tosumpup">To sum up</option>
            
          </Select>
        </span>
      </span>);
  }
}
