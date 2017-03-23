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
      <nav className="navbar navbar-toggleable-md navbar-light">
      <button className="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
        <a className="navbar-brand" href="#">
          <img src="assets/oli-icon.png" width="30" height="30" className="d-inline-block align-top" alt=""/>
          Open Learning Initiative
        </a>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link active" href="#">Register <span className="sr-only">(current)</span></a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Create a Course</a>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
  
}

export default Header;


