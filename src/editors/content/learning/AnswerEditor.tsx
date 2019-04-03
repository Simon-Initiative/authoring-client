import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { withStyles, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';

import { styles } from './Inquiry.styles';

export interface AnswerEditorProps
  extends AbstractContentEditorProps<contentTypes.Answer> {
  onShowSidebar: () => void;

}

export interface AnswerEditorState {

}

class AnswerEditor
  extends AbstractContentEditor<contentTypes.Answer,
  StyledComponentProps<AnswerEditorProps, typeof styles>, AnswerEditorState> {

  constructor(props) {
    super(props);
  }

  renderSidebar() {
    return (
      <SidebarContent title="Answer" />
    );
  }

  renderToolbar() {
    return (
      <ToolbarGroup label="Answer" highlightColor={CONTENT_COLORS.Answer} />
    );
  }

  onAnswerEdit(content, src) {
    this.props.onEdit(this.props.model.with({ content }), src);
  }

  renderMain(): JSX.Element {

    const { model, classes, className } = this.props;

    return (
      <div className={classNames([classes.answer, className])}>
        <div className={classNames([classes.answerLabel, className])}>Answer</div>
        <div className={classNames([classes.answerContent, className])}>
          <ContentContainer
            {...this.props}
            model={model.content}
            onEdit={this.onAnswerEdit.bind(this)}
          />
        </div>
      </div>
    );
  }

}

const StyledAnswerEditor = withStyles<AnswerEditorProps>(styles)(AnswerEditor);
export default StyledAnswerEditor;
