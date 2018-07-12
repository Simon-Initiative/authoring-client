import * as React from 'react';
import * as Immutable from 'immutable';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames } from 'styles/jss';
import { HTMLLayout } from 'data/content/assessment/dragdrop/htmlLayout/html_layout';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from '../../common/AbstractContentEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { Initiator as InitiatorModel } from 'data/content/assessment/dragdrop/htmlLayout/initiator';
import { Initiator } from './Initiator';
import { DynaDropLabel } from './DynaDropLabel';
import { DynaDropTarget } from './DynaDropTarget.controller';
import { Button } from 'editors/content/common/Button';
import { Page, Question, Part, Choice, Response,
  FillInTheBlank } from 'data/contentTypes';
import { AssessmentModel } from 'data/models';
import guid from 'utils/guid';
// import { Target } from 'data/content/assessment/dragdrop/target';
import { Maybe } from 'tsmonad';
// import { DndLayout } from 'data/content/assessment/dragdrop/dnd_layout';
// import { DndText } from 'data/content/assessment/dragdrop/dnd_text';
// import { ContentRow } from 'data/content/assessment/dragdrop/content_row';
import { ContentElements, FLOW_ELEMENTS } from 'data/content/common/elements';
import { Feedback } from 'data/content/assessment/feedback';
import {
  setQuestionPartWithInitiatorScore, updateItemPartsFromTargets,
  getTargetsFromLayout, buildTargetLabelsMap, buildTargetInitiatorsMap,
} from 'editors/content/learning/dynadragdrop/utils';
import { ToolbarDropdown, ToolbarDropdownSize } from 'components/toolbar/ToolbarDropdown';

import { styles } from './HTMLTableEditor.styles';
import {
  TableTargetArea,
} from 'data/content/assessment/dragdrop/htmlLayout/table/table_targetarea';
import { Row } from 'data/content/assessment/dragdrop/htmlLayout/table/row';

export interface HTMLTableEditorProps {
  table: TableTargetArea;
  initiators: Immutable.List<InitiatorModel>;
  selectedInitiator: string;
  editMode: boolean;
  question: Question;
  onEditTable: (table: TableTargetArea) => void;
  onSelectInitiator: (id: string) => void;
  onAddInitiator: () => void;
  onTargetDrop: (
    initiatorId: string, targetAssessmentId: string, originalTargetAssessmentId: string) => void;
  onAssignInitiator: (initiatorId: string, targetAssessmentId: string) => void;
  onUnassignInitiator: (initiatorId: string, targetAssessmentId: string) => void;
  onDeleteInitiator: (initiatorId: string) => void;
}

export interface HTMLTableEditorState {

}

