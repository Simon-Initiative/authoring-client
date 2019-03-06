import * as React from 'react';
import * as models from 'data/models';
import { Maybe } from 'tsmonad';
import * as org from 'data/models/utils/org';
import { Title } from 'components/objectives/Title';

export interface Details {

}

export interface DetailsProps {
  onEdit: (cr: org.OrgChangeRequest) => void;
  model: models.OrganizationModel;
  editMode: boolean;
}

export interface DetailsState {

}

export class Details
  extends React.PureComponent<DetailsProps, DetailsState> {

  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onAudienceEdit = this.onAudienceEdit.bind(this);
    this.onDescEdit = this.onDescEdit.bind(this);
    this.onVersionEdit = this.onVersionEdit.bind(this);
    this.onProductEdit = this.onProductEdit.bind(this);
  }

  onTitleEdit(title: string) {
    const resource = this.props.model.resource.with({ title });
    this.props.onEdit(org.makeUpdateRootModel(m => m.with({ title, resource })));
  }

  onAudienceEdit(audience: string) {
    this.props.onEdit(org.makeUpdateRootModel(m => m.with({ audience })));
  }

  onDescEdit(description: string) {
    this.props.onEdit(org.makeUpdateRootModel(m => m.with({ description })));
  }

  onVersionEdit(version: string) {
    this.props.onEdit(org.makeUpdateRootModel(m => m.with({ version })));
  }

  onProductEdit(product: string) {
    const spacesStripped = product.replace(/\s+/g, '');
    this.props.onEdit(org.makeUpdateRootModel(
      m => m.with({ product: Maybe.just<string>(spacesStripped) })));
  }

  renderEditor(attr: string, update) {
    const model = this.props.model;
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

  render() {

    const product = this.props.model.product.caseOf({ nothing: () => '', just: p => p });

    return (
      <div className="details">
        <div className="form-group row">
          <label className="col-2 col-form-label">Title</label>
          <div className="col-10">
            {this.renderEditor('title', this.onTitleEdit)}
          </div>
        </div>
        <div className="form-group row">
          <label className="col-2 col-form-label">Description</label>
          <div className="col-10">
            {this.renderEditor('description', this.onDescEdit)}
          </div>
        </div>
        <div className="form-group row">
          <label className="col-2 col-form-label">Audience</label>
          <div className="col-10">
            {this.renderEditor('audience', this.onAudienceEdit)}
          </div>
        </div>
        <div className="form-group row">
          <label className="col-2 col-form-label">Version</label>
          <div className="col-10">
            {this.renderEditor('version', this.onVersionEdit)}
          </div>
        </div>
        <div className="form-group row">
          <label className="col-2 col-form-label">Product</label>
          <div className="col-10">
            <Title
              title={product}
              editMode={this.props.editMode}
              onBeginExternallEdit={() => true}
              requiresExternalEdit={false}
              isHoveredOver={true}
              onEdit={this.onProductEdit}
              loading={false}
              disableRemoval={true}
              editWording="Edit"
              onRemove={() => false}
            >
              {product}
            </Title>
          </div>
        </div>
      </div>
    );
  }

}

