import * as React from 'react';
import * as viewActions from '../actions/view';

import './Header.scss';

export interface HeaderProps {
  dispatch: any;
  logoutUrl: string;
}

class Header extends React.PureComponent<HeaderProps, {}> {

  constructor(props) {
    super(props);

    this.onClickCreate = this.onClickCreate.bind(this);
    this.onClickHome = this.onClickHome.bind(this);
  }

  onClickHome() {
    viewActions.viewAllCourses();
  }

  onClickCreate() {
    viewActions.viewCreateCourse();
  }

  render() {
    return (
      <div className="header">
        <nav className="navbar navbar-toggleable-md navbar-light fixed-top">
        <button className="navbar-toggler navbar-toggler-right"
          type="button" data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
          <a className="navbar-brand" onClick={this.onClickHome}>
            <img src="assets/oli-icon.png" width="30" height="30"
              className="d-inline-block align-top" alt=""/>
            Open Learning Initiative
          </a>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link active" href={this.props.logoutUrl}>Logout</a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    );
  }

}

export default Header;
