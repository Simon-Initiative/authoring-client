import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import {
  ContentContainer, ContentContainerProps,
} from 'editors/content/container/ContentContainer';
import { withStyles, classNames } from 'styles/jss';
import { ToolbarButton } from 'components/toolbar/ToolbarButton';
import { ToolbarDropdown } from 'components/toolbar/ToolbarDropdown';
import { RenderContext } from 'editors/content/common/AbstractContentEditor';
import { InlineStyles } from 'data/content/learning/contiguous';
import { Maybe } from 'tsmonad';
import { TextSelection } from 'types/active';
import { connect } from 'react-redux';
import { Editor, Data } from 'slate';

import { styles } from 'editors/content/container/ToolbarContentContainer.styles';
import { State } from 'reducers/index';
import { CourseModel } from 'data/models/course';

export interface ToolbarContentContainerProps extends ContentContainerProps {
  className?: string;
  editor: Maybe<Editor>;
  course: CourseModel;
}

export interface ToolbarContentContainerState {
  textSelection: Maybe<TextSelection>;
}

/**
 * ToolbarContentContainer React Component
 */
class ToolbarContentContainer
  extends React.PureComponent<StyledComponentProps<ToolbarContentContainerProps, typeof styles>,
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
    const { classes, editMode, course } = this.props;
    const { textSelection } = this.state;

    const selection = textSelection.caseOf({
      just: s => s,
      nothing: () => null,
    });

    const formatEnabled = editMode && selection && !selection.isCollapsed();

    return (
      <div className={classes.miniToolbar}>
        <ToolbarButton
          onClick={
            () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Bold))
          }
          tooltip="Bold"
          disabled={!formatEnabled}>
          <i className={'fa fa-bold'} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => this.props.editor.lift(e => e.toggleMark(InlineStyles.Italic))}
          tooltip="Italic"
          disabled={!formatEnabled}>
          <i className={'fa fa-italic'} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => this.props.editor.lift(e => e.toggleMark(InlineStyles.Strikethrough))}
          tooltip="Strikethrough"
          disabled={!formatEnabled}>
          <i className={'fa fa-strikethrough'} />
        </ToolbarButton>
        <ToolbarButton
          onClick={
            () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Highlight))
          }
          tooltip="Highlight"
          disabled={!formatEnabled}>
          <i className={'fas fa-pencil-alt'} />
        </ToolbarButton>
        <ToolbarButton
          onClick={
            () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Superscript))
          }
          tooltip="Superscript"
          disabled={!formatEnabled}>
          <i className={'fa fa-superscript'} />
        </ToolbarButton>
        <ToolbarButton
          onClick={
            () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Subscript))
          }
          tooltip="Subscript"
          disabled={!formatEnabled}>
          <i className={'fa fa-subscript'} />
        </ToolbarButton>

        <div className="flex-spacer" />

        <ToolbarDropdown
          hideArrow
          label={<i className={classNames(['fa fa-ellipsis-v', classes.moreLabel])} />} >
          <button className="dropdown-item"
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Var))
            }
            disabled={!formatEnabled}>
            <i className="fa fa-code" /> Code
          </button>
          <button className="dropdown-item"
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Term))
            }
            disabled={!formatEnabled}>
            <i className="fa fa-book" /> Term
          </button>
          <button className="dropdown-item"
            onClick={
              () => this.props.editor.lift((e) => {
                e.toggleMark({
                  type: InlineStyles.Foreign,
                  data: Data.create({ lang: course.language.valueOr(null) }),
                });
              })
            }
            disabled={!formatEnabled}>
            <i className="fa fa-globe" /> Foreign
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

const StyledToolbarContentContainer = withStyles<ToolbarContentContainerProps>(styles)
  (ToolbarContentContainer);

const mapStateToProps = (state: State, ownProps) => {
  return {
    editor: state.activeContext.editor,
    course: state.course,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
  };
};

const ConnectedEditor = connect(mapStateToProps, mapDispatchToProps)(StyledToolbarContentContainer);

export { ConnectedEditor as ToolbarContentContainer };


