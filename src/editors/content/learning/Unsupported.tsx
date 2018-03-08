import * as React from 'react';

import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import PreformattedText from './PreformattedText';
import './Unsupported.scss';

const beautify = require('json-beautify');

export interface UnsupportedProps extends AbstractContentEditorProps<{}> {

}

export interface UnsupportedState {

}

class Unsupported extends AbstractContentEditor<{}, UnsupportedProps, UnsupportedState> {

  constructor(props) {
    super(props);

    this.onEdit = this.onEdit.bind(this);
  }

  shouldComponentUpdate() {
    return false;
  }

  onEdit(data) {
    // Editing is disabled
  }

  renderSidebar() {
    return <div>This is an unsupported element</div>;
  }
  renderToolbar() {
    return null;
  }

  renderMain() : JSX.Element {
    return (
      <PreformattedText
        editMode={false}
        onEdit={this.onEdit}
        src={beautify(this.props.model, null, 2, 100)}
        styleName="Unsupported-style"/>

    );
  }

}

export default Unsupported;
