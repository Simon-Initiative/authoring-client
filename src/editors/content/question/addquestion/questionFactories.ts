import * as contentTypes from 'data/contentTypes';
import guid from 'utils/guid';
import * as Immutable from 'immutable';
import { ContentElements, TEXT_ELEMENTS, INLINE_ELEMENTS } from 'data/content/common/elements';
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
import { LikertItem } from 'data/content/feedback/likert_item';
import { LikertScale } from 'data/content/feedback/likert_scale';
import { FeedbackChoice } from 'data/content/feedback/feedback_choice';
import { FeedbackPrompt } from 'data/content/feedback/feedback_prompt';
import { LikertLabel } from 'data/content/feedback/likert_label';
import { modelWithDefaultFeedback } from 'editors/content/part/defaultFeedbackGenerator';
import { CombinationsMap, PermutationsMap } from 'types/combinations';

export function createMultipleChoiceQuestion(
  select: string, onGetChoiceCombinations: (comboNum: number) => CombinationsMap,
) {
  let model = new contentTypes.Question().with({ body: contentTypes.Question.emptyBody() });
  let item = new contentTypes.MultipleChoice();

  const correctValue = select === 'multiple' ? 'A' : guid().replace('-', '');
  const incorrectValue = select === 'multiple' ? 'B' : guid().replace('-', '');
  const correctMatch = select === 'multiple' ? 'A' : correctValue;

  const correctChoice = contentTypes.Choice.fromText('', guid()).with({ value: correctValue });
  const incorrectChoice = contentTypes.Choice.fromText('', guid()).with({ value: incorrectValue });
  const correctFeedback = contentTypes.Feedback.fromText('', guid());
  let correctResponse = new contentTypes.Response();
  correctResponse = correctResponse.with({
    guid: guid(),
    match: correctMatch,
    score: '1',
    feedback: correctResponse.feedback.set(correctFeedback.guid, correctFeedback),
  });

  const choices = Immutable.OrderedMap<string, contentTypes.Choice>()
    .set(correctChoice.guid, correctChoice)
    .set(incorrectChoice.guid, incorrectChoice);

  const responses = Immutable.OrderedMap<string, contentTypes.Response>()
    .set(correctResponse.guid, correctResponse);

  item = item.with({ guid: guid(), select, choices });

  model = model.with({ items: model.items.set(item.guid, item) });

  let part = new contentTypes.Part().with({ guid: guid(), responses });

  if (select === 'single') {
    const incorrectFeedback = contentTypes.Feedback.fromText('', guid());
    let incorrectResponse = new contentTypes.Response({ match: incorrectValue });
    incorrectResponse = incorrectResponse.with({
      feedback: incorrectResponse.feedback.set(incorrectFeedback.guid, incorrectFeedback) });

    part = part.with({
      responses: part.responses.set(incorrectResponse.guid, incorrectResponse),
    });
  } else {
    // update part model with default feedback
    const defaultBody = ContentElements.fromText('', '', ALT_FLOW_ELEMENTS);
    part = modelWithDefaultFeedback(
      part,
      item.choices.toArray(),
      defaultBody,
      '0',
      onGetChoiceCombinations,
    );
  }

  model = model.with({ parts: model.parts.set(part.guid, part) });

  console.log('model', model);

  return model;
}

export function createSupportingContent() {
  return contentTypes.Content.fromText('', guid());
}

