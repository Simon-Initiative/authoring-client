import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../data/contentTypes';
import { AppContext } from '../../editors/common/AppContext';
import * as models from '../../data/models';
import { Maybe } from 'tsmonad';
import { RowType } from './types';
import { AppServices } from '../../editors/common/AppServices';
import guid from '../../utils/guid';
import { Objective } from './Objective';
import { Skill } from './Skill';

export interface Row {
  timer: any;
}

export interface RowProps {
  isExpanded: boolean;        // Is node expanded or not
  onEdit: (model: RowType) => void;
  editMode: boolean;
  toggleExpanded: (id) => void;
  model: RowType;
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

  render() : JSX.Element {

    const { model, editMode, isExpanded } = this.props;
    
    const item = this.props.model.contentType === 'LearningObjective'
      ? <Objective {...this.props} mouseOver={this.state.mouseOver} 
        model={this.props.model as contentTypes.LearningObjective}/>
      : <Skill {...this.props} mouseOver={this.state.mouseOver} 
        model={this.props.model as contentTypes.Skill}/>;


   
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

