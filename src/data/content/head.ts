import * as Immutable from 'immutable';
import { Title } from './title';
import { augment } from './common';
import createGuid from '../../utils/guid';
import { getChildren } from './common';
import { getKey } from '../common';

export type HeadParams = {
  title?: Title,
  guid?: string
};

const defaultContent = {
  contentType: 'Head', 
  guid: '', 
  title: new Title()
}

export class Head extends Immutable.Record(defaultContent) {
  
  contentType: 'Title';
  title: Title;
  guid: string;
  
  constructor(params?: HeadParams) {
    super(augment(params));
  }

  with(values: HeadParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : Head {
    let model = new Head().with({ guid });
    const head = (root as any).head;

    getChildren(head).forEach(item => {
      
      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'title':
          model = model.with({ title: Title.fromPersistence(item, id)});
          break;
        default:
      }
    });

    return model;
  }

  toPersistence() : Object {
    return {
      "head": {
        "#array": [
          this.title.toPersistence()
        ]
      }
    }
  }
}
