import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { withStyles, classNames, JSSStyles } from 'styles/jss';
import { Maybe } from 'tsmonad';
import colors from 'styles/colors';
import * as viewActions from 'actions/view';
import { CourseModel } from 'data/models';
import { UserProfile } from 'types/user';
import { disableSelect } from 'styles/mixins';
import { Document } from 'data/persistence';
import * as nav from 'types/navigation';
import OrgEditorManager from 'editors/manager/OrgEditorManager.controller';
import { saveToLocalStorage, loadFromLocalStorage } from 'utils/localstorage';
import { Tooltip } from 'utils/tooltip';
import { RequestButton } from 'editors/document/course/CourseEditor';
import { HelpPopover } from 'editors/common/popover/HelpPopover.controller';
import { Resource } from 'data/contentTypes';
import { RouteCourse } from 'types/router';
import { CourseIdVers } from 'data/types';


const DEFAULT_WIDTH_PX = 400;
const COLLAPSED_WIDTH_PX = 80;
const COLLAPSE_SETPOINT_PX = 150;

export const styles: JSSStyles = {
  NavigationPanel: {
    fontSize: '14px',
    extend: [disableSelect],
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.grayLightest,
    borderRight: [1, 'solid', colors.grayLight],
    padding: [10, 0, 5, 0],
    position: 'relative',

    '&:hover': {
      '& $resizeHandle $collapseButton': {
        opacity: 1,
      },
    },
  },
  collapsed: {
    '&$navItem': {
      textAlign: 'center',
    },

    '& $navItem i': {
      width: '100%',
      color: colors.grayDarker,
    },
    '& $navItem$selectedNavItem i': {
      color: colors.white,
    },
  },
  navItemContainer: {
    margin: [2, 5],
    padding: [5, 10],
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  selectedNavContainer: {
    borderRadius: 6,
    boxShadow: '0 1px 3px 0 #d4d4d5, 0 0 0 1px #d4d4d5',
    backgroundColor: colors.primary,
  },
  navItemDescription: {
    color: 'rgba(0,0,0,.4)',
    fontStyle: 'italic',
  },
  navItem: {
    fontSize: '1.0em',
    fontWeight: 500,
    borderRadius: 6,
    border: [1, 'solid', 'transparent'],
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',

    '& i': {
      width: 40,
      textAlign: 'center',
    },

    '&:hover': {
      color: colors.primary,
      textDecoration: 'underline',
    },
  },
  selectedNavItem: {
    color: colors.white,
    fontWeight: 'bold',
    '&:hover': {
      color: colors.white,
    },
  },
  orgTree: {
    flex: 1,
    overflowY: 'auto',
    borderTop: [1, 'solid', colors.grayLighter],
    borderBottom: [1, 'solid', colors.grayLighter],
    margin: [5, 0],
  },
  resizeHandle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: -14,
    width: 14,
    cursor: 'ew-resize',
    zIndex: 1000,
  },
  collapseButtonContainer: {
    backgroundColor: '#fdfdfd',
    borderRadius: '50%',
    position: 'absolute',
    top: 14,
    right: 25,
  },
  collapseButton: {
    width: 30,
    height: 30,
    color: colors.grayDark,
    paddingRight: 2,
    paddingTop: 2,
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: 16,

    '& i': {
      fontWeight: 600,
    },

    '&:hover': {
      color: colors.selection,
    },
  },
  publishActions: {
    margin: 'auto',

    publishAction: {
      span: {
        marginRight: 10,
      },
    },

    '& .RequestButton': {
      marginRight: 10,
    },

    '&.collapsed .RequestButton': {
      marginRight: 0,
    },

    '& .previewButton': {
      marginRight: [0, '!important'],
    },
  },
};

export interface NavigationPanelProps {
  className?: string;
  course: CourseModel;
  route: RouteCourse;
  profile: UserProfile;
  userId: string;
  userName: string;
  onLoadOrg: (courseId: CourseIdVers, documentId: string) => Promise<Document>;
  onReleaseOrg: () => void;
  onPreview: (courseId: CourseIdVers, organizationId: string, redeploy: boolean) =>
    Promise<any>;
}

export interface NavigationPanelState {
  collapsed: boolean;
  showOrgDropdown: boolean;
  isResizing: boolean;
  resizeStart: number;
  width: Maybe<number>;
  newWidth: Maybe<number>;
}

/**
 * NavigationPanel React Component
 */
