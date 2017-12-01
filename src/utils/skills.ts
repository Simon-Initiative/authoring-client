import * as Immutable from 'immutable';
import { AssessmentModel, PoolModel } from 'data/models';
import { Question, Part } from 'data/contentTypes';
import { Skill } from 'types/course';

// Does an assessment or standalone pool contain at least one
// question that has a concept (skill) that we do no know about?
export function hasUnknownSkill(
  model : AssessmentModel | PoolModel,
  knownSkills: Immutable.OrderedMap<string, Skill>) : boolean {

  const questions = model.modelType === 'AssessmentModel'
    ? collectAssessmentQuestions(model)
    : model.pool.questions.toArray();

  return questions
    .some(q => q.parts.toArray().some(p => doesPartHaveUnknownSkill(p, knownSkills)));
}

// Find every question in every page and in every embedded pool
function collectAssessmentQuestions(model: AssessmentModel) : Question[] {

  return model.pages.reduce(
    (questions, page) => {

      return page.nodes.reduce(
        (questions, node) => {

          if (node.contentType === 'Question') {
            return [...questions, node];
          } else if (node.contentType === 'Selection') {
            if (node.source.contentType === 'Pool') {
              return [...questions, ...node.source.questions.toArray()];
            }
          }
          return questions;
        },
        questions,
      );
    },
    []);
}


function doesPartHaveUnknownSkill(
  part : Part,
  knownSkills: Immutable.OrderedMap<string, Skill>) : boolean {

  return part.concepts.toArray().some(c => !knownSkills.has(c));
}

