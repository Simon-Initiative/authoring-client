import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import {
  AbstractEditor, AbstractEditorProps, AbstractEditorState,
} from 'editors/document/common/AbstractEditor';
import { TextInput } from 'editors/content/common/TextInput';
import * as models from 'data/models';
import * as contentTypes from 'data/contentTypes';
import { LegacyTypes, CourseIdVers, DocumentId } from 'data/types';
import guid from 'utils/guid';
import {
  locateNextOfKin, findNodeByGuid, findQuestionById,
  handleBranchingReordering, handleBranchingDeletion,
} from 'editors/document/assessment/utils';
import { Collapse } from 'editors/content/common/Collapse';
import { AddQuestion } from 'editors/content/question/addquestion/AddQuestion.controller';
import { AssessmentNodeRenderer } from 'editors/document/common/questions';
import { getChildren, Outline, setChildren, EditDetails }
  from 'editors/document/assessment/outline/Outline';
import { updateNode, removeNode } from 'data/utils/tree';
import { hasUnknownSkill } from 'utils/skills';
import { ContextAwareToolbar } from 'components/toolbar/ContextAwareToolbar.controller';
import { ContextAwareSidebar } from 'components/sidebar/ContextAwareSidebar.controller';
import { ActiveContext, ParentContainer, TextSelection } from 'types/active';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import ResourceSelection from 'utils/selection/ResourceSelection.controller';
import { Resource, ResourceState } from 'data/content/resource';
import * as Messages from 'types/messages';
import { buildMissingSkillsMessage } from 'utils/error';
import './AssessmentEditor.scss';
import { ContentElement } from 'data/content/common/interfaces';
import { RouterState } from 'reducers/router';
import { Node } from 'data/content/assessment/node';
import { SidebarToggle } from 'editors/common/SidebarToggle.controller';
import { CourseState } from 'reducers/course';

