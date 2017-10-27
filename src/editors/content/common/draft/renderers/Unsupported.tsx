import * as React from 'react';
import { InteractiveRenderer, InteractiveRendererProps, 
  InteractiveRendererState} from './InteractiveRenderer';
import { BlockProps } from './properties';
import PreformattedText from './PreformattedText';

const beautify = require('json-beautify');
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

  shouldComponentUpdate() {
    return false;
  }

  onEdit(data) {

    try {
      const obj = JSON.parse(data.src);
      this.props.blockProps.onEdit(obj);
    } catch (err) {
      // Do not allow persistence of invalid JSON
    }
    
  }

  render() : JSX.Element {
    return (
      <div ref={c => this.focusComponent = c} onFocus={this.onFocus} onBlur={this.onBlur}>
        <PreformattedText 
          editMode={this.props.blockProps.editMode} 
          onEdit={this.onEdit} 
          src={beautify(this.props.data, null, 2, 100)} 
          styleName="Unsupported-style"/>
      </div>
    );
  }
}

export default Unsupported;
