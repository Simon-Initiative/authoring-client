import guid from '../utils/guid';

/** 
 * Base class for any resources that can function as an annotation. It it also
 * the class that can store annotations. That means you can build annotation
 * trees if we have to. 
 */
export default class Linkable {

  id:string=guid();
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
  static toJSON (toAnnotations:Array <Linkable>): Object {
      
    let ephemeral=new Array <String> ();    
      
    for (var i=0;i<toAnnotations.length;i++) {
      
      ephemeral.push (toAnnotations [i].id);
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
