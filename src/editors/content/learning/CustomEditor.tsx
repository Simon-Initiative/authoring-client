import * as React from 'react';
import * as Immutable from 'immutable';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames } from 'styles/jss';
import { Custom } from 'data/content/assessment/custom';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { TG_ROW } from 'data/content/assessment/dragdrop/target_group';
import { convert } from 'utils/format';
import { Initiator as InitiatorModel } from 'data/content/assessment/dragdrop/initiator';
import { Initiator } from './dynadragdrop/Initiator';
import { DynaDropTarget } from './dynadragdrop/DynaDropTarget.controller';
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
import { choiceAssessmentIdSort } from 'editors/content/items/DynaDropTargetItems';
import { ContentTypes } from 'data/content/org/types';
import { throttle } from 'utils/timing';
import { ToolbarDropdown, ToolbarDropdownSize } from 'components/toolbar/ToolbarDropdown';

import { styles } from './CustomEditor.styles';

export const targetAssessmentIdSort = (a: Target, b: Target) =>
  a.assessmentId.localeCompare(b.assessmentId);

const buildTargetLabelsMap = (question: Question, selectedInitiator: string) => {
  const currentItem = question.items.toArray().find(
    (item: FillInTheBlank) => item.id === selectedInitiator) as FillInTheBlank;

  if (!currentItem) {
    return {};
  }

  return currentItem.choices.sort(choiceAssessmentIdSort).toArray().reduce(
    (acc, choice: Choice, index) => ({
      ...acc,
      [choice.value]:
      convert.toAlphaNotation(index),
    }),
    {},
  );
};

