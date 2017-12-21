import * as Immutable from 'immutable';
import * as contentTypes from '../contentTypes';
import guid from '../../utils/guid';
import { getKey } from '../common';
import { assessmentTemplate } from '../activity_templates';
import { isNullOrUndefined, isArray } from 'util';

export type AssessmentModelParams = {
  resource?: contentTypes.Resource,
  guid?: string,
  type?: string;
  recommendedAttempts?: string;
  maxAttempts?: string;
  lock?: contentTypes.Lock,
  title?: contentTypes.Title,
  nodes?: Immutable.OrderedMap<string, contentTypes.Node>,
  pages?: Immutable.OrderedMap<string, contentTypes.Page>,
};
const defaultAssessmentModelParams = {
  modelType: 'AssessmentModel',
  type: '',
  resource: new contentTypes.Resource(),
  guid: '',
  recommendedAttempts: '1',
  maxAttempts: '1',
  lock: new contentTypes.Lock(),
  title: new contentTypes.Title(),
  nodes: Immutable.OrderedMap<string, contentTypes.Node>(),
  pages: Immutable.OrderedMap<string, contentTypes.Page>(),
};

function migrateNodesToPage(model: AssessmentModel) {
  let updated = model;

  // Ensure that we have at least one page
  if (updated.pages.size === 0) {
    let newPage = new contentTypes.Page();
    newPage = newPage.with({ title: new contentTypes.Title({ text: 'Page 1' }) });
    updated = updated.with({ pages: updated.pages.set(newPage.guid, newPage) });
  }

  // Now move all supported nodes into the first page
  if (updated.nodes.size > 0) {

    const page = updated.pages.first();
    const migratedPage = updated.nodes
      .toArray()
      .reduce(
        (page, node) => {
          if (node.contentType !== 'Unsupported') {
            return page.with({ nodes: page.nodes.set(node.guid, node) });
          }

          return page;
        },
        page);

    updated = updated.with({ pages: updated.pages.set(migratedPage.guid, migratedPage) });
    updated = updated.with({ nodes: Immutable.OrderedMap<string, contentTypes.Node>() });
  }

  return updated;
}

export class AssessmentModel extends Immutable.Record(defaultAssessmentModelParams) {

  modelType: 'AssessmentModel';
  resource: contentTypes.Resource;
  guid: string;
  type: string;
  recommendedAttempts: string;
  maxAttempts: string;
  lock: contentTypes.Lock;
  title: contentTypes.Title;
  nodes: Immutable.OrderedMap<string, contentTypes.Node>;
  pages: Immutable.OrderedMap<string, contentTypes.Page>;

  constructor(params?: AssessmentModelParams) {
    params ? super(params) : super();
  }

  with(values: AssessmentModelParams): AssessmentModel {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object): AssessmentModel {

    let model = new AssessmentModel();

    const a = (json as any);
    model = model.with({ resource: contentTypes.Resource.fromPersistence(a) });
    model = model.with({ guid: a.guid });
    model = model.with({ type: a.type });
    model = model.with({ title: new contentTypes.Title({ guid: guid(), text: a.title }) });

    if (a.lock !== undefined && a.lock !== null) {
      model = model.with({ lock: contentTypes.Lock.fromPersistence(a.lock) });
    }
    let assessment = null;
    if (isArray(a.doc)) {
      assessment = a.doc[0].assessment;
    } else {
      assessment = a.doc.assessment;
    }

    if (assessment['@recommended_attempts'] !== undefined) {
      model = model.with({ recommendedAttempts: assessment['@recommended_attempts'] });
    }
    if (assessment['@max_attempts'] !== undefined) {
      model = model.with({ maxAttempts: assessment['@max_attempts'] });
    }

    assessment['#array'].forEach((item) => {

      const key = getKey(item);
      const id = guid();

      switch (key) {
        case 'page':
          model = model.with(
            { pages: model.pages.set(id, contentTypes.Page.fromPersistence(item, id)) });
          break;
        case 'question':
          model = model.with(
            { nodes: model.nodes.set(id, contentTypes.Question.fromPersistence(item, id)) });
          break;
        case 'content':
          model = model.with(
            { nodes: model.nodes.set(id, contentTypes.Content.fromPersistence(item, id)) });
          break;
        case 'selection':
          model = model.with(
            { nodes: model.nodes.set(id, contentTypes.Selection.fromPersistence(item, id)) });
          break;
        case 'title':
          break;
        default:
          model = model.with(
            { nodes: model.nodes.set(id, contentTypes.Unsupported.fromPersistence(item, id)) });
      }
    });

    // Adjust models to ensure that we never have a page-less assessment
    model = migrateNodesToPage(model);

    return model;
  }

  toPersistence(): Object {
    const children = [
      this.title.toPersistence(),
      { short_title: { '#text': this.title.text } },
      ...this.pages.toArray().map(page => page.toPersistence()),
    ];
    let resource = this.resource.toPersistence();
    let doc = null;

    if (isNullOrUndefined(this.guid) || this.guid === '') {
      // Assume new assessment created if guid is null
      const assessment = assessmentTemplate(this.title.text);
      try {
        const id = assessment.assessment['@id'];
        resource = new contentTypes.Resource({ id, title: this.title.text });
      } catch (err) {
        return null;
      }
      doc = [
        assessment,
      ];

    } else {
      doc = [{
        assessment: {
          '@id': this.resource.id,
          '@recommended_attempts': this.recommendedAttempts,
          '@max_attempts': this.maxAttempts,
          '#array': children,
        },
      }];
    }
    const root = {
      doc,
    };

    return Object.assign({}, resource, root, this.lock.toPersistence());
  }
}
