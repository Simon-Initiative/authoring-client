import * as React from 'react';

import { EditorState } from 'draft-js';
import { HtmlToolbar } from '../../content/html/TypedToolbar';
import { ToolbarProps } from '../../content/common/toolbar/Toolbar';
import { bodyBlock, flowBlock } from '../../content/common/toolbar/Configs';

interface BlockToolbarProps extends ToolbarProps<EditorState> {  
  
}

interface BlockToolbar {
  
}

class BlockToolbar extends React.PureComponent<BlockToolbarProps, {}> {

  render() {
    return (
      <HtmlToolbar {...this.props}>
        {[...flowBlock(), ...bodyBlock()]}
      </HtmlToolbar>);
  }

}

export default BlockToolbar;
