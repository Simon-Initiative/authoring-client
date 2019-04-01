import * as React from 'react';
import * as Immutable from 'immutable';
import guid from 'utils/guid';
import { Button } from 'editors/content/common/Button';
import { ToolbarDropdown, ToolbarDropdownSize } from 'components/toolbar/ToolbarDropdown';
import { LikertScale } from 'data/content/feedback/likert_scale';
import { LikertItem } from 'data/content/feedback/likert_item';
import { FeedbackPrompt } from 'data/content/feedback/feedback_prompt';
import { ContentElements, INLINE_ELEMENTS } from 'data/content/common/elements';
import { Select } from 'editors/content/common/Select';
import { onEditScaleSize } from '../utils';
import { LikertSeries } from 'data/content/feedback/likert_series';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { ContentElement } from 'data/content/common/interfaces';
import { AbstractContentEditorProps } from 'editors/content/common/AbstractContentEditor';

import './QuestionTable.scss';

enum Direction {
  Up,
  Down,
}

// Adapted from TableEditor
export interface Props extends AbstractContentEditorProps<LikertSeries> {
  editMode: boolean;
  onEditScale: (scale: LikertScale, src: ContentElement) => void;
  onEditItems: (items: Immutable.OrderedMap<string, LikertItem>, src: ContentElement) => void;
}

export interface State { }

export class QuestionTable extends React.PureComponent<Props, State> {

  onAddRow(index: number) {
    const { model, onEditItems } = this.props;

    const items = model.items;

    const item = new LikertItem({
      prompt: new FeedbackPrompt({
        content: ContentElements.fromText('New question prompt', guid(), INLINE_ELEMENTS),
      }),
    });

    onEditItems(
      items.take(index)
        .concat(Immutable.OrderedMap([[item.guid, item]]))
        .concat(items.skip(index))
        .toOrderedMap(),
      item);
  }

  onRemoveRow(index: number) {
    const { model, onEditItems } = this.props;
    const items = model.items;

    onEditItems(items.take(index).concat(items.skip(index + 1)).toOrderedMap(), null);
  }

  onMoveRow(index: number, dir: Direction) {
    const { model, onEditItems } = this.props;
    const items = model.items;

    const reordered = dir === Direction.Up
      ? items.take(index - 1)
        .concat(items.skip(index).take(1))
        .concat(items.skip(index - 1).take(1))
        .concat(items.skip(index + 1))
        .toOrderedMap()
      : items.take(index)
        .concat(items.skip(index + 1).take(1))
        .concat(items.skip(index).take(1))
        .concat(items.skip(index + 1))
        .toOrderedMap();

    onEditItems(reordered, null);
  }

  renderDropdown(
    index: number,
    onMove: (index: number, dir: Direction) => void,
    onInsert: (index: number) => void,
    onRemove: (index: number) => void,
    term: string, showOnRight: boolean) {

    const { editMode } = this.props;
    return (
      <div className={'dropdown ' + showOnRight ? 'show-on-right ' : ''}>
        <ToolbarDropdown
          size={ToolbarDropdownSize.Tiny}
          hideArrow
          positionMenuOnRight={showOnRight}
          label={<i className={'fa fa-ellipsis-v dropdown-label more-label'} />}>
          {index > 0 ?
            <button className="dropdown-item"
              disabled={!editMode}
              onClick={() => onMove(index, Direction.Up)}>
              {`Move ${term} up`}
            </button>
            : null}
          {index < this.props.model.items.size - 1
            ? <button className="dropdown-item"
              disabled={!editMode}
              onClick={() => onMove(index, Direction.Down)}>
              {`Move ${term} down`}
            </button>
            : null
          }
          <hr />
          <button className="dropdown-item"
            disabled={!editMode}
            onClick={() => onInsert(index)}>
            {`Insert ${term} before`}
          </button>
          <button className="dropdown-item"
            disabled={!editMode}
            onClick={() => onInsert(index + 1)}>
            {`Insert ${term} after`}
          </button>
          <button className="dropdown-item"
            disabled={!editMode}
            onClick={() => onRemove(index)}>
            {`Remove ${term}`}
          </button>
        </ToolbarDropdown>
      </div>
    );
  }

  render() {
    const { editMode, model, onEditScale, onEditItems } = this.props;
    const { scale, items } = model;

    const renderTableRow = (item: LikertItem, index: number) => {
      return (
        <tr key={item.guid}>
          <td>
            {this.renderDropdown(
              index,
              (index, dir) => this.onMoveRow(index, dir),
              index => this.onAddRow(index),
              index => this.onRemoveRow(index),
              'row',
              false,
            )}
          </td>
          <td>
            <ContentContainer
              {...this.props}
              hideSingleDecorator
              model={item.prompt.content}
              onEdit={(content, source) => onEditItems(
                items.set(item.guid, item.with({ prompt: item.prompt.with({ content }) })),
                source)} />
          </td>
          {Array(Number.parseInt(scale.scaleSize, 10))
            .fill(null).map(_ => <td className="question-table-radio">
              <input name=""
                value=""
                checked={false}
                disabled
                onChange={null}
                type="radio" />
            </td>)}
        </tr>
      );
    };

    const scaleOptions = [1, 3, 5, 7]
      .map(n => <option key={n} value={n}>{n}</option>);

    return (
      <div className="likert-table">
        <table>
          <thead>
            <tr>
              <th />
              <th><Select
                editMode={this.props.editMode}
                label="Scale Size"
                value={scale.scaleSize}
                onChange={size => onEditScaleSize(size, scale, onEditScale)}>
                {scaleOptions}
              </Select></th>
              {scale.labels.toArray().map((label =>
                <td>
                  <ContentContainer
                    {...this.props}
                    hideSingleDecorator
                    model={label.text}
                    onEdit={(text, source) => onEditScale(
                      scale.with({ labels: scale.labels.set(label.guid, label.with({ text })) }),
                      source)} />
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.toArray().map(renderTableRow)}
          </tbody>
        </table>
        <div className="add-row">
          <Button type="link" editMode={editMode}
            onClick={() => this.onAddRow(items.size)} >
            <i className="fa fa-plus" /> Add a Question
          </Button>
        </div>
      </div>
    );
  }
}
