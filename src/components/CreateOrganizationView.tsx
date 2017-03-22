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

const tempnavstyle=
{
    h2:
    {
        marginRight: '10px'
    }
};

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
                                    title: 'Logic',
                                    children: [ 
                                                { title: 'Pre Test' } 
                                              ] 
                                },
                                {
                                    title: 'Sets',
                                    children: [ 
                                                { title: 'Methods for Prevention' } 
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
                <nav className="navbar navbar-toggleable-md navbar-light bg-faded">
                    <p className="h2" style={tempnavstyle.h2}>Course Content</p>
                    <button type="button" className="btn btn-secondary">Add Item</button>
                    <a className="nav-link" href="#">+ Expand All</a>
                    <a className="nav-link" href="#">- Collapse All</a>
                </nav>
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
