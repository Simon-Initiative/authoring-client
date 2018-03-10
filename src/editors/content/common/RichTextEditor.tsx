import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import ContiguousTextEditor from '../learning/ContiguousTextEditor';
import { InputLabel } from '../common/InputLabel';

export interface RichTextEditorProps
  extends AbstractContentEditorProps<contentTypes.ContiguousText> {
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
  extends AbstractContentEditor<contentTypes.ContiguousText,
  RichTextEditorProps, RichTextEditorState> {

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

  onEdit(html: contentTypes.ContiguousText) {
    this.props.onEdit(html);
  }


  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }

  renderMain() : JSX.Element {

    const editor = <ContiguousTextEditor
            onUpdateContentSelection={() => {}}
            onFocus={this.props.onFocus}
            context={this.props.context}
            services={this.props.services}
            editMode={this.props.editMode}
            model={this.props.model}
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

