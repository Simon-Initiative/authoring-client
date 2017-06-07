import * as React from 'react';
import { bindActionCreators } from 'redux';
import NavigationBar from './NavigationBar';
import EditorManager from '../editors/manager/EditorManager';
import { AppServices, DispatchBasedServices } from '../editors/common/AppServices';
import * as viewActions from '../actions/view';

interface DocumentView {  
  viewActions: Object;
}

export interface DocumentViewProps {
  dispatch: any;
  documentId: string;
  userId: string;
  userName: string;
  course: any;
}

class DocumentView extends React.PureComponent<DocumentViewProps, {}> {

  constructor(props) {
    super(props);
    
    this.viewActions = bindActionCreators((viewActions as any), this.props.dispatch);
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
            <NavigationBar viewActions={this.viewActions} />
            <div className="col-sm-9 offset-sm-3 col-md-10 offset-md-2 document">
              <div className="container-fluid editor">
                <div className="row">
                  <div className="col-12">
                    <EditorManager 
                      dispatch={this.props.dispatch}
                      course={this.props.course}
                      userId={this.props.userId} 
                      userName={this.props.userName}
                      documentId={this.props.documentId}/>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    );
  }
  
}

export default DocumentView;