@injectSheet(styles)
export class HTMLTableEditor
  extends React.PureComponent<StyledComponentProps<HTMLTableEditorProps>, HTMLTableEditorState> {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { initiators, onSelectInitiator } = this.props;
    onSelectInitiator(initiators.first() && initiators.first().inputVal);
  }

  onAddColumn(index: number) {
  //   const { model } = this.props;

  //   model.layoutData.lift((ld) => {
  //     const updatedLayoutData = ld.with({
  //       targetGroup: ld.targetGroup.with({
  //         rows: ld.targetGroup.rows.map(r => r.contentType === 'HeaderRow'
  //           // HeaderRow
  //           ? (r.with({
  //               cols: r.cols.splice(index, 0, new DndText()) as Immutable.List<DndText> }))
  //           // ContentRow
  //           : (r.with({
  //               cols: r.cols.splice(index, 0, new DndText()) as Immutable.List<DndText> })),
  //         ) as Immutable.List<TG_ROW>,
  //       }),
  //     });

  //     this.onEditLayoutData(updatedLayoutData);
  //   });
  }

  onRemoveColumn(index: number) {
  //   const { model, currentNode } = this.props;
  //   const question = currentNode;

  //   model.layoutData.lift((ld) => {
  //     const updatedLayoutData = ld.with({
  //       targetGroup: ld.targetGroup.with({
  //         rows: ld.targetGroup.rows.map(r => r.contentType === 'HeaderRow'
  //           // HeaderRow
  //           ? (r.with({ cols: r.cols.splice(index, 1) as Immutable.List<DndText> }))
  //           // ContentRow
  //           : (r.with({ cols: r.cols.splice(index, 1) as Immutable.List<DndText> })),
  //         ) as Immutable.List<TG_ROW>,
  //       }),
  //     });

  //     const updatedModel = model.with({
  //       layoutData: Maybe.just<DndLayout>(updatedLayoutData),
  //     });

  //     // removed column might contain targets, update item and parts accordingly
  //     const { items, parts } = updateItemPartsFromTargets(
  //       question.items as Immutable.OrderedMap<string, FillInTheBlank>,
  //       question.parts,
  //       getTargetsFromLayout(updatedLayoutData),
  //     );

  //     // save question updates
  //     this.onEditQuestion(question.with({
  //       body: question.body.with({
  //         content: question.body.content.set(updatedModel.guid, updatedModel),
  //       }),
  //       items,
  //       parts,
  //     }));
  //   });
  }

  onAddRow(index: number) {
  //   const { model, currentNode } = this.props;
  //   const question = currentNode;

  //   model.layoutData.lift((ld) => {
  //     const updatedLayoutData = ld.with({
  //       targetGroup: ld.targetGroup.with({
  //         rows: ld.targetGroup.rows.splice(index, 0, new ContentRow().with({
  //           // use the last row as a template for the new row cols (DndText or Target)
  //           cols: Immutable.List<DndText | Target>(
  //             ld.targetGroup.rows.last()
  //             ? ld.targetGroup.rows.last().cols.toArray().map(c =>
  //                 c.contentType === 'DndText'
  //                 ? (new DndText())
  //                 : (new Target({ assessmentId: guid() })),
  //               )
  //             : [],
  //           ),
  //         })) as Immutable.List<TG_ROW>,
  //       }),
  //     });

  //     const updatedModel = model.with({
  //       layoutData: Maybe.just<DndLayout>(updatedLayoutData),
  //     });

  //     // new row might contain targets, update item and parts accordingly
  //     const { items, parts } = updateItemPartsFromTargets(
  //       question.items as Immutable.OrderedMap<string, FillInTheBlank>,
  //       question.parts,
  //       getTargetsFromLayout(updatedLayoutData),
  //     );

  //     // save question updates
  //     this.onEditQuestion(question.with({
  //       body: question.body.with({
  //         content: question.body.content.set(updatedModel.guid, updatedModel),
  //       }),
  //       items,
  //       parts,
  //     }));
  //   });
  }

  onRemoveRow(index: number) {
  //   const { model, currentNode } = this.props;
  //   const question = currentNode;

  //   model.layoutData.lift((ld) => {
  //     const updatedLayoutData = ld.with({
  //       targetGroup: ld.targetGroup.with({
  //         rows: ld.targetGroup.rows.splice(index, 1) as Immutable.List<TG_ROW>,
  //       }),
  //     });

  //     const updatedModel = model.with({
  //       layoutData: Maybe.just<DndLayout>(updatedLayoutData),
  //     });

  //     // removed row might contain targets, update item and parts accordingly
  //     const { items, parts } = updateItemPartsFromTargets(
  //       question.items as Immutable.OrderedMap<string, FillInTheBlank>,
  //       question.parts,
  //       getTargetsFromLayout(updatedLayoutData),
  //     );

  //     // save question updates
  //     this.onEditQuestion(question.with({
  //       body: question.body.with({
  //         content: question.body.content.set(updatedModel.guid, updatedModel),
  //       }),
  //       items,
  //       parts,
  //     }));
  //   });
  }

  // editColText(text: string, currentCol: DndText) {
  editColText(text: string, currentCol) {
  //   const { model } = this.props;

  //   model.layoutData.lift((ld) => {
  //     const updatedLayoutData = ld.with({
  //       targetGroup: ld.targetGroup.with({
  //         rows: ld.targetGroup.rows.map(row => row.contentType === 'HeaderRow'
  //           // HeaderRow
  //           ? row.with({
  //             cols: row.cols.map(col => col.guid === currentCol.guid
  //               ? col.with({
  //                 text,
  //               })
  //               : col,
  //             ) as Immutable.List<DndText>,
  //           })
  //           // ContentRow
  //           : row.with({
  //             cols: row.cols.map(col => col.guid === currentCol.guid
  //               && col.contentType === 'DndText'
  //               ? col.with({
  //                 text,
  //               })
  //               : col,
  //             ) as Immutable.List<DndText>,
  //           }),
  //         ) as Immutable.List<TG_ROW>,
  //       }),
  //     });

  //     this.onEditLayoutData(updatedLayoutData);
  //   });
  }

  toggleCellType(cellGuid: string) {
  //   const { model, currentNode } = this.props;
  //   const question = currentNode;

  //   model.layoutData.lift((ld) => {
  //     const updatedLayoutData = ld.with({
  //       targetGroup: ld.targetGroup.with({
  //         rows: ld.targetGroup.rows.map(row => row.contentType === 'HeaderRow'
  //           // HeaderRow
  //           ? row
  //           // ContentRow
  //           : row.with({
  //             cols: row.cols.map(col =>
  //               // check if this cell is the toggle cell
  //               col.guid === cellGuid
  //               ? (
  //                 // if cell is a label, return a new target
  //                 col.contentType === 'DndText'
  //                 ? (
  //                   new Target().with({
  //                     guid: guid(),
  //                     assessmentId: guid(),
  //                   })
  //                 )
  //                 // otherwise it is a target, return a new label
  //                 : (
  //                   new DndText().with({
  //                     guid: guid(),
  //                   })
  //                 )
  //               )
  //               : (
  //                 col
  //               ),
  //             ) as Immutable.List<DndText>,
  //           }),
  //         ) as Immutable.List<TG_ROW>,
  //       }),
  //     });

  //     const updatedModel = model.with({
  //       layoutData: Maybe.just<DndLayout>(updatedLayoutData),
  //     });

  //     // target changed, update item and parts accordingly
  //     const { items, parts } = updateItemPartsFromTargets(
  //       question.items as Immutable.OrderedMap<string, FillInTheBlank>,
  //       question.parts,
  //       getTargetsFromLayout(updatedLayoutData),
  //     );

  //     // save question updates
  //     this.onEditQuestion(question.with({
  //       body: question.body.with({
  //         content: question.body.content.set(updatedModel.guid, updatedModel),
  //       }),
  //       items,
  //       parts,
  //     }));
  //   });
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

  render() {
    const {
      classes, table, initiators, editMode, question, selectedInitiator,
      onTargetDrop, onAddInitiator, onDeleteInitiator, onSelectInitiator, onUnassignInitiator,
    } = this.props;

    const rows = table.rows;

    console.log('initiators', initiators)

    // build a map of targets to initiators
    const targetInitiators = buildTargetInitiatorsMap(question, initiators);

    // build map of target ids to labels using the selected initiator
    const targetLabels = buildTargetLabelsMap(question, selectedInitiator);

    const renderTableRow = (row: Row, index) => {
      return (
        <tr key={row.guid}>
          <td>
            {this.renderDropdown(
              index,
              index => this.onAddRow(index),
              index => this.onRemoveRow(index),
              'row',
              false,
            )}
          </td>
          {row.cells.toArray().map(cell => cell.target.caseOf({
            just: inputVal => (
              <DynaDropTarget
                key={cell.guid}
                id={cell.guid}
                className={classNames([classes.cell, classes.targetCell])}
                inputVal={inputVal}
                selectedInitiator={selectedInitiator}
                canToggleType={question.parts.first().responses.size > 1}
                onToggleType={this.toggleCellType}
                editMode={editMode}
                onDrop={onTargetDrop}
                onRemoveInitiator={onUnassignInitiator}
                label={`Target ${targetLabels[inputVal]}`}
                initiators={targetInitiators[inputVal]} />
            ),
            nothing: () => (
              <DynaDropLabel
                key={cell.guid}
                id={cell.guid}
                className={classNames([classes.cell])}
                // style={cell.style}
                canToggleType={true}
                onToggleType={this.toggleCellType}
                editMode={editMode}
                text={cell.text}
                onEdit={value => this.editColText(value, cell)} />
            ),
          }))}
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
              {rows.first() && rows.first().cells.toArray().map((cell, index) => (
                <th key={cell.guid}>
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
          </thead>
          <tbody>
            {rows.toArray().map(renderTableRow)}
          </tbody>
        </table>
        <div>
          <Button type="link" editMode={editMode}
            onClick={() => this.onAddRow(rows.size)} >
            <i className="fa fa-plus" /> Add a Row
          </Button>
          <Button type="link" editMode={editMode}
            onClick={() => this.onAddColumn(rows.first() && rows.first().cells.size)} >
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
              key={initiator.guid}
              model={initiator} editMode={editMode}
              selected={initiator.inputVal === selectedInitiator}
              onSelect={onSelectInitiator}
              canDelete={initiators.size > 1}
              onDelete={onDeleteInitiator} />
          ))}
        </div>
        <div>
          <Button type="link" editMode={editMode}
            onClick={onAddInitiator} >
            <i className="fa fa-plus" /> Add a Choice
          </Button>
        </div>
      </div>
    );
  }
}
