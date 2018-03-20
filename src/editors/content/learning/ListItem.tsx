import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps, RenderContext,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { Select } from '../common/controls';
import { Maybe } from 'tsmonad';

import styles from './List.styles';

export interface ListItemProps
  extends AbstractContentEditorProps<contentTypes.Li> {
  onShowSidebar: () => void;
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
    return null;
  }

  onEdit(content, src) {
    this.props.onEdit(this.props.model.with({ content }), src);
  }

  renderMain() : JSX.Element {

    const { className, classes, model, parent, editMode } = this.props;

    return (
      <div className={classNames([classes.list, className])}>
        <ContentContainer
          {...this.props}
          model={this.props.model.content}
          onEdit={this.onEdit}
        />
      </div>);
  }

}

