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

class Item extends Linkable {
    checked: boolean = false;
}

interface LearningObjectiveLinker {

}

export interface LearningObjectiveLinkerProps {        
  sourceData : any;
  modalIsOpen : boolean;    
  targetAnnotations: Array<Linkable>;
  closeModal: any;
  title?:string;
  errorMessage?:string;  
}

export interface LearningObjectiveLinkerState {
  sourceData?: any;
  localAnnotations?: Array<Item>;     
  modalIsOpen : boolean;
  targetAnnotations?: Array<Linkable>;
  closeModal: any;
  errorMessage?:string;
}

/**
*
*/
class LearningObjectiveLinker extends React.Component<LearningObjectiveLinkerProps, LearningObjectiveLinkerState> 
{    
  public static defaultProps: Partial<LearningObjectiveLinkerProps> = {
    title: "Available Sources"
  };
        
  /**
   * 
   */    
  constructor(props) {
    console.log ("LearningObjectiveLinker ()");
        
    super(props);
     
    this.state = {                                    
                   modalIsOpen: this.props.modalIsOpen,
                   sourceData: this.props.sourceData,
                   targetAnnotations: this.props.targetAnnotations,                                           
                   closeModal: this.props.closeModal,
                   localAnnotations: new Array<Item> (),
                   errorMessage: this.props.errorMessage
                 };
            
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);  
  }
    
  /**
   * 
   */    
  componentWillReceiveProps (newProps:LearningObjectiveLinkerProps) {      
      console.log ("componentWillReceiveProps ("+newProps ["modalIsOpen"]+")");
            
      this.setState({sourceData: newProps.sourceData, modalIsOpen: newProps ["modalIsOpen"], targetAnnotations: newProps.targetAnnotations}, function () {
        //this.resolveAnnotations ();
      });
  }
   
  /**
   * Take the annotations from the target object and check or uncheck the corresponding
   * items in the source list so that we can then make changes to the source list and
   * make sure everything is in sync. We assume that the annotations and source list
   * a not aligned! This might be a false assumption but for now it's safer.
   */   
  resolveAnnotations () {
    console.log ("resolveAnnotations ()");
    
    if (this.state.targetAnnotations==null) {
      console.log ("No link target given yet, bump");  
      return;
    }
      
    console.log ("Linking targetAnnotations: " + JSON.stringify (this.state.targetAnnotations));
    console.log ("Linking sourceData: " + JSON.stringify (this.state.sourceData));  
            
    // This will become local annotations
    var newData: Array <Item>=new Array ();
            
    // First reset everything so that we don't have to keep
    // checking and comparing, we can just set it checked if
    // we encounter the item
    this.state.sourceData.forEach(function(resetItem) {
       let newItem:Item=new Item ();
       newItem.id=resetItem.id;
       newItem.checked=false;
       newItem.typeDescription=resetItem.typeDescription; 
       newItem.title=resetItem.title;
        
       newData.push(newItem);        
    });
      
    for (var i=0;i<this.state.targetAnnotations.length;i++) {    
       let item=this.state.targetAnnotations [i];  
       //console.log ("Checking item: " + item);
        
       for (var j=0;j<newData.length;j++) {
         let sourceItem=newData [j];  
         if (sourceItem.id==item.id) {
            sourceItem.checked=true;
         }
       }
    }
  
    this.setState({localAnnotations: newData});
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
    //console.log ("afterOpenModal ()");
    
    this.resolveAnnotations ();
  }

  /**
   * 
   */    
  closeModal() {
    //console.log ("closeModal ()");
                  
    this.setState({modalIsOpen: false});

    var newData:Array<Linkable>=new Array <Linkable>();
    this.state.localAnnotations.forEach(function(item) {
      if (item.checked ==true) {
       let newLink:Linkable=new Linkable ();
       newLink.id=item.id;
       newLink.title=item.title;
       newLink.typeDescription=item.typeDescription;
       newData.push (newLink);
      }    
    });
      
    //console.log ("Assigning new list data:" + JSON.stringify (newData));  
      
    this.setState ({targetAnnotations : newData}, function (){
      //console.log ("Linkable list now: " +  JSON.stringify (this.state.targetAnnotations));
      this.state.closeModal (this.state.targetAnnotations);  
    });          
  }
    
  /**
   * 
   */    
  cancelModal() {
    //console.log ("cancelModal ()");        
    this.setState({modalIsOpen: false});      
  }

  /**
   * 
   */       
  handleItemChange (e) {
    //console.log ("handleItemChange ()");

    var newData = [];

    this.state.localAnnotations.forEach(function(item) {    
      if(item.id === e.target.id) {  
        item.checked = e.target.checked;
      }

      newData.push(item);
    });

    this.setState({localAnnotations: newData}, function () {
      //console.log ("Internal check:" + JSON.stringify (this.state.sourceData));
    });      
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

    this.setState({localAnnotations: newData});
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

    this.setState({localAnnotations: newData});
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

    this.setState({localAnnotations: newData});
  }      
    
  /**
   * 
   */    
  render () {      
    //console.log ("Source data: " + JSON.stringify (this.state.sourceData)); 
   
    if (this.state.errorMessage) {  
      if (this.state.errorMessage!="") {
        let mPanel:any=tempnavstyle.objectContainer;
        mPanel ["height"]="100%";
        //mPanel ["border"]="1px solid red";     
        return (<Modal
                 isOpen={this.state.modalIsOpen}
                 onAfterOpen={this.afterOpenModal}
                 onRequestClose={this.closeModal}
                 contentLabel="Linker Dialog"
                 style={customStyles}>
                   <nav className="navbar navbar-toggleable-md navbar-light bg-faded">
                     <p className="h2" style={tempnavstyle.h2}>Error</p>
                     <a className="nav-link" href="#" onClick={e => this.cancelModal ()}>Cancel</a>
                   </nav>
                   <div style={tempnavstyle.objectContainer}>
                     <span style={customStyles.messageSpan}>{this.state.errorMessage}</span>                   
                   </div>
               </Modal>);
      }
    }           
      
    var options = this.state.localAnnotations.map(function(item, index) {
                
    return (
      <div key={'chk-' + index} className="checkbox">
        <label>
          <input type="checkbox"
            id={item.id}
            value={item.title}
            onChange={this.handleItemChange.bind(this)}
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
                   <p className="h2" style={tempnavstyle.h2}>{this.props.title}</p>
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
