import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import {
    AbstractItemPartEditor, AbstractItemPartEditorProps,
    AbstractItemPartEditorState,
} from '../common/AbstractItemPartEditor';
import { Select } from '../common/controls';
import {
  TabSection, TabSectionContent, TabSectionHeader,
} from 'editors/content/common/TabContainer';
import { Feedback } from '../part/Feedback';

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
    this.onSizeChange = this.onSizeChange.bind(this);
    this.onNotationChange = this.onNotationChange.bind(this);
    this.onEditMult = this.onEditMult.bind(this);
  }

  onPartEdit(partModel: contentTypes.Part) {
    this.props.onEdit(this.props.itemModel, partModel);
  }

  onSizeChange(inputSize) {
    this.props.onEdit(this.props.itemModel.with({ inputSize }), this.props.partModel);
  }

  onNotationChange(notation) {
    this.props.onEdit(this.props.itemModel.with({ notation }), this.props.partModel);
  }

  onEditMult(mult) {
    const responseMult = this.props.partModel.responseMult.set(mult.guid, mult);
    const partModel = this.props.partModel.with({ responseMult });
    this.props.onEdit(this.props.itemModel, partModel);
  }

  render() {
    const {
      partModel,
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
        <TabSection key="feedback" className="feedback">
          <TabSectionHeader title="Feedback"/>
          <TabSectionContent>
            <Feedback
              {...this.props}
              model={partModel}
              onEdit={this.onPartEdit} />
          </TabSectionContent>
        </TabSection>
      </TabSection>
    );
  }

}

