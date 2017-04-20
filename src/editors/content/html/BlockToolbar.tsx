import * as React from 'react';

import { EntityTypes } from '../../../data/content/html/common';

import { ToolbarProps, Toolbar, ToolbarActionProvider } from '../../content/common/toolbar/Toolbar';
import { ToolbarButton } from '../../content/common/toolbar/ToolbarButton';
import { flowBlock, bodyBlock } from '../../content/common/toolbar/Configs';

interface BlockToolbarProps extends ToolbarProps {  
  
}

interface BlockToolbar {
  
}

class BlockToolbar extends React.PureComponent<BlockToolbarProps, {}> {

  render() {
    return (
      <Toolbar {...this.props}>
        {flowBlock()}
      </Toolbar>);
  }

}

export default BlockToolbar;


