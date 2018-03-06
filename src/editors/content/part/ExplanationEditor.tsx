import * as React from 'react';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { ContentElements } from 'data/content/common/elements';
import { ContentContainer } from 'editors/content/container/ContentContainer';

export interface ExplanationEditorProps extends AbstractContentEditorProps<ContentElements> {
  onEdit: (model: ContentElements) => void;
}

export interface ExplanationEditorState {
}

/**
 * The content editor for HtmlContent.
 */
export class ExplanationEditor
  extends AbstractContentEditor<ContentElements,
  ExplanationEditorProps, ExplanationEditorState> {

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }

  renderMain() : JSX.Element {
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
