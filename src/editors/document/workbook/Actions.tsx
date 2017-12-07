import * as React from 'react';

export interface Actions {

}

export interface ActionsProps {
  onPreview: () => Promise<any>;
}

export interface ActionsState {
  waitingOnPreview: boolean;
}

export class Actions
  extends React.PureComponent<ActionsProps, ActionsState> {

  constructor(props) {
    super(props);

    this.state = { waitingOnPreview: false };
  }

  renderWait() {
    return <span><i className={'fa fa-circle-o-notch fa-spin'}></i> Preview</span>;
  }

  onPreview() {
    this.setState(
      { waitingOnPreview: true },
      () => this.props.onPreview().then(() => this.setState({ waitingOnPreview: false })));
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
          disabled={this.state.waitingOnPreview}
          onClick={() => this.onPreview()}
          className="btn btn-block btn-primary">
          { this.state.waitingOnPreview ? this.renderWait() : 'Preview'}
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

