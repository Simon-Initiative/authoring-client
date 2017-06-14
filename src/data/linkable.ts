import guid from '../utils/guid';

export class TResource {
  id:string=guid();
  title:string="";    
}

/** 
 * Base class for any resources that can function as an annotation. It it also
 * the class that can store annotations. That means you can build annotation
 * trees if we have to. 
 */
export default class Linkable {      
  //resource:TResource=new TResource ();
  id:string="";
  title:string="";
  typeDescription:string="x-oli-workbook_page"; // This variable is only used for internal bookkeeping.
  expanded:boolean=false;
  annotations:Array <Linkable>=null;  
    
  constructor (anId?:string) 
  {
    if (anId) {  
     this.id=anId;
    }
    else {
     this.id=guid();
    }  
      
    this.annotations=new Array ();  
  }
    
  reset () {
    this.annotations=new Array ();
  }
    
  /**
   *
   */  
  static toJSON (toAnnotations:any): Object {
      
    //console.log ("Linkable.toJSON ()");
    //console.log ("annotations: " + JSON.stringify (toAnnotations));  
      
    let ephemeral=new Array <String> ();    
      
    if (toAnnotations) {  
      for (var i=0;i<toAnnotations.length;i++) {      
        if (toAnnotations [i].id) {  
          ephemeral.push (toAnnotations [i].id);
        } else {
          ephemeral.push (toAnnotations [i]);          
        }    
      }
    }    
      
    return (ephemeral);  
  }
    
  /**
   *
   */   
  static fromJSON (json:Array<string>): Array <Linkable> {      
    //console.log ("Linkable:fromJSON ()");
    //console.log (JSON.stringify (json));  
        
    let ephemeral:Array <Linkable>=new Array ();
      
    if (json) {  
      for (let j=0;j<json.length;j++) {
        let newLinkable=new Linkable ();
        newLinkable.id=json [j];
        ephemeral.push (newLinkable);
      }
    }      
      
    return (ephemeral);  
  }
}
