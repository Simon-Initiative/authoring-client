'use strict'

import * as React from 'react';
import { connect }  from 'react-redux';
import { bindActionCreators } from 'redux';

import { authoring } from './actions/authoring';
import { modalActions } from './actions/modal';
import { viewActions } from './actions/view';
import { dataActions } from './actions/data';

import NavigationBar from './components/NavigationBar';
import PageEditor from './components/PageEditor';
import AllPages from './components/AllPages';
import AllQuestions from './components/AllQuestions';

interface Main {
  authoringActions: Object;
  modalActions: Object;
  viewActions: Object;
  dataActions: Object;
}

export interface MainProps {
  dispatch: any;
  content: any;
  editHistory: Object[];
  view: viewActions.View;
  modal: any;
}

class Main extends React.Component<MainProps, {}> {

  constructor(props) {
    super(props);

    this.authoringActions = bindActionCreators((authoring as any), this.props.dispatch);
    this.modalActions = bindActionCreators((modalActions as any), this.props.dispatch);
    this.viewActions = bindActionCreators((viewActions as any), this.props.dispatch);
    this.dataActions = bindActionCreators((dataActions as any), this.props.dispatch);
  }

  componentDidMount() {
    this.props.dispatch(dataActions.fetchPages());
    this.props.dispatch(dataActions.fetchQuestions());
  }

  getView(view: viewActions.View): JSX.Element {
    if (view === "allPages") {
      return <AllPages/>;
    }
    else if (view === "allQuestions") {
      return <AllQuestions/>;
    }
    else if (view === "page") {
      return <PageEditor 
          authoringActions={this.authoringActions}
          modalActions={this.modalActions}
          dataActions={this.dataActions}
          editHistory={this.props.editHistory}
          rev={this.props.content.rev}
          debug={true}
          content={this.props.content.content}/>;
    }
  }

  render(): JSX.Element {

    let modalDisplay = this.props.modal !== null ? <div>{this.props.modal}</div> : <div></div>;
    let { view } = this.props;

    return (
      <div>
        {modalDisplay}
        <NavigationBar viewActions={this.viewActions}/>
        {this.getView(view)}
      </div>
    )
  }

};

function subscribedState(state: any): Object {

  const {
    content, 
    editHistory,
    modal,
    view
  } = state;

  return {
    content, 
    editHistory,
    modal,
    view
  }
}


export default connect(subscribedState)(Main);
