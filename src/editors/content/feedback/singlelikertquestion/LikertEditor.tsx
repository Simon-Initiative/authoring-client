import * as React from 'react';
import { ContentElement } from 'data/content/common/interfaces';
import { Likert } from 'data/content/feedback/likert';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { ContentElements } from 'data/content/common/elements';
import { getLabelForFeedbackQuestion } from 'data/models/feedback';
import { REMOVE_QUESTION_DISABLED_MSG } from 'editors/content/question/question/Question';
import { ContentTitle } from 'editors/content/common/ContentTitle';
import {
  AbstractContentEditor, AbstractContentEditorProps,
  AbstractContentEditorState,
} from 'editors/content/common/AbstractContentEditor';
import '../common.scss';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { Select } from 'editors/content/common/Select';
import { TabOptionControl } from 'editors/content/common/TabContainer';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { onEditScaleSize, onEditLabelText } from 'editors/content/feedback/utils';
import { LikertScale } from 'data/content/feedback/likert_scale';
import { DynaDropLabel } from 'editors/content/learning/dynadragdrop/DynaDropLabel';
import { ContiguousText } from 'data/content/learning/contiguous';

import './LikertEditor.scss';

export interface Props extends AbstractContentEditorProps<Likert> {
  canRemove: boolean;
  onRemove: () => void;
  onDuplicate: () => void;
}

export interface State extends AbstractContentEditorState {

}

export class LikertEditor extends AbstractContentEditor<Likert, Props, State> {
  onEditPrompt = (content: ContentElements, src: ContentElement) => {
    const { onEdit, model } = this.props;
    onEdit(model.with({ prompt: model.prompt.with({ content }) }), src);
  }

  onEditScale = (scale: LikertScale) => {
    const { onEdit, model } = this.props;
    onEdit(model.with({ scale }));
  }

  onToggleRequired = () => {
    const { model, onEdit } = this.props;
    onEdit(model.with({ required: !model.required }), model);
  }

  renderSidebar() {
    return null;
  }

  renderToolbar() {
    return null;
  }

  renderMain() {
    const { editMode, services, canRemove, onRemove, context, onDuplicate, model } = this.props;

    const scaleOptions = [1, 3, 5, 7]
      .map(n => <option key={n} value={n}>{n}</option>);

    return (
      <div className="feedback-question-editor">
        <ContentTitle
          title={getLabelForFeedbackQuestion(model)}
          onDuplicate={onDuplicate}
          editMode={editMode}
          canRemove={canRemove}
          removeDisabledMessage={REMOVE_QUESTION_DISABLED_MSG}
          onRemove={onRemove}
          helpPopover={null} />
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
          <br />
          <TabOptionControl name="required">
            <ToggleSwitch
              checked={model.required}
              label="Required Question"
              onClick={this.onToggleRequired} />
          </TabOptionControl>
          <br />
          <SidebarGroup label="Scale">
            <div className="likert-table single">
              <table>
                {/* Using thead just to avoid needing to change styles from QuestionTable */}
                <thead>
                  <tr>
                    <td>
                      <Select
                        editMode={this.props.editMode}
                        label="Scale Size"
                        value={model.scale.scaleSize}
                        onChange={size => onEditScaleSize(size, model.scale, this.onEditScale)}>
                        {scaleOptions}
                      </Select></td>
                    {model.scale.labels.toArray().map((label =>
                      <DynaDropLabel
                        key={label.guid}
                        id={label.guid}
                        className="label"
                        canToggleType={false}
                        onToggleType={null}
                        editMode={editMode}
                        text={(label.text.content.first() as ContiguousText)
                          .extractPlainText().valueOr('')}
                        onEdit={text =>
                          onEditLabelText(text, label, model.scale, this.onEditScale)} />))}
                  </tr>
                </thead>
              </table>
            </div>
          </SidebarGroup>
        </div>
      </div>
    );
  }
}

