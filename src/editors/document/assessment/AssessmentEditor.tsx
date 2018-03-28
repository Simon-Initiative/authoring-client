import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';
import { TitleContentEditor } from '../../content/title/TitleContentEditor';
import { PageSelection } from './PageSelection';
import { TextInput } from '../../content/common/TextInput';
import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import { LegacyTypes } from '../../../data/types';
import guid from '../../../utils/guid';
import { findNodeByGuid, locateNextOfKin } from './utils';
import { Collapse } from '../../content/common/Collapse';
import { AddQuestion, createMultipleChoiceQuestion } from '../../content/question/AddQuestion';
import { renderAssessmentNode } from '../common/questions';
import { getChildren, Outline, setChildren } from './Outline';
import * as Tree from '../../common/tree';
import { hasUnknownSkill } from 'utils/skills';
import * as persistence from 'data/persistence';
import { ContextAwareToolbar } from 'components/toolbar/ContextAwareToolbar.controller';
import { ContextAwareSidebar } from 'components/sidebar/ContextAwareSidebar.controller';
import { ActiveContext, ParentContainer, TextSelection } from 'types/active';
import { ContiguousTextViewer } from 'editors/content/learning/ContiguousTextViewer';
import { ContiguousText } from 'data/content/learning/contiguous';
import ResourceSelection from 'utils/selection/ResourceSelection';

import './AssessmentEditor.scss';

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
}

interface AssessmentEditorState extends AbstractEditorState {

}


