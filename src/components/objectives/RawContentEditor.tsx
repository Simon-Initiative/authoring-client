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
  content: string;
  isValid: boolean;
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

    try {
      JSON.parse(obj.src);
      this.setState({ isValid: true });
    } catch (err) {
      this.setState({ isValid: false });
    }
  }

  render() : JSX.Element {

    const styles = 'RawContent-style '
      + (this.state.isValid ? 'RawContent-valid' : 'RawContent-invalid');

    return (
      <ModalSelection title="Reword Learning Objective"
        onCancel={this.props.onCancel}
        onInsert={() => {
          if (this.state.isValid) {
            this.props.onEdit(JSON.parse(this.state.content));
          }
        }}>

        <PreformattedTextEditor
          editMode={true}
          onEdit={this.onEdit}
          src={this.state.content}
          styleName={styles}/>
      </ModalSelection>
    );
  }
}

