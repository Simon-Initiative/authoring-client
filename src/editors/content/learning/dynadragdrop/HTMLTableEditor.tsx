import * as React from 'react';
import * as Immutable from 'immutable';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames } from 'styles/jss';
import { HTMLLayout } from 'data/content/assessment/dragdrop/htmlLayout/html_layout';
import { Initiator as InitiatorModel } from 'data/content/assessment/dragdrop/htmlLayout/initiator';
import { Initiator } from './Initiator';
import { DynaDropLabel } from './DynaDropLabel';
import { DynaDropTarget } from './DynaDropTarget.controller';
import { Button } from 'editors/content/common/Button';
import {
  Question, FillInTheBlank, Custom,
} from 'data/contentTypes';
import guid from 'utils/guid';
import { Maybe } from 'tsmonad';
import {
  updateItemPartsFromTargets, getTargetsFromLayout, buildTargetLabelsMap,
  buildTargetInitiatorsMap,
} from 'editors/content/learning/dynadragdrop/utils';
import { ToolbarDropdown, ToolbarDropdownSize } from 'components/toolbar/ToolbarDropdown';
import {
  TableTargetArea,
} from 'data/content/assessment/dragdrop/htmlLayout/table/table_targetarea';
import { Row } from 'data/content/assessment/dragdrop/htmlLayout/table/row';
import { Cell } from 'data/content/assessment/dragdrop/htmlLayout/table/cell';

import { styles } from './HTMLTableEditor.styles';

export interface HTMLTableEditorProps {
  table: TableTargetArea;
  model: Custom;
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
  onEditQuestion: (question: Question) => void;
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
    const { table, onEditTable } = this.props;

    const updatedTable = table.with({
      rows: table.rows.map(r => r.with({
        cells: r.cells.splice(index, 0, new Cell()).toList(),
      })).toList(),
    });

    onEditTable(updatedTable);
  }

  onRemoveColumn(index: number) {
    const { model, table, question, onEditQuestion } = this.props;

    model.layoutData.lift((layoutData) => {
      const updatedTable = table.with({
        rows: table.rows.map(r => r.with({
          cells: r.cells.splice(index, 1).toList(),
        })).toList(),
      });

      const updatedLayoutData = layoutData.with({
        targetArea: updatedTable,
      });

      const updatedModel = model.with({
        layoutData: Maybe.just<HTMLLayout>(updatedLayoutData),
      });

      // removed column might contain targets, update item and parts accordingly
      const { items, parts } = updateItemPartsFromTargets(
        question.items as Immutable.OrderedMap<string, FillInTheBlank>,
        question.parts,
        getTargetsFromLayout(updatedLayoutData),
      );

      // save question updates
      onEditQuestion(question.with({
        body: question.body.with({
          content: question.body.content.set(updatedModel.guid, updatedModel),
        }),
        items,
        parts,
      }));
    });
  }

  onAddRow(index: number) {
    const { model, table, question, onEditQuestion } = this.props;

    model.layoutData.lift((layoutData) => {
      const updatedTable = table.with({
        rows: table.rows.splice(
          index,
          0,
          new Row().with({
            // use the last row as a template for the new row cols (label or target)
            cells: table.rows.last().cells.map(c => c.target.caseOf({
              just: target => new Cell().with({
                target: Maybe.just(guid()),
              }),
              nothing: () => new Cell(),
            })).toList(),
          }),
        ).toList(),
      });

      const updatedLayoutData = layoutData.with({
        targetArea: updatedTable,
      });

      const updatedModel = model.with({
        layoutData: Maybe.just<HTMLLayout>(updatedLayoutData),
      });

      // new row might contain targets, update item and parts accordingly
      const { items, parts } = updateItemPartsFromTargets(
        question.items as Immutable.OrderedMap<string, FillInTheBlank>,
        question.parts,
        getTargetsFromLayout(updatedLayoutData),
      );

      // save question updates
      onEditQuestion(question.with({
        body: question.body.with({
          content: question.body.content.set(updatedModel.guid, updatedModel),
        }),
        items,
        parts,
      }));
    });
  }

  onRemoveRow(index: number) {
    const { model, table, question, onEditQuestion } = this.props;

    model.layoutData.lift((layoutData) => {
      const updatedTable = table.with({
        rows: table.rows.splice(index, 1).toList(),
      });

      const updatedLayoutData = layoutData.with({
        targetArea: updatedTable,
      });

      const updatedModel = model.with({
        layoutData: Maybe.just<HTMLLayout>(updatedLayoutData),
      });

      // removed row might contain targets, update item and parts accordingly
      const { items, parts } = updateItemPartsFromTargets(
        question.items as Immutable.OrderedMap<string, FillInTheBlank>,
        question.parts,
        getTargetsFromLayout(updatedLayoutData),
      );

      // save question updates
      onEditQuestion(question.with({
        body: question.body.with({
          content: question.body.content.set(updatedModel.guid, updatedModel),
        }),
        items,
        parts,
      }));
    });
  }

  editColText(text: string, currentCell: Cell) {
    const { table, onEditTable } = this.props;

    const updatedTable = table.with({
      rows: table.rows.map(row => row.with({
        cells: row.cells.map(cell => cell.guid === currentCell.guid
          ? (
            cell.with({
              text,
            })
          )
          : cell,
        ).toList(),
      })).toList(),
    });

    onEditTable(updatedTable);
  }

  toggleCellType = (cellGuid: string) => {
    const { model, table, question, onEditQuestion } = this.props;

    model.layoutData.lift((layoutData) => {
      const updatedTable = table.with({
        rows: table.rows.map(row => row.with({
          cells: row.cells.map(cell =>
            // check if this cell is the toggle cell
            cell.guid === cellGuid
            ? (
              // toggle between target and label cell
              cell.target.caseOf({
                just: () => cell.with({
                  target: Maybe.nothing(),
                }),
                nothing: () => cell.with({
                  target: Maybe.just(guid()),
                  text: '',
                }),
              })
            )
            : (
              cell
            ),
          ).toList(),
          }),
        ).toList(),
      });

      const updatedLayoutData = layoutData.with({
        targetArea: updatedTable,
      });

      const updatedModel = model.with({
        layoutData: Maybe.just<HTMLLayout>(updatedLayoutData),
      });

      // target changed, update item and parts accordingly
      const { items, parts } = updateItemPartsFromTargets(
        question.items as Immutable.OrderedMap<string, FillInTheBlank>,
        question.parts,
        getTargetsFromLayout(updatedLayoutData),
      );

      // save question updates
      onEditQuestion(question.with({
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

  render() {
    const {
      classes, table, model, initiators, editMode, question, selectedInitiator,
      onTargetDrop, onAddInitiator, onDeleteInitiator, onSelectInitiator, onUnassignInitiator,
    } = this.props;

    const rows = table.rows;

    // build a map of targets to initiators
    const targetInitiators = buildTargetInitiatorsMap(question, initiators);

    // build map of target ids to labels using the selected initiator
    const targetLabels = buildTargetLabelsMap(
      question, selectedInitiator, model.layoutData.valueOrThrow());

    const renderTableRow = (row: Row, index) => {
      return (
        <tr key={row.guid} className={row.isHeader && classes.headerRow}>
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
