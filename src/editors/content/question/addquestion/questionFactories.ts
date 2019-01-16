import * as contentTypes from 'data/contentTypes';
import guid from 'utils/guid';
import * as Immutable from 'immutable';
import { ContentElements } from 'data/content/common/elements';
import { HTMLLayout } from 'data/content/assessment/dragdrop/htmlLayout/html_layout';
import { Initiator } from 'data/content/assessment/dragdrop/htmlLayout/initiator';
import {
  TableTargetArea,
} from 'data/content/assessment/dragdrop/htmlLayout/table/table_targetarea';
import { Row } from 'data/content/assessment/dragdrop/htmlLayout/table/row';
import { Cell } from 'data/content/assessment/dragdrop/htmlLayout/table/cell';
import { QUESTION_BODY_ELEMENTS, ALT_FLOW_ELEMENTS } from 'data/content/assessment/types';
import { Maybe } from 'tsmonad';
import { DYNA_DROP_SRC_FILENAME } from 'editors/content/utils/common';
import { getTargetsFromLayout, updateItemPartsFromTargets }
  from 'editors/content/learning/dynadragdrop/utils';
import { Likert } from 'data/content/feedback/likert';
import { LikertSeries } from 'data/content/feedback/likert_series';
import { FeedbackMultipleChoice } from 'data/content/feedback/feedback_multiple_choice';
import { FeedbackOpenResponse } from 'data/content/feedback/feedback_open_response';

export function createMultipleChoiceQuestion(select: string) {
  let model = new contentTypes.Question().with({ body: contentTypes.Question.emptyBody() });
  let item = new contentTypes.MultipleChoice();

  const value = select === 'multiple' ? 'A' : guid().replace('-', '');
  const match = select === 'multiple' ? 'A' : value;

  const choice = contentTypes.Choice.fromText('', guid()).with({ value });
  const feedback = contentTypes.Feedback.fromText('', guid());
  let response = new contentTypes.Response({ match });
  response = response.with({
    guid: guid(),
    score: '1',
    feedback: response.feedback.set(feedback.guid, feedback),
  });

  const choices = Immutable.OrderedMap<string, contentTypes.Choice>().set(choice.guid, choice);
  const responses = Immutable.OrderedMap<string, contentTypes.Response>()
    .set(response.guid, response);

  item = item.with({ guid: guid(), select, choices });

  model = model.with({ items: model.items.set(item.guid, item) });

  let part = new contentTypes.Part();
  part = part.with({ guid: guid(), responses });
  model = model.with({ parts: model.parts.set(part.guid, part) });

  return model;
}

export function createSupportingContent() {
  return contentTypes.Content.fromText('', guid());
}

export function createOrdering() {
  const value = 'A';

  let question = new contentTypes.Question().with({ body: contentTypes.Question.emptyBody() });

  const choice = contentTypes.Choice.fromText('', guid()).with({ value });
  const choices = Immutable.OrderedMap<string, contentTypes.Choice>().set(choice.guid, choice);
  const item = new contentTypes.Ordering().with({ choices });
  question = question.with({ items: question.items.set(item.guid, item) });

  const feedback = contentTypes.Feedback.fromText('', guid());
  let response = new contentTypes.Response({ match: value });
  response = response.with({
    guid: guid(),
    score: '1',
    feedback: response.feedback.set(feedback.guid, feedback),
  });

  const responses = Immutable.OrderedMap<string, contentTypes.Response>()
    .set(response.guid, response);

  const part = new contentTypes.Part().with({ responses });
  return question.with({ parts: question.parts.set(part.guid, part) });
}

export function createShortAnswer() {
  const item = new contentTypes.ShortAnswer();

  const feedback = contentTypes.Feedback.fromText('', guid());
  const feedbacks = Immutable.OrderedMap<string, contentTypes.Feedback>()
    .set(feedback.guid, feedback);

  const response = new contentTypes.Response()
    .with({ match: '*', score: '1', feedback: feedbacks });

  const part = new contentTypes.Part()
    .with({
      responses: Immutable.OrderedMap<string, contentTypes.Response>()
        .set(response.guid, response),
    });

  return new contentTypes.Question()
    .with({
      body: contentTypes.Question.emptyBody(),
      items: Immutable.OrderedMap<string, contentTypes.QuestionItem>()
        .set(item.guid, item),
      parts: Immutable.OrderedMap<string, contentTypes.Part>()
        .set(part.guid, part),
    });
}

export function createEssay() {
  const item = new contentTypes.Essay();

  const feedback = contentTypes.Feedback.fromText('', guid());
  const feedbacks = Immutable.OrderedMap<string, contentTypes.Feedback>()
    .set(feedback.guid, feedback);

  const response = new contentTypes.Response({ match: '*', score: '1', feedback: feedbacks });

  const part = new contentTypes.Part()
    .with({
      responses: Immutable.OrderedMap<string, contentTypes.Response>()
        .set(response.guid, response),
    });

  return new contentTypes.Question()
    .with({
      body: contentTypes.Question.emptyBody(),
      items: Immutable.OrderedMap<string, contentTypes.QuestionItem>()
        .set(item.guid, item),
      parts: Immutable.OrderedMap<string, contentTypes.Part>()
        .set(part.guid, part),
    });
}

