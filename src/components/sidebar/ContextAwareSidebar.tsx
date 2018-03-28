import * as React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { Maybe } from 'tsmonad';
import { StyledComponentProps } from 'types/component';
import { injectSheet, injectSheetSFC, classNames, JSSProps } from 'styles/jss';
import {
  RenderContext, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ParentContainer } from 'types/active.ts';
import { getEditorByContentType } from 'editors/content/container/registry.ts';
import { ToolbarContentContainer } from 'editors/content/container/ToolbarContentContainer';
import { Resource } from 'data/content/resource';
import {
  ModelTypes, ContentModel, WorkbookPageModel, AssessmentModel, PoolModel,
} from 'data/models';
import { AppContext } from 'editors/common/AppContext';
import { AppServices } from 'editors/common/AppServices';
import { ContentElements } from 'data/content/common/elements';
import { PageSelection } from 'editors/document/assessment/PageSelection.tsx';
import guid from 'utils/guid';
import { createMultipleChoiceQuestion } from 'editors/content/question/AddQuestion';
import { TextInput } from 'editors/content/common/TextInput';
import { LegacyTypes } from 'data/types';


import styles, { SIDEBAR_CLOSE_ANIMATION_DURATION_MS } from './ContextAwareSidebar.style';

interface SidebarRowProps {
  label?: string;
}

export const SidebarRow = injectSheetSFC<SidebarRowProps>(styles)(({
  classes, label, children }) => {
  return (
    <div className={classes.sidebarRow}>
      {label && label !== ''
        ? <p className={classes.sidebarRowLabel}>{label}</p>
        : null}
      <div className={'col-12'}>
        {children}
      </div>
    </div>
  );
});

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
      <div className={classes.sidebarGroupLabel}>{label}</div>
      {children}
    </div>
  );
});

