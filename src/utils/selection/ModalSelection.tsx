import * as React from 'react';

interface ModalSelection {
  modal: any;
}

export interface ModalSelectionProps {
  okLabel?: string;
  cancelLabel?: string;
  title: string;
  onInsert: () => void;
  onCancel: () => void;
}

class ModalSelection extends React.PureComponent<ModalSelectionProps, {}> {

  componentDidMount() {
    (window as any).$(this.modal).modal('show');
  }

  componentWillUnmount() {
    (window as any).$(this.modal).modal('hide');
  }

  render() {

    const okLabel = this.props.okLabel !== undefined
      ? this.props.okLabel : 'Insert';
    const cancelLabel = this.props.cancelLabel !== undefined
      ? this.props.cancelLabel : 'Cancel';

    return (
      <div ref={(modal) => { this.modal = modal; }}
        data-backdrop="static" className="modal">
        <div className="modal-dialog modal-xlg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{this.props.title}</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              {this.props.children}
            </div>
            <div className="modal-footer">
              <button type="button"
                onClick={(e) => { e.preventDefault(); this.props.onInsert(); } }
                className="btn btn-primary">{okLabel}</button>
              <button type="button" className="btn btn-secondary"
                onClick={(e) => { e.preventDefault(); this.props.onCancel(); } }
                data-dismiss="modal">{cancelLabel}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

export default ModalSelection;
