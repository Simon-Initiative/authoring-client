import * as React from 'react';
import { ViewActions } from '../actions/view';
import { CourseModel } from 'data/models';
import { UserState } from 'reducers/user';

import './Header.scss';

export interface HeaderProps {
  course: CourseModel;
  user: UserState;
  viewActions: ViewActions;
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


class Header extends React.PureComponent<HeaderProps, {}> {

  renderPackageActions() {

    const v = this.props.viewActions;
    const id = this.props.course.guid;

    return (
      <React.Fragment>
        <a className="header-link course-link" href="#"
          onClick={(e) => {
            e.preventDefault();
            v.viewDocument(id, id);
          }}>{this.props.course.title}:</a>

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

  renderApplicationLabel() {
    return <span>OLI Course Authoring</span>;
  }

  render() {

    return (
      <div className="header">
        <div className="header-logo">
          <Link action={this.props.viewActions.viewAllCourses}>
            <img src="assets/oli-icon.png" width="30" height="30"
                className="d-inline-block align-top" alt=""/>
          </Link>
        </div>
        <div className="header-content">
          {this.props.course ? this.renderPackageActions() : this.renderApplicationLabel()}
        </div>
        <div className="header-logout">
          <Link action={() => window.open(this.props.user.logoutUrl)}>
            Logout
          </Link>
        </div>
      </div>
    );
  }

}

export default Header;
