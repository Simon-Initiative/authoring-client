import * as React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import * as Immutable from 'immutable';
import { StyledComponentProps } from 'types/component';
import { injectSheet, injectSheetSFC, classNames } from 'styles/jss';
import { RenderContext } from 'editors/content/common/AbstractContentEditor';
import { ParentContainer, TextSelection, Trigger } from 'types/active.ts';
import { getEditorByContentType } from 'editors/content/container/registry.ts';
import { Maybe } from 'tsmonad';
import { Resource } from 'data/content/resource';
import { AppContext } from 'editors/common/AppContext';
import { InsertToolbar } from './InsertToolbar';
import { ItemToolbar } from './ItemToolbar.controller';
import { ActionsToolbar } from './ActionsToolbar.controller';
import { CourseModel } from 'data/models/course';
import { ContentModel, ModelTypes } from 'data/models';

import { styles, TOOLBAR_HIDE_ANIMATION_DURATION_MS } from './ContextAwareToolbar.styles';

interface ToolbarGroupProps {
  className?: string;
  label: string;
  highlightColor?: string;
  columns?: number;
}

export function determineBaseUrl(resource: Resource) : string {
  if (resource === undefined) return '';

  const pathTo = resource.fileNode.pathTo;
  const stem = pathTo
    .substr(pathTo.indexOf('content\/') + 8);
  return stem
    .substr(0, stem.lastIndexOf('\/'));
}

const TOOLBAR_COL_WIDTH = 36;
const DEFAULT_TOOLBAR_GROUP_COLS = 10;

export const ToolbarGroup: React.StatelessComponent<ToolbarGroupProps>
  = injectSheetSFC<ToolbarGroupProps>(styles)(({
    className, classes, columns, label, children,
  }) => {
    const width = ((columns || DEFAULT_TOOLBAR_GROUP_COLS) * TOOLBAR_COL_WIDTH);
    return children
      ? (
        <div className={classNames([classes.toolbarGroupContainer, className])}>
          <div style={{ width }} className={classNames([classes.toolbarGroup])}>
              <div className={classes.tbGroupItems}>{children}</div>
              <div className={classes.tbGroupLabel}>{label}</div>
          </div>
        </div>
      )
      : (
        <div className={classes.toolbarGroupContainer}>
          <div style={{ width: 4 * TOOLBAR_COL_WIDTH }}
               className={classes.toolbarGroup}>
            <div className={classes.tbVerticallyCentered}>
              <div className={classes.tbNoAdvancedControls}>
                This item does not have any advanced controls
              </div>
            </div>
            <div className={classes.tbGroupLabel}>{label}</div>
          </div>
        </div>
      );
  });

interface ToolbarLayoutProps {
  className?: string;
  maxWidth?: string;
}

export const ToolbarLayout = {
  Inline: injectSheetSFC<ToolbarLayoutProps>(styles)(({
    className, classes, children,
  }: StyledComponentProps<ToolbarLayoutProps>) => {
    return (
      <div className={classNames([classes.toolbarLayoutInline, className])}>
        {children}
      </div>
    );
  }),

  Grid: injectSheetSFC<ToolbarLayoutProps>(styles)(({
    className, classes, children,
  }: StyledComponentProps<ToolbarLayoutProps>) => {
    return (
      <div className={classNames([classes.toolbarLayoutGrid, className])}>
        {children}
      </div>
    );
  }),

  Row: injectSheetSFC<ToolbarLayoutProps>(styles)(({
    className, classes, children,
  }: StyledComponentProps<ToolbarLayoutProps>) => {
    return (
      <div className={classNames([classes.toolbarLayoutRow, className])}>
        {children}
      </div>
    );
  }),
  Column: injectSheetSFC<ToolbarLayoutProps>(styles)(({
    className, classes, children, maxWidth,
  }: StyledComponentProps<ToolbarLayoutProps>) => {
    const style = maxWidth !== undefined ? { maxWidth } : undefined;
    return (
      <div
        style={style}
        className={classNames([classes.toolbarLayoutColumn, className])}>
        {children}
      </div>
    );
  }),
};

