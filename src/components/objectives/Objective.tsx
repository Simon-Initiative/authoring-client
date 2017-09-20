import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../data/contentTypes';
import { AppContext } from '../../editors/common/AppContext';
import * as models from '../../data/models';
import { Maybe } from 'tsmonad';
import { Title } from './Title';
import { AppServices } from '../../editors/common/AppServices';
import guid from '../../utils/guid';
import { Remove } from './Remove';

export interface Objective {
  
}

export interface ObjectiveProps {
  isExpanded: boolean;        // Is node expanded or not
  onEdit: (model: contentTypes.LearningObjective) => void;
  onRemove: (model: contentTypes.LearningObjective) => void;
  onAddNewSkill: () => void;
  onAddExistingSkill: () => void;
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

    let title = null;

    if (this.props.model.skills.size === 0) {
      title = <div style={ { marginLeft: '10px' } }>
            <span>
              <i className="icon"></i>
            </span>&nbsp;
          <b>Objective:</b> {this.props.model.title}
          </div>;
    } else if (isExpanded) {
      title = <div>
                <span >
                <i className="icon icon-caret-down"></i>
                </span>&nbsp;
                <b>Objective:</b> {this.props.model.title}
              </div>;
    } else {
      title = <div>
                <span >
                <i className="icon icon-caret-right"></i>
                </span>&nbsp;
                <b>Objective:</b> {this.props.model.title}
              </div>;
    }

    const label : any = {
      fontFamily: 'sans-serif',
      lineHeight: 1.25,
      fontSize: '12',
      position: 'relative',
      top: '0',
      color: '#606060',
    };

    const skillButtons = this.props.mouseOver && this.props.editMode
          ? <div style={ { display: 'inline', marginLeft: '50px' } }>
              <span style={label}>Add Skill:</span>
              <button 
              key="new"
              onClick={this.props.onAddNewSkill}
              type="button" 
              className="btn btn-sm">
              New
            </button>
            /
            <button 
              key="existing"
              onClick={this.props.onAddExistingSkill}
              type="button" 
              className="btn btn-sm">
              Existing
            </button>
            <Remove editMode={this.props.editMode} 
              onRemove={this.props.onRemove.bind(undefined, this.props.model)}/>
          </div>
          : null;

    return (
      <div>
        <Title title={model.title} 
          editMode={editMode} 
          onToggleExpanded={() => this.props.toggleExpanded(model.id)}
          isHoveredOver={mouseOver} 
          onEdit={this.onTitleEdit}>{title}</Title>
        {skillButtons}
        
      </div>
    );
  }

}

