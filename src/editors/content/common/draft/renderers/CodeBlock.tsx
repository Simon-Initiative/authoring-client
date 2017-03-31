import * as React from 'react';
import PreformattedText from './PreformattedText';
import { BlockProps } from './properties';

interface CodeBlock {
  
}

export interface CodeBlockProps {
  blockProps: BlockProps;
  src: string; 
}

export interface CodeBlockState {
  
}

class CodeBlock extends React.PureComponent<CodeBlockProps, CodeBlockState> {

  constructor(props) {
    super(props);
  }

  render() : JSX.Element {
    return <PreformattedText {...this.props}/>
  }
};

export default CodeBlock;