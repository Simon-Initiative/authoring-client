import * as React from 'react';
import { AssessmentType, LegacyTypes } from 'data/types';
import { ToolbarButtonMenuDivider } from 'components/toolbar/ToolbarButtonMenu';
import { Node } from 'data/models';
import {
  createMultipleChoiceQuestion, createOrdering, createEssay, createShortAnswer,
  createMultipart, createDragDrop, createImageHotspot, createEmbeddedPool,
  createLikertSeries, createLikert, createFeedbackMultipleChoice,
  createFeedbackOpenResponse, createSupportingContent,
} from './questionFactories';

type AddOption =
  // Formative/Summative Assessment
  'MultipleChoiceSingle' |
  'MultipleChoiceMultiple' |
  'Ordering' |
  'ShortAnswer' |
  'Multipart' |
  'DragAndDrop' |
  'ImageHotspot' |
  'SupportingContent' |
  // Summative only
  'Essay' |
  'EmbeddedPool' |
  // Feedback
  'LikertSeries' |
  'Likert' |
  'FeedbackMultipleChoice' |
  'FeedbackOpenResponse' |
  // Misc
  'Separator';

const FORMATIVE_OPTIONS: AddOption[] = [
  'MultipleChoiceSingle',
  'MultipleChoiceMultiple',
  'Ordering',
  'ShortAnswer',
  'Multipart',
];

const SUMMATIVE_OPTIONS: AddOption[] = [
  'MultipleChoiceSingle',
  'MultipleChoiceMultiple',
  'Ordering',
  'ShortAnswer',
  'Essay',
  'Multipart',
  'DragAndDrop',
  'ImageHotspot',
  'Separator',
];

const QUESTION_POOL_OPTIONS: AddOption[] = SUMMATIVE_OPTIONS;

const FEEDBACK_OPTIONS: AddOption[] = [
  'LikertSeries',
  'Likert',
  'FeedbackMultipleChoice',
  'FeedbackOpenResponse',
];

type ToJSXElement = (onQuestionAdd: (question: Node) => void) => JSX.Element;
const RenderOptions: { [key in AddOption]?: ToJSXElement } = {
  MultipleChoiceSingle:
    button(createMultipleChoiceQuestion.bind(null, 'single'), 'Multiple choice'),
  MultipleChoiceMultiple:
    button(createMultipleChoiceQuestion.bind(null, 'multiple'), 'Check all that apply'),
  Ordering: button(createOrdering, 'Ordering'),
  ShortAnswer: button(createShortAnswer, 'Short Answer'),
  Essay: button(createEssay, 'Essay'),
  Multipart: button(createMultipart, 'Input (Text, Numeric, Dropdown)'),
  DragAndDrop: button(createDragDrop, 'Drag and Drop'),
  ImageHotspot: button(createImageHotspot, 'Image Hotspot'),
  EmbeddedPool: button(createEmbeddedPool, 'Embedded Pool'),
  SupportingContent: button(createSupportingContent, 'Supporting Content'),
  LikertSeries: button(createLikertSeries, 'Question Series with Scale'),
  Likert: button(createLikert, 'Question with Scale'),
  FeedbackMultipleChoice: button(createFeedbackMultipleChoice, 'Multiple Choice Question'),
  FeedbackOpenResponse: button(createFeedbackOpenResponse, 'Open-Ended Question'),
  Separator: () => <ToolbarButtonMenuDivider />,
};


export interface AddQuestionProps {
  editMode: boolean;
  assessmentType: AssessmentType;
  onQuestionAdd: (question: Node) => void;
  isBranching?: boolean;
}

export interface AddQuestionState { }

/**
 * Reusable component for adding new questions to a question
 * container (pool, assessment, etc)
 */
export class AddQuestion extends React.Component<AddQuestionProps, AddQuestionState> {

  isBranching = this.props.isBranching || false;

  render() {
    const { assessmentType, onQuestionAdd } = this.props;

    let options: AddOption[];

    switch (assessmentType) {
      // Formative
      case LegacyTypes.inline:
        options = FORMATIVE_OPTIONS.concat(
          this.isBranching
            ? []
            : ['Separator', 'SupportingContent']);
        break;
      // Summative. Concatening EmbeddedPool here rather than adding it to the
      // SUMMATIVE_OPTIONS just to maintain the option order than was originally set up
      case LegacyTypes.assessment2:
        options = SUMMATIVE_OPTIONS.concat(
          this.isBranching
            ? ['EmbeddedPool']
            : ['SupportingContent', 'EmbeddedPool']);
        break;
      // Pool
      case LegacyTypes.assessment2_pool:
        options = QUESTION_POOL_OPTIONS;
        break;
      // Feedback
      case LegacyTypes.feedback:
        options = FEEDBACK_OPTIONS;
        break;
    }

    return (
      <React.Fragment>
        {options.map(option => RenderOptions[option](onQuestionAdd))}
      </React.Fragment>
    );
  }
}


// HELPERS
function onAdd(question: Node) {
  return (onQuestionAdd: (_: Node) => void) =>
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      onQuestionAdd(question);
    };
}

function button(factory: () => Node, label: string): ToJSXElement {
  return (onQuestionAdd: (_: Node) => void) =>
    <a onClick={onAdd(factory())(onQuestionAdd)} className="dropdown-item">{label}</a>;
}
