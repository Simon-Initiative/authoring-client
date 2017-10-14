import * as React from 'react';
import * as Immutable from 'immutable';
import { bindActionCreators } from 'redux';
import * as persistence from '../../data/persistence';
import * as models from '../../data/models';
import * as contentTypes from '../../data/contentTypes';
import { returnType } from '../../utils/types';
import { connect } from 'react-redux';
import { collapseNodes, expandNodes } from '../../actions/expand';

import { LockDetails, renderLocked } from '../../utils/lock';
import NavigationBar from '../NavigationBar';
import { AppServices, DispatchBasedServices } from '../../editors/common/AppServices';
import * as viewActions from '../../actions/view';
import { DuplicateListingInput } from './DuplicateListingInput';
import guid from '../../utils/guid';
import { RowType } from './types';
import { ExistingSkillSelection } from './ExistingSkillSelection';

import { AggregateModel, 
  UnifiedObjectivesModel, UnifiedSkillsModel, buildAggregateModel, 
  unifySkills, unifyObjectives } from './persistence';

import { Row } from './Row';

export interface ObjectiveSkillView {
  viewActions: Object;
  services: AppServices;
}

export interface ObjectiveSkillViewProps {
  userName: string;
  course: any;
  dispatch: any;
  expanded: any;
}

interface ObjectiveSkillViewState {
  aggregateModel: AggregateModel;
  skills: UnifiedSkillsModel;
  objectives: UnifiedObjectivesModel;
}


