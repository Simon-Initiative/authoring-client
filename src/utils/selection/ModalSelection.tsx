import * as React from 'react';

interface ModalSelection {
  modal: any;
}

export interface ModalSelectionProps {
  title: string;
  onInsert: () => void;
  onCancel: () => void;
}

class ModalSelection extends React.PureComponent<ModalSelectionProps, {}> {

  render() {
    return (      
      <div ref={(modal) => { this.modal = modal; }} className="modal fade">
        <div className="modal-dialog" role="document">
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
                <button onClick={this.props.onCancel} type="button" data-dismiss="modal" className="btn btn-secondary">Cancel</button>
                <button onClick={this.props.onInsert} type="button" data-dismiss="modal" className="btn btn-primary">Insert</button>
            </div>
            </div>
        </div>
      </div>);
  }

  componentDidMount() {
    (window as any).$(this.modal).modal('show');
  }

}

export default ModalSelection;



