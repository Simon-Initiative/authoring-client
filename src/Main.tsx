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
import { LegacyTypes } from 'data/types';
import Header from 'components/Header.controller';
import { CoursesViewSearchable } from './components/CoursesViewSearchable.controller';
import DocumentView from 'components/DocumentView';
import ResourceView from 'components/ResourceView';
import CreateCourseView from 'components/CreateCourseView';
import ObjectiveSkillView from 'components/objectives/ObjectiveSkillView.controller';
import { ImportCourseView } from 'components/ImportCourseView';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import Messages from 'components/message/Messages.controller';
import { Resource } from 'data/content/resource';
import { GlobalError } from 'components/GlobalError';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import CourseEditor from 'editors/document/course/CourseEditor.controller';
import { RouterState } from 'reducers/router';
import { ROUTE } from 'actions/router';
import { ResourceLoading } from 'components/ResourceLoading';
import * as Msg from 'types/messages';
import * as messageActions from 'actions/messages';
import OrgComponentEditor from 'editors/document/org/OrgComponent.controller';
import { controller as OrgDetailsEditor } from 'editors/document/org/OrgDetailsEditor.controller';
import './Main.scss';
import Preview from 'components/Preview';
import { caseOf } from 'utils/utils';
import { NavigationPanel } from 'components/NavigationPanel.controller';
import * as viewActions from 'actions/view';

const createOrg = (courseId, title, courseTitle: string, wbId) => {
  const g = guid();
  const id = courseId + '_' +
    title.toLowerCase().split(' ')[0] + '_'
    + g.substring(g.lastIndexOf('-') + 1);

  const prefix = courseTitle.toLowerCase().startsWith('Welcome')
    ? '' : 'Welcome to ';

  const resourceref = new contentTypes.ResourceRef().with({
    idref: wbId,
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
    id,
    title,
    resource: new contentTypes.Resource().with({ title, id, guid: id }),
    sequences,
    version: '1.0',
  });
};

interface MainProps {
  user: UserState;
  modal: ModalState;
  course: Maybe<CourseState>;
  expanded: ExpandedState;
  router: RouterState;
  server: ServerState;
  hover: HoverState;
  onLoad: (courseId: string, documentId: string) => Promise<persistence.Document>;
  onRelease: (documentId: string) => Promise<{}>;
  onLoadOrg: (courseId: string, documentId: string) => Promise<persistence.Document>;
  onReleaseOrg: (documentId: string) => Promise<{}>;
  onSetServerTimeSkew: () => void;
  onLoadCourse: (courseId: string) => Promise<models.CourseModel>;
  onDispatch: (...args: any[]) => any;
  onUpdateHover: (hover: string) => void;
  onUpdateCourseResources: (updated) => void;
  viewActions: viewActions.ViewActions;
}

interface MainState {
  hasErrored: boolean;
}

