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

const tempnavstyle : any = {
  objectContainer: {
    marginTop: '10px',
    overflow: 'auto',
  },
};

const customStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(70, 70, 70, 0.75)',
    zIndex: 10001, // otherwise we're behind the left most nav bar
  },
  content: {
    position: 'absolute',
    top: '140px',
    left: '140px',
    right: '140px',
    bottom: '140px',
    border: '0px solid #444444',
    background: '#fff',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '4px',
    outline: 'none',
    padding: '20px',
    zIndex: 10000,
  },
};

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
        <div className="modal-dialog modal-lg" role="document">
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
