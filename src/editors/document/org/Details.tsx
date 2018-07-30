import * as React from 'react';
import * as models from 'data/models';
import { TextInput } from 'editors/content/common/TextInput';
import { Maybe } from 'tsmonad';

export interface Details {

}

export interface DetailsProps {
  model: models.OrganizationModel;
  editMode: boolean;
  onEdit: (model: models.OrganizationModel) => void;
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
    this.props.onEdit(this.props.model.with({ title, resource }));
  }

  onAudienceEdit(audience: string) {
    this.props.onEdit(this.props.model.with({ audience }));
  }

  onDescEdit(description: string) {
    this.props.onEdit(this.props.model.with({ description }));
  }

  onVersionEdit(version: string) {
    this.props.onEdit(this.props.model.with({ version }));
  }

  onProductEdit(product: string) {
    const spacesStripped = product.replace(/\s+/g, '');
    this.props.onEdit(this.props.model.with({ product: Maybe.just<string>(spacesStripped) }));
  }

  render() {

    const product = this.props.model.product.caseOf({ nothing: () => '', just: p => p });

    return (
      <div className="details">
        <div className="form-group row">
          <label className="col-2 col-form-label">Title</label>
          <div className="col-10">
            <TextInput editMode={this.props.editMode}
              width="100%" label="" value={this.props.model.title}
              onEdit={this.onTitleEdit} type="text"/>
          </div>
        </div>
        <div className="form-group row">
          <label className="col-2 col-form-label">Description</label>
          <div className="col-10">
            <TextInput editMode={this.props.editMode}
              width="100%" label="" value={this.props.model.description}
              onEdit={this.onDescEdit} type="text"/>
          </div>
        </div>
        <div className="form-group row">
          <label className="col-2 col-form-label">Audience</label>
          <div className="col-10">
            <TextInput editMode={this.props.editMode}
              width="100%" label="" value={this.props.model.audience}
              onEdit={this.onAudienceEdit} type="text"/>
          </div>
        </div>
        <div className="form-group row">
          <label className="col-2 col-form-label">Version</label>
          <div className="col-10">
            <TextInput editMode={this.props.editMode}
              width="100%" label="" value={this.props.model.version}
              onEdit={this.onVersionEdit} type="text"/>
          </div>
        </div>
        <div className="form-group row">
          <label className="col-2 col-form-label">Product</label>
          <div className="col-10">
            <TextInput editMode={this.props.editMode}
              width="100%" label="" value={product}
              onEdit={this.onProductEdit} type="text"/>
          </div>
        </div>
      </div>
    );
  }

}

