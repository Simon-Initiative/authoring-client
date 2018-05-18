import * as React from 'react';
import * as contentTypes from '../../data/contentTypes';
import { Title } from './Title';
import { Remove } from 'components/common/Remove';

import './objective.scss';

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
  title: string;
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

    const { model, title, editMode, mouseOver, isExpanded } = this.props;

    let titleBlock = null;

    if (this.props.model.skills.size === 0) {
      titleBlock = <div style={ { marginLeft: '10px' } }>
            <span>
              <i className="icon"></i>
            </span>&nbsp;
          <b>Objective:</b> {title}
          </div>;
    } else if (isExpanded) {
      titleBlock = <div>
                <span className="objective">
                <i className="fa fa-caret-down"></i>
                </span>
                <b>Objective:</b> {title}
              </div>;
    } else {
      titleBlock = <div>
                <span className="objective">
                <i className="fa fa-caret-right"></i>
                </span>
                <b>Objective:</b> {title}
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
              className="btn btn-link btn-sm">
              New
            </button>
            /
            <button
              key="existing"
              onClick={this.props.onAddExistingSkill}
              type="button"
              className="btn btn-link btn-sm">
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
          onEdit={this.onTitleEdit}>{titleBlock}</Title>
        {skillButtons}

      </div>
    );
  }

}