export class ObjectiveSkillView 
  extends React.Component<ObjectiveSkillViewProps, ObjectiveSkillViewState> {

  constructor(props) {
    super(props);

    this.state = {
      aggregateModel: null,
      skills: null,
      objectives: null,
    };
    
    this.viewActions = bindActionCreators((viewActions as any), this.props.dispatch);
    this.createNew = this.createNew.bind(this);
    this.onObjectiveEdit = this.onObjectiveEdit.bind(this);
    this.onSkillEdit = this.onSkillEdit.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.onAddNewSkill = this.onAddNewSkill.bind(this);
    this.onAddExistingSkill = this.onAddExistingSkill.bind(this);
    this.onToggleExpanded = this.onToggleExpanded.bind(this);

    this.services = new DispatchBasedServices(
          this.props.dispatch, 
          this.props.course.model, null);
  }

  componentDidMount() {
    this.buildModels();
  }

  componentWillUnmount() {
    if (this.state.aggregateModel.isLocked) {
      [...this.state.objectives.documents, ...this.state.skills.documents]
        .forEach(d => persistence.releaseLock(this.props.course.model.guid, d._id));
    }
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

  onObjectiveEdit(obj: contentTypes.LearningObjective) {
    
    const originalDocument = this.state.objectives.mapping.get(obj.id);
    
    const objectives = (originalDocument.model as models.LearningObjectivesModel)
      .objectives.set(obj.guid, obj);
    const model =
      (originalDocument.model as models.LearningObjectivesModel)
      .with({ objectives });

    const updatedDocument = originalDocument.with({ model });

    const unified = Object.assign({}, this.state.objectives);
    
    const index = unified.documents.indexOf(originalDocument);

    unified.documents[index] = updatedDocument;
    unified.objectives = unified.objectives.set(obj.id, obj);
    
    if (originalDocument === unified.newBucket) {
      unified.newBucket = updatedDocument;
    }

    this.setState({ objectives: unified });

    persistence.persistDocument(updatedDocument);
  }

  onSkillEdit(model: contentTypes.Skill) {

    const originalDocument = this.state.skills.mapping.get(model.id);
    
    const skills = (originalDocument.model as models.SkillsModel)
      .skills.set(model.guid, model);
    const updatedModel =
      (originalDocument.model as models.SkillsModel)
      .with({ skills });

    const updatedDocument = originalDocument.with({ model: updatedModel });

    const unified = Object.assign({}, this.state.skills);
    
    const index = unified.documents.indexOf(originalDocument);

    unified.documents[index] = updatedDocument;
    unified.skills = unified.skills.set(model.id, model);
    
    if (originalDocument === unified.newBucket) {
      unified.newBucket = updatedDocument;
    }

    this.setState({ skills: unified });

    persistence.persistDocument(updatedDocument);
  }

  createNewSkill() : string {

    // Create the new skill and persist it
    const id = guid();
    const skill = new contentTypes.Skill().with({
      id,
      guid: id,
      title: 'New skill',
    });

    const model = (this.state.skills.newBucket.model as models.SkillsModel);
    const updatedModel = model.with({ skills: model.skills.set(skill.guid, skill) });
    const updatedDocument = this.state.skills.newBucket.with({ model: updatedModel });

    const unified = Object.assign({}, this.state.skills);
    
    const index = unified.documents.indexOf(this.state.skills.newBucket);

    unified.documents[index] = updatedDocument;
    unified.skills = unified.skills.set(skill.id, skill);
    unified.newBucket = updatedDocument;
    
    this.setState({ skills: unified });

    persistence.persistDocument(updatedDocument);

    return skill.id;
  }


  attachSkills(model: contentTypes.LearningObjective, skillIds: string[]) {
    const skills = Immutable.List<string>(model.skills.toArray().concat(skillIds));
    this.onObjectiveEdit(model.with({ skills }));
  }

  onAddNewSkill(model: contentTypes.LearningObjective) {

    const id = this.createNewSkill();


    // Attach the skill id to the objective and then persist that
    const updated = model.with({ skills: model.skills.push(id) });
    this.onObjectiveEdit(updated);
  }

  onExistingSkillInsert(model: contentTypes.LearningObjective, skillIds: Immutable.Set<string>) {
    this.services.dismissModal();

    const updated = model.with({ skills: model.skills.concat(skillIds).toList() });
    this.onObjectiveEdit(updated);
  }

  onAddExistingSkill(model: contentTypes.LearningObjective) {

    const usedSkills = [];

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

        objective.skills.forEach((skillId) => {

          const skill = skillsById[skillId];
          if (skill !== undefined) {
            usedSkills.push(skill);
          }
        });

      });

    const skills = Immutable.Set<contentTypes.Skill>(usedSkills);

    // Allow the user to choose the skills to attach
    this.services.displayModal(<ExistingSkillSelection
      skills={skills.toList()}
      onInsert={this.onExistingSkillInsert.bind(this, model)}
      onCancel={() => this.services.dismissModal()} />);

    // Attach the skill ids to the objective and then persist that
  }

  onRemove(model: RowType) {
    if (model.contentType === 'LearningObjective') {
      this.removeObjective(model);
    } else {
      this.removeSkill(model);
    } 
  }

  removeSkill(model: contentTypes.Skill) {

    // Update the parent objectives
    const parentObjectives = [];
    this.state.objectives.objectives.toArray().forEach((obj) => {
      if (obj.skills.contains(model.id)) {

        const index = obj.skills.indexOf(model.id);
        const skills = obj.skills.remove(index);
        const updated = obj.with({ skills });
        parentObjectives.push(updated);
      }
    });

    if (parentObjectives.length > 0) {
      parentObjectives.forEach(o => this.onObjectiveEdit(o));
    }

    // Update the skills
    const originalDocument = this.state.skills.mapping.get(model.id);
    
    const skills = (originalDocument.model as models.SkillsModel)
      .skills.delete(model.guid);
    const updatedModel =
      (originalDocument.model as models.SkillsModel)
      .with({ skills });

    const updatedDocument = originalDocument.with({ model: updatedModel });

    const unified = Object.assign({}, this.state.skills);
    
    const index = unified.documents.indexOf(originalDocument);

    unified.documents[index] = updatedDocument;
    unified.skills = unified.skills.delete(model.id);
    
    if (originalDocument === unified.newBucket) {
      unified.newBucket = updatedDocument;
    }

    this.setState({ skills: unified });

    persistence.persistDocument(updatedDocument);
  }

  removeObjective(obj: contentTypes.LearningObjective) {
    const originalDocument = this.state.objectives.mapping.get(obj.id);
    
    const objectives = (originalDocument.model as models.LearningObjectivesModel)
      .objectives.delete(obj.guid);
    const model =
      (originalDocument.model as models.LearningObjectivesModel)
      .with({ objectives });

    const updatedDocument = originalDocument.with({ model });

    const unified = Object.assign({}, this.state.objectives);
    
    const index = unified.documents.indexOf(originalDocument);

    unified.documents[index] = updatedDocument;
    unified.objectives = unified.objectives.delete(obj.id);
    
    if (originalDocument === unified.newBucket) {
      unified.newBucket = updatedDocument;
    }

    this.setState({ objectives: unified });

    persistence.persistDocument(updatedDocument);
  }

  onToggleExpanded(guid) {

    let action = null;
    if (this.props.expanded.has('objectives')) {
      action = this.props.expanded.get('objectives').has(guid)
        ? collapseNodes
        : expandNodes;
    } else {
      action = expandNodes;
    }

    this.props.dispatch(action('objectives', [guid]));
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

    const isExpanded = (guid) => {
      if (this.props.expanded.has('objectives')) {
        const set = this.props.expanded.get('objectives');
        return set.includes(guid);
      } else {
        return true;
      }
    };

    this.state.objectives.objectives
      .toArray()
      .forEach((objective: contentTypes.LearningObjective) => {

        rows.push(<Row 
          key={objective.id}
          onAddExistingSkill={this.onAddExistingSkill}
          onRemove={this.onRemove}
          onAddNewSkill={this.onAddNewSkill}
          highlighted={false}
          model={objective}
          isExpanded={isExpanded(objective.id)} 
          toggleExpanded={this.onToggleExpanded}
          editMode={this.state.aggregateModel.isLocked} 
          onEdit={this.onObjectiveEdit} />);

        if (isExpanded(objective.id)) {
            
          objective.skills.forEach((skillId) => {

            const skill = skillsById[skillId];
            if (skill !== undefined) {

              rows.push(<Row 
                key={objective.id + '-' + skill.id}
                onAddExistingSkill={this.onAddExistingSkill}
                onAddNewSkill={this.onAddNewSkill}
                onRemove={this.onRemove}
                highlighted={false}
                model={skill}
                isExpanded={false} 
                toggleExpanded={this.onToggleExpanded}
                editMode={this.state.aggregateModel.isLocked} 
                onEdit={this.onSkillEdit} />);
            }
          });
        }

        
      });

    return rows;
  }

  createNew(title: string) {
    const id = guid();
    const obj = new contentTypes.LearningObjective().with({
      guid: id,
      id,
      title,
    });
    const objectives = (this.state.objectives.newBucket.model as models.LearningObjectivesModel)
      .objectives.set(obj.id, obj);

    

    const model =
      (this.state.objectives.newBucket.model as models.LearningObjectivesModel)
      .with({ objectives });

    const document = this.state.objectives.newBucket.with({ model });

    const unified = this.state.objectives;
    
    const index = unified.documents.indexOf(unified.newBucket);

    unified.documents[index] = document;
    unified.objectives = unified.objectives.set(obj.id, obj);
    unified.mapping = unified.mapping.set(obj.id, document);
    unified.newBucket = document;

    this.setState({ objectives: unified });

    persistence.persistDocument(document);
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

  renderCreation() {
    return (
      <DuplicateListingInput
        editMode={this.state.aggregateModel === null ? false : this.state.aggregateModel.isLocked}
        buttonLabel="Create new"
        width={600}
        value=""
        placeholder="Enter title for new objective"
        existing={this.state.objectives === null ? Immutable.List<string>() 
          : this.state.objectives.objectives.toList().map(o => o.title).toList()}
        onClick={this.createNew}
      />
    );
  }

  renderTitle() {
    return <h2>Learning Objectives and Skills</h2>;
  }

  renderLockDisplay() {

    if (this.state.aggregateModel !== null) {
      return this.state.aggregateModel.isLocked ? null : 
        renderLocked(this.state.aggregateModel.lockDetails);
    } else {
      return null;
    }
  }

  render() {

    const content = this.state.aggregateModel === null
      ? <p>Loading...</p>
      : this.renderContent();

    const lockDisplay = this.renderLockDisplay();

    return (
      <div className="container-fluid new">
        <div className="row">
          <NavigationBar viewActions={this.viewActions}/>
          <div className="col-sm-9 col-md-10 document">
            <div className="container-fluid editor">
              <div className="row">
                <div className="col-12">
                 
                  {this.renderTitle()}
                  {this.renderCreation()}
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

export default ObjectiveSkillView;
