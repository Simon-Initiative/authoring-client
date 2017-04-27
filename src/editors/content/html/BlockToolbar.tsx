import * as React from 'react';
import { EditorState } from 'draft-js';

import { EntityTypes } from '../../../data/content/html/common';
import { HtmlToolbar, HtmlToolbarButton } from './TypedToolbar';
import { ToolbarButton } from '../../content/common/toolbar/ToolbarButton';
import { ToolbarProps } from '../../content/common/toolbar/Toolbar';
import { flowBlock, bodyBlock } from '../../content/common/toolbar/Configs';

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
    } else {
      return [];
    }
  }

  render() {
    return (
      <HtmlToolbar {...this.props}>
        {[...flowBlock(), ...this.renderChildren()]}
      </HtmlToolbar>);
  }

}

export default BlockToolbar;


