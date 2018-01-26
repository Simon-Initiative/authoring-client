import * as Immutable from 'immutable';
import { augment } from '../common';

export type PopoutParams = {
  enable?: boolean,
  content?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'Popout',
  enable: true,
  content: '',
  guid: '',
};

export class Popout extends Immutable.Record(defaultContent) {
  
  contentType: 'Popout';
  enable: boolean;
  content: string;
  guid: string;
  
  constructor(params?: PopoutParams) {
    super(augment(params));
  }

  with(values: PopoutParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : Popout {

    const cb = (root as any).popout;

    let model = new Popout({ guid });
    
    if (cb['@enable'] !== undefined) {
      model = model.with({ enable: cb['@enable'] === 'true' });
    }
    if (cb['#text'] !== undefined) {
      model = model.with({ content: cb['#text'] });
    }
    
    return model;
  }

  toPersistence() : Object {
    return {
      popout: {
        '@enable': this.enable ? 'true' : 'false',
        '#text': this.content,
      },
    };
  }
}
