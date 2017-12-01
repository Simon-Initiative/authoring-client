import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { AppServices } from '../../common/AppServices';
import {
  AbstractItemPartEditor,
  AbstractItemPartEditorProps,
  AbstractItemPartEditorState,
} from '../common/AbstractItemPartEditor';
import { Choice } from './Choice';
import { CriteriaEditor } from '../question/CriteriaEditor';
import { ExplanationEditor } from '../part/ExplanationEditor';
import { TabularFeedback } from '../part/TabularFeedback';
import { Hints } from '../part/Hints';
import { ItemLabel } from './ItemLabel';
import { TextInput, InlineForm, Button, Checkbox, Collapse, Select } from '../common/controls';
import guid from 'utils/guid';
import { ResponseMultEditor } from './ResponseMult';
import ConceptsEditor from '../concepts/ConceptsEditor';

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

  render() : JSX.Element {

    let feedback;

    if (this.props.partModel.responseMult.size > 0) {

      feedback = this.props.partModel.responseMult
        .toArray().map(m => <ResponseMultEditor
          editMode={this.props.editMode}
          services={this.props.services}
          context={this.props.context}
          model={m}
          onEdit={this.onEditMult.bind(this)}
        />);
    } else {

      feedback = <TabularFeedback
            input={this.props.itemModel.id}
            editMode={this.props.editMode}
            services={this.props.services}
            context={this.props.context}
            model={this.props.partModel}
            onEdit={this.onPartEdit}
          />;
    }

    const controls = (
      <div style={{ display: 'inline' }}>
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
      </div>);

    return (
      <div
        className="itemPart"
        onFocus={() => this.props.onFocus(this.props.itemModel.id)}
        onBlur={() => this.props.onBlur(this.props.itemModel.id)}>

        <ItemLabel label="Numeric" editMode={this.props.editMode}
          onClick={() => this.props.onRemove(this.props.itemModel, this.props.partModel)}/>

        {controls}

        {feedback}

      </div>
    );
  }

}