export interface AssessmentEditorProps extends AbstractEditorProps<models.AssessmentModel> {
  onFetchSkills: (courseId: CourseIdVers) => void;
  activeContext: ActiveContext;
  onUpdateContent: (documentId: DocumentId, content: ContentElement) => void;
  onUpdateContentSelection: (
    documentId: DocumentId, content: ContentElement, container: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
  hover: string;
  onUpdateHover: (hover: string) => void;
  currentPage: string;
  currentNode: contentTypes.Node;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  onSetCurrentNodeOrPage: (documentId: DocumentId, nodeOrPageId: contentTypes.Node | string) =>
    void;
  onSetSearchParam: (name, value) => void;
  onClearSearchParam: (name) => void;
  course: CourseState;
  router: RouterState;
}

interface AssessmentEditorState extends AbstractEditorState {
  collapseInsertPopup: boolean;
}

export default class AssessmentEditor extends AbstractEditor<models.AssessmentModel,
  AssessmentEditorProps,
  AssessmentEditorState> {

  state: AssessmentEditorState = {
    ...this.state,
    collapseInsertPopup: true,
  };

  componentWillMount() {
    this.fetchSkillsIfMissing(this.props);
  }

  componentDidMount() {
    super.componentDidMount();

    this.showMissingSkillsMessage();

    // select the routed node
    this.selectRoutedOrDefaultNode(this.props.router);
  }

  shouldComponentUpdate(
    nextProps: AssessmentEditorProps,
    nextState: AssessmentEditorState): boolean {

    const shouldUpdate = this.props.model !== nextProps.model
      || this.props.activeContext !== nextProps.activeContext
      || this.props.expanded !== nextProps.expanded
      || this.props.editMode !== nextProps.editMode
      || this.props.hover !== nextProps.hover
      || this.props.currentPage !== nextProps.currentPage
      || this.props.currentNode !== nextProps.currentNode
      || this.props.router !== nextProps.router
      || this.state.undoStackSize !== nextState.undoStackSize
      || this.state.redoStackSize !== nextState.redoStackSize
      || this.state.collapseInsertPopup !== nextState.collapseInsertPopup;

    return shouldUpdate;
  }

  componentWillReceiveProps(nextProps: AssessmentEditorProps) {

    if (this.wasSkillAdded(nextProps)) {
      this.props.dismissMessage(this.noSkillsMessage);
    }

    this.checkActiveNodeStillExists(nextProps);
  }

  noSkillsMessage: Messages.Message;
  supportedElements: Immutable.List<string> = Immutable.List<string>();

  wasSkillAdded = (nextProps: AssessmentEditorProps) => {
    return this.props.context.skills.size <= 0 &&
      nextProps.context.skills.size > 0 &&
      this.noSkillsMessage !== undefined;
  }

  checkActiveNodeStillExists = (nextProps: AssessmentEditorProps) => {
    // Handle the case that the current node has changed externally,
    // for instance, from an undo/redo
    if (this.props.currentNode === nextProps.currentNode && this.props.model !== nextProps.model) {

      const currentPage = this.getCurrentPage(nextProps);
      const { activeContext, onSetCurrentNodeOrPage } = this.props;
      const documentId = activeContext.documentId.valueOr(null);

      findNodeByGuid(currentPage.nodes, this.props.currentNode.guid)
        .caseOf({
          // If the node is still part of the current page, select the same node as active
          just: (currentNode) => {
            onSetCurrentNodeOrPage(documentId, currentNode);
          },
          // Else there was some sort of external change, and an adjacent node needs to be
          // selected as active
          nothing: () => {
            locateNextOfKin(
              this.getCurrentPage(this.props).nodes, this.props.currentNode.guid).lift(node =>
                onSetCurrentNodeOrPage(documentId, node));
          },
        });
    }
    if (this.props.router !== nextProps.router) {
      this.selectRoutedOrDefaultNode(nextProps.router);
    }
  }

  selectFirstQuestion = () => {
    const { activeContext, model, onSetCurrentNodeOrPage } = this.props;
    const documentId = activeContext.documentId.valueOr(null);

    if (model.pages.size > 0) {
      onSetCurrentNodeOrPage(documentId, this.props.model.pages.first().nodes.first());
    } else {
      onSetCurrentNodeOrPage(documentId, this.props.model.nodes.first());
    }
  }

  selectRoutedOrDefaultNode = (router: RouterState) => {
    const { activeContext, onSetCurrentNodeOrPage, model } = this.props;
    const documentId = activeContext.documentId.valueOr(null);

    if (router.params.get('questionId')) {
      const urlSelectedQuestion =
        model.pages.reduce(
          (acc, page) => acc.caseOf({
            just: n => Maybe.just(n),
            nothing: () => findQuestionById(page.nodes, router.params.get('questionId')),
          }),
          findQuestionById(model.nodes, router.params.get('questionId')),
        );

      urlSelectedQuestion.caseOf({
        just: question => onSetCurrentNodeOrPage(documentId, question),
        nothing: () => this.selectFirstQuestion(),
      });
    } else if (router.params.get('nodeGuid')) {
      const urlSelectedNode =
        model.pages.reduce(
          (acc, page) => acc.caseOf({
            just: n => Maybe.just(n),
            nothing: () => findNodeByGuid(page.nodes, router.params.get('nodeGuid')),
          }),
          findNodeByGuid(model.nodes, router.params.get('nodeGuid')),
        );

      urlSelectedNode.caseOf({
        just: node => onSetCurrentNodeOrPage(documentId, node),
        nothing: () => this.selectFirstQuestion(),
      });
    } else {
      this.selectFirstQuestion();
    }
  }

  getCurrentPage = (props: AssessmentEditorProps) => {
    return props.model.pages.get(this.props.currentPage)
      || props.model.pages.first();
  }

  fetchSkillsIfMissing = (props: AssessmentEditorProps) => {
    if (hasUnknownSkill(props.model, props.context.skills)) {
      props.onFetchSkills(props.context.courseModel.idvers);
    }
  }

  showMissingSkillsMessage() {
    // We have no direct access to a skills list through props.context since
    // skills cannot be deleted. Looking at skills attached to objectives
    // will show the banner if skills are present in the course but 'deleted',
    // aka removed from an associated objective.
    const hasNoskills = this.props.context.objectives.reduce(
      (bool, obj) => bool && obj.skills.size === 0,
      true);

    if (hasNoskills) {
      this.noSkillsMessage = buildMissingSkillsMessage(
        this.props.context.courseModel.idvers,
        this.props.context.orgId);
      this.props.showMessage(this.noSkillsMessage);
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

  detectPoolAdditions(
    node: models.Node,
    nodes: Immutable.OrderedMap<string, contentTypes.Node>) {

    if (node.contentType === 'Selection') {
      if (node.source.contentType === 'Pool') {
        if (nodes.has(node.guid)) {
          const previous = nodes.get(node.guid) as contentTypes.Selection;
          const prevQuestions = (previous.source as contentTypes.Pool).questions;
          const questions = node.source.questions;

          // We detected an addition of a question to an embedded pool
          if (questions.size > prevQuestions.size) {
            this.props.onSetCurrentNodeOrPage(
              this.props.activeContext.documentId.valueOr(null), questions.last());
          }
        }
      }
    }
  }

  onEditNode = (guid: string, node: models.Node, src: ContentElement) => {
    const { activeContext, context, model, onSetCurrentNodeOrPage, onUpdateContent } = this.props;

    const nodes = this.getCurrentPage(this.props).nodes;

    this.detectPoolAdditions(node, nodes);

    onSetCurrentNodeOrPage(activeContext.documentId.valueOr(null), node);
    onUpdateContent(context.documentId, src);

    const page = this.getCurrentPage(this.props).with({
      nodes: updateNode(guid, node, nodes, getChildren, setChildren),
    });

    this.handleEdit(model.with({
      pages: model.pages.set(page.guid, page),
    }));
  }

  // This handles updates from the outline component, which are only reorders
  onEditNodes(nodes: Immutable.OrderedMap<string, models.Node>, editDetails: EditDetails) {

    const { model } = this.props;
    let pages;

    if (model.branching) {
      pages = handleBranchingReordering(model.resource.id, model.pages, nodes);
      findNodeByGuid(nodes, editDetails.sourceModel.guid).lift(node => this.onSelect(node));
    } else {
      const page = this.getCurrentPage(this.props).with({ nodes });
      pages = model.pages.set(page.guid, page);
    }

    this.handleEdit(model.with({
      pages,
    }));
  }

  onChangeExpansion(nodes: Immutable.Set<string>) {
    // Nothing to do here, as we are not allowing changing the
    // expanded state of nodes in the outline
  }

  onSelect = (node: contentTypes.Node) => {
    const { onSetSearchParam, onClearSearchParam } = this.props;

    if (node.contentType === 'Question') {
      onSetSearchParam('questionId', node.id);
      onClearSearchParam('nodeGuid');
    } else {
      onSetSearchParam('nodeGuid', node.guid);
      onClearSearchParam('questionId');
    }
  }

  allNodes() {
    return this.props.model.pages.reduce(
      (nodes, page) => nodes.concat(page.nodes).toOrderedMap(),
      Immutable.OrderedMap<string, contentTypes.Node>());
  }

  canRemoveNode() {
    const isQuestionOrPool = (node: models.Node) =>
      node.contentType === 'Question' || node.contentType === 'Selection';

    return this.allNodes().filter(isQuestionOrPool).size > 1;
  }

  onNodeRemove = (guid: string) => {
    // Find the node to be removed, remove it, and set an adjacent node to be active.
    // Branching assessments are handled as a special case since they must remove
    // edges when a linked-to node is deleted.

    const { model, activeContext, onSetCurrentNodeOrPage } = this.props;
    const isBranching = model.branching;
    const currentPage = this.getCurrentPage(this.props);
    const documentId = activeContext.documentId.valueOr(null);

    // Prevent the last node from being removed
    if (this.allNodes().size <= 1) {
      return;
    }

    locateNextOfKin(this.allNodes(), guid).lift((node) => {
      onSetCurrentNodeOrPage(documentId, node);
    });

    const nodes = removeNode(guid, currentPage.nodes, getChildren, setChildren);
    const pages = isBranching
      ? handleBranchingDeletion(documentId, model.pages, guid)
      : nodes.size > 0
        ? model.pages.set(currentPage.guid, currentPage.with({ nodes }))
        : model.pages.remove(currentPage.guid);

    this.handleEdit(model.with({ pages }));
  }

  // item : AssessmentNode
  onAddQuestion = (item) => {
    if (!this.props.editMode) return;

    const node = item.with({ guid: guid() });
    this.addNode(node);
    this.setState({
      collapseInsertPopup: true,
    });
  }

  addNode(node: models.Node) {
    const { model, activeContext, onSetCurrentNodeOrPage } = this.props;

    // Branching assessments place each question on a separate page
    let page = model.branching
      ? new contentTypes.Page()
      : this.getCurrentPage(this.props);

    page = page.with({ nodes: page.nodes.set(node.guid, node) });

    onSetCurrentNodeOrPage(activeContext.documentId.valueOr(null), node);
    this.handleEdit(model.with({
      pages: model.pages.set(page.guid, page),
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

  onSelectPool = () => {
    const { editMode, services, context } = this.props;
    if (!editMode) return;

    const predicate = (res: Resource): boolean =>
      res.type === LegacyTypes.assessment2_pool
      && res.resourceState !== ResourceState.DELETED;

    services.displayModal(
      <ResourceSelection
        filterPredicate={predicate}
        courseId={context.courseModel.guid}
        onInsert={this.onInsertPool}
        onCancel={this.onCancelSelectPool} />);
  }

  onCancelSelectPool = () => {
    this.props.services.dismissModal();
  }

  onInsertPool = (resource: Resource) => {
    this.props.services.dismissModal();

    // Handle case where Insert is clicked after no pool selection is made
    if (!resource || resource.id.value() === '') {
      return;
    }

    const pool = new contentTypes.Selection({
      source: new contentTypes.PoolRef({ idref: resource.id }),
    });
    this.addNode(pool);
    this.setState({
      collapseInsertPopup: true,
    });
  }

  renderSettings() {
    return (
      <Collapse caption="Settings">
        <div style={{ marginLeft: '25px' }}>
          <form>

            <div className="form-group row">
              <label className="col-3 col-form-label">Recommended attempts:</label>
              <TextInput
                editMode={this.props.editMode}
                width="100px"
                label=""
                type="number"
                value={this.props.model.recommendedAttempts}
                onEdit={
                  recommendedAttempts => this.handleEdit(
                    this.props.model.with({ recommendedAttempts }))}
              />
            </div>

            <div className="form-group row">
              <label className="col-3 col-form-label">Maximum attempts:</label>
              <TextInput
                editMode={this.props.editMode}
                width="100px"
                label=""
                type="number"
                value={this.props.model.maxAttempts}
                onEdit={
                  maxAttempts => this.handleEdit(
                    this.props.model.with({ maxAttempts }))}
              />
            </div>
          </form>
        </div>
      </Collapse>
    );
  }

  renderAdd() {
    const isInline = this.props.model.resource.type === LegacyTypes.inline;

    const { editMode, model } = this.props;
    const { collapseInsertPopup } = this.state;

    const questionPoolOrNothing = editMode && !isInline
      ? <a className="dropdown-item" onClick={this.onSelectPool}>Question Pool</a>
      : null;

    return (
      <React.Fragment>
        <div className={`insert-popup ${collapseInsertPopup ? 'collapsed' : ''}`}>
          <AddQuestion
            editMode={editMode}
            onQuestionAdd={this.onAddQuestion}
            assessmentType={model.type}
            isBranching={model.branching} />
          {questionPoolOrNothing}
        </div>
        <a onClick={this.toggleInsertPopup} className="insert-new">Insert new...</a>
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
    if (this.props.currentNode.contentType === 'Question') {
      const duplicated = this.props.currentNode.clone();
      this.addNode(duplicated);
    }
  }

  collapseInsertPopupFn = (e) => {
    if (e.originator !== 'insertPopupToggle') {
      this.setState({
        collapseInsertPopup: true,
      });
      window.removeEventListener('click', this.collapseInsertPopupFn);
    }
  }

  toggleInsertPopup = (e) => {
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
    const {
      context, services, editMode, model, course, currentNode, onEdit,
    } = this.props;

    const page = this.getCurrentPage(this.props);

    // We currently do not allow expanding / collapsing in the outline,
    // so we simply tell the outline to expand every node.
    const expanded = Immutable.Set<string>(page.nodes.toArray().map(n => n.guid));

    const activeContentGuid = this.props.activeContext.activeChild.caseOf({
      just: c => c.guid,
      nothing: () => '',
    });

    return (
      <div className="assessment-editor">
        <ContextAwareToolbar editMode={editMode} context={this.props.context} model={model} />
        <div className="assessment-content">
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
                nodes={model.branching
                  ? this.allNodes()
                  : page.nodes}
                expandedNodes={expanded}
                selected={currentNode.guid}
                onEdit={this.onEditNodes.bind(this)}
                onChangeExpansion={this.onChangeExpansion.bind(this)}
                onSelect={this.onSelect}
                course={course}>
                {this.renderAdd()}
              </Outline>
              <AssessmentNodeRenderer
                {...this.props}
                allSkills={this.props.context.skills}
                activeContentGuid={activeContentGuid}
                model={currentNode}
                onEdit={(c: Node, src: ContentElement) => this.onEditNode(currentNode.guid, c, src)}
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

