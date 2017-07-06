import * as React from 'react';

import { EditorState } from 'draft-js';

import { EntityTypes } from '../../../data/content/html/common';
import { HtmlToolbar, HtmlToolbarButton } from '../../content/html/TypedToolbar';
import { CommandProcessor } from '../../content/common/command';
import { ToolbarButton } from '../../content/common/toolbar/ToolbarButton';
import { ToolbarProps } from '../../content/common/toolbar/Toolbar';
import { flowInsertion } from '../../content/common/toolbar/Configs';

interface InlineInsertionToolbarProps extends ToolbarProps<EditorState> {  
  
}

interface InlineInsertionToolbar {
  
}

class InlineInsertionToolbar extends React.PureComponent<InlineInsertionToolbarProps, {}> {

  render() {
    return (
      <HtmlToolbar {...this.props}>
        {flowInsertion()}
      </HtmlToolbar>);
  }

}


export default InlineInsertionToolbar;
