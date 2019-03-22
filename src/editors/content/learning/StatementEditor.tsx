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

import { styles } from './Theorem.styles';

export interface StatementEditorProps
  extends AbstractContentEditorProps<contentTypes.Statement> {
  onShowSidebar: () => void;

}

export interface StatementEditorState {

}

class StatementEditor
  extends AbstractContentEditor<contentTypes.Statement,
  StyledComponentProps<StatementEditorProps, typeof styles>, StatementEditorState> {

  constructor(props) {
    super(props);
  }

  renderSidebar() {
    return (
      <SidebarContent title="Statement" />
    );
  }

  renderToolbar() {
    return (
      <ToolbarGroup label="Statement" highlightColor={CONTENT_COLORS.Statement} />
    );
  }

  onStatementEdit(content, src) {
    this.props.onEdit(this.props.model.with({ content }), src);
  }

  renderMain(): JSX.Element {

    const { model, classes, className } = this.props;

    return (
      <div className={classNames([classes.statement, className])}>
        <div className={classNames([classes.statementLabel, className])}>Statement</div>
        <div className={classNames([classes.statementContent, className])}>
          <ContentContainer
            {...this.props}
            model={model.content}
            onEdit={this.onStatementEdit.bind(this)}
          />
        </div>
      </div>
    );
  }

}

const StyledStatementEditor = withStyles<StatementEditorProps>(styles)(StatementEditor);
export default StyledStatementEditor;
