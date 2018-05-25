import * as React from 'react';
import { OrganizationModel, CourseModel } from 'data/models';
import { CourseId } from 'data/types';

export interface Actions {

}

export interface ActionsProps {
  onDuplicate: () => void;
  onPreview: (courseId: CourseId, organization: OrganizationModel) => Promise<any>;
  organization: OrganizationModel;
  course: CourseModel;
}

export interface ActionsState {

}

export class Actions
  extends React.PureComponent<ActionsProps, ActionsState> {

  constructor(props) {
    super(props);

  }

  render() {

    return (
      <div className="org-tab">

        <dl className="row">

          <dd className="col-sm-10">Generate a <strong>preview</strong> of this organization.
          The full course organization will be generated in the OLI platform.</dd>
            <dt className="col-sm-2 justify-content-right">
              <button
                className="btn btn-block btn-primary"
                onClick={() =>
                  this.props.onPreview(this.props.course.guid, this.props.organization)}>
                <i className="fa fa-eye" />&nbsp;&nbsp;Generate Preview
              </button>
            </dt>

          <br/><br/>

          <dd className="col-sm-10">Create a <strong>copy</strong> of this organization.
          Changes you make to the structure
            of the copy (e.g. adding units, removing modules,
          renaming sections) will not be reflected in this original organization.</dd>
          <dt className="col-sm-2 justify-content-right">
            <button
              onClick={this.props.onDuplicate}
              className="btn btn-block btn-primary">
              Copy
            </button>
          </dt>

          <dd className="col-sm-10">
            <p>Permanently <strong>delete</strong> this organization from the course package. This
          operation cannot be undone.</p>
          </dd>
          <dt className="col-sm-2">
            <button disabled className="btn btn-block btn-danger">Delete</button>
          </dt>

        </dl>

      </div>
    );
  }

}

