import * as React from 'react';
import * as Immutable from 'immutable';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames } from 'styles/jss';
import { Custom } from 'data/content/assessment/custom';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from '../../common/AbstractContentEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { TG_ROW } from 'data/content/assessment/dragdrop/target_group';
import { convert } from 'utils/format';
import { Initiator as InitiatorModel } from 'data/content/assessment/dragdrop/initiator';
import { Initiator } from './Initiator';
import { DynaDropLabel } from './DynaDropLabel';
import { DynaDropTarget } from './DynaDropTarget.controller';
import { Button } from 'editors/content/common/Button';
import { Page, Question, Node, Item, Part, Choice, Response, ContiguousText,
  FillInTheBlank } from 'data/contentTypes';
import { AssessmentModel } from 'data/models';
import guid from 'utils/guid';
import { Target } from 'data/content/assessment/dragdrop/target';
import { Maybe } from 'tsmonad';
import { DndLayout } from 'data/content/assessment/dragdrop/dnd_layout';
import { DndText, DndTextParams } from 'data/content/assessment/dragdrop/dnd_text';
import { ContentRow } from 'data/content/assessment/dragdrop/content_row';
import { ContiguousTextMode } from 'data/content/learning/contiguous';
import { ContentElements, FLOW_ELEMENTS } from 'data/content/common/elements';
import { ALT_FLOW_ELEMENTS } from 'data/content/assessment/types';
import { Feedback } from 'data/content/assessment/feedback';
import {
  choiceAssessmentIdSort, setQuestionPartWithInitiatorScore, updateItemPartsFromTargets,
  getTargetsFromLayout, buildTargetLabelsMap, buildTargetInitiatorsMap,
} from 'editors/content/learning/dynadragdrop/utils';
import { ContentTypes } from 'data/content/org/types';
import { throttle } from 'utils/timing';
import { ToolbarDropdown, ToolbarDropdownSize } from 'components/toolbar/ToolbarDropdown';

import { styles } from './DynaDragDropEditor.styles';

export interface DynaDragDropEditorProps extends AbstractContentEditorProps<Custom> {
  documentId: string;
  assessment: AssessmentModel;
  currentPage: Page;
  currentNode: Node | any;
  selectedInitiator: string;
  onShowSidebar: () => void;
  onSaveAssessment: (documentId: string, updatedAssessment: AssessmentModel) => void;
  onSelectInitiator: (id: string) => void;
}

export interface DynaDragDropEditorState {

}

