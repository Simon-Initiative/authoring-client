import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames, JSSStyles } from 'styles/jss';
import { Maybe } from 'tsmonad';
import colors from 'styles/colors';
import * as viewActions from 'actions/view';
import { CourseModel, OrganizationModel } from 'data/models';
import { UserProfile } from 'types/user';
import { RouterState } from 'reducers/router';
import { ROUTE } from 'actions/router';
import { disableSelect } from 'styles/mixins';
import { Document } from 'data/persistence';
import * as nav from 'types/navigation';
import OrgEditorManager from 'editors/manager/OrgEditorManager.controller';


const DEFAULT_WIDTH_PX = 300;

export const styles: JSSStyles = {
  NavigationPanel: {
    extend: [disableSelect],
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.grayLightest,
    borderRight: [1, 'solid', colors.grayLight],
    padding: [10, 0],
  },
  navItem: {
    fontSize: '1.2em',
    fontWeight: 500,
    margin: [2, 5],
    padding: [5, 10],
    borderRadius: 6,
    border: [1, 'solid', 'transparent'],
    cursor: 'pointer',

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
    fontSize: '1.2em',
    fontWeight: 500,
    borderRadius: 6,

    '&:hover': {
      '& $dropdownText': {
        border: [1, 'solid', colors.grayLighter],
      },
      '& $dropdownToggle': {
        border: [1, 'solid', colors.grayLighter],
        borderLeft: 'none',
      },
    },

    '&:focus': {
      outline: 'none',
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
}

export interface NavigationPanelState {
  collapsed: boolean;
  maybeWidth: Maybe<number>;
  showOrgDropdown: boolean;
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
      maybeWidth: Maybe.nothing(),
      showOrgDropdown: false,
    };
  }

  componentDidMount() {
    // register global mouse listeners
    window.addEventListener('click', this.onGlobalClick);
  }

  componentWillUnmount() {
    // unregister global mouse listeners
    window.removeEventListener('click', this.onGlobalClick);
  }

  onGlobalClick = (e) => {
    if (e.originator !== 'OrgDropdownToggle') {
      this.setState({
        showOrgDropdown: false,
      });
    }
  }

  getWidth = () => {
    const { collapsed, maybeWidth } = this.state;
    return collapsed
      ? 80
      : maybeWidth.valueOr(DEFAULT_WIDTH_PX);
  }

  render() {
    const { className, classes, viewActions, course, router, activeOrg } = this.props;
    const { showOrgDropdown } = this.state;

    const orgDocumentId = router.orgId.caseOf({
      just: id => id,
      nothing: () => null,
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

    console.log(selectedItem);

    return course && (
      <div
        className={classNames(['NavigationPanel', classes.NavigationPanel, className])}
        style={{ width: this.getWidth() }}>
        <div
          className={classNames([
            classes.navItem,
            Maybe.sequence({ courseId: router.courseId, resourceId: router.resourceId }).caseOf({
              just: ({ courseId, resourceId }) => courseId === course.guid
                && resourceId === course.guid && classes.selectedNavItem,
              nothing: () => undefined,
            }),
          ])}
          onClick={() => viewActions.viewDocument(course.guid, course.guid)}>
          <i className="fa fa-book" /> Overview
        </div>
        <div className={classNames([
          classes.navItem,
          router.route === ROUTE.OBJECTIVES && classes.selectedNavItem,
        ])}
          onClick={() => viewActions.viewObjectives(course.guid)}>
          <i className="fa fa-graduation-cap" /> Objectives
        </div>
        <div className="dropdown">
          <div className={classNames([classes.navItemDropdown])}>
            <div className={classes.dropdownText}
              onClick={() => viewActions.viewOrganizations(course.guid)}>
              <i className="fa fa-th-list" /> {activeOrg.caseOf({
                just: org => (org.model as OrganizationModel).title,
                nothing: () => Maybe.maybe(course.resources.first()).caseOf({
                  just: org => org.title,
                  nothing: () => 'Select an Organization',
                }),
              })}
            </div>
            <div className={classes.dropdownToggle}
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
                onClick={() => { /** Set Active Org */ }}>
                {org.title} <span style={{ color: colors.gray }}>({org.id})</span>
              </a>
            ))}
          </div>
        </div>
        <div className={classes.orgTree}>
          <OrgEditorManager
            documentId={orgDocumentId}
            selectedItem={selectedItem}
            {...this.props}
          />
        </div>
      </div>
    );
  }
}
