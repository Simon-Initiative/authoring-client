import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { Title }  from '../../../data/content/html/title';
import { Caption }  from '../../../data/content/html/caption';
import { Cite }  from '../../../data/content/html/cite';
import { Html } from '../../../data/content/html';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import guid from '../../../utils/guid';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';
import { RichTextEditor } from '../common/RichTextEditor';

import '../common/editor.scss';

export type LabeledType = {
  titleContent: Title,
  caption: Caption,
  cite: Cite,
};

export interface LabeledEditor {
  
}

export interface LabeledEditorProps extends AbstractContentEditorProps<LabeledType> {
  
}

export interface LabeledEditorState {

}

/**
 * The content editor for Table.
 */
export class LabeledEditor 
  extends AbstractContentEditor<LabeledType, LabeledEditorProps, LabeledEditorState> {
    
  constructor(props) {
    super(props);
    
    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onCaptionEdit = this.onCaptionEdit.bind(this);
    this.onCiteEdit = this.onCiteEdit.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  onTitleEdit(content) {
    this.props.onEdit({
      titleContent: this.props.model.titleContent.with({ content }),
      caption: this.props.model.caption,
      cite: this.props.model.cite,
    });
  }

  onCaptionEdit(content) {
    this.props.onEdit({
      titleContent: this.props.model.titleContent,
      caption: this.props.model.caption.with({ content }),
      cite: this.props.model.cite,
    });
  }

  onCiteEdit(content) {
    this.props.onEdit({
      titleContent: this.props.model.titleContent,
      caption: this.props.model.caption,
      cite: this.props.model.cite.with({ content }),
    });
  }

  render() : JSX.Element {

    const { titleContent, caption, cite } = this.props.model;

    const inlineToolbar = <InlineToolbar/>;
    const blockToolbar = <BlockToolbar/>;

    return (
      <div>
        <RichTextEditor
          label="Title"
          {...this.props}
          onEdit={this.onTitleEdit}
          model={titleContent.content}
        />
        <RichTextEditor
          label="Caption"
          {...this.props}
          onEdit={this.onCaptionEdit}
          model={caption.content}
        />
        <RichTextEditor
          label="Cite"
          {...this.props}
          onEdit={this.onCiteEdit}
          model={cite.content}
        />
      </div>);
  }

}

