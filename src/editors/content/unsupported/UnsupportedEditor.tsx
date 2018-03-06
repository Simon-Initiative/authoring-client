import * as React from 'react';

import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';

export interface UnsupportedEditorProps
  extends AbstractContentEditorProps<contentTypes.Unsupported> {

}

export class UnsupportedEditor
  extends AbstractContentEditor<contentTypes.Unsupported, UnsupportedEditorProps, {}> {


  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }

  renderMain() : JSX.Element {
    return <div className="unsupported-editor">{JSON.stringify(this.props.model.data)}</div>;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }

    return false;
  }

}

