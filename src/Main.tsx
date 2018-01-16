import * as React from 'react';
import * as Immutable from 'immutable';
import { bindActionCreators } from 'redux';
import { setServerTimeSkew } from './actions/server';
import { modalActions } from './actions/modal';
import * as viewActions from './actions/view';
import { loadCourse } from 'actions/course';
import * as contentTypes from './data/contentTypes';
import * as models from './data/models';
import guid from './utils/guid';
import { LegacyTypes } from './data/types';
import { Maybe } from 'tsmonad';
import Header from './components/Header.controller';
import Footer from './components/Footer';
import CoursesView from './components/CoursesView';
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

import 'react-bootstrap-typeahead/css/Typeahead.css';
import './Main.scss';

type ResourceList = {
  title: string,
  resourceType: string,
  filterFn: any,
  createResourceFn: any,
};

function res(title, resourceType, filterFn, createResourceFn) : ResourceList {
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
        resource => resource.type === LegacyTypes.organization,
        createOrg),
  formativeassessments: res(
        'Formative Assessments',
        LegacyTypes.inline,
        resource => resource.type === LegacyTypes.inline,
        (courseId, title, type) => new models.AssessmentModel({
          type,
          title: new contentTypes.Title({ text: title }),
        })),
  summativeassessments: res(
    'Summative Assessments',
    LegacyTypes.assessment2,
    resource => resource.type === LegacyTypes.assessment2,
    (courseId, title, type) => new models.AssessmentModel({
      type,
      title: new contentTypes.Title({ text: title }),
    })),
  pages: res(
        'Workbook Pages',
        LegacyTypes.workbook_page,
        resource => resource.type === LegacyTypes.workbook_page
          && resource.id !== PLACEHOLDER_ITEM_ID,
        (courseId, title, type) => models.WorkbookPageModel.createNew(
          guid(), title, 'This is a new page with empty content'),
        ),
  pools: res(
        'Question Pools',
        LegacyTypes.assessment2_pool,
        resource => resource.type === LegacyTypes.assessment2_pool,
        (courseId, title, type) => {
          const q = new contentTypes.Question();
          const questions = Immutable.OrderedMap<string, contentTypes.Question>().set(q.guid, q);
          return new models.PoolModel({
            type,
            pool: new contentTypes.Pool({ questions, id: guid(),
              title: new contentTypes.Title({ text: title }) }),
          });
        }),
};

interface MainProps {
  location: any;
  user: any;
  modal: any;
  course: models.CourseModel;
  expanded: any;
  server: any;
  onDispatch: (...args: any[]) => any;
}

interface MainState {

}

/**
 * Main React Component
 */
@DragDropContext(HTML5Backend)
export default class Main extends React.Component<MainProps, MainState> {
  modalActions: Object;
  viewActions: Object;

  constructor(props) {
    super(props);
    const { location, onDispatch } = this.props;

    this.modalActions = bindActionCreators((modalActions as any), onDispatch);
    this.viewActions = bindActionCreators((viewActions as any), onDispatch);

    this.state = {
      current: location,
    };
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

    return (
      <ResourceView
        serverTimeSkewInMs={server.timeSkewInMs}
        course={course}
        title={resource.title}
        resourceType={resource.resourceType}
        filterFn={resource.filterFn}
        createResourceFn={resource.createResourceFn}
        dispatch={onDispatch}/>
    );
  }

  getView(url: string): JSX.Element {
    const { onDispatch, expanded, user, course } = this.props;

    if (url === '/') {
      return <CoursesView dispatch={onDispatch} userId={user.userId}/>;
    }
    if (url === '/create') {
      return <CreateCourseView dispatch={onDispatch}/>;
    }
    if (url === '/import') {
      return <ImportCourseView dispatch={onDispatch}/>;
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
          courseId={courseId}/>;

    }
    if (url.startsWith('/objectives-') && course) {
      return <ObjectiveSkillView
          course={course}
          dispatch={onDispatch}
          expanded={expanded}
          userName={user.user}/>;
    }
    if (course) {
      const documentId = url.substr(1, url.indexOf('-') - 1);

      if (resources[documentId] !== undefined) {
        return this.renderResource(resources[documentId]);
      }
      return (
          <DocumentView
            profile={user.profile}
            dispatch={onDispatch}
            course={course}
            userId={user.userId}
            userName={user.user}
            documentId={documentId} />
      );

    }
    return undefined;

  }


  render(): JSX.Element {
    const { modal, user } = this.props;

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
        <div className="main">
          <div className="main-header">
            <Messages/>
            <Header/>
          </div>
          <div className="main-content">
            {currentView}
          </div>
          <div className="main-footer">
            <Footer/>
          </div>
          {modalDisplay}
        </div>
    );
  }
}
