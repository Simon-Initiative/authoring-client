import * as React from 'react';
import PreformattedText from './PreformattedText';
import { BlockProps } from './properties';

import './Unsupported.scss';

interface Unsupported {
  
}

export interface UnsupportedProps {
  blockProps: BlockProps;
  src: string; 
}

export interface UnsupportedState {
  
}

class Unsupported extends React.PureComponent<UnsupportedProps, UnsupportedState> {

  constructor(props) {
    super(props);
  }

  render() : JSX.Element {
    return <PreformattedText {...this.props} styleName='Unsupported-style'/>
  }
};

export default Unsupported;