import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import { ParamText } from './paramtext';
import { PrefValue } from './prefvalue';
import { PrefLabel } from './preflabel';


type ParamContent = ParamText | PrefValue | PrefLabel;


export type ParamParams = {
  name?: string,
  content?: Immutable.OrderedMap<string, ParamContent>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Param',
  elementType: 'param',
  name: '',
  content: Immutable.OrderedMap<string, ParamContent>(),
  guid: '',
};

export class Param extends Immutable.Record(defaultContent) {

  contentType: 'Param';
  elementType: 'param';
  name: string;
  content: Immutable.OrderedMap<string, ParamContent>;
  guid: string;

  constructor(params?: ParamParams) {
    super(augment(params));
  }

  with(values: ParamParams) {
    return this.merge(values) as this;
  }

  clone() : Param {
    return this.with({
      content: this.content.map(c => c.clone()).toOrderedMap(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Param {

    const param = (root as any).param;

    let model = new Param({ guid });

    if (param['@name'] !== undefined) {
      model = model.with({ name: param['@name'] });
    }

    getChildren(param).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case '#text':
          model = model.with({
            content: model.content.set(id, ParamText.fromPersistence(item, id)),
          });
          break;
        case 'pref:label':
          model = model.with({
            content: model.content.set(id, PrefLabel.fromPersistence(item, id)),
          });
          break;
        case 'pref:value':
          model = model.with({
            content: model.content.set(id, PrefValue.fromPersistence(item, id)),
          });
          break;
        default:

      }
    });

    return model;
  }

  toPersistence() : Object {

    const children = this.content
        .toArray()
        .map(item => item.toPersistence());

    return {
      param: {
        '@name': this.name,
        '#array': children,
      },
    };
  }
}
