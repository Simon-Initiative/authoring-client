import * as React from 'react';

import { EntityTypes } from '../../../data/content/html/common';

import { ToolbarProps, Toolbar } from '../../content/common/toolbar/Toolbar';
import { ToolbarButton } from '../../content/common/toolbar/ToolbarButton';
import { flowInline } from '../../content/common/toolbar/Configs';


interface InlineToolbarProps extends ToolbarProps {  
  
}

export interface InlineToolbar {
  
}

export class InlineToolbar extends React.PureComponent<InlineToolbarProps, {}> {

  render() {
    return (
      <Toolbar {...this.props}>
        {flowInline()}
      </Toolbar>);
  }

}
