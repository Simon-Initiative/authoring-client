import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, classNames } from 'styles/jss';
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

export interface InquiryEditorProps
  extends AbstractContentEditorProps<contentTypes.Inquiry> {
  onShowSidebar: () => void;

}

export interface InquiryEditorState {

}

@injectSheet(styles)
export default class InquiryEditor
  extends AbstractContentEditor<contentTypes.Inquiry,
  StyledComponentProps<InquiryEditorProps>, InquiryEditorState> {

  constructor(props) {
    super(props);
  }

  renderSidebar() {
    return (
      <SidebarContent title="Inquiry" />
    );
  }

  renderToolbar() {
    return (
      <ToolbarGroup label="Inquiry" highlightColor={CONTENT_COLORS.Inquiry} />
    );
  }

  onQuestionEdit(elements, src) {

    const items = elements
      .content
      .toArray()
      .map(e => [e.guid, e]);

    const model = this.props.model.with({
      questions: Immutable.OrderedMap
        <string, contentTypes.InquiryQuestion>(items),
    });

    this.props.onEdit(model, src);
  }

  onAddQuestion() {

    const question = new contentTypes.InquiryQuestion();
    const model = this.props.model.with({
      questions: this.props.model.questions.set(question.guid, question),
    });

    this.props.onEdit(model, question);
  }

  renderMain(): JSX.Element {

    const { model, classes, className } = this.props;


    const questions = new ContentElements().with({
      content: model.questions,
    });

    const questionEditors = model.questions.size > 0
      ? <ContentContainer
        {...this.props}
        model={questions}
        onEdit={this.onQuestionEdit.bind(this)}
      />
      : null;

    return (
      <div className={classNames([classes.inquiry, className])}>
        <button type="button"
          disabled={!this.props.editMode}
          onClick={this.onAddQuestion.bind(this)}
          className="btn btn-link">+ Add question</button>
        {questionEditors}
      </div>
    );
  }

}
