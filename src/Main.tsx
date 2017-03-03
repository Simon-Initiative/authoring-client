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
import EditorManager from './editors/document/EditorManager';

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
}

interface MainOwnProps {
  username: string
}

const stateGeneric = returnType(mapStateToProps);  
type MainReduxProps = typeof stateGeneric; 
type MainProps = MainReduxProps & MainOwnProps & { dispatch };

class Main extends React.Component<MainProps, {}> {

  constructor(props) {
    super(props);

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
      return <EditorManager dispatch={this.props.dispatch} 
        userId={this.props.user.userId} documentId={this.props.document}/>;
    } else {
      return null;  // TODO replace with welcome / logon screen
    }
  }

  render(): JSX.Element {

    let modalDisplay = this.props.modal !== null ? <div>{this.props.modal}</div> : <div></div>;
    
    return (
      <div>
        {modalDisplay}
        <NavigationBar documentActions={this.documentActions}/>
        {this.getView(this.props.document)}
      </div>
    )
  }

};

export default connect<MainReduxProps, {}, MainOwnProps>(mapStateToProps)(Main);
