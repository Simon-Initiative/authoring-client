import * as React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { Maybe } from 'tsmonad/lib/src';
import { StyledComponentProps } from 'types/component';
import { injectSheet, injectSheetSFC, classNames, JSSProps } from 'styles/jss';
import {
  RenderContext, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ParentContainer } from 'types/active';
import { getEditorByContentType } from 'editors/content/container/registry';
import { Resource } from 'data/content/resource';
import {
  ModelTypes, ContentModel, AssessmentModel, CourseModel,
} from 'data/models';
import { AppContext } from 'editors/common/AppContext';
import { AppServices } from 'editors/common/AppServices';
import { PageSelection } from 'editors/document/assessment/PageSelection';
import { createMultipleChoiceQuestion } from 'editors/content/question/AddQuestion';
import { TextInput } from 'editors/content/common/TextInput';
import { LegacyTypes } from 'data/types';
import { DeleteResourceModal } from 'components/DeleteResourceModal.controller';
import {
  styles, SIDEBAR_CLOSE_ANIMATION_DURATION_MS,
} from 'components/sidebar/ContextAwareSidebar.styles';
import { relativeToNow, adjustForSkew } from 'utils/date';
import { Tooltip } from 'utils/tooltip';
import { Button } from 'editors/content/common/Button';

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
      <div className="flex-spacer" />
      <button className={classes.closeButton} onClick={onHide}>
        <i className="fa fa-angle-double-right" />
      </button>
    </h3>
  );
});

interface SidebarContentProps {
  className?: string;
  title: string;
  onHide: () => void;
}

/**
 * SidebarGroup React Stateless Component
 */
