import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { ContentElements } from 'data/content/common/elements';
import { CombinationsMap } from 'types/combinations';
import { ALT_FLOW_ELEMENTS } from 'data/content/assessment/types';

// This sets the limit for the number of choices to use the autogenerate
// feedback combinations feature. When exceeded, the editor will switch to
// the glob notation, but as a side effect, analyzing which choices were made
// will no longer be possible
export const AUTOGEN_MAX_CHOICES = 12;

/** Filter funciton that removes all autogenerated responses */
export const autogenResponseFilter = (response) => {
  return !response || !response.name.match(/^AUTOGEN.*/);
};

/**
 * Generates the remaining feedback match combinations of choices not specified by the user
 */
const getFeedbackCombinations = (userResponses, choices, allCombinations: CombinationsMap) => {
  // get all user specified combinations
  const existingCombinations = userResponses.map(response => response.match.split(',')
    .filter(s => s));

  // function that calculates the key of a given combination
  const getComboKey = (combination: string[]): string => {
    return combination.sort().join(',');
  };

  // return the difference of all combinations and existing combinations
  return allCombinations.keySeq().filter(combinationKey =>
    !existingCombinations.reduce((acc, e) => acc || combinationKey === getComboKey(e), false),
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
  (model, choices, body: ContentElements, score: string, maxGenChoices: number,
   onUpdateChoiceCombinations: (numChoices: number) => CombinationsMap) => {
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
      // // update available choice combinations before proceeding
      const allCombinations = onUpdateChoiceCombinations(choices.length);

      // generate new default responses
      generatedResponses = getFeedbackCombinations(userResponses, choices, allCombinations)
        .map((combo, i) => {
          const feedback = new contentTypes.Feedback({
            body: i === 0 ? body : body.clone(),
          });
          const feedbacks = Immutable.OrderedMap<string, contentTypes.Feedback>();
          const match = combo;

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

export const getGeneratedResponseItem = (partModel) => {
  return partModel &&
    partModel.responses.toArray().find(r => r.name && !!r.name.match(/^AUTOGEN.*/));
};

export const getGeneratedResponseBody = (partModel) => {
  const defaultResponseItem = getGeneratedResponseItem(partModel);

  return defaultResponseItem ? defaultResponseItem.feedback.first().body
    : ContentElements.fromText('', '', ALT_FLOW_ELEMENTS);
};

export const getGeneratedResponseScore = (partModel) => {
  const defaultResponseItem = getGeneratedResponseItem(partModel);

  return defaultResponseItem ? defaultResponseItem.score : '0';
};
