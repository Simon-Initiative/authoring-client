import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { withStyles, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import DraftWrapper from 'editors/content/common/draft/DraftWrapper';
import {
  AbstractContentEditor, AbstractContentEditorProps, RenderContext,
} from 'editors/content/common/AbstractContentEditor';
import ContiguousTextToolbar
  from 'editors/content/learning/contiguoustext/ContiguousTextToolbar.controller';
import { Maybe } from 'tsmonad';
import { TextSelection, Trigger } from 'types/active';
import { getEditorByContentType } from 'editors/content/container/registry';
import { ContiguousTextMode } from 'data/content/learning/contiguous';
import { styles } from 'editors/content/learning/contiguoustext/ContiguousText.styles';


export interface ContiguousTextEditorProps
  extends AbstractContentEditorProps<contentTypes.ContiguousText> {
  viewOnly?: boolean;
  editorStyles?: any;
  hideBorder?: boolean;
  onTextSelectionChange?: (selection: any) => void;
  onInsertParsedContent: (resourcePath: string, o) => void;

  // Optional callback for tracking entity selections. It is up to the
  // entity impl to determine how it interprets 'selection'
  onEntitySelected?: (key: string, data: Object) => void;

  // Optional active entity key
  selectedEntity?: Maybe<string>;
}

export interface ContiguousTextEditorState {

}

type StyledContiguousTextEditorProps =
  StyledComponentProps<ContiguousTextEditorProps, typeof styles>;

/**
 * The content editor for contiguous text.
 */
class ContiguousTextEditor
  extends AbstractContentEditor<contentTypes.ContiguousText,
  StyledContiguousTextEditorProps, ContiguousTextEditorState> {

  selectionState: any;

  constructor(props) {
    super(props);

    this.draftDrivenFocus = this.draftDrivenFocus.bind(this);
  }

  shouldComponentUpdate(nextProps: StyledContiguousTextEditorProps) {
    return nextProps.model !== this.props.model
      || nextProps.selectedEntity !== this.props.selectedEntity;
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

  draftDrivenFocus(model, parent, selection, keypress) {
    this.props.onTextSelectionChange && this.props.onTextSelectionChange(selection);
    const textSelection = new TextSelection(selection);
    textSelection.triggeredBy = keypress ? Trigger.KEYPRESS : Trigger.OTHER;

    this.props.onFocus(model, parent, Maybe.just(textSelection));
  }

  renderMain(): JSX.Element {
    const { className, classes, model, parent, editMode, viewOnly,
      hideBorder = false, editorStyles } = this.props;

    const showBorder = !viewOnly && !hideBorder;

    return (
      <div
        className={classNames([
          'contiguousTextEditor', classes.contiguousText,
          showBorder && classes.showBorder,
          !editMode && classes.disabled,
          viewOnly && classes.viewOnly, className])}>

        <DraftWrapper
          selectedEntity={this.props.selectedEntity}
          onEntitySelected={this.props.onEntitySelected}
          onInsertParsedContent={o =>
            this.props.onInsertParsedContent(this.props.context.resourcePath, o)}
          singleBlockOnly={model.mode === ContiguousTextMode.SimpleText}
          parentProps={this.props}
          parent={this}
          editorStyles={Object.assign({}, editorStyles)}
          onSelectionChange={(selection, keypress) =>
            this.draftDrivenFocus(model, parent, selection, keypress)}
          services={this.props.services}
          context={this.props.context}
          content={this.props.model}
          locked={!editMode || viewOnly}
          onEdit={(c, s) => this.props.onEdit(c, s === undefined ? c : s)} />

      </div>
    );
  }
}

const StyledContiguousTextEditor = withStyles<ContiguousTextEditorProps>(styles)
  (ContiguousTextEditor);
export default StyledContiguousTextEditor;
