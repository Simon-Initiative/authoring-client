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
  defaultData : any;
  modalIsOpen : boolean;    
}

export interface LearningObjectiveLinkerState 
{
  data : any; 
  modalIsOpen : boolean;       
}

const tempnavstyle=
{
    h2: {
       marginRight: '10px'
    },
        
    objectContainer: {
       marginTop: '10px'
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
    padding: '20px'
  }    
};

/**
*
*/
class LearningObjectiveLinker extends React.Component<LearningObjectiveLinkerProps, LearningObjectiveLinkerState> 
{    
  /**
   * 
   */    
  constructor(props) {
    console.log ("LearningObjectiveLinker ()");
        
    super(props);
      
    this.state = {
                   modalIsOpen: this.props.modalIsOpen,
                   data: this.props.defaultData                        
                 };
            
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);      
  }
    
  /**
   * 
   */    
  componentWillReceiveProps (newProps:any) {      
      this.setState({modalIsOpen: newProps ["modalIsOpen"]});
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
  }

  /**
   * 
   */    
  closeModal() {
    this.setState({modalIsOpen: false});
  }
    
  /**
   * 
   */    
  getInitialState () {
    return {
      data: this.props.defaultData || []
    };
  }

  /**
   * 
   */    
  handleItemChange (e) {
    var selectedValues = [];
    var newData = [];

    this.state.data.forEach(function(item) {
  
       if(item.value === e.target.value) {
         item.checked = e.target.checked;
       }

       if(item.checked) {
         selectedValues.push(item.value);
       }

       newData.push(item);
     });

     this.setState({data: newData});
      
     /* 
     if(this.props.onChange) {
       this.props.onChange(selectedValues); 
     }
     */ 
  }

  /**
   * uncheck all items in the list
   */    
  reset () {
    var newData = [];
    this.state.data.forEach(function(item) {
      item.checked = false;
      newData.push(item);
    });

    this.setState({data: newData});
  }
    
  /**
   * 
   */    
  checkAll () {
     var newData = [];
     this.state.data.forEach(function(item) {
       item.checked = true;
       newData.push(item);
     });

    this.setState({data: newData});
  }
    
  /**
   * 
   */    
  checkInvert () {
     var newData = [];
     this.state.data.forEach(function(item) {
       if (item.checked==true) {
         item.checked = false;
       } else {
         item.checked = true;
       }        
       newData.push(item);
     });

    this.setState({data: newData});
  }      

  /**
   * 
   */    
  render ()
  {
    console.log ("LearningObjectiveLinker:render ("+this.state.modalIsOpen+")");
      
    var options;

    options = this.state.data.map(function(item, index) {
            return (
                <div key={'chk-' + index} className="checkbox">
                    <label>
                        <input
                            type="checkbox"
                            value={item.value}
                            onChange={this.handleItemChange}
                            checked={item.checked ? true : false} /> {item.label}
                    </label>
                </div>
            );
    }.bind(this));      
      
    return (<Modal
             isOpen={this.state.modalIsOpen}
             onAfterOpen={this.afterOpenModal}
             onRequestClose={this.closeModal}
             contentLabel="Linker Dialog"
             style={customStyles}>
               <nav className="navbar navbar-toggleable-md navbar-light bg-faded">
                 <p className="h2" style={tempnavstyle.h2}>Available Skills</p>
                 <a className="nav-link" href="#" onClick={e => this.checkAll ()}>Check All</a>
                 <a className="nav-link" href="#" onClick={e => this.reset ()}>Check None</a>
                 <a className="nav-link" href="#" onClick={e => this.checkInvert ()}>Check Invert</a>
               </nav>
               <div style={tempnavstyle.objectContainer}>
                {options}
               </div>             
             </Modal>);
  }
}

export default LearningObjectiveLinker;
