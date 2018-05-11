import * as React from 'react';
import * as Immutable from 'immutable';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames } from 'styles/jss';
import { Custom } from 'data/content/assessment/custom';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { TG_COL } from 'data/content/assessment/dragdrop/target_group';
import { convert } from 'utils/format';

import { styles } from './CustomEditor.styles';
import { Initiator as InitiatorModel } from 'data/content/assessment/dragdrop/initiator';
import { Initiator } from './dynadragdrop/Initiator';
import { DynaDropTarget } from './dynadragdrop/DynaDropTarget.controller';
import { Button } from 'editors/content/common/Button';
import { Page, Question, Node, Part, Choice, ContiguousText,
  FillInTheBlank } from 'data/contentTypes';
import { AssessmentModel } from 'data/models';

const buildTargetLabelsMap = (question: Question, selectedInitiator: string) => {
  const currentItem = question.items.toArray().find(
    (item: FillInTheBlank) => item.id === selectedInitiator) as FillInTheBlank;

  if (!currentItem) {
    return {};
  }

  return currentItem.choices.toArray().reduce(
    (acc, choice: Choice, index) => ({
      ...acc,
      [(choice.body.content.first() as ContiguousText).extractPlainText().valueOr(null)]:
      convert.toAlphaNotation(index),
    }),
    {},
  );
};

const buildInitiatorPartMap = (question: Question, initiators: Immutable.List<InitiatorModel>) => {
  return initiators.reduce(
    (acc, val) =>
      acc.set(val.assessmentId, question.parts.find(part =>
        part.responses.first().input === val.assessmentId,
      )),
    Immutable.Map<string, Part>(),
  );
};

const buildTargetInitiatorsMap =
(question: Question, initiators: Immutable.List<InitiatorModel>) => {
  // A utility map used by the following reduce funciton.
  // It creates a map of initiators key'd off of their assessmentId
  const initiatorsMap = initiators.toArray().reduce(
    (acc, initiator) => {
      return {
        ...acc,
        [initiator.assessmentId]: initiator,
      };
    },
    {},
  );

  // This reduce function goes through every Response in every Part to build a map
  // of initiators that are key'd off of the responses "match" value. This enables
  // us to easily look up initiators associated to target's assessmentId
  return question.parts.reduce(
    (accParts, part) => ({
      ...accParts,
      ...part.responses.reduce(
        (accResponses, response) => (+response.score > 0)
          ? ({
            ...accResponses,
            [response.match]:
              (accResponses[response.match] || []).concat(initiatorsMap[response.input]),
          })
          : accResponses,
        accParts,
      ),
    }),
    {},
  );
};

const setQuestionPartWithInitiatorScore = (
  initiatorId: string, targetAssessmentId: string, score: number,
  model: Custom, question: Question) => {

  const initiators = model.layoutData.caseOf({
    just: ld => ld.initiatorGroup.initiators,
    nothing: () => Immutable.List<InitiatorModel>(),
  });

  // get initiator with specified id
  const initiator = initiators.find(i => i.guid === initiatorId);

  const initiatorParts = buildInitiatorPartMap(question, initiators);

  const updatedResponse = initiatorParts.get(initiator.assessmentId).responses.find(response =>
    response.match === targetAssessmentId)
    .with({
      score: `${score}`,
    });

  const updatedPart = initiatorParts.get(initiator.assessmentId).withMutations((part: Part) =>
    part.with({
      responses: part.responses.set(updatedResponse.guid, updatedResponse),
    }),
  ) as Part;

  return question.with({
    parts: question.parts.set(updatedPart.guid, updatedPart),
  });
};

export interface CustomEditorProps extends AbstractContentEditorProps<Custom> {
  documentId: string;
  assessment: AssessmentModel;
  currentPage: Page;
  currentNode: Node | any;
  selectedInitiator: string;
  onShowSidebar: () => void;
  onSaveAssessment: (documentId: string, updatedAssessment: AssessmentModel) => void;
  onSelectInitiator: (id: string) => void;
}

export interface CustomEditorState {

}

