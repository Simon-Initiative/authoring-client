import * as React from 'react';
import * as contentTypes from '../../data/contentTypes';
import { Title } from './Title';
import { Remove } from 'components/common/Remove';

import './Skill.scss';

export interface Skill {

}

export interface SkillProps {
  isExpanded: boolean;        // Is node expanded or not
  onEdit: (model: contentTypes.Skill) => void;
  onRemove: (model: contentTypes.Skill) => void;
  editMode: boolean;
  toggleExpanded: (id) => void;
  model: contentTypes.Skill;
  title: string;
  highlighted: boolean;
  mouseOver: boolean;
  loading: boolean;
}

export interface SkillState {

}

export class Skill
  extends React.PureComponent<SkillProps, SkillState> {

  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);
  }

  onTitleEdit(title: string) {
    const model = this.props.model.with({ title });
    this.props.onEdit(model);
  }

  render() : JSX.Element {

    const { model, title, editMode, mouseOver } = this.props;

    const remove = mouseOver && editMode
      ? <Remove editMode={this.props.editMode}
              loading={this.props.loading}
              onRemove={this.props.onRemove.bind(undefined, this.props.model)}/>
      : null;

    const titleBlock = <span><b>Skill: </b>{title}</span>;

    return (
      <div className={mouseOver ? 'skill-mouseover-highlight' : ''}
        style={ { marginLeft: '45px' } }>
        <Title title={model.title}
          editMode={editMode}
          onToggleExpanded={() => this.props.toggleExpanded(model.id)}
          isHoveredOver={mouseOver}
          onEdit={this.onTitleEdit}>{titleBlock}</Title>
        {remove}
      </div>
    );
  }

}

