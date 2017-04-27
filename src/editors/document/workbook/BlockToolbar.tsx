import * as React from 'react';

import { EditorState } from 'draft-js';

import { EntityTypes } from '../../../data/content/html/common';
import { HtmlToolbar, HtmlToolbarButton } from '../../content/html/TypedToolbar';
import { CommandProcessor } from '../../content/common/command';
import { ToolbarButton } from '../../content/common/toolbar/ToolbarButton';
import { ToolbarProps } from '../../content/common/toolbar/Toolbar';
import { flowBlock, bodyBlock } from '../../content/common/toolbar/Configs';

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
