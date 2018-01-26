import * as Immutable from 'immutable';
import { Title } from '../learning/title';
import { augment, getChildren } from '../common';
import createGuid from 'utils/guid';
import { getKey } from '../../common';

export type HeadParams = {
  title?: Title,
  guid?: string,
  ref?: string,
  objrefs?: Immutable.List<string>;
};

const defaultContent = {
  contentType: 'Head',
  guid: '',
  title: new Title(),
  objrefs: Immutable.List<string>(),
};

export class Head extends Immutable.Record(defaultContent) {

  contentType: 'Head';
  title: Title;
  guid: string;
  objrefs: Immutable.List<string>;

  constructor(params?: HeadParams) {
    super(augment(params));
  }

  with(values: HeadParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : Head {
    let model = new Head().with({ guid });
    let objrefs = Immutable.List<string>();
    const head = (root as any).head;

    getChildren(head).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'objref':
          objrefs = objrefs.push(((item as any).objref['@idref']));
          break;
        case 'title':
          model = model.with({ title: Title.fromPersistence(item, id) });
          break;
        default:
      }
    });

    model = model.with ({ objrefs });

    return model;
  }

  toPersistence() : Object {
    return {
      head: {
        '#array': [
          this.title.toPersistence(),
          ...this.objrefs.toArray().map(o => ({ objref: { '@idref': o } })),
        ],
      },
    };
  }
}
