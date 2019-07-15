import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import * as persistence from 'data/persistence';
import { UserState } from 'reducers/user';
import { ModalState } from 'reducers/modal';
import { CourseState } from 'reducers/course';
import { ExpandedState } from 'reducers/expanded';
import { ServerState } from 'reducers/server';
import { HoverState } from 'reducers/hover';
import * as contentTypes from 'data/contentTypes';
import * as models from 'data/models';
import guid from 'utils/guid';
import Header from 'components/Header.controller';
import { CoursesViewSearchable } from './components/CoursesViewSearchable.controller';
import DocumentView from 'components/DocumentView';
import ResourceView from 'components/ResourceView';
import CreateCourseView from 'components/CreateCourseView';
import { ObjectiveSkillView } from 'components/objectives/ObjectiveSkillView.controller';
import { ImportCourseView } from 'components/ImportCourseView';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import Messages from 'components/message/Messages.controller';
import { Resource } from 'data/content/resource';
import { GlobalError } from 'components/GlobalError';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import CourseEditor from 'editors/document/course/CourseEditor.controller';
import { RouterState } from 'reducers/router';
import { ResourceLoading } from 'components/ResourceLoading';
import * as Msg from 'types/messages';
import * as messageActions from 'actions/messages';
import OrgComponentEditor from 'editors/document/org/OrgComponent.controller';
import { controller as OrgDetailsEditor } from 'editors/document/org/OrgDetailsEditor.controller';
import './Main.scss';
import Preview from 'components/Preview';
import { NavigationPanel } from 'components/NavigationPanel.controller';
import * as viewActions from 'actions/view';
import { NEW_PAGE_CONTENT } from 'data/models/workbook';
import { FourZeroFour } from 'components/404';
import { OrganizationModel } from 'data/models/org';
import {
  LegacyTypes, CourseIdVers, DocumentId, ResourceId, ResourceGuid,
} from 'data/types';

interface MainProps {
  user: UserState;
  modal: ModalState;
  course: CourseState;
  expanded: ExpandedState;
  router: RouterState;
  server: ServerState;
  hover: HoverState;
  onLoad: (courseId: CourseIdVers, documentId: DocumentId) => Promise<persistence.Document>;
  onRelease: (documentId: DocumentId) => Promise<{}>;
  onSetServerTimeSkew: () => void;
  onLoadCourse: (courseId: CourseIdVers) => Promise<models.CourseModel>;
  onDispatch: (...args: any[]) => any;
  onUpdateHover: (hover: string) => void;
  onUpdateCourseResources: (updated) => void;
}

interface MainState {
  hasErrored: boolean;
}

@DragDropContext(HTML5Backend)
export default class Main extends React.Component<MainProps, MainState> {
  error: Object;
  info: Object;

  constructor(props) {
    super(props);

    this.state = {
      hasErrored: false,
    };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.error = error;
    this.info = info;

    this.setState({ hasErrored: true });
  }

  componentDidMount() {
    const { onSetServerTimeSkew } = this.props;

    // Fire off the async request to determine server time skew
    onSetServerTimeSkew();
  }

  onCreateOrg = () => {
    const { course, onUpdateCourseResources } = this.props;

    const title = 'New Organization';
    const wbId = guid();
    const body = NEW_PAGE_CONTENT;
    const wb = models.WorkbookPageModel.createNew(wbId, 'Welcome', body);
    persistence.createDocument(course.idvers, wb)
      .then((result) => {
        const resource = createOrg(course.idvers, title, course.title, wbId);
        persistence.createDocument(course.idvers, resource)
          .then((result) => {
            const r = (result.model as OrganizationModel).resource;
            const updated = Immutable.OrderedMap<string, Resource>([[r.guid, r]]);
            onUpdateCourseResources(updated);
            viewActions.viewDocument(r.id, course.idvers, Maybe.just(r.id));
          });
      });
  }

