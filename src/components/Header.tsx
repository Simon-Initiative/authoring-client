import * as React from 'react';
import * as viewActions from '../actions/view';

interface Header {  
  _onClickHome: () => void;
  _onClickCreate: () => void;
}

export interface HeaderProps {
  dispatch: any;
  logoutUrl: string;
}

class Header extends React.PureComponent<HeaderProps, {}> {

  constructor(props) {
    super(props);

    this._onClickCreate = this.onClickCreate.bind(this);
    this._onClickHome = this.onClickHome.bind(this);
  }

  onClickHome() {
    this.props.dispatch(viewActions.viewAllCourses());
  }

  onClickCreate() {
    this.props.dispatch(viewActions.viewCreateCourse());
  }

  render() {
    return (
      <nav className="navbar navbar-toggleable-md navbar-light fixed-top">
      <button className="navbar-toggler navbar-toggler-right" 
        type="button" data-toggle="collapse" 
        data-target="#navbarSupportedContent" 
        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
        <a className="navbar-brand" onClick={this._onClickHome}>
          <img src="assets/oli-icon.png" width="30" height="30" 
            className="d-inline-block align-top" alt=""/>
          Open Learning Initiative
        </a>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link active" href={this.props.logoutUrl}>Logout</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" onClick={this._onClickCreate}>Create a Course</a>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
  
}

export default Header;
