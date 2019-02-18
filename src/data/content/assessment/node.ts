import { Question } from './question';
import { Content } from './content';
import { Selection } from './selection';
import { Unsupported } from '../unsupported';
import { FeedbackQuestion } from '../feedback/feedback_questions';

export type FeedbackQuestionNode = FeedbackQuestion;

export type Node =
  AssessmentNode |
  FeedbackQuestionNode;

export type AssessmentNode =
  Question |
  Content |
  Selection |
  Unsupported;
