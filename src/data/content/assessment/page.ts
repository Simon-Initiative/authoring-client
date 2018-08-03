import * as Immutable from 'immutable';

import { Unsupported } from '../unsupported';
import createGuid from '../../../utils/guid';
import { getKey } from '../../common';
import { augment, getChildren, setId } from '../common';
import { ContentElements, TEXT_ELEMENTS } from 'data/content/common//elements';
import { Title } from '../learning/title';
import { Question } from './question';
import { Selection } from './selection';
import { Content } from './content';
import { Node } from './node';

export type PageParams = {
  id?: string;
  title?: Title,
  nodes?: Immutable.OrderedMap<string, Node>,
  guid?: string;
};

const defaultPageParams = {
  contentType: 'Page',
  elementType: 'page',
  id: '',
  title: new Title({ text: ContentElements.fromText('Assessment Page Title', '', TEXT_ELEMENTS) }),
  nodes: Immutable.OrderedMap<string, Node>(),
  guid: '',
};

export class Page extends Immutable.Record(defaultPageParams) {

  contentType: 'Page';
  elementType: 'page';
  id: string;
  title: Title;
  nodes: Immutable.OrderedMap<string, Node>;
  guid: string;

  constructor(params?: PageParams) {
    super(augment(params));
  }

  with(values: PageParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: any, guid: string, notify: () => void) {

    let model = new Page({ guid });

    const s = json.page;

    model = setId(model, s, notify);

    getChildren(s).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'title':
          model = model.with(
            { title: Title.fromPersistence(item, id, notify) });
          break;
        case 'question':
          model = model.with(
            { nodes: model.nodes.set(id, Question.fromPersistence(item, id, notify)) });
          break;
        case 'content':
          model = model.with({
            nodes: model.nodes.set(id, Content.fromPersistence(item, id, notify)),
          });
          break;
        case 'selection':
          model = model.with({
            nodes: model.nodes.set(id, Selection.fromPersistence(item, id, notify)),
          });
          break;
        default:
          model = model.with({
            nodes: model.nodes.set(id, Unsupported.fromPersistence(item, id, notify)),
          });
      }
    });

    return model;
  }

  toPersistence(): Object {

    // If no nodes exist, serialize with an empty content
    // just so as to satisfy DTD constraints
    const nodes = this.nodes.size === 0
      ? [new Content().with({ body: ContentElements.fromText('', '', []) }).toPersistence()]
      : this.nodes
        .toArray()
        .map(item => item.toPersistence());

    const children = [
      this.title.toPersistence(),
      ...nodes,
    ];

    return {
      page: {
        '@id': this.id,
        '#array': children,
      },
    };
  }
}
