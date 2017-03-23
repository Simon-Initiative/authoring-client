import * as React from 'react';
import { bindActionCreators } from 'redux';
import NavigationBar from './NavigationBar';
import EditorManager from '../editors/manager/EditorManager';
import { AppServices, DispatchBasedServices } from '../editors/common/AppServices';
import * as viewActions from '../actions/view';

interface DocumentView {  
  viewActions: Object;
  services: AppServices;
}

export interface DocumentViewProps {
  dispatch: any;
  documentId: string;
  userId: string;
}

class DocumentView extends React.PureComponent<DocumentViewProps, {}> {

  constructor(props) {
    super(props);
    
    this.services = new DispatchBasedServices(this.props.dispatch);
    this.viewActions = bindActionCreators((viewActions as any), this.props.dispatch);
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
            <NavigationBar viewActions={this.viewActions} />
            <div className="col-sm-9 offset-sm-3 col-md-10 offset-md-2">
              <EditorManager 
                dispatch={this.props.dispatch}
                services={this.services} 
                userId={this.props.userId} 
                documentId={this.props.documentId}/>
            </div>
        </div>
      </div>
    )
  }
  
}

export default DocumentView;


