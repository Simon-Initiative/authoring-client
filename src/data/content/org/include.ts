import * as Immutable from 'immutable';
import { defaultIdGuid, getChildren } from 'data/content/common';
import { getKey } from 'data/common';
import { Maybe } from 'tsmonad';
import * as types from 'data/content/org/types';

export type IncludeParams = {
  id?: string,
  organization?: string,
  title?: string,
  version?: string,
  idref?: string,
  grainSize?: types.GrainSizes,
  guid?: string,
};

const defaultContent = {
  contentType: types.ContentTypes.Include,
  elementType: 'include',
  id: '',
  title: Maybe.nothing<string>(),
  idref: '',
  organization: '',
  version: '',
  grainSize: Maybe.nothing<types.GrainSizes>(),
  guid: '',
};

export class Include extends Immutable.Record(defaultContent) {

  contentType: types.ContentTypes.Include;
  elementType: 'include';
  id: string;
  organization: string;
  title: Maybe<string>;
  version: string;
  idref: string;
  grainSize: Maybe<types.GrainSizes>;
  guid: string;

  constructor(params?: IncludeParams) {
    super(defaultIdGuid(params));
  }

  with(values: IncludeParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const s = (root as any).include;
    let model = new Include({ guid });

    if (s['@id'] !== undefined) {
      model = model.with({ id: s['@id'] });
    }
    if (s['@idref'] !== undefined) {
      model = model.with({ idref: s['@idref'] });
    }
    if (s['@organization'] !== undefined) {
      model = model.with({ organization: s['@organization'] });
    }
    if (s['@version'] !== undefined) {
      model = model.with({ version: s['@version'] });
    }
    if (s['@grain_size'] !== undefined) {
      model = model.with({ grainSize: s['@grain_size'] });
    }


    getChildren(s).forEach((item) => {

      const key = getKey(item);

      switch (key) {
        case 'title':
          model = model.with({ title: item['title']['#text'] });
          break;
        default:

      }
    });

    return model;
  }

  toPersistence(): Object {

    const s = {
      include: {
        '@id': this.id,
        '@idref': this.idref,
        '@organization': this.organization,
        '@version': this.version,
      },
    };

    this.grainSize.lift(g => s.include['@grain_size'] = g);
    this.title.lift(text => s.include['#array'] = [{ title: { '#text': text } }]);

    return s;
  }
}
