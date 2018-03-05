import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import DraftWrapper from '../../content/common/draft/DraftWrapper';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';

export interface ContiguousTextEditorProps
  extends AbstractContentEditorProps<contentTypes.ContiguousText> {

}

export interface ContiguousTextEditorState {


}

/**
 * The content editor for contiguous text.
 */
export default class ContiguousTextEditor
  extends AbstractContentEditor<contentTypes.ContiguousText,
    ContiguousTextEditorProps, ContiguousTextEditorState> {

  constructor(props) {
    super(props);

  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    if (nextProps.context !== this.props.context) {
      return true;
    }
    return false;
  }

  onFocus() {
    this.props.onFocus(this.props.model, this.props.parent);
  }

  render() : JSX.Element {

    const ignoreSelection = () => {};

    return (
      <div className="contiguous-text" onFocus={this.onFocus.bind(this)}>

          <DraftWrapper
            activeItemId=""
            editorStyles={{}}
            onSelectionChange={ignoreSelection}
            services={this.props.services}
            context={this.props.context}
            content={this.props.model}
            undoRedoGuid={this.props.context.undoRedoGuid}
            locked={!this.props.editMode}
            onEdit={c => this.props.onEdit(c, c)} />

      </div>);
  }

}

