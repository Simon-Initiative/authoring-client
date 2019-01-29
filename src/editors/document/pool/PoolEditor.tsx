import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import {
  AbstractEditor, AbstractEditorProps, AbstractEditorState,
} from 'editors/document/common/AbstractEditor';
import * as models from 'data/models';
import * as contentTypes from 'data/contentTypes';
import { AddQuestion } from 'editors/content/question/addquestion/AddQuestion';
import { Outline } from 'editors/document/assessment/outline/Outline';
import { AssessmentNodeRenderer } from 'editors/document/common/questions';
import {
  findNodeByGuid, findQuestionById, locateNextOfKin,
} from 'editors/document/assessment/utils';
import { hasUnknownSkill } from 'utils/skills';
import { Skill } from 'types/course';
import { ContextAwareToolbar } from 'components/toolbar/ContextAwareToolbar.controller';
import { ContextAwareSidebar } from 'components/sidebar/ContextAwareSidebar.controller';
import { ActiveContext, ParentContainer, TextSelection } from 'types/active';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import * as Messages from 'types/messages';
import { buildMissingSkillsMessage } from 'utils/error';
import { RouterState } from 'reducers/router';

import './PoolEditor.scss';
import { LegacyTypes } from 'data/types';
import { ContentElement } from 'data/content/common/interfaces';
import { Node } from 'data/content/assessment/node';

interface PoolEditor {

}

