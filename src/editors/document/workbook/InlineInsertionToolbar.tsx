import * as React from 'react';

import { EditorState } from 'draft-js';
import { HtmlToolbar } from '../../content/html/TypedToolbar';
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
