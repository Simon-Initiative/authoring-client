import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent, getChildren } from 'data/content/common';
import { Dependency } from 'data/content/workbook/dependency';
import { getKey } from 'data/common';
import createGuid from 'utils/guid';


export type DependenciesParams = {
  id?: string,
  guid?: string,
  dependencies?: Immutable.OrderedMap<string, Dependency>,
};

const defaultContent = {
  contentType: 'Dependencies',
  elementType: 'dependencies',
  id: '',
  guid: '',
  dependencies: Immutable.OrderedMap<string, Dependency>(),
};

export class Dependencies extends Immutable.Record(defaultContent) {
  contentType: 'Dependencies';
  elementType: 'dependencies';
  id: string;
  guid: string;
  dependencies?: Immutable.OrderedMap<string, Dependency>;

  constructor(params?: DependenciesParams) {
    super(augment(params));
  }

  with(values: DependenciesParams) {
    return this.merge(values) as this;
  }

  clone(): Dependencies {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Dependencies {
    const t = (root as any).dependencies;

    let model = new Dependencies({ id: guid, guid });

    if (t['@id'] !== undefined) {
      model = model.with({ id: t['@id'] });
    }

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'dependency':
          model = model.with(
            {
              dependencies:
                model.dependencies.set(id, Dependency.fromPersistence(item, id, notify)),
            });
          break;
        default:

      }
    });

    return model;
  }

  toPersistence(): Object {
    const dependencies = {
      dependencies: {
        '@id': this.id,
        '#array': this.dependencies.toArray().map(s => s.toPersistence()),
      },
    };
    return dependencies;
  }
}