@injectSheet(styles)
export class DynaDragDropEditor
  extends AbstractContentEditor<Custom,
    StyledComponentProps<DynaDragDropEditorProps>, DynaDragDropEditorState> {

  constructor(props) {
    super(props);

    this.assignInitiator = this.assignInitiator.bind(this);
    this.unassignInitiator = this.unassignInitiator.bind(this);
    this.selectInitiator = this.selectInitiator.bind(this);
    this.addInitiator = this.addInitiator.bind(this);
    this.deleteInitiator = this.deleteInitiator.bind(this);
    this.onTargetDrop = this.onTargetDrop.bind(this);
    this.onEditQuestion = this.onEditQuestion.bind(this);
    this.onEditLayoutData = this.onEditLayoutData.bind(this);
    this.onAddColumn = this.onAddColumn.bind(this);
    this.onAddRow = this.onAddRow.bind(this);
    this.editColText = this.editColText.bind(this);
    this.toggleCellType = this.toggleCellType.bind(this);
  }

  shouldComponentUpdate(nextProps: DynaDragDropEditorProps, nextState) {
    return this.props.model !== nextProps.model
      || this.props.parent !== nextProps.parent
      || this.props.editMode !== nextProps.editMode
      || this.props.activeContentGuid !== nextProps.activeContentGuid
      || this.props.hover !== nextProps.hover
      || this.props.documentId !== nextProps.documentId
      || this.props.assessment !== nextProps.assessment
      || this.props.currentPage !== nextProps.currentPage
      || this.props.currentNode !== nextProps.currentNode
      || this.props.selectedInitiator !== nextProps.selectedInitiator;
  }

  componentDidMount() {
    const { model, onSelectInitiator } = this.props;

    const initiators = model.layoutData.caseOf({
      just: ld => ld.initiatorGroup.initiators,
      nothing: () => Immutable.List<InitiatorModel>(),
    });

    onSelectInitiator(initiators.first() && initiators.first().assessmentId);
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

  addInitiator() {
    const { model, currentNode, onEdit } = this.props;
    const question = currentNode as Question;

    const newInitiator = new InitiatorModel().with({
      text: 'New Choice',
      assessmentId: guid(),
    });

    let targetAssessmentIds = [];
    if (question.items.first()) {
      targetAssessmentIds = (question.items.first() as FillInTheBlank).choices
        .toArray().map(c => c.value);
    }

    const newItem = new FillInTheBlank().with({
      id: newInitiator.assessmentId,
      choices: Immutable.OrderedMap<string, Choice>([
        ...targetAssessmentIds.map((t) => {
          const choice = new Choice().with({
            value: t,
            body: new ContentElements().with({ supportedElements: Immutable.List(FLOW_ELEMENTS) }),
          });
          return [choice.guid, choice];
        }),
      ]),
    });

    const newPart = new Part().with({
      responses: Immutable.OrderedMap<string, Response>([
        ...targetAssessmentIds.map((t) => {
          const response = new Response().with({
            input: newInitiator.assessmentId,
            match: t,
            feedback: Immutable.OrderedMap<string, Feedback>().withMutations((fb) => {
              const newFeedback = new Feedback();
              return fb.set(newFeedback.guid, newFeedback);
            }),
          });
          return [response.guid, response];
        }),
      ]),
    });

    const newModel = model.with({
      layoutData: model.layoutData.caseOf({
        just: ld => Maybe.just<DndLayout>(ld.with({
          initiatorGroup: ld.initiatorGroup.with({
            initiators: ld.initiatorGroup.initiators.push(newInitiator),
          }),
        })),
        nothing: () => Maybe.nothing<DndLayout>(),
      }),
    });

    // save question updates
    this.onEditQuestion(question.with({
      body: question.body.with({
        content: question.body.content.set(newModel.guid, newModel),
      }),
      items: question.items.set(newItem.guid, newItem),
      parts: question.parts.set(newPart.guid, newPart),
    }));
  }

  deleteInitiator(initiatorId: string) {
    const { model, currentNode, onSelectInitiator } = this.props;
    const question = currentNode as Question;

    const initiators = model.layoutData.caseOf({
      just: ld => ld.initiatorGroup.initiators,
      nothing: () => Immutable.List<InitiatorModel>(),
    });

    // dont allow deletion of the last initiator
    if (initiators.size <= 1) {
      return;
    }

    // get initiator with specified id
    const initiator = initiators.find(i => i.guid === initiatorId);

    const updatedModel = model.with({
      layoutData: model.layoutData.caseOf({
        just: ld => Maybe.just<DndLayout>(ld.with({
          initiatorGroup: ld.initiatorGroup.with({
            initiators: ld.initiatorGroup.initiators
              .filter(i =>
                i.assessmentId !== initiator.assessmentId) as Immutable.List<InitiatorModel>,
          }),
        })),
        nothing: () => Maybe.nothing<DndLayout>(),
      }),
    });

    const itemKey = question.items.findKey(item =>
      (item as FillInTheBlank).id === initiator.assessmentId);
    const partKey = question.parts.findKey(part =>
      part.responses.first() &&
      part.responses.first().input === initiator.assessmentId);

    // select the first initiator in the new model
    updatedModel.layoutData.lift(ld =>
      onSelectInitiator(ld.initiatorGroup.initiators.first()
        && ld.initiatorGroup.initiators.first().assessmentId),
    );

    // save question updates
    this.onEditQuestion(question.with({
      body: question.body.with({
        content: question.body.content.set(updatedModel.guid, updatedModel),
      }),
      items: question.items.remove(itemKey),
      parts: question.parts.remove(partKey),
    }));
  }

  onTargetDrop(
    initiatorId: string, targetAssessmentId: string, originalTargetAssessmentId: string) {
    this.assignInitiator(initiatorId, targetAssessmentId);

    if (originalTargetAssessmentId && targetAssessmentId !== originalTargetAssessmentId) {
      this.unassignInitiator(initiatorId, originalTargetAssessmentId);
    }
  }

  onEditQuestion(question: Question) {
    const { documentId, currentPage, assessment, onSaveAssessment } = this.props;

    onSaveAssessment(documentId, assessment.with({
      pages: assessment.pages.set(currentPage.guid, currentPage.with({
        nodes: currentPage.nodes.set(question.guid, question),
      })),
    }));
  }

  onEditLayoutData(updatedLayoutData: DndLayout) {
    const { model, currentNode } = this.props;
    const question = currentNode as Question;

    const updatedModel = model.with({
      layoutData: Maybe.just<DndLayout>(updatedLayoutData),
    });

    // save question updates
    this.onEditQuestion(question.with({
      body: question.body.with({
        content: question.body.content.set(updatedModel.guid, updatedModel),
      }),
    }));
  }

  onAddColumn(index: number) {
    const { model, currentNode } = this.props;
    const question = currentNode as Question;

    model.layoutData.lift((ld) => {
      const updatedLayoutData = ld.with({
        targetGroup: ld.targetGroup.with({
          rows: ld.targetGroup.rows.map(r => r.contentType === 'HeaderRow'
            // HeaderRow
            ? (r.with({ cols: r.cols.splice(index, 0, new DndText()) as Immutable.List<DndText> }))
            // ContentRow
            : (r.with({ cols: r.cols.splice(index, 0, new DndText()) as Immutable.List<DndText> })),
          ) as Immutable.List<TG_ROW>,
        }),
      });

      this.onEditLayoutData(updatedLayoutData);
    });
  }

  onRemoveColumn(index: number) {
    const { model, currentNode } = this.props;
    const question = currentNode as Question;

    model.layoutData.lift((ld) => {
      const updatedLayoutData = ld.with({
        targetGroup: ld.targetGroup.with({
          rows: ld.targetGroup.rows.map(r => r.contentType === 'HeaderRow'
            // HeaderRow
            ? (r.with({ cols: r.cols.splice(index, 1) as Immutable.List<DndText> }))
            // ContentRow
            : (r.with({ cols: r.cols.splice(index, 1) as Immutable.List<DndText> })),
          ) as Immutable.List<TG_ROW>,
        }),
      });

      const updatedModel = model.with({
        layoutData: Maybe.just<DndLayout>(updatedLayoutData),
      });

      // removed column might contain targets, update item and parts accordingly
      const { items, parts } = updateItemPartsFromTargets(
        question.items as Immutable.OrderedMap<string, FillInTheBlank>,
        question.parts,
        getTargetsFromLayout(updatedLayoutData),
      );

      // save question updates
      this.onEditQuestion(question.with({
        body: question.body.with({
          content: question.body.content.set(updatedModel.guid, updatedModel),
        }),
        items,
        parts,
      }));
    });
  }

  onAddRow(index: number) {
    const { model, currentNode } = this.props;
    const question = currentNode as Question;

    model.layoutData.lift((ld) => {
      const updatedLayoutData = ld.with({
        targetGroup: ld.targetGroup.with({
          rows: ld.targetGroup.rows.splice(index, 0, new ContentRow().with({
            // use the last row as a template for the new row cols (DndText or Target)
            cols: Immutable.List<DndText | Target>(
              ld.targetGroup.rows.last()
              ? ld.targetGroup.rows.last().cols.toArray().map(c =>
                  c.contentType === 'DndText'
                  ? (new DndText())
                  : (new Target({ assessmentId: guid() })),
                )
              : [],
            ),
          })) as Immutable.List<TG_ROW>,
        }),
      });

      const updatedModel = model.with({
        layoutData: Maybe.just<DndLayout>(updatedLayoutData),
      });

      // new row might contain targets, update item and parts accordingly
      const { items, parts } = updateItemPartsFromTargets(
        question.items as Immutable.OrderedMap<string, FillInTheBlank>,
        question.parts,
        getTargetsFromLayout(updatedLayoutData),
      );

      // save question updates
      this.onEditQuestion(question.with({
        body: question.body.with({
          content: question.body.content.set(updatedModel.guid, updatedModel),
        }),
        items,
        parts,
      }));
    });
  }

  onRemoveRow(index: number) {
    const { model, currentNode } = this.props;
    const question = currentNode as Question;

    model.layoutData.lift((ld) => {
      const updatedLayoutData = ld.with({
        targetGroup: ld.targetGroup.with({
          rows: ld.targetGroup.rows.splice(index, 1) as Immutable.List<TG_ROW>,
        }),
      });

      const updatedModel = model.with({
        layoutData: Maybe.just<DndLayout>(updatedLayoutData),
      });

      // removed row might contain targets, update item and parts accordingly
      const { items, parts } = updateItemPartsFromTargets(
        question.items as Immutable.OrderedMap<string, FillInTheBlank>,
        question.parts,
        getTargetsFromLayout(updatedLayoutData),
      );

      // save question updates
      this.onEditQuestion(question.with({
        body: question.body.with({
          content: question.body.content.set(updatedModel.guid, updatedModel),
        }),
        items,
        parts,
      }));
    });
  }

  editColText(text: string, currentCol: DndText) {
    const { model, currentNode } = this.props;
    const question = currentNode as Question;

    model.layoutData.lift((ld) => {
      const updatedLayoutData = ld.with({
        targetGroup: ld.targetGroup.with({
          rows: ld.targetGroup.rows.map(row => row.contentType === 'HeaderRow'
            // HeaderRow
            ? row.with({
              cols: row.cols.map(col => col.guid === currentCol.guid
                ? col.with({
                  text,
                })
                : col,
              ) as Immutable.List<DndText>,
            })
            // ContentRow
            : row.with({
              cols: row.cols.map(col => col.guid === currentCol.guid
                && col.contentType === 'DndText'
                ? col.with({
                  text,
                })
                : col,
              ) as Immutable.List<DndText>,
            }),
          ) as Immutable.List<TG_ROW>,
        }),
      });

      this.onEditLayoutData(updatedLayoutData);
    });
  }

  toggleCellType(cellGuid: string) {
    const { model, currentNode } = this.props;
    const question = currentNode as Question;

    model.layoutData.lift((ld) => {
      const updatedLayoutData = ld.with({
        targetGroup: ld.targetGroup.with({
          rows: ld.targetGroup.rows.map(row => row.contentType === 'HeaderRow'
            // HeaderRow
            ? row
            // ContentRow
            : row.with({
              cols: row.cols.map(col =>
                // check if this cell is the toggle cell
                col.guid === cellGuid
                ? (
                  // if cell is a label, return a new target
                  col.contentType === 'DndText'
                  ? (
                    new Target().with({
                      guid: guid(),
                      assessmentId: guid(),
                    })
                  )
                  // otherwise it is a target, return a new label
                  : (
                    new DndText().with({
                      guid: guid(),
                    })
                  )
                )
                : (
                  col
                ),
              ) as Immutable.List<DndText>,
            }),
          ) as Immutable.List<TG_ROW>,
        }),
      });

      const updatedModel = model.with({
        layoutData: Maybe.just<DndLayout>(updatedLayoutData),
      });

      // target changed, update item and parts accordingly
      const { items, parts } = updateItemPartsFromTargets(
        question.items as Immutable.OrderedMap<string, FillInTheBlank>,
        question.parts,
        getTargetsFromLayout(updatedLayoutData),
      );

      // save question updates
      this.onEditQuestion(question.with({
        body: question.body.with({
          content: question.body.content.set(updatedModel.guid, updatedModel),
        }),
        items,
        parts,
      }));
    });
  }

  renderDropdown(
    index: number, onInsert: (index: number) => void,
    onRemove: (index: number) => void,
    term: string, showOnRight: boolean) {

    const { classes, className, editMode } = this.props;
    return (
      <div className={classNames([classes.dropdown,
        showOnRight && classes.showOnRight, className])}>
        <ToolbarDropdown
          size={ToolbarDropdownSize.Tiny}
          hideArrow
          positionMenuOnRight={showOnRight}
          label={<i className={classNames(['fa fa-ellipsis-v', classes.dropdownLabel,
            classes.moreLabel])}/>} >
          <button className="dropdown-item"
            disabled={!editMode}
            onClick={() => onInsert(index) }>
            {`Insert ${term} before`}
          </button>
          <button className="dropdown-item"
            disabled={!editMode}
            onClick={() => onInsert(index + 1) }>
            {`Insert ${term} after`}
          </button>
          <button className="dropdown-item"
            disabled={!editMode}
            onClick={() => onRemove(index) }>
            {`Remove ${term}`}
          </button>
        </ToolbarDropdown>
      </div>
    );
  }

  renderMain() : JSX.Element {
    const { classes, model, editMode, currentNode, selectedInitiator } = this.props;
    const question = currentNode as Question;

    const rows = model.layoutData.caseOf({
      just: ld => ld.targetGroup.rows,
      nothing: () => Immutable.List<TG_ROW>(),
    });

    const initiators = model.layoutData.caseOf({
      just: ld => ld.initiatorGroup.initiators,
      nothing: () => Immutable.List<InitiatorModel>(),
    });

    // build a map of targets to initiators
    const targetInitiators = buildTargetInitiatorsMap(question, initiators);

    // build map of target ids to labels using the selected initiator
    const targetLabels = buildTargetLabelsMap(question, selectedInitiator);

    const renderTableRow = (row, index) => {
      const isHeader = row.contentType === 'HeaderRow';
      const TCell = isHeader ? 'th' : 'td';

      return (
        <tr key={row.guid}>
          <TCell>
            {this.renderDropdown(
              index,
              index => this.onAddRow(index),
              index => this.onRemoveRow(index),
              'row',
              false,
            )}
          </TCell>
          {row.cols.toArray().map(col => col.contentType === 'Target'
          ? (
            <DynaDropTarget
              key={col.guid}
              id={col.guid}
              className={classNames([classes.cell, classes.targetCell])}
              isHeader={isHeader}
              assessmentId={col.assessmentId}
              selectedInitiator={selectedInitiator}
              onToggleType={this.toggleCellType}
              editMode={editMode}
              onDrop={this.onTargetDrop}
              onRemoveInitiator={this.unassignInitiator}
              label={`Target ${targetLabels[col.assessmentId]}`}
              initiators={targetInitiators[col.assessmentId]} />
          )
          : (
            <DynaDropLabel
              key={col.guid}
              id={col.guid}
              className={classNames([classes.cell, isHeader && classes.cellHeader])}
              style={{
                fontWeight: col.fontWeight as any,
                fontSize: col.fontWeight,
                fontStyle: col.fontStyle as any,
                textDecoration: col.textDecoration,
              }}
              onToggleType={this.toggleCellType}
              isHeader={isHeader}
              editMode={editMode}
              text={col.text}
              onEdit={value => this.editColText(value, col)} />
          ))}
        </tr>
      );
    };

    return (
      <div className={classes.dynaDropTable}>
        <p className={classes.instructions}>
          Each cell can either be a label or a drop target. Hover over a cell and click
          the toggle icon <i className="fa fa-crosshairs" /> to set/unset as a drop target.
        </p>
        <table>
          <thead>
            {/* Render column options menu */}
            <tr>
              <th/>
              {rows.first() && rows.first().cols.toArray().map((val, index) => (
                <th>
                {this.renderDropdown(
                  index,
                  index => this.onAddColumn(index),
                  index => this.onRemoveColumn(index),
                  'column',
                  true,
                )}
                </th>
              ))}
            </tr>
            {rows.filter(row => row.contentType === 'HeaderRow').toArray().map(renderTableRow)}
          </thead>
          <tbody>
            {rows.filter(row => row.contentType === 'ContentRow').toArray().map(renderTableRow)}
          </tbody>
        </table>
        <div>
          <Button type="link" editMode={editMode}
            onClick={() => this.onAddRow(rows.size)} >
            <i className="fa fa-plus" /> Add a Row
          </Button>
          <Button type="link" editMode={editMode}
            onClick={() => this.onAddColumn(rows.first() && rows.first().cols.size)} >
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
              onSelect={this.selectInitiator}
              canDelete={initiators.size > 1}
              onDelete={this.deleteInitiator} />
          ))}
        </div>
        <div>
          <Button type="link" editMode={editMode}
            onClick={this.addInitiator} >
            <i className="fa fa-plus" /> Add a Choice
          </Button>
        </div>
      </div>
    );
  }
}
