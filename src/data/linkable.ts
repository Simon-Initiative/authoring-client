import guid from '../utils/guid';

export class TResource {
  id:string=guid();
  title:string="unassigned";    
}

/** 
 * Base class for any resources that can function as an annotation. It it also
 * the class that can store annotations. That means you can build annotation
 * trees if we have to. 
 */
export default class Linkable {      
  //resource:TResource=new TResource ();
  id:string=guid();
  title:string="unassigned";       
  expanded:boolean=false;
  annotations:Array <Linkable>=new Array ();  
    
  constructor () 
  {

  }
    
  reset () {
    this.annotations=new Array ();
  }
    
  /**
   *
   */  
  static toJSON (toAnnotations:any): Object {
      
    console.log ("Linkable.toJSON ()");
    console.log ("annotations: " + JSON.stringify (toAnnotations));  
      
    let ephemeral=new Array <String> ();    
      
    for (var i=0;i<toAnnotations.length;i++) {
      
      if (toAnnotations [i].id) {  
        ephemeral.push (toAnnotations [i].id);
      } else {
        ephemeral.push (toAnnotations [i]);          
      }    
    }
      
    return (ephemeral);  
  }
    
  /**
   *
   */   
  static fromJSON (json:Array<string>): Array <Linkable> {
    let ephemeral:Array <Linkable>=new Array ();
      
    for (let j=0;j<json.length;j++) {
      let newLinkable=new Linkable ();
      newLinkable.id=json [j];
      ephemeral.push (newLinkable);
    }  
      
    return (ephemeral);  
  }
}
