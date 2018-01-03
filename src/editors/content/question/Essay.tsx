import * as contentTypes from 'data/contentTypes';
import { Question, QuestionProps, QuestionState } from './Question';

export interface EssayProps extends QuestionProps<contentTypes.Essay> {

}

export interface EssayState extends QuestionState {

}

/**
 * The content editor for HtmlContent.
 */
export class Essay
  extends Question<EssayProps, EssayState> {

  constructor(props) {
    super(props);
  }

  /** Implement required abstract method to set className */
  getClassName() {
    return 'essay';
  }

  renderDetails() {
    // no details
    return false;
  }

  renderAdditionalTabs() {
    // no additional tabs
    return false;
  }
}
