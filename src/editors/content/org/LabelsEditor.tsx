import * as React from 'react';
import * as models from 'data/models';
import * as org from 'data/models/utils/org';
import { Title } from 'components/objectives/Title';

export interface LabelsEditor {

}

export interface LabelsEditorProps {
  onEdit: (cr: org.OrgChangeRequest) => void;
  model: models.OrganizationModel;
  editMode: boolean;
}

export interface LabelsEditorState {

}

export class LabelsEditor
  extends React.PureComponent<LabelsEditorProps, LabelsEditorState> {

  constructor(props) {
    super(props);

  }

  onSequenceEdit(sequence: string) {
    const undo = m => m.with(
      { labels: m.labels.with({ sequence: this.props.model.labels.sequence }) });
    const cr = org.makeUpdateRootModel(
      (m) => {
        return m.with({ labels: m.labels.with({ sequence }) });
      },
      undo);
    this.props.onEdit(cr);
  }

  onUnitEdit(unit: string) {
    const undo = m => m.with(
      { labels: m.labels.with({ unit: this.props.model.labels.unit }) });
    this.props.onEdit(
      org.makeUpdateRootModel(m => m.with({ labels: m.labels.with({ unit }) }), undo));
  }

  onModuleEdit(module: string) {
    const undo = m => m.with(
      { labels: m.labels.with({ module: this.props.model.labels.module }) });
    this.props.onEdit(
      org.makeUpdateRootModel(m => m.with({ labels: m.labels.with({ module }) }), undo));
  }

  onSectionEdit(section: string) {
    const undo = m => m.with(
      { labels: m.labels.with({ section: this.props.model.labels.section }) });
    this.props.onEdit(
      org.makeUpdateRootModel(m => m.with({ labels: m.labels.with({ section }) }), undo));
  }


  renderEditor(attr: string, update) {
    const model = this.props.model.labels;
    return (
      <Title
        title={model[attr]}
        editMode={this.props.editMode}
        onBeginExternallEdit={() => true}
        requiresExternalEdit={false}
        isHoveredOver={true}
        onEdit={update}
        loading={false}
        disableRemoval={true}
        editWording="Edit"
        onRemove={() => false}
      >
        {model[attr]}
      </Title>
    );
  }

  renderRow(attr: string, update) {
    const label = attr.substr(0, 1).toUpperCase() + attr.substr(1);
    return (
      <div className="form-group row">
        <label className="col-2 col-form-label">{label}</label>
        <div className="col-2">
          {this.renderEditor(attr, update)}
        </div>
      </div>
    );
  }

  render() {

    const rows = [
      ['sequence', this.onSequenceEdit.bind(this)],
      ['unit', this.onUnitEdit.bind(this)],
      ['module', this.onModuleEdit.bind(this)],
      ['section', this.onSectionEdit.bind(this)]].map((attr) => {
        return this.renderRow(attr[0], attr[1]);
      });

    return (
      <div className="labels-editor">
        <p>Enter custom labels to use in place of the following organization components:</p>
        {rows}
      </div>
    );
  }

}

