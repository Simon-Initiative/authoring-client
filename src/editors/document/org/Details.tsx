import * as React from 'react';
import guid from '../../../utils/guid';
import * as models from '../../../data/models';
import { TextInput } from '../../content/common/TextInput';

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
  }

  onTitleEdit(title) {
    this.props.onEdit(this.props.model.with({ title }));
  }

  onAudienceEdit(audience) {
    this.props.onEdit(this.props.model.with({ audience }));
  }

  onDescEdit(description) {
    this.props.onEdit(this.props.model.with({ description }));
  }

  render() {

    return (
      <div>
        <div className="form-group row">
          <label className="col-1 col-form-label">Title</label>
          <div className="col-10">
            <TextInput editMode={this.props.editMode} 
              width="100%" label="" value={this.props.model.title}
              onEdit={this.onTitleEdit} type="text"/>
          </div>
        </div>
        <div className="form-group row">
          <label className="col-1 col-form-label">Description</label>
          <div className="col-10">
            <TextInput editMode={this.props.editMode} 
              width="100%" label="" value={this.props.model.description}
              onEdit={this.onDescEdit} type="text"/>
          </div>
        </div>
        <div className="form-group row">
          <label className="col-1 col-form-label">Audience</label>
          <div className="col-10">
            <TextInput editMode={this.props.editMode} 
              width="100%" label="" value={this.props.model.audience}
              onEdit={this.onAudienceEdit} type="text"/>
          </div>
        </div>
      </div>
    ); 
  }

}

