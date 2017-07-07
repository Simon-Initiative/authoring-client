import * as Immutable from 'immutable';

import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';

/**
 * Determines if a given assessment contains any multi-part questions.
 * @param model the assessment model
 */
export function containsMultipartQuestions(model: models.AssessmentModel) : boolean {

  const questions = [];

  model.pages.toArray()
    .forEach(p => extractFromNodes(p.nodes, questions));

  return questions.find(q => isMultipart(q)) !== undefined;
}

function isMultipart(q: contentTypes.Question) {
  return q.items.size > 1;
}

function extractFromNodes(
  nodes: Immutable.OrderedMap<string, contentTypes.Node>, 
  questions: contentTypes.Question[]) {

  nodes.toArray()
    .filter(n => n.contentType === 'Question')
    .forEach(q => questions.push(q as any));

  nodes.toArray()
    .filter(n => n.contentType === 'Selection')
    .forEach((selection) => {
      if (selection.contentType === 'Selection') {
        if (selection.source.contentType === 'Pool') {
          selection.source.questions.toArray()
            .forEach(q => questions.push(q));
        }
      }
    });
  
} 
