import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';
import { TitleContentEditor } from '../../content/title/TitleContentEditor';
import { PageSelection } from './PageSelection';
import { TextInput } from '../../content/common/TextInput';
import * as models from '../../../data/models';
import { UndoRedoToolbar } from '../common/UndoRedoToolbar';
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

import './AssessmentEditor.scss';

export interface AssessmentEditorProps extends AbstractEditorProps<models.AssessmentModel> {
  onFetchSkills: (courseId: string) => void;
}

interface AssessmentEditorState extends AbstractEditorState {
  currentPage: string;
  currentNode: contentTypes.Node;
}


class AssessmentEditor extends AbstractEditor<models.AssessmentModel,
  AssessmentEditorProps,
  AssessmentEditorState>  {

  pendingCurrentNode: Maybe<contentTypes.Node>;

  constructor(props : AssessmentEditorProps) {
    super(props, ({
      currentPage: props.model.pages.first().guid,
      currentNode: props.model.pages.first().nodes.first(),
    } as AssessmentEditorState));

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onAddContent = this.onAddContent.bind(this);
    this.onAddPool = this.onAddPool.bind(this);
    this.onAddPoolRef = this.onAddPoolRef.bind(this);
    this.onPageEdit = this.onPageEdit.bind(this);

    this.onAddPage = this.onAddPage.bind(this);
    this.onRemovePage = this.onRemovePage.bind(this);
    this.onTypeChange = this.onTypeChange.bind(this);
    this.onNodeRemove = this.onNodeRemove.bind(this);
    this.onEdit = this.onEdit.bind(this);

    this.pendingCurrentNode = Maybe.nothing<contentTypes.Node>();

    if (hasUnknownSkill(props.model, props.context.skills)) {
      props.onFetchSkills(props.context.courseId);
    }
  }

  shouldComponentUpdate(
    nextProps: AssessmentEditorProps,
    nextState: AssessmentEditorState) : boolean {

    const shouldUpdate = this.props.model !== nextProps.model
        || this.props.expanded !== nextProps.expanded
        || this.props.editMode !== nextProps.editMode
        || this.state.currentPage !== nextState.currentPage
        || this.state.currentNode !== nextState.currentNode
        || this.state.undoStackSize !== nextState.undoStackSize
        || this.state.redoStackSize !== nextState.redoStackSize;

    return shouldUpdate;
  }

  componentWillReceiveProps(nextProps: AssessmentEditorProps) {

    const currentPage = nextProps.model.pages.get(this.state.currentPage);

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

  onPageEdit(page: contentTypes.Page) {
    const pages = this.props.model.pages.set(page.guid, page);
    this.handleEdit(this.props.model.with({ pages }));
  }

  onTitleEdit(content: contentTypes.Title) {
    const resource = this.props.model.resource.with({ title: content.text });
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

  onEdit(guid : string, node : models.Node) {

    const nodes = this.props.model.pages.get(this.state.currentPage).nodes;

    this.detectPoolAdditions(node, nodes);

    this.onEditNodes(Tree.updateNode(guid, node, nodes, getChildren, setChildren));
  }

  onEditNodes(nodes: Immutable.OrderedMap<string, models.Node>) {

    let page = this.props.model.pages.get(this.state.currentPage);
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
    const page = this.props.model.pages.get(this.state.currentPage);

    return page.nodes.filter(n => n.contentType === 'Question').size > 1;
  }

  onNodeRemove(guid: string) {

    let page = this.props.model.pages.get(this.state.currentPage);

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
            services={this.props.services}
            context={this.props.context}
            editMode={this.props.editMode}
            model={this.props.model.title}
            onEdit={this.onTitleEdit}
            />;
  }

  onAddContent() {
    let content = new contentTypes.Content();
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
    let page = this.props.model.pages.get(this.state.currentPage);
    page = page.with({ nodes: page.nodes.set(node.guid, node) });

    const pages = this.props.model.pages.set(page.guid, page);

    this.handleEdit(this.props.model.with({ pages }));
  }

  onAddPage() {
    const text = 'Page ' + (this.props.model.pages.size + 1);
    let page = new contentTypes.Page()
      .with({ title: new contentTypes.Title().with({ text }) });

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

  onAddPoolRef() {
    const pool = new contentTypes.Selection({ source: new contentTypes.PoolRef() });
    this.addNode(pool);
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
            onRemove={this.onRemovePage}
            editMode={this.props.editMode}
            pages={this.props.model.pages}
            current={this.props.model.pages.get(this.state.currentPage)}
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
          onClick={this.onAddPoolRef}>Question Pool</button>

      </div>
    );
  }

  render() {

    const titleEditor = this.renderTitle();
    const page = this.props.model.pages.get(this.state.currentPage);

    // We currently do not allow expanding / collapsing in the outline,
    // so we simply tell the outline to expand every node.
    const expanded = Immutable.Set<string>(page.nodes.toArray().map(n => n.guid));

    const rendererProps = {
      model: this.props.model,
      skills: this.props.context.skills,
      editMode: this.props.editMode,
      context: this.props.context,
      services: this.props.services,
    };

    return (
      <div className="assessment-editor">
        <div className="docHead">

          <UndoRedoToolbar
            undoEnabled={this.state.undoStackSize > 0}
            redoEnabled={this.state.redoStackSize > 0}
            onUndo={this.undo.bind(this)} onRedo={this.redo.bind(this)}/>

          {titleEditor}

          <div style={ { marginTop: '10px' } }/>

          <div>
            {this.props.model.type === LegacyTypes.assessment2
              ? this.renderSettings() : null}
            {this.renderPagination()}
          </div>

          <div style={ { marginTop: '5px' } }/>

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
                this.state.currentNode, rendererProps, this.onEdit,
                this.onNodeRemove, this.canRemoveNode())}
            </div>
          </div>
        </div>
      </div>);

  }

}

export default AssessmentEditor;

