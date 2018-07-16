import * as React from 'react';
import * as Immutable from 'immutable';
import { bindActionCreators } from 'redux';
import { setServerTimeSkew } from './actions/server';
import { modalActions } from './actions/modal';
import * as viewActions from './actions/view';
import { load, release } from 'actions/document';
import { loadCourse } from 'actions/course';
import { UserState } from 'reducers/user';
import { ModalState } from 'reducers/modal';
import { CourseState } from 'reducers/course';
import { ExpandedState } from 'reducers/expanded';
import { ServerState } from 'reducers/server';
import { HoverState } from 'reducers/hover';
import * as contentTypes from './data/contentTypes';
import * as models from './data/models';
import guid from './utils/guid';
import { LegacyTypes } from './data/types';
import { Maybe } from 'tsmonad';
import Header from './components/Header.controller';
import Footer from './components/Footer';
import { CoursesViewSearchable } from './components/CoursesViewSearchable.controller';
import DocumentView from './components/DocumentView';
import ResourceView from './components/ResourceView';
import Preview from './components/Preview';
import CreateCourseView from './components/CreateCourseView';
import ObjectiveSkillView from './components/objectives/ObjectiveSkillView.controller';
import { ImportCourseView } from './components/ImportCourseView';
import { PLACEHOLDER_ITEM_ID } from './data/content/org/common';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import Messages from './components/message/Messages.controller';
import * as Msg from 'types/messages';
import { getQueryVariableFromString } from 'utils/params';
import * as messageActions from 'actions//messages';
import { Resource, ResourceState } from 'data/content/resource';
import { GlobalError } from 'components/GlobalError';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import './Main.scss';
import CourseEditor from 'editors/document/course//CourseEditor.controller';
import { HelpPopover } from 'editors/common/popover/HelpPopover.controller';

type ResourceList = {
  title: string,
  resourceType: LegacyTypes,
  filterFn: any,
  createResourceFn: any,
};

function res(title, resourceType, filterFn, createResourceFn): ResourceList {
  return {
    title,
    resourceType,
    filterFn,
    createResourceFn,
  };
}

function getPathName(pathname: string): string {
  if (pathname.startsWith('/state')) {
    return '/';
  }
  return pathname;
}

const createOrg = (courseId, title, type) => {
  const g = guid();
  const id = courseId + '_' +
    title.toLowerCase().split(' ')[0] + '_'
    + g.substring(g.lastIndexOf('-') + 1);

  return new models.OrganizationModel().with({
    type,
    id,
    title,
    resource: new contentTypes.Resource().with({ title, id, guid: id }),
    version: '1.0',
  });
};

const resources = {
  organizations: res(
    'Organizations',
    LegacyTypes.organization,
    (resource: Resource) => resource.type === LegacyTypes.organization
      && resource.resourceState !== ResourceState.DELETED,
    createOrg),
  formativeassessments: res(
    'Formative Assessments',
    LegacyTypes.inline,
    (resource: Resource) => resource.type === LegacyTypes.inline
      && resource.resourceState !== ResourceState.DELETED,
    (courseId, title, type) => new models.AssessmentModel({
      type,
      title: contentTypes.Title.fromText(title),
    })),
  summativeassessments: res(
    'Summative Assessments',
    LegacyTypes.assessment2,
    (resource: Resource) => resource.type === LegacyTypes.assessment2
      && resource.resourceState !== ResourceState.DELETED,
    (courseId, title, type) => new models.AssessmentModel({
      type,
      title: contentTypes.Title.fromText(title),
    })),
  pages: res(
    'Workbook Pages',
    LegacyTypes.workbook_page,
    (resource: Resource) => resource.type === LegacyTypes.workbook_page
      && resource.id !== PLACEHOLDER_ITEM_ID
      && resource.resourceState !== ResourceState.DELETED,
    (courseId, title, type) => models.WorkbookPageModel.createNew(
      guid(), title, 'This is a new page with empty content'),
  ),
  pools: res(
    'Question Pools',
    LegacyTypes.assessment2_pool,
    (resource: Resource) => resource.type === LegacyTypes.assessment2_pool
      && resource.resourceState !== ResourceState.DELETED,
    (courseId, title, type) => {
      const q = new contentTypes.Question();
      const questions = Immutable.OrderedMap<string, contentTypes.Question>().set(q.guid, q);
      return new models.PoolModel({
        type,
        pool: new contentTypes.Pool({
          questions, id: guid(),
          title: contentTypes.Title.fromText(title),
        }),
      });
    }),
};

interface MainProps {
  location: any;
  user: UserState;
  modal: ModalState;
  course: CourseState;
  expanded: ExpandedState;
  server: ServerState;
  hover: HoverState;
  onDispatch: (...args: any[]) => any;
  onUpdateHover: (hover: string) => void;
}

