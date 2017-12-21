import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import InlineToolbar from '../html/InlineToolbar';
import InlineInsertionToolbar from '../html/InlineInsertionToolbar';
import BlockToolbar from '../html/BlockToolbar';

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
    const bodyStyle = {
      minHeight: '20px',
      borderStyle: 'none',
      borderWith: 1,
      borderColor: '#AAAAAA',
    };

    return (
      <div className="explanation-editor">
        <HtmlContentEditor
          editorStyles={bodyStyle}
          inlineToolbar={<InlineToolbar/>}
          blockToolbar={<BlockToolbar/>}
          inlineInsertionToolbar={<InlineInsertionToolbar/>}
          {...this.props}
          model={this.props.model}
          onEdit={this.props.onEdit} />
      </div>
    );
  }
}
