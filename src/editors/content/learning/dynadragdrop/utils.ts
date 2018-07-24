import * as Immutable from 'immutable';
import { Custom } from 'data/content/assessment/custom';
import { convert } from 'utils/format';
import { Initiator as InitiatorModel } from 'data/content/assessment/dragdrop/htmlLayout/initiator';
import { Question, Part, Choice, Response,
  FillInTheBlank } from 'data/contentTypes';
import { ContentElements, FLOW_ELEMENTS } from 'data/content/common/elements';
import { Feedback } from 'data/content/assessment/feedback';
import { HTMLLayout } from 'data/content/assessment/dragdrop/htmlLayout/html_layout';
import { Cell } from 'data/content/assessment/dragdrop/htmlLayout/table/cell';
import { Row } from 'data/content/assessment/dragdrop/htmlLayout/table/row';

export const sortTargetsByRowColumn = (
  layout: HTMLLayout,
) => {
  switch (layout.targetArea.contentType) {
    case 'DndTableTargetArea':
      return layout.targetArea.rows.reduce(
        (accRow, row: Row) => accRow.concat(
          row.cells.reduce(
            (accCell, cell) => cell.target.caseOf({
              just: target => accCell.push(target),
              nothing: () => accCell,
            }),
            Immutable.List<string>(),
          ),
        ).toList(),
        Immutable.List<string>(),
      );
    default:
      throw Error(`layout type ${layout.targetArea.contentType} not supported`);
  }
};

export const sortChoicesByLayout = (
  choices: Immutable.OrderedMap<string, Choice>,
  layout: HTMLLayout,
) => {
  const sortedTargets = sortTargetsByRowColumn(layout);

  const choiceValueMap = choices.reduce(
    (acc, choice) => acc.set(choice.value, choice),
    Immutable.OrderedMap<string, Choice>(),
  );

  return sortedTargets.map(target => choiceValueMap.get(target)).toArray();
};

export const sortResponsesByChoice = (
  responses: Immutable.OrderedMap<string, Response>,
  choices: Choice[],
) => {
  const responseMatchMap = responses.reduce(
    (acc, response) => acc.set(response.match, response),
    Immutable.OrderedMap<string, Response>(),
  );

  return choices.map(choice => responseMatchMap.get(choice.value));
};


export const targetAssessmentIdSort = (a: Cell, b: Cell) =>
  // parameters must always be targets. If they arent, just throw an error
  a.target.valueOrThrow().localeCompare(b.target.valueOrThrow());

export const buildTargetLabelsMap = (
  question: Question, selectedInitiator: string, layout: HTMLLayout) => {
  const currentItem = question.items.toArray().find(
    (item: FillInTheBlank) => item.id === selectedInitiator) as FillInTheBlank;

  if (!currentItem) {
    return {};
  }

  return sortChoicesByLayout(currentItem.choices, layout).reduce(
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
        acc.set(val.inputVal, question.parts.find(part =>
          part.responses.first() &&
          part.responses.first().input === val.inputVal,
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
          [initiator.inputVal]: initiator,
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
          (accResponses, response) => (+response.score > 0) && initiatorsMap[response.input]
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
    just: ld => (ld as HTMLLayout).initiators,
    nothing: () => Immutable.List<InitiatorModel>(),
  });

  // get initiator with specified id
  const initiator = initiators.find(i => i.guid === initiatorId);

  const initiatorParts = buildInitiatorPartMap(question, initiators);

  const updatedResponse = initiatorParts.get(initiator.inputVal).responses.find(response =>
    response.match === targetAssessmentId)
    .with({
      score: `${score}`,
    });

  const updatedPart = initiatorParts.get(initiator.inputVal).withMutations((part: Part) =>
    part.with({
      responses: part.responses.set(updatedResponse.guid, updatedResponse),
    }),
  ) as Part;

  return question.with({
    parts: question.parts.set(updatedPart.guid, updatedPart),
  });
};

export const getTargetsFromLayout = (layout: HTMLLayout) => {
  switch (layout.targetArea.contentType) {
    case 'DndTableTargetArea':
      return layout.targetArea.rows.reduce(
        (accRows, row) =>
          accRows.concat(row.cells.reduce(
            (accCells, cell) => cell.target.caseOf({
              just: () => accCells.push(cell),
              nothing: () => accCells,
            }),
            Immutable.List<Cell>(),
          ),
        ).toList(),
        Immutable.List<Cell>(),
      );
    default:
      throw Error(`Layout targetArea "${layout.targetArea.contentType}" is not supported`);
  }
};

/**
 * This function expects targetCells to be a list of targets.
 * If there are any cells that are not targets, this function will
 * throw an error.
 */
export const updateItemPartsFromTargets = (
  items: Immutable.OrderedMap<string, FillInTheBlank>,
  parts: Immutable.OrderedMap<string, Part>,
  targetCells: Immutable.List<Cell>,
  ) => {
  // sort targets to ensure consistent ordering
  const sortedTargetCells = targetCells.sort(targetAssessmentIdSort);

  // compute updated parts based on targets
  const updatedParts = parts.reduce(
    (accParts, part) => accParts.set(part.guid, part.with({
      responses: sortedTargetCells.reduce(
        (accResponses, targetCell) => {
          const input = part.responses.first() && part.responses.first().input;
          const f = new Feedback();

          // find existing response with assessmentId or create a new one
          const response = part.responses.find(r =>
            r.match === targetCell.target.valueOrThrow()) || new Response().with({
              input,
              match: targetCell.target.valueOrThrow(),
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
      choices: sortedTargetCells.reduce(
        (accChoices, targetCell) => {
          const choice = item.choices.find(c =>
            c.value === targetCell.target.valueOrThrow()) || new Choice().with({
              value: targetCell.target.valueOrThrow(),
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

export const updateHTMLLayoutTargetRefs = (
  targetValMap: { [oldValue: string]: string },
  initiatorInputMap: { [oldValue: string]: string },
  layout: HTMLLayout,
  ) => {
  switch (layout.targetArea.contentType) {
    case 'DndTableTargetArea':
      return layout.with({
        targetArea: layout.targetArea.with({
          rows: layout.targetArea.rows.map(row => row.with({
            cells: row.cells.map(cell => cell.with({
              target: cell.target.lift(target => targetValMap[target]),
            })).toList(),
          })).toList(),
        }),
        initiators: layout.initiators.map(initiator =>
          initiator.with({ inputVal: initiatorInputMap[initiator.inputVal] }),
        ).toList(),
      });
    default:
      throw Error(`Layout targetArea "${layout.targetArea.contentType}" is not supported`);
  }
};
