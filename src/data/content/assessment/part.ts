import * as Immutable from 'immutable';
import { ContentElements } from 'data/content/common//elements';
import { ALT_FLOW_ELEMENTS } from './types';
import { Title } from '../learning/title';
import { Response } from './response';
import { ResponseMult } from './response_mult';
import { GradingCriteria } from './criteria';
import { Hint } from './hint';
import { defaultIdGuid, getChildren, setId, ensureIdGuidPresent } from '../common';

import createGuid from '../../../utils/guid';
import { getKey } from '../../common';

export type PartParams = {
  id?: string;
  correct?: string;
  scoreOutOf?: string;
  targets?: string;
  title?: Title;
  concepts?: Immutable.List<string>;
  skills?: Immutable.Set<string>;
  responses?: Immutable.OrderedMap<string, Response>;
  responseMult?: Immutable.OrderedMap<string, ResponseMult>;
  criteria?: Immutable.OrderedMap<string, GradingCriteria>;
  hints?: Immutable.OrderedMap<string, Hint>;
  explanation?: ContentElements;
  guid?: string;
};

const defaultPartParams = {
  contentType: 'Part',
  elementType: 'part',
  id: '',
  correct: '',
  scoreOutOf: '',
  targets: '',
  title: new Title(),
  concepts: Immutable.List<string>(),
  skills: Immutable.Set<string>(),
  criteria: Immutable.OrderedMap<string, GradingCriteria>(),
  responses: Immutable.OrderedMap<string, Response>(),
  responseMult: Immutable.OrderedMap<string, ResponseMult>(),
  hints: Immutable.OrderedMap<string, Hint>(),
  explanation: new ContentElements().with({ supportedElements: Immutable.List(ALT_FLOW_ELEMENTS) }),
  guid: '',
};

export class Part extends Immutable.Record(defaultPartParams) {

  contentType: 'Part';
  elementType: 'part';
  id: string;
  correct: string;
  scoreOutOf: string;
  targets: string;
  title: Title;
  concepts: Immutable.List<string>;
  skills: Immutable.Set<string>;
  criteria: Immutable.OrderedMap<string, GradingCriteria>;
  responses: Immutable.OrderedMap<string, Response>;
  responseMult: Immutable.OrderedMap<string, ResponseMult>;
  hints: Immutable.OrderedMap<string, Hint>;
  explanation: ContentElements;
  guid: string;

  constructor(params?: PartParams) {
    super(defaultIdGuid(params));
  }

  with(values: PartParams) {
    return this.merge(values) as this;
  }


  clone(): Part {
    return ensureIdGuidPresent(this.with({
      criteria: this.criteria.mapEntries(([_, v]) => {
        const clone: GradingCriteria = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, GradingCriteria>,
      responses: this.responses.mapEntries(([_, v]) => {
        const clone: Response = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Response>,
      responseMult: this.responseMult.mapEntries(([_, v]) => {
        const clone: ResponseMult = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, ResponseMult>,
      hints: this.hints.mapEntries(([_, v]) => {
        const clone: Hint = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Hint>,
      explanation: this.explanation.clone(),
    }));
  }


  static fromPersistence(json: any, guid: string, notify: () => void) {

    let model = new Part({ guid });

    const part = json.part;

    model = setId(model, part, notify);

    if (part['@correct'] !== undefined) {
      model = model.with({ correct: part['@correct'] });
    }
    if (part['@score_out_of'] !== undefined) {
      model = model.with({ scoreOutOf: part['@score_out_of'] });
    }
    if (part['@targets'] !== undefined) {
      model = model.with({ targets: part['@targets'] });
    }

    getChildren(part).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'cmd:concept':
          model = model.with({
            concepts: model.concepts.push((item as any)
            ['cmd:concept']['#text']),
          });
          break;
        case 'grading_criteria':
          model = model.with({
            criteria: model.criteria.set(id, GradingCriteria.fromPersistence(item, id, notify)),
          });
          break;
        case 'hint':
          model = model.with({
            hints: model.hints.set(id, Hint.fromPersistence(item, id, notify)),
          });
          break;
        case 'response':
          model = model.with({
            responses: model.responses.set(id, Response.fromPersistence(item, id, notify)),
          });
          break;
        case 'response_mult':
          model = model.with({
            responseMult: model.responseMult.set(
              id, ResponseMult.fromPersistence(item, id, notify)),
          });
          break;
        case 'skillref':
          model = model.with({
            skills: model.skills.add((item as any)
            ['skillref']['@idref']),
          });
          break;
        case 'explanation':
          model = model.with({
            explanation:
              ContentElements.fromPersistence(
                (item as any).explanation, id, ALT_FLOW_ELEMENTS, null, notify),
          });
          break;
        case 'title':
          model = model.with({ title: Title.fromPersistence(item, id, notify) });
          break;
        default:

      }
    });

    return model;
  }

  toPersistence(config = { } as { saveExplanationToFeedback: boolean}):
    Object {

    // Short answers and essays in formative assessments show both the feedback and the
    // explanation to the student, so we need to keep them in sync
    const { saveExplanationToFeedback } = config;

    const children = [

      this.title.toPersistence(),

      ...this.skills
        .toArray()
        .map(skill => ({ skillref: { '@idref': skill } })),

      ...this.concepts
        .toArray()
        .map(concept => ({ 'cmd:concept': { '#text': concept } })),

      ...this.responses
        // filter out responses with empty matches
        .filter(r => r.match !== '')
        .toArray()
        .map(response => saveExplanationToFeedback
          ? response.toPersistence({ explanation: this.explanation })
          : response.toPersistence()),

      ...this.responseMult
        .toArray()
        .map(response => response.toPersistence()),

      ...this.criteria
        .toArray()
        .map(item => item.toPersistence()),

      ...this.hints
        .toArray()
        .map(hint => hint.toPersistence()),

      { explanation: { '#array': this.explanation.toPersistence() } },
    ];

    const part = {
      part: {
        '@id': this.id,
        '@targets': this.targets,
        '#array': children,
      },
    };

    if (this.correct.trim() !== '') {
      part.part['@correct'] = this.correct.trim();
    }
    if (this.scoreOutOf.trim() !== '') {
      part.part['@score_out_of'] = this.scoreOutOf.trim();
    }

    return part;
  }
}
