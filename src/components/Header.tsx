import * as React from 'react';
import { ViewActions } from '../actions/view';
import { CourseModel } from 'data/models';
import { UserState } from 'reducers/user';
import { Maybe } from 'tsmonad';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

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
    onClick={(e) => { e.preventDefault(); action();}}>{children}</a>
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
      data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      {label}
    </a>
    <div className="dropdown-menu">
      {children}
    </div>
  </div>
);


type MenuItemProps = {
  action: any,
  children: any,
};

const MenuItem: React.StatelessComponent<MenuItemProps> = ({
  action,
  children,
}) => (
  <a className="dropdown-item" href="#"
    onClick={(e) => { e.preventDefault(); action();}}>{children}</a>
);


class Header extends React.Component<HeaderProps, HeaderState> {

  timer: any;

  constructor(props) {
    super(props);

    this.state = { showIncrementalSave: false };
    this.timer = null;
  }

  renderPackageActions() {

    const v = this.props.viewActions;
    const id = this.props.course.guid;

    return (
      <React.Fragment>
        <a className="header-link course-link" href="#"
          onClick={(e) => {
            e.preventDefault();
            v.viewDocument(id, id);
          }}>{this.props.course.title}</a>

        <Link action={v.viewObjectives.bind(undefined, id)}>Objectives</Link>
        <Link action={v.viewOrganizations.bind(undefined, id)}>Organizations</Link>
        <Link action={v.viewPages.bind(undefined, id)}>Pages</Link>
        <Menu label="Assessments">
          <MenuItem action={v.viewFormativeAssessments.bind(undefined, id)}>
            Formative
          </MenuItem>
          <MenuItem action={v.viewSummativeAssessments.bind(undefined, id)}>
            Summative
          </MenuItem>
          <MenuItem action={v.viewPools.bind(undefined, id)}>
            Question Pools
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

  renderApplicationLabel() {
    return <span>OLI Course Authoring</span>;
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

  render() {

    return (
      <div className="header">
        <div className="header-logo">
          <Link action={this.props.viewActions.viewAllCourses}>
            <img src={OLI_ICON} width="30" height="30"
                className="d-inline-block align-top" alt=""/>
          </Link>
        </div>
        <div className="header-content">
          {this.props.course ? this.renderPackageActions() : this.renderApplicationLabel()}
        </div>
        <ReactCSSTransitionGroup transitionName="saving"
          transitionEnterTimeout={250} transitionLeaveTimeout={500}>
          {this.renderSaveNotification()}
        </ReactCSSTransitionGroup>
        <div className="header-logout">
          <a className="header-link" href={this.props.user.logoutUrl}>Logout</a>
        </div>
      </div>
    );
  }

}

export default Header;
