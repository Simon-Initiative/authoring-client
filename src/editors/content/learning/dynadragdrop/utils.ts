import * as Immutable from 'immutable';
import { Custom } from 'data/content/assessment/custom';
import { convert } from 'utils/format';
import { Initiator as InitiatorModel } from 'data/content/assessment/dragdrop/initiator';
import { Page, Question, Node, Item, Part, Choice, Response, ContiguousText,
  FillInTheBlank } from 'data/contentTypes';
import { Target } from 'data/content/assessment/dragdrop/target';
import { DndLayout } from 'data/content/assessment/dragdrop/dnd_layout';
import { ContentElements, FLOW_ELEMENTS } from 'data/content/common/elements';
import { Feedback } from 'data/content/assessment/feedback';

export const choiceAssessmentIdSort = (a: Choice, b: Choice) =>
  a.value.localeCompare(b.value);

export const responseAssessmentIdSort = (a: Response, b: Response) =>
  a.match.localeCompare(b.match);

export const targetAssessmentIdSort = (a: Target, b: Target) =>
  a.assessmentId.localeCompare(b.assessmentId);

export const buildTargetLabelsMap = (question: Question, selectedInitiator: string) => {
  const currentItem = question.items.toArray().find(
    (item: FillInTheBlank) => item.id === selectedInitiator) as FillInTheBlank;

  if (!currentItem) {
    return {};
  }

  return currentItem.choices.sort(choiceAssessmentIdSort).toArray().reduce(
    (acc, choice: Choice, index) => ({
      ...acc,
      [choice.value]:
      convert.toAlphaNotation(index),
    }),
    {},
  );
};

export const buildInitiatorPartMap =
  (question: Question, initiators: Immutable.List<InitiatorModel>) => {
    return initiators.reduce(
      (acc, val) =>
        acc.set(val.assessmentId, question.parts.find(part =>
          part.responses.first() &&
          part.responses.first().input === val.assessmentId,
        )),
      Immutable.Map<string, Part>(),
    );
  };

export const buildTargetInitiatorsMap =
  (question: Question, initiators: Immutable.List<InitiatorModel>) => {
  // A utility map used by the following reduce funciton.
  // It creates a map of initiators key'd off of their assessmentId
    const initiatorsMap = initiators.toArray().reduce(
      (acc, initiator) => {
        return {
          ...acc,
          [initiator.assessmentId]: initiator,
        };
      },
      {},
    );

    // This reduce function goes through every Response in every Part to build a map
    // of initiators that are key'd off of the responses "match" value. This enables
    // us to easily look up initiators associated to target's assessmentId
    return question.parts.reduce(
      (accParts, part) => ({
        ...accParts,
        ...part.responses.reduce(
          (accResponses, response) => (+response.score > 0)
            ? ({
              ...accResponses,
              [response.match]:
                (accResponses[response.match] || []).concat(initiatorsMap[response.input]),
            })
            : accResponses,
          accParts,
        ),
      }),
      {},
    );
  };

export const setQuestionPartWithInitiatorScore = (
  initiatorId: string, targetAssessmentId: string, score: number,
  model: Custom, question: Question) => {

  const initiators = model.layoutData.caseOf({
    just: ld => ld.initiatorGroup.initiators,
    nothing: () => Immutable.List<InitiatorModel>(),
  });

  // get initiator with specified id
  const initiator = initiators.find(i => i.guid === initiatorId);

  const initiatorParts = buildInitiatorPartMap(question, initiators);

  const updatedResponse = initiatorParts.get(initiator.assessmentId).responses.find(response =>
    response.match === targetAssessmentId)
    .with({
      score: `${score}`,
    });

  const updatedPart = initiatorParts.get(initiator.assessmentId).withMutations((part: Part) =>
    part.with({
      responses: part.responses.set(updatedResponse.guid, updatedResponse),
    }),
  ) as Part;

  return question.with({
    parts: question.parts.set(updatedPart.guid, updatedPart),
  });
};

export const getTargetsFromLayout = (dndLayout: DndLayout) => {
  return dndLayout.targetGroup.rows.reduce(
    (accRows, row) =>
      accRows.concat(row.cols.toArray().reduce(
        (accCols, col) => col.contentType === 'Target' ? accCols.push(col) : accCols,
        Immutable.List<Target>(),
      )) as Immutable.List<Target>,
    Immutable.List<Target>(),
  );
};

export const updateItemPartsFromTargets = (
  items: Immutable.OrderedMap<string, FillInTheBlank>,
  parts: Immutable.OrderedMap<string, Part>,
  targets: Immutable.List<Target>,
  ) => {
  // sort targets to ensure consistent ordering
  const sortedTargets = targets.sort(targetAssessmentIdSort);

  // compute updated parts based on targets
  const updatedParts = parts.reduce(
    (accParts, part) => accParts.set(part.guid, part.with({
      responses: sortedTargets.reduce(
        (accResponses, target) => {
          const input = part.responses.first() && part.responses.first().input;
          const f = new Feedback();

          // find existing response with assessmentId or create a new one
          const response = part.responses.find(r =>
            r.match === target.assessmentId) || new Response().with({
              input,
              match: target.assessmentId,
              feedback: Immutable.OrderedMap<string, Feedback>().set(f.guid, f),
            });

          return accResponses.set(response.guid, response);
        },
        Immutable.OrderedMap<string, Response>(),
      ),
    })),
    Immutable.OrderedMap<string, Part>(),
  );

  const updatedItems = items.reduce(
    (accItems, item) => accItems.set(item.guid, item.with({
      choices: sortedTargets.reduce(
        (accChoices, target) => {
          const choice = item.choices.find(c =>
            c.value === target.assessmentId) || new Choice().with({
              value: target.assessmentId,
              body: new ContentElements().with({
                supportedElements: Immutable.List(FLOW_ELEMENTS) }),
            });

          return accChoices.set(choice.guid, choice);
        },
        Immutable.OrderedMap<string, Choice>(),
      ),
    })),
    Immutable.OrderedMap<string, FillInTheBlank>(),
  );

  return {
    items: updatedItems,
    parts: updatedParts,
  };
};
