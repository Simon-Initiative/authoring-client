import * as React from 'react';
import Modal from 'react-modal';

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

  render() {

    const bottom: any = {
      position: 'absolute',
      bottom: '30px',
      right: '30px',
    };
    const okLabel = this.props.okLabel !== undefined ? this.props.okLabel : 'Insert';
    const cancelLabel = this.props.cancelLabel !== undefined ? this.props.cancelLabel : 'Cancel';

    const h = window.innerHeight;
    const w = window.innerWidth;
    const height = 200;

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
        top: (((h - height) / 2) - 100) + 'px',
        left: (Math.max(140, (w / 2) - 500)) + 'px',
        right:  (Math.max(140, (w / 2) - 500)) + 'px',
        bottom: (((h - height) / 2) + 100) + 'px',
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

    return (  
      <Modal
        isOpen={true}
        contentLabel={this.props.text}
        style={customStyles}>
          
        <br/>

        <h4>{this.props.text}</h4>

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

export default ModalPrompt;



