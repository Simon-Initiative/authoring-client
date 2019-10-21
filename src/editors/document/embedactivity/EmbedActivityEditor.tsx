import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import {
  AbstractEditor, AbstractEditorProps, AbstractEditorState,
} from 'editors/document/common/AbstractEditor';
import * as models from 'data/models';
import { ContextAwareToolbar } from 'components/toolbar/ContextAwareToolbar.controller';
import { ContextAwareSidebar } from 'components/sidebar/ContextAwareSidebar.controller';
import { ActiveContext, ParentContainer, TextSelection } from 'types/active';
import * as Messages from 'types/messages';
import { ContentElement } from 'data/content/common/interfaces';
import { Node } from 'data/content/assessment/node';
import { SidebarToggle } from 'editors/common/SidebarToggle.controller';
import { CourseState } from 'reducers/course';
import { ReplEditor } from 'editors/content/learning/repl/ReplEditor';
import './EmbedActivityEditor.scss';

interface Props extends AbstractEditorProps<models.EmbedActivityModel> {
  activeContext: ActiveContext;
  onUpdateContent: (documentId: string, content: ContentElement) => void;
  onUpdateContentSelection: (
    documentId: string, content: ContentElement, container: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
  hover: string;
  onUpdateHover: (hover: string) => void;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  course: CourseState;
  onSetCurrentNode: (documentId: string, node: Node) => void;
}

interface State extends AbstractEditorState {

}

export default class EmbedActivityEditor
  extends AbstractEditor<models.EmbedActivityModel, Props, State> {

  state: State = {
    ...this.state,
  };

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    return this.props.model !== nextProps.model
      || this.props.activeContext !== nextProps.activeContext
      || this.props.expanded !== nextProps.expanded
      || this.props.editMode !== nextProps.editMode
      || this.props.hover !== nextProps.hover
      || this.state.undoStackSize !== nextState.undoStackSize
      || this.state.redoStackSize !== nextState.redoStackSize;
  }

  supportedElements: Immutable.List<string> = Immutable.List<string>();

  onTitleEdit = (title: string, src: ContentElement) => {
    const { model, onEdit } = this.props;

    onEdit(model.with({ title }));
  }

  onRemove() {
    // this method is never used, but is required by ParentContainer
    // do nothing
  }

  onPaste(childModel) {
    // this method is never used, but is required by ParentContainer
    // do nothing
  }

  onDuplicate(childModel) {
    // this method is never used, but is required by ParentContainer
    // do nothing
  }

  onMoveUp(childModel) {
    // this method is never used, but is required by ParentContainer
    // do nothing
  }

  onMoveDown(childModel) {
    // this method is never used, but is required by ParentContainer
    // do nothing
  }

  onFocus = (
    model: ContentElement, parent: ParentContainer, textSelection: Maybe<TextSelection>) => {
    this.props.onUpdateContentSelection(
      this.props.context.documentId, model, parent, textSelection);
  }

  unFocus = () => {
    this.props.onUpdateContentSelection(
      this.props.context.documentId, null, null, Maybe.nothing());
  }

  render() {
    const { context, services, editMode, model, course, onEdit } = this.props;

    return (
      <div className="feedback-editor">
        <ContextAwareToolbar editMode={editMode} context={context} model={model} />
        <div className="feedback-content">
          <div className="html-editor-well" onClick={() => this.unFocus()}>
            <SidebarToggle />

            {/* <TitleTextEditor
              context={context}
              services={services}
              onFocus={() => this.unFocus()}
              model={(model.title.text.content.first() as ContiguousText)}
              editMode={editMode}
              onEdit={this.onTitleEdit}
              editorStyles={{ fontSize: 32 }} /> */}

            <div className="embed-activity-container">
              {course.embedActivityTypes.has(model.resource.id)
                ? (
                  <ReplEditor
                    {...this.props}
                    onShowSidebar={() => {}}
                    onDiscover={() => {}}
                    onFocus={() => {}}
                    activeContentGuid={''} />
                )
                : (
                  <div>Embed Activity [Activity Type Not Supported]</div>
                )
              }
            </div>
          </div>
          <ContextAwareSidebar
            context={context}
            services={services}
            editMode={editMode}
            model={model}
            onEditModel={onEdit} />
        </div>
      </div>);
  }
}
