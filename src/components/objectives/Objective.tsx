import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../data/contentTypes';
import { AppContext } from '../../editors/common/AppContext';
import * as models from '../../data/models';
import { Maybe } from 'tsmonad';
import { Title } from './Title';
import { AppServices } from '../../editors/common/AppServices';
import guid from '../../utils/guid';


export interface Objective {
  
}

export interface ObjectiveProps {
  isExpanded: boolean;        // Is node expanded or not
  onEdit: (model: contentTypes.LearningObjective) => void;
  editMode: boolean;
  toggleExpanded: (id) => void;
  model: contentTypes.LearningObjective;
  highlighted: boolean;
  mouseOver: boolean;
}

export interface ObjectiveState {
 
}

export class Objective 
  extends React.PureComponent<ObjectiveProps, ObjectiveState> {
    
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

    const hasHiddenChildren =
      <span>
        <i className="icon icon-caret-right"></i>
      </span>;

    const hasShownChildren =
      <span>
        <i className="icon icon-caret-down"></i>
      </span>;

    const icon = isExpanded ? hasShownChildren : hasHiddenChildren;

    let title = null;

    if (this.props.model.skills.size === 0) {
      title = this.props.model.title;
    } else if (isExpanded) {
      title = hasShownChildren + this.props.model.title;
    } else {
      title = hasShownChildren + this.props.model.title;
    }

    return (
      <div>
        <Title title={model.title} 
          editMode={editMode} 
          onToggleExpanded={() => this.props.toggleExpanded(model.id)}
          isHoveredOver={mouseOver} 
          onEdit={this.onTitleEdit}>{title}</Title>
      </div>
    );
  }

}

