import * as React from "react";
import * as Immutable from "immutable";
import {returnType} from "../utils/types";
import {connect} from "react-redux";
import * as models from "../data/models";
import * as contentTypes from "../data/contentTypes";

/**
 *
 */
interface NavigationBarState {
  closed: boolean
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
      borderRight: '1px solid grey'
    },
    closedMenu: {
      width: '64px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      alignContent: 'stretch',
      height: 'inherit',
      borderRight: '1px solid grey'
    },
    mainMenu: {
      flex: "none",
      flexGrow: 1,
      order: 0,
      border: "0px solid #c4c0c0",
      padding: "0px",
      margin: "0 0 0 0"
    },
    verticalMenu: {
      listStyleType: 'none'
    },
    bottomMenu: {
      margin: "0 0 0 14px",
      height: "24px"
    },
    sidebar: {
      paddingLeft: 0,
      paddingRight: 0,
      'position': 'fixed',
      top: '58px',
      bottom: 0,
      left: 0,
      zIndex: 1000,
      overflowX: 'hidden',
      overflowY: 'auto',
    }
  };

interface MenuItem {
  label?: string,
  icon?: string,
  staticContent?: boolean,
  onclick?: any
}

function mapStateToProps(state: any) {

  const {
    course
  } = state;

  return {
    course
  }
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
        label: "Content Package",
        icon: "C",
        staticContent: false,
        onclick: this.placeholderMenuHandler
      },
      sequencing: {
        label: "Sequencing",
        staticContent: true,
        onclick: this.placeholderMenuHandler
      },
      organizations: {
        label: "Organizations",
        icon: "O",
        staticContent: false,
        onclick: this.placeholderMenuHandler
      },
      content: {
        label: "Content",
        staticContent: true,
        onclick: this.placeholderMenuHandler
      },
      workBookPages: {
        label: "Pages",
        icon: "O",
        staticContent: false,
        onclick: this.placeholderMenuHandler
      },
      activities: {
        label: "Assessments",
        icon: "A",
        staticContent: false,
        onclick: this.placeholderMenuHandler
      },
      pools: {
        label: "Question Pools",
        icon: "P",
        staticContent: false,
        onclick: this.placeholderMenuHandler
      },
      learning: {
        label: "Learning",
        staticContent: true,
        onclick: this.placeholderMenuHandler
      },
      objectives: {
        label: "Objectives",
        icon: "A",
        staticContent: false,
        onclick: this.placeholderMenuHandler
      },
      skills: {
        label: "Skills",
        icon: "A",
        staticContent: false,
        onclick: this.placeholderMenuHandler
      },
      assets: {
        label: "Assets",
        staticContent: true,
        onclick: this.placeholderMenuHandler
      },
      media: {
        label: "Files/Media",
        icon: "M",
        staticContent: false,
        onclick: this.placeholderMenuHandler
      },
      addOns: {
        label: "Add-Ons",
        icon: "L",
        staticContent: false,
        onclick: this.placeholderMenuHandler
      }
    });

  constructor(props) {
    super(props);
    this.state = {closed: false};
  }

  handleFoldIn(event: any) {
    this.setState({closed: true});
  }

  handleFoldOut(event: any) {
    this.setState({closed: false});
  }

  /**
   *
   */
  placeholderMenuHandler(props) {
    console.log("placeHolderMenuHanlder ()");
  }

  /**
   *
   */
  generateMenuItem(closed: boolean, item: any) {
    if (item.staticContent == true) {
      return (<h2 key={item.label}>{item.label}</h2>);
    }

    if (closed == true) {
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

    const viewOrganizations = () =>
      this.props.viewActions.viewResources(
        this.props.course.model.guid,
        'Organizations',
        'x-oli-organization',
        (resource) => resource.type === 'x-oli-organization',
        (title, type) => new models.OrganizationModel({
          type: type,
          title: new contentTypes.Title({text: title})
        })
      );

    const viewActivities = () =>
      this.props.viewActions.viewResources(
        this.props.course.model.guid,
        'Assessments',
        'x-oli-assessment',
        (resource) => resource.type === 'x-oli-inline-assessment' || resource.type === 'x-oli-assessment2',
        (title, type) => new models.AssessmentModel({
          type: type,
          title: new contentTypes.Title({text: title})
        })
      );

    const viewWorkbookPages = () =>
      this.props.viewActions.viewResources(
        this.props.course.model.guid,
        'Workbook Pages',
        'x-oli-workbook_page',
        (resource) => resource.type === 'x-oli-workbook_page',
        (title, type) => new models.WorkbookPageModel({
          type: type,
          head: new contentTypes.Head({title: new contentTypes.Title({text: title})})
        })
      );

    const viewLearningObjectives = () =>
      this.props.viewActions.viewResources(
        this.props.course.model.guid,
        'Learning Objectives',
        'x-oli-learning_objectives',
        (resource) => resource.type === 'x-oli-learning_objectives',
        (title, type) => new models.LearningObjectiveModel({
          type: type,
          title: title
        })
      );

    const viewSkills = () =>
      this.props.viewActions.viewResources(
        this.props.course.model.guid,
        'Skills',
        'x-oli-skills_model',
        (resource) => resource.type === 'x-oli-skills_model',
        (title, type) => new models.SkillModel({
          type: type,
          title: new contentTypes.Title({text: title})
        })
      );

    const viewPools = () =>
      this.props.viewActions.viewResources(
        this.props.course.model.guid,
        'Question Pools',
        'x-oli-assessment2-pool',
        (resource) => resource.type === 'x-oli-assessment2-pool',
        (title, type) => new models.PoolModel({
          type,
          pool: new contentTypes.Pool({ title: new contentTypes.Title({ text: title }) }),
        }),
      );

    
    this.opts.get('package').onclick = () => this.props.viewActions.viewDocument(this.props.course.model.guid);
    this.opts.get('organizations').onclick = viewOrganizations;
    this.opts.get('workBookPages').onclick = viewWorkbookPages;
    this.opts.get('activities').onclick = viewActivities;
    this.opts.get('objectives').onclick = viewLearningObjectives;
    this.opts.get('skills').onclick = viewSkills;
    this.opts.get('pools').onclick = viewPools;
    
    // this.opts.get('objectives').onclick=() => this.props.viewActions.viewDocument(this.props.course.LOId);
    // this.opts.get('skills').onclick=() => this.props.viewActions.viewDocument(this.props.course.skillsId);

    if (this.state.closed == true) {
      menuControl = <FoldOutButton onClick={ e => this.handleFoldOut(e) }/>;
      mStyle = navbarStyles.closedMenu as any;
    }
    else {
      menuControl = <FoldInButton onClick={ e => this.handleFoldIn(e) }/>;
      mStyle = navbarStyles.openMenu as any;
    }

    let menuData = this.generateMenu(this.state.closed);

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
