import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, JSSProps } from 'styles/jss';
import DraftWrapper from 'editors/content/common/draft/DraftWrapper';
import {
  AbstractContentEditor, AbstractContentEditorProps, RenderContext,
} from 'editors/content/common/AbstractContentEditor';
import ContiguousTextToolbar from './ContiguousTextToolbar.controller';
import { Maybe } from 'tsmonad';
import { TextSelection, ParentContainer } from 'types/active';

import styles from './ContiguousTextEditor.styles';


export interface ContiguousTextEditorProps
  extends AbstractContentEditorProps<contentTypes.ContiguousText> {
  onUpdateContentSelection: (
    documentId: string, content: Object,
    parent: ParentContainer, textSelection: Maybe<TextSelection>) => void;
}

export interface ContiguousTextEditorState {

}

/**
 * The content editor for contiguous text.
 */
@injectSheet(styles)
export default class ContiguousTextEditor
  extends AbstractContentEditor<contentTypes.ContiguousText,
    ContiguousTextEditorProps & JSSProps, ContiguousTextEditorState> {

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

  renderSidebar() {
    return <ContiguousTextToolbar {...this.props} renderContext={RenderContext.Sidebar} />;
  }

  renderToolbar() {
    return <ContiguousTextToolbar {...this.props} renderContext={RenderContext.Toolbar} />;
  }

  handleOnFocus(e) {
    // We override the parent implementation, and instead
    // defer to the DraftWrapper onSelectionChange for
    // broadcast of the change in content selection
    e.stopPropagation();
  }

  renderMain() : JSX.Element {

    const { context, model, parent } = this.props;

    const broadcastSelection = (selection) => {
      this.props.onUpdateContentSelection(
        context.documentId, model, parent, Maybe.just(new TextSelection(selection)));
    };

    const { classes } = this.props;

    return (
      <div className={classes.contiguousText}>

          <DraftWrapper
            activeItemId=""
            editorStyles={{}}
            onSelectionChange={broadcastSelection}
            services={this.props.services}
            context={this.props.context}
            content={this.props.model}
            undoRedoGuid={this.props.context.undoRedoGuid}
            locked={!this.props.editMode}
            onEdit={c => this.props.onEdit(c, c)} />

      </div>);
  }

}

