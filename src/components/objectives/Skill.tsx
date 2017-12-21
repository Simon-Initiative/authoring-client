import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../data/contentTypes';
import { AppContext } from '../../editors/common/AppContext';
import * as models from '../../data/models';
import { Maybe } from 'tsmonad';
import { Title } from './Title';
import { AppServices } from '../../editors/common/AppServices';
import { Remove } from 'components/common/Remove';

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
  title: string;
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

    const { model, title, editMode, mouseOver, isExpanded } = this.props;

    const remove = mouseOver && editMode
      ? <Remove editMode={this.props.editMode}
              onRemove={this.props.onRemove.bind(undefined, this.props.model)}/>
      : null;

    const titleBlock = <span><b>Skill: </b>{title}</span>;

    return (
      <div style={ { marginLeft: '45px' } }>
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

