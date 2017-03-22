import * as React from 'react';
import { bindActionCreators } from 'redux';
import NavigationBar from './NavigationBar';
import EditorManager from '../editors/manager/EditorManager';
import { AppServices, DispatchBasedServices } from '../editors/common/AppServices';
import * as viewActions from '../actions/view';
import SortableTree from 'react-sortable-tree';

interface CreateOrganizationView 
{
    viewActions: Object;
    services: AppServices;
}

export interface CreateOrganizationState 
{
    treeData : any;  
}

export interface CreateOrganizationViewProps 
{
  dispatch: any;
  documentId: string;
  userId: string;    
}

/**
*
*/
class CreateOrganizationView extends React.PureComponent<CreateOrganizationViewProps, CreateOrganizationState> 
{
  constructor(props) 
  {
    super(props);
    this.state = {
                    treeData: [
                                {
                                    title: 'Chicken',
                                    children: [ 
                                                { title: 'Egg' } 
                                              ] 
                                }
                              ]
                 };
    this.services = new DispatchBasedServices(this.props.dispatch);
    this.viewActions = bindActionCreators((viewActions as any), this.props.dispatch);            
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
            <NavigationBar viewActions={this.viewActions} />
            <div className="col-sm-9 offset-sm-3 col-md-10 offset-md-2 pt-3">
                <SortableTree
                    treeData={this.state.treeData}
                    onChange={treeData => this.setState({ treeData })}
                />
            </div>
        </div>
      </div>        
    );
  }
  

}

export default CreateOrganizationView;
