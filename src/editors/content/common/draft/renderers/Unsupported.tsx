import * as React from 'react';
import { InteractiveRenderer, InteractiveRendererProps, InteractiveRendererState} from './InteractiveRenderer'
import { BlockProps } from './properties';
import PreformattedText from './PreformattedText';

import './Unsupported.scss';

export interface UnsupportedProps extends InteractiveRendererProps {
  data: Object;
}

export interface UnsupportedState extends InteractiveRendererState {
  
}

class Unsupported extends InteractiveRenderer<UnsupportedProps, UnsupportedState> {

  constructor(props) {
    super(props, {});

    this.onEdit = this.onEdit.bind(this);
  }

  onEdit(data) {
    this.props.blockProps.onEdit(JSON.parse(data));
  }

  render() : JSX.Element {
    return <PreformattedText 
      editMode={this.state.editMode} 
      onEdit={this.onEdit} 
      src={JSON.stringify(this.props.data)} 
      styleName='Unsupported-style'/>
  }
};

export default Unsupported;