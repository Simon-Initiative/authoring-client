import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { withStyles, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';

import { ContentElements } from 'data/content/common/elements';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';

import { styles } from './Inquiry.styles';

export interface InquiryQuestionEditorProps
  extends AbstractContentEditorProps<contentTypes.InquiryQuestion> {
  onShowSidebar: () => void;

}

export interface InquiryQuestionEditorState {

}

class InquiryQuestionEditor
  extends AbstractContentEditor<contentTypes.InquiryQuestion,
  StyledComponentProps<InquiryQuestionEditorProps, typeof styles>, InquiryQuestionEditorState> {

  constructor(props) {
    super(props);
  }

  renderSidebar() {
    return (
      <SidebarContent title="Question" />
    );
  }

  renderToolbar() {
    return (
      <ToolbarGroup label="Question" highlightColor={CONTENT_COLORS.InquiryQuestion} />
    );
  }

  onAnswerEdit(elements, src) {

    const items = elements
      .content
      .toArray()
      .map(e => [e.guid, e]);

    const model = this.props.model.with({
      answers: Immutable.OrderedMap
        <string, contentTypes.Answer>(items),
    });

    this.props.onEdit(model, src);
  }

  onAddAnswer() {

    const answer = new contentTypes.Answer();
    const model = this.props.model.with({
      answers: this.props.model.answers.set(answer.guid, answer),
    });

    this.props.onEdit(model, answer);
  }


  onInquiryQuestionEdit(content, src) {
    this.props.onEdit(this.props.model.with({ content }), src);
  }

  renderMain(): JSX.Element {

    const { model, classes, className } = this.props;


    const answers = new ContentElements().with({
      content: model.answers,
    });

    const answerEditors = model.answers.size > 0
      ? <ContentContainer
        {...this.props}
        model={answers}
        onEdit={this.onAnswerEdit.bind(this)}
      />
      : null;

    return (
      <div className={classNames([classes.question, className])}>
        <div className={classNames([classes.questionLabel, className])}>Question</div>
        <div className={classNames([classes.questionContent, className])}>
          <ContentContainer
            {...this.props}
            model={model.content}
            onEdit={this.onInquiryQuestionEdit.bind(this)}
          />
        </div>
        <div className={classNames([classes.questionAnswers, className])}>
          <button type="button"
            disabled={!this.props.editMode}
            onClick={this.onAddAnswer.bind(this)}
            className="btn btn-link">+ Add answer</button>
          {answerEditors}
        </div>
      </div>
    );
  }

}

const StyledInquiryQuestionEditor = withStyles<InquiryQuestionEditorProps>(styles)
  (InquiryQuestionEditor);
export default StyledInquiryQuestionEditor;
