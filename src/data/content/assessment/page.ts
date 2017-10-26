import * as Immutable from 'immutable';


import { Unsupported } from '../unsupported';
import createGuid from '../../../utils/guid';
import { getKey } from '../../common';
import { getChildren, augment } from '../common';

import { Title } from '../title';
import { Question } from './question';
import { Selection } from './selection';
import { Content } from './content';
import { Html } from '../html';
import { Node } from './node';

export type PageParams = {
  id?: string;
  title?: Title,
  nodes?: Immutable.OrderedMap<string, Node>,
  guid?: string;
};

const defaultPageParams = {
  contentType: 'Page',
  id: '',
  title: new Title({ text: 'Assessment Page Title' }),
  nodes: Immutable.OrderedMap<string, Node>(),
  guid: '',
};

export class Page extends Immutable.Record(defaultPageParams) {

  contentType: 'Page';
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

  static fromPersistence(json: any, guid: string) {

    let model = new Page({ guid });

    const s = json.page;

    if (s['@id'] !== undefined) {
      model = model.with({ id: s['@id'] });
    }
    
    getChildren(s).forEach((item) => {
    
      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'title':
          model = model.with(
            { title: Title.fromPersistence(item, id) });
          break;
        case 'question':
          model = model.with(
            { nodes: model.nodes.set(id, Question.fromPersistence(item, id)) });
          break;
        case 'content':
          model = model.with({ nodes: model.nodes.set(id, Content.fromPersistence(item, id)) });
          break;
        case 'selection':
          model = model.with({ nodes: model.nodes.set(id, Selection.fromPersistence(item, id)) });
          break;
        default:
          model = model.with({ nodes: model.nodes.set(id, Unsupported.fromPersistence(item, id)) });
      }
    });

    return model;
  }

  toPersistence() : Object {

    // If no nodes exist, serialize with an empty content
    // just so as to satisfy DTD constraints
    const nodes = this.nodes.size === 0
      ? [new Content().with({ body: Html.fromText('Placeholder') }).toPersistence()]
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
