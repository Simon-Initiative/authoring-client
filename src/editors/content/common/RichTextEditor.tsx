import * as React from 'react';
import * as Immutable from 'immutable';
import { ContentState, EditorState, ContentBlock, convertToRaw, SelectionState } from 'draft-js';
import * as contentTypes from '../../../data/contentTypes';
import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';
import { AppServices } from '../../common/AppServices';
import DraftWrapper from '../../content/common/draft/DraftWrapper';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import guid from '../../../utils/guid';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';
import { InputLabel } from '../common/InputLabel';


import '../common/editor.scss';

export interface RichTextEditor {

}

export interface RichTextEditorProps extends AbstractContentEditorProps<ContentState> {
  label: string;
  inline?: boolean;
}

export interface RichTextEditorState {

}

/**
 * The content editor for HtmlContent.
 */
export class RichTextEditor 
  extends AbstractContentEditor<ContentState, RichTextEditorProps, RichTextEditorState> {
    
  constructor(props) {
    super(props);

    this.onEdit = this.onEdit.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  onEdit(html: contentTypes.Html) {
    this.props.onEdit(html.contentState);
  }

  render() : JSX.Element {
    
    const inlineToolbar = <InlineToolbar/>;
    const blockToolbar = <BlockToolbar/>;

    const bodyStyle = {
      minHeight: '20px',
      borderStyle: 'none',
      borderWith: 1,
      borderColor: '#AAAAAA',
    };

    const style = {
      width: '80px',
    };

    return (
      <div className="itemWrapper">

      <InputLabel label={this.props.label} style="default">
          <HtmlContentEditor 
            inline={this.props.inline}
            context={this.props.context}
            services={this.props.services}
            editMode={this.props.editMode}
            editorStyles={bodyStyle}
            inlineToolbar={inlineToolbar}
            blockToolbar={blockToolbar}
            model={new contentTypes.Html({ contentState: this.props.model })}
            onEdit={this.onEdit} 
            />
        </InputLabel>

      </div>);
  }

}

