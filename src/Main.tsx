/**
*
*/

'use strict'

import * as React from 'react';
import { returnType } from './utils/types';
import { connect }  from 'react-redux';
import { bindActionCreators } from 'redux';

import { user as userActions } from './actions/user';
import { modalActions } from './actions/modal';
import * as viewActions from './actions/view';
import { CurrentView } from './reducers/view';
import * as persistence from './data/persistence';

import CoursesView from './components/CoursesView';
import DocumentView from './components/DocumentView';
import LoginView from './components/LoginView';
import CreateCourseView from './components/CreateCourseView';

function mapStateToProps(state: any) {

  const {
    user,
    modal,
    view,
    courses
  } = state;

  return {
    user, 
    modal,
    view,
    courses
  }
}

interface Main {
  modalActions: Object;
  viewActions: Object;
  
}

interface MainOwnProps {
  username: string
}

const stateGeneric = returnType(mapStateToProps);  
type MainReduxProps = typeof stateGeneric; 
type MainProps = MainReduxProps & MainOwnProps & { dispatch };

// Nick, do whatever you feel you have to here
const mainStyle=
{
    container:
    {
        width: "inherit", 
        height: "inherit"        
    },
    holder:
    {
        display: "flex", 
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        alignContent: 'stretch',
        height: "inherit"        
    },
    topMenu:
    {
        flex: "none",
        flexGrow: 0,
        order: 0,
        background: "#f1f1f1",
        border: "0px solid #c4c0c0",
        width: "100%",
        height: "32px",
        padding: "0px",
        margin: "0 0 0 0"        
    },
    logo:
    {
        float: "left",
        border: "0px solid #c4c0c0",
        width: "32px",
        height: "32px",
        padding: "0px",
        margin: "0px"        
    },
    title:
    {
        float: "left",
        margin: "0px",
        marginTop: "8px",
        fontSize: "12pt",
        fontWeight: "bold"        
    },
    centerPanel:
    {
        display: "flex",
        flexGrow: 1,
        order: 1,
        margin: "0 0 4px 0",
        flex: 1
    },
    contentPanel:
    {
        background: "#FFFFFF",
        border: "1px solid #c4c0c0",
        padding: "2px",
        margin: "2px 2px 2px 2px",
        flex: 1        
    },
    statusBar:
    {
        display: "flex",
        flexGrow: 0,
        order: 2,
        background: "#f1f1f1",
        border: "0px solid #c4c0c0",
        width: "100%",
        height: "24px",
        margin: "2px"        
    }
};

class Main extends React.Component<MainProps, {}> {

  constructor(props) {
    super(props);
    
    this.modalActions = bindActionCreators((modalActions as any), this.props.dispatch);
    this.viewActions = bindActionCreators((viewActions as any), this.props.dispatch);
  }

  componentDidMount() {
    let user = this.props.username;
    this.props.dispatch(userActions.login(user, user));
  }

  getView(view: CurrentView): JSX.Element {
    console.log ("getView ()");
      
    switch (view.type) {
      case 'LoginView':
        return <LoginView dispatch={this.props.dispatch} />
      case 'DocumentView':
        return <DocumentView 
            dispatch={this.props.dispatch}
            userId={this.props.user.userId} 
            documentId={view.documentId}/>;
      case 'CreateCourseView':
        return <CreateCourseView dispatch={this.props.dispatch} />
      case 'AllCoursesView':
        return <CoursesView dispatch={this.props.dispatch} courseIds={this.props.courses}/>;
    }
    
  }

  render(): JSX.Element {      

    const modalDisplay = this.props.modal !== null ? <div>{this.props.modal}</div> : <div></div>;
    
    return (
      <div>
      {modalDisplay}
		
      {/* Navigation Bar START */}		
			<div className="navbar navbar-toggleable-md navbar-inverse fixed-top bg-inverse">
				<img src="assets/oli-icon.png" style={mainStyle.logo} />
        <a className="navbar-brand" href="#">OLI Dashboard</a>
				<div className="collapse navbar-collapse" id="navbarsExampleDefault">
                {/* Top level navigation if needed
                    <ul className="navbar-nav mr-auto">
                      <li className="nav-item active">
                        <a className="nav-link" href="#">Home <span className="sr-only">(current)</span></a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="#">Settings</a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="#">Profile</a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="#">Help</a>
                      </li>
                    </ul>
                */}
        </div>
			</div>	
      {this.getView(this.props.view)}
      </div>
    )
  }

};

export default connect<MainReduxProps, {}, MainOwnProps>(mapStateToProps)(Main);
