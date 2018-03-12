import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, classNames, JSSProps } from 'styles/jss';
import DraftWrapper from 'editors/content/common/draft/DraftWrapper';
import {
  AbstractContentEditor, AbstractContentEditorProps, RenderContext,
} from 'editors/content/common/AbstractContentEditor';

import ContiguousTextToolbar from './ContiguousTextToolbar.controller';
import { Maybe } from 'tsmonad';
import { TextSelection } from 'types/active';
import { getEditorByContentType } from 'editors/content/container/registry';

import styles from './ContiguousTextEditor.styles';

export interface ContiguousTextEditorProps
  extends AbstractContentEditorProps<contentTypes.ContiguousText> {

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

  renderActiveEntity(entity) {

    const { key, data } = entity;

    const props = {
      ...this.props,
      renderContext: RenderContext.Sidebar,
      onFocus: (c, p) => true,
      model: data,
      onEdit: (updated) => {
        this.props.onEdit(this.props.model.updateEntity(key, updated));
      },
    };

    return React.createElement(
      getEditorByContentType((data as any).contentType), props);

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
    // broadcast of the change in content selection so that
    // we can get our hands on the text selection
    e.stopPropagation();
  }

  renderMain() : JSX.Element {

    const { model, parent } = this.props;

    const draftDrivenFocus = (selection) => {
      this.props.onFocus(model, parent, Maybe.just(new TextSelection(selection)));
    };

    const { classes } = this.props;

    return (
      <div className={classNames(['contiguousTextEditor', classes.contiguousText])}>

          <DraftWrapper
            activeItemId=""
            editorStyles={{}}
            onSelectionChange={draftDrivenFocus}
            services={this.props.services}
            context={this.props.context}
            content={this.props.model}
            undoRedoGuid={this.props.context.undoRedoGuid}
            locked={!this.props.editMode}
            onEdit={c => this.props.onEdit(c, c)} />

      </div>);
  }

}

