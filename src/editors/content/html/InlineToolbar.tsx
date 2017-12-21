import * as React from 'react';

import { EditorState } from 'draft-js';

import { EntityTypes } from '../../../data/content/html/common';
import { HtmlToolbar, HtmlToolbarButton } from './TypedToolbar';
import { ToolbarButton } from '../../content/common/toolbar/ToolbarButton';
import { ToolbarProps } from '../../content/common/toolbar/Toolbar';
import { flowInline } from '../../content/common/toolbar/Configs';

interface InlineToolbarProps extends ToolbarProps<EditorState> {

}

interface InlineToolbar {

}

class InlineToolbar extends React.PureComponent<InlineToolbarProps, {}> {

  renderChildren() {
    if (React.Children.count(this.props.children) > 0) {
      return React.Children.map(this.props.children, (child) => {
        return React.cloneElement(child as any);
      });
    } else {
      return [];
    }
  }

  render() {
    return (
      <HtmlToolbar {...this.props}>
        {[...flowInline(), ...this.renderChildren()]}
      </HtmlToolbar>);
  }

}

export default InlineToolbar;
