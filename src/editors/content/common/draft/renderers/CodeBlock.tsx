import * as React from 'react';
import { CodeBlock as CodeBlockType } from '../../../../../data/content/html/codeblock';
import PreformattedText from './PreformattedText';
import { InteractiveRenderer, InteractiveRendererProps, 
  InteractiveRendererState} from './InteractiveRenderer';
import { BlockProps } from './properties';
import { Select } from '../../Select';

import './markers.scss';

type Data = {
  codeblock: CodeBlockType;
};

export interface CodeBlockProps extends InteractiveRendererProps {
  data: Data;
}

export interface CodeBlockState extends InteractiveRendererState {
  
}

export interface CodeBlockProps {
  
}


class CodeBlock extends InteractiveRenderer<CodeBlockProps, CodeBlockState> {

  constructor(props) {
    super(props, {});

    this.onSourceEdit = this.onSourceEdit.bind(this);
    this.onSyntaxChange = this.onSyntaxChange.bind(this);
  }

  onSourceEdit(source) {
    this.props.blockProps.onEdit({ codeblock: this.props.data.codeblock.with({ source }) });
  }

  onSyntaxChange(syntax) {
    this.props.blockProps.onEdit({ codeblock: this.props.data.codeblock.with({ syntax }) });
  }

  render() : JSX.Element {

    const syntax = this.props.data.codeblock.syntax;

    return (
      <div ref={c => this.focusComponent = c} onFocus={this.onFocus} onBlur={this.onBlur}>
        <Select label="Syntax" value={syntax} onChange={this.onSyntaxChange}>
            <option value="actionscript3">ActionScript</option>
            <option value="bash">Bash</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="text">Text</option>
            <option value="xml">XML</option>
          </Select>
        <PreformattedText onEdit={this.onSourceEdit} 
          src={this.props.data.codeblock.source} editMode={this.state.editMode} />
      </div>);
  }
}

export default CodeBlock;
