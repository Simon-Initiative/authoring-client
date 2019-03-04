import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames, JSSStyles } from 'styles/jss';
import { Maybe } from 'tsmonad';
import colors from 'styles/colors';
import * as viewActions from 'actions/view';
import { CourseModel } from 'data/models';
import { UserProfile } from 'types/user';
import { RouterState } from 'reducers/router';
import { ROUTE } from 'actions/router';
import { disableSelect } from 'styles/mixins';
import { Document } from 'data/persistence';
import * as nav from 'types/navigation';
import OrgEditorManager from 'editors/manager/OrgEditorManager.controller';
import { saveToLocalStorage, loadFromLocalStorage } from 'utils/localstorage';
import { Tooltip } from 'utils/tooltip';

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
    padding: [10, 0],
    position: 'relative',
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
          borderLeft: [1, 'solid', colors.white, '!important'],
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
    right: 0,
    width: 5,
    cursor: 'ew-resize',
    zIndex: 1000,
  },
};

export interface NavigationPanelProps {
  className?: string;
  course: CourseModel;
  viewActions: viewActions.ViewActions;
  router: RouterState;
  activeOrg: Maybe<Document>;
  profile: UserProfile;
  userId: string;
  userName: string;
  onCreateOrg: () => void;
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
@injectSheet(styles)
export class NavigationPanel
  extends React.PureComponent<StyledComponentProps<NavigationPanelProps>,
  NavigationPanelState> {

  constructor(props) {
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
    this.setState({
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

  render() {
    const { className, classes, viewActions, course, router, profile, onCreateOrg } = this.props;
    const { showOrgDropdown, collapsed } = this.state;

    // course may not be loaded before first render. wait for it to load before rendering
    if (!course) return null;

    // get org id from router or select the first organization
    const currentOrg = router.orgId.caseOf({
      just: guid => course.resources.find(r => r.guid === guid),
      nothing: () => course.resources.find(r => r.type === 'x-oli-organization'),
    });

    let selectedItem: Maybe<nav.NavigationItem> = Maybe.just(nav.makePackageOverview());
    if (router.route === ROUTE.OBJECTIVES) {
      selectedItem = Maybe.just(nav.makeLearningObjectives());
    } else if (router.route === ROUTE.RESOURCE) {
      selectedItem = router.resourceId.caseOf({
        just: id => Maybe.just(nav.makeOrganizationItem(id)),
        nothing: () => Maybe.nothing<nav.NavigationItem>(),
      });
    }

    return (
      <div
        className={classNames([
          'NavigationPanel',
          classes.NavigationPanel,
          collapsed && classes.collapsed,
          className,
        ])}
        style={{ width: this.getWidth() }}>
        <div className={classes.resizeHandle} onMouseDown={this.onResizeHandleMousedown} />

        <Tooltip disabled={!collapsed} title="Overview" position="right">
          <div
            className={classNames([
              classes.navItem,
              Maybe.sequence({ courseId: router.courseId, resourceId: router.resourceId }).caseOf({
                just: ({ courseId, resourceId }) => courseId === course.guid
                  && resourceId === course.guid && classes.selectedNavItem,
                nothing: () => undefined,
              }),
            ])}
            onClick={() => viewActions.viewDocument(course.guid, course.guid, currentOrg.guid)}>
            <i className="fa fa-book" />{!collapsed && ' Overview'}
          </div>
        </Tooltip>

        <Tooltip disabled={!collapsed} title="Objectives" position="right">
          <div className={classNames([
            classes.navItem,
            router.route === ROUTE.OBJECTIVES && classes.selectedNavItem,
          ])}
            onClick={() => viewActions.viewObjectives(course.guid, currentOrg.guid)}>
            <i className="fa fa-graduation-cap" />{!collapsed && ' Objectives'}
          </div>
        </Tooltip>

        <div className="dropdown">
          <div className={classNames([
            classes.navItemDropdown,
            router.resourceId.caseOf({
              just: id => id === currentOrg.guid && classes.selectedNavItem,
              nothing: () => null,
            }),
          ])}>
            <Tooltip
              disabled={!collapsed}
              title={currentOrg.title}
              position="right"
              distance={32}
              style={{ overflow: 'hidden', flex: 1, display: 'flex' }}>
              <div className={classNames([
                classes.dropdownText,
                collapsed && classes.dropdownTextCollapsed,
              ])}
                onClick={() =>
                  viewActions.viewDocument(currentOrg.guid, course.guid, currentOrg.guid)}>
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
              <i className={'fa fa-sort-desc'} />
            </div>
          </div>
          <div className={classNames(['dropdown-menu', showOrgDropdown && 'show'])}>
            {course.resources.valueSeq().filter(r => r.type === 'x-oli-organization').map(org => (
              <a key={org.guid}
                className={classNames(['dropdown-item'])}
                onClick={() => viewActions.viewDocument(org.guid, course.guid, org.guid)}>
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

        <div className={classes.orgTree}>
        {collapsed
          ? (
            <div
              className={classNames([
                classes.navItem,
              ])}
              onClick={() => {
                this.setState({
                  width: Maybe.just(DEFAULT_WIDTH_PX),
                  collapsed: false,
                });
                this.updatePersistentPrefs(
                  profile.username,
                  DEFAULT_WIDTH_PX,
                  false,
                );
              }}>
              <i className="fa fa-angle-double-right" />
            </div>
          )
          : (
            <OrgEditorManager
              documentId={currentOrg.id}
              selectedItem={selectedItem}
              {...this.props} />
          )
        }
        </div>

        <Tooltip disabled={!collapsed} title="Pages" position="right">
          <div
            className={classNames([
              classes.navItem,
              router.route === ROUTE.PAGES && classes.selectedNavItem,
            ])}
            onClick={() => viewActions.viewPages(course.guid, currentOrg.guid)}>
            <i className="fa fa-files-o" />{!collapsed && ' Pages'}
          </div>
        </Tooltip>

        <Tooltip disabled={!collapsed} title="Formatives" position="right">
          <div
            className={classNames([
              classes.navItem,
              router.route === ROUTE.FORMATIVE && classes.selectedNavItem,
            ])}
            onClick={() => viewActions.viewFormativeAssessments(course.guid, currentOrg.guid)}>
            <i className="fa fa-flask" />{!collapsed && ' Formatives'}
          </div>
        </Tooltip>

        <Tooltip disabled={!collapsed} title="Summatives" position="right">
          <div
            className={classNames([
              classes.navItem,
              router.route === ROUTE.SUMMATIVE && classes.selectedNavItem,
            ])}
            onClick={() => viewActions.viewSummativeAssessments(course.guid, currentOrg.guid)}>
            <i className="fa fa-check" />{!collapsed && ' Summatives'}
          </div>
        </Tooltip>

        <Tooltip disabled={!collapsed} title="Surveys" position="right">
          <div
            className={classNames([
              classes.navItem,
              router.route === ROUTE.FEEDBACK && classes.selectedNavItem,
            ])}
            onClick={() => viewActions.viewFeedbackAssessments(course.guid, currentOrg.guid)}>
            <i className="fa fa-check-square-o" />{!collapsed && ' Surveys'}
          </div>
        </Tooltip>

        <Tooltip disabled={!collapsed} title="Question Pools" position="right">
          <div
            className={classNames([
              classes.navItem,
              router.route === ROUTE.POOLS && classes.selectedNavItem,
            ])}
            onClick={() => viewActions.viewPools(course.guid, currentOrg.guid)}>
            <i className="fa fa-shopping-basket" />{!collapsed && ' Question Pools'}
          </div>
        </Tooltip>
      </div>
    );
  }
}
