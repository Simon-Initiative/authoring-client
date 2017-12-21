import * as React from 'react';
import { EditorState } from 'draft-js';
import { HtmlToolbar } from './TypedToolbar';
import { ToolbarProps } from '../../content/common/toolbar/Toolbar';
import { flowBlock } from '../../content/common/toolbar/Configs';

interface BlockToolbarProps extends ToolbarProps<EditorState> {

}

interface BlockToolbar {

}


class BlockToolbar extends React.PureComponent<BlockToolbarProps, {}> {

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
        {[...flowBlock(), ...this.renderChildren()]}
      </HtmlToolbar>);
  }

}

export default BlockToolbar;


