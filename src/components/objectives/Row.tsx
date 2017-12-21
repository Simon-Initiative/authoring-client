import * as React from 'react';
import * as contentTypes from '../../data/contentTypes';
import { RowType } from './types';
import { Objective } from './Objective';
import { Skill } from './Skill';

export interface Row {
  timer: any;
}

export interface RowProps {
  isExpanded: boolean;        // Is node expanded or not
  onEdit: (model: RowType) => void;
  onAddNewSkill: (model: contentTypes.LearningObjective) => void;
  onAddExistingSkill: (model: contentTypes.LearningObjective) => void;
  onRemove: (model: RowType) => void;
  editMode: boolean;
  toggleExpanded: (id) => void;
  model: RowType;
  title: string;
  highlighted: boolean;
}

export interface RowState {
  mouseOver: boolean;
}

export class Row
  extends React.PureComponent<RowProps, RowState> {

  constructor(props) {
    super(props);

    this.timer = null;

    this.onEnter = this.onEnter.bind(this);
    this.onLeave = this.onLeave.bind(this);
    this.onObjectiveRemove = this.onObjectiveRemove.bind(this);
    this.onSkillRemove = this.onSkillRemove.bind(this);

    this.state = { mouseOver: false };
  }

  onEnter() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => this.setState({ mouseOver: true }), 250);

  }

  onLeave() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.setState({ mouseOver: false });
  }

  onObjectiveRemove(model: contentTypes.LearningObjective) {
    this.props.onRemove(model);
  }

  onSkillRemove(model: contentTypes.Skill) {
    this.props.onRemove(model);
  }

  render() : JSX.Element {

    const { model, title } = this.props;

    const item = this.props.model.contentType === 'LearningObjective'
      ? <Objective {...this.props} mouseOver={this.state.mouseOver}
        onRemove={this.onObjectiveRemove}
        onAddExistingSkill={() => this.props.onAddExistingSkill(
          this.props.model as contentTypes.LearningObjective)}
        onAddNewSkill={() => this.props.onAddNewSkill(
          this.props.model as contentTypes.LearningObjective)}
        model={this.props.model as contentTypes.LearningObjective}
        title={title}/>
      : <Skill {...this.props} mouseOver={this.state.mouseOver}
        onRemove={this.onSkillRemove}
        model={this.props.model as contentTypes.Skill}
        title={title}/>;

    const highlighted = this.props.highlighted ? 'table-info' : '';

    return (
      <tr key={model.guid}
        onMouseEnter={this.onEnter} onMouseLeave={this.onLeave}
        className={highlighted}>

        <td key="content">
          {item}
        </td>
      </tr>
    );
  }

}

