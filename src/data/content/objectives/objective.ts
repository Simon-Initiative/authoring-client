import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { augment, getChildren } from 'data/content/common';
import { getKey } from 'data/common';
import { KnowledgeCategory, LearningProcess } from 'data/content/objectives/types';

export function extractFullText(obj: Object[]): string {
  const str = '';
  return extractFullTextHelper(obj, str);
}

function extractFullTextHelper(obj: Object[], str: string): string {

  // Find all #text nodes in the tree, in order, and return them concatenated together
  const reducer = (accum: Object, o: Object) => {
    if (o['#text'] !== undefined) {
      const text: string = o['#text'];
      return accum + ' ' + text;
    }
    const key = getKey(o);
    if (o[key] && o[key]['#text'] !== undefined) {
      const text: string = o[key]['#text'];
      return accum + ' ' + text;
    }
    if (o[key] && o[key]['#array'] !== undefined) {
      return extractFullTextHelper(o[key]['#array'] as Object[], accum as string);
    }
    return accum;
  };

  const result = obj.reduce(reducer, str) as string;
  return result;
}

export type LearningObjectiveParams = {
  id?: string,
  guid?: string,
  title?: string,
  rawContent?: Maybe<Object[]>,
  category?: Maybe<KnowledgeCategory>,
  process?: Maybe<LearningProcess>,
  skills?: Immutable.List<string>,
};

const defaultContent = {
  contentType: 'LearningObjective',
  elementType: 'objective',
  id: '',
  guid: '',
  title: '',
  rawContent: Maybe.nothing<Object[]>(),
  category: Maybe.nothing<KnowledgeCategory>(),
  process: Maybe.nothing<LearningProcess>(),
  skills: Immutable.List<string>(),
};

export class LearningObjective extends Immutable.Record(defaultContent) {

  contentType: 'LearningObjective';
  elementType: 'objective';
  id: string;
  guid: string;
  title: string;
  rawContent: Maybe<Object[]>;
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

    const children = getChildren(o);

    // Set the title when we have only a '#text' child
    if (children.length === 1 && getKey(children[0]) === '#text') {
      model = model.with({ title: children[0]['#text'] });
    } else {

      // Otherwise, we have content that we are not supporting the direct edit
      // of (e.g. lists, images, formatting)

      // Strip out the id attr if it has been absorbed from the objective
      children.forEach((c) => { if (c['@id'] === model.id) { delete c['@id']; } });

      if (o['#array'] === undefined && o['#text'] === undefined) {
        // handle the case when objective is empty, treat it as empty #text string
        model = model.with({ title: '' });
      } else {
        // objective has content other than simple text, set as rawContent
        model = model.with({ rawContent: Maybe.just(children) });
      }
    }

    return model;
  }

  toPersistence(): Object {

    const o = {
      objective: {
        '@id': this.id,
        '#array': this.rawContent.caseOf({
          just: raw => raw,
          nothing: () => [{ '#text': this.title }],
        }),
      },
    };

    this.process.lift(p => o.objective['@process'] = p);
    this.category.lift(p => o.objective['@category'] = p);

    return o;
  }
}
