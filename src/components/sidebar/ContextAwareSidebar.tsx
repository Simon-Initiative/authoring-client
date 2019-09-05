import * as React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import * as persistence from 'data/persistence';
import { Maybe } from 'tsmonad';
import { StyledComponentProps } from 'types/component';
import { withStyles, classNames } from 'styles/jss';
import {
  RenderContext, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ParentContainer } from 'types/active';
import { getEditorByContentType } from 'editors/content/container/registry';
import { Resource, ResourceState } from 'data/content/resource';
import {
  ModelTypes, ContentModel, AssessmentModel, CourseModel, OrganizationModel,
} from 'data/models';
import { AppContext } from 'editors/common/AppContext';
import { AppServices } from 'editors/common/AppServices';
import { PageSelection } from 'editors/document/assessment/PageSelection';
import { createMultipleChoiceQuestion }
  from 'editors/content/question/addquestion/questionFactories';
import { TextInput } from 'editors/content/common/TextInput';
import { LegacyTypes } from 'data/types';
import { DeleteResourceModal } from 'components/DeleteResourceModal.controller';
import {
  styles, SIDEBAR_CLOSE_ANIMATION_DURATION_MS,
} from 'components/sidebar/ContextAwareSidebar.styles';
import { relativeToNow, adjustForSkew, dateFormatted } from 'utils/date';
import { Tooltip } from 'utils/tooltip';
import { ContentElement } from 'data/content/common/interfaces';
import { Button } from 'editors/content/common/Button';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import ModalPrompt from 'utils/selection/ModalPrompt';
import { splitQuestionsIntoPages } from 'data/models/utils/assessment';
import { CombinationsMap } from 'types/combinations';
import { Edge } from 'types/edge';
import { CourseState } from 'reducers/course';
import { viewDocument, viewOrganizations } from 'actions/view';
import { getNameAndIconByType } from 'components/ResourceView';
import ContiguousTextToolbar
  from 'editors/content/learning/contiguoustext/ContiguousTextToolbar.controller';

interface SidebarRowProps {
  label?: string;
}

