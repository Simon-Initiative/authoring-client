import * as React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import * as Immutable from 'immutable';
import { StyledComponentProps } from 'types/component';
import { withStyles, classNames } from 'styles/jss';
import { RenderContext } from 'editors/content/common/AbstractContentEditor';
import { ParentContainer, ActiveContext } from 'types/active';
import { getEditorByContentType } from 'editors/content/container/registry';
import { Maybe } from 'tsmonad';
import { Resource } from 'data/content/resource';
import { AppContext } from 'editors/common/AppContext';
import { InsertToolbar } from 'components/toolbar/InsertToolbar';
import { ItemToolbar } from 'components/toolbar/ItemToolbar.controller';
import { ActionsToolbar } from 'components/toolbar/ActionsToolbar.controller';
import { CourseModel } from 'data/models/course';
import { ContentModel, ModelTypes } from 'data/models';
import { Message } from 'types/messages';
import {
  styles, TOOLBAR_HIDE_ANIMATION_DURATION_MS,
} from 'components/toolbar/ContextAwareToolbar.styles';

interface ToolbarGroupProps {
  className?: string;
  label: string;
  highlightColor?: string;
  columns?: number;
}

export function determineBaseUrl(resource: Resource): string {
  if (resource === undefined) return '';

  const pathTo = resource.fileNode.pathTo;
  const stem = pathTo
    .substr(pathTo.indexOf('content\/') + 8);
  return stem
    .substr(0, stem.lastIndexOf('\/'));
}

const TOOLBAR_COL_WIDTH = 31;
const DEFAULT_TOOLBAR_GROUP_COLS = 10;

export const ToolbarGroup = withStyles<ToolbarGroupProps>(styles)(({
  className, classes, columns, label, children,
}) => {
  const width = ((columns || DEFAULT_TOOLBAR_GROUP_COLS) * TOOLBAR_COL_WIDTH);
  return children
    ? (
      <div className={classNames([classes.toolbarGroupContainer, className])}>
        <div style={{ width }} className={classNames([classes.toolbarGroup])}>
          <div className={classes.tbGroupItems}>{children}</div>
        </div>
        <div className={classes.tbGroupLabel}>{label}</div>
      </div>
    )
    : (
      <div className={classes.toolbarGroupContainer}>
        <div style={{ width: 6 * TOOLBAR_COL_WIDTH }}
          className={classes.toolbarGroup}>
          <div className={classes.tbVerticallyCentered}>
            <div className={classes.tbNoAdvancedControls}>
              This item does not have any advanced controls
            </div>
          </div>
        </div>
        <div className={classes.tbGroupLabel}>{label}</div>
      </div>
    );
});

interface ToolbarLayoutProps {
  className?: string;
  maxWidth?: string;
}

export const ToolbarLayout = {
  Inline: withStyles<ToolbarLayoutProps>(styles)(({
    className, classes, children,
  }) => {
    return (
      <div className={classNames([classes.toolbarLayoutInline, className])}>
        {children}
      </div>
    );
  }),

  Grid: withStyles<ToolbarLayoutProps>(styles)(({
    className, classes, children,
  }) => {
    return (
      <div className={classNames([classes.toolbarLayoutGrid, className])}>
        {children}
      </div>
    );
  }),

  Row: withStyles<ToolbarLayoutProps>(styles)(({
    className, classes, children,
  }) => {
    return (
      <div className={classNames([classes.toolbarLayoutRow, className])}>
        {children}
      </div>
    );
  }),
  Column: withStyles<ToolbarLayoutProps>(styles)(({
    className, classes, children, maxWidth,
  }) => {
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

export interface ContextAwareToolbarProps {
  courseModel: CourseModel;
  resource: Resource;
  editMode: boolean;
  supportedElements: Immutable.List<string>;
  activeContext: ActiveContext;
  content: Maybe<Object>;
  container: Maybe<ParentContainer>;
  context: AppContext;
  model: ContentModel;
  onInsert: (content: Object, snapshot) => void;
  onEdit: (content: Object) => void;
  hideLabels?: boolean;
  onShowSidebar: () => void;
  onDisplayModal: (component) => void;
  onDismissModal: () => void;
  onCreateNew: (model: ContentModel) => Promise<Resource>;
  onShowMessage: (message: Message) => void;
  onDismissMessage: (message: Message) => void;
}

type StyledContextAwareToolbarProps = StyledComponentProps<ContextAwareToolbarProps, typeof styles>;

class ContextAwareToolbar
  extends React.Component<StyledContextAwareToolbarProps> {

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps: StyledContextAwareToolbarProps): boolean {

    // See if the content switched or changed
    const contentSwitchedOrChanged = this.props.content.caseOf({
      just: t => nextProps.content.caseOf({
        just: s => (t as any).guid !== (s as any).guid
          || s !== t,
        nothing: () => true,
      }),
      nothing: () => nextProps.content.caseOf({
        just: s => true,
        nothing: () => false,
      }),
    });

    if (contentSwitchedOrChanged) {
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
      classes, onDisplayModal, onDismissModal, context, resource, editMode,
      onCreateNew, onDismissMessage, onShowMessage, activeContext,
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
        onFocus: () => { },
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

    const requestModel = () => Promise.resolve(this.props.model);

    const actionsToolbarLabel = () => {
      switch (model.modelType) {
        case 'AssessmentModel':
          return 'Assessment';
        case 'WorkbookPageModel':
          return 'Page';
        default:
          return 'Actions';
      }
    };

    return (
      <div className={classes.toolbar}>
        <ToolbarGroup className={classes.toolbarInsertGroup} label="Insert" columns={16.8}>
          <InsertToolbar
            editMode={editMode}
            activeContext={activeContext}
            content={content}
            onCreateNew={onCreateNew}
            requestLatestModel={requestModel}
            context={context}
            courseModel={this.props.courseModel}
            resourcePath={determineBaseUrl(this.props.resource)}
            onInsert={(item, snapshot) => onInsert(item, snapshot)}
            parentSupportsElementType={parentSupportsElementType}
            onDismissMessage={onDismissMessage}
            onShowMessage={onShowMessage}
            onDisplayModal={onDisplayModal}
            onDismissModal={onDismissModal} />
        </ToolbarGroup>

        <ToolbarGroup className={classes.toolbarItemGroup} label="Item" columns={7.4}>
          <ItemToolbar
            editMode={editMode}
            context={context}
            parentSupportsElementType={parentSupportsElementType} />
        </ToolbarGroup>

        <ReactCSSTransitionGroup
          transitionName="contextToolbar"
          transitionEnterTimeout={TOOLBAR_HIDE_ANIMATION_DURATION_MS}
          transitionLeaveTimeout={TOOLBAR_HIDE_ANIMATION_DURATION_MS}>
          {contentRenderer}
        </ReactCSSTransitionGroup>

        <div className="flex-spacer" />

        <ToolbarGroup
          className={classes.toolbarActionsGroup}
          label={actionsToolbarLabel()}
          columns={7.6}>
          <ActionsToolbar
            editMode={editMode}
            documentResource={resource}
            documentId={context.documentId}
            canPreview={canPreview} />
        </ToolbarGroup>
      </div>
    );
  }

}

const StyledContextAwareToolbar = withStyles<ContextAwareToolbarProps>(styles)(ContextAwareToolbar);
export { StyledContextAwareToolbar as ContextAwareToolbar };
