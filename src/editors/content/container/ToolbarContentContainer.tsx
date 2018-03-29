import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { StyledComponentProps } from 'types/component';
import { ContentContainer, ContentContainerProps } from './ContentContainer';
import { injectSheet, classNames } from 'styles/jss';
import { ToolbarButton } from 'components/toolbar/ToolbarButton';
import { ToolbarDropdown } from 'components/toolbar/ToolbarDropdown';
import { RenderContext } from 'editors/content/common/AbstractContentEditor';
import { InlineStyles } from 'data/content/learning/contiguous';
import { Maybe } from 'tsmonad';
import { TextSelection } from 'types/active';

import styles from './ToolbarContentContainer.style';

export interface ToolbarContentContainerProps extends ContentContainerProps {
  className?: string;
}

export interface ToolbarContentContainerState {
  textSelection: Maybe<TextSelection>;
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

    this.state = {
      textSelection: Maybe.nothing(),
    };

    this.onEdit = this.onEdit.bind(this);
    this.onFormatEdit = this.onFormatEdit.bind(this);
    this.onFocus = this.onFocus.bind(this);
  }

  onEdit(model, sourceObject) {
    const { onEdit } = this.props;

    onEdit(model.with({ content: model.content }), sourceObject);
  }

  onFormatEdit(childModel) {
    const { onEdit, model } = this.props;
    onEdit(model.with({ content: model.content.set(childModel.guid, childModel) }), childModel);
  }

  onFocus(child, parent, textSelection) {
    this.setState({
      textSelection,
    });
  }

  renderMiniToolbar() {
    const { classes, model, editMode } = this.props;
    const { textSelection } = this.state;

    const text = model.content.first() as contentTypes.ContiguousText;

    const selection = textSelection.caseOf({
      just: s => s,
      nothing: () => null,
    });

    const formatEnabled = editMode && selection && !selection.isCollapsed();

    return (
      <div className={classes.miniToolbar}>
        <ToolbarButton
            onClick={() => {
              this.onFormatEdit(text.toggleStyle(InlineStyles.Bold, selection));
            }}
            tooltip="Bold"
            disabled={!formatEnabled}>
          <i className={'fa fa-bold'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => {
              this.onFormatEdit(text.toggleStyle(InlineStyles.Italic, selection));
            }}
            tooltip="Italic"
            disabled={!formatEnabled}>
          <i className={'fa fa-italic'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => {
              this.onFormatEdit(text.toggleStyle(InlineStyles.Strikethrough, selection));
            }}
            tooltip="Strikethrough"
            disabled={!formatEnabled}>
          <i className={'fa fa-strikethrough'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => {
              this.onFormatEdit(text.toggleStyle(InlineStyles.Highlight, selection));
            }}
            tooltip="Highlight"
            disabled={!formatEnabled}>
          <i className={'fa fa-pencil'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => {
              this.onFormatEdit(text.toggleStyle(InlineStyles.Superscript, selection));
            }}
            tooltip="Superscript"
            disabled={!formatEnabled}>
          <i className={'fa fa-superscript'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => {
              this.onFormatEdit(text.toggleStyle(InlineStyles.Subscript, selection));
            }}
            tooltip="Subscript"
            disabled={!formatEnabled}>
          <i className={'fa fa-subscript'}/>
        </ToolbarButton>

        <div className="flex-spacer" />

        <ToolbarDropdown
            hideArrow
            label={<i className={classNames(['fa fa-ellipsis-v', classes.moreLabel])}/>} >
          <button className="dropdown-item"
            onClick={() => {
              this.onFormatEdit(text.toggleStyle(InlineStyles.Code, selection));
            }}
            disabled={!formatEnabled}>
            <i className="fa fa-code"/> Code
          </button>
          <button className="dropdown-item"
            onClick={() => {
              this.onFormatEdit(text.toggleStyle(InlineStyles.Term, selection));
            }}
            disabled={!formatEnabled}>
            <i className="fa fa-book"/> Term
          </button>
          <button className="dropdown-item"
            onClick={() => {
              this.onFormatEdit(text.toggleStyle(InlineStyles.Foreign, selection));
            }}
            disabled={!formatEnabled}>
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
            onFocus={this.onFocus}
            renderContext={RenderContext.MainEditor}
            onEdit={this.onEdit}
            hideContentLabel
            activeContentGuid={model.guid} />
        </div>
      </div>
    );
  }
}