@injectSheet(styles)
export class CustomEditor
  extends AbstractContentEditor<Custom,
    StyledComponentProps<CustomEditorProps>, CustomEditorState> {

  constructor(props) {
    super(props);

    this.assignInitiator = this.assignInitiator.bind(this);
    this.unassignInitiator = this.unassignInitiator.bind(this);
    this.selectInitiator = this.selectInitiator.bind(this);
    this.deleteInitiator = this.deleteInitiator.bind(this);
    this.onEditQuestion = this.onEditQuestion.bind(this);
    this.renderDynaDrop = this.renderDynaDrop.bind(this);
  }

  componentDidMount() {
    const { model, onSelectInitiator } = this.props;

    const initiators = model.layoutData.caseOf({
      just: ld => ld.initiatorGroup.initiators,
      nothing: () => Immutable.List<InitiatorModel>(),
    });

    onSelectInitiator(initiators.first().assessmentId);
  }

  renderSidebar(): JSX.Element {
    return (
      <SidebarContent title="" />
    );
  }

  renderToolbar(): JSX.Element {
    return (
      <ToolbarGroup label="Custom" highlightColor={CONTENT_COLORS.Custom} columns={4}>
      </ToolbarGroup>
    );
  }

  assignInitiator(initiatorId: string, targetAssessmentId: string) {
    const { model, currentNode } = this.props;

    const updatedQuestion = setQuestionPartWithInitiatorScore(
      initiatorId, targetAssessmentId, 1, model, currentNode as Question);

    this.onEditQuestion(updatedQuestion);
  }

  unassignInitiator(initiatorId: string, targetAssessmentId: string) {
    const { model, currentNode } = this.props;

    const updatedQuestion = setQuestionPartWithInitiatorScore(
      initiatorId, targetAssessmentId, 0, model, currentNode as Question);

    this.onEditQuestion(updatedQuestion);
  }

  selectInitiator(id: string) {
    const { onSelectInitiator } = this.props;

    onSelectInitiator(id);
  }

  deleteInitiator(guid: string) {
    console.log('NOT IMPLEMENTED');
  }

  onEditQuestion(question: Question) {
    const { documentId, currentPage, assessment, onSaveAssessment } = this.props;

    onSaveAssessment(documentId, assessment.with({
      pages: assessment.pages.set(currentPage.guid, currentPage.with({
        nodes: currentPage.nodes.set(question.guid, question),
      })),
    }));
  }

  renderDynaDrop() {
    const { classes, model, editMode, currentNode, selectedInitiator } = this.props;
    const question = currentNode as Question;

    const rows = model.layoutData.caseOf({
      just: ld => ld.targetGroup.rows,
      nothing: () => Immutable.List<TG_COL>(),
    });

    const initiators = model.layoutData.caseOf({
      just: ld => ld.initiatorGroup.initiators,
      nothing: () => Immutable.List<InitiatorModel>(),
    });

    // build a map of targets to initiators
    const targetInitiators = buildTargetInitiatorsMap(question, initiators);

    // build map of target ids to labels using the selected initiator
    const targetLabels = buildTargetLabelsMap(question, selectedInitiator);

    const renderTableRow = (row) => {
      const isHeader = row.contentType === 'HeaderRow';
      const Tcell = isHeader ? 'th' : 'td';

      return (
        <tr>
          {row.cols.toArray().map(col => col.contentType === 'Target'
          ? (
            <DynaDropTarget
              id={col.guid}
              assessmentId={col.assessmentId}
              header
              className={classNames([classes.targetCell])}
              editMode={editMode}
              onDrop={this.assignInitiator}
              onRemoveInitiator={this.unassignInitiator}
              label={`Target ${targetLabels[col.assessmentId]}`}
              initiators={targetInitiators[col.assessmentId]} />
          )
          : (
            <Tcell
              className={isHeader ? classes.header : classes.cell}
              style={{
                fontWeight: col.fontWeight as any,
                fontSize: col.fontWeight,
                fontStyle: col.fontStyle as any,
                textDecoration: col.textDecoration,
              }}>
              {col.text}
            </Tcell>
          ))}
        </tr>
      );
    };

    return (
      <div className={classes.dynaDropTable}>
        <p className={classes.instructions}>
          Each cell can either be a label or a drop target. Hover over a cell and click
          the type toggle to change it's type.
        </p>
        <table>
          <thead>
            {rows.filter(row => row.contentType === 'HeaderRow').map(renderTableRow)}
          </thead>
          <tbody>
            {rows.filter(row => row.contentType === 'ContentRow').map(renderTableRow)}
          </tbody>
        </table>
        <div>
          <Button type="link" editMode={editMode}
            onClick={() => console.log('Add Row - NOT IMPLEMENTED')} >
            <i className="fa fa-plus" /> Add a Row
          </Button>
          <Button type="link" editMode={editMode}
            onClick={() => console.log('Add Column - NOT IMPLEMENTED')} >
            <i className="fa fa-plus" /> Add a Column
          </Button>
        </div>
        <p className={classes.instructions}>
          Select each choice below and provide feedback (both correct and incorrect)
          for each target. Drag a choice to a drop target to assign it as a correct match.
        </p>
        <div className={classes.initiators}>
          {initiators.map(initiator => (
            <Initiator
              model={initiator} editMode={editMode}
              selected={initiator.assessmentId === selectedInitiator}
              onSelect={this.selectInitiator} onDelete={this.deleteInitiator} />
          ))}
        </div>
        <div>
          <Button type="link" editMode={editMode}
            onClick={() => console.log('Add Choice - NOT IMPLEMENTED')} >
            <i className="fa fa-plus" /> Add a Choice
          </Button>
        </div>
      </div>
    );
  }

  renderMain() : JSX.Element {
    const { className, classes, model } = this.props;

    return (
      <div className={classNames([classes.customEditor, className])}>
        {model.src.substr(11) === 'DynaDrop.js'
          ? '[Custom Element]'
          : this.renderDynaDrop()
        }
      </div>
    );
  }
}
