import * as React from 'react';
import * as Immutable from 'immutable';

import * as persistence from '../../../data/persistence';
import * as models from '../../../data/models';
import {Skill} from '../../../data/skills';
import * as contentTypes from '../../../data/contentTypes';
import * as types from '../../../data/types';

import Modal from 'react-modal';

const tempnavstyle= {   
  h2: {
    marginRight: '10px'
  },
    
  modalContainer: {
    "display" : "flex", 
    "flexDirection" : 'column',
    "justifyContent": "space-between"  
  },
        
  objectContainer: {
    marginTop: '10px',
    overflow: "auto"    
  }    
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
  }    
};

class Item {
    id: string="";
    checked: boolean = false;
    title: string="";
}

interface SkillTryoutModeler {

}

export interface SkillTryoutModelerProps {        
  source : Skill;
  modalIsOpen : boolean;      
}

export interface SkillTryoutModelerState {
  source : Skill;
  modalIsOpen : boolean;
}

/**
*
*/
class SkillTryoutModeler extends React.Component<SkillTryoutModelerProps, SkillTryoutModelerState> 
{  
  /**
   * 
   */    
  constructor(props) {
    console.log ("SkillTryoutModeler ()");
        
    super(props);
      
    console.log ("Linking skill source: " + JSON.stringify (this.props.source));
     
    this.state = {                                    
                   modalIsOpen: this.props.modalIsOpen,
                   source: this.props.source
                 };
            
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);  
  }
    
  /**
   * 
   */    
  componentWillReceiveProps (newProps:SkillTryoutModelerProps) {      
      console.log ("componentWillReceiveProps ("+newProps ["modalIsOpen"]+")");
      //this.setState({sourceData: newProps.sourceData, modalIsOpen: newProps ["modalIsOpen"], targetAnnotations: newProps.targetAnnotations});
  }
    
  /**
   * 
   */    
  openModal() {  
    this.setState({modalIsOpen: true}); 
  }

  /**
   * 
   */    
  afterOpenModal() {
    console.log ("afterOpenModal ()");
    
  }
    
  /**
   * 
   */    
  render () {      
    //console.log ("Source data: " + JSON.stringify (this.state.sourceData)); 

    return (<Modal
             isOpen={this.state.modalIsOpen}
             onAfterOpen={this.afterOpenModal}
             contentLabel="Skill Tryout Modeler"
             style={customStyles}>
                 <nav className="navbar navbar-toggleable-md navbar-light bg-faded">
                   <p className="h2" style={tempnavstyle.h2}>Skill Tryout Modeler</p>
                 </nav>
                 <div style={tempnavstyle.objectContainer}>
                  <svg>
                   <circle cx={50} cy={50} r={10} fill="red" />
                  </svg>
                 </div>
             </Modal>);
  }
}

export default SkillTryoutModeler;
