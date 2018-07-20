import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren, ensureIdGuidPresent } from '../common';
import { getKey } from '../../common';
import { ParamText } from './paramtext';
import { PrefValue } from './prefvalue';
import { PrefLabel } from './preflabel';
import { WbPath } from './wb_path';

export type ParamContent = ParamText | PrefValue | PrefLabel | WbPath;


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
    return ensureIdGuidPresent(this.with({
      content: this.content.map(c => c.clone()).toOrderedMap(),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void) : Param {

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
            content: model.content.set(id, ParamText.fromPersistence(item, id, notify)),
          });
          break;
        case 'pref:label':
          model = model.with({
            content: model.content.set(id, PrefLabel.fromPersistence(item, id, notify)),
          });
          break;
        case 'pref:value':
          model = model.with({
            content: model.content.set(id, PrefValue.fromPersistence(item, id, notify)),
          });
          break;
        case 'wb:path':
          model = model.with({
            content: model.content.set(id, WbPath.fromPersistence(item, id, notify)),
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
