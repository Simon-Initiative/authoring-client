import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import * as Immutable from 'immutable';
import { ChoiceFeedback } from '../part/ChoiceFeedback';
import { Button } from '../common/controls';
import guid from 'utils/guid';
import { Question, QuestionProps, QuestionState,
Section, SectionContent, SectionHeader, OptionControl, SectionControl } from './Question';
import { Choices } from './Choices';

export interface CheckAllThatApplyProps extends QuestionProps<contentTypes.MultipleChoice> {

}

export interface CheckAllThatApplyState extends QuestionState {

}

/**
 * The content editor for HtmlContent.
 */
export class CheckAllThatApply extends Question<CheckAllThatApplyProps, CheckAllThatApplyState> {

  constructor(props) {
    super(props);

    this.setClassname('check-all-that-apply');

    this.onToggleShuffle = this.onToggleShuffle.bind(this);
    this.onToggleAdvanced = this.onToggleAdvanced.bind(this);
    this.onPartEdit = this.onPartEdit.bind(this);
  }

  onToggleShuffle() {
    const {
      itemModel,
      partModel,
      onEdit,
    } = this.props;

    onEdit(itemModel.with({ shuffle: !itemModel.shuffle }), partModel);
  }

  onToggleAdvanced(e) {
    // TODO
    console.log('onToggleAdvancedMode NOT IMPLEMENTED');
  }

  onPartEdit(partModel: contentTypes.Part) {
    this.props.onEdit(this.props.itemModel, partModel);
  }

  renderAdditionalOptions() {
    return [
      <OptionControl key="advanced" name="Advanced" onClick={this.onToggleAdvanced}>
        <div className="control">
          <input className="toggle toggle-light" type="checkbox" checked={false} />
          <label className="toggle-btn"></label>
        </div>
      </OptionControl>,
    ];
  }

  renderAdditionalSections() {
    const { context, services, editMode, itemModel, partModel, onEdit } = this.props;

    return ([
      <Section key="choices" className="choices">
        <SectionHeader title="Choices">
          <SectionControl key="shuffle" name="Shuffle" onClick={this.onToggleShuffle}>
            <input
              className="toggle toggle-light"
              type="checkbox"
              checked={itemModel.shuffle} />
            <label className="toggle-btn"></label>
          </SectionControl>
        </SectionHeader>
        <SectionContent>
          <Choices
            onEdit={onEdit}
            context={context}
            services={services}
            editMode={editMode}
            partModel={partModel}
            itemModel={itemModel} />
        </SectionContent>
      </Section>,
      <Section key="feedback" className="feedback">
        <SectionHeader title="Feedback"/>
        <SectionContent>
          <ChoiceFeedback
            {...this.props}
            model={partModel}
            choices={itemModel.choices.toArray()}
            onEdit={this.onPartEdit} />
        </SectionContent>
      </Section>,
    ]);
  }

}
