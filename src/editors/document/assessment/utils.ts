import * as Immutable from 'immutable';

import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';

/**
 * Determines if the type of the assessment is restricted by the contents of
 * of the assessment (aka the model)
 * @param model the assessment model
 */
export function typeRestrictedByModel(model: models.AssessmentModel) : boolean {

  const questions = [];

  const pages = model.pages.toArray();

  // The type of the assessment is restricted (i.e. cannot be changed) if
  // it contains a selection or if it contains a question that has multiple parts

  return (
    pages.reduce(
      (prev, page) => {
        return prev || page.nodes.toArray().find(n => n.contentType === 'Selection') !== undefined;
      }, 
      false)

        ||

     pages.reduce(
      (prev, page) => {
        if (prev) return true;
        const questions = [];
        extractFromNodes(page.nodes, questions);
        return questions.find(q => isMultipart(q)) !== undefined;
      }, 
      false)
  );
      
  
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

