import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import { KnowledgeCategory, LearningProcess } from './types';


export type LearningObjectiveParams = {
  id?: string,
  guid?: string,
  title?: string,
  category?: Maybe<KnowledgeCategory>,
  process?: Maybe<LearningProcess>,
  skills?: Immutable.List<string>,
};

const defaultContent = {
  contentType: 'LearningObjective',
  id: '',
  guid: '',
  title: '',
  category: Maybe.nothing<KnowledgeCategory>(),
  process: Maybe.nothing<LearningProcess>(),
  skills: Immutable.List<string>(),
};

export class LearningObjective extends Immutable.Record(defaultContent) {

  contentType: 'LearningObjective';
  id: string;
  guid: string;
  title: string;
  category: Maybe<KnowledgeCategory>;
  process: Maybe<LearningProcess>;
  skills: Immutable.List<string>;

  constructor(params?: LearningObjectiveParams) {
    super(augment(params));
  }

  with(values: LearningObjectiveParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const o = (root as any).objective;
    let model = new LearningObjective({ guid });

    if (o['@id'] !== undefined) {
      model = model.with({ id: o['@id'] });
    }
    if (o['@process'] !== undefined) {
      model = model.with({ process: Maybe.just<LearningProcess>(o['@process']) });
    }
    if (o['@category'] !== undefined) {
      model = model.with({ category: Maybe.just<KnowledgeCategory>(o['@category']) });
    }

    getChildren(o).forEach((item) => {

      const key = getKey(item);

      switch (key) {
        case '#text':
          model = model.with({ title: item['#text'] });
          break;
        default:

      }
    });

    return model;
  }

  toPersistence() : Object {
    const o = {
      objective: {
        '@id': this.id,
        '#array': [{ '#text': this.title }],
      },
    };

    this.process.lift(p => o.objective['@process'] = p);
    this.category.lift(p => o.objective['@category'] = p);

    return o;
  }
}
