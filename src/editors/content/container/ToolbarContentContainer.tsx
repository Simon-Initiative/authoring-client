import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { StyledComponentProps } from 'types/component';
import { ContentContainer, ContentContainerProps } from './ContentContainer';
import { injectSheet, classNames } from 'styles/jss';
import { ToolbarButton } from 'components/toolbar/ToolbarButton';
import { ToolbarDropdown } from 'components/toolbar/ToolbarDropdown';
import { RenderContext } from 'editors/content/common/AbstractContentEditor';
import { InlineStyles } from 'data/content/learning/contiguous';

import styles from './ToolbarContentContainer.style';

export interface ToolbarContentContainerProps extends ContentContainerProps {
  className?: string;
}

export interface ToolbarContentContainerState {

}

/**
 * ToolbarContentContainer React Component
 */
@injectSheet<ToolbarContentContainerProps>(styles)
export class ToolbarContentContainer
    extends React.PureComponent<StyledComponentProps<ToolbarContentContainerProps>,
    ToolbarContentContainerState> {

  constructor(props) {
    super(props);
  }

  onEdit(childModel) {
    this.onChildEdit(childModel, childModel);
  }

  onChildEdit(childModel, sourceObject) {
    const { onEdit, model } = this.props;
    onEdit(model.with({ content: model.content.set(childModel.guid, childModel) }), sourceObject);
  }

  renderMiniToolbar() {
    const { classes, model, editMode } = this.props;

    const text = model.content.first() as contentTypes.ContiguousText;

    const bareTextSelected = text.selection.isCollapsed()
      ? false
      : !text.selectionOverlapsEntity();

    const rangeEntitiesEnabled = editMode && bareTextSelected;

    return (
      <div className={classes.miniToolbar}>
        <ToolbarButton
            onClick={() => {
              this.onEdit(text.toggleStyle(InlineStyles.Bold));
            }}
            tooltip="Bold"
            disabled={!rangeEntitiesEnabled}>
          <i className={'fa fa-bold'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => {
              this.onEdit(text.toggleStyle(InlineStyles.Italic));
            }}
            tooltip="Italic"
            disabled={!rangeEntitiesEnabled}>
          <i className={'fa fa-italic'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => {
              this.onEdit(text.toggleStyle(InlineStyles.Strikethrough));
            }}
            tooltip="Strikethrough"
            disabled={!rangeEntitiesEnabled}>
          <i className={'fa fa-strikethrough'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => {
              this.onEdit(text.toggleStyle(InlineStyles.Highlight));
            }}
            tooltip="Highlight"
            disabled={!rangeEntitiesEnabled}>
          <i className={'fa fa-pencil'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => {
              this.onEdit(text.toggleStyle(InlineStyles.Superscript));
            }}
            tooltip="Superscript"
            disabled={!rangeEntitiesEnabled}>
          <i className={'fa fa-superscript'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => {
              this.onEdit(text.toggleStyle(InlineStyles.Subscript));
            }}
            tooltip="Subscript"
            disabled={!rangeEntitiesEnabled}>
          <i className={'fa fa-subscript'}/>
        </ToolbarButton>

        <div className="flex-spacer" />

        <ToolbarDropdown
            hideArrow
            label={<i className={classNames(['fa fa-ellipsis-v', classes.moreLabel])}/>} >
          <button className="dropdown-item"
            onClick={() => {
              this.onEdit(text.toggleStyle(InlineStyles.Code));
            }}
            disabled={!rangeEntitiesEnabled}>
            <i className="fa fa-code"/> Code
          </button>
          <button className="dropdown-item"
            onClick={() => {
              this.onEdit(text.toggleStyle(InlineStyles.Term));
            }}
            disabled={!rangeEntitiesEnabled}>
            <i className="fa fa-book"/> Term
          </button>
          <button className="dropdown-item"
            onClick={() => {
              this.onEdit(text.toggleStyle(InlineStyles.Foreign));
            }}
            disabled={!rangeEntitiesEnabled}>
            <i className="fa fa-globe"/> Foreign
          </button>
        </ToolbarDropdown>
      </div>
    );
  }

  render() {
    const { className, classes, model } = this.props;

    return (
      <div className={classNames([classes.toolbarContentContainer, className])}>
        {this.renderMiniToolbar()}
        <div className={classes.content}>
          <ContentContainer
            {...this.props}
            renderContext={RenderContext.MainEditor}
            activeContentGuid={model.guid} />
        </div>
      </div>
    );
  }
}
