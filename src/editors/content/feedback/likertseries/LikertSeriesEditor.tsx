import * as React from 'react';
import { ContentElement } from 'data/content/common/interfaces';
import { LikertSeries } from 'data/content/feedback/likert_series';
import * as Immutable from 'immutable';
import { LikertItem } from 'data/content/feedback/likert_item';
import { ContentTitle } from 'editors/content/common/ContentTitle';
import { getLabelForFeedbackQuestion } from 'data/models/feedback';
import { REMOVE_QUESTION_DISABLED_MSG } from 'editors/content/question/question/Question';
import {
  AbstractContentEditor, AbstractContentEditorProps,
  AbstractContentEditorState,
} from 'editors/content/common/AbstractContentEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { Select } from 'editors/content/common/Select';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { ContentElements, TEXT_ELEMENTS } from 'data/content/common/elements';
import '../common.scss';
import './LikertSeriesEditor.scss';
import { QuestionTable } from './QuestionTable';
import { LikertScale } from 'data/content/feedback/likert_scale';
import { FeedbackPrompt } from 'data/content/feedback/feedback_prompt';
import { LikertLabel } from 'data/content/feedback/likert_label';
import guid from 'utils/guid';

export interface Props extends AbstractContentEditorProps<LikertSeries> {
  canRemove: boolean;
  onRemove: () => void;
  onDuplicate: () => void;
}

export interface State extends AbstractContentEditorState {

}

export class LikertSeriesEditor extends AbstractContentEditor<LikertSeries, Props, State> {

  renderQuestionTitle = () => {
    const { model, canRemove, onRemove, editMode, onDuplicate } = this.props;

    return (
      <ContentTitle
        title={getLabelForFeedbackQuestion(model)}
        onDuplicate={onDuplicate}
        editMode={editMode}
        canRemove={canRemove}
        removeDisabledMessage={REMOVE_QUESTION_DISABLED_MSG}
        onRemove={onRemove}
        helpPopover={null} />
    );
  }

  onEditPrompt = (content: ContentElements) => {
    const { onEdit, model } = this.props;
    onEdit(model.with({ prompt: model.prompt.with({ content }) }), null);
  }

  onEditItems = (items: Immutable.OrderedMap<string, LikertItem>) => {
    const { onEdit, model } = this.props;
    onEdit(model.with({ items }), null);
  }

  onEditScaleSize = (scaleSize: string) => {
    const { model, onEdit } = this.props;

    const newSize = Number.parseInt(scaleSize);
    const oldSize = Number.parseInt(model.scale.scaleSize);

    // A scale's labels have a `value` attribute which corresponds to its position.
    // Whenever we change the scale size, we need to relabel the labels with
    // new values, keeping in mine they're 1-indexed
    const labelsWithIncorrectValues = newSize > oldSize
      ? model.scale.labels.concat(this.newLabels(newSize - oldSize))
      : model.scale.labels.take(newSize);
    const labels = Immutable.OrderedMap<string, LikertLabel>(
      labelsWithIncorrectValues.toArray()
        .map((label, i) => label.with({ value: (i + 1).toString() }))
        .map(label => [label.guid, label]),
    );

    onEdit(
      model.with({
        scale: model.scale.with({
          scaleSize,
          scaleCenter: String(Math.ceil(newSize / 2)),
          labels,
        }),
      }),
    );
  }

  newLabels(size: number): Immutable.OrderedMap<string, LikertLabel> {
    const label = (i: number) => new LikertLabel({
      text: ContentElements.fromText('Label', guid(), TEXT_ELEMENTS),
      value: i.toString(),
    });
    const labels: LikertLabel[] = [];
    // values are 1-indexed!
    for (let i = 1; i <= size; i += 1) {
      labels.push(label(i));
    }
    return Immutable.OrderedMap<string, LikertLabel>(labels.map(label => [label.guid, label]));
  }

  onEditScale = (scale: LikertScale) => {
    const { onEdit, model } = this.props;

    onEdit(model.with({ scale }));
  }

  renderScaleOptions() {
    const { model } = this.props;

    const scaleOptions = [1, 3, 5, 7]
      .map(n => <option key={n} value={n}>{n}</option>);

    return (
      <SidebarGroup label="Scale Size">
        <Select
          editMode={this.props.editMode}
          label=""
          value={model.scale.scaleSize}
          onChange={this.onEditScaleSize}>
          {scaleOptions}
        </Select>
      </SidebarGroup>
    );
  }

  renderToolbar() {
    return null;
  }

  renderSidebar() {
    return null;
  }

  renderMain() {
    const { editMode, services, context, model } = this.props;

    console.log('model', model)

    return (
      <div className="feedback-question-editor">
        {this.renderQuestionTitle()}
        <div className="question-body" key="question">
          <ContentContainer
            activeContentGuid={this.props.activeContentGuid}
            hover={this.props.hover}
            onUpdateHover={this.props.onUpdateHover}
            onFocus={this.props.onFocus}
            editMode={editMode}
            services={services}
            context={context}
            model={model.prompt.content}
            onEdit={this.onEditPrompt} />
          {this.renderScaleOptions()}
          <br />
          {/* Pass scale (size, center, labels) to table

            First row of table is header. Skip first column, then layout labels in
            order along the top. each must be editable

            pass LikertItem[] to table

            for rest of rows, first column is the item prompt (editable),
            then rest of rows are a grayed out box with radio button in center

            add row button at bottom
            dropdown with select scale sizes for columns above table


            */}
          <QuestionTable
            editMode={editMode}
            scale={model.scale}
            items={model.items}
            onEditItems={this.onEditItems}
            onEditScale={this.onEditScale}
          />
        </div>
      </div>
    );
  }
}
