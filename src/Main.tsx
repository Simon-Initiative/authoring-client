import * as React from 'react';
import * as Immutable from 'immutable';
import { returnType } from './utils/types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setServerTimeSkew } from './actions/server';
import { user as userActions } from './actions/user';
import { modalActions } from './actions/modal';
import { CurrentCourse } from './reducers/course';
import { ServerInformation } from './reducers/server';
import { UserInfo } from './reducers/user';
import { TitleOracle } from './editors/common/TitleOracle';
import * as viewActions from './actions/view';
import * as contentTypes from './data/contentTypes';
import * as models from './data/models';
import guid from './utils/guid';
import { LegacyTypes } from './data/types';
import history from './utils/history';
import Header from './components/Header';
import Footer from './components/Footer';
import CoursesView from './components/CoursesView';
import DocumentView from './components/DocumentView';
import ResourceView from './components/ResourceView';
import CreateCourseView from './components/CreateCourseView';
import { ObjectiveSkillView } from './components/objectives/ObjectiveSkillView';
import { PLACEHOLDER_ITEM_ID } from './data/content/org/common';

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
  } else {
    return pathname;
  }
}

const createOrg = (courseId, title, type) => {

  const g = guid();
  const id = courseId + '_' +
    title.toLowerCase().split(' ')[0] + '_' 
    + g.substring(g.lastIndexOf('-') + 1);

  return new models.OrganizationModel().with({
    resource: new contentTypes.Resource().with({ id, guid: id, title }),
    type,
    id,
    version: '1.0',
    title,
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
            pool: new contentTypes.Pool({ id: guid(), questions, 
              title: new contentTypes.Title({ text: title }) }),
          });
        }),
};

function mapStateToProps(state: any) {
  const {
    user,
    modal,
    course,
    expanded,
    server,
  } = state;

  return {
    user,
    modal,
    course,
    expanded,
    server,
  };
}

/**
 * declare interfaces and types
 */
interface Main {
  modalActions: Object;
  viewActions: Object;
  unlisten: any;
}

interface MainOwnProps {
  location: any;
}

interface MainState {
  current: any;
}

interface MainReduxProps {
  course: CurrentCourse;
  expanded: TitleOracle;
  modal: Immutable.Stack<any>;
  server: ServerInformation;
  user: UserInfo;
}

type MainProps = MainReduxProps & MainOwnProps & { dispatch };

/**
 * Main React Component
 */
class Main extends React.Component<MainProps, MainState> {
  constructor(props) {
    super(props);

    this.modalActions = bindActionCreators((modalActions as any), this.props.dispatch);
    this.viewActions = bindActionCreators((viewActions as any), this.props.dispatch);
    
    this.state = {
      current: this.props.location,
    };
  }

  componentDidMount() {
    this.unlisten = history.listen((current) => {
      this.setState({ current }, () => window.scrollTo(0, 0));
    });

    // Fire off the async request to determine server time skew
    this.props.dispatch(setServerTimeSkew());
  
  }

  componentWillUnmount() {
    this.unlisten();
  }

  renderResource(resource: ResourceList) {
    return <ResourceView
              serverTimeSkewInMs={this.props.server.timeSkewInMs}
              title={resource.title}
              resourceType={resource.resourceType}
              filterFn={resource.filterFn}
              createResourceFn={resource.createResourceFn}
              dispatch={this.props.dispatch}/>;
  }

  getView(url: string): JSX.Element {
    if (url === '/') {
      return <CoursesView dispatch={this.props.dispatch} userId={this.props.user.userId}/>;
    } else if (url === '/create') {
      return <CreateCourseView dispatch={this.props.dispatch}/>;

    } else if (url.startsWith('/objectives-')) {
      return <ObjectiveSkillView 
          course={this.props.course} 
          dispatch={this.props.dispatch}
          expanded={this.props.expanded}
          userName={this.props.user.user}/>;

    } else {

      const firstPart = url.substr(1, url.indexOf('-') - 1);

      if (resources[firstPart] !== undefined) {
        return this.renderResource(resources[firstPart]);
      } else {
        const documentId = firstPart;
        return <DocumentView
              profile={this.props.user.profile}
              dispatch={this.props.dispatch}
              course={this.props.course}
              userId={this.props.user.userId}
              userName={this.props.user.user}
              documentId={documentId}/>;
      }
    }
 
  }

  render() {
    if (this.props.user === null) {
      return null;
    }

    let modalDisplay = null;
    if (this.props.modal.peek() !== undefined) {
      modalDisplay = this.props.modal
        .toArray()
        .reverse()
        .map((component, i) => <div key={i}>{component}</div>);
    }
    
    const currentView = this.getView(getPathName(this.state.current.pathname));
    const logoutUrl = this.props.user !== null ? this.props.user.logoutUrl : '';

    return (
      <div>
        <Header dispatch={this.props.dispatch} logoutUrl={logoutUrl}/>
        {currentView}
        <Footer dispatch={this.props.dispatch}/>
        {modalDisplay}
      </div>
    );
  }

}

export default connect<MainReduxProps, {}, MainOwnProps>(mapStateToProps)(Main);