  render(): JSX.Element {
    const { modal, user, hover, router, onUpdateHover, onDispatch,
      course, server, expanded, onLoad, onRelease } = this.props;
    const { route } = router;

    if (this.state.hasErrored) {
      return (
        <GlobalError
          info={this.info}
          error={this.error}
        />
      );
    }

    if (user === null) {
      return null;
    }

    return (
      <div className="main" onMouseOver={() => hover && onUpdateHover(null)}>
        <div className="main-header">
          <Header />
          <Messages />
        </div>
        {Maybe.maybe(modal.peek()).caseOf({
          nothing: () => undefined,
          just: m => modal
            .toArray()
            .reverse()
            .map((component, i) => <div key={i}>{component}</div>),
        })}
        <div className="main-content">
          {(() => {
            switch (route.type) {
              case 'RouteRoot':
                return <CoursesViewSearchable
                  serverTimeSkewInMs={this.props.server.timeSkewInMs}
                  userId={user.userId} />;
              case 'RouteCreate':
                return <CreateCourseView userName={user.user} dispatch={onDispatch} />;
              case 'RouteImport': return <ImportCourseView dispatch={onDispatch} />;
              case 'RouteMissing': return <FourZeroFour />;
              case 'RouteLoading': return <ResourceLoading />;
              case 'RouteCourse': {
                switch (route.route.type) {
                  case 'RoutePreview':
                    return <Preview
                      showMessage={(message: Msg.Message) =>
                        onDispatch(messageActions.showMessage(message))}
                      dismissMessage={(message: Msg.Message) =>
                        onDispatch(messageActions.dismissSpecificMessage(message))}
                      email={this.props.user.profile.email}
                      shouldRefresh={router.params.get('refresh') === 'true'}
                      previewUrl={Maybe.maybe(router.params.get('url'))}
                      documentId={route.orgId.valueOr(ResourceId.of(''))}
                      courseIdVers={route.courseId} />;
                  default: {
                    return Maybe.maybe(course).caseOf({
                      nothing: () => <ResourceLoading />,
                      just: loadedCourse => (
                        <div className="main-splitview">
                          <NavigationPanel
                            course={loadedCourse}
                            route={route}
                            profile={user.profile}
                            onCreateOrg={this.onCreateOrg}
                            userId={user.userId}
                            userName={user.user} />
                          <div className="main-splitview-content">
                            {(() => {
                              switch (route.route.type) {
                                case 'RouteObjectives':
                                  return <ObjectiveSkillView
                                    course={loadedCourse}
                                    dispatch={onDispatch}
                                    expanded={expanded}
                                    userName={user.user} />;
                                case 'RouteAllResources':
                                  return <ResourceView
                                    serverTimeSkewInMs={server.timeSkewInMs}
                                    course={loadedCourse}
                                    currentOrg={route.orgId.valueOr(ResourceId.of(''))}
                                    dispatch={onDispatch}
                                  />;
                                case 'RouteOrganizations':
                                // Consider creating a page for the organizations
                                case 'RouteSkills':
                                // Consider creating a page for all skills
                                case 'RouteCourseOverview':
                                  return <CourseEditor
                                    model={loadedCourse}
                                    editMode={loadedCourse.editable} />;
                                case 'RouteOrgComponent':
                                  return <OrgComponentEditor
                                    course={loadedCourse}
                                    componentId={route.route.id}
                                    editMode={loadedCourse.editable}
                                  />;
                                case 'RouteResource': {
                                  const routeResource = route.route;

                                  // RouteResource can be one of two views:
                                  // 1. Organization editor
                                  // 2. Document/resource editor

                                  const isOrgEditorView = route.orgId.caseOf({
                                    just: orgId => orgId.eq(routeResource.id),
                                    nothing: () => false,
                                  });

                                  if (isOrgEditorView) {
                                    return <OrgDetailsEditor course={loadedCourse} />;
                                  }

                                  // If we accidentally stored a resource GUID in the route
                                  // instead of an ID, use the Id instead
                                  const resourceId = loadedCourse.resourcesById
                                    .get(routeResource.id.value())
                                    ? routeResource.id
                                    : loadedCourse.resources
                                      .get(routeResource.id.value(), {} as any).id;

                                  return <DocumentView
                                    onLoad={(docId: DocumentId) =>
                                      onLoad(loadedCourse.idvers, docId)}
                                    onRelease={(docId: DocumentId) => onRelease(docId)}
                                    profile={user.profile}
                                    orgId={route.orgId.valueOr(ResourceId.of(''))}
                                    course={loadedCourse}
                                    userId={user.userId}
                                    userName={user.user}
                                    documentId={resourceId} />;
                                }
                              }
                            })()}
                          </div>
                        </div>
                      ),
                    });
                  }
                }
              }
            }
          })()}
        </div>
      </div>
    );
  }
}

const createOrg = (courseId: CourseIdVers, title, courseTitle: string, wbId: string) => {
  const g = guid();
  const id = courseId.value() + '_' +
    title.toLowerCase().split(' ')[0] + '_'
    + g.substring(g.lastIndexOf('-') + 1);

  const prefix = courseTitle.toLowerCase().startsWith('Welcome')
    ? '' : 'Welcome to ';
  const resourceref = new contentTypes.ResourceRef().with({
    idref: ResourceId.of(wbId),
  });
  const item = new contentTypes.Item().with({
    resourceref,
  });
  const module = new contentTypes.Module().with({
    title: prefix + courseTitle,
    children: Immutable.OrderedMap<string, any>([[item.guid, item]]),
  });
  const unit = new contentTypes.Unit().with({
    title: prefix + courseTitle,
    children: Immutable.OrderedMap<string, any>([[module.guid, module]]),
  });
  const sequence = new contentTypes.Sequence().with({
    title: courseTitle,
    children: Immutable.OrderedMap<string, any>([[unit.guid, unit]]),
  });
  const sequences = new contentTypes.Sequences().with({
    children: Immutable.OrderedMap<string, any>([[sequence.guid, sequence]]),
  });

  return new models.OrganizationModel().with({
    type: LegacyTypes.organization,
    id: ResourceId.of(id),
    title,
    resource: new contentTypes.Resource().with({
      title,
      id: ResourceId.of(id),
      guid: ResourceGuid.of(id),
    }),
    sequences,
    version: '1.0',
  });
};
