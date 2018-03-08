import * as React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { injectSheet, classNames, JSSProps } from 'styles/jss';
import { RenderContext } from 'editors/content/common/AbstractContentEditor';
import { ParentContainer } from 'types/active.ts';
import { getEditorByContentType } from 'editors/content/container/registry.ts';
import { AbstractContentEditorProps } from 'editors/content/common/AbstractContentEditor.tsx';

import styles, { SIDEBAR_CLOSE_ANIMATION_DURATION_MS } from './ContextAwareSidebar.style';

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

  renderHeader(title) {
    const { classes, onHide } = this.props;

    return (
      <h3 className={classes.header}>
        {title}
        <div className="flex-spacer"/>
        <button className={classes.closeButton} onClick={onHide}>
          <i className="fa fa-close"/>
        </button>
      </h3>
    );
  }

  renderPageDetails() {
    return (
      <div>
        {this.renderHeader('Page Details')}
        Page Details
      </div>
    );
  }

  renderSidebarContent(contentRenderer, contentModel) {
    return (
      <div>
        {this.renderHeader(contentModel.contentType)}
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
