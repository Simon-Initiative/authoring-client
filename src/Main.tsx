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
import { document as documentActions } from './actions/document';

import * as persistence from './data/persistence';

import NavigationBar from './components/NavigationBar';
import Courses from './components/Courses';
import EditorManager from './editors/manager/EditorManager';
import { AppServices, DispatchBasedServices } from './editors/common/AppServices';

function mapStateToProps(state: any) {

  const {
    user,
    modal,
    document,
    courses
  } = state;

  return {
    user, 
    modal,
    document,
    courses
  }
}

interface Main {
  modalActions: Object;
  documentActions: Object;
  services: AppServices;
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
        background: "#f1f1f1",
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

    this.services = new DispatchBasedServices(this.props.dispatch);

    this.modalActions = bindActionCreators((modalActions as any), this.props.dispatch);
    this.documentActions = bindActionCreators((documentActions as any), this.props.dispatch);
  }

  componentDidMount() {
    let user = this.props.username;
    this.props.dispatch(userActions.login(user, user));
  }

  getView(documentId: string): JSX.Element {
    if (documentId === documentActions.VIEW_ALL_COURSES) {
      return <Courses dispatch={this.props.dispatch} courseIds={this.props.courses}/>;
    }
    else if (documentId !== null) {
      return <EditorManager 
        editMode={false}
        services={this.services} 
        userId={this.props.user.userId} 
        documentId={this.props.document}/>;
    } else {
      return null;  // TODO replace with welcome / logon screen
    }
  }

  render(): JSX.Element {      
      console.log ("render ()");
      
    let modalDisplay = this.props.modal !== null ? <div>{this.props.modal}</div> : <div></div>;
    
    return (
      <div style={mainStyle.container as any}>
        {modalDisplay}        
		<div style={mainStyle.holder as any}>		
			<div style={mainStyle.topMenu}>
				<img src="assets/oli-icon.png" style={mainStyle.logo} />
				<div style={mainStyle.title as any}>Welcome to OLI</div>
			</div>							
			<div style={mainStyle.centerPanel as any}>				
    			<NavigationBar documentActions={this.documentActions} />				
				<div style={mainStyle.contentPanel as any}>
				{this.getView(this.props.document)}
				</div>
			</div>			
			<div style={mainStyle.statusBar as any}>
			Statusbar goes here if we want one
			</div>
		</div>
      </div>
    )
  }

};

export default connect<MainReduxProps, {}, MainOwnProps>(mapStateToProps)(Main);
