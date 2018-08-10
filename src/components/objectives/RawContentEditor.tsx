import * as React from 'react';
import PreformattedTextEditor from 'editors/content/learning/PreformattedTextEditor';
import ModalSelection from 'utils/selection/ModalSelection';

const beautify = require('json-beautify');

import './RawContentEditor.scss';

export interface RawContentEditorProps {
  rawContent: Object;
  onEdit: (edited: Object) => void;
  onCancel: () => void;
}

export interface RawContentEditorState {
  isValid: boolean;
  content: string;
}

export class RawContentEditor
  extends React.PureComponent<RawContentEditorProps, RawContentEditorState> {

  constructor(props) {
    super(props);

    this.state = { isValid: true, content: beautify(props.rawContent, null, 2, 100) };

    this.onEdit = this.onEdit.bind(this);
  }

  onEdit(obj) {
    this.setState({ content: obj.src });
  }

  render() : JSX.Element {
    return (
      <ModalSelection title="Reword Learning Objective"
        onCancel={this.props.onCancel}
        onInsert={() => this.props.onEdit(JSON.parse(this.state.content))}>

        <PreformattedTextEditor
          editMode={true}
          onEdit={this.onEdit}
          src={this.state.content}
          styleName="RawContent-style"/>
      </ModalSelection>
    );
  }
}

