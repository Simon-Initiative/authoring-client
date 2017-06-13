import * as React from 'react';
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
import { Resource } from './data/resource';

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

const resources = {
  '/organizations': res(
        'Organizations',
        'x-oli-organization',
        resource => resource.type === 'x-oli-organization',
        (title, type) => new models.OrganizationModel({
          type,
          title: new contentTypes.Title({text: title})
        })),
  '/assessments': res(
        'Assessments',
        'x-oli-assessment',
        (resource) => resource.type === 'x-oli-inline-assessment' || resource.type === 'x-oli-assessment2',
        (title, type) => new models.AssessmentModel({
          type,
          title: new contentTypes.Title({text: title})
        })),
  '/pages': res(
        'Workbook Pages',
        'x-oli-workbook_page',
        (resource) => resource.type === 'x-oli-workbook_page',
        (title, type) => new models.WorkbookPageModel({
          type,
          head: new contentTypes.Head({title: new contentTypes.Title({text: title})})
        })),
  '/objectives': res(
        'Learning Objectives',
        'x-oli-learning_objectives',
        (resource) => resource.type === 'x-oli-learning_objectives',
        (title, type) => new models.LearningObjectiveModel({
          type,
          title: title,
          id:title.split(" ")[0]+guid()
        })),
  '/skills': res(
        'Skills',
        'x-oli-skills_model',
        (resource) => resource.type === 'x-oli-skills_model',
        (title, type) => new models.SkillModel({
          type,
          title: new contentTypes.Title({text: title}),
          resource: new Resource({id:title.split(" ")[0]+guid(), title:title})
        })),
  '/pools': res(
        'Question Pools',
        'x-oli-assessment2-pool',
        (resource) => resource.type === 'x-oli-assessment2-pool',
        (title, type) => new models.PoolModel({
          type,
          pool: new contentTypes.Pool({ title: new contentTypes.Title({ text: title }) }),
        })),
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
}

interface MainOwnProps {

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
      current: history.location,
    };
  }

  componentDidMount() {
    this.props.dispatch(userActions.initAuthenticationProvider());

    history.listen(current => this.setState({ current }));
  }

  

  renderResource(resource: ResourceList) {
    return <ResourceView 
              courseId={this.props.course.model.guid}
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
    } else if (resources[url] !== undefined) {
      return this.renderResource(resources[url]);
    } else {
      const documentId = url.substr(1);
      return <DocumentView
            dispatch={this.props.dispatch}
            course={this.props.course}
            userId={this.props.user.userId}
            userName={this.props.user.user}
            documentId={documentId}/>;
    }
  }


  render(): JSX.Element {

    if (this.props.user === null) {
      return null;
    }

    const modalDisplay = this.props.modal !== null ? <div>{this.props.modal}</div> : <div></div>;
    const currentView = this.getView(this.state.current.pathname);

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
