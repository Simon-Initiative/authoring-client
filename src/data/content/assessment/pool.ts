import * as Immutable from 'immutable';

import { Unsupported } from '../unsupported';
import createGuid from '../../../utils/guid';
import { getKey } from '../../common';
import { augment, getChildren, setId } from '../common';
import { ContentElements, TEXT_ELEMENTS } from 'data/content/common/elements';
import { ObjRef } from '../learning/objref';
import { Title } from '../learning/title';

import { Content } from './content';
import { Question } from './question';
import { ResourceId, ResourceGuid } from 'data/types';

export type PoolParams = {
  id?: ResourceId;
  objrefs?: Immutable.OrderedMap<string, ObjRef>,
  title?: Title,
  content?: Content,
  sections?: Immutable.OrderedMap<string, Unsupported>,
  questions?: Immutable.OrderedMap<string, Question>,
  guid?: ResourceGuid;
};

const defaultPoolParams = {
  contentType: 'Pool',
  elementType: 'pool',
  id: ResourceId.of(''),
  objrefs: Immutable.OrderedMap<string, ObjRef>(),
  title: new Title({ text: ContentElements.fromText('Pool Title', '', TEXT_ELEMENTS) }),
  content: new Content(),
  sections: Immutable.OrderedMap<string, Unsupported>(),
  questions: Immutable.OrderedMap<string, Question>(),
  guid: ResourceGuid.of(''),
};

export class Pool extends Immutable.Record(defaultPoolParams) {

  contentType: 'Pool';
  elementType: 'pool';
  id: ResourceId;
  objrefs: Immutable.OrderedMap<string, ObjRef>;
  title: Title;
  content: Content;
  sections: Immutable.OrderedMap<string, Unsupported>;
  questions: Immutable.OrderedMap<string, Question>;
  guid: ResourceGuid;

  constructor(params?: PoolParams) {
    super(augment(params));
  }

  with(values: PoolParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: any, guid: string, notify?: () => void) {

    let model = new Pool({ guid: ResourceGuid.of(guid) });

    const s = json.pool;

    model = setId(model, s, notify);

    getChildren(s).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'title':
          model = model.with({ title: Title.fromPersistence(item, id, notify) });
          break;
        case 'objref':
          model = model.with({
            objrefs: model.objrefs.set(id, ObjRef.fromPersistence(item, id, notify)),
          });
          break;
        case 'content':
          model = model.with({ content: Content.fromPersistence(item, id, notify) });
          break;
        case 'question':
          model = model.with({
            questions: model.questions.set(id, Question.fromPersistence(item, id, notify)),
          });
          break;
        case 'section':

          // Parse thru sections to get to the child questions. After saving
          // back to the server, this effectively strips out sections but maintains
          // the questions that the sections contained
          const sectionChildren = getChildren(item['section']);

          sectionChildren.forEach((child) => {
            const childKey = getKey(child);

            if (childKey === 'question') {
              const id = createGuid();
              model = model.with({
                questions: model.questions.set(id, Question.fromPersistence(child, id, notify)),
              });
            }
          });

          break;
        default:

      }
    });

    return model;
  }

  toPersistence(): Object {

    const questions = this.questions.size > 0
      ? this.questions
        .toArray()
        .map(item => item.toPersistence())
      : [new Question().with({ id: createGuid() }).toPersistence()];

    const children = [

      this.title.toPersistence(),

      ...this.objrefs
        .toArray()
        .map(item => item.toPersistence()),

      this.content.toPersistence(),

      ...this.sections
        .toArray()
        .map(item => item.toPersistence()),

      ...questions,
    ];

    return {
      pool: {
        '@id': this.id.value(),
        '#array': children,
      },
    };
  }
}
