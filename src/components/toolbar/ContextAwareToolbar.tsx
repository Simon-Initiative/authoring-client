import * as React from 'react';
import * as Immutable from 'immutable';
import { StyledComponentProps } from 'types/component';
import { injectSheet, injectSheetSFC, classNames } from 'styles/jss';
import { RenderContext } from 'editors/content/common/AbstractContentEditor';
import { ParentContainer, TextSelection } from 'types/active.ts';
import { getEditorByContentType } from 'editors/content/container/registry.ts';
import { Maybe } from 'tsmonad';
import { Resource } from 'data/content/resource';
import { AppContext } from 'editors/common/AppContext';
import { InsertToolbar } from './InsertToolbar';
import { ActionsToolbar } from './ActionsToolbar.controller';
import { CourseModel } from 'data/models/course';

import styles from './ContextAwareToolbar.style';

interface ToolbarGroupProps {
  className?: string;
  label: string;
  highlightColor?: string;
  hide?: boolean;
}

function determineBaseUrl(resource: Resource) : string {
  if (resource === undefined) return '';

  const pathTo = resource.fileNode.pathTo;
  const stem = pathTo
    .substr(pathTo.indexOf('content\/') + 8);
  return stem
    .substr(0, stem.lastIndexOf('\/'));
}

export const ToolbarGroup = injectSheetSFC<ToolbarGroupProps>(styles)
  (({ className, classes, label, hide, children }: StyledComponentProps<ToolbarGroupProps>) => {
    return (
      <div key={label} className={classNames([classes.toolbarGroupContainer, hide && 'hide'])}>
        <div className={classNames([classes.toolbarGroup, className])}>
            <div className={classes.tbGroupItems}>{children}</div>
            <div className={classes.tbGroupLabel}>{label}</div>
        </div>
      </div>
    );
  });

interface ToolbarLayoutProps {
  className?: string;
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
    className, classes, children,
  }: StyledComponentProps<ToolbarLayoutProps>) => {
    return (
      <div className={classNames([classes.toolbarLayoutColumn, className])}>
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
  textSelection: Maybe<TextSelection>;
  onInsert: (content: Object, textSelection) => void;
  onEdit: (content: Object) => void;
  onShowPageDetails: () => void;
  hideLabels?: boolean;
  onShowSidebar: () => void;
  onDisplayModal: (component) => void;
  onDismissModal: () => void;
}

@injectSheet(styles)
export class ContextAwareToolbar extends React.PureComponent<StyledComponentProps<ToolbarProps>> {

  constructor(props) {
    super(props);
  }

  render() {
    const {
      content, container, resource, supportedElements, classes,
      onInsert, onEdit, textSelection, context,
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

    return (
      <div className={classes.toolbar}>
        <ToolbarGroup className={classes.toolbarInsertGroup} label="Insert">
          <InsertToolbar
            context={context}
            courseModel={this.props.courseModel}
            onDismissModal={this.props.onDismissModal}
            onDisplayModal={this.props.onDisplayModal}
            resourcePath={determineBaseUrl(this.props.resource)}
            onInsert={item => onInsert(item, textSelection)}
            parentSupportsElementType={parentSupportsElementType} />
        </ToolbarGroup>

        {contentRenderer}

        <div className="flex-spacer"/>

        <ToolbarGroup className={classes.toolbarActionsGroup} label="Actions">
          <ActionsToolbar documentResource={resource} documentId={context.documentId} />
        </ToolbarGroup>
      </div>
    );
  }

}
