import * as React from 'react';
import { CodeBlock as CodeBlockType } from 'data/content/learning/codeblock';
import PreformattedText from './PreformattedText';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';

import { Checkbox, Select, TextInput } from '../common/controls';

import './markers.scss';


export interface CodeBlockProps
  extends AbstractContentEditorProps<CodeBlockType> {

}

export interface CodeBlockState {

}

/**
 * The content editor for contiguous text.
 */
export class CodeBlock
  extends AbstractContentEditor<CodeBlockType,
  CodeBlockProps, CodeBlockState> {


  constructor(props) {
    super(props);

    this.onSourceEdit = this.onSourceEdit.bind(this);
    this.onSyntaxChange = this.onSyntaxChange.bind(this);
    this.onNumberEdit = this.onNumberEdit.bind(this);
    this.onStartEdit = this.onStartEdit.bind(this);
    this.onHighlightEdit = this.onHighlightEdit.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return this.props.model !== nextProps.model;
  }

  onSourceEdit(source) {
    const model = this.props.model.with({ source });
    this.props.onEdit(model, model);
  }

  onSyntaxChange(syntax) {
    const model = this.props.model.with({ syntax });
    this.props.onEdit(model, model);
  }

  onNumberEdit(number) {
    const model = this.props.model.with({ number });
    this.props.onEdit(model, model);
  }

  onHighlightEdit(highlight) {
    const model = this.props.model.with({ highlight });
    this.props.onEdit(model, model);
  }

  onStartEdit(start) {
    const model = this.props.model.with({ start });
    this.props.onEdit(model, model);
  }

  render() : JSX.Element {

    const syntax = this.props.model.syntax;

    return (
      <div>
        <form className="form-inline">
          <Select editMode={this.props.editMode}
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
            editMode={this.props.editMode}
            label="Show line numbers"
            value={this.props.model.number}
            onEdit={this.onNumberEdit}
          />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          Start number
          &nbsp;
          <TextInput
            editMode={this.props.editMode}
            width="50"
            type="number"
            label=""
            value={this.props.model.start}
            onEdit={this.onStartEdit}
          />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          Highlight
          &nbsp;
          <TextInput
            editMode={this.props.editMode}
            width="70"
            type="text"
            label=""
            value={this.props.model.highlight}
            onEdit={this.onHighlightEdit}
          />
        </form>
        <PreformattedText onEdit={this.onSourceEdit}
          src={this.props.model.source} editMode={this.props.editMode} />
      </div>);
  }
}
