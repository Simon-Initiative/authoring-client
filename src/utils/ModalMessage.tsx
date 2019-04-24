import * as React from 'react';

export interface ModalMessage {
  modal: any;
}

export interface ModalMessageProps {
  okLabel?: string;
  title?: string;
  onCancel: () => void;
}

export class ModalMessage extends React.PureComponent<ModalMessageProps, {}> {

  componentDidMount() {
    (window as any).$(this.modal).modal('show');
  }

  componentWillUnmount() {
    (window as any).$(this.modal).modal('hide');
  }

  render() {

    const okLabel = this.props.okLabel !== undefined ? this.props.okLabel : 'Done';

    return (
      <div ref={(modal) => { this.modal = modal; }}
        data-backdrop="static" className="modal fade">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              {this.props.title}
              <button onClick={this.props.onCancel} type="button" className="close"
                data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              {this.props.children}
            </div>
            <div className="modal-footer">
              <button type="button"
                onClick={this.props.onCancel}
                className="btn btn-primary">{okLabel}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
