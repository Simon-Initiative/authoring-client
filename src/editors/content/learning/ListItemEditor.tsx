import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { withStyles, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';

import { styles } from './List.styles';

export interface ListItemEditorProps
  extends AbstractContentEditorProps<contentTypes.Li> {
  onShowSidebar: () => void;
  label: any;
}

export interface ListItemEditorState {

}

type StyledListItemEditorProps = StyledComponentProps<ListItemEditorProps, typeof styles>;

/**
 * The content editor for list items.
 */
class ListItemEditor
    extends AbstractContentEditor<contentTypes.Li, StyledListItemEditorProps, ListItemEditorState> {
  selectionState: any;

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps: StyledListItemEditorProps, nextState: ListItemEditorState) {
    return super.shouldComponentUpdate(nextProps, nextState)
      || this.props.label !== nextProps.label;
  }

  renderSidebar() {
    return <SidebarContent title="List Item" />;
  }

  renderToolbar() {
    return <ToolbarGroup label="List Item" highlightColor={CONTENT_COLORS.Li}/>;
  }

  onEdit(content, src) {
    this.props.onEdit(this.props.model.with({ content }), src);
  }

  renderMain() : JSX.Element {

    const { className, classes, label } = this.props;

    return (
      <div className={classNames(['ListItemEditor', classes.listItem, className])}>
        <div className={classNames([classes.listItemLabel, className])}>{label}</div>
        <div className={classNames([classes.listItemContent, className])}>
          <ContentContainer
            {...this.props}
            model={this.props.model.content}
            onEdit={this.onEdit.bind(this)}
          />
        </div>
      </div>);
  }

}


const StyledListItemEditor = withStyles<ListItemEditorProps>(styles)(ListItemEditor);
export default StyledListItemEditor;
