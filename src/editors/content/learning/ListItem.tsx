import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';


import styles from './List.styles';

export interface ListItemProps
  extends AbstractContentEditorProps<contentTypes.Li> {
  onShowSidebar: () => void;
  label: any;
}

export interface ListItemState {

}

/**
 * The content editor for contiguous text.
 */
@injectSheet(styles)
export default class ListItem
    extends AbstractContentEditor<contentTypes.Li,
    StyledComponentProps<ListItemProps>, ListItemState> {
  selectionState: any;

  constructor(props) {
    super(props);
  }

  renderSidebar() {
    return null;
  }

  renderToolbar() {
    return (
      <ToolbarGroup label="List Item" columns={8} highlightColor={CONTENT_COLORS.Li}>
      </ToolbarGroup>
    );
  }

  onEdit(content, src) {
    this.props.onEdit(this.props.model.with({ content }), src);
  }

  renderMain() : JSX.Element {

    const { className, classes, label } = this.props;

    return (
      <div className={classNames([classes.listItem, className])}>
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

