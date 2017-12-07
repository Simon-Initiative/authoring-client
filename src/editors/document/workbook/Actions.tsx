import * as React from 'react';

export interface Actions {

}

export interface ActionsProps {
  onPreview: () => void;
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
      <div className="wb-tab">

      <dl className="row">

        <dd className="col-sm-10"><strong>Preview</strong> the contents of this
        page on an OLI development server. You must have this page added to
        the default organization of the course package for the preview to work.
        </dd>
          <dt className="col-sm-2 justify-content-right">
        <button
          onClick={this.props.onPreview}
          className="btn btn-block btn-primary">
          Preview
        </button></dt>

        <dd className="col-sm-10">
          <p>Permanently <strong>delete</strong> this page from the course package. This
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

