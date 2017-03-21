import * as React from 'react';

interface Header {  
}

export interface HeaderProps {
  dispatch: any;
}

class Header extends React.PureComponent<HeaderProps, {}> {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <nav className="navbar navbar-inverse bg-primary">
        <a className="navbar-brand" href="#">
          <img src="assets/oli-icon.png" width="30" height="30" className="d-inline-block align-top" alt=""/>
          OLI
        </a>
      </nav>
    );
  }
  
}

export default Header;


