import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import {
  AbstractEditor, AbstractEditorProps, AbstractEditorState,
} from 'editors/document/common/AbstractEditor';
import * as models from 'data/models';
import * as contentTypes from 'data/contentTypes';
import { LegacyTypes } from 'data/types';
import guid from 'utils/guid';
import {
  locateNextOfKin, findNodeByGuid,
} from 'editors/document/assessment/utils';
import { AddQuestion } from 'editors/content/question/addquestion/AddQuestion.controller';
import { AssessmentNodeRenderer } from 'editors/document/common/questions';
import { getChildren, Outline, setChildren }
  from 'editors/document/assessment/outline/Outline';
import { updateNode, removeNode } from 'data/utils/tree';
import { ContextAwareToolbar } from 'components/toolbar/ContextAwareToolbar.controller';
import { ContextAwareSidebar } from 'components/sidebar/ContextAwareSidebar.controller';
import { ActiveContext, ParentContainer, TextSelection } from 'types/active';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import * as Messages from 'types/messages';
import { ContentElement } from 'data/content/common/interfaces';
import { Node } from 'data/content/assessment/node';
import { FeedbackQuestion } from 'data/content/feedback/feedback_questions';

import './EmbedActivityEditor.scss';
import { SidebarToggle } from 'editors/common/SidebarToggle.controller';
import { CourseState } from 'reducers/course';

interface Props extends AbstractEditorProps<models.FeedbackModel> {
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
  currentNode: models.FeedbackQuestionNode;
  onSetCurrentNode: (documentId: string, node: Node) => void;
}

interface State extends AbstractEditorState {
  collapseInsertPopup: boolean;
}

export default class EmbedActivityEditor extends AbstractEditor<models.FeedbackModel, Props, State> {

