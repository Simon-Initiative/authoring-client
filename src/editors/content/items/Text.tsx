import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from '../../common/AppServices';
import {
  AbstractItemPartEditor,
  AbstractItemPartEditorProps,
  AbstractItemPartEditorState,
} from '../common/AbstractItemPartEditor';
import { Choice } from './Choice';
import { ExplanationEditor } from '../part/ExplanationEditor';
import { TabularFeedback } from '../part/TabularFeedback';
import { Hints } from '../part/Hints';
import { ItemLabel } from './ItemLabel';
import { CriteriaEditor } from '../question/CriteriaEditor';
import ConceptsEditor from '../concepts/ConceptsEditor.controller';
import { TextInput, InlineForm, Button, Checkbox, Collapse, Select } from '../common/controls';
import guid from '../../../utils/guid';
import { ResponseMultEditor } from './ResponseMult';

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
    this.onWhitespaceChange = this.onWhitespaceChange.bind(this);
    this.onCaseSensitive = this.onCaseSensitive.bind(this);
    this.onSizeChange = this.onSizeChange.bind(this);
    this.onEditMult = this.onEditMult.bind(this);
  }

  onPartEdit(partModel: contentTypes.Part) {
    const {
      itemModel,
      onEdit,
    } = this.props;

    onEdit(itemModel, partModel);
  }

  onWhitespaceChange(whitespace) {
    const {
      partModel,
      itemModel,
      onEdit,
    } = this.props;

    onEdit(itemModel.with({ whitespace }), partModel);
  }

  onCaseSensitive(caseSensitive) {
    const {
      partModel,
      itemModel,
      onEdit,
    } = this.props;

    onEdit(itemModel.with({ caseSensitive }), partModel);
  }

  onSizeChange(inputSize) {
    const {
      partModel,
      itemModel,
      onEdit,
    } = this.props;

    onEdit(itemModel.with({ inputSize }), partModel);
  }

  onEditMult(mult) {
    const {
      partModel,
      itemModel,
      onEdit,
    } = this.props;

    const responseMult = partModel.responseMult.set(mult.guid, mult);
    const newPartModel = partModel.with({ responseMult });
    onEdit(itemModel, newPartModel);
  }

  render() : JSX.Element {
    const {
      context,
      services,
      partModel,
      itemModel,
      editMode,
      onEdit,
      onFocus,
      onBlur,
      onRemove,
    } = this.props;

    let feedback;

    if (partModel.responseMult.size > 0) {

      feedback = partModel.responseMult
        .toArray().map(m => <ResponseMultEditor
          editMode={editMode}
          services={services}
          context={context}
          model={m}
          onEdit={this.onEditMult}
        />);
    } else {

      feedback = <TabularFeedback
            input={itemModel.id}
            editMode={editMode}
            services={services}
            context={context}
            model={partModel}
            onEdit={this.onPartEdit}
          />;
    }

    const controls = (
      <div style={{ display: 'inline' }}>
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

        <Checkbox editMode={editMode}
          label="Case Sensitive"
          value={itemModel.caseSensitive}
          onEdit={this.onCaseSensitive} />
      </div>);

    return (
      <div className="itemPart"
        onFocus={() => onFocus(itemModel.id)}
        onBlur={() => onBlur(itemModel.id)}>
        <ItemLabel
          label="Text"
          editMode={editMode}
          onClick={() => onRemove(itemModel, partModel)} />

        {controls}

        {feedback}

      </div>
    );
  }

}
