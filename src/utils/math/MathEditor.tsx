import * as React from 'react';
import beautifyXml from 'xml-beautifier';
import guid from '../../utils/guid';
import { throttle } from 'utils/timing';

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

    this.onChange = throttle(this.onChange.bind(this), 200);

    this.state = {
      beautified: props.content.indexOf('\n') === -1
        ? beautifyXml(props.content)
        : props.content,
    };
  }

  onChange(content) {
    const { onChange } = this.props;

    onChange(content);
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

    const { editMode } = this.props;

    return (
      <AceEditor
        name={this.ids.mathEditor}
        mode="xml"
        theme="github"
        readOnly={!editMode}
        width="initial"
        maxLines={Infinity}
        wrapEnabled={true}
        value={this.state.beautified}
        onChange={this.onChange}
        setOptions={{
          showLineNumbers: true,
          tabSize: 2,
        }}
      />
    );
  }
}

