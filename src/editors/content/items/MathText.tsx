import * as React from 'react';
import { OrderedMap } from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import {
  AbstractItemPartEditor, AbstractItemPartEditorProps,
  AbstractItemPartEditorState,
} from '../common/AbstractItemPartEditor';
import { Select, Button } from '../common/controls';
import {
  TabSection, TabSectionContent, TabSectionHeader, TabOptionControl,
} from 'components/common/TabContainer';
import { Feedback } from '../part/Feedback';
import guid from 'utils/guid';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { Maybe } from 'tsmonad';

export interface MathTextProps extends AbstractItemPartEditorProps<contentTypes.Text> {

}

export interface MathTextState extends AbstractItemPartEditorState {

}

/**
 * The content editor for HtmlContent.
 */
export class MathText
  extends AbstractItemPartEditor<contentTypes.Text, MathTextProps, MathTextState> {

  constructor(props) {
    super(props);

    this.onPartEdit = this.onPartEdit.bind(this);
    this.onResponseAdd = this.onResponseAdd.bind(this);
    this.onEvaluationChange = this.onEvaluationChange.bind(this);
    this.onKeyboardChange = this.onKeyboardChange.bind(this);
  }

  onPartEdit(partModel: contentTypes.Part, src) {
    const {
      itemModel,
      onEdit,
    } = this.props;

    onEdit(itemModel, partModel, src);
  }

  onResponseAdd() {
    const { partModel } = this.props;

    const feedback = contentTypes.Feedback.fromText('', guid());
    const feedbacks = OrderedMap<string, contentTypes.Feedback>();

    const response = new contentTypes.Response({
      score: Maybe.just('0'),
      match: '',
      input: this.props.itemModel.id,
      feedback: feedbacks.set(feedback.guid, feedback),
    });

    const updatedPartModel = partModel.with({
      responses: partModel.responses.set(response.guid, response),
    });

    this.onPartEdit(updatedPartModel, feedback);
  }

  onEvaluationChange(evaluation) {
    const {
      partModel,
      itemModel,
      onEdit,
    } = this.props;

    const updated = itemModel.with({ evaluation });

    onEdit(updated, partModel, updated);
  }

  onKeyboardChange(keyboard) {
    const {
      partModel,
      itemModel,
      onEdit,
    } = this.props;

    const updated = itemModel.with({ keyboard });

    onEdit(updated, partModel, updated);
  }

  
  render() {
    const {
      editMode,
      itemModel,
      partModel,
    } = this.props;

    return (
      <TabSection className="numeric">
        <TabSectionHeader title="Details" />
        <TabSectionContent>

          <Select
            editMode={editMode}
            label="Evaluation"
            value={itemModel.evaluation}
            onChange={this.onEvaluationChange}>
            <option value="latex">Latex</option>
            <option value="numeric_computation">Numeric Computation</option>
          </Select>

          <Select editMode={editMode}
            label="Keyboard" value={itemModel.keyboard} onChange={this.onKeyboardChange}>
            <option value="math">Math</option>
            <option value="chemistry">Chemistry</option>
          </Select>

        </TabSectionContent>
        <TabSectionHeader title="Feedback">
          <TabOptionControl name="add-feedback">
            <Button
              editMode={editMode}
              type="link"
              onClick={this.onResponseAdd}>
              Add Feedback
            </Button>
          </TabOptionControl>
        </TabSectionHeader>
        <TabSectionContent key="feedback" className="feedback">
          <Feedback
            {...this.props}
            model={partModel}
            disableRemove
            onEdit={this.onPartEdit} />
        </TabSectionContent>
      </TabSection>
    );
  }

}