class AssessmentEditor extends AbstractEditor<models.AssessmentModel,
  AssessmentEditorProps,
  AssessmentEditorState>  {

  pendingCurrentNode: Maybe<contentTypes.Node>;
  supportedElements: Immutable.List<string>;

  constructor(props : AssessmentEditorProps) {
    super(props, ({} as AssessmentEditorState));

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

    this.onFocus = this.onFocus.bind(this);

    this.pendingCurrentNode = Maybe.nothing<contentTypes.Node>();

    this.supportedElements = Immutable.List<string>();

    if (hasUnknownSkill(props.model, props.context.skills)) {
      props.onFetchSkills(props.context.courseId);
    }
  }

  shouldComponentUpdate(
    nextProps: AssessmentEditorProps,
    nextState: AssessmentEditorState) : boolean {

    const shouldUpdate = this.props.model !== nextProps.model
        || this.props.activeContext !== nextProps.activeContext
        || this.props.expanded !== nextProps.expanded
        || this.props.editMode !== nextProps.editMode
        || this.props.hover !== nextProps.hover
        || this.props.currentPage !== nextProps.currentPage
        || this.props.currentNode !== nextProps.currentNode
        || this.state.undoStackSize !== nextState.undoStackSize
        || this.state.redoStackSize !== nextState.redoStackSize;

    return shouldUpdate;
  }

  componentWillReceiveProps(nextProps: AssessmentEditorProps) {

    const currentPage = this.getCurrentPage(nextProps);

    // // Handle the case that the current node has changed externally,
    // // for instance, from an undo/redo
    // findNodeByGuid(currentPage.nodes, this.props.currentNode.guid)
    //   .lift(currentNode => this.setState({ currentNode }));

    // this.pendingCurrentNode
    //   .bind(node => findNodeByGuid(currentPage.nodes, node.guid))
    //   .map((currentNode) => {
    //     this.pendingCurrentNode = Maybe.nothing<contentTypes.Node>();
    //     this.setState({ currentNode });
    //   });
  }

  getCurrentPage(props) {
    return props.model.pages.get(this.props.currentPage)
    || props.model.pages.first();
  }

  onPageEdit(page: contentTypes.Page) {
    const pages = this.props.model.pages.set(page.guid, page);
    this.handleEdit(this.props.model.with({ pages }));
  }

  onTitleEdit(content: contentTypes.Title) {
    const resource = this.props.model.resource.with({ title: content.text
      .extractPlainText().caseOf({ just: s => s, nothing: () => '' }) });
    this.handleEdit(this.props.model.with({ title: content, resource }));
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
            this.pendingCurrentNode = Maybe.just(questions.last());
          }

        }
      }
    }
  }

  onEditNode(guid : string, node : models.Node, src) {

    const { activeContext, onSetCurrentNode } = this.props;

    const nodes = this.getCurrentPage(this.props).nodes;

    this.detectPoolAdditions(node, nodes);

    onSetCurrentNode(activeContext.documentId.valueOr(null), node);
    this.props.onUpdateContent(this.props.context.documentId, src);

    this.onEditNodes(Tree.updateNode(guid, node, nodes, getChildren, setChildren));
  }

  onEditNodes(nodes: Immutable.OrderedMap<string, models.Node>) {

    let page = this.getCurrentPage(this.props);
    page = page.with({ nodes });

    const pages = this.props.model.pages.set(page.guid, page);
    this.handleEdit(this.props.model.with({ pages }));
  }

  onChangeExpansion(nodes: Immutable.Set<string>) {
    // Nothing to do here, as we are not allowing changing the
    // expanded state of nodes in the outline
  }

  onSelect(currentNode: contentTypes.Node) {
    const { activeContext, onSetCurrentNode } = this.props;

    onSetCurrentNode(activeContext.documentId.valueOr(null), currentNode);
  }

  canRemoveNode() {
    const page = this.getCurrentPage(this.props);

    return page.nodes.filter(n => n.contentType === 'Question').size > 1;
  }

  onNodeRemove(guid: string) {

    let page = this.getCurrentPage(this.props);

    const removed = Tree.removeNode(guid, page.nodes, getChildren, setChildren);

    if (removed.size > 0) {

      this.pendingCurrentNode = locateNextOfKin(page.nodes, guid);

      page = page.with({ nodes: removed });

      const pages = this.props.model.pages.set(page.guid, page);
      this.handleEdit(this.props.model.with({ pages }));
    }

  }



  renderTitle() {
    return (
      <TitleContentEditor
        activeContentGuid={null}
        hover={null}
        onUpdateHover={() => {}}
        parent={null}
        onFocus={this.onFocus.bind(this, this.props.model.title, this)}
        services={this.props.services}
        context={this.props.context}
        editMode={this.props.editMode}
        model={this.props.model.title}
        onEdit={this.onTitleEdit} />
    );
  }

  onAddContent() {
    let content = contentTypes.Content.fromText('', '');
    content = content.with({ guid: guid() });
    this.pendingCurrentNode = Maybe.just(content);
    this.addNode(content);
  }

  addQuestion(question: contentTypes.Question) {
    const content = question.with({ guid: guid() });
    this.pendingCurrentNode = Maybe.just(content);
    this.addNode(content);
  }

  onAddPool() {
    const pool = new contentTypes.Selection({ source: new contentTypes.Pool() });
    this.pendingCurrentNode = Maybe.just(pool);
    this.addNode(pool);
  }

  addNode(node) {
    let page = this.getCurrentPage(this.props);
    page = page.with({ nodes: page.nodes.set(node.guid, node) });

    const pages = this.props.model.pages.set(page.guid, page);

    this.handleEdit(this.props.model.with({ pages }));
  }

  onRemove() {
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

    const predicate =
      (res: persistence.CourseResource) : boolean => {
        return res.type === LegacyTypes.assessment2_pool;
      };

    this.props.services.displayModal(
        <ResourceSelection
          filterPredicate={predicate}
          courseId={this.props.context.courseId}
          onInsert={this.onInsertPool}
          onCancel={this.onCancelSelectPool}/>);
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

    this.props.services.fetchIdByGuid(resource.id)
    .then((idref) => {
      const pool = new contentTypes.Selection({ source: new contentTypes.PoolRef({ idref }) });
      this.addNode(pool);
    });
  }

  renderSettings() {
    return (
      <Collapse caption="Settings">
        <div style={ { marginLeft: '25px' } }>
          <form>

            <div className="form-group row">
              <label className="col-3 col-form-label">Recommended attempts:</label>
              <TextInput
                editMode={this.props.editMode}
                width="50px"
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
                width="50px"
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

    return (
      <div className="add-menu">

        <span className="label">Insert new: </span>

        <button disabled={!this.props.editMode}
          type="button" className="btn btn-link btn-sm"
          onClick={this.onAddContent}>Content</button>

        <span className="slash">/</span>

        <AddQuestion
          editMode={this.props.editMode}
          onQuestionAdd={this.addQuestion.bind(this)}
          isSummative={this.props.model.type === LegacyTypes.assessment2}/>

        <span className="slash">/</span>

        <button
          disabled={!this.props.editMode || isInline}
          type="button" className="btn btn-link btn-sm"
          onClick={this.onSelectPool}>Question Pool</button>

      </div>
    );
  }

  onFocus(model: Object, parent, textSelection) {
    this.props.onUpdateContentSelection(
      this.props.context.documentId, model, parent, textSelection);
  }

  onAddNew(item) {

  }

  onEdit(item) {

  }

  render() {
    const { context, services, editMode, model, currentNode, onEdit } = this.props;


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
        <ContextAwareToolbar context={this.props.context} model={model}/>
        <div className="assessment-content">
          <div className="html-editor-well">

            <ContiguousTextViewer
              context={context}
              services={services}
              model={(model.title.text.content.first() as ContiguousText)}
              editorStyles={{ fontSize: 32 }} />

            {this.renderAdd()}

            <div className="outline">
              <div className="outlineContainer">
                <Outline
                  editMode={this.props.editMode}
                  nodes={page.nodes}
                  expandedNodes={expanded}
                  selected={currentNode.guid}
                  onEdit={this.onEditNodes.bind(this)}
                  onChangeExpansion={this.onChangeExpansion.bind(this)}
                  onSelect={this.onSelect.bind(this)}
                  />
              </div>
              <div className="nodeContainer">
                {renderAssessmentNode(
                  currentNode, assessmentNodeProps, this.onEditNode,
                  this.onNodeRemove, this.onFocus, this.canRemoveNode(), this)}
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

