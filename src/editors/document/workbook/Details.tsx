import * as React from 'react';
import guid from '../../../utils/guid';
import * as models from '../../../data/models';
import { TextInput } from '../../content/common/TextInput';
import { Maybe } from 'tsmonad';

export interface Details {

}

export interface DetailsProps {
  model: models.WorkbookPageModel;
  editMode: boolean;
  onEdit: (model: models.WorkbookPageModel) => void;
}

export interface DetailsState {

}

export class Details
  extends React.PureComponent<DetailsProps, DetailsState> {

  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);
  }

  onTitleEdit(text) {
    const resource = this.props.model.resource.with({ title: text });
    const title = this.props.model.head.title.with({ text });
    const head = this.props.model.head.with({ title });

    this.props.onEdit(this.props.model.with({ head, resource }));
  }

  render() {

    return (
      <div className="wb-tab">
        <div className="form-group row">
          <label className="col-1 col-form-label">Title</label>
          <div className="col-11">
            <TextInput editMode={this.props.editMode}
              width="100%" label="" value={this.props.model.head.title.text}
              onEdit={this.onTitleEdit} type="text"/>
          </div>
        </div>
      </div>
    );
  }

}

