import * as React from 'react';

import { EditorState } from 'draft-js';
import { HtmlToolbar } from './TypedToolbar';
import { ToolbarProps } from '../../content/common/toolbar/Toolbar';
import { flowInsertion } from '../../content/common/toolbar/Configs';

interface InlineInsertionToolbarProps extends ToolbarProps<EditorState> {

}

interface InlineInsertionToolbar {

}

class InlineInsertionToolbar extends React.PureComponent<InlineInsertionToolbarProps, {}> {

  renderChildren() {
    if (React.Children.count(this.props.children) > 0) {
      return React.Children.map(this.props.children, (child) => {
        return React.cloneElement(child as any);
      });
    }

    return [];
  }

  render() {
    return (
      <HtmlToolbar {...this.props}>
        {[...flowInsertion(), ...this.renderChildren()]}
      </HtmlToolbar>);
  }

}


export default InlineInsertionToolbar;
