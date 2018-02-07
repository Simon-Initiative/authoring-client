import * as React from 'react';
import { CodeBlock as CodeBlockType } from 'data/content/learning/codeblock';
import PreformattedText from './PreformattedText';
import {
  InteractiveRenderer, InteractiveRendererProps, InteractiveRendererState,
} from './InteractiveRenderer';
import { Checkbox, Select, TextInput } from '../common/controls';

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
    this.onNumberEdit = this.onNumberEdit.bind(this);
    this.onStartEdit = this.onStartEdit.bind(this);
    this.onHighlightEdit = this.onHighlightEdit.bind(this);
  }

  onSourceEdit(source) {
    this.props.blockProps.onEdit({ codeblock: this.props.data.codeblock.with({ source }) });
  }

  onSyntaxChange(syntax) {
    this.props.blockProps.onEdit({ codeblock: this.props.data.codeblock.with({ syntax }) });
  }

  onNumberEdit(number) {
    this.props.blockProps.onEdit({ codeblock: this.props.data.codeblock.with({ number }) });
  }

  onHighlightEdit(highlight) {
    this.props.blockProps.onEdit({ codeblock: this.props.data.codeblock.with({ highlight }) });
  }

  onStartEdit(start) {
    this.props.blockProps.onEdit({ codeblock: this.props.data.codeblock.with({ start }) });
  }

  render() : JSX.Element {

    const syntax = this.props.data.codeblock.syntax;

    return (
      <div ref={c => this.focusComponent = c} onFocus={this.onFocus} onBlur={this.onBlur}>
        <form className="form-inline">
          <Select editMode={this.props.blockProps.editMode}
            label="Syntax" value={syntax} onChange={this.onSyntaxChange}>
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
          <Checkbox
            editMode={this.props.blockProps.editMode}
            label="Show line numbers"
            value={this.props.data.codeblock.number}
            onEdit={this.onNumberEdit}
          />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          Start number
          &nbsp;
          <TextInput
            editMode={this.props.blockProps.editMode}
            width="50"
            type="number"
            label=""
            value={this.props.data.codeblock.start}
            onEdit={this.onStartEdit}
          />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          Highlight
          &nbsp;
          <TextInput
            editMode={this.props.blockProps.editMode}
            width="70"
            type="text"
            label=""
            value={this.props.data.codeblock.highlight}
            onEdit={this.onHighlightEdit}
          />
        </form>
        <PreformattedText onEdit={this.onSourceEdit}
          src={this.props.data.codeblock.source} editMode={this.props.blockProps.editMode} />
      </div>);
  }
}

export default CodeBlock;
