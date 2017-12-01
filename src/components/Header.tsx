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
        <nav className="navbar navbar-light bg-light justify-content-between">
          <a className="navbar-brand" onClick={this.onClickHome}>
          <img src="assets/oli-icon.png" width="30" height="30"
              className="d-inline-block align-top" alt=""/>
            Open Learning Initiative
          </a>
          <a className="nav-link active" href={this.props.logoutUrl}>Logout</a>
        </nav>
      </div>
    );
  }

}

export default Header;
