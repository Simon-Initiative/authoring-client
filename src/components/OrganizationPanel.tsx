/**
*
*/

import * as React from 'react';

interface OrganizationPanelProps 
{
  documentActions: any;   
}

interface OrganizationPanelState 
{

}

/**
*
*/
class OrganizationPanel extends React.Component <OrganizationPanelProps,OrganizationPanelState>
{
    constructor(props) 
    {
    	console.log ("OrganizationPanel");
    	
        super(props);
        this.state = {closed : false};
    }
    
  	componentDidMount() 
  	{
		console.log ("componentDidMount ()");
		
  	}

  	componentWillUnmount() 
  	{
		console.log ("componentWillUnmount ()");
	
  	}    
    
  	render()
  	{
    	return (
            <div style={{border: "0px solid black", width: "100px", height: "5px"}}><a href="#" onClick={this.props.documentActions.collapseMenu}>
            Collapse Menu</a>
            </div>
    	);
  	}
}

export default OrganizationPanel;

