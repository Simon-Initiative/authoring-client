import * as React from 'react';

export interface ModalMessage {
  modal: any;
}

export interface ModalMessageProps {
  okLabel?: string;
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
      data-backdrop className="modal fade">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              {this.props.children}
            </div>
            <div className="modal-footer">
              <button type="button"
                onClick={(e) => {
                  e.preventDefault();
                  (window as any).$(this.modal).modal('hide');
                }}
                className="btn btn-primary">{okLabel}</button>
            </div>
          </div>
        </div>
      </div>
    );

  }

}
