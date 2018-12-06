import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import {
  AbstractEditor, AbstractEditorProps, AbstractEditorState,
} from 'editors/document/common/AbstractEditor';
import { TextInput } from 'editors/content/common/TextInput';
import * as models from 'data/models';
import * as contentTypes from 'data/contentTypes';
import { LegacyTypes } from 'data/types';
import guid from 'utils/guid';
import {
  locateNextOfKin, findNodeByGuid,
  handleBranchingReordering, handleBranchingDeletion,
} from 'editors/document/assessment/utils';
import { Collapse } from 'editors/content/common/Collapse';
import { AddQuestion } from 'editors/content/question/AddQuestion';
import { renderAssessmentNode } from 'editors/document/common/questions';
import { getChildren, Outline, setChildren, EditDetails }
  from 'editors/document/assessment/Outline';
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
import { ToolbarButtonMenuDivider } from 'components/toolbar/ToolbarButtonMenu';

export interface AssessmentEditorProps extends AbstractEditorProps<models.AssessmentModel> {
  onFetchSkills: (courseId: string) => void;
  activeContext: ActiveContext;
  onUpdateContent: (documentId: string, content: Object) => void;
  onUpdateContentSelection: (
    documentId: string, content: Object, container: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
  hover: string;
  onUpdateHover: (hover: string) => void;
  currentPage: string;
  currentNode: contentTypes.Node;
  onSetCurrentNode: (documentId: string, node: contentTypes.Node) => void;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  onSetCurrentPage: (documentId: string, pageId: string) => void;
  course: models.CourseModel;
}

interface AssessmentEditorState extends AbstractEditorState {
  collapseInsertPopup: boolean;
}

class AssessmentEditor extends AbstractEditor<models.AssessmentModel,
  AssessmentEditorProps,
  AssessmentEditorState>  {

  noSkillsMessage: Messages.Message;
  supportedElements: Immutable.List<string>;

  constructor(props: AssessmentEditorProps) {
    super(props, ({ collapseInsertPopup: true } as AssessmentEditorState));

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onAddContent = this.onAddContent.bind(this);
    this.onAddPool = this.onAddPool.bind(this);
    this.onSelectPool = this.onSelectPool.bind(this);
    this.onCancelSelectPool = this.onCancelSelectPool.bind(this);
    this.onInsertPool = this.onInsertPool.bind(this);
    this.onPageEdit = this.onPageEdit.bind(this);

    this.getCurrentPage = this.getCurrentPage.bind(this);
    this.onTypeChange = this.onTypeChange.bind(this);
    this.onNodeRemove = this.onNodeRemove.bind(this);
    this.onEditNode = this.onEditNode.bind(this);
    this.onDuplicateQuestion = this.onDuplicateQuestion.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.unFocus = this.unFocus.bind(this);
    this.collapseInsertPopup = this.collapseInsertPopup.bind(this);

    this.supportedElements = Immutable.List<string>();

    if (hasUnknownSkill(props.model, props.context.skills)) {
      props.onFetchSkills(props.context.courseId);
    }
  }

  componentDidMount() {
    super.componentDidMount();
    // We have no direct access to a skills list through props.context since
    // skills cannot be deleted. Looking at skills attached to objectives
    // will show the banner if skills are present in the course but 'deleted',
    // aka removed from an associated objective.
    const hasNoskills = this.props.context.objectives.reduce(
      (bool, obj) => bool && obj.skills.size === 0,
      true);

    if (hasNoskills) {
      this.noSkillsMessage = buildMissingSkillsMessage(this.props.context.courseId);
      this.props.showMessage(this.noSkillsMessage);
    }
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
      || this.state.undoStackSize !== nextState.undoStackSize
      || this.state.redoStackSize !== nextState.redoStackSize
      || this.state.collapseInsertPopup !== nextState.collapseInsertPopup;

    return shouldUpdate;
  }

  componentWillReceiveProps(nextProps: AssessmentEditorProps) {

    if (this.props.context.skills.size <= 0 &&
      nextProps.context.skills.size > 0 &&
      this.noSkillsMessage !== undefined) {
      this.props.dismissMessage(this.noSkillsMessage);
    }

    if (this.props.currentNode === nextProps.currentNode && this.props.model !== nextProps.model) {

      const currentPage = this.getCurrentPage(nextProps);
      const { activeContext, onSetCurrentNode } = this.props;

      // Handle the case that the current node has changed externally,
      // for instance, from an undo/redo
      findNodeByGuid(currentPage.nodes, this.props.currentNode.guid)
        .caseOf({

          just: (currentNode) => {
            onSetCurrentNode(activeContext.documentId.valueOr(null), currentNode);
          },
          nothing: () => {
            locateNextOfKin(
              this.getCurrentPage(this.props).nodes, this.props.currentNode.guid).lift(node =>
                onSetCurrentNode(
                  activeContext.documentId.valueOr(null), node));
          },
        });
    }
  }

  getCurrentPage(props) {
    return props.model.pages.get(this.props.currentPage)
      || props.model.pages.first();
  }

  onPageEdit(page: contentTypes.Page) {
    const pages = this.props.model.pages.set(page.guid, page);
    this.handleEdit(this.props.model.with({ pages }));
  }

  onTitleEdit(ct: ContiguousText, src) {
    const t = ct.extractPlainText().caseOf({ just: s => s, nothing: () => '' });

    const resource = this.props.model.resource.with({ title: t });

    const content = this.props.model.title.text.content.set(ct.guid, ct);
    const text = this.props.model.title.text.with({ content });
    const title = this.props.model.title.with({ text });

    this.props.onEdit(this.props.model.with({ title, resource }));
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
            this.props.onSetCurrentNode(
              this.props.activeContext.documentId.valueOr(null), questions.last());
          }
        }
      }
    }
  }

  onEditNode(guid: string, node: models.Node, src) {

    const { activeContext, onSetCurrentNode } = this.props;

    const nodes = this.getCurrentPage(this.props).nodes;

    this.detectPoolAdditions(node, nodes);

    onSetCurrentNode(activeContext.documentId.valueOr(null), node);
    this.props.onUpdateContent(this.props.context.documentId, src);

    const updatedNodes = updateNode(guid, node, nodes, getChildren, setChildren);

    let page = this.getCurrentPage(this.props);
    page = page.with({ nodes: updatedNodes });

    const pages = this.props.model.pages.set(page.guid, page);
    this.handleEdit(this.props.model.with({ pages }));

  }

  // This handles updates from the outline component, which are only reorders
  onEditNodes(nodes: Immutable.OrderedMap<string, models.Node>, editDetails: EditDetails) {

    if (this.props.model.branching) {
      const pages = handleBranchingReordering(
        this.props.model.resource.id, this.props.model.pages, nodes);
      this.handleEdit(this.props.model.with({ pages }));

      findNodeByGuid(nodes, editDetails.sourceModel.guid).caseOf({
        just: node => this.onSelect(node),
        nothing: () => null,
      });

    } else {
      let page = this.getCurrentPage(this.props);
      page = page.with({ nodes });

      const pages = this.props.model.pages.set(page.guid, page);
      this.handleEdit(this.props.model.with({ pages }));
    }
  }

  onChangeExpansion(nodes: Immutable.Set<string>) {
    // Nothing to do here, as we are not allowing changing the
    // expanded state of nodes in the outline
  }

  onSelect(currentNode: contentTypes.Node) {
    const { model, activeContext, onSetCurrentNode, onSetCurrentPage } = this.props;

    const documentId = activeContext.documentId.valueOr(null);

    onSetCurrentNode(documentId, currentNode);
    if (model.branching) {
      const currentPage = model.pages.reduce(
        (activePage, page) =>
          page.nodes.contains(currentNode) ? page : activePage,
        model.pages.first());
      onSetCurrentPage(documentId, currentPage.guid);
    }
  }

  allNodes() {
    return this.props.model.pages.reduce(
      (nodes, page) => nodes.concat(page.nodes).toOrderedMap(),
      Immutable.OrderedMap<string, contentTypes.Node>());
  }

  canRemoveNode() {
    const isQuestionOrPool = node =>
      node.contentType === 'Question' || node.contentType === 'Selection';

    return this.allNodes().filter(isQuestionOrPool).size > 1;
  }

  onNodeRemove(guid: string) {
    // Find the node to be removed, remove it, and set an adjacent node to be active.
    // Branching assessments are handled as a special case since they must remove
    // edges when a linked-to node is deleted.

    const { model, activeContext, onSetCurrentNode, onSetCurrentPage } = this.props;
    const isBranching = model.branching;
    const currentPage = this.getCurrentPage(this.props);
    const documentId = activeContext.documentId.valueOr(null);

    // Prevent the last node from being removed
    if (this.allNodes().size <= 1) {
      return;
    }

    const findPage = node => model.pages.reduce(
      (activePage, page) =>
        page.nodes.contains(node) ? page : activePage,
      model.pages.first());

    locateNextOfKin(this.allNodes(), guid).lift((node) => {
      onSetCurrentNode(documentId, node);
      onSetCurrentPage(documentId, findPage(node).guid);
    });

    let pages;
    if (isBranching) {
      pages = handleBranchingDeletion(documentId, model.pages, guid);
    } else {
      const nodes = removeNode(guid, currentPage.nodes, getChildren, setChildren);
      pages = nodes.size > 0
        ? model.pages.set(currentPage.guid, currentPage.with({ nodes }))
        : model.pages.remove(currentPage.guid);
    }

    this.handleEdit(model.with({ pages }));
  }

  onAddContent() {
    if (!this.props.editMode) return;

    let content = contentTypes.Content.fromText('', '');
    content = content.with({ guid: guid() });
    this.addNode(content);
    this.setState({
      collapseInsertPopup: true,
    });
  }

  addQuestion(question: contentTypes.Question) {
    if (!this.props.editMode) return;

    const content = question.with({ guid: guid() });
    this.addNode(content);
    this.setState({
      collapseInsertPopup: true,
    });
  }

  onAddPool() {
    if (!this.props.editMode) return;

    const pool = new contentTypes.Selection({ source: new contentTypes.Pool() });
    this.addNode(pool);
    this.setState({
      collapseInsertPopup: true,
    });
  }

  addNode(node) {
    const { model, activeContext, onSetCurrentNode } = this.props;

    // Branching assessments place each question on a separate page
    let page = model.branching
      ? new contentTypes.Page()
      : this.getCurrentPage(this.props);

    page = page.with({ nodes: page.nodes.set(node.guid, node) });

    const pages = model.pages.set(page.guid, page);

    onSetCurrentNode(activeContext.documentId.valueOr(null), node);
    this.handleEdit(model.with({ pages }));
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

  onTypeChange(type) {
    const resource = this.props.model.resource.with({ type });
    const model = this.props.model.with({ resource });

    this.handleEdit(model);
  }

  onSelectPool() {
    if (!this.props.editMode) return;

    const predicate = (res: Resource): boolean =>
      res.type === LegacyTypes.assessment2_pool
      && res.resourceState !== ResourceState.DELETED;

    this.props.services.displayModal(
      <ResourceSelection
        filterPredicate={predicate}
        courseId={this.props.context.courseId}
        onInsert={this.onInsertPool}
        onCancel={this.onCancelSelectPool} />);
  }

  onCancelSelectPool() {
    this.props.services.dismissModal();
  }

  onInsertPool(resource) {
    this.props.services.dismissModal();

    // Handle case where Insert is clicked after no pool selection is made
    if (!resource || resource.id === '') {
      return;
    }

    this.props.services.fetchIdByGuid(resource.guid)
      .then((idref) => {
        const pool = new contentTypes.Selection({ source: new contentTypes.PoolRef({ idref }) });
        this.addNode(pool);
        this.setState({
          collapseInsertPopup: true,
        });
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

    const { editMode } = this.props;
    const { collapseInsertPopup } = this.state;

    const questionPoolOrNothing = editMode && !isInline
      ? <a className="dropdown-item" onClick={this.onSelectPool}>Question Pool</a>
      : null;

    const embeddedPoolOrNothing = editMode && !isInline
      ? <a className="dropdown-item" onClick={this.onAddPool}>Embedded Pool</a>
      : null;

    return (
      <React.Fragment>
        <div className={`insert-popup ${collapseInsertPopup ? 'collapsed' : ''}`}>
          <AddQuestion
            editMode={this.props.editMode}
            onQuestionAdd={this.addQuestion.bind(this)}
            isSummative={this.props.model.type === LegacyTypes.assessment2} />
          {/* Branching assessments must have supporting content inline */}
          {this.props.model.branching
            ? null
            : <div><ToolbarButtonMenuDivider />
              <a className="dropdown-item" onClick={this.onAddContent}>Supporting Content</a></div>}
          {questionPoolOrNothing}
          {embeddedPoolOrNothing}
        </div>
        <a onClick={this.collapseInsertPopup} className="insert-new">Insert new...</a>
      </React.Fragment>
    );
  }

  onFocus(model: Object, parent, textSelection) {
    this.props.onUpdateContentSelection(
      this.props.context.documentId, model, parent, textSelection);
  }

  unFocus() {
    this.props.onUpdateContentSelection(
      this.props.context.documentId, null, null, Maybe.nothing());
  }

  onAddNew(item) {

  }

  onEdit(item) {

  }

  onDuplicateQuestion() {

    if (this.props.currentNode.contentType === 'Question') {
      const duplicated = this.props.currentNode.clone();
      this.addNode(duplicated);
    }
  }

  collapseInsertPopup() {
    this.setState({
      collapseInsertPopup: !this.state.collapseInsertPopup,
    });
  }

  render() {
    const { context, services, editMode, model, course, currentNode, onEdit } = this.props;

    const page = this.getCurrentPage(this.props);

    // We currently do not allow expanding / collapsing in the outline,
    // so we simply tell the outline to expand every node.
    const expanded = Immutable.Set<string>(page.nodes.toArray().map(n => n.guid));

    const activeContentGuid = this.props.activeContext.activeChild.caseOf({
      just: c => (c as any).guid,
      nothing: () => '',
    });

    const assessmentNodeProps = {
      ...this.props,
      skills: this.props.context.skills,
      activeContentGuid,
    };

    return (
      <div className="assessment-editor">
        <ContextAwareToolbar editMode={editMode} context={this.props.context} model={model} />
        <div className="assessment-content">
          <div className="html-editor-well" onClick={() => this.unFocus()}>

            <TitleTextEditor
              context={context}
              services={services}
              onFocus={() => this.unFocus()}
              model={(model.title.text.content.first() as ContiguousText)}
              editMode={editMode}
              onEdit={this.onTitleEdit}
              editorStyles={{ fontSize: 32 }} />

            <div className="outline-and-node-container">
              <div className="outline-container">
                <Outline
                  editMode={this.props.editMode}
                  nodes={model.branching
                    ? this.allNodes()
                    : page.nodes}
                  expandedNodes={expanded}
                  selected={currentNode.guid}
                  onEdit={this.onEditNodes.bind(this)}
                  onChangeExpansion={this.onChangeExpansion.bind(this)}
                  onSelect={this.onSelect.bind(this)}
                  course={course}
                />
                {this.renderAdd()}
              </div>
              <div className="node-container">
                {renderAssessmentNode(
                  currentNode, assessmentNodeProps, this.onEditNode,
                  this.onNodeRemove, this.onFocus, this.canRemoveNode(),
                  this.onDuplicateQuestion, this, false)}
              </div>
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

export default AssessmentEditor;
