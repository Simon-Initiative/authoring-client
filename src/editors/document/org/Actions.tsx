import * as React from 'react';
import { Resource } from 'data/contentTypes';
import DeleteResourceModal from 'components/DeleteResourceModal';

export interface Actions {

}

export interface ActionsProps {
  onDuplicate: () => void;
  onDisplayModal: (component: any) => void;
  onDismissModal: () => void;
  resource: Resource;
  courseId: string;
  dispatch: any;
}

export interface ActionsState {

}

export class Actions
  extends React.PureComponent<ActionsProps, ActionsState> {

  constructor(props) {
    super(props);

  }

  render() {
    const { resource, onDisplayModal, onDismissModal, courseId, dispatch, onDuplicate }
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
            onClick={() => onDisplayModal(
            <DeleteResourceModal
              resource={resource}
              onDismissModal={onDismissModal}
              courseId={courseId}
              dispatch={dispatch} />)}
            disabled={false}
            className="btn btn-block btn-danger">Delete</button>
        </dt>

      </dl>

      </div>
    );
  }

}