export const SidebarContent = injectSheetSFC<SidebarContentProps>(styles)(({
  className, classes, children, title, onHide,
}: StyledComponentProps<SidebarContentProps>) => {
  return (
    <div className={classNames([classes.sidebarContent, className])}>
      <SidebarHeader title={title} onHide={onHide} />
      {children
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
  label?: string;
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
  course: CourseModel;
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
  onDisplayModal: (component: any) => void;
  onDismissModal: () => void;
  timeSkewInMs: number;
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

    this.onRemovePage = this.onRemovePage.bind(this);
    this.onPageEdit = this.onPageEdit.bind(this);
    this.onAddPage = this.onAddPage.bind(this);
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

    const question = createMultipleChoiceQuestion('single');

    page = page.with({
      nodes: page.nodes.set(question.guid, question),
    });

    onEditModel(
      assessmentModel.with({
        pages: assessmentModel.pages.set(page.guid, page),
      }),
    );
  }

  showDeleteModal = () => {
    this.props.onDisplayModal(
      <DeleteResourceModal
        resource={this.props.resource}
        course={this.props.course}
        onDismissModal={this.props.onDismissModal} />);
  }

  renderPageDetails() {
    const {
      model, resource, editMode, currentPage, onSetCurrentPage,
      onEditModel, classes,
    } = this.props;

    const dateOptions = {
      month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric',
    };
    const dateFormatted = (date: Date): string =>
      date.toLocaleDateString('en-US', dateOptions);

    const adjusted = (date: Date): Date => adjustForSkew(date, this.props.timeSkewInMs);

    const MAX_DAYS = 30;
    const relativeToNowIfLessThanDays = (date: Date, days: number) => {
      const maxMilliseconds = days * 24 * 60 * 60 * 1000;
      return (adjusted(new Date()).getMilliseconds()
        - adjusted(date).getMilliseconds() < maxMilliseconds)
      ? relativeToNow(date)
      : dateFormatted(date);
    };

    switch (model.modelType) {
      case ModelTypes.WorkbookPageModel:
        return (
          <SidebarContent title="Workbook Page" onHide={this.props.onHide}>
            <SidebarGroup label="General">
              <SidebarRow>
                <span>Created </span>
                <Tooltip theme="dark" title={dateFormatted(adjusted(resource.dateCreated))}
                  delay={150} distance={5} size="small" arrowSize="small">
                  {relativeToNowIfLessThanDays(resource.dateCreated, MAX_DAYS)}
                </Tooltip>
              </SidebarRow>
              <SidebarRow>
                <span>Updated </span>
                <Tooltip theme="dark" title={dateFormatted(adjusted(resource.dateUpdated))}
                  delay={150} distance={5} size="small" arrowSize="small">
                  {relativeToNowIfLessThanDays(resource.dateUpdated, MAX_DAYS)}
                </Tooltip>
              </SidebarRow>
            </SidebarGroup>
            <SidebarGroup label="Advanced">
              <SidebarRow>
                <Button
                  className={classes.deleteButton}
                  onClick={this.showDeleteModal}
                  editMode={editMode}
                  type="outline-danger">
                  Delete this Page
                </Button>
              </SidebarRow>
            </SidebarGroup>
          </SidebarContent>
        );
      case ModelTypes.AssessmentModel:
        return (
          <SidebarContent title="Assessment" onHide={this.props.onHide}>
            <SidebarGroup label="General">
              <SidebarRow>
                <span>Created </span>
                <Tooltip theme="dark" title={dateFormatted(adjusted(resource.dateCreated))}
                  delay={150} distance={5} size="small" arrowSize="small">
                  {relativeToNowIfLessThanDays(resource.dateCreated, MAX_DAYS)}
                </Tooltip>
              </SidebarRow>
              <SidebarRow>
                <span>Updated </span>
                <Tooltip theme="dark" title={dateFormatted(adjusted(resource.dateUpdated))}
                  delay={150} distance={5} size="small" arrowSize="small">
                  {relativeToNowIfLessThanDays(resource.dateUpdated, MAX_DAYS)}
                </Tooltip>
              </SidebarRow>
            </SidebarGroup>
            <SidebarGroup label="Pages">
              <SidebarRow>
                <PageSelection
                  {...this.props}
                  onFocus={() => { }}
                  onRemove={this.onRemovePage}
                  editMode={editMode}
                  pages={model.pages}
                  current={model.pages.get(currentPage)}
                  onChangeCurrent={(newPage) => {
                    onSetCurrentPage(this.props.context.documentId, newPage);
                  }}
                  onEdit={this.onPageEdit} />
                <Button
                  editMode={editMode}
                  type="secondary" className="btn-sm"
                  onClick={this.onAddPage}>
                    Add Page
                </Button>
              </SidebarRow>
            </SidebarGroup>
            {model.type === LegacyTypes.assessment2 &&
              <SidebarGroup label="Learning">
                <SidebarRow label="Recommended Attempts">
                  <TextInput
                    editMode={editMode}
                    width="100%"
                    label=""
                    type="number"
                    value={model.recommendedAttempts}
                    onEdit={(recommendedAttempts) => {
                      const recommended = parseInt(recommendedAttempts, 10);
                      const max = parseInt(model.maxAttempts, 10);
                      if (recommended < 1) {
                        return onEditModel(model.with({
                          recommendedAttempts: '1',
                          maxAttempts: '1',
                        }));
                      }
                      if (recommended > max) {
                        return onEditModel(model.with({
                          recommendedAttempts,
                          maxAttempts: recommendedAttempts,
                        }));
                      }
                      return onEditModel(model.with({ recommendedAttempts }));
                    }}
                  />
                </SidebarRow>
                <SidebarRow label="Maximum Attempts">
                  <TextInput
                    editMode={this.props.editMode}
                    width="100%"
                    label=""
                    type="number"
                    value={model.maxAttempts}
                    onEdit={(maxAttempts) => {
                      const recommended = parseInt(model.recommendedAttempts, 10);
                      const max = parseInt(maxAttempts, 10);
                      if (max < 1) {
                        return onEditModel(model.with({
                          recommendedAttempts: '1',
                          maxAttempts: '1',
                        }));
                      }
                      if (max < recommended) {
                        return onEditModel(model.with({
                          recommendedAttempts: maxAttempts,
                          maxAttempts,
                        }));
                      }
                      return onEditModel(model.with({ maxAttempts }));
                    }} />
                </SidebarRow>
              </SidebarGroup>
            }
            <SidebarGroup label="Advanced">
              <SidebarRow>
                <Button
                  className={classes.deleteButton}
                  onClick={this.showDeleteModal}
                  editMode={editMode}
                  type="outline-danger">
                  Delete this Assessment
                </Button>
              </SidebarRow>
            </SidebarGroup>
          </SidebarContent>
        );
      case ModelTypes.PoolModel:
        return (
          <SidebarContent title="Question Pool" onHide={this.props.onHide}>
            <SidebarGroup label="General">
              <SidebarRow>
                <span>Created </span>
                <Tooltip theme="dark" title={dateFormatted(adjusted(resource.dateCreated))}
                  delay={150} distance={5} size="small" arrowSize="small">
                  {relativeToNowIfLessThanDays(resource.dateCreated, MAX_DAYS)}
                </Tooltip>
              </SidebarRow>
              <SidebarRow>
                <span>Updated </span>
                <Tooltip theme="dark" title={dateFormatted(adjusted(resource.dateUpdated))}
                  delay={150} distance={5} size="small" arrowSize="small">
                  {relativeToNowIfLessThanDays(resource.dateUpdated, MAX_DAYS)}
                </Tooltip>
              </SidebarRow>
            </SidebarGroup>
            <SidebarGroup label="Advanced">
              <SidebarRow>
                <Button
                  className={classes.deleteButton}
                  onClick={this.showDeleteModal}
                  editMode={editMode}
                  type="outline-danger">
                  Delete this Pool
                </Button>
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
        onFocus: () => { },
        context: contentParent.props.context,
        services: contentParent.props.services,
        editMode: contentParent.props.editMode,
        hover: null,
        onUpdateHover: () => { },
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