interface MainState {
  hasErrored: boolean;
}


/**
 * Main React Component
 */
@DragDropContext(HTML5Backend)
export default class Main extends React.Component<MainProps, MainState> {

  modalActions: Object;
  viewActions: Object;
  error: Object;
  info: Object;

  constructor(props) {
    super(props);
    const { onDispatch } = this.props;

    this.modalActions = bindActionCreators((modalActions as any), onDispatch);
    this.viewActions = bindActionCreators((viewActions as any), onDispatch);

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
    const { onDispatch } = this.props;

    // Fire off the async request to determine server time skew
    onDispatch(setServerTimeSkew());

    this.loadCourseIfNecessary(this.props);
  }

  loadCourseIfNecessary(props: MainProps) {

    const { course, location, onDispatch } = props;
    const url = getPathName(location.pathname);

    switch (url) {
      case '/':
      case '/create':
      case '/import':
        return;
      default:
        const courseId = url.substr(url.indexOf('-') + 1);
        if (course === null || course.guid !== courseId) {
          onDispatch(loadCourse(courseId));
        }
    }

  }

  componentWillReceiveProps(nextProps: MainProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.loadCourseIfNecessary(nextProps);
    }
  }

  renderResource(resource: ResourceList) {
    const { onDispatch, server, course } = this.props;

    const orgHelpPopover = <HelpPopover activateOnClick>
      <iframe src="https://www.youtube.com/embed/iJvYU20xU-E" height={500} width={'100%'} />
    </HelpPopover>;

    return (
      <ResourceView
        serverTimeSkewInMs={server.timeSkewInMs}
        course={course}
        title={resource.title}
        resourceType={resource.resourceType}
        filterFn={resource.filterFn}
        createResourceFn={resource.createResourceFn}
        dispatch={onDispatch}
        helpPopover={resource.resourceType === LegacyTypes.organization ? orgHelpPopover : null} />
    );
  }

  getView(url: string): JSX.Element {
    const { onDispatch, expanded, user, course } = this.props;

    if (url === '/') {
      return <CoursesViewSearchable
              serverTimeSkewInMs={this.props.server.timeSkewInMs}
              userId={user.userId} />;
    }
    if (url === '/create') {
      return <CreateCourseView dispatch={onDispatch} />;
    }
    if (url === '/import') {
      return <ImportCourseView dispatch={onDispatch} />;
    }
    if (url.startsWith('/preview')) {

      const documentId = url.substring(8, url.indexOf('-'));
      const hasParams = url.indexOf('?') !== -1;
      const courseId = hasParams
        ? url.substring(url.indexOf('-') + 1, url.indexOf('?'))
        : url.substr(url.indexOf('-') + 1);
      const query = url.substr(url.indexOf('?') + 1);
      const previewUrl = getQueryVariableFromString('url', query);
      const shouldRefresh = getQueryVariableFromString('refresh', query) === 'true';

      const maybePreviewUrl = previewUrl === null
        ? Maybe.nothing<string>() : Maybe.just(previewUrl);

      return <Preview
        showMessage={(message: Msg.Message) => {
          this.props.onDispatch(messageActions.showMessage(message));
        }}
        dismissMessage={(message: Msg.Message) => {
          this.props.onDispatch(messageActions.dismissSpecificMessage(message));
        }}
        email={this.props.user.profile.email}
        shouldRefresh={shouldRefresh}
        previewUrl={maybePreviewUrl}
        documentId={documentId}
        courseId={courseId} />;

    }
    if (url.startsWith('/objectives-') && course) {
      return <ObjectiveSkillView
        course={course}
        dispatch={onDispatch}
        expanded={expanded}
        userName={user.user} />;
    }

    if (course) {

      const documentId: string = url.substr(1, url.indexOf('-') - 1);

      if (documentId === course.guid) {
        return <CourseEditor
          model={course}
          editMode={true}
        />;
      }
      if (resources[documentId] !== undefined) {
        return this.renderResource(resources[documentId]);
      }

      const onRelease = (docId: string) => onDispatch(release(docId));
      const onLoad = (docId: string) => onDispatch(load(course.guid, docId));

      return (
        <DocumentView
          onLoad={onLoad}
          onRelease={onRelease}
          profile={user.profile}
          course={course}
          userId={user.userId}
          userName={user.user}
          documentId={documentId} />
      );

    }
    return undefined;

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

    const currentView = this.getView(getPathName(this.props.location.pathname));

    return (
      <div className="main" onMouseOver={() => hover && onUpdateHover(null)}>
        <div className="main-header">
          <Messages />
          <Header />
        </div>
        <div className="main-content">
          {currentView}
        </div>
        <div className="main-footer">
          <Footer name={user.profile.username} email={user.profile.email} />
        </div>
        {modalDisplay}
      </div>
    );
  }
}
