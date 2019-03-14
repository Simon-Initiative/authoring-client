import * as React from 'react';
import { ViewActions } from 'actions/view';
import { CourseModel } from 'data/models';
import { UserState } from 'reducers/user';
import { Maybe } from 'tsmonad';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { buildFeedbackFromCurrent } from 'utils/feedback';
import { getVersion } from 'utils/buildinfo';
import { StyledComponentProps } from 'types/component';
import { injectSheet, injectSheetSFC, classNames, JSSStyles } from 'styles/jss';
import colors from 'styles/colors';
import * as chroma from 'chroma-js';
import { RouterState } from 'reducers/router';
import { ROUTE } from 'actions/router';

const OLI_ICON = require('../../assets/oli-icon.png');

const styles: JSSStyles = {
  Header: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    height: 50,
    padding: [5, 30],
    color: colors.white,
    backgroundColor: colors.primary,
    borderBottom: [3, 'solid', chroma(colors.primary).darken(0.4).hex()],
    verticalAlign: 'middle',
    lineHeight: 2,
    fontSize: '0.8em',
    fontWeight: 600,
  },

  headerLink: {
    cursor: 'pointer',
    color: colors.white,
    display: 'inline-block',
    padding: [5, 10],

    '&:hover': {
      color: colors.white,
      textDecoration: 'none',

      background: chroma(colors.primary).darken(0.4).hex(),
      borderRadius: 6,
    },
  },

  saveNotification: {
    fontWeight: 300,
    paddingRight: 30,
  },

  headerDropdown: {
    marginRight: 10,
    display: 'inline',
  },

  headerLogo: {
    flex: 1,
    fontSize: '1rem',
  },

  version: {
    color: chroma.mix(colors.white, colors.primary, 0.3).hex(),
    marginLeft: 5,
    fontSize: '0.8em',
  },

  headerLogoLink: {
    marginRight: 15,
  },

  headerContent: {

  },

  headerUserProfile: {
    textAlign: 'right',
    headerLink: {
      marginRight: 0,
    },
  },
};

export interface HeaderProps {
  course: CourseModel;
  user: UserState;
  viewActions: ViewActions;
  isSaveInProcess: boolean;
  lastRequestSucceeded: Maybe<boolean>;
  saveCount: number;
  router: RouterState;
}

export interface HeaderState {
  showIncrementalSave: boolean;
}

type LinkProps = {
  className?: string,
  action: any,
  children: any,
};

const Link: React.StatelessComponent<StyledComponentProps<LinkProps>> =
  injectSheetSFC<LinkProps>(styles)(({
    className,
    action,
    children,
    classes,
  }) => (
      <a className={classNames([classes.headerLink, className])} href="#"
        onClick={(e) => { e.preventDefault(); action(); }}>{children}</a>
    ));

type MenuProps = {
  label: string | JSX.Element,
  children: any,
};

const Menu: React.StatelessComponent<StyledComponentProps<MenuProps>> =
  injectSheetSFC<MenuProps>(styles)(({
    label,
    children,
    classes,
  }) => (
      <div className={classNames([classes.headerDropdown, 'dropdown show'])}>
        <a className={classNames([classes.headerLink, 'dropdown-toggle'])} href="#"
          target="_blank"
          data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          {label}
        </a>
        <div className="dropdown-menu dropdown-menu-right">
          {children}
        </div>
      </div>
    ));


type MenuItemProps = {
  url: string,
  children: any,
};

const MenuItem: React.StatelessComponent<StyledComponentProps<MenuItemProps>> =
  injectSheetSFC<MenuItemProps>(styles)(({
    url,
    children,
  }) => (
      <a className="dropdown-item" href={url}>{children}</a>
    ));

/**
 * Header React Component
 */
@injectSheet(styles)
class Header extends React.PureComponent<StyledComponentProps<HeaderProps>, HeaderState> {

  timer: any;

  constructor(props) {
    super(props);

    this.state = { showIncrementalSave: false };
    this.timer = null;
  }

  renderAbout() {
    const { user } = this.props;

    const name = user.profile.username;
    const email = user.profile.email;
    const formUrl = buildFeedbackFromCurrent(name, email);
    const QUICK_START_GUIDE_URL
      = 'https://docs.google.com/document/d/1B_AQpFRn2zue6-'
      + 'nW6h8z6bOGfHWYqAjI7WCZ-WQMrf4/edit?usp=sharing';
    const logoutUrl = user.logoutUrl;

    return (
      <React.Fragment>
        <Menu label={user.profile.username}>
          <h6 className="dropdown-header">Course Author v{getVersion()}</h6>
          <div className="dropdown-divider"></div>
          <MenuItem url={QUICK_START_GUIDE_URL}>
            Quick Start Guide
          </MenuItem>
          <MenuItem url={formUrl}>
            Help / Feedback
          </MenuItem>
          <div className="dropdown-divider"></div>
          <MenuItem url={logoutUrl}>Log Out</MenuItem>
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
    const { classes } = this.props;

    const lastSucceeded
      = this.props.lastRequestSucceeded.caseOf({ just: v => v, nothing: () => false });

    if (this.props.isSaveInProcess && this.state.showIncrementalSave) {
      return <div className={classes.saveNotification}>Saved</div>;
    }
    if (this.props.isSaveInProcess) {
      return <div className={classes.saveNotification}>Saving...</div>;
    }
    if (lastSucceeded) {
      return <div className={classes.saveNotification}>All changes saved</div>;
    }
    return null;
  }

  renderPackageTitle() {
    const { classes, course } = this.props;

    return <span>{course.title} <span className={classes.version}>v{course.version}</span></span>;
  }

  renderApplicationLabel() {
    return <span>OLI Course Authoring</span>;
  }

  render() {
    const { classes, router } = this.props;

    return (
      <div className={classNames(['Header', classes.Header])}>
        <div className={classes.headerLogo}>
          <Link className={classes.headerLogoLink} action={this.props.viewActions.viewAllCourses}>
            {router.route !== ROUTE.ROOT
              ? <i className="fa fa-chevron-left" style={{ marginRight: 10 }} />
              : undefined
            }
            <img src={OLI_ICON} width="30" height="30"
              className="d-inline-block align-top" alt="" />
          </Link>

          {this.props.course ? this.renderPackageTitle() : this.renderApplicationLabel()}

        </div>
        <ReactCSSTransitionGroup transitionName="saving"
          transitionEnterTimeout={250} transitionLeaveTimeout={500}>
          {this.renderSaveNotification()}
        </ReactCSSTransitionGroup>
        <div className={classes.headerUserProfile}>
          {this.renderAbout()}
        </div>
      </div>
    );
  }

}

export default Header;
