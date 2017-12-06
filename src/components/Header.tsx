import * as React from 'react';
import * as viewActions from '../actions/view';

import { buildFeedbackFromCurrent } from '../utils/feedback';

import './Header.scss';

export interface HeaderProps {
  dispatch: any;
  logoutUrl: string;
  name: string;
  email: string;
}

class Header extends React.PureComponent<HeaderProps, {}> {

  constructor(props) {
    super(props);

    this.onClickCreate = this.onClickCreate.bind(this);
    this.onClickHome = this.onClickHome.bind(this);
  }

  onClickHome() {
    this.props.dispatch(viewActions.viewAllCourses());
  }

  onClickCreate() {
    this.props.dispatch(viewActions.viewCreateCourse());
  }

  render() {

    const { name, email } = this.props;

    const formUrl = buildFeedbackFromCurrent(
      name,
      email,
    );

    return (
      <div className="header">
        <nav className="navbar navbar-light bg-light justify-content-start">

          <a className="navbar-brand" onClick={this.onClickHome}>
          <img src="assets/oli-icon.png" width="30" height="30"
              className="d-inline-block align-top" alt=""/>
            Open Learning Initiative
          </a>

          <a className="nav-link" href={formUrl}>Provide Feedback</a>
          <a className="nav-link" href={this.props.logoutUrl}>Logout</a>

        </nav>
      </div>
    );
  }

}

export default Header;
