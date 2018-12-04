import * as Immutable from 'immutable';
import * as contentTypes from '../contentTypes';
import guid from '../../utils/guid';
import { getKey } from '../common';

import { assessmentTemplate } from '../activity_templates';
import { isArray, isNullOrUndefined } from 'util';
import { ContentElements, TEXT_ELEMENTS } from 'data/content/common/elements';
import { ContentElement } from 'data/content/common/interfaces';

export type AssessmentModelParams = {
  resource?: contentTypes.Resource,
  guid?: string,
  type?: string;
  recommendedAttempts?: string;
  maxAttempts?: string;
  branching?: boolean,
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
  recommendedAttempts: '3',
  maxAttempts: '3',
  branching: false,
  lock: new contentTypes.Lock(),
  title: new contentTypes.Title(),
  nodes: Immutable.OrderedMap<string, contentTypes.Node>(),
  pages: Immutable.OrderedMap<string, contentTypes.Page>(),
};

function splitQuestionsIntoPages(model: AssessmentModel) {
  const nodes = [];
  model.pages.forEach((page) => {
    page.nodes.forEach((node) => {
      nodes.push(node);
    });
  });

  // Merge supporting content into adjacent questions
  const indicesToRemove = [];
  nodes.forEach((node, nodeIndex) => {
    if (node.contentType === 'Content') {
      // try merging the supporting content into the next node
      const nextNode = nodes[nodeIndex + 1];
      const prevNode = nodes[nodeIndex - 1];
      if (nextNode && (nextNode.contentType === 'Question' ||
        nextNode.contentType === 'Content')) {
        nodes[nodeIndex + 1] = nextNode.with({
          body: node.body.with({
            content: node.body.content.concat(nextNode.body.content) as
              Immutable.OrderedMap<string, ContentElement>,
          }),
        });
        indicesToRemove.push(nodeIndex);
        // else merge it into the previous node
      } else if (prevNode && (prevNode.contentType === 'Question' ||
        prevNode.contentType === 'Content') && indicesToRemove.indexOf(nodeIndex - 1) === -1) {
        nodes[nodeIndex - 1] = prevNode.with({
          body: node.body.with({
            content: prevNode.body.content.concat(node.body.content) as
              Immutable.OrderedMap<string, ContentElement>,
          }),
        });
        indicesToRemove.push(nodeIndex);
      }
    }
  });
  const pages = nodes
    .reduce(
      (nodes: contentTypes.Node[], node: contentTypes.Node, i: number) =>
        indicesToRemove.indexOf(i) === -1 ? nodes.concat(node) : nodes,
      [])
    .map((node: contentTypes.Node, index: number) => new contentTypes.Page().with({
      id: 'p' + (index + 1).toString() + '_' + model.resource.id,
      nodes: Immutable.OrderedMap<string, contentTypes.Node>([[node.guid, node]]),
    }));

  return model.with({
    pages: Immutable.OrderedMap<string, contentTypes.Page>(
      pages.map(page => [page.guid, page])),
  });
}

function migrateNodesToPage(model: AssessmentModel) {
  let updated = model;

  // Ensure that we have at least one page
  if (updated.pages.size === 0) {
    let newPage = new contentTypes.Page();
    newPage = newPage.with({ title: contentTypes.Title.fromText('Page 1') });
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
  branching: boolean;
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

  static fromPersistence(json: Object, notify: () => void): AssessmentModel {

    let model = new AssessmentModel();

    const a = (json as any);
    model = model.with({ resource: contentTypes.Resource.fromPersistence(a) });
    model = model.with({ guid: a.guid });
    model = model.with({ type: a.type });
    model = model.with({
      title: new contentTypes.Title({
        guid: guid(),
        text: ContentElements.fromText(a.title, '', TEXT_ELEMENTS),
      }),
    });

    if (a.lock !== undefined && a.lock !== null) {
      model = model.with({ lock: contentTypes.Lock.fromPersistence(a.lock) });
    }
    let assessment = null;
    if (isArray(a.doc)) {
      assessment = a.doc[0].assessment;
    } else {
      assessment = a.doc.assessment;
    }

    // Recommended attempts should never be higher than maximum attempts.
    // Handle the four cases where recommended / maximum attempts are already set in the model
    const recommended = parseInt(assessment['@recommended_attempts'], 10);
    const maximum = parseInt(assessment['@max_attempts'], 10);

    // 1. Both values defined
    if (!isNaN(recommended) && !isNaN(maximum)) {
      model = model.with({
        recommendedAttempts: assessment['@recommended_attempts'],
        maxAttempts: maximum > recommended
          ? assessment['@max_attempts']
          : assessment['@recommended_attempts'],
      });
    }
    // 2, 3. One value defined
    if (!isNaN(recommended)) {
      model = model.with({
        recommendedAttempts: assessment['@recommended_attempts'],
        maxAttempts: Math.max(recommended, parseInt(model.maxAttempts, 10)).toString(),
      });
    }
    if (!isNaN(maximum)) {
      model = model.with({
        recommendedAttempts: Math.min(parseInt(model.recommendedAttempts, 10), maximum).toString(),
        maxAttempts: assessment['@max_attempts'],
      });
    }
    // 4. Neither value defined: handled implicitly by applying both default parameter values

    assessment['#array'].forEach((item) => {

      const key = getKey(item);
      const id = guid();

      switch (key) {
        case 'page':
          model = model.with(
            { pages: model.pages.set(id, contentTypes.Page.fromPersistence(item, id, notify)) });
          break;
        case 'question':
          model = model.with({
            nodes:
              model.nodes.set(id, contentTypes.Question.fromPersistence(item, id, notify)),
          });
          break;
        case 'content':
          model = model.with({
            nodes: model.nodes.set(id, contentTypes.Content.fromPersistence(item, id, notify)),
          });
          break;
        case 'selection':
          model = model.with({
            nodes:
              model.nodes.set(id, contentTypes.Selection.fromPersistence(item, id, notify)),
          });
          break;
        case 'title':
          break;
        // Content service looks for a short title with text equal to "reveal"
        // to display a branching assessment
        case 'short_title':
          item.short_title['#text'] !== undefined &&
            item.short_title['#text'] === 'reveal'
            ? model = model.with({ branching: true })
            : model = model.with({ branching: false });
          break;
        default:
          model = model.with({
            nodes:
              model.nodes.set(id, contentTypes.Unsupported.fromPersistence(item, id, notify)),
          });
      }
    });

    // Adjust models to ensure that we never have a page-less assessment
    model = migrateNodesToPage(model);

    // Split questions into pages for branching assessments
    if (model.branching) {
      model = splitQuestionsIntoPages(model);
    }

    return model;
  }

  toPersistence(): Object {

    const titleText = this.title.text.extractPlainText().caseOf({
      just: str => str,
      nothing: () => '',
    });

    const children = [
      this.title.toPersistence(),
    ];
    // Content service looks for a short title with text equal to "reveal"
    // to display a branching assessment
    if (this.branching) {
      children.push(
        { short_title: { '#text': 'reveal' } },
      );
    }
    children.push(
      ...this.pages.toArray().map(page => page.toPersistence()),
    );

    let resource = this.resource.toPersistence();
    let doc = null;

    if (isNullOrUndefined(this.guid) || this.guid === '') {
      // Assume new assessment created if guid is null
      const assessment = assessmentTemplate(titleText);
      try {
        const id = assessment.assessment['@id'];
        resource = new contentTypes.Resource({ id, title: titleText });
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
