import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { AlternativeFlowContent } from 'data/content/assessment/types/flow';
import { ContentContainer } from 'editors/content/container/ContentContainer';

export interface ExplanationEditorProps extends AbstractContentEditorProps<AlternativeFlowContent> {
  onEdit: (model: AlternativeFlowContent) => void;
}

export interface ExplanationEditorState {
}

/**
 * The content editor for HtmlContent.
 */
export class ExplanationEditor
  extends AbstractContentEditor<AlternativeFlowContent,
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

  render() : JSX.Element {
    const bodyStyle = {
      minHeight: '20px',
      borderStyle: 'none',
      borderWith: 1,
      borderColor: '#AAAAAA',
    };

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
