import * as React from 'react';
import { DeleteResourceModal } from 'components/DeleteResourceModal.controller';
import { OrganizationModel, CourseModel } from 'data/models';

export interface Actions {

}

export interface ActionsProps {
  onDuplicate: () => void;
  onDisplayModal: (component: any) => void;
  onDismissModal: () => void;
  org: OrganizationModel;
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
    const { org, onDisplayModal, onDismissModal, course, onDuplicate }
      = this.props;

    return (
      <div className="org-tab">

        <dl className="row">

          <dd className="col-sm-10">Create a <strong>copy</strong> of this organization.
          Changes you make to the structure
            of the copy (e.g. adding units, removing modules,
          renaming sections) will not be reflected in this original organization.</dd>
          <dt className="col-sm-2 justify-content-right">
            <button
              onClick={onDuplicate}
              className="btn btn-block btn-primary">
              Copy
        </button></dt>

          <dd className="col-sm-10">
            <p>Permanently <strong>delete</strong> this organization from the course package. This
          operation cannot be undone.</p>
          </dd>
          <dt className="col-sm-2">
            <button
              disabled={false}
              className="btn btn-block btn-danger"
              onClick={() => onDisplayModal(
                <DeleteResourceModal
                  resource={org.resource}
                  course={course}
                  onDismissModal={onDismissModal} />)}>
              Delete
            </button>
          </dt>

        </dl>

      </div>
    );
  }

}

