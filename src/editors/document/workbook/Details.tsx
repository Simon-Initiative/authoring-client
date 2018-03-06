import * as React from 'react';
import * as models from '../../../data/models';
import { AppContext } from 'editors/common/AppContext';
import { AppServices } from 'editors/common/AppServices';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { ContentElements } from 'data/content/common/elements';

export interface Details {

}

export interface DetailsProps {
  model: models.WorkbookPageModel;
  editMode: boolean;
  onFocus: (child, parent) => void;
  onEdit: (model: models.WorkbookPageModel) => void;
  context: AppContext;
  services: AppServices;
}

export interface DetailsState {

}

export class Details
  extends React.PureComponent<DetailsProps, DetailsState> {

  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);
  }

  onTitleEdit(text: ContentElements) {

    const t = text.extractPlainText().caseOf({ just: s => s, nothing: () => '' });

    const resource = this.props.model.resource.with({ title: t });
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
            <ContentContainer
              {...this.props}
              editMode={this.props.editMode}
              model={this.props.model.head.title.text}
              onEdit={this.onTitleEdit} />
          </div>
        </div>
      </div>
    );
  }

}

