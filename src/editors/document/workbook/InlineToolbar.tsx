import * as React from 'react';

import { EditorState } from 'draft-js';
import { HtmlToolbar } from '../../content/html/TypedToolbar';
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
