import * as React from 'react';
import { EditorState } from 'draft-js';
import * as contentTypes from '../../../data/contentTypes';
import { Command, CommandProcessor } from '../common/command';
import DraftWrapper from '../../content/common/draft/DraftWrapper';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';


export type ChangePreviewer = (
  current: contentTypes.Html,
  next: contentTypes.Html) => contentTypes.Html;

export interface HtmlContentEditorProps extends AbstractContentEditorProps<contentTypes.Html> {

  inlineToolbar: any;

  inlineInsertionToolbar: any;

  blockToolbar: any;

  inline?: boolean;

  editorStyles?: Object;

  changePreviewer?: ChangePreviewer;

  activeItemId?: string;

  showBorder?: boolean;
}

export interface HtmlContentEditorState {

  hasError: boolean;
}

/**
 * The content editor for HtmlContent.
 */
export class HtmlContentEditor
  extends AbstractContentEditor<contentTypes.Html, HtmlContentEditorProps, HtmlContentEditorState>
  implements CommandProcessor<EditorState> {
  container: any;
  draft: any;

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.container = null;
    this.draft = null;

    this.state = { hasError: false };
  }



  onChange(content: contentTypes.Html) {
    this.props.onEdit(content);
  }

  onSelectionChange(selectionState) {

  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    if (nextProps.activeItemId !== this.props.activeItemId) {
      return true;
    }
    if (nextProps.context !== this.props.context) {
      return true;
    }
    return false;
  }

  process(command: Command<EditorState>) {
    this.draft.process(command);
  }


  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });
    console.log(error);
  }

  checkPrecondition(command: Command<EditorState>) {
    return this.draft.checkPrecondition(command);
  }

  render() : JSX.Element {

    const classes = this.props.showBorder === undefined
      || !this.props.showBorder ? 'form-control' : '';

    return (
      <div className={classes}>

          <DraftWrapper
            ref={draft => this.draft = draft}
            inlineOnlyMode={this.props.inline}
            activeItemId={this.props.activeItemId}
            changePreviewer={this.props.changePreviewer}
            editorStyles={this.props.editorStyles}
            inlineToolbar={this.props.inlineToolbar}
            inlineInsertionToolbar={this.props.inlineInsertionToolbar}
            blockToolbar={this.props.blockToolbar}
            onSelectionChange={this.onSelectionChange.bind(this)}
            services={this.props.services}
            context={this.props.context}
            content={this.props.model}
            undoRedoGuid={this.props.context.undoRedoGuid}
            locked={!this.props.editMode || this.state.hasError}
            onEdit={this.onChange} />

      </div>);
  }

}

