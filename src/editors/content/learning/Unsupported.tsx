import * as React from 'react';

import PreformattedText from './PreformattedText';
import './Unsupported.scss';

const beautify = require('json-beautify');

export interface UnsupportedProps {
  data: Object;
}

export interface UnsupportedState {

}

class Unsupported extends React.Component<UnsupportedProps, UnsupportedState> {

  constructor(props) {
    super(props, {});

    this.onEdit = this.onEdit.bind(this);
  }

  shouldComponentUpdate() {
    return false;
  }

  onEdit(data) {

  }

  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }

  renderMain() : JSX.Element {
    return (
      <PreformattedText
        editMode={false}
        onEdit={this.onEdit}
        src={beautify(this.props.data, null, 2, 100)}
        styleName="Unsupported-style"/>

    );
  }
}

export default Unsupported;
