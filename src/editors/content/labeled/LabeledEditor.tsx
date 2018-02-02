import * as React from 'react';
import { Title } from '../../../data/content/learning/title';
import { Caption } from '../../../data/content/learning/caption';
import { Cite } from '../../../data/content/learning/cite';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { RichTextEditor } from '../common/RichTextEditor';

export type LabeledType = {
  titleContent: Title,
  caption: Caption,
  cite: Cite,
};

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
      titleContent: this.props.model.titleContent.with({ text: content }),
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

    return (
      <div>
        <RichTextEditor
          label="Title"
          {...this.props}
          onEdit={this.onTitleEdit}
          inline={true}
          model={titleContent.text}
        />
        <RichTextEditor
          label="Caption"
          {...this.props}
          onEdit={this.onCaptionEdit}
          inline={true}
          model={caption.content}
        />
        <RichTextEditor
          label="Cite"
          {...this.props}
          onEdit={this.onCiteEdit}
          inline={true}
          model={cite.content}
        />
      </div>);
  }

}

