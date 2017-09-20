import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../data/contentTypes';
import { AppContext } from '../../editors/common/AppContext';
import * as models from '../../data/models';
import { Maybe } from 'tsmonad';
import { Title } from './Title';
import { AppServices } from '../../editors/common/AppServices';
import { Remove } from './Remove';

import guid from '../../utils/guid';


export interface Skill {
  
}

export interface SkillProps {
  isExpanded: boolean;        // Is node expanded or not
  onEdit: (model: contentTypes.Skill) => void;
  onRemove: (model: contentTypes.Skill) => void;
  editMode: boolean;
  toggleExpanded: (id) => void;
  model: contentTypes.Skill;
  highlighted: boolean;
  mouseOver: boolean;
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

    const { model, editMode, mouseOver, isExpanded } = this.props;

    const remove = mouseOver && editMode
      ? <Remove editMode={this.props.editMode} 
              onRemove={this.props.onRemove.bind(undefined, this.props.model)}/>
      : null;

    const title = <span><b>Skill: </b>{this.props.model.title}</span>;

    return (
      <div style={ { marginLeft: '45px' } }>
        <Title title={model.title} 
          editMode={editMode} 
          onToggleExpanded={() => this.props.toggleExpanded(model.id)}
          isHoveredOver={mouseOver} 
          onEdit={this.onTitleEdit}>{title}</Title>
        {remove}
      </div>
    );
  }

}

