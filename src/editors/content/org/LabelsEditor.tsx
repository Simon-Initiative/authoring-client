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

const labelMapper = (toApply: Object, m: models.OrganizationModel) => {
  const labels = m.labels.with(toApply);
  return m.with({ labels });
};

export interface LabelsEditorState {

}

export class LabelsEditor
  extends React.PureComponent<LabelsEditorProps, LabelsEditorState> {

  constructor(props) {
    super(props);

    this.onUpdate = this.onUpdate.bind(this);
  }


  onUpdate(attr, value) {
    const update = {
      [attr]: value,
    };
    const cr = org.makeUpdateRootModel(labelMapper.bind(undefined, update));
    this.props.onEdit(cr);
  }

  renderRow(model, attr: string) {
    const label = attr.substr(0, 1).toUpperCase() + attr.substr(1);
    return (
      <div className="form-group row">
        <label className="col-2 col-form-label">{label}</label>
        <div className="col-2">
          <Title
            title={model.labels[attr]}
            editMode={this.props.editMode}
            onBeginExternallEdit={() => true}
            requiresExternalEdit={false}
            isHoveredOver={true}
            onEdit={this.onUpdate.bind(this, attr)}
            loading={false}
            disableRemoval={true}
            editWording="Edit"
            onRemove={() => false}
          >
            {model.labels[attr]}
          </Title>
        </div>
      </div>
    );
  }

  render() {

    const rows = ['sequence', 'unit', 'module', 'section'].map((attr) => {
      return this.renderRow(this.props.model, attr);
    });

    return (
      <div className="labels-editor">
        <p>Enter custom labels to use in place of the following organization components:</p>
        {rows}
      </div>
    );
  }

}

