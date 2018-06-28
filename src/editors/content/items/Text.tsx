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
} from 'editors/content/common/TabContainer';
import { Feedback } from '../part/Feedback';
import guid from 'utils/guid';
import { ToggleSwitch } from 'components/common/ToggleSwitch';

export interface TextProps extends AbstractItemPartEditorProps<contentTypes.Text> {

}

export interface TextState extends AbstractItemPartEditorState {

}

/**
 * The content editor for HtmlContent.
 */
export class Text
  extends AbstractItemPartEditor<contentTypes.Text, TextProps, TextState> {

  constructor(props) {
    super(props);

    this.onPartEdit = this.onPartEdit.bind(this);
    this.onResponseAdd = this.onResponseAdd.bind(this);
    this.onWhitespaceChange = this.onWhitespaceChange.bind(this);
    this.onSizeChange = this.onSizeChange.bind(this);
    this.onToggleCaseSensitive = this.onToggleCaseSensitive.bind(this);
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
      score: '0',
      match: '',
      feedback: feedbacks.set(feedback.guid, feedback),
    });

    const updatedPartModel = partModel.with({
      responses: partModel.responses.set(response.guid, response),
    });

    this.onPartEdit(updatedPartModel, feedback);
  }

  onWhitespaceChange(whitespace) {
    const {
      partModel,
      itemModel,
      onEdit,
    } = this.props;

    const updated = itemModel.with({ whitespace });

    onEdit(updated, partModel, updated);
  }

  onSizeChange(inputSize) {
    const {
      partModel,
      itemModel,
      onEdit,
    } = this.props;

    const updated = itemModel.with({ inputSize });

    onEdit(updated, partModel, updated);
  }

  onToggleCaseSensitive() {
    const {
      partModel,
      itemModel,
      onEdit,
    } = this.props;

    const updated = itemModel.with({ caseSensitive: !itemModel.caseSensitive });

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
        <TabSectionHeader title="Details"/>
        <TabSectionContent>
          <Select
            editMode={editMode}
            label="Whitespace"
            value={itemModel.whitespace}
            onChange={this.onWhitespaceChange}>
            <option value="preserve">Preserve</option>
            <option value="trim">Trim</option>
            <option value="normalize">Normalize</option>
          </Select>
          <Select editMode={editMode}
            label="Size" value={itemModel.inputSize} onChange={this.onSizeChange}>
            <option value="small">small</option>
            <option value="medium">medium</option>
            <option value="large">large</option>
          </Select>

          <ToggleSwitch
            editMode={this.props.editMode}
            checked={itemModel.caseSensitive}
            label="Case Sensitive"
            onClick={this.onToggleCaseSensitive} />
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
            onEdit={this.onPartEdit} />
        </TabSectionContent>
      </TabSection>
    );
  }

}
