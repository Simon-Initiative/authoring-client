import * as Immutable from 'immutable';
import { Title } from './title';
import { augment } from './common';
import createGuid from '../../utils/guid';
import { getChildren } from './common';
import { getKey } from '../common';
import Linkable from '../linkable';

export type HeadParams = {
  title?: Title,
  guid?: string,
  ref?: string,
  annotations?: Array<Linkable>;
};

const defaultContent = {
  contentType: 'Head', 
  guid: '', 
  title: new Title(),
  annotations: new Array ()
}

export class Head extends Immutable.Record(defaultContent) {
  
  contentType: 'Title';
  title: Title;
  guid: string;
  annotations: Array<Linkable>;
  
  constructor(params?: HeadParams) {
    super(augment(params));
  }

  with(values: HeadParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : Head {
    let model = new Head().with({ guid });
    const tAnnotations = [];
    const head = (root as any).head;

    getChildren(head).forEach((item) => {
      
      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'objref':
          tAnnotations.push(new Linkable ((item as any).objref['@idref']));        
          break;  
        case 'title':
          model = model.with({ title: Title.fromPersistence(item, id)});
          break;            
        default:
      }
    });

    model = model.with ({annotations: tAnnotations});  
      
    return model;
  }
  
  toPersistence() : Object {
    console.log ("Head: toPersistence ()");
      
    let tempArray:Array<Object>=new Array <Object>();        
        
    tempArray.push (this.title.toPersistence());  

    this.annotations.map ((annotation) => {          
      tempArray.push ({"objref": { "@idref": annotation.id}});        
    });            
        
    return {
      "head": {
        "#array": tempArray
      }
    }
  }
}
