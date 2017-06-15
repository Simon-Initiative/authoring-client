import guid from '../utils/guid';

/** 
 * Base class for any resources that can function as an annotation. It it also
 * the class that can store annotations. That means you can build annotation
 * trees if we have to. 
 */
export default class Linkable {      
  id:string="";
  title:string="";
  typeDescription:string="x-oli-workbook_page"; // This variable is only used for internal bookkeeping.
  expanded:boolean=true;
  annotations:Array <Linkable>=null;  
    
  constructor (anId?:string) 
  {
    if (anId) {   
     if (anId=="undefined") {
       this.id=guid();
     } else {         
       this.id=anId;
     }    
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
        /*        
        if (toAnnotations [i].id) {  
          ephemeral.push (toAnnotations [i].id);
        } else {
          ephemeral.push (toAnnotations [i]);          
        } 
        */     

        ephemeral.push (toAnnotations [i].id);          
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
