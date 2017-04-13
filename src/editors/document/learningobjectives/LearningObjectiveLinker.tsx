import * as React from 'react';
import * as Immutable from 'immutable';

import * as persistence from '../../../data/persistence';
import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import * as types from '../../../data/types';
import { initWorkbook, resourceQuery, titlesForCoursesResources } from '../../../data/domain';
import * as viewActions from '../../../actions/view';
import Modal from 'react-modal';

interface LearningObjectiveLinker 
{

}

export interface LearningObjectiveLinkerProps
{
  treeData : any;
  modalIsOpen : boolean;    
}

export interface LearningObjectiveLinkerState 
{
  treeData : any; 
  modalIsOpen : boolean;       
}

const customStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    zIndex: 1000
  },
  content: {
    position: 'absolute',
    top: '40px',
    left: '40px',
    right: '40px',
    bottom: '40px',
    border: '1px solid #ccc',
    background: '#fff',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '4px',
    outline: 'none',
    padding: '20px'
  }    
};

/**
*
*/
class LearningObjectiveLinker extends React.Component<LearningObjectiveLinkerProps, LearningObjectiveLinkerState> 
{
  constructor(props) {
    console.log ("LearningObjectiveLinker ()");
        
    super(props);
      
    this.state = {
                   modalIsOpen: this.props.modalIsOpen,
                   treeData: this.props.treeData                        
                 };
            
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);      
  }
    
  componentWillReceiveProps (newProps:any) {
      console.log ("componentWillReceiveProps ("+newProps ["modalIsOpen"]+")");
      
      this.setState({modalIsOpen: newProps ["modalIsOpen"]});
  }
    
  openModal() {
    console.log ("openModal ()");  
    this.setState({modalIsOpen: true});
  }

  afterOpenModal() {
    console.log ("afterOpenModal ()");
  }

  closeModal() {
    console.log ("closeModal ()");
    this.setState({modalIsOpen: false});
  }
    
  render ()
  {
    console.log ("LearningObjectiveLinker:render ("+this.state.modalIsOpen+")");
      
    return (<Modal
             isOpen={this.state.modalIsOpen}
             onAfterOpen={this.afterOpenModal}
             onRequestClose={this.closeModal}
             contentLabel="Linker Dialog"
             style={customStyles}>
             </Modal>);
  }
}

export default LearningObjectiveLinker;
