import * as React from 'react';

interface ModalPrompt {
  modal: any;
}

export interface ModalPromptProps {
  okLabel?: string;
  cancelLabel?: string;
  text: string;
  onInsert: () => void;
  onCancel: () => void;
}

class ModalPrompt extends React.PureComponent<ModalPromptProps, {}> {

  componentDidMount() {
    (window as any).$(this.modal).modal('show');
  }

  componentWillUnmount() {
    (window as any).$(this.modal).modal('hide');
  }

  render() {

    const okLabel = this.props.okLabel !== undefined ? this.props.okLabel : 'Insert';
    const cancelLabel = this.props.cancelLabel !== undefined ? this.props.cancelLabel : 'Cancel';

    return (
      <div ref={(modal) => { this.modal = modal; }}
      data-backdrop="static" className="modal fade">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              {this.props.text}
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

export default ModalPrompt;
