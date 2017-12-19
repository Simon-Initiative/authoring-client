import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { Html } from 'data/content/html.ts';

/**
 * Generates the remaining feedback match combinations of choices not specified by the user
 */
const generateFeedbackCombinations = (userResponses, choices) => {
  // function that recursively generates all combinations of the specified ids
  const recursiveCombination = (ids, prefix = []) => (
    // combine nested arrays into a single result array
    ids.reduce(
      (acc, id, i) => (
        // return an array containing the current new combination
        // and recursively add remaining combinations
        acc.concat([
          [...prefix, id],
          ...recursiveCombination(ids.slice(i + 1), [...prefix, id]),
        ])
      ),
      [],
    )
  );

  const allCombinations = recursiveCombination(choices.map(c => c.guid));
  const existingCombinations = userResponses.map(response => (
      response.match.split(',').map(m =>
          choices.find(c => c.value === m) && choices.find(c => c.value === m).guid,
      ).filter(s => s)
    ),
  );

  const setsEqual = (set1: string[], set2: string[]): boolean => {
    return set1.length === set2.length
      && set1.reduce((acc, i) => acc && !!set2.find(j => j === i), true)
      && set2.reduce((acc, i) => acc && !!set1.find(j => j === i), true);
  };

  /// return the difference of all combinations and existing combinations
  return allCombinations.filter(combination =>
    !existingCombinations.reduce((acc, e) => acc || setsEqual(e, combination), false),
  );
};

/**
 * Returns a new model with default feedback generated using all combinations of the choices
 * provided bar user specified
 *
 * @param model model to generate default feedback for
 * @param choices choices used to generate feedback
 * @param body html body of the default feedback
 * @param score score of the default feedback
 * @param maxGenChoices max choices to generate feedback for. if exceeded, feedback will simply
 *                      be a single feedback item with match set to the match-all 'glob'
 */
export const modelWithDefaultFeedback =
  (model, choices, body: Html, score: string, maxGenChoices: number) => {

    // remove all existing default responses
    const userResponses = model.responses.filter(r => !r.name.match(/^AUTOGEN.*/));

    let generatedResponses;
    if (choices.length > maxGenChoices) {
      const feedback = new contentTypes.Feedback({
        body,
      });
      const feedbacks = Immutable.OrderedMap<string, contentTypes.Feedback>();

      generatedResponses = [
        new contentTypes.Response({
          name: 'AUTOGEN',
          score,
          match: '*',
          feedback: feedbacks.set(feedback.guid, feedback),
        }),
      ];
    } else {
      // generate new default responses
      generatedResponses = generateFeedbackCombinations(userResponses, choices).map((combo) => {

        const feedback = new contentTypes.Feedback({
          body: body.clone(),
        });
        const feedbacks = Immutable.OrderedMap<string, contentTypes.Feedback>();
        const match = combo.map(id => choices.find(c => c.guid === id).value).join(',');

        return new contentTypes.Response({
          name: 'AUTOGEN',
          score,
          match,
          feedback: feedbacks.set(feedback.guid, feedback),
        });
      });
    }

    const updatedModel = model.with({
      responses: Immutable.OrderedMap(
        userResponses.concat(
          generatedResponses.reduce((acc, i) => { acc[i.guid] = i; return acc; }, {}),
        ),
      ),
    });

    return updatedModel;
  };