const buildInitiatorPartMap = (question: Question, initiators: Immutable.List<InitiatorModel>) => {
  return initiators.reduce(
    (acc, val) =>
      acc.set(val.assessmentId, question.parts.find(part =>
        part.responses.first() &&
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

const getTargetsFromLayout = (dndLayout: DndLayout) => {
  return dndLayout.targetGroup.rows.reduce(
    (accRows, row) =>
      accRows.concat(row.cols.toArray().reduce(
        (accCols, col) => col.contentType === 'Target' ? accCols.push(col) : accCols,
        Immutable.List<Target>(),
      )) as Immutable.List<Target>,
    Immutable.List<Target>(),
  );
};

const updateItemPartsFromTargets = (
  items: Immutable.OrderedMap<string, FillInTheBlank>,
  parts: Immutable.OrderedMap<string, Part>,
  targets: Immutable.List<Target>,
) => {
  // sort targets to ensure consistent ordering
  const sortedTargets = targets.sort(targetAssessmentIdSort);

  // compute updated parts based on targets
  const updatedParts = parts.reduce(
    (accParts, part) => accParts.set(part.guid, part.with({
      responses: sortedTargets.reduce(
        (accResponses, target) => {
          const input = part.responses.first() && part.responses.first().input;
          const f = new Feedback();

          // find existing response with assessmentId or create a new one
          const response = part.responses.find(r =>
            r.match === target.assessmentId) || new Response().with({
              input,
              match: target.assessmentId,
              feedback: Immutable.OrderedMap<string, Feedback>().set(f.guid, f),
            });

          return accResponses.set(response.guid, response);
        },
        Immutable.OrderedMap<string, Response>(),
      ),
    })),
    Immutable.OrderedMap<string, Part>(),
  );

  const updatedItems = items.reduce(
    (accItems, item) => accItems.set(item.guid, item.with({
      choices: sortedTargets.reduce(
        (accChoices, target) => {
          const choice = item.choices.find(c =>
            c.value === target.assessmentId) || new Choice().with({
              value: target.assessmentId,
              body: new ContentElements().with({
                supportedElements: Immutable.List(FLOW_ELEMENTS) }),
            });

          return accChoices.set(choice.guid, choice);
        },
        Immutable.OrderedMap<string, Choice>(),
      ),
    })),
    Immutable.OrderedMap<string, FillInTheBlank>(),
  );

  return {
    items: updatedItems,
    parts: updatedParts,
  };
};

export interface CellEditorProps {
  editMode: boolean;
  text: string;
  onEdit: (text: string) => void;
}

export interface CellEditorState {
  text: string;
}

export class CellEditor
  extends React.Component<StyledComponentProps<CellEditorProps>, CellEditorState> {
  caretPosition: any;
  direction: number;
  ref: any;

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    this.state = {
      text: this.props.text,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.text !== nextState.text) {
      return true;
    }

    return false;
  }

  onChange(e) {
    const target = e.target;
    const currentText = target.innerText;

    this.setState(
      { text: currentText },
      () => {
        const el = this.ref;

        if (el.firstChild) {
          const range = document.createRange();
          const sel = window.getSelection();
          range.setStart(el.firstChild, this.caretPosition + this.direction);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      },
    );

    this.props.onEdit(currentText);
  }

  onKeyPress(e) {
    const BACKSPACE = 8;

    const text = document.getSelection();
    const startIndex = text.anchorOffset;
    const endIndex = text.focusOffset;

    // Keep track of the position of caret
    if (endIndex - startIndex > 0) {
      this.caretPosition = startIndex;

      if (e.keyCode === BACKSPACE) {
        this.direction = 0;
      } else {
        this.direction = 1;
      }
    } else {
      this.caretPosition = endIndex;
      if (e.keyCode === BACKSPACE) {
        this.direction = -1;
      } else {
        this.direction = 1;
      }
    }
  }

  onKeyUp(e) {
    e.stopPropagation();
  }

  renderEdit(): JSX.Element {
    const html = { __html: this.state.text };

    return (
      <div
        ref={r => this.ref = r}
        onInput={this.onChange}
        onKeyDown={this.onKeyPress}
        onKeyUp={this.onKeyUp}
        contentEditable
        dangerouslySetInnerHTML={html}/>
    );
  }

  renderView(): JSX.Element {
    return <div>{this.props.text}</div>;
  }

  render() : JSX.Element {
    const { editMode } = this.props;

    return editMode ? this.renderEdit() : this.renderView();
  }
}


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
    this.addInitiator = this.addInitiator.bind(this);
    this.deleteInitiator = this.deleteInitiator.bind(this);
    this.onEditQuestion = this.onEditQuestion.bind(this);
    this.onEditLayoutData = this.onEditLayoutData.bind(this);
    this.onAddColumn = this.onAddColumn.bind(this);
    this.onAddRow = this.onAddRow.bind(this);
    this.editColText = this.editColText.bind(this);
    this.renderDynaDrop = this.renderDynaDrop.bind(this);
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

    onSelectInitiator(initiators.first() && initiators.first().assessmentId);

    // save question updates
    this.onEditQuestion(question.with({
      body: question.body.with({
        content: question.body.content.set(updatedModel.guid, updatedModel),
      }),
      items: question.items.remove(itemKey),
      parts: question.parts.remove(partKey),
    }));
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

  renderDynaDrop() {
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
      const Tcell = isHeader ? 'th' : 'td';

      return (
        <tr key={row.guid}>
          <Tcell>
            {this.renderDropdown(
              index + 1,
              index => this.onAddRow(index),
              index => this.onRemoveRow(index),
              'row',
              false,
            )}
          </Tcell>
          {row.cols.toArray().map(col => col.contentType === 'Target'
          ? (
            <DynaDropTarget
              key={col.guid}
              id={col.guid}
              assessmentId={col.assessmentId}
              selectedInitiator={selectedInitiator}
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
              key={col.guid}
              className={isHeader ? classes.header : classes.cell}
              style={{
                fontWeight: col.fontWeight as any,
                fontSize: col.fontWeight,
                fontStyle: col.fontStyle as any,
                textDecoration: col.textDecoration,
              }}>
              <CellEditor
                editMode={editMode}
                text={col.text}
                onEdit={value => this.editColText(value, col)} />
            </Tcell>
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
              onSelect={this.selectInitiator} onDelete={this.deleteInitiator} />
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

  renderMain() : JSX.Element {
    const { className, classes, model } = this.props;

    return (
      <div className={classNames([classes.customEditor, className])}>
        {model.src.substr(model.src.length - 11) === 'DynaDrop.js'
          ? this.renderDynaDrop()
          : '[Custom Element]'
        }
      </div>
    );
  }
}
