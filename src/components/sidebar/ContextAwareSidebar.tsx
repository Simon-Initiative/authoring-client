import * as React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { StyledComponentProps } from 'types/component';
import { injectSheet, injectSheetSFC, classNames, JSSProps } from 'styles/jss';
import {
  RenderContext, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ParentContainer } from 'types/active.ts';
import { getEditorByContentType } from 'editors/content/container/registry.ts';

import styles, { SIDEBAR_CLOSE_ANIMATION_DURATION_MS } from './ContextAwareSidebar.style';

interface SidebarHeaderProps {
  title: string;
  onHide: () => void;
}

const SidebarHeader = injectSheetSFC<SidebarHeaderProps>(styles)(({
  classes, title, onHide,
}: StyledComponentProps<SidebarHeaderProps>) => {
  return (
    <h3 className={classes.header}>
      {title}
      <div className="flex-spacer"/>
      <button className={classes.closeButton} onClick={onHide}>
        <i className="fa fa-angle-double-right"/>
      </button>
    </h3>
  );
});

interface SidebarContentProps {
  className?: string;
  title: string;
  onHide: () => void;
  isEmpty?: boolean;
}

/**
 * SidebarGroup React Stateless Component
 */
export const SidebarContent = injectSheetSFC<SidebarContentProps>(styles)(({
  className, classes, children, title, onHide, isEmpty,
}: StyledComponentProps<SidebarContentProps>) => {
  return (
    <div className={classNames([classes.sidebarContent, className])}>
      <SidebarHeader title={title} onHide={onHide}/>
      {!isEmpty
        ? children
        : (
          <div className={classes.sidebarEmptyMsg}>
            This item does not have any advanced controls
          </div>
        )
      }
    </div>
  );
});

interface SidebarGroupProps {
  className?: string;
  label: string;
}

/**
 * SidebarGroup React Stateless Component
 */
export const SidebarGroup = injectSheetSFC<SidebarGroupProps>(styles)(({
  className, classes, children, label,
}: StyledComponentProps<SidebarGroupProps>) => {
  return (
    <div className={classNames([classes.sidebarGroup, className])}>
      <div>{label}</div>
      {children}
    </div>
  );
});

export interface ContextAwareSidebarProps {
  className?: string;
  content: Maybe<Object>;
  container: Maybe<ParentContainer>;
  supportedElements: Immutable.List<string>;
  show: boolean;
  onInsert: (content: Object) => void;
  onEdit: (content: Object) => void;
  onHide: () => void;
}

export interface ContextAwareSidebarState {

}

/**
 * React Component for Context Aware Sidebar
 */
@injectSheet(styles)
export class ContextAwareSidebar
    extends React.PureComponent<ContextAwareSidebarProps & JSSProps, ContextAwareSidebarState> {

  constructor(props) {
    super(props);
  }

  renderPageDetails() {
    return (
      <div>
        <SidebarHeader title="Page Details" onHide={this.props.onHide} />
        Page Details
      </div>
    );
  }

  renderSidebarContent(contentRenderer, contentModel) {
    return (
      <div>
        {contentRenderer}
      </div>
    );
  }

  render() {
    const {
      classes, className, content, container, show, onEdit } = this.props;

    const contentModel = content.caseOf({
      just: c => c,
      nothing: () => undefined,
    });

    const contentParent = container.caseOf({
      just: c => c,
      nothing: () => undefined,
    });

    let contentRenderer;
    if (contentParent) {
      const props: AbstractContentEditorProps<any> = {
        renderContext: RenderContext.Sidebar,
        model: contentModel,
        onEdit,
        parent: contentParent,
        activeContentGuid: contentParent.props.activeContentGuid,
        onFocus: () => {},
        context: contentParent.props.context,
        services: contentParent.props.services,
        editMode: contentParent.props.editMode,
      };

      contentRenderer = React.createElement(
        getEditorByContentType((contentModel as any).contentType), props);

    }

    return (
      <ReactCSSTransitionGroup
          transitionName={{
            enter: classes.enter,
            enterActive: classes.enterActive,
            leave: classes.leave,
            leaveActive: classes.leaveActive,
          }}
          transitionEnterTimeout={SIDEBAR_CLOSE_ANIMATION_DURATION_MS}
          transitionLeaveTimeout={SIDEBAR_CLOSE_ANIMATION_DURATION_MS}>
        {show ?
          <div className={classNames([classes.contextAwareSidebar, className])}>
            <div className={classes.content}>
              {!contentRenderer
                ? this.renderPageDetails()
                : this.renderSidebarContent(contentRenderer, contentModel)
              }
            </div>
          </div>
          : null
        }
      </ReactCSSTransitionGroup>
    );
  }
}
