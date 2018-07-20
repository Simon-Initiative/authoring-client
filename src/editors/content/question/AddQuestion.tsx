import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import guid from '../../../utils/guid';
import { ContentElements } from 'data/content/common/elements';
import { QUESTION_BODY_ELEMENTS, ALT_FLOW_ELEMENTS } from 'data/content/assessment/types';
import { DndLayout } from 'data/content/assessment/dragdrop/dnd_layout';
import { InitiatorGroup } from 'data/content/assessment/dragdrop/initiator_group';
import { TargetGroup } from 'data/content/assessment/dragdrop/target_group';
import { Maybe } from 'tsmonad';
import { ContentRow } from 'data/content/assessment/dragdrop/content_row';
import { DndText } from 'data/content/assessment/dragdrop/dnd_text';
import { Target } from 'data/content/assessment/dragdrop/target';
import { Initiator } from 'data/content/assessment/dragdrop/initiator';
import {
  getTargetsFromLayout, updateItemPartsFromTargets,
} from 'editors/content/learning/dynadragdrop/utils';

const defaultInputBody = () => ContentElements.fromText
  ('Add numeric, text, or dropdown components', '', QUESTION_BODY_ELEMENTS);

export interface AddQuestion {

}

export interface AddQuestionProps {

  // Whether or not editing is allowed
  editMode: boolean;

  // True if this is being used in the context of a summative
  // assessment
  isSummative: boolean;

  // Callback to execute when a new question has been added
  onQuestionAdd: (question: contentTypes.Question) => void;
}

export interface AddQuestionState {

}


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


/**
 * Reusable component for adding new questions to a question
 * container (pool, assessment, etc)
 */
export class AddQuestion
  extends React.Component<AddQuestionProps, AddQuestionState> {

  constructor(props) {
    super(props);

    this.onAddMultipleChoice = this.onAddMultipleChoice.bind(this);
    this.onAddEssay = this.onAddEssay.bind(this);
    this.onAddMultipart = this.onAddMultipart.bind(this);
    this.onAddDragDrop = this.onAddDragDrop.bind(this);
    this.onAddOrdering = this.onAddOrdering.bind(this);
    this.onAddShortAnswer = this.onAddShortAnswer.bind(this);
    this.onAddImageHotspot = this.onAddImageHotspot.bind(this);
  }

  onAddMultipleChoice(select: string) {
    this.props.onQuestionAdd(createMultipleChoiceQuestion(select));
  }

  onAddOrdering() {
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
    question = question.with({ parts: question.parts.set(part.guid, part) });

    this.props.onQuestionAdd(question);
  }

  onAddShortAnswer() {

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

    const question = new contentTypes.Question()
      .with({
        body: contentTypes.Question.emptyBody(),
        items: Immutable.OrderedMap<string, contentTypes.QuestionItem>()
          .set(item.guid, item),
        parts: Immutable.OrderedMap<string, contentTypes.Part>()
          .set(part.guid, part),
      });

    this.props.onQuestionAdd(question);
  }

  onAddEssay() {

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

    const question = new contentTypes.Question()
      .with({
        body: contentTypes.Question.emptyBody(),
        items: Immutable.OrderedMap<string, contentTypes.QuestionItem>()
          .set(item.guid, item),
        parts: Immutable.OrderedMap<string, contentTypes.Part>()
          .set(part.guid, part),
      });

    this.props.onQuestionAdd(question);
  }

  onAddMultipart() {
    const q = new contentTypes.Question()
      .with({
        body: defaultInputBody(),
      });
    this.props.onQuestionAdd(q);
  }

  onAddDragDrop() {
    const inputAssessmentId = guid();

    const newDndLayout = new DndLayout().with({
      initiatorGroup: new InitiatorGroup().with({
        initiators: Immutable.List<Initiator>().push(new Initiator().with({
          assessmentId: inputAssessmentId,
          text: 'New Choice',
        })),
      }),
      targetGroup: new TargetGroup().with({
        rows: [new ContentRow(), new ContentRow(), new ContentRow()].reduce(
          (accRows, newRow) => accRows.push(newRow.with({
            cols: [new Target(), new DndText(), new DndText()].reduce(
              (accCol, newCol) => accCol.push(
                newCol.contentType === 'DndText'
                  ? newCol.with({
                    text: 'Enter text or set as drop target',
                  })
                  : newCol.with({
                    assessmentId: guid(),
                  })),
              Immutable.List<DndText | Target>(),
            ),
          })),
          Immutable.List<ContentRow>(),
        ),
      }),
    });

    const newCustom = new contentTypes.Custom().with({
      id: guid(),
      layout: '',
      layoutData: Maybe.just<DndLayout>(newDndLayout),
      src: 'DynaDrop.js',
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
      id: inputAssessmentId,
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
      input: inputAssessmentId,
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

    const q = new contentTypes.Question()
      .with({
        id: guid(),
        body: newBody,
        items,
        parts,
      });

    this.props.onQuestionAdd(q);
  }

  onAddImageHotspot() {
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
    question = question.with({ parts: question.parts.set(part.guid, part) });

    this.props.onQuestionAdd(question);
  }

  render() {

    const essayOrNot = this.props.isSummative
      ? <a onClick={this.onAddEssay} className="dropdown-item">Essay</a>
      : null;

    const dynaDragDropOrNot = !this.props.isSummative
      ? <a onClick={this.onAddDragDrop} className="dropdown-item">Drag and Drop</a>
      : null;

    const imageHotSpotOrNot = !this.props.isSummative
      ? <a onClick={this.onAddImageHotspot}
          className="dropdown-item">Image Hotspot</a>
      : null;

    return (

      <React.Fragment>
        <a onClick={(e) => { e.preventDefault(); this.onAddMultipleChoice('single'); }}
          className="dropdown-item">Multiple choice</a>
        <a onClick={(e) => { e.preventDefault(); this.onAddMultipleChoice('multiple'); }}
          className="dropdown-item">Check all that apply</a>
        <a onClick={this.onAddOrdering} className="dropdown-item">Ordering</a>
        <a onClick={this.onAddShortAnswer} className="dropdown-item">Short answer</a>
        {essayOrNot}
        <a onClick={this.onAddMultipart}
          className="dropdown-item">Input (Text, Numeric, Dropdown)</a>

        {dynaDragDropOrNot}
        {imageHotSpotOrNot}

      </React.Fragment>

    );

  }

}