class NavigationPanel
  extends React.PureComponent<StyledComponentProps<NavigationPanelProps, typeof styles>,
  NavigationPanelState> {

  constructor(props: StyledComponentProps<NavigationPanelProps, JSSStyles>) {
    super(props);

    this.state = {
      collapsed: false,
      showOrgDropdown: false,
      isResizing: false,
      resizeStart: 0,
      width: Maybe.nothing<number>(),
      newWidth: Maybe.nothing<number>(),
    };
  }

  componentDidMount() {
    const { profile } = this.props;

    // register global mouse listeners
    window.addEventListener('click', this.onGlobalClick);
    window.addEventListener('mouseup', this.onGlobalMouseup);

    this.setState({
      width: Maybe.maybe(loadFromLocalStorage('navbar_width_' + profile.username)),
      collapsed: !!loadFromLocalStorage('navbar_collapsed_' + profile.username),
    });
  }

  componentWillUnmount() {
    // unregister global mouse listeners
    window.removeEventListener('click', this.onGlobalClick);
    window.removeEventListener('mouseup', this.onGlobalMouseup);
  }

  onGlobalClick = (e) => {
    if (e.originator !== 'OrgDropdownToggle') {
      this.setState({
        showOrgDropdown: false,
      });
    }
  }

  onGlobalMouseup = (e) => {
    const { profile } = this.props;
    const { isResizing, collapsed, newWidth } = this.state;

    if (isResizing) {
      window.removeEventListener('mousemove', this.handleResize);

      this.setState({
        isResizing: false,
        width: newWidth,
        newWidth: Maybe.nothing<number>(),
      });

      // save to local storage
      this.updatePersistentPrefs(profile.username, newWidth.valueOr(DEFAULT_WIDTH_PX), collapsed);
    }
  }

  onResizeHandleMousedown = (e) => {
    const { width, collapsed } = this.state;

    this.setState({
      width: collapsed ? Maybe.just(COLLAPSED_WIDTH_PX) : width,
      isResizing: true,
      resizeStart: e.nativeEvent.clientX,
    });

    window.addEventListener('mousemove', this.handleResize);
  }

  handleResize = (e) => {
    const { width } = this.state;

    let newSize = width.valueOr(DEFAULT_WIDTH_PX) + (e.clientX - this.state.resizeStart);
    newSize = newSize < COLLAPSE_SETPOINT_PX ? COLLAPSED_WIDTH_PX : newSize;

    this.setState({
      newWidth: Maybe.just(newSize),
      collapsed: newSize < COLLAPSE_SETPOINT_PX,
    });
  }

  updatePersistentPrefs = (username: string, width: number, collapsed: boolean) => {
    saveToLocalStorage(
      'navbar_width_' + username, `${width}`);
    saveToLocalStorage(
      'navbar_collapsed_' + username, `${collapsed}`);
  }

  getWidth = () => {
    const { collapsed, width, newWidth } = this.state;
    return collapsed
      ? COLLAPSED_WIDTH_PX
      : newWidth.valueOr(width.valueOr(DEFAULT_WIDTH_PX));
  }

  onPreview(redeploy: boolean = true): Promise<void> {
    const { route, onPreview, course } = this.props;

    return route.orgId.caseOf({
      just: orgId => onPreview(course.idvers, orgId, redeploy)
        .catch(err => console.error('Full preview error:', err)),
      nothing: () => Promise.reject(null),
    });
  }

  onCollapse = () => {
    const { profile } = this.props;
    const { width } = this.state;

    this.setState({
      collapsed: true,
    });
    this.updatePersistentPrefs(profile.username, width.valueOr(DEFAULT_WIDTH_PX), true);
  }

  renderResizeHandle() {
    const { classes } = this.props;
    const { collapsed } = this.state;

    return (
      <div className={classes.resizeHandle} onMouseDown={this.onResizeHandleMousedown}>
        {!collapsed && (
          <div className={classes.collapseButtonContainer}>
            <div className={classes.collapseButton}
              onClick={this.onCollapse}
              onMouseDown={e => e.stopPropagation()}>
              <i className="fa fa-angle-double-left" />
            </div>
          </div>
        )}
      </div>
    );
  }

  renderOverview(currentOrg: Resource) {
    const { classes, course, route } = this.props;
    const { collapsed } = this.state;

    const selected = route.route.type === 'RouteCourseOverview';

    return (
      <div className={classNames([
        classes.navItemContainer, selected && classes.selectedNavContainer])}>
        <a href="#"
          onClick={(e) => {
            e.preventDefault();
            viewActions.viewCourse(course.idvers, Maybe.just(currentOrg.id));
          }}
          className={classNames([classes.navItem, selected && classes.selectedNavItem])}>
          {collapsed && <i className="fa fa-book" />}
          {!collapsed && 'Course Details'}
        </a>
      </div>
    );
  }

  renderObjectives(currentOrg: Resource) {
    const { classes, course, route } = this.props;
    const { collapsed } = this.state;

    const selected = route.route.type === 'RouteObjectives';

    return (
      <div className={classNames([
        classes.navItemContainer, selected && classes.selectedNavContainer])}>
        <a href="#"
          onClick={(e) => {
            e.preventDefault();
            viewActions.viewObjectives(course.idvers, Maybe.just(currentOrg.id));
          }}
          className={classNames([
            classes.navItem,
            selected && classes.selectedNavItem,
          ])}>
          {collapsed && <i className="fa fa-graduation-cap" />}
          {!collapsed && 'Learning Objectives'}
        </a>
      </div>
    );
  }

  renderOrgRootNode(currentOrg: Resource) {
    const { classes, route, course } = this.props;
    const { collapsed } = this.state;

    const availableOrgs = r => r.type === 'x-oli-organization' && r.resourceState !== 'DELETED';

    const orgCount = course.resources.toArray().filter(availableOrgs).length;
    const title = orgCount === 1
      ? 'Course Outline'
      : currentOrg.title;

    const selected = (route.route as any).resourceId === currentOrg.id;

    return (
      <div className={classNames([
        classes.navItemContainer, selected && classes.selectedNavContainer])}>
        {orgCount === 1
          ? null
          : <div className={classes.navItemDescription}>
            {!collapsed && 'Active Course Outline'}
          </div>}
        <a href="#"
          className={classNames([
            classes.navItem,
            selected && classes.selectedNavItem,
          ])}
          onClick={(e) => {
            e.preventDefault();
            viewActions.viewDocument(currentOrg.id, course.idvers, Maybe.just(currentOrg.id));
          }}>
          {collapsed && <i className="fa fa-th-list" />}
          {!collapsed && (' ' + title)}
        </a>
      </div>
    );
  }

  renderOrgTree(currentOrg: Resource, selectedItem: Maybe<nav.NavigationItem>) {
    const { classes, profile } = this.props;
    const { width, collapsed } = this.state;

    return (
      <React.Fragment>
        {this.renderResizeHandle()}
        <div className={classes.orgTree}>
          {collapsed
            ? (
              <div className={classes.navItemContainer}>
                <div
                  className={classNames([
                    classes.navItem,
                  ])}
                  onClick={() => {
                    const newWidth = width.lift(w =>
                      w < COLLAPSE_SETPOINT_PX ? DEFAULT_WIDTH_PX : w);

                    this.setState({
                      width: newWidth,
                      collapsed: false,
                    });
                    this.updatePersistentPrefs(
                      profile.username,
                      newWidth.valueOr(DEFAULT_WIDTH_PX),
                      false,
                    );
                  }}>
                  <i className="fa fa-angle-double-right" />
                </div>
              </div>
            )
            : (
              <OrgEditorManager
                {...this.props}
                documentId={currentOrg.id}
                selectedItem={selectedItem}
              />
            )
          }
        </div>

        <div className={classNames([classes.publishActions, collapsed && 'collapsed'])}>
          {collapsed
            ? (
              <Tooltip title="Preview Course" position="right" distance={30}>
                <RequestButton text="" className="btn-secondary previewButton"
                  onClick={() => this.onPreview()}>
                  <i className="fa fa-eye" />
                </RequestButton>
              </Tooltip>
            )
            : (
              <div className={classes.publishAction}>
                <RequestButton text={this.getWidth() < 210 ? 'Preview' : 'Preview Course'}
                  className="btn-secondary previewButton"
                  onClick={() => this.onPreview()} />
                <HelpPopover>
                  Launch a full <b>course preview</b> of the current organization.
                  This preview URL can be shared and viewed publically.
                  <br /><br />
                  This may take a few minutes for larger courses.
                </HelpPopover>
              </div>
            )
          }
        </div>
      </React.Fragment >
    );
  }

  render() {
    const { className, classes, course, route } = this.props;
    const { collapsed } = this.state;

    // course may not be loaded before first render. wait for it to load before rendering
    if (!course) return null;

    // get org id from router or select the first organization

    let selectedItem: Maybe<nav.NavigationItem> = Maybe.just(nav.makePackageOverview());
    if (route.route.type === 'RouteObjectives') {
      selectedItem = Maybe.just(nav.makeLearningObjectives());
    } else if (route.route.type === 'RouteResource') {
      selectedItem = Maybe.just(nav.makeOrganizationItem(route.route.resourceId));
    }

    const firstOrganization = () => course.resourcesById.find(r => r.type === 'x-oli-organization');

    const currentOrg = route.orgId.caseOf({
      just: id => Maybe.maybe(course.resourcesById.find(r => r.id === id))
        .caseOf({
          just: resource => resource,
          nothing: () => firstOrganization(),
        }),
      nothing: () => firstOrganization(),
    });

    return (
      <div
        className={classNames([
          'NavigationPanel',
          classes.NavigationPanel,
          collapsed && classes.collapsed,
          className,
        ])}
        style={{ width: this.getWidth() }}>

        {this.renderOverview(currentOrg)}
        {this.renderObjectives(currentOrg)}
        {this.renderOrgRootNode(currentOrg)}
        {this.renderOrgTree(currentOrg, selectedItem)}

      </div>
    );
  }
}

const StyledNavigationPanel = withStyles<NavigationPanelProps>(styles)(NavigationPanel);
export { StyledNavigationPanel as NavigationPanel };
