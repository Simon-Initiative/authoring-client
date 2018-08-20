import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { ContentElements } from 'data/content/common/elements';
import { CombinationsMap } from 'types/combinations';
import { ALT_FLOW_ELEMENTS } from 'data/content/assessment/types';
import { convert } from 'utils/format';

// This sets the limit for the number of choices to use the autogenerate
// feedback combinations feature. When exceeded, the editor will switch to
// the glob notation, but as a side effect, analyzing which choices were made
// will no longer be possible
export const AUTOGEN_MAX_CHOICES = 5;

// Renders a warning message explaining that using more that AUTOGEN_MAX_CHOICES is discouraged
export const renderMaxChoicesWarning = () => {
  return (
    <div className="message alert alert-warning">
      <i className="fa fa-info-circle"/>
      {` Providing more than ${AUTOGEN_MAX_CHOICES} choices \
      (Choice ${convert.toAlphaNotation(AUTOGEN_MAX_CHOICES - 1)}) for this question is \
      discouraged and prevents the learning dashboard from showing exact student response \
      metrics for feedback items that are not defined.`}
    </div>
  );
};

/** Filter funciton that removes all autogenerated responses */
export const autogenResponseFilter = (response) => {
  return !response || !response.name.match(/^AUTOGEN.*/);
};

/**
 * Generates the remaining feedback match combinations of choices not specified by the user
 */
const getFeedbackCombinations =
  (userResponses, choices, allCombinations: CombinationsMap,
   normalizerMap: Object): Immutable.List<string> => {
  // get all user specified combinations

    const existingCombinations = userResponses.map(response => response.match.split(',')
      .filter(s => s));

    const normalizedToLetters = existingCombinations.map(combo => combo.map(c => normalizerMap[c]));

  // function that calculates the key of a given combination
    const getComboKey = (combination: string[]): string => {
      return combination.join(',');
    };

    // return the difference of all combinations and existing combinations
    return allCombinations.keySeq().filter(combinationKey =>
      !normalizedToLetters.reduce((acc, e) => acc || combinationKey === getComboKey(e), false),
    ).toList();
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
export const modelWithDefaultFeedback = (
  model: contentTypes.Part, choices: contentTypes.Choice[], body: ContentElements, score: string,
  maxGenChoices: number, onUpdateChoiceCombinations: (numChoices: number) => CombinationsMap) => {
  // remove all existing default responses
  const userResponses = model.responses.filter(r => !r.name.match(/^AUTOGEN.*/));

  let generatedResponses: contentTypes.Response[];
  if (choices.length <= 1) {
    generatedResponses = [];
  } else if (choices.length > maxGenChoices) {
    const feedback = new contentTypes.Feedback({
      body,
    });
    const feedbacks = Immutable.OrderedMap<string, contentTypes.Feedback>();

    generatedResponses = [
      new contentTypes.Response({
        name: 'AUTOGEN_*',
        score,
        match: '*',
        feedback: feedbacks.set(feedback.guid, feedback),
      }),
    ];
  } else {
    // update available choice combinations before proceeding
    const allCombinations = onUpdateChoiceCombinations(choices.length);

    // A map of the actual choice values to A, B, C, D, in order
    const normalizerMap = choices.reduce(
      (o, choice, index) => {
        o[choice.value] = String.fromCharCode(65 + index);
        return o;
      },
      {});

    // A reverse map to retrieve the original choice value given A, B, C, etc
    const reverseMap = Object.keys(normalizerMap)
      .reduce(
        (o, c) => {
          o[normalizerMap[c]] = c;
          return o;
        },
        {},
      );

    // generate new default responses
    generatedResponses = getFeedbackCombinations(
      userResponses, choices, allCombinations, normalizerMap)
      .toArray()
      .map((combo, i) => {
        const feedback = new contentTypes.Feedback({
          // We only want to clone elements other than the first one, otherwise
          // we will be replacing the model out from underneath the UI,
          // which results in loss of focus
          body: i === 0 ? body : body.clone(),
        });
        const feedbacks = Immutable.OrderedMap<string, contentTypes.Feedback>();

        // Convert the letters in the combo back to the original choice values
        const match = combo.split(',')
          .map(letter => reverseMap[letter])
          .join(',');

        return new contentTypes.Response({
          name: `AUTOGEN_{${match}}`,
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

export const getGeneratedResponseItem = (partModel): contentTypes.Response => {
  return partModel &&
    partModel.responses.toArray().find(r => r.name && !!r.name.match(/^AUTOGEN.*/));
};

export const getGeneratedResponseScore = (partModel) => {
  const item = getGeneratedResponseItem(partModel);

  return item ? item.score : '0';
};

export const getGeneratedResponseBody = (partModel) => {
  const defaultResponseItem = getGeneratedResponseItem(partModel);

  return defaultResponseItem ? defaultResponseItem.feedback.first().body
    : ContentElements.fromText('', '', ALT_FLOW_ELEMENTS);
};
