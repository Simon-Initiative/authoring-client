import * as React from 'react';
import * as Immutable from 'immutable';
import guid from 'utils/guid';

import { Button } from 'editors/content/common/Button';
import { ToolbarDropdown, ToolbarDropdownSize } from 'components/toolbar/ToolbarDropdown';
import { LikertScale } from 'data/content/feedback/likert_scale';
import { LikertItem } from 'data/content/feedback/likert_item';
import { FeedbackPrompt } from 'data/content/feedback/feedback_prompt';
import { DynaDropLabel } from 'editors/content/learning/dynadragdrop/DynaDropLabel';
import { ContiguousText } from 'data/content/learning/contiguous';
import { ContentElements, TEXT_ELEMENTS, INLINE_ELEMENTS } from 'data/content/common/elements';
import { Select } from 'editors/content/common/Select';
import { onEditScaleSize } from '../utils';
import { onEditLabelText } from 'editors/content/feedback/utils';

import './QuestionTable.scss';

// Adapted from HTMLTableEditor
export interface Props {
  editMode: boolean;
  scale: LikertScale;
  onEditScale: (scale: LikertScale) => void;
  items: Immutable.OrderedMap<string, LikertItem>;
  onEditItems: (items: Immutable.OrderedMap<string, LikertItem>) => void;
}

export interface State { }

export class QuestionTable extends React.PureComponent<Props, State> {

  onAddRow(index: number) {
    const { items, onEditItems } = this.props;

    const item = new LikertItem({
      prompt: new FeedbackPrompt({
        content: ContentElements.fromText('New question prompt', guid(), INLINE_ELEMENTS),
      }),
    });

    onEditItems(
      Immutable.OrderedMap<string, LikertItem>(
        items.take(index)
          .concat(Immutable.OrderedMap<string, LikertItem>([[item.guid, item]]))
          .concat(items.skip(index))));
  }

  onRemoveRow(index: number) {
    const { items, onEditItems } = this.props;

    onEditItems(items.take(index).concat(items.skip(index + 1)).toOrderedMap());
  }

  onEditItemText(text: string, item: LikertItem) {
    const { items, onEditItems } = this.props;

    onEditItems(items.set(item.guid, item.with({
      prompt: item.prompt.with({
        content: ContentElements.fromText(text, guid(), TEXT_ELEMENTS),
      }),
    })));
  }

  renderDropdown(
    index: number, onInsert: (index: number) => void,
    onRemove: (index: number) => void,
    term: string, showOnRight: boolean) {

    const { editMode } = this.props;
    return (
      <div className={'dropdown ' + showOnRight ? 'show-on-right ' : ''}>
        <ToolbarDropdown
          size={ToolbarDropdownSize.Tiny}
          hideArrow
          positionMenuOnRight={showOnRight}
          label={<i className={'fa fa-ellipsis-v dropdown-label more-label'} />} >
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
    const { editMode, scale, items, onEditScale } = this.props;

    const renderTableRow = (item: LikertItem, index) => {
      return (
        <tr key={item.guid}>
          <td>
            {this.renderDropdown(
              index,
              index => this.onAddRow(index),
              index => this.onRemoveRow(index),
              'row',
              false,
            )}
          </td>
          <DynaDropLabel
            key={item.guid}
            id={item.guid}
            className="item-prompt"
            canToggleType={false}
            onToggleType={null}
            editMode={editMode}
            text={(item.prompt.content.content.first() as ContiguousText)
              .extractPlainText().valueOr('')}
            onEdit={value => this.onEditItemText(value, item)} />
          {Array(Number.parseInt(scale.scaleSize))
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
                <DynaDropLabel
                  key={label.guid}
                  id={label.guid}
                  className="label"
                  canToggleType={false}
                  onToggleType={null}
                  editMode={editMode}
                  text={(label.text.content.first() as ContiguousText)
                    .extractPlainText().valueOr('')}
                  onEdit={text => onEditLabelText(text, label, scale, onEditScale)} />))}
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