export interface PoolEditorProps extends AbstractEditorProps<models.PoolModel> {
  onFetchSkills: (courseId: string) => void;
  skills: Immutable.OrderedMap<string, Skill>;
  activeContext: ActiveContext;
  onUpdateContent: (documentId: string, content: Object) => void;
  onUpdateContentSelection: (
    documentId: string, content: Object, container: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
  hover: string;
  currentNode: Maybe<contentTypes.Node>;
  onSetCurrentNodeOrPage: (documentId: string, nodeOrPageId: contentTypes.Node | string) => void;
  onUpdateHover: (hover: string) => void;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  onSetSearchParam: (name, value) => void;
  onClearSearchParam: (name) => void;
  course: models.CourseModel;
  router: RouterState;
}

interface PoolEditorState extends AbstractEditorState {
  currentNode: contentTypes.Node;
  collapseInsertPopup: boolean;
}

class PoolEditor extends AbstractEditor<models.PoolModel,
  PoolEditorProps,
  PoolEditorState>  {

  noSkillsMessage: Messages.Message;

  constructor(props) {
    super(props, { currentNode: props.model.pool.questions.first(), collapseInsertPopup: true });

    this.onEdit = this.onEdit.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.onEditNodes = this.onEditNodes.bind(this);
    this.canRemoveNode = this.canRemoveNode.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onChangeExpansion = this.onChangeExpansion.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.unFocus = this.unFocus.bind(this);
    this.onDuplicateNode = this.onDuplicateNode.bind(this);
    this.collapseInsertPopup = this.collapseInsertPopup.bind(this);

    if (hasUnknownSkill(props.model, props.skills)) {
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

    this.selectRoutedOrDefaultQuestion(this.props.router);
  }

  componentWillReceiveProps(nextProps: PoolEditorProps) {
    if (this.props.context.skills.size <= 0 && nextProps.context.skills.size > 0) {
      this.props.dismissMessage(this.noSkillsMessage);
    }

    if (this.props.currentNode === nextProps.currentNode && this.props.model !== nextProps.model) {
      // Handle the case that the current node has changed externally,
      // for instance, from an undo/redo
      const { model, activeContext, onSetCurrentNodeOrPage } = this.props;

      const previousNodeGuid = this.props.currentNode.caseOf({
        just: currentNode => currentNode.guid,
        nothing: () => '',
      });

      findNodeByGuid(nextProps.model.pool.questions, previousNodeGuid)
        .caseOf({
          just: (currentNode) => {
            onSetCurrentNodeOrPage(activeContext.documentId.valueOr(null), currentNode);
          },
          nothing: () => {
            locateNextOfKin(model.pool.questions, previousNodeGuid).lift(node =>
              onSetCurrentNodeOrPage(
                activeContext.documentId.valueOr(null), node));
          },
        });
    }
    if (this.props.router !== nextProps.router) {
      this.selectRoutedOrDefaultQuestion(nextProps.router);
    }
  }

  selectFirstQuestion = () => {
    const { activeContext, onSetCurrentNodeOrPage } = this.props;
    onSetCurrentNodeOrPage(
      activeContext.documentId.valueOr(null), this.props.model.pool.questions.first());
  }

  selectRoutedOrDefaultQuestion = (router: RouterState) => {
    const { activeContext, onSetCurrentNodeOrPage, model } = this.props;

    if (router.urlParams.get('questionId')) {
      const urlSelectedQuestion =
        findQuestionById(model.pool.questions, router.urlParams.get('questionId'));

      urlSelectedQuestion.caseOf({
        just: question => onSetCurrentNodeOrPage(activeContext.documentId.valueOr(null), question),
        nothing: () => this.selectFirstQuestion(),
      });
    } else if (router.urlParams.get('nodeGuid')) {
      const urlSelectedNode =
        findNodeByGuid(model.pool.questions, router.urlParams.get('nodeGuid'));

      urlSelectedNode.caseOf({
        just: node => onSetCurrentNodeOrPage(activeContext.documentId.valueOr(null), node),
        nothing: () => this.selectFirstQuestion(),
      });
    } else {
      this.selectFirstQuestion();
    }
  }

  addQuestion(question: contentTypes.Question) {
    const pool = this.props.model.pool.with({
      questions: this.props.model.pool.questions.set(question.guid, question),
    });
    const updated = this.props.model.with({ pool });

    this.props.onSetCurrentNodeOrPage(this.props.activeContext.documentId.valueOr(null), question);
    this.handleEdit(updated);
    this.setState({
      collapseInsertPopup: true,
    });
  }

  onTitleEdit(ct: ContiguousText, src) {
    const t = ct.extractPlainText().caseOf({ just: s => s, nothing: () => '' });

    const resource = this.props.model.resource.with({ title: t });

    const content = this.props.model.pool.title.text.content.set(ct.guid, ct);
    const text = this.props.model.pool.title.text.with({ content });
    const title = this.props.model.pool.title.with({ text });
    const pool = this.props.model.pool.with({ title });

    this.props.onEdit(this.props.model.with({ pool, resource }));
  }

  onEdit(guid: string, question: contentTypes.Node, src) {
    if (question.contentType !== 'Question') {
      return;
    }

    const { onSetCurrentNodeOrPage, activeContext } = this.props;

    const questions = this.props.model.pool.questions.set(guid, question);
    const pool = this.props.model.pool.with({ questions });

    onSetCurrentNodeOrPage(activeContext.documentId.valueOr(null), question);
    this.props.onUpdateContent(this.props.context.documentId, src);

    this.handleEdit(this.props.model.with({ pool }));
  }

  onEditNodes(questions: Immutable.OrderedMap<string, contentTypes.Question>) {

    const pool = this.props.model.pool.with({ questions });
    this.handleEdit(this.props.model.with({ pool }));
  }

  canRemoveNode() {
    const { model } = this.props;

    const isQuestion = node => node.contentType === 'Question';

    return model.pool.questions.filter(isQuestion).size > 1;
  }

  onChangeExpansion(nodes: Immutable.Set<string>) {
    // Nothing to do here, as we are not allowing changing the
    // expanded state of nodes in the outline
  }

  onSelect(node: contentTypes.Node) {
    const { onSetSearchParam, onClearSearchParam } = this.props;

    if (node.contentType === 'Question') {
      onSetSearchParam('questionId', node.id);
      onClearSearchParam('nodeGuid');
    } else {
      onSetSearchParam('nodeGuid', node.guid);
      onClearSearchParam('questionId');
    }
  }

  onFocus(model: Object, parent, textSelection) {
    this.props.onUpdateContentSelection(
      this.props.context.documentId, model, parent, textSelection);
  }

  unFocus() {
    this.props.onUpdateContentSelection(
      this.props.context.documentId, null, null, Maybe.nothing());
  }

  onRemove(guid: string) {

    const { model, activeContext, onSetCurrentNodeOrPage } = this.props;

    if (model.pool.questions.size > 1) {

      const pool = model.pool.with({ questions: model.pool.questions.delete(guid) });

      // Pick a new node to be the current node

      // Find the index where the question to remove is located
      const index = this.props.model.pool.questions
        .toArray()
        .findIndex(q => q.guid === guid);

      // Account for the case that the question removed was last
      const adjustedIndex = pool.questions.size === index ? index - 1 : index;

      // Get the node at the adjusted index
      const newCurrent = pool.questions
        .toArray()[adjustedIndex];
      onSetCurrentNodeOrPage(activeContext.documentId.valueOr(null), newCurrent);

      this.handleEdit(this.props.model.with({ pool }));
    }

  }

  onDuplicateNode() {
    const { currentNode } = this.props;

    currentNode.lift((node) => {
      if (node.contentType === 'Question') {
        const duplicated = node.clone();
        this.addQuestion(duplicated);
      }
    });
  }

  renderAdd() {
    const { editMode } = this.props;
    const { collapseInsertPopup } = this.state;

    return (
      <React.Fragment>
        {console.log('here')}
        <div className={`insert-popup ${collapseInsertPopup ? 'collapsed' : ''}`}>
          <AddQuestion
            editMode={editMode}
            onQuestionAdd={this.addQuestion.bind(this)}
            assessmentType={LegacyTypes.assessment2_pool} />
        </div>
        <a onClick={this.collapseInsertPopup} className="insert-new">Insert new...</a>
      </React.Fragment>
    );
  }

  collapseInsertPopup() {
    this.setState({
      collapseInsertPopup: !this.state.collapseInsertPopup,
    });
  }

  render() {
    const { context, services, editMode, model, onEdit, course, currentNode } = this.props;

    // We currently do not allow expanding / collapsing in the outline,
    // so we simply tell the outline to expand every node.
    const expanded = Immutable.Set<string>(model.pool.questions.toArray().map(n => n.guid));

    const activeContentGuid = this.props.activeContext.activeChild.caseOf({
      just: c => (c as any).guid,
      nothing: () => '',
    });

    return (
      <div className="pool-editor">
        <ContextAwareToolbar editMode={editMode} context={context} model={model} />
        <div className="pool-content">
          <div className="html-editor-well" onClick={() => this.unFocus()}>

            <TitleTextEditor
              context={context}
              services={services}
              onFocus={() => this.unFocus()}
              model={(model.pool.title.text.content.first() as ContiguousText)}
              editMode={editMode}
              onEdit={this.onTitleEdit}
              editorStyles={{ fontSize: 32 }} />

            <div className="outline-and-node-container">
              <Outline
                editMode={this.props.editMode}
                nodes={model.pool.questions}
                expandedNodes={expanded}
                selected={currentNode.caseOf({ just: node => node.guid, nothing: () => '' })}
                onEdit={this.onEditNodes.bind(this)}
                onChangeExpansion={this.onChangeExpansion.bind(this)}
                onSelect={this.onSelect}
                course={course}>
                {this.renderAdd()}
              </Outline>
              {currentNode.caseOf({
                just: node =>
                  <AssessmentNodeRenderer
                    {...this.props}
                    allSkills={this.props.context.skills}
                    activeContentGuid={activeContentGuid}
                    model={node}
                    onEdit={(c: Node, src: ContentElement) => this.onEdit(node.guid, c, src)}
                    onRemove={this.onRemove}
                    onFocus={this.onFocus}
                    canRemove={this.canRemoveNode()}
                    onDuplicate={this.onDuplicateNode}
                    nodeParentModel={model}
                    parent={null}
                    isQuestionPool={true}
                  />,
                nothing: () => null
              })}
            </div>
          </div>
          <ContextAwareSidebar
            context={context}
            services={services}
            editMode={editMode}
            model={model}
            onEditModel={onEdit} />
        </div>
      </div>
    );
  }

}

export default PoolEditor;
