import * as React from 'react';


interface ModalSelection {
  
}

export interface ModalSelectionProps {
  title: string;
  onInsert: () => void;
  onCancel: () => void;
}

class ModalSelection extends React.PureComponent<ModalSelectionProps, {}> {

  render() {
    return (      
      <div className="modal active">
          <div className="modal-overlay"></div>
          <div className="modal-container">
              <div className="modal-header">
                  <button className="btn btn-clear float-right"></button>
                  <div className="modal-title">{this.props.title}</div>
              </div>
              <div className="modal-body">
                  <div className="content">
                      {this.props.children}
                  </div>
              </div>
              <div className="modal-footer">
                  <button onClick={this.props.onCancel} className="btn btn-link">Cancel</button>
                  <button onClick={this.props.onInsert} className="btn btn-primary">Insert</button>
              </div>
          </div>
      </div>);
  }

}

export default ModalSelection;



