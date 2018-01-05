import * as React from 'react';
import { ContentState } from 'draft-js';
import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';
import InlineInsertionToolbar from '../html/InlineInsertionToolbar';
import { InputLabel } from '../common/InputLabel';

export interface RichTextEditorProps extends AbstractContentEditorProps<ContentState> {
  label: string;
  showLabel?: boolean;
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
    const insertionToolbar = <InlineInsertionToolbar/>;

    const bodyStyle = {
      minHeight: '20px',
      borderStyle: 'none',
      borderWith: 1,
      borderColor: '#AAAAAA',
    };

    const editor = <HtmlContentEditor
            inline={this.props.inline}
            context={this.props.context}
            services={this.props.services}
            editMode={this.props.editMode}
            editorStyles={bodyStyle}
            inlineToolbar={inlineToolbar}
            inlineInsertionToolbar={insertionToolbar}
            blockToolbar={blockToolbar}
            model={new contentTypes.Html({ contentState: this.props.model })}
            onEdit={this.onEdit}
            />;

    const display = this.props.showLabel === undefined || this.props.showLabel
      ? <InputLabel label={this.props.label} style="default">
        {editor}
      </InputLabel>
      : editor;

    return (
      <div className="itemWrapper">
        {display}
      </div>
    );
  }

}