export function createOrdering(onGetChoicePermutations: (comboNum: number) => PermutationsMap) {
  const firstValue = 'A';
  const secondValue = 'B';

  let question = new contentTypes.Question().with({ body: contentTypes.Question.emptyBody() });

  const correctChoice = contentTypes.Choice.fromText('', guid()).with({ value: firstValue });
  const incorrectChoice = contentTypes.Choice.fromText('', guid()).with({ value: secondValue });
  const choices = Immutable.OrderedMap<string, contentTypes.Choice>()
    .set(correctChoice.guid, correctChoice)
    .set(incorrectChoice.guid, incorrectChoice);
  const item = new contentTypes.Ordering().with({ choices });
  question = question.with({ items: question.items.set(item.guid, item) });

  const feedback = contentTypes.Feedback.fromText('', guid());
  let response = new contentTypes.Response();
  response = response.with({
    guid: guid(),
    match: `${firstValue},${secondValue}`,
    score: '1',
    feedback: response.feedback.set(feedback.guid, feedback),
  });

  const responses = Immutable.OrderedMap<string, contentTypes.Response>()
    .set(response.guid, response);

  let part = new contentTypes.Part().with({ responses });

  // update part model with default feedback
  const defaultBody = ContentElements.fromText('', '', ALT_FLOW_ELEMENTS);
  part = modelWithDefaultFeedback(
    part,
    item.choices.toArray(),
    defaultBody,
    '0',
    onGetChoicePermutations,
  );

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
  const items = [
    new LikertItem({
      prompt: new FeedbackPrompt({
        content: ContentElements.fromText(
          'I found the section easy to understand',
          '', INLINE_ELEMENTS),
      }),
    }),
    new LikertItem({
      prompt: new FeedbackPrompt({
        content: ContentElements.fromText(
          'I found the section engaging',
          '', INLINE_ELEMENTS),
      }),
    }),
    new LikertItem({
      prompt: new FeedbackPrompt({
        content: ContentElements.fromText(
          'I found the practice questions helped me to better learn the material',
          '', INLINE_ELEMENTS),
      }),
    }),
  ];
  const labels = [
    new LikertLabel({
      text: ContentElements.fromText('Strongly Disagree', guid(), TEXT_ELEMENTS),
      value: '1',
    }),
    new LikertLabel({
      text: ContentElements.fromText('Disagree', guid(), TEXT_ELEMENTS),
      value: '2',
    }),
    new LikertLabel({
      text: ContentElements.fromText('Neither Agree Nor Disagree', guid(), TEXT_ELEMENTS),
      value: '3',
    }),
    new LikertLabel({
      text: ContentElements.fromText('Agree', guid(), TEXT_ELEMENTS),
      value: '4',
    }),
    new LikertLabel({
      text: ContentElements.fromText('Strongly Agree', guid(), TEXT_ELEMENTS),
      value: '5',
    }),
  ];
  return new LikertSeries({
    prompt: new FeedbackPrompt({
      content: ContentElements.fromText(
        // tslint:disable-next-line:max-line-length
        'Here is an example question series for you to edit. This text is the question prompt, and the table below shows the series of questions the student should answer. You can directly edit the labels in the scale above the questions, as well as the text of the questions themselves. For example, you might say something like:\nPlease answer the following questions about your experience learning from the section on photosynthesis:',
        guid(), INLINE_ELEMENTS),
    }),
    scale: new LikertScale({
      scaleSize: '5',
      scaleCenter: '3',
      labels: Immutable.OrderedMap<string, LikertLabel>(labels.map(label => [label.guid, label])),
    }),
    items: Immutable.OrderedMap<string, LikertItem>(items.map(item => [item.guid, item])),
  });
}

export function createLikert() {
  const labels = [
    new LikertLabel({
      text: ContentElements.fromText('1', guid(), TEXT_ELEMENTS),
      value: '1',
    }),
    new LikertLabel({
      text: ContentElements.fromText('2', guid(), TEXT_ELEMENTS),
      value: '2',
    }),
    new LikertLabel({
      text: ContentElements.fromText('3', guid(), TEXT_ELEMENTS),
      value: '3',
    }),
    new LikertLabel({
      text: ContentElements.fromText('4', guid(), TEXT_ELEMENTS),
      value: '4',
    }),
    new LikertLabel({
      text: ContentElements.fromText('5', guid(), TEXT_ELEMENTS),
      value: '5',
    }),
  ];
  return new Likert({
    prompt: new FeedbackPrompt({
      content: ContentElements.fromText(
        // tslint:disable-next-line:max-line-length
        'Here is an example question prompt for you to edit. This single question prompt has its own scale and can support rich content such as images and videos, giving it more flexibility than a question series.\nYou can edit the scale size and each of the labels directly below.\nYour prompt might be something like:\nOn a scale from 1 to 5 with 5 being the highest, how engaging did you find the material in chapter 1?',
        guid(), INLINE_ELEMENTS),
    }),
    scale: new LikertScale({
      scaleSize: '5',
      scaleCenter: '3',
      labels: Immutable.OrderedMap<string, LikertLabel>(labels.map(label => [label.guid, label])),
    }),
  });
}

export function createFeedbackMultipleChoice() {
  const choices = [
    new FeedbackChoice({
      text: ContentElements.fromText(
        'I have a strong grasp on the topic', '', TEXT_ELEMENTS),
    }),
    new FeedbackChoice({
      text: ContentElements.fromText(
        'I have a decent understanding of the topic', '', TEXT_ELEMENTS),
    }),
    new FeedbackChoice({
      text: ContentElements.fromText(
        'I\'m not sure if I understand it well or not', '', TEXT_ELEMENTS),
    }),
    new FeedbackChoice({
      text: ContentElements.fromText(
        'I don\'t understand the topic very well', '', TEXT_ELEMENTS),
    }),
  ];
  return new FeedbackMultipleChoice({
    prompt: new FeedbackPrompt({
      content: ContentElements.fromText(
        // tslint:disable-next-line:max-line-length
        'Here is an example question prompt for you to edit. This question prompt can support rich content, such as images and videos. Your prompt might be something like: \nWhich of these choices do you feel best applies to you?',
        guid(), INLINE_ELEMENTS),
    }),
    choices: Immutable.OrderedMap<string, FeedbackChoice>(
      choices.map(choice => [choice.guid, choice])),
  });
}

export function createFeedbackOpenResponse() {
  return new FeedbackOpenResponse({
    prompt: new FeedbackPrompt({
      content: ContentElements.fromText(
        // tslint:disable-next-line:max-line-length
        'Here is an example question prompt for you to edit. This question prompt can support rich content, such as images and videos. Your prompt might be something like:\nWhat single change could we make to most improve the course?',
        guid(), INLINE_ELEMENTS),
    }),
  });
}
