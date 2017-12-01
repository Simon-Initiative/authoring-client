import * as React from 'react';

export interface Actions {

}

export interface ActionsProps {
  onDuplicate: () => void;
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

        <dd className="col-sm-10">Create a <strong>duplicate</strong> of this organization.
        Changes you make to the structure
          of the duplicate (e.g. adding units, removing modules,
          renaming sections) will not appear in this original organization.</dd>
          <dt className="col-sm-2 justify-content-right">
        <button className="btn btn-block btn-primary">Duplicate</button></dt>

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