export interface ToolbarProps {
  courseModel: CourseModel;
  resource: Resource;
  supportedElements: Immutable.List<string>;
  content: Maybe<Object>;
  container: Maybe<ParentContainer>;
  context: AppContext;
  model: ContentModel;
  textSelection: Maybe<TextSelection>;
  onInsert: (content: Object, textSelection) => void;
  onEdit: (content: Object) => void;
  hideLabels?: boolean;
  onShowSidebar: () => void;
  onDisplayModal: (component) => void;
  onDismissModal: () => void;
}

@injectSheet(styles)
export class ContextAwareToolbar extends React.Component<StyledComponentProps<ToolbarProps>> {

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps: StyledComponentProps<ToolbarProps>) : boolean {

    // Determine if this update is due to a keypress
    // that changed content.  These changes do not affect
    // the toolbar, so no need to re-render
    const isKeypress = this.props.textSelection.caseOf({
      just: t => nextProps.textSelection.caseOf({
        just: s => t !== s && s.triggeredBy === Trigger.KEYPRESS,
        nothing: () => false,
      }),
      nothing: () => false,
    });

    if (isKeypress) {
      return false;
    }

    // If the active content has switched, we re-render
    const contentSwitched = this.props.content.caseOf({
      just: t => nextProps.content.caseOf({
        just: s => (t as any).guid !== (s as any).guid,
        nothing: () => true,
      }),
      nothing: () => nextProps.content.caseOf({
        just: s => true,
        nothing: () => false,
      }),
    });

    if (contentSwitched) {
      return true;
    }

    // Only other thing we need to check is for a change in
    // the supported elements
    if (this.props.supportedElements !== nextProps.supportedElements) {
      return true;
    }

    return false;
  }

  render() {

    const {
      onInsert, onEdit, content, container, supportedElements, model,
      textSelection, classes, onDisplayModal, onDismissModal, context, resource,
    } = this.props;

    const contentModel = content.caseOf({
      just: c => c,
      nothing: () => undefined,
    });

    const contentParent = container.caseOf({
      just: c => c,
      nothing: () => undefined,
    });

    let contentRenderer;
    if (contentParent && contentModel) {
      const props = {
        renderContext: RenderContext.Toolbar,
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

    const elementMap = supportedElements
      .toArray()
      .reduce(
        (m, c) => {
          m[c] = true;
          return m;
        },
        {});

    const parentSupportsElementType = el => !!elementMap[el];

    const canPreview = model.modelType === ModelTypes.WorkbookPageModel;

    return (
      <div className={classes.toolbar}>
        <ToolbarGroup className={classes.toolbarInsertGroup} label="Insert" columns={13}>
          <InsertToolbar
            context={context}
            courseModel={this.props.courseModel}
            resourcePath={determineBaseUrl(this.props.resource)}
            onInsert={item => onInsert(item, textSelection)}
            parentSupportsElementType={parentSupportsElementType}
            onDisplayModal={onDisplayModal}
            onDismissModal={onDismissModal} />
        </ToolbarGroup>

        <ToolbarGroup className={classes.toolbarItemGroup} label="Item" columns={5.5}>
          <ItemToolbar
            context={context}
            parentSupportsElementType={parentSupportsElementType} />
        </ToolbarGroup>

        <ReactCSSTransitionGroup
            transitionName="contextToolbar"
            transitionEnterTimeout={TOOLBAR_HIDE_ANIMATION_DURATION_MS}
            transitionLeaveTimeout={TOOLBAR_HIDE_ANIMATION_DURATION_MS}>
          {contentRenderer}
        </ReactCSSTransitionGroup>

        <div className="flex-spacer"/>

        <ToolbarGroup className={classes.toolbarActionsGroup} label="Actions" columns={8.5}>
          <ActionsToolbar
            documentResource={resource}
            documentId={context.documentId}
            canPreview={canPreview} />
        </ToolbarGroup>
      </div>
    );
  }

}
