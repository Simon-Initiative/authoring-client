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
}