/**
 * Main React Component
 */
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

    this.loadCourseIfNecessary(this.props);
  }

  loadCourseIfNecessary(props) {
    const { course, router, onLoadCourse, onLoadOrg } = props;

    router.courseId.lift((courseId) => {
      const courseGuid = course.caseOf({
        just: c => c.guid,
        nothing: () => '',
      });

      if (courseGuid !== courseId) {
        onLoadCourse(courseId);
        router.orgId.lift((orgId) => {
          onLoadOrg(courseId, orgId);
        });
      }
    });
  }

  componentWillReceiveProps(nextProps: MainProps) {
    if (this.props.router !== nextProps.router) {
      this.loadCourseIfNecessary(nextProps);

    }
  }

  onCreateOrg = () => {
    const { course, onUpdateCourseResources, viewActions } = this.props;

    course.lift((c) => {
      const title = 'New Organization';

      const wbId = guid();
      const body = 'This is a new page with empty contents.';
      const wb = models.WorkbookPageModel.createNew(wbId, 'Welcome', body);

      persistence.createDocument(c.guid, wb)
        .then((result) => {

          const resource = createOrg(c.guid, title, c.title, wbId);

          persistence.createDocument(c.guid, resource)
            .then((result) => {
              const r = (result as any).model.resource;

              const updated = Immutable.OrderedMap<string, Resource>([[r.guid, r]]);
              onUpdateCourseResources(updated);

              viewActions.viewDocument(r.guid, c.guid, r.guid);
            });
        });

    });
  }


  renderResources() {
    const { onDispatch, server, course, router } = this.props;

    return course.caseOf({
      just: (c) => {
        // get org id from router or select the first organization
        const currentOrg = router.orgId.caseOf({
          just: guid => c.resources.find(r => r.guid === guid) ||
            c.resources.find(r => r.type === 'x-oli-organization'),
          nothing: () => c.resources.find(r => r.type === 'x-oli-organization'),
        });
        return (
          <ResourceView
            serverTimeSkewInMs={server.timeSkewInMs}
            course={c}
            currentOrg={currentOrg.guid}
            dispatch={onDispatch}
          />
        );
      },
      nothing: () => (
        <ResourceLoading />
      ),
    });
  }

  getView(): JSX.Element {
    const { expanded, user, course, router, onLoad,
      onRelease, onDispatch } = this.props;

    return caseOf<JSX.Element>(router.route)({
      [ROUTE.IMPORT]: (
        <ImportCourseView dispatch={onDispatch} />
      ),
      [ROUTE.CREATE]: (
        <CreateCourseView dispatch={onDispatch} />
      ),
      [ROUTE.PREVIEW]: () => {
        const documentId = router.resourceId;
        const courseId = router.courseId;
        const shouldRefresh = router.urlParams.get('refresh') === 'true';
        const previewUrl = router.urlParams.get('url');
        const maybePreviewUrl = previewUrl ? Maybe.nothing<string>() : Maybe.just(previewUrl);

        return <Preview
          showMessage={(message: Msg.Message) => {
            onDispatch(messageActions.showMessage(message));
          }}
          dismissMessage={(message: Msg.Message) => {
            onDispatch(messageActions.dismissSpecificMessage(message));
          }}
          email={this.props.user.profile.email}
          shouldRefresh={shouldRefresh}
          previewUrl={maybePreviewUrl}
          documentId={documentId.valueOrThrow(new Error('document id must be defined for preview'))}
          courseId={courseId.valueOrThrow(new Error('course id must be defined for preview'))} />;
      },
      [ROUTE.ROOT]: (
        <CoursesViewSearchable
          serverTimeSkewInMs={this.props.server.timeSkewInMs}
          userId={user.userId} />
      ),
    })(
      // if no routes matched above, render navigation panel with editor
      <div className="main-splitview">
        <NavigationPanel
          profile={user.profile}
          onCreateOrg={this.onCreateOrg}
          userId={user.userId}
          userName={user.user} />
        <div className="main-splitview-content">
          {caseOf<JSX.Element>(router.route)({
            [ROUTE.OBJECTIVES]: (
              course.caseOf({
                just: c => (
                  <ObjectiveSkillView
                    course={c}
                    dispatch={onDispatch}
                    expanded={expanded}
                    userName={user.user} />
                ),
                nothing: () => (
                  <ResourceLoading />
                ),
              })
            ),
            [ROUTE.ALL_RESOURCES]: (
              this.renderResources()
            ),
          })(
            // if no routes matched above, render default editor
            course.caseOf({
              just: c => router.resourceId.caseOf({
                just: (resourceId) => {

                  // Course editor
                  if (resourceId === c.guid) {
                    return (
                      <CourseEditor
                        model={c}
                        editMode={c.editable} />
                    );
                  }

                  const orgId = router.orgId.caseOf({
                    just: o => o,
                    nothing: () => null,
                  });

                  // Org editor
                  if (resourceId === orgId) {
                    return <OrgDetailsEditor />;
                  }

                  const res = c.resources.get(resourceId);

                  // Org component
                  if (res === undefined) {
                    return (
                      <OrgComponentEditor
                        componentId={resourceId}
                        editMode={c.editable}
                      />
                    );
                  }

                  // Regular resource
                  return (
                    <DocumentView
                      onLoad={(docId: string) => onLoad(c.guid, docId)}
                      onRelease={(docId: string) => onRelease(docId)}
                      profile={user.profile}
                      course={c}
                      userId={user.userId}
                      userName={user.user}
                      documentId={resourceId} />
                  );
                },
                nothing: () => {
                  return (
                    <CourseEditor
                      model={c}
                      editMode={c.editable} />
                  );
                },
              }),
              nothing: () => (
                <ResourceLoading />
              ),
            }))
          }
        </div>
      </div>,
    );
  }


  render(): JSX.Element {
    const { modal, user, hover, onUpdateHover } = this.props;

    if (this.state.hasErrored) {
      const userName = user === null
        ? ''
        : user.profile.firstName + ' ' + user.profile.lastName;
      const email = user === null
        ? ''
        : user.profile.email;

      return (
        <GlobalError
          info={this.info}
          error={this.error}
          userName={userName}
          email={email}
        />
      );
    }

    if (user === null) {
      return null;
    }

    let modalDisplay = null;
    if (modal.peek() !== undefined) {
      modalDisplay = modal
        .toArray()
        .reverse()
        .map((component, i) => <div key={i}>{component}</div>);
    }

    return (
      <div className="main" onMouseOver={() => hover && onUpdateHover(null)}>
        <div className="main-header">
          <Header />
          <Messages />
        </div>
        <div className="main-content">
          {this.getView()}
        </div>
        {modalDisplay}
      </div>
    );
  }
}
