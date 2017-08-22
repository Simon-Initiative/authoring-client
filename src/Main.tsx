import * as React from 'react';
import * as Immutable from 'immutable';
import { returnType } from './utils/types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { user as userActions } from './actions/user';
import { modalActions } from './actions/modal';
import * as viewActions from './actions/view';
import * as contentTypes from './data/contentTypes';
import * as models from './data/models';
import guid from './utils/guid';

import history from './utils/history';
import Header from './components/Header';
import Footer from './components/Footer';
import CoursesView from './components/CoursesView';
import DocumentView from './components/DocumentView';
import LoginView from './components/LoginView';
import ResourceView from './components/ResourceView';
import CreateCourseView from './components/CreateCourseView';

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

const resources = {
  organizations: res(
        'Organizations',
        'x-oli-organization',
        resource => resource.type === 'x-oli-organization',
        (title, type) => new models.OrganizationModel().with({
          type,
          version: '1.0',
          title,
        })),
  assessments: res(
        'Assessments',
        'x-oli-assessment',
        resource => resource.type === 'x-oli-inline-assessment'
        || resource.type === 'x-oli-assessment2',
        (title, type) => new models.AssessmentModel({
          type,
          title: new contentTypes.Title({ text: title }),
        })),
  pages: res(
        'Workbook Pages',
        'x-oli-workbook_page',
        resource => resource.type === 'x-oli-workbook_page',
        (title, type) => models.WorkbookPageModel.createNew(
          guid(), title, 'This is a new page with empty content'),
        ),
  objectives: res(
        'Learning Objectives',
        'x-oli-learning_objectives',
        resource => resource.type === 'x-oli-learning_objectives',
        (title, type) => new models.LearningObjectiveModel({
          type,
          title,
          id:title.split(' ')[0] + guid(),
        })),
  skills: res(
        'Skills',
        'x-oli-skills_model',
        resource => resource.type === 'x-oli-skills_model',
        (title, type) => new models.SkillModel({
          type,
          title: new contentTypes.Title({ text: title }),
          resource: new contentTypes.Resource({ id:title.split(' ')[0] + guid(), title }),
        })),
  pools: res(
        'Question Pools',
        'x-oli-assessment2-pool',
        resource => resource.type === 'x-oli-assessment2-pool',
        (title, type) => {
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
  } = state;

  return {
    user,
    modal,
    course,
  };
}

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

const stateGeneric = returnType(mapStateToProps);
type MainReduxProps = typeof stateGeneric;
type MainProps = MainReduxProps & MainOwnProps & { dispatch };

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
  }

  componentWillUnmount() {
    this.unlisten();
  }
//// course={this.props.course}
  renderResource(resource: ResourceList) {
    return <ResourceView
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
    } else {

      const firstPart = url.substr(1, url.indexOf('-') - 1);

      if (resources[firstPart] !== undefined) {
        return this.renderResource(resources[firstPart]);
      } else {
        const documentId = firstPart;
        return <DocumentView
              dispatch={this.props.dispatch}
              course={this.props.course}
              userId={this.props.user.userId}
              userName={this.props.user.user}
              documentId={documentId}/>;
      }
    }
 
  }


  render(): JSX.Element {

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
            {modalDisplay}
            <Header dispatch={this.props.dispatch} logoutUrl={logoutUrl}/>

            {currentView}

            <Footer dispatch={this.props.dispatch}/>
        </div>
    );
  }

}

export default connect<MainReduxProps, {}, MainOwnProps>(mapStateToProps)(Main);
