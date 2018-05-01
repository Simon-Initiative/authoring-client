import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';
import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import { AddQuestion } from '../../content/question/AddQuestion';
import { Outline } from '../assessment/Outline';
import { renderAssessmentNode } from '../common/questions';
import { findNodeByGuid } from '../assessment/utils';
import { hasUnknownSkill } from 'utils/skills';
import { Skill } from 'types/course';
import { ContextAwareToolbar } from 'components/toolbar/ContextAwareToolbar.controller';
import { ContextAwareSidebar } from 'components/sidebar/ContextAwareSidebar.controller';
import { ActiveContext, ParentContainer, TextSelection } from 'types/active';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import * as Messages from 'types/messages';
import { buildMissingSkillsMessage } from 'utils/error';

import './PoolEditor.scss';

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
  onUpdateHover: (hover: string) => void;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
}

interface PoolEditorState extends AbstractEditorState {
  currentNode: contentTypes.Node;
}

class PoolEditor extends AbstractEditor<models.PoolModel,
  PoolEditorProps,
  PoolEditorState>  {

  noSkillsMessage: Messages.Message;
  pendingCurrentNode: Maybe<contentTypes.Question>;

  constructor(props) {
    super(props, { currentNode: props.model.pool.questions.first() });

    this.onEdit = this.onEdit.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.onEditNodes = this.onEditNodes.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onChangeExpansion = this.onChangeExpansion.bind(this);
    this.onFocus = this.onFocus.bind(this);

    this.pendingCurrentNode = Maybe.nothing<contentTypes.Question>();

    if (hasUnknownSkill(props.model, props.skills)) {
      props.onFetchSkills(props.context.courseId);
    }
  }

  componentDidMount() {
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

  componentWillReceiveProps(nextProps: PoolEditorProps) {
    if (this.props.context.skills.size <= 0 && nextProps.context.skills.size > 0) {
      this.props.dismissMessage(this.noSkillsMessage);
    }

    findNodeByGuid(nextProps.model.pool.questions, this.state.currentNode.guid)
      .lift(currentNode => this.setState({ currentNode }));

    this.pendingCurrentNode
      .lift((currentNode) => {
        this.pendingCurrentNode = Maybe.nothing<contentTypes.Question>();
        this.setState({ currentNode });
      });
  }

  addQuestion(q) {

    const pool = this.props.model.pool.with(
      { questions: this.props.model.pool.questions.set(q.guid, q) });
    const updated = this.props.model.with({ pool });

    this.pendingCurrentNode = Maybe.just(q);
    this.handleEdit(updated);
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

  onEdit(guid : string, question : contentTypes.Question, src) {

    const questions = this.props.model.pool.questions.set(guid, question);
    const pool = this.props.model.pool.with({ questions });

    this.props.onUpdateContent(this.props.context.documentId, src);

    this.handleEdit(this.props.model.with({ pool }));
  }

  onEditNodes(questions: Immutable.OrderedMap<string, contentTypes.Question>) {

    const pool = this.props.model.pool.with({ questions });
    this.handleEdit(this.props.model.with({ pool }));
  }

  onChangeExpansion(nodes: Immutable.Set<string>) {
    // Nothing to do here, as we are not allowing changing the
    // expanded state of nodes in the outline
  }

  onSelect(currentNode: contentTypes.Node) {
    this.setState({ currentNode });
  }

  onFocus(model: Object, parent, textSelection) {
    this.props.onUpdateContentSelection(
      this.props.context.documentId, model, parent, textSelection);
  }

  onRemove(guid: string) {

    const { model } = this.props;

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

      // Set it to be the new current (pending)
      this.pendingCurrentNode = Maybe.just(newCurrent);

      this.handleEdit(this.props.model.with({ pool }));
    }

  }

  render() {
    const { context, services, editMode, model, onEdit } = this.props;

    // We currently do not allow expanding / collapsing in the outline,
    // so we simply tell the outline to expand every node.
    const expanded = Immutable.Set<string>(model.pool.questions.toArray().map(n => n.guid));

    const activeContentGuid = this.props.activeContext.activeChild.caseOf({
      just: c => (c as any).guid,
      nothing: () => '',
    });

    const assesmentNodeProps = {
      ...this.props,
      activeContentGuid,
    };

    return (
      <div className="pool-editor">
        <ContextAwareToolbar context={context} model={model}/>
        <div className="pool-content">
          <div className="html-editor-well">

            <TitleTextEditor
              context={context}
              services={services}
              onFocus={this.onFocus.bind(this)}
              model={(model.pool.title.text.content.first() as ContiguousText)}
              editMode={editMode}
              onEdit={this.onTitleEdit}
              editorStyles={{ fontSize: 32 }} />

            <AddQuestion
              editMode={this.props.editMode}
              onQuestionAdd={this.addQuestion.bind(this)}
              isSummative={true}/>

            <div className="outline">
              <div className="outlineContainer">
                <Outline
                  editMode={this.props.editMode}
                  nodes={model.pool.questions}
                  expandedNodes={expanded}
                  selected={this.state.currentNode.guid}
                  onEdit={this.onEditNodes.bind(this)}
                  onChangeExpansion={this.onChangeExpansion.bind(this)}
                  onSelect={this.onSelect.bind(this)}
                  />
              </div>
              <div className="nodeContainer">
                {renderAssessmentNode(
                  this.state.currentNode, assesmentNodeProps, this.onEdit,
                  this.onRemove, this.onFocus,
                  true, null)}
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
      </div>
    );
  }

}

export default PoolEditor;
