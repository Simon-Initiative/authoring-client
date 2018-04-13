import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import DraftWrapper from 'editors/content/common/draft/DraftWrapper';
import {
  AbstractContentEditor, AbstractContentEditorProps, RenderContext,
} from 'editors/content/common/AbstractContentEditor';
import ContiguousTextToolbar from './ContiguousTextToolbar.controller';
import { Maybe } from 'tsmonad';
import { TextSelection } from 'types/active';
import { getEditorByContentType } from 'editors/content/container/registry';
import { ContiguousTextMode } from 'data/content/learning/contiguous';
import { styles } from './ContiguousText.styles';

export interface ContiguousTextEditorProps
  extends AbstractContentEditorProps<contentTypes.ContiguousText> {
  viewOnly?: boolean;
  editorStyles?: any;
  hideBorder?: boolean;
  onTextSelectionChange?: (selection: any) => void;
}

export interface ContiguousTextEditorState {

}

/**
 * The content editor for contiguous text.
 */
@injectSheet(styles)
export default class ContiguousTextEditor
    extends AbstractContentEditor<contentTypes.ContiguousText,
    StyledComponentProps<ContiguousTextEditorProps>, ContiguousTextEditorState> {

  selectionState: any;

  constructor(props) {
    super(props);

    this.draftDrivenFocus = this.draftDrivenFocus.bind(this);
  }

  shouldComponentUpdate(nextProps: StyledComponentProps<ContiguousTextEditorProps>) {

    return nextProps.model !== this.props.model;
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

  handleOnClick(e) {
    // Override to defer to DraftWrapper selection change
    e.stopPropagation();
  }

  draftDrivenFocus(model, parent, selection) {
    this.props.onTextSelectionChange && this.props.onTextSelectionChange(selection);
    this.props.onFocus(model, parent, Maybe.just(new TextSelection(selection)));
  }

  renderMain() : JSX.Element {

    const { className, classes, model, parent, editMode, viewOnly,
      hideBorder = false, editorStyles } = this.props;

    const showBorder = !viewOnly && !hideBorder;

    return (
      <div
        className={classNames([
          'contiguousTextEditor', classes.contiguousText,
          showBorder && classes.showBorder,
          viewOnly && classes.viewOnly, className])}>

          <DraftWrapper
            singleBlockOnly={model.mode === ContiguousTextMode.SimpleText}
            activeItemId=""
            editorStyles={Object.assign({}, editorStyles)}
            onSelectionChange={selection => this.draftDrivenFocus(model, parent, selection)}
            services={this.props.services}
            context={this.props.context}
            content={this.props.model}
            locked={!editMode || viewOnly}
            onEdit={c => this.props.onEdit(c, c)} />

      </div>
    );
  }
}
