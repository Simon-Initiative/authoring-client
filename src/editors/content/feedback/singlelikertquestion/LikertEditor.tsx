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
import { TabOptionControl } from 'components/common/TabContainer';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { onEditScaleSize } from 'editors/content/feedback/utils';
import { LikertScale } from 'data/content/feedback/likert_scale';

import './LikertEditor.scss';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';

export interface Props extends AbstractContentEditorProps<Likert> {
  canRemove: boolean;
  onRemove: () => void;
  onDuplicate: () => void;
  activeContentGuid: string;
  hover: string;
  onUpdateHover: (hover: string) => void;
}

export interface State extends AbstractContentEditorState {

}

export class LikertEditor extends AbstractContentEditor<Likert, Props, State> {
  onEditPrompt = (content: ContentElements, src: ContentElement) => {
    const { onEdit, model } = this.props;
    onEdit(model.with({ prompt: model.prompt.with({ content }) }), src);
  }

  onEditScale = (scale: LikertScale, src: ContentElement) => {
    const { onEdit, model } = this.props;
    onEdit(model.with({ scale }), src);
  }

  onToggleRequired = () => {
    const { model, onEdit } = this.props;
    onEdit(model.with({ required: !model.required }), model);
  }

  renderSidebar() {
    return <SidebarContent title="Single Question" />;
  }

  renderToolbar() {
    return <ToolbarGroup label="Single Question"
      columns={3} highlightColor={CONTENT_COLORS.Feedback}>
    </ToolbarGroup>;
  }

  renderMain() {
    const { editMode, canRemove, onRemove, onDuplicate, model } = this.props;

    const scaleOptions = [1, 2, 3, 4, 5, 6, 7, 8]
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
            {...this.props}
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
                      <td>
                        <ContentContainer
                          {...this.props}
                          hideSingleDecorator
                          model={label.text}
                          onEdit={(text, source) => this.onEditScale(
                            model.scale.with({
                              labels: model.scale.labels.set(label.guid, label.with({ text })),
                            }),
                            source)} />
                      </td>
                    ))}
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