export const SidebarRow = withStyles<SidebarRowProps>(styles)(({
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

const SidebarHeader = withStyles<SidebarHeaderProps>(styles)(({
  classes, title, onHide,
}) => {
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
export const SidebarContent = withStyles<SidebarContentProps>(styles)(({
  className, classes, children, title, onHide,
}) => {
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
export const SidebarGroup = withStyles<SidebarGroupProps>(styles)(({
  className, classes, children, label,
}) => {
  return (
    <div className={classNames([classes.sidebarGroup, className])}>
      <div className={classes.sidebarGroupLabel}>{label}</div>
      {children}
    </div>
  );
});

export interface ContextAwareSidebarProps {
  className?: string;
  content: Maybe<ContentElement>;
  container: Maybe<ParentContainer>;
  context: AppContext;
  course: CourseState;
  editMode: boolean;
  services: AppServices;
  resource: Resource;
  model: ContentModel;
  currentPage: string;
  selectedOrganization: Maybe<OrganizationModel>;
  onEditModel: (model: ContentModel) => void;
  supportedElements: Immutable.List<string>;
  show: boolean;
  sidebarContent: JSX.Element;
  onInsert: (content: ContentElement, textSelection) => void;
  onEdit: (content: ContentElement) => void;
  onHide: () => void;
  onSetCurrentNodeOrPage: (documentId: string, nodeOrPageId: contentTypes.Node | string) => void;
  onDisplayModal: (component: any) => void;
  onDismissModal: () => void;
  timeSkewInMs: number;
  onGetChoiceCombinations: (comboNum: number) => CombinationsMap;
  onDuplicate: (model: ContentModel) => void;
}

export interface ContextAwareSidebarState {
  resourceRefs: Maybe<Edge[]>;
  failedLoading: boolean;
}

/**
 * React Component for Context Aware Sidebar
 */
class ContextAwareSidebar
  extends React.PureComponent<
  StyledComponentProps<ContextAwareSidebarProps, typeof styles>, ContextAwareSidebarState> {

  constructor(props) {
    super(props);

    this.state = {
      resourceRefs: Maybe.nothing(),
      failedLoading: false,
    };
    this.onRemovePage = this.onRemovePage.bind(this);
    this.onPageEdit = this.onPageEdit.bind(this);
    this.onAddPage = this.onAddPage.bind(this);
    this.onToggleBranching = this.onToggleBranching.bind(this);
  }
  componentDidMount() {
    this.fetchRefs(this.props);
  }

  fetchRefs(props: ContextAwareSidebarProps) {
    const { course, resource } = props;

    persistence.fetchEdges(course.guid).then((edges) => {
      // returns a list of edges pointing to the current page, with no edges sharing the same source
      const sources: Edge[] = edges.filter(edge => this.stripId(edge.destinationId) === resource.id)
        .reduce((prev: { usedResources: any, edges: Edge[] }, edge) => {
          if (prev.usedResources[edge.sourceId]) {
            return prev;
          }
          prev.usedResources[edge.sourceId] = edge;
          prev.edges.push(edge);
          return prev;
        }, { usedResources: {}, edges: [] }).edges;

      this.setState({
        resourceRefs: Maybe.just(sources),
        failedLoading: false,
      });
    }).catch(() => {
      this.setState({
        failedLoading: true,
      });
    });
  }

  stripId(id: string) {
    const splits = id.split(':');
    if (splits.length === 3) {
      return splits[2];
    }
  }

  onRemovePage(page: contentTypes.Page) {
    const { context, model, onEditModel, onSetCurrentNodeOrPage, currentPage } = this.props;
    const assessmentModel = model as AssessmentModel;

    if (assessmentModel.pages.size > 1) {
      const guid = page.guid;
      const removed = assessmentModel.with({ pages: assessmentModel.pages.delete(guid) });

      if (guid === currentPage) {
        onSetCurrentNodeOrPage(context.documentId, removed.pages.last().guid);
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
    const { model, onEditModel, onGetChoiceCombinations } = this.props;
    const assessmentModel = model as AssessmentModel;

    const text = 'New Page ' + (assessmentModel.pages.size + 1);
    let page = new contentTypes.Page()
      .with({ title: contentTypes.Title.fromText(text) });

    const question = createMultipleChoiceQuestion('single', onGetChoiceCombinations);

    page = page.with({
      nodes: page.nodes.set(question.guid, question),
    });

    onEditModel(
      assessmentModel.with({
        pages: assessmentModel.pages.set(page.guid, page),
      }),
    );
  }

  onToggleBranching() {
    const { model, onEditModel, onDisplayModal, onDismissModal } = this.props;

    const toggleBranching = (model: AssessmentModel) => onEditModel(model);

    const assessmentModel = model as AssessmentModel;
    const newModel = assessmentModel.with({
      branching: !assessmentModel.branching,
    });

    if (!assessmentModel.branching) {
      onDisplayModal(
        <ModalPrompt
          text={'Branching assessments allow you to conditionally show or hide questions based \
          on a students\' responses.\n\nDo you want to convert this into a branching assessment? \
          The assessment will need to be restructured if reverted back into a normal assessment.'}
          onInsert={() => {
            toggleBranching(splitQuestionsIntoPages(newModel));
            onDismissModal();
          }}
          onCancel={() => onDismissModal()}
          okLabel="Yes"
          okClassName="primary"
          cancelLabel="No"
        />,
      );
    } else {
      toggleBranching(newModel);
    }
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
      model, resource, editMode, currentPage, onSetCurrentNodeOrPage,
      onEditModel, classes, course, selectedOrganization,
    } = this.props;

    const { resourceRefs } = this.state;

    const adjusted = (date: Date): Date => adjustForSkew(date, this.props.timeSkewInMs);

    const MAX_DAYS = 30;
    const relativeToNowIfLessThanDays = (date: Date, days: number) => {
      const maxMilliseconds = days * 24 * 60 * 60 * 1000;
      return (adjusted(new Date()).getMilliseconds()
        - adjusted(date).getMilliseconds() < maxMilliseconds)
        ? relativeToNow(date)
        : dateFormatted(date);
    };

    const idDisplay = (
      <SidebarGroup label="OLI Identifier">
        <SidebarRow>
          <Tooltip title={resource.id}
            delay={150} distance={5} size="small" arrowSize="small">
            {resource.id}
          </Tooltip>
        </SidebarRow>
      </SidebarGroup>
    );

    const stripId = (id: string) => {
      const splits = id.split(':');
      if (splits.length === 3) {
        return splits[2];
      }
    };

    const getRefResourceFromRef = (ref: Edge) => {
      const id = stripId(ref.sourceId);
      return course.resourcesById.get(id);
    };

    const orgGuid = selectedOrganization.caseOf({
      just: (organization) => {
        return organization.guid;
      },
      nothing: () => '',
    });

    const referenceLocations = (
      <SidebarGroup label="Referenced Locations">
        <SidebarRow>
          <div className="page-list">
            {resourceRefs.caseOf({
              just: (refs) => {
                return refs.length > 0
                  ? (
                    <div className="container">

                      {
                        refs.map(ref => getRefResourceFromRef(ref))
                          .filter(res => res !== undefined &&
                            res.resourceState !== ResourceState.DELETED)
                          .sort((a, b) => {
                            if (a.type === b.type) {
                              return (a.title < b.title ? -1 : 1);
                            }
                            if (a.type === 'x-oli-organization') {
                              return -1;
                            }
                            if (b.type === 'x-oli-organization') {
                              return 1;
                            }
                            if (a.type === 'x-oli-workbook_page') {
                              return -1;
                            }
                            if (b.type === 'x-oli-workbook_page') {
                              return 1;
                            }
                            return 0;
                          })
                          .map(res => (
                            <div key={res.guid} className="ref-thing">
                              <a href="#" onClick={(event) => {
                                event.preventDefault();
                                // if link is to org, just switch org and stay on current page
                                if (res.type === 'x-oli-organization') {
                                  viewDocument(resource.id, course.idvers,
                                    Maybe.maybe(res.id));
                                } else {
                                  viewDocument(res.id, course.idvers, Maybe.nothing());
                                }
                              }
                              }>
                                <span style={{ width: 26, textAlign: 'center', marginRight: 5 }}>
                                  {
                                    getNameAndIconByType(res.type).icon}
                                </span>
                                {res.title}
                              </a>
                            </div>
                          ))}
                    </div>
                  ) : (
                    <div>No references found</div>
                  );
              },
              nothing: () => <div>{this.state.failedLoading ? 'Error loading'
                : 'Loading references'}</div>,
            },
            )
            }
          </div>
        </SidebarRow>
      </SidebarGroup>
    );

    switch (model.modelType) {
      case ModelTypes.WorkbookPageModel:
        return (
          <SidebarContent title="Workbook Page" onHide={this.props.onHide}>
            <SidebarGroup label="General">
              <SidebarRow>
                <Tooltip title={dateFormatted(adjusted(resource.dateCreated))}
                  delay={150} distance={5} size="small" arrowSize="small">
                  Created {relativeToNowIfLessThanDays(resource.dateCreated, MAX_DAYS)}
                </Tooltip>
              </SidebarRow>
              <SidebarRow>
                <Tooltip title={dateFormatted(adjusted(resource.dateUpdated))}
                  delay={150} distance={5} size="small" arrowSize="small">
                  Updated {relativeToNowIfLessThanDays(resource.dateUpdated, MAX_DAYS)}
                </Tooltip>
              </SidebarRow>
            </SidebarGroup>
            {idDisplay}
            {referenceLocations}
            <SidebarGroup label="Advanced">
              <SidebarRow>
                <Button
                  className={classes.dupeButton}
                  onClick={() => this.props.onDuplicate(this.props.model)}
                  editMode={editMode}>
                  Duplicate this Page
                </Button>
              </SidebarRow>
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
        const title = model.type === LegacyTypes.inline
          ? 'Formative Assessment'
          : 'Summative Assessment';

        return (
          <SidebarContent title={title} onHide={this.props.onHide}>
            <SidebarGroup label="General">
              <SidebarRow>
                <Tooltip title={dateFormatted(adjusted(resource.dateCreated))}
                  delay={150} distance={5} size="small" arrowSize="small">
                  Created {relativeToNowIfLessThanDays(resource.dateCreated, MAX_DAYS)}
                </Tooltip>
              </SidebarRow>
              <SidebarRow>
                <Tooltip title={dateFormatted(adjusted(resource.dateUpdated))}
                  delay={150} distance={5} size="small" arrowSize="small">
                  Updated {relativeToNowIfLessThanDays(resource.dateUpdated, MAX_DAYS)}
                </Tooltip>
              </SidebarRow>
            </SidebarGroup>
            {idDisplay}
            {referenceLocations}
            {/* Branching assessments require a specific page structuring,
            so they cannot be modified by the user */}
            {model.branching
              ? null
              : <SidebarGroup label="Pages">
                <SidebarRow>
                  <PageSelection
                    {...this.props}
                    onFocus={() => { }}
                    onRemove={this.onRemovePage}
                    editMode={editMode}
                    pages={model.pages}
                    current={model.pages.get(currentPage)}
                    onChangeCurrent={(newPage) => {
                      onSetCurrentNodeOrPage(this.props.context.documentId, newPage);
                    }}
                    onEdit={this.onPageEdit} />
                  <Button
                    editMode={editMode}
                    type="secondary" className="btn btn-sm"
                    onClick={this.onAddPage}>
                    Add Page
                </Button>
                </SidebarRow>
              </SidebarGroup>}
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
                  className={classes.dupeButton}
                  onClick={() => this.props.onDuplicate(this.props.model)}
                  editMode={editMode}>
                  Duplicate this Assessment
                </Button>
              </SidebarRow>
              <SidebarRow>
                {model.type === LegacyTypes.inline
                  ? <React.Fragment><ToggleSwitch
                    checked={model.branching}
                    label="Branching Assessment"
                    onClick={this.onToggleBranching} />
                    <p></p></React.Fragment>
                  : null}
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
                <Tooltip title={dateFormatted(adjusted(resource.dateCreated))}
                  delay={150} distance={5} size="small" arrowSize="small">
                  Created {relativeToNowIfLessThanDays(resource.dateCreated, MAX_DAYS)}
                </Tooltip>
              </SidebarRow>
              <SidebarRow>
                <Tooltip title={dateFormatted(adjusted(resource.dateUpdated))}
                  delay={150} distance={5} size="small" arrowSize="small">
                  Updated {relativeToNowIfLessThanDays(resource.dateUpdated, MAX_DAYS)}
                </Tooltip>
              </SidebarRow>
            </SidebarGroup>
            {idDisplay}
            {referenceLocations} {/* take src type as an argument?*/}
            <SidebarGroup label="Advanced">
              <SidebarRow>
                <Button
                  className={classes.dupeButton}
                  onClick={() => this.props.onDuplicate(this.props.model)}
                  editMode={editMode}>
                  Duplicate this Pool
                </Button>
              </SidebarRow>
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
      case ModelTypes.FeedbackModel:
        return (
          <SidebarContent title="Survey" onHide={this.props.onHide}>
            <SidebarGroup label="General">
              <SidebarRow>
                <Tooltip title={dateFormatted(adjusted(resource.dateCreated))}
                  delay={150} distance={5} size="small" arrowSize="small">
                  Created {relativeToNowIfLessThanDays(resource.dateCreated, MAX_DAYS)}
                </Tooltip>
              </SidebarRow>
              <SidebarRow>
                <Tooltip title={dateFormatted(adjusted(resource.dateUpdated))}
                  delay={150} distance={5} size="small" arrowSize="small">
                  Updated {relativeToNowIfLessThanDays(resource.dateUpdated, MAX_DAYS)}
                </Tooltip>
              </SidebarRow>
            </SidebarGroup>
            {idDisplay}
            {referenceLocations}
            <SidebarGroup label="Advanced">
              <SidebarRow>
                <Button
                  className={classes.dupeButton}
                  onClick={() => this.props.onDuplicate(this.props.model)}
                  editMode={editMode}>
                  Duplicate this Survey
                </Button>
              </SidebarRow>
              <SidebarRow>
                <Button
                  className={classes.deleteButton}
                  onClick={this.showDeleteModal}
                  editMode={editMode}
                  type="outline-danger">
                  Delete this Survey
              </Button>
              </SidebarRow>
            </SidebarGroup>
          </SidebarContent>
        );
      default:
        return null;
    }
  }

  renderSidebarContent(contentRenderer, contentElement) {
    return (
      <div>
        {contentRenderer}
      </div>
    );
  }

  render() {
    const {
      classes, className, content, container, show, sidebarContent, onEdit } = this.props;

    const contentElement = content.caseOf({
      just: c => c,
      nothing: () => undefined,
    });

    const contentParent = container.caseOf({
      just: c => c,
      nothing: () => undefined,
    });

    let contentRenderer: JSX.Element;
    if (contentParent && contentElement) {
      const props: AbstractContentEditorProps<any> = {
        renderContext: RenderContext.Sidebar,
        model: contentElement,
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

      if (contentElement.contentType === 'ContiguousText') {
        contentRenderer = <ContiguousTextToolbar {...props} />;
      } else {
        contentRenderer = React.createElement(
          getEditorByContentType((contentElement as any).contentType), props);
      }

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
              {sidebarContent
                ? sidebarContent
                : contentRenderer
                  ? this.renderSidebarContent(contentRenderer, contentElement)
                  : this.renderPageDetails()}
            </div>
          </div>
          : null
        }
      </ReactCSSTransitionGroup>
    );
  }
}

const StyledContextAwareSidebar = withStyles<ContextAwareSidebarProps>(styles)(ContextAwareSidebar);
export { StyledContextAwareSidebar as ContextAwareSidebar };
