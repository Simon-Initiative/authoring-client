import * as React from 'react';

/**
*
*/
class MainMenuCollapse extends React.Component 
{
  render() 
  {    
    return 
    {
      type: 'button',
      props: 
      {
        className: 'button',
        children:
        {
          type: 'b',
          props: 
          {
            children: 'OK'
          }
        }
      }
    };
  }
}