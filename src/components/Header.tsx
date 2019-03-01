import * as React from 'react';
import { ViewActions } from 'actions/view';
import { CourseModel } from 'data/models';
import { UserState } from 'reducers/user';
import { Maybe } from 'tsmonad';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { buildFeedbackFromCurrent } from 'utils/feedback';
import { getVersion } from 'utils/buildinfo';

import './Header.scss';

const OLI_ICON = require('../../assets/oli-icon.png');

export interface HeaderProps {
  course: CourseModel;
  user: UserState;
  viewActions: ViewActions;
  isSaveInProcess: boolean;
  lastRequestSucceeded: Maybe<boolean>;
  saveCount: number;
}

export interface HeaderState {
  showIncrementalSave: boolean;
}

type LinkProps = {
  action: any,
  children: any,
};

const Link: React.StatelessComponent<LinkProps> = ({
  action,
  children,
}) => (
    <a className="header-link" href="#"
      onClick={(e) => { e.preventDefault(); action(); }}>{children}</a>
  );

type MenuProps = {
  label: string,
  children: any,
};

const Menu: React.StatelessComponent<MenuProps> = ({
  label,
  children,
}) => (
    <div className="dropdown show header-dropdown">
      <a className="header-link dropdown-toggle" href="#"
        target="_blank"
        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        {label}
      </a>
      <div className="dropdown-menu dropdown-menu-right">
        {children}
      </div>
    </div>
  );


type MenuItemProps = {
  url: string,
  children: any,
};

const MenuItem: React.StatelessComponent<MenuItemProps> = ({
  url,
  children,
}) => (
    <a className="dropdown-item" href={url}>{children}</a>
  );


class Header extends React.Component<HeaderProps, HeaderState> {

  timer: any;

  constructor(props) {
    super(props);

    this.state = { showIncrementalSave: false };
    this.timer = null;
  }

  renderAbout() {

    const name = this.props.user.profile.username;
    const email = this.props.user.profile.email;
    const formUrl = buildFeedbackFromCurrent(name, email);
    const QUICK_START_GUIDE_URL
      = 'https://docs.google.com/document/d/1B_AQpFRn2zue6-'
      + 'nW6h8z6bOGfHWYqAjI7WCZ-WQMrf4/edit?usp=sharing';

    return (
      <React.Fragment>
        <Menu label="About">
          <h6 className="dropdown-header">Course Author v{getVersion()}</h6>
          <MenuItem url={QUICK_START_GUIDE_URL}>
            Quick Start Guide
          </MenuItem>
          <MenuItem url={formUrl}>
            Help / Feedback
          </MenuItem>
        </Menu>
      </React.Fragment>
    );
  }

  componentWillReceiveProps(nextProps: HeaderProps) {

    if (nextProps.saveCount > this.props.saveCount
      && nextProps.isSaveInProcess
      && nextProps.isSaveInProcess === this.props.isSaveInProcess) {

      this.setState({ showIncrementalSave: true });

      this.timer = setTimeout(() => this.setState({ showIncrementalSave: false }), 1000);
    }

    if (nextProps.isSaveInProcess && !this.props.isSaveInProcess
      && this.state.showIncrementalSave) {

      this.setState({ showIncrementalSave: false });
      if (this.timer !== null) {
        clearTimeout(this.timer);
      }
      this.timer = null;
    }
  }

  renderSaveNotification() {

    const lastSucceeded
      = this.props.lastRequestSucceeded.caseOf({ just: v => v, nothing: () => false });

    if (this.props.isSaveInProcess && this.state.showIncrementalSave) {
      return <div className="save-notification">Saved</div>;
    }
    if (this.props.isSaveInProcess) {
      return <div className="save-notification">Saving...</div>;
    }
    if (lastSucceeded) {
      return <div className="save-notification">All changes saved</div>;
    }
    return null;
  }

  renderPackageTitle() {
    return <span>{this.props.course.title}</span>;
  }

  renderApplicationLabel() {
    return <span>OLI Course Authoring</span>;
  }

  render() {

    return (
      <div className="header">
        <div className="header-logo">
          <Link action={this.props.viewActions.viewAllCourses}>
            <img src={OLI_ICON} width="30" height="30"
              className="d-inline-block align-top" alt="" />
          </Link>

          {this.props.course ? this.renderPackageTitle() : this.renderApplicationLabel()}

        </div>
        <ReactCSSTransitionGroup transitionName="saving"
          transitionEnterTimeout={250} transitionLeaveTimeout={500}>
          {this.renderSaveNotification()}
        </ReactCSSTransitionGroup>
        <div className="header-logout">
          {this.renderAbout()}
          <a className="header-link" href={this.props.user.logoutUrl}>Logout</a>
        </div>
      </div>
    );
  }

}

export default Header;
