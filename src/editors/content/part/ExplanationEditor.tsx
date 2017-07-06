import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import guid from '../../../utils/guid';
import InlineToolbar from '../html/InlineToolbar';
import InlineInsertionToolbar from '../html/InlineInsertionToolbar';
import BlockToolbar from '../html/BlockToolbar';
import { Collapse } from '../common/controls';

import '../common/editor.scss';

export interface ExplanationEditor {
  
}

export interface ExplanationEditorProps extends AbstractContentEditorProps<contentTypes.Html> {
  onEdit: (model: contentTypes.Html) => void;
}

export interface ExplanationEditorState {
}

/**
 * The content editor for HtmlContent.
 */
export class ExplanationEditor 
  extends AbstractContentEditor<contentTypes.Html, ExplanationEditorProps, ExplanationEditorState> {
    
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  render() : JSX.Element {
    
    const inlineToolbar = <InlineToolbar/>;
    const blockToolbar = <BlockToolbar/>;
    const insertionToolbar = <InlineInsertionToolbar/>;

    const bodyStyle = {
      minHeight: '20px',
      borderStyle: 'none',
      borderWith: 1,
      borderColor: '#AAAAAA'
    }

    return (
      <Collapse caption='Explanation'>
        <HtmlContentEditor 
          editorStyles={bodyStyle}
          inlineToolbar={inlineToolbar}
          blockToolbar={blockToolbar}
          inlineInsertionToolbar={insertionToolbar}
          {...this.props}
          model={this.props.model}
          onEdit={this.props.onEdit} 
          />
      </Collapse>);
  }

}