export function createMultipart() {
  const defaultInputBody = () => ContentElements.fromText
    ('Add numeric, text, or dropdown components', '', QUESTION_BODY_ELEMENTS);

  return new contentTypes.Question()
    .with({
      body: defaultInputBody(),
    });
}

export function createDragDrop() {
  const inputVal = guid();

  const newDndLayout = new HTMLLayout().with({
    initiators: Immutable.List<Initiator>().push(new Initiator().with({
      inputVal,
      text: 'New Choice',
    })),
    targetArea: new TableTargetArea().with({
      rows: Immutable.List<Row>([new Row().with({
        isHeader: true,
        cells: Immutable.List<Cell>([
          new Cell().with({
            text: 'Header 1',
          }),
          new Cell().with({
            text: 'Header 2',
          }),
          new Cell().with({
            text: 'Header 3',
          }),
        ]),
      })])
        .concat([new Row(), new Row(), new Row()].reduce(
          (accRows, newRow) => accRows.push(newRow.with({
            cells: Immutable.List<Cell>([
              new Cell().with({
                target: Maybe.just(guid()),
              }),
              new Cell().with({
                text: 'Enter text or set as drop target',
              }),
              new Cell().with({
                text: 'Enter text or set as drop target',
              }),
            ]),
          })),
          Immutable.List<Row>(),
        )).toList(),
    }),
  });

  const newCustom = new contentTypes.Custom().with({
    id: guid(),
    layout: '',
    layoutData: Maybe.just<HTMLLayout>(newDndLayout),
    src: DYNA_DROP_SRC_FILENAME,
  });

  // create question body
  let newBody = ContentElements.fromText(
    'Drag choices to the correct targets in the table', '', QUESTION_BODY_ELEMENTS);

  newBody = newBody.with({
    content: newBody.content.set(newCustom.guid, newCustom) as ContentElements,
  });

  // create default items
  const matchValue = guid();
  const newChoice = new contentTypes.Choice().with({
    value: matchValue,
  });
  const newChoices = Immutable.OrderedMap<string, contentTypes.Choice>()
    .set(newChoice.guid, newChoice);
  const newFillInTheBlank = new contentTypes.FillInTheBlank().with({
    id: inputVal,
    choices: newChoices,
  });
  const newItems = Immutable.OrderedMap<string, contentTypes.FillInTheBlank>()
    .set(newFillInTheBlank.guid, newFillInTheBlank);

  // create default parts
  const newFeedback = new contentTypes.Feedback().with({
    body: ContentElements.fromText('Enter feedback here', '', ALT_FLOW_ELEMENTS),
  });
  const newFeedbacks = Immutable.OrderedMap<string, contentTypes.Feedback>()
    .set(newFeedback.guid, newFeedback);
  const newResponse = new contentTypes.Response({
    match: matchValue,
    input: inputVal,
    score: '0',
    feedback: newFeedbacks,
  });
  const newPart = new contentTypes.Part().with({
    responses: Immutable.OrderedMap<string, contentTypes.Response>()
      .set(newResponse.guid, newResponse),
  });
  const newParts = Immutable.OrderedMap<string, contentTypes.Part>()
    .set(newPart.guid, newPart);

  const targets = getTargetsFromLayout(newDndLayout);
  const { items, parts } = updateItemPartsFromTargets(newItems, newParts, targets);

  return new contentTypes.Question()
    .with({
      id: guid(),
      body: newBody,
      items,
      parts,
    });
}

export function createImageHotspot() {
  let question = new contentTypes.Question().with({ body: contentTypes.Question.emptyBody() });

  let item = new contentTypes.ImageHotspot().with({
    src: 'NO_IMAGE_SELECTED',
  });

  // create new hotspot
  const match = guid();
  const hotspot = new contentTypes.Hotspot().with({
    shape: 'rect',
    value: match,
    coords: Immutable.List<number>([
      Math.floor(item.width / 2) - 50,
      Math.floor(item.height / 2) - 50,
      Math.floor(item.width / 2) + 50,
      Math.floor(item.height / 2) + 50,
    ]),
  });

  item = item.with({
    hotspots: item.hotspots.set(hotspot.guid, hotspot),
  });

  const feedback = contentTypes.Feedback.fromText('', guid());
  let response = new contentTypes.Response({ match });
  response = response.with({
    guid: guid(),
    feedback: response.feedback.set(feedback.guid, feedback),
  });

  const responses = Immutable.OrderedMap<string, contentTypes.Response>()
    .set(response.guid, response);

  question = question.with({ items: question.items.set(item.guid, item) });

  let part = new contentTypes.Part();
  part = part.with({ guid: guid(), responses });

  return question.with({ parts: question.parts.set(part.guid, part) });
}

export function createEmbeddedPool() {
  return new contentTypes.Selection({ source: new contentTypes.Pool() });
}

export function createLikertSeries() {
  return new LikertSeries({ guid: guid() });
}

export function createLikert() {
  return new Likert({ guid: guid() });
}

export function createFeedbackMultipleChoice() {
  return new FeedbackMultipleChoice({ guid: guid() });
}

export function createFeedbackOpenResponse() {
  return new FeedbackOpenResponse({ guid: guid() });
}