  state: State = {
    ...this.state,
    collapseInsertPopup: true,
  };

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    return this.props.model !== nextProps.model
      || this.props.activeContext !== nextProps.activeContext
      || this.props.expanded !== nextProps.expanded
      || this.props.editMode !== nextProps.editMode
      || this.props.hover !== nextProps.hover
      || this.props.currentNode !== nextProps.currentNode
      || this.state.undoStackSize !== nextState.undoStackSize
      || this.state.redoStackSize !== nextState.redoStackSize
      || this.state.collapseInsertPopup !== nextState.collapseInsertPopup;
  }

  componentWillReceiveProps(nextProps: Props) {
    this.checkActiveNodeStillExists(nextProps);
  }

  supportedElements: Immutable.List<string> = Immutable.List<string>();

  checkActiveNodeStillExists = (nextProps: Props) => {
    // Handle the case that the current node has changed externally,
    // for instance, from an undo/redo
    const { activeContext, onSetCurrentNode, currentNode, model } = this.props;

    if (this.props.currentNode === nextProps.currentNode && this.props.model !== nextProps.model) {

      const documentId = activeContext.documentId.valueOr(null);

      findNodeByGuid(this.allNodes(nextProps.model), currentNode.guid)
        .caseOf({
          just: currentNode => Maybe.just(onSetCurrentNode(documentId, currentNode)),
          nothing: () => locateNextOfKin(model.questions, currentNode.guid)
            .lift(node => onSetCurrentNode(documentId, node)),
        });
    }
  }

  onTitleEdit = (ct: ContiguousText, src: ContentElement) => {
    const { model, onEdit } = this.props;
    const t = ct.extractPlainText().valueOr('');

    onEdit(model.with({
      title: model.title.with({
        text: model.title.text.with({
          content: model.title.text.content.set(ct.guid, ct),
        }),
      }),
      resource: model.resource.with({ title: t }),
    }));
  }

  onEditNode = (guid: string, node: FeedbackQuestion, src: ContentElement) => {
    const { activeContext, context, model, onUpdateContent, onSetCurrentNode } = this.props;

    const nodes = model.questions.questions;

    onSetCurrentNode(activeContext.documentId.valueOr(null), node);
    onUpdateContent(context.documentId, src);

    this.handleEdit(model.with({
      questions: model.questions.with({
        questions: updateNode(
          guid, node, nodes, getChildren,
          setChildren) as Immutable.OrderedMap<string, FeedbackQuestion>,
      }),
    }));
  }

  // This handles updates from the outline component, which are only reorders
  onEditNodes = (
    questions: Immutable.OrderedMap<string, models.FeedbackQuestionNode>) => {

    const { model } = this.props;

    this.handleEdit(model.with({
      questions: model.questions.with({
        questions,
      }),
    }));
  }

  onChangeExpansion = (nodes: Immutable.Set<string>) => {
    // Nothing to do here, as we are not allowing changing the
    // expanded state of nodes in the outline
  }

  onSelect = (selectedNode: contentTypes.Node) => {
    const { activeContext, onSetCurrentNode } = this.props;

    const documentId = activeContext.documentId.valueOr(null);

    onSetCurrentNode(documentId, selectedNode);
  }

  allNodes(model: models.FeedbackModel = this.props.model): Immutable.OrderedMap<string, Node> {
    return model.questions.questions;
  }

  canRemoveNode() {
    return this.allNodes().size > 1;
  }

  onNodeRemove = (guid: string) => {
    // Find the node to be removed, remove it, and set an adjacent node to be active.

    const { model, activeContext, onSetCurrentNode } = this.props;
    const documentId = activeContext.documentId.valueOr(null);

    // Prevent the last node from being removed
    if (this.allNodes().size <= 1) {
      return;
    }

    locateNextOfKin(this.allNodes(), guid).lift((node) => {
      onSetCurrentNode(documentId, node);
    });

    this.handleEdit(
      model.with({
        questions:
          model.questions.with({
            questions: removeNode(guid, this.allNodes(), getChildren, setChildren) as
              Immutable.OrderedMap<string, models.FeedbackQuestionNode>,
          }),
      }));
  }

  // item : FeedbackQuestion
  onAddQuestion = (item) => {
    if (!this.props.editMode) return;

    const node = item.with({ guid: guid() });
    this.addNode(node);
    this.setState({
      collapseInsertPopup: true,
    });
  }

  addNode(node: models.FeedbackQuestionNode) {
    const { model, activeContext, onSetCurrentNode } = this.props;

    onSetCurrentNode(activeContext.documentId.valueOr(null), node);
    this.handleEdit(model.with({
      questions: model.questions.with({
        questions: model.questions.questions.set(node.guid, node),
      }),
    }));
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

  renderAdd() {
    const { editMode } = this.props;
    const { collapseInsertPopup } = this.state;

    return (
      <React.Fragment>
        <div className={`insert-popup ${collapseInsertPopup ? 'collapsed' : ''}`}>
          <AddQuestion
            editMode={editMode}
            onQuestionAdd={this.onAddQuestion}
            assessmentType={LegacyTypes.feedback} />
        </div>
        <a onClick={this.collapseInsertPopup} className="insert-new">Insert new...</a>
      </React.Fragment>
    );
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

  onAddNew(item) {

  }

  onEdit(item) {

  }

  onDuplicateQuestion = () => {
    const duplicated = this.props.currentNode.clone();
    this.addNode(duplicated);
  }

  collapseInsertPopupFn = (e) => {
    if (e.originator !== 'insertPopupToggle') {
      this.setState({
        collapseInsertPopup: true,
      });
      window.removeEventListener('click', this.collapseInsertPopupFn);
    }
  }

  collapseInsertPopup = (e) => {
    (e.nativeEvent as any).originator = 'insertPopupToggle';

    if (this.state.collapseInsertPopup) {
      window.addEventListener('click', this.collapseInsertPopupFn);
    } else {
      window.removeEventListener('click', this.collapseInsertPopupFn);
    }

    this.setState({
      collapseInsertPopup: !this.state.collapseInsertPopup,
    });
  }

  render() {
    const { context, services, editMode, model, course, currentNode, onEdit,
      activeContext } = this.props;

    // We currently do not allow expanding / collapsing in the outline,
    // so we simply tell the outline to expand every node.
    const expanded = Immutable.Set<string>(model.questions.toArray().map(n => n.guid));

    const activeContentGuid = activeContext.activeChild.caseOf({
      just: c => c.guid,
      nothing: () => '',
    });

    return (
      <div className="feedback-editor">
        <ContextAwareToolbar editMode={editMode} context={context} model={model} />
        <div className="feedback-content">
          <div className="html-editor-well" onClick={() => this.unFocus()}>
            <SidebarToggle />

            <TitleTextEditor
              context={context}
              services={services}
              onFocus={() => this.unFocus()}
              model={(model.title.text.content.first() as ContiguousText)}
              editMode={editMode}
              onEdit={this.onTitleEdit}
              editorStyles={{ fontSize: 32 }} />

            <div className="outline-and-node-container">
              <Outline
                editMode={this.props.editMode}
                nodes={this.props.model.questions.questions}
                expandedNodes={expanded}
                selected={currentNode.guid}
                onEdit={this.onEditNodes}
                onChangeExpansion={this.onChangeExpansion}
                onSelect={this.onSelect}
                course={course}>
                {this.renderAdd()}
              </Outline>
              <AssessmentNodeRenderer
                {...this.props}
                allSkills={this.props.context.skills}
                activeContentGuid={activeContentGuid}
                model={currentNode}
                onEdit={(c: FeedbackQuestion, src: ContentElement) => this.onEditNode(
                  currentNode.guid, c, src)}
                onRemove={this.onNodeRemove}
                onFocus={this.onFocus}
                canRemove={this.canRemoveNode()}
                onDuplicate={this.onDuplicateQuestion}
                nodeParentModel={model}
                parent={this}
                isQuestionPool={false}
              />
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
