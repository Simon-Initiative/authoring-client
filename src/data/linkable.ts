import guid from '../utils/guid';

/** 
 * Base class for any resources that can function as an annotation 
 */
export default class Linkable {

  id:string=guid();
    
  constructor () 
  {

  }
}
