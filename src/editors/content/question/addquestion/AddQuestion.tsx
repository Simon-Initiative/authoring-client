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
import { CombinationsMap, PermutationsMap } from 'types/combinations';
import { caseOf } from 'utils/utils';

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
  'DragAndDrop',
  'ImageHotspot',
];

const SUMMATIVE_OPTIONS: AddOption[] = [
  'MultipleChoiceSingle',
  'MultipleChoiceMultiple',
  'Ordering',
  'ShortAnswer',
  'Essay',
  'Multipart',
  'Separator',
];

const QUESTION_POOL_OPTIONS: AddOption[] = SUMMATIVE_OPTIONS;

const FEEDBACK_OPTIONS: AddOption[] = [
  'LikertSeries',
  'Likert',
  'FeedbackMultipleChoice',
  'FeedbackOpenResponse',
];

export interface AddQuestionProps {
  editMode: boolean;
  assessmentType: AssessmentType;
  isBranching?: boolean;
  onQuestionAdd: (question: Node) => void;
  onGetChoiceCombinations: (comboNum: number) => CombinationsMap;
  onGetChoicePermutations: (comboNum: number) => PermutationsMap;
}

export interface AddQuestionState { }

/**
 * Reusable component for adding new questions to a question
 * container (pool, assessment, etc)
 */
export class AddQuestion extends React.Component<AddQuestionProps, AddQuestionState> {

  isBranching = this.props.isBranching || false;

  render() {
    const {
      assessmentType, onQuestionAdd, onGetChoiceCombinations, onGetChoicePermutations,
    } = this.props;

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
        {options.map(option => caseOf<JSX.Element>(option)({
          MultipleChoiceSingle: (
            <a onClick={() => onQuestionAdd(
              createMultipleChoiceQuestion('single', onGetChoiceCombinations),
            )} className="dropdown-item">Multiple choice</a>
          ),
          MultipleChoiceMultiple: (
            <a onClick={() => onQuestionAdd(
              createMultipleChoiceQuestion('multiple', onGetChoiceCombinations),
            )} className="dropdown-item">Check all that apply</a>
          ),
          Ordering: (
            <a onClick={() => onQuestionAdd(createOrdering(onGetChoicePermutations))}
              className="dropdown-item">Ordering</a>
          ),
          ShortAnswer: (
            <a onClick={() => onQuestionAdd(createShortAnswer())}
              className="dropdown-item">Short Answer</a>
          ),
          Essay: (
            <a onClick={() => onQuestionAdd(createEssay())}
              className="dropdown-item">Essay</a>
          ),
          Multipart: (
            <a onClick={() => onQuestionAdd(createMultipart())}
              className="dropdown-item">Input (Text, Numeric, Dropdown)</a>
          ),
          DragAndDrop: (
            <a onClick={() => onQuestionAdd(createDragDrop())}
              className="dropdown-item">Drag and Drop</a>
          ),
          ImageHotspot: (
            <a onClick={() => onQuestionAdd(createImageHotspot())}
              className="dropdown-item">Image Hotspot</a>
          ),
          EmbeddedPool: (
            <a onClick={() => onQuestionAdd(createEmbeddedPool())}
              className="dropdown-item">Embedded Pool</a>
          ),
          SupportingContent: (
            <a onClick={() => onQuestionAdd(createSupportingContent())}
              className="dropdown-item">Supporting Content</a>
          ),
          LikertSeries: (
            <a onClick={() => onQuestionAdd(createLikertSeries())}
              className="dropdown-item">Question Series with Scale</a>
          ),
          Likert: (
            <a onClick={() => onQuestionAdd(createLikert())}
              className="dropdown-item">Question with Scale</a>
          ),
          FeedbackMultipleChoice: (
            <a onClick={() => onQuestionAdd(createFeedbackMultipleChoice())}
              className="dropdown-item">Multiple Choice Question</a>
          ),
          FeedbackOpenResponse: (
            <a onClick={() => onQuestionAdd(createFeedbackOpenResponse())}
              className="dropdown-item">Open-Ended Question</a>
          ),
          Separator: () => <ToolbarButtonMenuDivider />,
        })(undefined))}
      </React.Fragment>
    );
  }
}