export interface ContextAwareSidebarProps {
  className?: string;
  content: Maybe<Object>;
  container: Maybe<ParentContainer>;
  context: AppContext;
  editMode: boolean;
  services: AppServices;
  resource: Resource;
  model: ContentModel;
  currentPage: string;
  onEditModel: (model: ContentModel) => void;
  supportedElements: Immutable.List<string>;
  show: boolean;
  onInsert: (content: Object, textSelection) => void;
  onEdit: (content: Object) => void;
  onHide: () => void;
  onSetCurrentPage: (documentId: string, pageId: string) => void;
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

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onRemovePage = this.onRemovePage.bind(this);
    this.onPageEdit = this.onPageEdit.bind(this);
    this.onAddPage = this.onAddPage.bind(this);
  }

  onTitleEdit(text: ContentElements) {
    const { model, onEditModel } = this.props;

    const t = text.extractPlainText().caseOf({ just: s => s, nothing: () => '' });

    let updatedModel;
    let resource;
    let title;
    switch (model.modelType) {
      case ModelTypes.WorkbookPageModel:
        updatedModel = (model as WorkbookPageModel);
        resource = updatedModel.resource.with({ title: t });
        title = updatedModel.head.title.with({ text });
        const head = updatedModel.head.with({ title });

        onEditModel(updatedModel.with({ head, resource }));
        return;
      case ModelTypes.AssessmentModel:
        updatedModel = (model as AssessmentModel);
        resource = updatedModel.resource.with({ title: t });
        title = updatedModel.title.with({ text });

        onEditModel(updatedModel.with({ title, resource }));
        return;
      case ModelTypes.PoolModel:
        updatedModel = (model as PoolModel);
        resource = updatedModel.resource.with({ title: t });
        title = updatedModel.pool.title.with({ text });
        const pool = updatedModel.pool.with({ title });

        onEditModel(updatedModel.with({ pool, resource }));
        return;
      default:
        return;
    }
  }

  onRemovePage(page: contentTypes.Page) {
    const { context, model, onEditModel, onSetCurrentPage } = this.props;
    const assessmentModel = model as AssessmentModel;

    if (assessmentModel.pages.size > 1) {
      const guid = page.guid;
      const removed = assessmentModel.with({ pages: assessmentModel.pages.delete(guid) });

      if (guid === this.props.currentPage) {
        onSetCurrentPage(context.documentId, removed.pages.first().guid);
      }

      onEditModel(removed);
    }
  }

  onPageEdit(page: contentTypes.Page) {
    const { model, onEditModel } = this.props;
    const assessmentModel = model as AssessmentModel;

    onEditModel(assessmentModel.with({ pages: assessmentModel.pages.set(page.guid, page) }));
  }

  onAddPage() {
    const { model, onEditModel } = this.props;
    const assessmentModel = model as AssessmentModel;

    const text = 'New Page ' + (assessmentModel.pages.size + 1);
    let page = new contentTypes.Page()
      .with({ title: contentTypes.Title.fromText(text) });

    let content = new contentTypes.Content();
    content = content.with({ guid: guid() });

    const question = createMultipleChoiceQuestion('single');

    page = page.with({
      nodes: page.nodes.set(content.guid, content)
        .set(question.guid, question),
    });

    onEditModel(
      assessmentModel.with({
        pages: assessmentModel.pages.set(page.guid, page) }),
    );
  }

  renderPageDetails() {
    const {
      model, resource, context, services, editMode, currentPage, onSetCurrentPage,
      onEditModel,
    } = this.props;

    switch (model.modelType) {
      case ModelTypes.WorkbookPageModel:
        return (
          <SidebarContent title="Page Details" onHide={this.props.onHide}>
            <SidebarGroup label="">
              <SidebarRow label="Title">
                <ToolbarContentContainer
                  activeContentGuid={null}
                  hover={null}
                  onUpdateHover={() => {}}
                  onFocus={() => {}}
                  model={model.head.title.text}
                  context={context}
                  services={services}
                  editMode={editMode}
                  onEdit={text => this.onTitleEdit(text)} />
              </SidebarRow>
              <SidebarRow label="Created">
                {`${resource.dateCreated.toLocaleDateString()}, \
                ${resource.dateCreated.toLocaleTimeString()}`}
              </SidebarRow>
              <SidebarRow label="Last Updated">
                {`${resource.dateUpdated.toLocaleDateString()}, \
                ${resource.dateUpdated.toLocaleTimeString()}`}
              </SidebarRow>
            </SidebarGroup>
          </SidebarContent>
        );
      case ModelTypes.AssessmentModel:
        return (
          <SidebarContent title="Assessment Details" onHide={this.props.onHide}>
            <SidebarGroup label="General">
              <SidebarRow label="Title">
                <ToolbarContentContainer
                  activeContentGuid={null}
                  hover={null}
                  onUpdateHover={() => {}}
                  onFocus={() => {}}
                  model={model.title.text}
                  context={context}
                  services={services}
                  editMode={editMode}
                  onEdit={text => this.onTitleEdit(text)} />
              </SidebarRow>
              <SidebarRow label="Created">
                {`${resource.dateCreated.toLocaleDateString()}, \
                ${resource.dateCreated.toLocaleTimeString()}`}
              </SidebarRow>
              <SidebarRow label="Last Updated">
                {`${resource.dateUpdated.toLocaleDateString()}, \
                ${resource.dateUpdated.toLocaleTimeString()}`}
              </SidebarRow>
            </SidebarGroup>
            <SidebarGroup label="Pages">
              <SidebarRow>
              <PageSelection
                {...this.props}
                onFocus={() => {}}
                onRemove={this.onRemovePage}
                editMode={editMode}
                pages={model.pages}
                current={model.pages.get(currentPage)}
                onChangeCurrent={(newPage) => {
                  onSetCurrentPage(this.props.context.documentId, newPage);
                }}
                onEdit={this.onPageEdit}/>
                <button
                  disabled={!this.props.editMode}
                  type="button" className="btn btn-link btn-sm"
                  onClick={this.onAddPage}>Add Page</button>
              </SidebarRow>
            </SidebarGroup>
            {model.type === LegacyTypes.assessment2 &&
            <SidebarGroup label="Settings">
              <SidebarRow label="Recommended Attempts">
              <TextInput
                editMode={editMode}
                width="50px"
                label=""
                type="number"
                value={model.recommendedAttempts}
                onEdit={
                  recommendedAttempts => onEditModel(
                    model.with({ recommendedAttempts }))} />
              </SidebarRow>
              <SidebarRow label="Maximum Attempts">
                <TextInput
                  editMode={this.props.editMode}
                  width="50px"
                  label=""
                  type="number"
                  value={model.maxAttempts}
                  onEdit={
                    maxAttempts => onEditModel(
                      model.with({ maxAttempts }))} />
              </SidebarRow>
            </SidebarGroup>
            }
          </SidebarContent>
        );
      case ModelTypes.PoolModel:
        return (
          <SidebarContent title="Question Pool Details" onHide={this.props.onHide}>
            <SidebarGroup label="">
              <SidebarRow label="Title">
                <ToolbarContentContainer
                  activeContentGuid={null}
                  hover={null}
                  onUpdateHover={() => {}}
                  onFocus={() => {}}
                  model={model.pool.title.text}
                  context={context}
                  services={services}
                  editMode={editMode}
                  onEdit={text => this.onTitleEdit(text)} />
              </SidebarRow>
              <SidebarRow label="Created">
                {`${resource.dateCreated.toLocaleDateString()}, \
                ${resource.dateCreated.toLocaleTimeString()}`}
              </SidebarRow>
              <SidebarRow label="Last Updated">
                {`${resource.dateUpdated.toLocaleDateString()}, \
                ${resource.dateUpdated.toLocaleTimeString()}`}
              </SidebarRow>
            </SidebarGroup>
          </SidebarContent>
        );
      default:
        return null;
    }
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
    if (contentParent && contentModel) {
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
        hover: null,
        onUpdateHover: () => {},
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
