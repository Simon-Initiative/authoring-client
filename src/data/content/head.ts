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
    let tAnnotations = new Array ();
    const head = (root as any).head;

    getChildren(head).forEach(item => {
      
      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'objref':
          tAnnotations.push (new Linkable (head ["objref"]["@idref"]));        
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
    let tempArray:Array<Object>=new Array <Object>();        
        
    tempArray.push (this.title.toPersistence());    
        
    for (let i=0;i<this.annotations.length;i++) {
      tempArray.push ({"objref": { "@idref": this.annotations [i].id}});
    }    
        
    return {
      "head": {
        "#array": tempArray
      }
    }
  }
}
