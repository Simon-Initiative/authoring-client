import * as React from 'react';
import guid from '../../../utils/guid';
import * as models from '../../../data/models';
import { TextInput } from '../../content/common/TextInput';
import * as contentTypes from '../../../data/contentTypes';

import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';

export interface LabelsEditor {

}

export interface LabelsEditorProps extends AbstractContentEditorProps<contentTypes.Labels> {

}

export interface LabelsEditorState {

}

export class LabelsEditor
  extends React.PureComponent<LabelsEditorProps, LabelsEditorState> {

  constructor(props) {
    super(props);

    this.onSequenceEdit = this.onSequenceEdit.bind(this);
    this.onUnitEdit = this.onUnitEdit.bind(this);
    this.onModuleEdit = this.onModuleEdit.bind(this);
    this.onSectionEdit = this.onSectionEdit.bind(this);
  }

  onSequenceEdit(sequence) {
    this.props.onEdit(this.props.model.with({ sequence }));
  }

  onUnitEdit(unit) {
    this.props.onEdit(this.props.model.with({ unit }));
  }

  onModuleEdit(module) {
    this.props.onEdit(this.props.model.with({ module }));
  }

  onSectionEdit(section) {
    this.props.onEdit(this.props.model.with({ section }));
  }

  render() {

    return (
      <div className="labels-editor">

        <p>Enter custom labels to use in place of the following organization components:</p>

        <div className="form-group row">
          <label className="col-1 col-form-label">Sequence</label>
          <div className="col-2">
            <TextInput editMode={this.props.editMode}
              width="100%" label="" value={this.props.model.sequence}
              onEdit={this.onSequenceEdit} type="text"/>
          </div>
        </div>
        <div className="form-group row">
          <label className="col-1 col-form-label">Unit</label>
          <div className="col-2">
            <TextInput editMode={this.props.editMode}
              width="100%" label="" value={this.props.model.unit}
              onEdit={this.onUnitEdit} type="text"/>
          </div>
        </div>
        <div className="form-group row">
          <label className="col-1 col-form-label">Module</label>
          <div className="col-2">
            <TextInput editMode={this.props.editMode}
              width="100%" label="" value={this.props.model.module}
              onEdit={this.onModuleEdit} type="text"/>
          </div>
        </div>
        <div className="form-group row">
          <label className="col-1 col-form-label">Section</label>
          <div className="col-2">
            <TextInput editMode={this.props.editMode}
              width="100%" label="" value={this.props.model.section}
              onEdit={this.onSectionEdit} type="text"/>
          </div>
        </div>
      </div>
    );
  }

}

