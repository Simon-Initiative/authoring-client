import * as Immutable from 'immutable';
import { augment } from 'data/content/common';
import { Maybe } from 'tsmonad';
import * as types from 'data/content/org/types';

export type ResourceRefParams = {
  package?: Maybe<string>,
  version?: Maybe<string>,
  idref?: string,
  guid?: string,
};

const defaultContent = {
  contentType: types.ContentTypes.ResourceRef,
  elementType: 'resourceref',
  package: Maybe.nothing<string>(),
  version: Maybe.nothing<string>(),
  idref: '',
  guid: '',
};

export class ResourceRef extends Immutable.Record(defaultContent) {

  contentType: types.ContentTypes.ResourceRef;
  elementType: 'resourceref';
  package: Maybe<string>;
  version: Maybe<string>;
  idref: string;
  guid: string;

  constructor(params?: ResourceRefParams) {
    super(augment(params));
  }

  with(values: ResourceRefParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const r = (root as any).resourceref;
    let model = new ResourceRef({ guid });

    if (r['@package'] !== undefined) {
      model = model.with({ package: Maybe.just(r['@package']) });
    }
    if (r['@version'] !== undefined) {
      model = model.with({ version: Maybe.just(r['@version']) });
    }
    if (r['@idref'] !== undefined) {
      model = model.with({ idref: r['@idref'] });
    }

    return model;
  }

  toPersistence() : Object {

    const r = {
      resourceref: {
        '@idref': this.idref,
      },
    };

    this.version.lift(v => r.resourceref['@version'] = v);
    this.package.lift(v => r.resourceref['@package'] = v);

    return r;
  }
}
