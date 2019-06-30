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
import { updateActiveOrgPref } from 'actions/utils/activeOrganization';
import { Resource } from 'data/contentTypes';
import { RouteCourse } from 'types/router';
import { CourseIdVers } from 'data/types';


const DEFAULT_WIDTH_PX = 400;
const COLLAPSED_WIDTH_PX = 80;
const COLLAPSE_SETPOINT_PX = 150;

export const styles: JSSStyles = {
  NavigationPanel: {
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
    },
  },
  navItem: {
    fontSize: '1.0em',
    fontWeight: 500,
    margin: [2, 5],
    padding: [5, 10],
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
      backgroundColor: colors.grayLighter,
      borderColor: colors.grayLighter,
    },
  },
  navItemDropdown: {
    background: 'transparent',
    display: 'flex',
    flexDirection: 'row',
    border: 'none',
    width: '100%',
    fontSize: '1.0em',
    fontWeight: 500,
    borderRadius: 6,

    '&:hover': {
      '& $dropdownText': {
        border: [1, 'solid', colors.grayLighter],
      },
      '& $dropdownToggle': {
        border: [1, 'solid', colors.grayLighter],
        borderLeft: [1, 'solid', 'transparent'],
      },

      '&$selectedNavItem': {
        '& $dropdownText': {
          border: [1, 'solid', colors.selection],
        },
        '& $dropdownToggle': {
          border: [1, 'solid', colors.selection],
        },
      },
    },

    '&:focus': {
      outline: 'none',
    },

    '&$selectedNavItem': {
      color: 'inherit',
      backgroundColor: 'inherit',
      borderColor: 'inherit',

      '&:hover': {
        backgroundColor: 'inherit',
        borderColor: 'inherit',
      },

      '& $dropdownText': {
        color: colors.white,
        backgroundColor: colors.selection,
        borderColor: colors.selection,

        '&:hover': {
          backgroundColor: colors.selection,
          borderColor: colors.selection,
        },
      },

      '& $dropdownToggle': {
        borderColor: colors.selection,
        color: colors.selection,

        '&:hover': {
          backgroundColor: colors.selection,
          color: colors.white,
          borderLeft: [[1, 'solid', colors.white], '!important'],
        },
      },
    },
  },
  dropdownText: {
    flex: 1,
    margin: [2, 0, 2, 5],
    padding: [5, 0, 5, 10],
    paddingRight: 10,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
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
      backgroundColor: colors.grayLighter,
    },
  },
  dropdownTextCollapsed: {
    paddingRight: 0,
  },
  dropdownToggle: {
    margin: [2, 5, 2, 0],
    padding: [5, 15, 5, 15],
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    border: [1, 'solid', 'transparent'],
    cursor: 'pointer',

    '& i': {
      verticalAlign: 'top',
    },

    '&:hover': {
      backgroundColor: colors.grayLighter,
    },
  },
  dropdownToggleCollapsed: {
    padding: [8, 2],
    fontSize: 14,
  },
  selectedNavItem: {
    color: colors.white,
    backgroundColor: colors.selection,
    borderColor: colors.selection,

    '&:hover': {
      backgroundColor: colors.selection,
      borderColor: colors.selection,
    },
  },
  orgTree: {
    flex: 1,
    overflowY: 'scroll',
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
    position: 'absolute',
    top: 182,
    right: -2,
  },
  collapseButton: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    color: colors.grayDark,
    border: [1, 'solid', colors.grayDark],
    background: colors.white,
    paddingRight: 2,
    paddingTop: 2,
    textAlign: 'center',
    cursor: 'pointer',
    boxShadow: [2, 3, 10, -2, 'rgba(148,148,148,1)'],
    fontSize: 16,
    opacity: 0,

    transition: 'opacity .2s ease-out',

    '& i': {
      fontWeight: 600,
    },

    '&:hover': {
      color: colors.selection,
      border: [1, 'solid', colors.selection],
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
  onCreateOrg: () => void;
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
            <Tooltip title="Collapse Outline" position="right" size="small" delay={750}>
              <div className={classes.collapseButton}
                onClick={this.onCollapse}
                onMouseDown={e => e.stopPropagation()}>
                <i className="fa fa-angle-double-left" />
              </div>
            </Tooltip>
          </div>
        )}
      </div>
    );
  }

  renderOverview(currentOrg: Resource) {
    const { classes, course, route } = this.props;
    const { collapsed } = this.state;

    return (
      <Tooltip disabled={!collapsed} title="Overview" position="right">
        <div
          className={classNames([
            classes.navItem,
            route.route.type === 'RouteCourseOverview' && classes.selectedNavItem,
          ])}
          onClick={() => viewActions.viewCourse(course.idvers, Maybe.just(currentOrg.id))}>
          <i className="fa fa-book" />{!collapsed && ' Overview'}
        </div>
      </Tooltip>
    );
  }

  renderObjectives(currentOrg: Resource) {
    const { classes, course, route } = this.props;
    const { collapsed } = this.state;

    return (
      <Tooltip disabled={!collapsed} title="Objectives" position="right">
        <div className={classNames([
          classes.navItem,
          route.route.type === 'RouteObjectives' && classes.selectedNavItem,
        ])}
          onClick={() =>
            viewActions.viewObjectives(course.idvers, Maybe.just(currentOrg.id))}>
          <i className="fa fa-graduation-cap" />{!collapsed && ' Objectives'}
        </div>
      </Tooltip>
    );
  }

  renderAllResources(currentOrg: Resource) {
    const { classes, course, route } = this.props;
    const { collapsed } = this.state;

    return (
      <Tooltip disabled={!collapsed} title="All Resources" position="right">
        <div
          className={classNames([
            classes.navItem,
            route.route.type === 'RouteAllResources' && classes.selectedNavItem,
          ])}
          onClick={() =>
            viewActions.viewAllResources(course.idvers, Maybe.just(currentOrg.id))}>
          <i className="fas fa-folder-open" />{!collapsed && ' All Resources'}
        </div>
      </Tooltip>

    );
  }

  renderOrgDropdown(currentOrg: Resource) {
    const { classes, route, profile, course, onCreateOrg } = this.props;
    const { showOrgDropdown, collapsed } = this.state;

    const availableOrgs = r => r.type === 'x-oli-organization' && r.resourceState !== 'DELETED';

    return (
      <div className="dropdown">
        <div className={classNames([
          classes.navItemDropdown,
          route.route.type === 'RouteResource'
          && route.route.resourceId === currentOrg.id
          && classes.selectedNavItem,
        ])}>
          <Tooltip
            disabled={!collapsed}
            title={`${currentOrg.title} (${currentOrg.id})`}
            position="right"
            distance={32}
            style={{ overflow: 'hidden', flex: 1, display: 'flex' }}>
            <div className={classNames([
              classes.dropdownText,
              collapsed && classes.dropdownTextCollapsed,
            ])}
              onClick={() => viewActions.viewDocument(
                currentOrg.id, course.idvers, Maybe.just(currentOrg.id))}>
              <i className="fa fa-th-list" />{!collapsed && ` ${currentOrg.title}`}
            </div>
          </Tooltip>
          <div className={classNames([
            classes.dropdownToggle,
            collapsed && classes.dropdownToggleCollapsed,
          ])}
            onClick={(e) => {
              (e.nativeEvent as any).originator = 'OrgDropdownToggle';
              this.setState({ showOrgDropdown: !showOrgDropdown });
            }}>
            <i className={'fas fa-sort-down'} />
          </div>
        </div>
        <div className={classNames(['dropdown-menu', showOrgDropdown && 'show'])}>
          {course.resources.valueSeq().filter(availableOrgs).map(org => (
            <a key={org.guid}
              className={classNames([
                'dropdown-item',
                currentOrg.id === org.id && classes.selectedNavItem,
              ])}
              onClick={() => {
                if (org.id !== currentOrg.id) {
                  this.props.onReleaseOrg();
                  updateActiveOrgPref(course.idvers, profile.username, org.id);
                  this.props.onLoadOrg(course.idvers, org.guid);
                  viewActions.viewDocument(org.id, course.idvers, Maybe.just(org.id));
                }
              }}>
              {org.title} <span style={{ color: colors.gray }}>({org.id})</span>
            </a>
          ))}
          <div className="dropdown-divider" />
          <a key="create-org"
            className={classNames(['dropdown-item'])}
            onClick={() => onCreateOrg()}>
            <i className={'fa fa-plus-circle'} /> Create New Organization
          </a>
        </div>
      </div>
    );
  }

  renderOrgTree(currentOrg: Resource, selectedItem: Maybe<nav.NavigationItem>) {
    const { classes, profile } = this.props;
    const { width, collapsed } = this.state;

    return (
      <React.Fragment>
        <div className={classes.orgTree}>
          {collapsed
            ? (
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
      </React.Fragment>
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

    const currentOrg = route.orgId.caseOf({
      just: id => course.resourcesById.find(r => r.id === id),
      nothing: () => course.resourcesById.find(r => r.type === 'x-oli-organization'),
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

        {this.renderResizeHandle()}

        {this.renderOverview(currentOrg)}
        {this.renderObjectives(currentOrg)}
        {this.renderAllResources(currentOrg)}
        {this.renderOrgDropdown(currentOrg)}
        {this.renderOrgTree(currentOrg, selectedItem)}

      </div>
    );
  }
}

const StyledNavigationPanel = withStyles<NavigationPanelProps>(styles)(NavigationPanel);
export { StyledNavigationPanel as NavigationPanel };
