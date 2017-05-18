import * as React from 'react';

import { EditorState } from 'draft-js';

import { EntityTypes } from '../../../data/content/html/common';
import { HtmlToolbar, HtmlToolbarButton } from '../../content/html/TypedToolbar';
import { CommandProcessor } from '../../content/common/command';
import { ToolbarButton } from '../../content/common/toolbar/ToolbarButton';
import { ToolbarProps } from '../../content/common/toolbar/Toolbar';
import { flowInline } from '../../content/common/toolbar/Configs';

interface InlineToolbarProps extends ToolbarProps<EditorState> {  
  
}

interface InlineToolbar {
  
}

class InlineToolbar extends React.PureComponent<InlineToolbarProps, {}> {

  render() {
    return (
      <HtmlToolbar {...this.props}>
        {flowInline()}
      </HtmlToolbar>);
  }

}


export default InlineToolbar;
