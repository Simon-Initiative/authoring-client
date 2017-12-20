import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import * as Immutable from 'immutable';
import { ChoiceFeedback, AUTOGEN_MAX_CHOICES } from '../part/ChoiceFeedback';
import { Button } from '../common/controls';
import guid from 'utils/guid';
import { Question, QuestionProps, QuestionState,
Section, SectionContent, SectionHeader, OptionControl, SectionControl } from './Question';
import { Choices } from './Choices';
import { CombinationsMap } from 'types/combinations';

export interface CheckAllThatApplyProps extends QuestionProps<contentTypes.MultipleChoice> {
  onGetChoiceCombinations: (comboNum: number) => CombinationsMap;
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

  componentDidMount() {
    this.updateChoiceCombinations();
  }

  componentDidUpdate() {
    this.updateChoiceCombinations();
  }

  updateChoiceCombinations() {
    const { itemModel, onGetChoiceCombinations } = this.props;

    if (itemModel.choices.size <= AUTOGEN_MAX_CHOICES) {
      onGetChoiceCombinations(itemModel.choices.size);
    }
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
    const {
      context, services, editMode, itemModel,
      partModel, onGetChoiceCombinations, onEdit,
    } = this.props;

    return ([
      <Section key="choices" className="choices">
        <SectionHeader title="Choices">
          <SectionControl key="shuffle" name="Shuffle" onClick={this.onToggleShuffle}>
            <input
              className="toggle toggle-light"
              type="checkbox"
              readOnly
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
            itemModel={itemModel}
            onGetChoiceCombinations={onGetChoiceCombinations} />
        </SectionContent>
      </Section>,
      <Section key="feedback" className="feedback">
        <SectionHeader title="Feedback"/>
        <SectionContent>
          <ChoiceFeedback
            {...this.props}
            model={partModel}
            choices={itemModel.choices.toArray()}
            onGetChoiceCombinations={onGetChoiceCombinations}
            onEdit={this.onPartEdit} />
        </SectionContent>
      </Section>,
    ]);
  }

}
