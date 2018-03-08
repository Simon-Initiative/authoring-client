import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { StyledComponentProps } from 'types/component';
import { injectSheet, injectSheetSFC, classNames } from 'styles/jss';
import { RenderContext } from 'editors/content/common/AbstractContentEditor';
import { ParentContainer } from 'types/active.ts';
import { getEditorByContentType } from 'editors/content/container/registry.ts';
import { Maybe } from 'tsmonad';
import colors from 'styles/colors';
import { InsertToolbar } from './InsertToolbar';
import { FormatToolbar } from './FormatToolbar';
import { ActionsToolbar } from './ActionsToolbar';

import styles from './ContextAwareToolbar.style';

interface ToolbarGroupProps {
  className?: string;
  label: string;
  highlightColor?: string;
  hide?: boolean;
}

export const ToolbarGroup = injectSheetSFC<ToolbarGroupProps>(styles)
  (({ className, classes, label, hide, children }) => {
    return (
      <div className={classNames([classes.toolbarGroupContainer, hide && 'hide'])}>
        <div className={classNames([classes.toolbarGroup, className])}>
            <div className={classes.tbGroupItems}>{children}</div>
            <div className={classes.tbGroupLabel}>{label}</div>
        </div>
      </div>
    );
  });

interface ToolbarLayoutInlineProps {
  className?: string;
}

export const ToolbarLayoutInline = injectSheetSFC<ToolbarLayoutInlineProps>(styles)
  (({ className, classes, children }) => {
    return (
      <div className={`${classes.toolbarLayoutInline} ${className}`}>
        {children}
      </div>
    );
  });

interface ToolbarLayoutGridProps {
  className?: string;
}

export const ToolbarLayoutGrid = injectSheetSFC<ToolbarLayoutGridProps>(styles)
  (({ className, classes, children }) => {
    return (
      <div className={`${classes.toolbarLayoutGrid} ${className}`}>
        {children}
      </div>
    );
  });

export interface ToolbarProps {
  supportedElements: Immutable.List<string>;
  content: Maybe<Object>;
  container: Maybe<ParentContainer>;
  onInsert: (content: Object) => void;
  onEdit: (content: Object) => void;
  hideLabels?: boolean;
  onShowPageDetails: () => void;
  onShowSidebar: () => void;
}

@injectSheet(styles)
export class ContextAwareToolbar extends React.PureComponent<StyledComponentProps<ToolbarProps>> {

  constructor(props) {
    super(props);
  }

  render() {
    const {
      onInsert, onEdit, content, container, supportedElements, classes, onShowPageDetails,
    } = this.props;

    const isText = content.caseOf({
      just: c => c instanceof contentTypes.ContiguousText,
      nothing: () => false,
    });

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

    const contentType = content.caseOf({
      just: c => (c as any).contentType,
      nothing: () => false,
    });

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
            onInsert={onInsert}
            parentSupportsElementType={parentSupportsElementType} />
        </ToolbarGroup>

        <ToolbarGroup className={classes.toolbarFormatGroup} label="Format">
          <FormatToolbar
            content={content}
            onEdit={onEdit}
            isText={isText}
            />
        </ToolbarGroup>

        <ToolbarGroup
            label={contentType} highlightColor={contentModel && colors.contentSelection}
            hide={!contentModel}>
          {contentRenderer}
        </ToolbarGroup>

        <ToolbarGroup className={classes.toolbarActionsGroup} label="Actions">
          <ActionsToolbar onShowPageDetails={onShowPageDetails} />
        </ToolbarGroup>
      </div>
    );
  }

}
