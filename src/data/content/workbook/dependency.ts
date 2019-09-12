import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from 'data/content/common';

export type DependencyParams = {
  guid?: string,
  id?: string,
  idref?: string,
  type?: string,
};

const defaultContent = {
  contentType: 'Dependency',
  elementType: 'dependency',
  guid: '',
  id: '',
  idref: '',
  type: 'prerequisite',
};

export class Dependency extends Immutable.Record(defaultContent) {
  contentType: 'Dependency';
  elementType: 'dependency';
  guid: string;
  id: string;
  idref: string;
  type: 'prerequisite';

  constructor(params?: DependencyParams) {
    super(augment(params));
  }

  with(values: DependencyParams) {
    return this.merge(values) as this;
  }

  clone(): Dependency {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Dependency {
    const t = (root as any).dependency;

    let model = new Dependency({ id: guid, guid });

    if (t['@id'] !== undefined) {
      model = model.with({ id: t['@id'] });
    }

    if (t['@idref'] !== undefined) {
      model = model.with({ idref: t['@idref'] });
    }

    if (t['@type'] !== undefined) {
      model = model.with({ type: t['@type'] });
    }

    return model;
  }

  toPersistence(): Object {
    const dependency = {
      dependency: {
        '@id': this.id,
        '@idref': this.idref,
        '@type': this.type,
      },
    };
    return dependency;
  }
}
