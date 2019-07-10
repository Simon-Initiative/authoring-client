import * as React from 'react';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ContentElements } from 'data/content/common/elements';
import { ContentContainer } from 'editors/content/container/ContentContainer';

export interface ExplanationEditorProps extends AbstractContentEditorProps<ContentElements> {
  onEdit: (model: ContentElements, src) => void;
}

export interface ExplanationEditorState {
}

/**
 * The content editor for HtmlContent.
 */
export abstract class ExplanationEditor
  extends AbstractContentEditor<ContentElements,
  ExplanationEditorProps, ExplanationEditorState> {

  constructor(props: ExplanationEditorProps) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <div className="explanation-editor">
        <ContentContainer
          {...this.props}
          model={this.props.model}
          onEdit={this.props.onEdit} />
      </div>
    );
  }
}
