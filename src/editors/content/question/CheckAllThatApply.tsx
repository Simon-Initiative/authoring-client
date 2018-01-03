import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { AUTOGEN_MAX_CHOICES, ChoiceFeedback } from '../part/ChoiceFeedback';
import {
    OptionControl, Question, QuestionProps, QuestionState,
} from './Question';
import {
  TabContainer, Tab, TabSection, TabSectionContent, TabOptionControl, TabSectionHeader,
} from 'editors/content/common/TabContainer';
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

  renderDetails() {
    const {
      context, services, editMode, itemModel,
      partModel, onGetChoiceCombinations, onEdit,
    } = this.props;

    return (
      <React.Fragment>
        <TabSection key="choices" className="choices">
          <TabSectionHeader title="Choices">
            <TabOptionControl key="shuffle" name="Shuffle" onClick={this.onToggleShuffle}>
              <input
                className="toggle toggle-light"
                type="checkbox"
                readOnly
                checked={itemModel.shuffle} />
              <label className="toggle-btn"></label>
            </TabOptionControl>
          </TabSectionHeader>
          <TabSectionContent>
            <Choices
              onEdit={onEdit}
              context={context}
              services={services}
              editMode={editMode}
              partModel={partModel}
              itemModel={itemModel}
              onGetChoiceCombinations={onGetChoiceCombinations} />
          </TabSectionContent>
        </TabSection>
        <TabSection key="feedback" className="feedback">
          <TabSectionHeader title="Feedback"/>
          <TabSectionContent>
            <ChoiceFeedback
              {...this.props}
              model={partModel}
              choices={itemModel.choices.toArray()}
              onGetChoiceCombinations={onGetChoiceCombinations}
              onEdit={this.onPartEdit} />
          </TabSectionContent>
        </TabSection>
      </React.Fragment>
    );
  }

  renderAdditionalTabs() {
    // no additional tabs
    return false;
  }

}
