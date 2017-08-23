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

  render() {

    const bottom: any = {
      position: 'absolute',
      bottom: '30px',
      right: '30px',
    };
    const okLabel = this.props.okLabel !== undefined ? this.props.okLabel : 'Insert';
    const cancelLabel = this.props.cancelLabel !== undefined ? this.props.cancelLabel : 'Cancel';

    const height = window.innerHeight - 280 - 200;

    const container : any = {
      maxHeight: height,
      overflow: 'scroll',
    };

    return (  
      <Modal
        isOpen={true}
        contentLabel={this.props.title}
        style={customStyles}>
          <nav className="navbar navbar-toggleable-md navbar-light bg-faded">
            <h2>{this.props.title}</h2>
          </nav>

          <div style={container}>
            {this.props.children}                 
          </div>
          
            
          <div style={bottom}>
            
            <button className="btn btn-primary"
              onClick={(e) => { e.preventDefault(); this.props.onInsert(); } }>
                {okLabel}</button>
            <button className="btn" 
              onClick={(e) => { e.preventDefault(); this.props.onCancel(); } }>
                {cancelLabel}</button>
            </div>
          
      </Modal>);

  }

}

export default ModalSelection;



