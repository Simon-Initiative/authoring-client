import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';

export type SymParams = {
  name?: string;
  guid?: string,
};

const defaultContent = {
  contentType: 'Sym',
  elementType: 'sym',
  name: 'amp',
  guid: '',
};


export class Sym extends Immutable.Record(defaultContent) {

  contentType: 'Sym';
  elementType: 'sym';
  name: string;
  guid: string;

  constructor(params?: SymParams) {
    super(augment(params));
  }

  with(values: SymParams) {
    return this.merge(values) as this;
  }

  clone(): Sym {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void) : Sym {

    const m = (root as any).sym;
    let model = new Sym().with({ guid });

    if (m['@name'] !== undefined) {
      model = model.with({ name: m['@name'] });
    }

    return model;
  }

  toPersistence() : Object {

    return {
      sym: {
        '@name': this.name,
      },
    };
  }

}
