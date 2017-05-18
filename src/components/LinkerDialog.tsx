import * as React from 'react';
import * as Immutable from 'immutable';

import * as persistence from '../data/persistence';
import * as models from '../data/models';
import * as contentTypes from '../data/contentTypes';
import * as types from '../data/types';
import Linkable from '../data/linkable';
import { LOTypes, LearningObjective } from '../data/los';
import {Skill} from '../data/skills';
import { initWorkbook, resourceQuery, titlesForCoursesResources } from '../data/domain';
import * as viewActions from '../actions/view';
import Modal from 'react-modal';

const tempnavstyle= {
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

interface LearningObjectiveLinker {

}

export interface LearningObjectiveLinkerProps {        
  sourceData : any;
  modalIsOpen : boolean;    
  target: any;
  closeModal: any;  
}

export interface LearningObjectiveLinkerState {
  sourceData: any;
  localAnnotations: Array<Item>;     
  modalIsOpen : boolean;    
  target: any;
  closeModal: any;
}

class Item {
    id: string="";
    checked: boolean = false;
    title: string="";
}

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
      
    console.log ("Linking target: " + JSON.stringify (this.props.target));   
      
    this.state = {                                    
                   modalIsOpen: this.props.modalIsOpen,
                   sourceData: this.props.sourceData,
                   target: this.props.target,                                           
                   closeModal: this.props.closeModal,
                   localAnnotations: null
                 };
            
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);  
  }
    
  /**
   * 
   */    
  componentWillReceiveProps (newProps:LearningObjectiveLinkerProps) {      
      console.log ("componentWillReceiveProps ()");
      this.setState({sourceData: newProps.sourceData, modalIsOpen: newProps ["modalIsOpen"], target: newProps.target});
  }
   
  /**
   * Take the annotations from the target object and check or uncheck the corresponding
   * items in the source list so that we can then make changes to the source list and
   * make sure everything is in sync. We assume that the annotations and source list
   * a not aligned! This might be a false assumption but for now it's safer.
   */   
  resolveAnnotations () {
    console.log ("resolveAnnotations ()");
    
    if (this.state.target==null) {
      console.log ("No LO target given yet, bump");  
      return;
    }  
      
    /*
    var newData = [];       
      
    // First reset everything so that we don't have to keep
    // checking and comparing, we can just set it checked if
    // we encounter the item
    this.state.sourceData.forEach(function(resetItem) {
       resetItem.checked=false; 
       newData.push(resetItem);         
    });      
            
    for (var i=0;i<this.state.target.annotations.length;i++) {    
       let item=this.state.target.annotations [i];  
       console.log ("Checking item: " + item); 
        
       for (var j=0;j<newData.length;j++) {
         let sourceItem=newData [j];  
         if (sourceItem.id==item) {
            sourceItem.checked=true;
         }
       }
    }
      
    this.setState({sourceData: newData});
    */
      
    var newData: Array <Item>=new Array ();
      
    // First reset everything so that we don't have to keep
    // checking and comparing, we can just set it checked if
    // we encounter the item
    this.state.sourceData.forEach(function(resetItem) {
       let newItem:Item=new Item ();
       newItem.id=resetItem.id;
       newItem.checked=false;
       newItem.title=resetItem.title;
        
       newData.push(resetItem);        
    });
      
    for (var i=0;i<this.state.target.annotations.length;i++) {    
       let item=this.state.target.annotations [i];  
       console.log ("Checking item: " + item); 
        
       for (var j=0;j<newData.length;j++) {
         let sourceItem=newData [j];  
         if (sourceItem.id==item.id) {
            sourceItem.checked=true;
         }
       }
    }      
  
    this.setState({sourceData: newData});
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
    
    this.resolveAnnotations ();
  }

  /**
   * 
   */    
  closeModal() {
    console.log ("closeModal ()");  
      
    let lo:Linkable=this.state.target as Linkable;
      
    this.setState({modalIsOpen: false});

    var newData = [];
    this.state.sourceData.forEach(function(item) {
      if (item.checked ==true) {
       let newLink:Linkable=new Linkable ();
       newLink.id=item.id;
       newData.push (newLink);
      }    
    });
      
    lo.annotations=newData;  

    this.setState ({target : lo}, function (){
      console.log ("Lo now: " +  JSON.stringify (this.state.target));
      this.state.closeModal ();  
    });          
  }
    
  /**
   * 
   */    
  cancelModal() {
    console.log ("cancelModal ()");  
      
    this.setState({modalIsOpen: false});      
  }

  /**
   * 
   */    
  handleItemChange (e) {
    var selectedValues = [];
    var newData = [];

    this.state.sourceData.forEach(function(item) {
  
       if(item.id === e.target.id) {
         item.checked = e.target.checked;
       }

       if(item.checked) {
         selectedValues.push(item.value);
       }

       newData.push(item);
     });

     this.setState({sourceData: newData});      
  }

  /**
   * uncheck all items in the list
   */    
  reset () {
    var newData = [];
    this.state.sourceData.forEach(function(item) {
      item.checked = false;
      newData.push(item);
    });

    this.setState({sourceData: newData});
  }
    
  /**
   * 
   */    
  checkAll () {
     var newData = [];
     this.state.sourceData.forEach(function(item) {
       item.checked = true;
       newData.push(item);
     });

    this.setState({sourceData: newData});
  }
    
  /**
   * 
   */    
  checkInvert () {
     var newData = [];
     this.state.sourceData.forEach(function(item) {
       if (item.checked==true) {
         item.checked = false;
       } else {
         item.checked = true;
       }        
       newData.push(item);
     });

    this.setState({sourceData: newData});
  }      
    
  /**
   * 
   */    
  render () {      
    var options = this.state.sourceData.map(function(item, index) {
                
    return (
      <div key={'chk-' + index} className="checkbox">
        <label>
          <input type="checkbox"
            value={item.title}
            onChange={this.handleItemChange}
            checked={item.checked ? true : false} /> {item.title}
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
                 <a className="nav-link" href="#" onClick={e => this.cancelModal ()}>Cancel</a>
               </nav>
               <div style={tempnavstyle.objectContainer}>
                {options}
               </div>             
             </Modal>);
  }
}

export default LearningObjectiveLinker;
