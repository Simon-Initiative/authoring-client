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

import ResourceSelection from 'utils/selection/ResourceSelection';

import './AssessmentEditor.scss';

export interface AssessmentEditorProps extends AbstractEditorProps<models.AssessmentModel> {
  onFetchSkills: (courseId: string) => void;
  activeContext: ActiveContext;
  onUpdateContent: (documentId: string, content: Object) => void;
  onUpdateContentSelection: (
    documentId: string, content: Object, container: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
}

interface AssessmentEditorState extends AbstractEditorState {
  currentPage: string;
  currentNode: contentTypes.Node;
}


class AssessmentEditor extends AbstractEditor<models.AssessmentModel,
  AssessmentEditorProps,
  AssessmentEditorState>  {

  pendingCurrentNode: Maybe<contentTypes.Node>;
  supportedElements: Immutable.List<string>;

  constructor(props : AssessmentEditorProps) {
    super(props, ({
      currentPage: props.model.pages.first().guid,
      currentNode: props.model.pages.first().nodes.first(),
    } as AssessmentEditorState));

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onAddContent = this.onAddContent.bind(this);
    this.onAddPool = this.onAddPool.bind(this);
    this.onSelectPool = this.onSelectPool.bind(this);
    this.onCancelSelectPool = this.onCancelSelectPool.bind(this);
    this.onInsertPool = this.onInsertPool.bind(this);
    this.onPageEdit = this.onPageEdit.bind(this);

    this.getCurrentPage = this.getCurrentPage.bind(this);
    this.onAddPage = this.onAddPage.bind(this);
    this.onRemovePage = this.onRemovePage.bind(this);
    this.onTypeChange = this.onTypeChange.bind(this);
    this.onNodeRemove = this.onNodeRemove.bind(this);
    this.onEditNode = this.onEditNode.bind(this);

    this.onFocus = this.onFocus.bind(this);

    this.pendingCurrentNode = Maybe.nothing<contentTypes.Node>();

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
        || this.state.currentPage !== nextState.currentPage
        || this.state.currentNode !== nextState.currentNode
        || this.state.undoStackSize !== nextState.undoStackSize
        || this.state.redoStackSize !== nextState.redoStackSize;

    return shouldUpdate;
  }

  componentWillReceiveProps(nextProps: AssessmentEditorProps) {

    const currentPage = this.getCurrentPage(nextProps);

    // Handle the case that the current node has changed externally,
    // for instance, from an undo/redo
    findNodeByGuid(currentPage.nodes, this.state.currentNode.guid)
      .lift(currentNode => this.setState({ currentNode }));

    this.pendingCurrentNode
      .bind(node => findNodeByGuid(currentPage.nodes, node.guid))
      .map((currentNode) => {
        this.pendingCurrentNode = Maybe.nothing<contentTypes.Node>();
        this.setState({ currentNode });
      });
  }

  getCurrentPage(props) {
    return props.model.pages.get(this.state.currentPage)
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

    const nodes = this.getCurrentPage(this.props).nodes;

    this.detectPoolAdditions(node, nodes);

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
    this.setState({ currentNode });
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
    return <TitleContentEditor
            parent={null}
            onFocus={this.onFocus.bind(this, this.props.model.title, this)}
            services={this.props.services}
            context={this.props.context}
            editMode={this.props.editMode}
            model={this.props.model.title}
            onEdit={this.onTitleEdit}
            />;
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

  onAddPage() {
    const text = 'Page ' + (this.props.model.pages.size + 1);
    let page = new contentTypes.Page()
      .with({ title: contentTypes.Title.fromText(text) });

    let content = new contentTypes.Content();
    content = content.with({ guid: guid() });

    const question = createMultipleChoiceQuestion('single');

    page = page.with({
      nodes: page.nodes.set(content.guid, content)
        .set(question.guid, question),
    });

    this.handleEdit(
      this.props.model.with({
        pages: this.props.model.pages.set(page.guid, page) }),
      () => this.setState({
        currentPage: page.guid,
        currentNode: page.nodes.get(content.guid) }),
    );
  }

  onRemovePage(page: contentTypes.Page) {
    if (this.props.model.pages.size > 1) {

      const guid = page.guid;
      const removed = this.props.model.with({ pages: this.props.model.pages.delete(guid) });

      if (guid === this.state.currentPage) {
        this.setState(
          {
            currentPage: removed.pages.first().guid,
            currentNode: removed.pages.first().nodes.first(),
          },
          () => this.handleEdit(removed),
        );
      } else {
        this.handleEdit(removed);
      }
    }
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

  renderPagination() {

    const addButton = <button disabled={!this.props.editMode}
      type="button" className="btn btn-link btn-sm"
      onClick={this.onAddPage}>Add Page</button>;


    return (

      <Collapse caption="Pagination" expanded={addButton}>

        <div style={ { marginLeft: '25px' } }>

          <PageSelection
            {...this.props}
            onFocus={() => this.onFocus.call(this, this.getCurrentPage(this.props), this)}
            onRemove={this.onRemovePage}
            editMode={this.props.editMode}
            pages={this.props.model.pages}
            current={this.getCurrentPage(this.props)}
            onChangeCurrent={(currentPage) => {
              const page = this.props.model.pages.get(currentPage);
              const currentNode = page.nodes.first();
              this.setState({ currentPage, currentNode });
            }}
            onEdit={this.onPageEdit}/>

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

    const page = this.getCurrentPage(this.props);

    // We currently do not allow expanding / collapsing in the outline,
    // so we simply tell the outline to expand every node.
    const expanded = Immutable.Set<string>(page.nodes.toArray().map(n => n.guid));

    const text = this.props.model.title.text.extractPlainText().caseOf({
      just: s => s,
      nothing: () => '',
    });

    const rendererProps = {
      model: this.props.model,
      skills: this.props.context.skills,
      editMode: this.props.editMode,
      context: this.props.context,
      services: this.props.services,
    };

    return (
      <div className="assessment-editor">
        <h2 className="title-row">{text}</h2>
        <ContextAwareToolbar />
        <div className="assessment-content">
          <div className="html-editor-well">
            {this.renderAdd()}

            <div className="outline">
              <div className="outlineContainer">
                <Outline
                  editMode={this.props.editMode}
                  nodes={page.nodes}
                  expandedNodes={expanded}
                  selected={this.state.currentNode.guid}
                  onEdit={this.onEditNodes.bind(this)}
                  onChangeExpansion={this.onChangeExpansion.bind(this)}
                  onSelect={this.onSelect.bind(this)}
                  />
              </div>
              <div className="nodeContainer">
                {renderAssessmentNode(
                  this.state.currentNode, rendererProps, this.onEditNode,
                  this.onNodeRemove, this.onFocus, this.canRemoveNode(), this)}
              </div>
            </div>
          </div>
          <ContextAwareSidebar />
        </div>
      </div>);

  }

}

export default AssessmentEditor;

