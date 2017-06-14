import * as React from 'react';
import * as Immutable from 'immutable';
import { returnType } from '../utils/types';
import { connect } from 'react-redux';
import * as models from '../data/models';
import * as contentTypes from '../data/contentTypes';
import { Resource } from '../data/resource';
import guid from '../utils/guid';
import * as view from '../actions/view';
/**
 *
 */
interface NavigationBarState {
  closed: boolean;
}

/**
 *
 */
export interface NavigationBarOwnProps {
  viewActions: any;
}

/**
 *
 */
function FoldInButton(props) {
  return (
    <a href="#" onClick={props.onClick}>Collapse Menu</a>
  );
}

/**
 *
 */
function FoldOutButton(props) {
  return (
    <a href="#" onClick={props.onClick}>Open</a>
  );
}

// Nick, do whatever you feel you have to here
const navbarStyles =
  {
    openMenu: {
      width: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      alignContent: 'stretch',
      height: 'inherit',
      borderRight: '1px solid grey',
    },
    closedMenu: {
      width: '64px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      alignContent: 'stretch',
      height: 'inherit',
      borderRight: '1px solid grey',
    },
    mainMenu: {
      flex: 'none',
      flexGrow: 1,
      order: 0,
      border: '0px solid #c4c0c0',
      padding: '0px',
      margin: '0 0 0 0',
    },
    verticalMenu: {
      listStyleType: 'none',
    },
    bottomMenu: {
      margin: '0 0 0 14px',
      height: '24px',
    },
    sidebar: {
      paddingLeft: 0,
      paddingRight: 0,
      position: 'fixed',
      top: '58px',
      bottom: 0,
      left: 0,
      zIndex: 1000,
      overflowX: 'hidden',
      overflowY: 'auto',
    },
  };

interface MenuItem {
  label?: string;
  icon?: string;
  staticContent?: boolean;
  onclick?: any;
}

function mapStateToProps(state: any) {

  const {
    course,
  } = state;

  return {
    course,
  };
}


const stateGeneric = returnType(mapStateToProps);
type NavigationBarReduxProps = typeof stateGeneric;
type NavigationBarProps = NavigationBarReduxProps & NavigationBarOwnProps & { dispatch };


/**
 *
 */
class NavigationBar extends React.Component<NavigationBarProps, NavigationBarState> {
  opts = Immutable.OrderedMap<string, MenuItem>(
    {
      package: {
        label: 'Content Package',
        icon: 'C',
        staticContent: false,
        onclick: this.placeholderMenuHandler,
      },
      sequencing: {
        label: 'Sequencing',
        staticContent: true,
        onclick: this.placeholderMenuHandler,
      },
      organizations: {
        label: 'Organizations',
        icon: 'O',
        staticContent: false,
        onclick: this.placeholderMenuHandler,
      },
      content: {
        label: 'Content',
        staticContent: true,
        onclick: this.placeholderMenuHandler,
      },
      workBookPages: {
        label: 'Pages',
        icon: 'O',
        staticContent: false,
        onclick: this.placeholderMenuHandler,
      },
      activities: {
        label: 'Assessments',
        icon: 'A',
        staticContent: false,
        onclick: this.placeholderMenuHandler,
      },
      pools: {
        label: 'Question Pools',
        icon: 'P',
        staticContent: false,
        onclick: this.placeholderMenuHandler,
      },
      others: {
        label: 'Others',
        icon: 'M',
        staticContent: false,
        onclick: this.placeholderMenuHandler,
      },
      learning: {
        label: 'Learning',
        staticContent: true,
        onclick: this.placeholderMenuHandler,
      },
      objectives: {
        label: 'Objectives',
        icon: 'A',
        staticContent: false,
        onclick: this.placeholderMenuHandler,
      },
      skills: {
        label: 'Skills',
        icon: 'A',
        staticContent: false,
        onclick: this.placeholderMenuHandler,
      },
      assets: {
        label: 'Assets',
        staticContent: true,
        onclick: this.placeholderMenuHandler,
      },
      media: {
        label: 'Files/Media',
        icon: 'M',
        staticContent: false,
        onclick: this.placeholderMenuHandler,
      },
      // ,
      // addOns: {
      //   label: "Add-Ons",
      //   icon: "L",
      //   staticContent: false,
      //   onclick: this.placeholderMenuHandler
      // }
    });

  constructor(props) {
    super(props);
    this.state = { closed: false };
  }

  handleFoldIn(event: any) {
    this.setState({ closed: true });
  }

  handleFoldOut(event: any) {
    this.setState({ closed: false });
  }

  /**
   *
   */
  placeholderMenuHandler(props) {
    console.log('placeHolderMenuHanlder ()');
  }

  /**
   *
   */
  generateMenuItem(closed: boolean, item: any) {
    if (item.staticContent === true) {
      return (<h2 key={item.label}>{item.label}</h2>);
    }

    if (closed === true) {
      return (
        <li key={item.label} className="nav-item"><a className="nav-link" onClick={item.onclick}>{item.icon}</a>
        </li>);
    }

    return (
      <li key={item.label} className="nav-item"><a className="nav-link" onClick={item.onclick}>{item.label}</a>
      </li>);
  }

  /**
   * We included this dedicated menu generator to ensure we could insert main menu options
   * dynamically from external data and even from a marktplace (yes we can)
   */
  generateMenu(closed: boolean) {
    return (this.opts.toArray().map(item => this.generateMenuItem(closed, item)));
  }

  /**
   * Main render function
   */
  render() {
    let menuControl = null;
    let mStyle = null;

    const courseId = this.props.course.model.guid;
    
    this.opts.get('package').onclick = 
      () => view.viewDocument(courseId, courseId);
    this.opts.get('organizations').onclick = view.viewOrganizations.bind(undefined, courseId);
    this.opts.get('workBookPages').onclick = view.viewPages.bind(undefined, courseId);
    this.opts.get('activities').onclick = view.viewAssessments.bind(undefined, courseId);
    this.opts.get('objectives').onclick = view.viewObjectives.bind(undefined, courseId);
    this.opts.get('skills').onclick = view.viewSkills.bind(undefined, courseId);
    this.opts.get('pools').onclick = view.viewPools.bind(undefined, courseId);

    if (this.state.closed === true) {
      menuControl = <FoldOutButton onClick={ e => this.handleFoldOut(e) }/>;
      mStyle = navbarStyles.closedMenu as any;
    } else {
      menuControl = <FoldInButton onClick={ e => this.handleFoldIn(e) }/>;
      mStyle = navbarStyles.openMenu as any;
    }

    const menuData = this.generateMenu(this.state.closed);

    const title = this.props.course === null || typeof this.props.course === 'undefined' ? '' : this.props.course.model.title;

    return (
      <nav style={navbarStyles.sidebar} className="col-sm-3 col-md-2 hidden-xs-down sidebar">
        <h1>{title}</h1>
        <br/>
        <ul className="nav nav-pills flex-column">
          {menuData}
        </ul>
      </nav>
    );
  }
}

export default connect<NavigationBarReduxProps, {}, NavigationBarOwnProps>(mapStateToProps)(NavigationBar);
