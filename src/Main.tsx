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
import Footer from 'components/Footer';
import { CoursesViewSearchable } from './components/CoursesViewSearchable.controller';
import DocumentView from 'components/DocumentView';
import ResourceView from 'components/ResourceView';
import CreateCourseView from 'components/CreateCourseView';
import ObjectiveSkillView from 'components/objectives/ObjectiveSkillView.controller';
import { ImportCourseView } from 'components/ImportCourseView';
import { PLACEHOLDER_ITEM_ID } from 'data/content/org/common';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import Messages from 'components/message/Messages.controller';
import { Resource, ResourceState } from 'data/content/resource';
import { GlobalError } from 'components/GlobalError';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import CourseEditor from 'editors/document/course/CourseEditor.controller';
import { HelpPopover } from 'editors/common/popover/HelpPopover.controller';
import { RouterState } from 'reducers/router';
import { ROUTE } from 'actions/router';
import { ResourceLoading } from 'components/ResourceLoading';

import './Main.scss';

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
  user: UserState;
  modal: ModalState;
  course: Maybe<CourseState>;
  expanded: ExpandedState;
  router: RouterState;
  server: ServerState;
  hover: HoverState;
  onLoad: (courseId: string, documentId: string) => Promise<persistence.Document>;
  onRelease: (documentId: string) => Promise<{}>;
  onSetServerTimeSkew: () => void;
  onLoadCourse: (courseId: string) => Promise<models.CourseModel>;
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

    this.loadCourseIfNecessary();
  }

  loadCourseIfNecessary() {
    const { course, router, onLoadCourse } = this.props;

    router.courseId.lift((courseId) => {
      const courseGuid = course.caseOf({
        just: c => c.guid,
        nothing: () => '',
      });

      if (courseGuid !== courseId) {
        onLoadCourse(courseId);
      }
    });
  }

  componentWillReceiveProps(nextProps: MainProps) {
    if (this.props.router !== nextProps.router) {
      this.loadCourseIfNecessary();
    }
  }

  renderResource(resource: ResourceList) {
    const { onDispatch, server, course } = this.props;

    const orgHelpPopover = (
      <HelpPopover activateOnClick>
        <iframe src="https://www.youtube.com/embed/iJvYU20xU-E" height={500} width={'100%'} />
      </HelpPopover>
    );

    return course.caseOf({
      just: c => (
        <ResourceView
          serverTimeSkewInMs={server.timeSkewInMs}
          course={c}
          title={resource.title}
          resourceType={resource.resourceType}
          filterFn={resource.filterFn}
          createResourceFn={resource.createResourceFn}
          dispatch={onDispatch}
          helpPopover={resource.resourceType === LegacyTypes.organization ? orgHelpPopover : null}
        />
      ),
      nothing: () => (
        <ResourceLoading />
      ),
    });
  }

  getView(): JSX.Element {
    const { expanded, user, course, router, onLoad, onRelease, onDispatch } = this.props;

    switch (router.route) {
      case ROUTE.IMPORT:
        return <ImportCourseView dispatch={onDispatch} />;
      case ROUTE.CREATE:
        return <CreateCourseView dispatch={onDispatch} />;
      case ROUTE.ROOT:
        return <CoursesViewSearchable
          serverTimeSkewInMs={this.props.server.timeSkewInMs}
          userId={user.userId} />;
      case ROUTE.OBJECTIVES:
        return course.caseOf({
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
        });
      case ROUTE.ORGANIZATIONS: {
        return this.renderResource(resources.organizations);
      }
      case ROUTE.PAGES: {
        return this.renderResource(resources.pages);
      }
      case ROUTE.FORMATIVE: {
        return this.renderResource(resources.formativeassessments);
      }
      case ROUTE.SUMMATIVE: {
        return this.renderResource(resources.summativeassessments);
      }
      case ROUTE.POOLS: {
        return this.renderResource(resources.pools);
      }
      default: {
        return course.caseOf({
          just: c => router.resourceId.caseOf({
            just: (resourceId) => {
              if (resourceId === c.guid) {
                return (
                  <CourseEditor
                    model={c}
                    editMode={c.editable} />
                );
              }
              if (resources[resourceId] !== undefined) {
                return this.renderResource(resources[resourceId]);
              }

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
        });
      }
    }
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
          <Messages />
          <Header />
        </div>
        <div className="main-content">
          {this.getView()}
        </div>
        <div className="main-footer">
          <Footer name={user.profile.username} email={user.profile.email} />
        </div>
        {modalDisplay}
      </div>
    );
  }
}
