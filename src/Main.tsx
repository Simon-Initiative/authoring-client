import * as React from 'react';
import { returnType } from './utils/types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { user as userActions } from './actions/user';
import { modalActions } from './actions/modal';
import * as viewActions from './actions/view';
import { CurrentView } from './reducers/view';

import Header from './components/Header';
import Footer from './components/Footer';
import CoursesView from './components/CoursesView';
import DocumentView from './components/DocumentView';
import LoginView from './components/LoginView';
import ResourceView from './components/ResourceView';
import CreateCourseView from './components/CreateCourseView';

function mapStateToProps(state: any) {
  const {
    user,
    modal,
    view,
    course,
  } = state;

  return {
    user,
    modal,
    view,
    course,
  };
}

interface Main {
  modalActions: Object;
  viewActions: Object;
}

interface MainOwnProps {

}

const stateGeneric = returnType(mapStateToProps);
type MainReduxProps = typeof stateGeneric;
type MainProps = MainReduxProps & MainOwnProps & { dispatch };

class Main extends React.Component<MainProps, {}> {

  constructor(props) {
    super(props);

    this.modalActions = bindActionCreators((modalActions as any), this.props.dispatch);
    this.viewActions = bindActionCreators((viewActions as any), this.props.dispatch);
  }

  componentDidMount() {
    this.props.dispatch(userActions.initAuthenticationProvider());
  }

  getView(view: CurrentView): JSX.Element {
    
    switch (view.type) {
      case 'ResourcesView':
        return <ResourceView 
          courseId={this.props.course.model.guid}
          title={view.title}
          resourceType={view.resourceType}
          filterFn={view.filterFn}
          createResourceFn={view.createResourceFn}
          dispatch={this.props.dispatch}/>;
      case 'DocumentView':
        return <DocumentView
            dispatch={this.props.dispatch}
            course={this.props.course}
            userId={this.props.user.userId}
            documentId={view.documentId}/>;
      case 'CreateCourseView':
        return <CreateCourseView dispatch={this.props.dispatch}/>;
      case 'AllCoursesView':
        return <CoursesView dispatch={this.props.dispatch} userId={this.props.user.userId}/>;
    }

  }


  render(): JSX.Element {

    if (this.props.view === 'LoginView') {
      return <div></div>;
    } 

    const modalDisplay = this.props.modal !== null ? <div>{this.props.modal}</div> : <div></div>;
    const currentView = this.getView(this.props.view);

    return (
        <div>
            {modalDisplay}
            <Header dispatch={this.props.dispatch}/>

            {currentView}

            <Footer dispatch={this.props.dispatch}/>
        </div>
    );
  }

}

export default connect<MainReduxProps, {}, MainOwnProps>(mapStateToProps)(Main);
