import * as React from 'react';
import { Math } from './Math';
import beautifyXml from 'xml-beautifier';
import guid from '../../utils/guid';

import * as brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/xml';
import 'brace/theme/github';

import './MathEditor.scss';

type GeneratedIds = {
  mathEditor: string,
};

export interface MathEditor {
  ids: GeneratedIds;
}

export interface MathEditorProps {
  content: string;
  onChange: (content: string) => void;
  editMode: boolean;
}

export interface MathEditorState {
  beautified: string;
}

export class MathEditor extends React.Component<MathEditorProps, MathEditorState> {

  constructor(props) {
    super(props);
    this.ids = {
      mathEditor: guid(),
    };

    this.onChange = this.onChange.bind(this);

    this.state = {
      beautified: props.content.indexOf('\n') === -1
        ? beautifyXml(props.content)
        : props.content,
    };
  }

  onChange(content) {
    console.log(content);
    this.props.onChange(content);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.content !== nextProps.content) {
      this.setState({
        beautified: nextProps.content.indexOf('\n') === -1
        ? beautifyXml(nextProps.content)
        : nextProps.content,
      });
    }
  }

  render() {

    const { content, editMode } = this.props;

    return (
      <AceEditor
        name={this.ids.mathEditor}
        mode="xml"
        theme="github"
        readOnly={!editMode}
        width="100%"
        height="350px"
        value={this.state.beautified}
        onChange={this.onChange}
        setOptions={{
          showLineNumbers: false,
          tabSize: 2,
        }}
      />
    );
  }
}

