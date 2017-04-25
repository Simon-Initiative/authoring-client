import * as React from 'react';

import { EntityTypes } from '../../../data/content/html/common';

import { ToolbarProps, Toolbar, ToolbarActionProvider } from '../../content/common/toolbar/Toolbar';
import { ToolbarButton } from '../../content/common/toolbar/ToolbarButton';
import { flowBlock, bodyBlock } from '../../content/common/toolbar/Configs';

interface BlockToolbarProps extends ToolbarProps {  
  
}

export interface BlockToolbar {
  
}

export class BlockToolbar extends React.PureComponent<BlockToolbarProps, {}> {

  render() {
    return (
      <Toolbar {...this.props}>
        {flowBlock()}
        {bodyBlock()}
      </Toolbar>);
  }

}
