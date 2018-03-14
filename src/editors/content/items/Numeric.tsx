import * as React from 'react';
import { OrderedMap } from 'immutable';
import * as contentTypes from 'data/contentTypes';
import {
    AbstractItemPartEditor, AbstractItemPartEditorProps,
    AbstractItemPartEditorState,
} from '../common/AbstractItemPartEditor';
import { Select, Button } from '../common/controls';
import {
  TabSection, TabSectionContent, TabSectionHeader, TabOptionControl,
} from 'editors/content/common/TabContainer';
import { Feedback } from '../part/Feedback';
import guid from 'utils/guid';

export interface NumericProps extends AbstractItemPartEditorProps<contentTypes.Numeric> {

}

export interface NumericState extends AbstractItemPartEditorState {

}

/**
 * The content editor for HtmlContent.
 */
export class Numeric
  extends AbstractItemPartEditor<contentTypes.Numeric, NumericProps, NumericState> {

  constructor(props) {
    super(props);

    this.onPartEdit = this.onPartEdit.bind(this);
    this.onResponseAdd = this.onResponseAdd.bind(this);
    this.onSizeChange = this.onSizeChange.bind(this);
    this.onNotationChange = this.onNotationChange.bind(this);
    this.onEditMult = this.onEditMult.bind(this);
  }

  onPartEdit(partModel: contentTypes.Part, src) {
    this.props.onEdit(this.props.itemModel, partModel, src);
  }

  onResponseAdd() {
    const { partModel } = this.props;

    const feedback = contentTypes.Feedback.fromText('', guid());
    const feedbacks = OrderedMap<string, contentTypes.Feedback>();

    const response = new contentTypes.Response({
      score: '0',
      match: '',
      feedback: feedbacks.set(feedback.guid, feedback),
    });

    const updatedPartModel = partModel.with({
      responses: partModel.responses.set(response.guid, response),
    });

    this.onPartEdit(updatedPartModel, feedback);
  }

  onSizeChange(inputSize) {
    const updated = this.props.itemModel.with({ inputSize });
    this.props.onEdit(updated, this.props.partModel, updated);
  }

  onNotationChange(notation) {
    const updated = this.props.itemModel.with({ notation });
    this.props.onEdit(updated, this.props.partModel, updated);
  }

  onEditMult(mult, src) {
    const responseMult = this.props.partModel.responseMult.set(mult.guid, mult);
    const partModel = this.props.partModel.with({ responseMult });
    this.props.onEdit(this.props.itemModel, partModel, src);
  }

  render() {
    const {
      partModel,
      editMode,
    } = this.props;

    return (
      <TabSection className="numeric">
        <TabSectionHeader title="Details"/>
        <TabSectionContent>
          <Select editMode={this.props.editMode}
            label="Size" value={this.props.itemModel.inputSize} onChange={this.onSizeChange}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </Select>
          <Select editMode={this.props.editMode}
            label="Notation" value={this.props.itemModel.notation} onChange={this.onNotationChange}>
            <option value="automatic">Automatic</option>
            <option value="decimal">Decimal</option>
            <option value="scientific">Scientific</option>
          </Select>
        </TabSectionContent>
        <TabSectionHeader title="Feedback">
          <TabOptionControl key="add-feedback" name="Add Feedback" hideLabel>
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
            onEdit={this.onPartEdit} />
        </TabSectionContent>
      </TabSection>
    );
  }

}

