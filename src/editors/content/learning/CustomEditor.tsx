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
import { Page, Question, Node, Choice, ContiguousText, FillInTheBlank } from 'data/contentTypes';
import { AssessmentModel } from 'data/models';

export interface CustomEditorProps extends AbstractContentEditorProps<Custom> {
  documentId: string;
  assessment: AssessmentModel;
  currentPage: Page;
  currentNode: Node | any;
  selectedInitiator: string;
  onShowSidebar: () => void;
  saveAssessment: (documentId: string, updatedSssessment: AssessmentModel) => void;
  selectInitiator: (id: string) => void;
}

export interface CustomEditorState {

}

@injectSheet(styles)
export class CustomEditor
  extends AbstractContentEditor<Custom,
    StyledComponentProps<CustomEditorProps>, CustomEditorState> {

  constructor(props) {
    super(props);

    this.selectInitiator = this.selectInitiator.bind(this);
    this.removeInitiator = this.removeInitiator.bind(this);
    this.editQuestion = this.editQuestion.bind(this);
    this.renderDynaDrop = this.renderDynaDrop.bind(this);
    this.buildTargetLabelsMap = this.buildTargetLabelsMap.bind(this);
  }

  componentDidMount() {
    const { model, selectInitiator } = this.props;

    const initiators = model.layoutData.caseOf({
      just: ld => ld.initiatorGroup.initiators,
      nothing: () => Immutable.List<InitiatorModel>(),
    });

    selectInitiator(initiators.first().assessmentId);
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

  selectInitiator(id: string) {
    const { selectInitiator } = this.props;

    selectInitiator(id);
  }

  removeInitiator(guid: string) {
    console.log('NOT IMPLEMENTED');
  }

  editQuestion(question: Question) {
    const { documentId, currentPage, assessment, saveAssessment } = this.props;

    saveAssessment(documentId, assessment.with({
      pages: assessment.pages.set(currentPage.guid, currentPage.with({
        nodes: currentPage.nodes.set(question.guid, question),
      })),
    }));
  }

  buildTargetLabelsMap(question: Question) {
    const { selectedInitiator } = this.props;

    //TODO selectedInitiator should really be a Maybe<string> type

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
  }

  renderDynaDrop() {
    const { classes, model, editMode, currentNode } = this.props;
    const question = currentNode as Question;

    const rows = model.layoutData.caseOf({
      just: ld => ld.targetGroup.rows,
      nothing: () => Immutable.List<TG_COL>(),
    });

    const initiators = model.layoutData.caseOf({
      just: ld => ld.initiatorGroup.initiators,
      nothing: () => Immutable.List<InitiatorModel>(),
    });

    // build target labels map from guid to label using the selected initiator
    const targetLabels = this.buildTargetLabelsMap(question);

    return (
      <div className={classes.dynaDropTable}>
        <p className={classes.instructions}>
          Each cell could either be a label or a drop target. Hover over a cell to specify its type.
          To assign matching, select each drop target cell and provide feedback
          (both correct and incorrect) for each option for the target cells.
        </p>
        <table>
          <thead>
            {rows.filter(row => row.contentType === 'HeaderRow').map(row => (
              <tr>
                {row.cols.toArray().map(col => col.contentType === 'Target'
                ? (
                  <DynaDropTarget
                    id={col.guid}
                    header
                    className={classNames([classes.targetCell])}
                    label={`${targetLabels[col.assessmentId]}`} />
                )
                : (
                  <th
                    className={classes.header}
                    style={{
                      fontWeight: col.fontWeight as any,
                      fontSize: col.fontWeight,
                      fontStyle: col.fontStyle as any,
                      textDecoration: col.textDecoration,
                    }}>
                    {col.text}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.filter(row => row.contentType === 'ContentRow').toArray().map(row => (
              <tr>
                {row.cols.toArray().map(col => col.contentType === 'Target'
                  ? (
                    <DynaDropTarget
                      id={col.guid} className={classNames([classes.targetCell])}
                      label={`${targetLabels[col.assessmentId]}`} />
                  )
                  : (
                    <td
                      className={classNames([classes.cell])}
                      style={{
                        fontWeight: col.fontWeight as any,
                        fontSize: col.fontWeight,
                        fontStyle: col.fontStyle as any,
                        textDecoration: col.textDecoration,
                      }}>
                      {col.text}
                    </td>
                ))}
              </tr>
            ))}
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
        <div className={classes.initiators}>
          {initiators.map(initiator => (
            <Initiator
              model={initiator} editMode={editMode}
              onSelect={this.selectInitiator} onRemove={this.removeInitiator} />
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
