import * as React from 'react';
import * as contentTypes from '../../data/contentTypes';
import { Title } from './Title';
import { extractFullText } from 'data/content/objectives/objective';

import './objective.scss';

export interface Objective {

}

export interface ObjectiveProps {
  isExpanded: boolean;        // Is node expanded or not
  onEdit: (model: contentTypes.LearningObjective) => void;
  onRemove: (model: contentTypes.LearningObjective) => void;
  onAddNewSkill: () => void;
  onAddExistingSkill: () => void;
  onBeginExternalEdit: (model: contentTypes.LearningObjective) => void;
  editMode: boolean;
  toggleExpanded: (id) => void;
  model: contentTypes.LearningObjective;
  title: string;
  highlighted: boolean;
  mouseOver: boolean;
  loading: boolean;
}

export interface ObjectiveState {

}

export class Objective
  extends React.PureComponent<ObjectiveProps, ObjectiveState> {

  onBeginExternalEdit: () => void;

  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onBeginExternalEdit = props.onBeginExternalEdit.bind(this, props.model);
  }

  onTitleEdit(title: string) {
    const model = this.props.model.with({ title });
    this.props.onEdit(model);
  }

  // Rebinding here is necessary because React re-uses this component after
  // an edit - so we need to make sure we are bound to the latest version
  // of the model.
  componentWillReceiveProps(nextProps) {
    this.onBeginExternalEdit = nextProps.onBeginExternalEdit.bind(this, nextProps.model);
  }

  render(): JSX.Element {

    const { model, title, editMode, mouseOver, isExpanded } = this.props;

    let titleBlock = null;

    const requiresExternalEdit = model
      .rawContent.caseOf({ just: c => true, nothing: () => false });

    const displayedTitle = model
      .rawContent.caseOf({ just: c => extractFullText(c), nothing: () => title });


    if (model.skills.size === 0) {
      titleBlock = <div style={{ marginLeft: '10px' }}>
        <span>
          <i className="icon"></i>
        </span>
        <b>Objective:</b> {displayedTitle}
      </div>;
    } else if (isExpanded) {
      titleBlock = <div>
        <span className="objective">
          <i className="fa fa-caret-down"></i>
        </span>
        <b>Objective:</b> {displayedTitle}
      </div>;
    } else {
      titleBlock = <div>
        <span className="objective">
          <i className="fa fa-caret-right"></i>
        </span>
        <b>Objective:</b> {displayedTitle}
      </div>;
    }

    const label: any = {
      fontFamily: 'sans-serif',
      lineHeight: 1.25,
      fontSize: '12',
      position: 'relative',
      top: '0',
      color: '#606060',
    };

    const skillButtons = this.props.mouseOver && this.props.editMode
      ? <div style={{ display: 'inline-block', marginLeft: '50px' }}>
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
      </div>
      : null;



    return (
      <div className={mouseOver ? 'objective-mouseover-highlight' : ''}>
        <Title title={displayedTitle}
          editMode={editMode}
          onToggleExpanded={() => this.props.toggleExpanded(model.id)}
          isHoveredOver={mouseOver}
          onBeginExternallEdit={this.onBeginExternalEdit}
          requiresExternalEdit={requiresExternalEdit}
          onEdit={this.onTitleEdit}
          loading={this.props.loading}
          onRemove={this.props.onRemove.bind(undefined, this.props.model)}
          >{titleBlock}</Title>
        {skillButtons}
      </div>
    );
  }

}

