import * as React from 'react';
import { bindActionCreators } from 'redux';
import * as persistence from '../../data/persistence';
import * as models from '../../data/models';
import * as contentTypes from '../../data/contentTypes';

import NavigationBar from '../NavigationBar';
import { AppServices, DispatchBasedServices } from '../../editors/common/AppServices';
import * as viewActions from '../../actions/view';

import guid from '../../utils/guid';

import { AggregateModel, 
  UnifiedObjectivesModel, UnifiedSkillsModel, buildAggregateModel, 
  unifySkills, unifyObjectives } from './persistence';

import { Row } from './Row';

export interface ObjectiveSkillView {
  viewActions: Object;
}

export interface ObjectiveSkillViewProps {
  dispatch: any;
  userName: string;
  course: any;
}

interface ObjectiveSkillViewState {
  aggregateModel: AggregateModel;
  skills: UnifiedSkillsModel;
  objectives: UnifiedObjectivesModel;
}

export class ObjectiveSkillView 
  extends React.PureComponent<ObjectiveSkillViewProps, ObjectiveSkillViewState> {

  constructor(props) {
    super(props);

    this.state = {
      aggregateModel: null,
      skills: null,
      objectives: null,
    };
    
    this.viewActions = bindActionCreators((viewActions as any), this.props.dispatch);
  }

  componentDidMount() {
    this.buildModels();
  }

  buildModels() {

    const courseId = this.props.course.model.guid;
    const userName = this.props.userName;

    buildAggregateModel(courseId, userName)
      .then((aggregateModel) => {

        this.setState({
          aggregateModel,
          objectives: unifyObjectives(aggregateModel),
          skills: unifySkills(aggregateModel),
        });

      });
  }

  onObjectiveEdit(mode: contentTypes.LearningObjective) {

  }

  onSkillEdit(mode: contentTypes.LearningObjective) {

  }

  onToggleExpanded(id: string) {

  }

  renderObjectives() {
    const rows = [];

    const skillsById = this.state.skills.skills
      .toArray()
      .reduce(
        (map, skill) => {
          map[skill.id] = skill;
          return map;
        }, 
        {});

    this.state.objectives.objectives
      .toArray()
      .forEach((objective: contentTypes.LearningObjective) => {

        rows.push(<Row 
          highlighted={false}
          model={objective}
          isExpanded={true} 
          toggleExpanded={this.onToggleExpanded}
          editMode={this.state.aggregateModel.isLocked} 
          onEdit={this.onObjectiveEdit} />);

        objective.skills.forEach((skillId) => {

          const skill = skillsById[skillId];

          rows.push(<Row 
            highlighted={false}
            model={skill}
            isExpanded={true} 
            toggleExpanded={this.onToggleExpanded}
            editMode={this.state.aggregateModel.isLocked} 
            onEdit={this.onObjectiveEdit} />);
        });
      });

    return rows;
  }

  renderContent() {
    return (
      <table className="table table-sm table-striped">
        <tbody>


          {this.renderObjectives()}

        </tbody>
      </table>
    );
  }

  renderTitle() {
    return <h3>Learning Objectives and Skills</h3>;
  }

  render() {

    const content = this.state.aggregateModel === null
      ? <p>Loading...</p>
      : this.renderContent();

    return (
      <div className="container-fluid new">
        <div className="row">
          <NavigationBar viewActions={this.viewActions}/>
          <div className="col-sm-9 col-md-10 document">
            <div className="container-fluid editor">
              <div className="row">
                <div className="col-12">
                  {this.renderTitle()}
                  {content}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

