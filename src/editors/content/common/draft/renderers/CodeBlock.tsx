import * as React from 'react';
import { BlockProps } from './properties';

import { removeHTML } from '../utils';

require('./CodeBlock.scss');
 
interface CodeBlock {
  _onToggleLock: any;
  _onChange: any;
  _onBlur: any;
}

export interface CodeBlockProps {
  blockProps: BlockProps;
  src: string; 
}

export interface CodeBlockState {
  editMode: boolean;
  src: string;
}

class CodeBlock extends React.PureComponent<CodeBlockProps, CodeBlockState> {

  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      src: this.props.src
    };

    this._onToggleLock = this.onToggleLock.bind(this);
    this._onChange = this.onChange.bind(this);
    this._onBlur = this.onBlur.bind(this);
    
  }

  onChange(e) {
    this.setState({src: removeHTML(e.target.innerHTML)});
  }

  onBlur() {
    if (this.state.editMode) {
      this.onToggleLock();
    }
  }

  onToggleLock() {
    const editMode = !this.state.editMode;
    this.setState({editMode});
    this.props.blockProps.onLockChange(editMode);
  }

  renderViewMode() : JSX.Element {
    
    return (
      <pre onClick={this._onToggleLock} 
        className="CodeBlock-code">
        {this.state.src}
      </pre>
    );
  }

  renderEditMode() : JSX.Element {
    
    // We cannot use JSX here to render this div because
    // the TypeScript type definitions do not seem to
    // recognize 'suppressContentEditableWarning' as a valid
    // property. 
    const element = React.createElement('pre', {
      contentEditable: true,
      suppressContentEditableWarning: true,
      children: this.state.src,
      className: "CodeBlock-code",
      onInput:this._onChange,
      onBlur: this._onBlur
    });
    
    return element;
  }

  render() : JSX.Element {
    if (this.state.editMode) {
      return this.renderEditMode();
    } else {
      return this.renderViewMode();
    }
  }
};

export default CodeBlock;