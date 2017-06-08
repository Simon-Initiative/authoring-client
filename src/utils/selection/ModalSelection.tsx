import * as React from 'react';
import Modal from 'react-modal';

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

const tempnavstyle = {   
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
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    zIndex: 1000 // otherwise we're behind the left most nav bar
  },
  content: {
    position: 'absolute',
    top: '140px',
    left: '140px',
    right: '140px',
    bottom: '140px',
    border: '1px solid #444444',
    background: '#fff',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '4px',
    outline: 'none',
    padding: '20px',
    display : "flex", 
    flexDirection : 'column'  
  },
  messagePanel: {
    height: "150px",
    lineHeight: "150px",
    border: "1px solid black",
    margin: "auto"
  },
  messageSpan : {
    fontSize: "24pt",  
    display: "inline-block",
    verticalAlign: "middle",
    lineHeight: "24pt"
  }  
};

class ModalSelection extends React.PureComponent<ModalSelectionProps, {}> {

  render() {

    const okLabel = this.props.okLabel !== undefined ? this.props.okLabel : 'Insert';
    const cancelLabel = this.props.cancelLabel !== undefined ? this.props.cancelLabel : 'Cancel';

    return (  
      <Modal
        isOpen={true}
        contentLabel={this.props.title}
        style={customStyles}>
          <nav className="navbar navbar-toggleable-md navbar-light bg-faded">
            <h2>{this.props.title}</h2>
            <a className="nav-link" href="#" onClick={e => this.props.onCancel()}>{cancelLabel}</a>
            <a className="nav-link" href="#" onClick={e => this.props.onInsert()}>{okLabel}</a>
          </nav>
          <div style={tempnavstyle.objectContainer}>
            {this.props.children}                 
          </div>
      </Modal>);

  }

}

export default ModalSelection;



